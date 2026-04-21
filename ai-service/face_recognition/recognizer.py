"""Face recognition wrapper around dlib models.

Loads dlib shape predictor and face recognition ResNet models plus a directory
of student reference photos once at startup. Exposes a single thread-safe
method, :py:meth:`FaceRecognizer.recognize_frame`, that accepts raw image
bytes and returns recognized matches.

Threshold convention (dlib):
    face distance < threshold  -> match
    confidence                 = 1 - distance
"""

import json
import logging
import os
import threading
import traceback
from pathlib import Path

import cv2
import dlib
import numpy as np

try:
    import requests  # type: ignore
except ImportError:  # pragma: no cover - requests is in requirements.txt
    requests = None  # type: ignore

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Import-time env var diagnostics
# ---------------------------------------------------------------------------
# Printed once, at module import, so operators can immediately see which env
# vars actually reached this module. If app.py (or another entrypoint) forgot
# to call load_dotenv() before importing us, these will be None/empty.
_NODE_BACKEND_URL_AT_IMPORT = os.environ.get("NODE_BACKEND_URL")
_FACE_MODEL_PATH_AT_IMPORT = os.environ.get("FACE_MODEL_PATH")
_FACE_RECOGNITION_THRESHOLD_AT_IMPORT = os.environ.get("FACE_RECOGNITION_THRESHOLD")

print(
    "[FACE BOOTSTRAP] Module import env snapshot: "
    f"NODE_BACKEND_URL={_NODE_BACKEND_URL_AT_IMPORT!r} "
    f"(empty/None => DB load will be skipped); "
    f"FACE_MODEL_PATH={_FACE_MODEL_PATH_AT_IMPORT!r}; "
    f"FACE_RECOGNITION_THRESHOLD={_FACE_RECOGNITION_THRESHOLD_AT_IMPORT!r}",
    flush=True,
)
if not _NODE_BACKEND_URL_AT_IMPORT:
    print(
        "[FACE BOOTSTRAP] WARNING: NODE_BACKEND_URL is unset at import time. "
        "If you expect DB-backed encodings, ensure load_dotenv() runs BEFORE "
        "importing face_recognition.recognizer.",
        flush=True,
    )


# Default location of the face recognition assets. The repository layout is:
#   ai-service/face_recognition/
#       face_recognition_models/     <- dlib .dat weight files
#       smart_attendance_system/
#           student_photos/          <- reference images named <student>.jpg
_DEFAULT_BASE_PATH = Path(__file__).resolve().parent
_DEFAULT_MODELS_SUBDIR = "face_recognition_models"
_DEFAULT_PHOTOS_SUBDIR = os.path.join("smart_attendance_system", "student_photos")

_SHAPE_PREDICTOR_FILENAME = "shape_predictor_68_face_landmarks.dat"
_FACE_RECOGNITION_FILENAME = "dlib_face_recognition_resnet_model_v1.dat"

_SUPPORTED_PHOTO_EXTENSIONS = (".png", ".jpg", ".jpeg")


class FaceRecognizer:
    """Thread-safe face recognizer built on dlib.

    Heavy resources (dlib models, known-face encodings) are loaded once in
    ``__init__`` and reused for every request. A ``threading.Lock`` serializes
    calls into dlib because the underlying C++ objects are not thread-safe.
    """

    def __init__(self, base_path: str | None = None, threshold: float | None = None) -> None:
        """Load dlib models and build encodings for every student reference photo.

        Args:
            base_path: Root directory that contains ``face_recognition_models/``
                and ``smart_attendance_system/student_photos/``. Falls back to
                the ``FACE_MODEL_PATH`` environment variable, and then to the
                directory this module lives in.
            threshold: Maximum dlib face distance that still counts as a match.
                Falls back to ``FACE_RECOGNITION_THRESHOLD`` (default ``0.6``).

        Raises:
            FileNotFoundError: If either dlib weight file is missing.
        """
        resolved_base = Path(
            base_path
            or os.getenv("FACE_MODEL_PATH")
            or _DEFAULT_BASE_PATH
        ).resolve()

        if threshold is None:
            threshold = float(os.getenv("FACE_RECOGNITION_THRESHOLD", "0.6"))
        self.threshold: float = float(threshold)

        models_dir = resolved_base / _DEFAULT_MODELS_SUBDIR
        photos_dir = resolved_base / _DEFAULT_PHOTOS_SUBDIR

        shape_predictor_path = models_dir / _SHAPE_PREDICTOR_FILENAME
        face_rec_model_path = models_dir / _FACE_RECOGNITION_FILENAME

        if not shape_predictor_path.exists():
            raise FileNotFoundError(f"Shape predictor not found: {shape_predictor_path}")
        if not face_rec_model_path.exists():
            raise FileNotFoundError(f"Face recognition model not found: {face_rec_model_path}")

        # dlib objects — initialized once, reused for every call.
        self._detector = dlib.get_frontal_face_detector()
        self._shape_predictor = dlib.shape_predictor(str(shape_predictor_path))
        self._face_rec_model = dlib.face_recognition_model_v1(str(face_rec_model_path))

        # dlib is not thread-safe; serialize all native calls through this lock.
        self._dlib_lock = threading.Lock()

        self._known_encodings: list[np.ndarray] = []
        self._known_names: list[str] = []
        self._known_user_ids: list[str | None] = []
        self._photos_dir = photos_dir

        # Prefer DB-backed encodings from the Node backend. If the backend is
        # unreachable or returns no encodings, fall back to disk-based photos.
        self._bootstrap_encodings()

    # ------------------------------------------------------------------
    # Encoding source selection
    # ------------------------------------------------------------------

    def _bootstrap_encodings(self) -> None:
        """Try loading encodings from the Node backend, fall back to disk."""
        backend_url_now = os.environ.get("NODE_BACKEND_URL")
        print(
            "[FACE BOOTSTRAP] _bootstrap_encodings starting. Sources to try: "
            f"1) Node backend (NODE_BACKEND_URL={backend_url_now!r}), "
            f"2) disk photos dir={self._photos_dir}",
            flush=True,
        )

        try:
            loaded = self.load_encodings_from_db()
            print(
                f"[FACE BOOTSTRAP] load_encodings_from_db returned {loaded} encoding(s)",
                flush=True,
            )
        except Exception as exc:  # noqa: BLE001 — network/parse errors all fall back
            print(
                f"[FACE BOOTSTRAP] load_encodings_from_db raised {type(exc).__name__}: {exc}",
                flush=True,
            )
            traceback.print_exc()
            logger.warning("DB encoding load failed (%s); falling back to disk", exc)
            loaded = 0

        if loaded > 0:
            print(
                f"[FACE BOOTSTRAP] Using DB-backed encodings ({loaded}). "
                f"Names: {self._known_names}",
                flush=True,
            )
            logger.info("Loaded %d face encodings from Node backend", loaded)
            return

        print(
            f"[FACE BOOTSTRAP] Falling back to disk. Scanning: {self._photos_dir}",
            flush=True,
        )
        logger.info("Loading face encodings from disk photos at %s", self._photos_dir)
        self._load_known_faces(self._photos_dir)
        print(
            "[FACE BOOTSTRAP] Final summary: "
            f"total_encodings={len(self._known_encodings)}; "
            f"names={self._known_names}",
            flush=True,
        )

    def load_encodings_from_db(self) -> int:
        """Fetch face encodings from the Node backend and replace in-memory state.

        Calls ``GET {NODE_BACKEND_URL}/api/faces/encodings`` and expects a
        response shaped like::

            {
              "success": true,
              "data": [
                {
                  "student_id": "...",
                  "name": "...",
                  "encoding_json": "[f1, ..., f128]"   # JSON-encoded string
                },
                ...
              ]
            }

        Returns:
            The number of encodings loaded. ``0`` indicates the caller should
            fall back to the disk loader (empty list, missing env var, etc).

        Raises:
            RuntimeError: If ``requests`` is not installed.
            requests.RequestException: For network/HTTP failures.
            ValueError: If the response payload is malformed.
        """
        if requests is None:
            raise RuntimeError("'requests' package is not installed")

        backend_url = os.environ.get("NODE_BACKEND_URL")
        if not backend_url:
            print(
                "[FACE BOOTSTRAP] NODE_BACKEND_URL is unset/empty; skipping DB load",
                flush=True,
            )
            logger.info("NODE_BACKEND_URL not set; skipping DB encoding load")
            return 0

        url = backend_url.rstrip("/") + "/api/faces/encodings"
        print(f"[FACE BOOTSTRAP] GET {url} (timeout=5s)", flush=True)
        response = requests.get(url, timeout=5)
        print(
            f"[FACE BOOTSTRAP] Backend responded HTTP {response.status_code}",
            flush=True,
        )
        response.raise_for_status()
        body = response.json()

        if not isinstance(body, dict) or not body.get("success"):
            raise ValueError(f"Backend responded with error payload: {body!r}")

        encodings_list = body.get("data") or []
        if not isinstance(encodings_list, list):
            raise ValueError("'data' is not a list")

        new_encodings: list[np.ndarray] = []
        new_names: list[str] = []
        new_user_ids: list[str | None] = []

        for entry in encodings_list:
            if not isinstance(entry, dict):
                continue
            raw_encoding_json = entry.get("encoding_json")
            if not isinstance(raw_encoding_json, str):
                continue
            try:
                raw_encoding = json.loads(raw_encoding_json)
            except (TypeError, ValueError):
                continue
            if not isinstance(raw_encoding, list) or len(raw_encoding) != 128:
                continue
            try:
                arr = np.asarray(raw_encoding, dtype=np.float64)
            except (TypeError, ValueError):
                continue
            if arr.shape != (128,):
                continue
            student_id = entry.get("student_id")
            name = entry.get("name") or str(student_id or "Unknown")
            new_encodings.append(arr)
            new_names.append(str(name))
            new_user_ids.append(student_id)

        print(
            f"[FACE BOOTSTRAP] Backend returned {len(encodings_list)} raw entry/entries; "
            f"{len(new_encodings)} passed validation (128-d float vectors)",
            flush=True,
        )

        # Atomically replace — only swap if we actually got something parseable.
        if not new_encodings:
            return 0

        self._known_encodings = new_encodings
        self._known_names = new_names
        self._known_user_ids = new_user_ids
        return len(new_encodings)

    def reload_encodings(self) -> int:
        """Refresh encodings using the same DB-first, disk-fallback flow.

        Returns:
            The total number of encodings now loaded in memory.
        """
        try:
            loaded = self.load_encodings_from_db()
        except Exception as exc:  # noqa: BLE001
            logger.warning("reload_encodings: DB path failed (%s); using disk", exc)
            loaded = 0

        if loaded > 0:
            logger.info("reload_encodings: loaded %d encodings from backend", loaded)
            return loaded

        # Disk fallback: reset in-memory state and re-scan the photos directory.
        self._known_encodings = []
        self._known_names = []
        self._known_user_ids = []
        self._load_known_faces(self._photos_dir)
        logger.info(
            "reload_encodings: loaded %d encodings from disk", len(self._known_names)
        )
        return len(self._known_names)

    # ------------------------------------------------------------------
    # Startup helpers
    # ------------------------------------------------------------------

    def _load_known_faces(self, photos_dir: Path) -> None:
        """Populate ``self._known_encodings`` and ``self._known_names``.

        Silently skips photos that cannot be loaded or contain no detectable
        face. The service will still start if the directory is empty — every
        incoming face will simply be reported as unknown.
        """
        if not photos_dir.exists():
            print(
                f"[FACE BOOTSTRAP] Disk photos dir did not exist; created empty: {photos_dir}",
                flush=True,
            )
            photos_dir.mkdir(parents=True, exist_ok=True)
            return

        all_entries = sorted(os.listdir(photos_dir))
        supported_entries = [
            name for name in all_entries
            if name.lower().endswith(_SUPPORTED_PHOTO_EXTENSIONS)
        ]
        print(
            f"[FACE BOOTSTRAP] Disk scan of {photos_dir}: "
            f"{len(all_entries)} total entries, "
            f"{len(supported_entries)} with supported extensions {_SUPPORTED_PHOTO_EXTENSIONS}. "
            f"All entries: {all_entries}",
            flush=True,
        )
        if not supported_entries:
            print(
                "[FACE BOOTSTRAP] No supported photo files found on disk. "
                "(Common cause: photos renamed to .bak or moved elsewhere.)",
                flush=True,
            )

        for photo_name in supported_entries:
            photo_path = photos_dir / photo_name
            try:
                image_bgr = cv2.imread(str(photo_path))
            except Exception as exc:  # noqa: BLE001
                print(
                    f"[FACE BOOTSTRAP] cv2.imread raised for {photo_path}: "
                    f"{type(exc).__name__}: {exc}",
                    flush=True,
                )
                continue
            if image_bgr is None:
                print(
                    f"[FACE BOOTSTRAP] cv2.imread returned None for {photo_path} "
                    "(unreadable/corrupt image); skipping",
                    flush=True,
                )
                continue

            # Keep very large images manageable for dlib on CPU.
            height, width = image_bgr.shape[:2]
            if width > 800:
                scale = 800.0 / width
                image_bgr = cv2.resize(image_bgr, (int(width * scale), int(height * scale)))

            image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)

            with self._dlib_lock:
                detected_faces = self._detector(image_rgb)
                if not detected_faces:
                    print(
                        f"[FACE BOOTSTRAP] No face detected in {photo_path}; skipping",
                        flush=True,
                    )
                    continue
                encoding = self._encode_face_locked(image_rgb, detected_faces[0])

            if encoding is None:
                print(
                    f"[FACE BOOTSTRAP] Encoding computation failed for {photo_path}; skipping",
                    flush=True,
                )
                continue

            display_name = Path(photo_name).stem.replace("_", " ").title()
            self._known_encodings.append(encoding)
            self._known_names.append(display_name)
            self._known_user_ids.append(None)
            print(
                f"[FACE BOOTSTRAP] Loaded encoding for '{display_name}' from {photo_name}",
                flush=True,
            )

    def _encode_face_locked(self, image_rgb: np.ndarray, face_rect: "dlib.rectangle") -> np.ndarray | None:
        """Compute a 128-d face descriptor. Caller MUST already hold ``_dlib_lock``."""
        try:
            landmarks = self._shape_predictor(image_rgb, face_rect)
            descriptor = self._face_rec_model.compute_face_descriptor(image_rgb, landmarks)
            return np.array(descriptor)
        except Exception:
            return None

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    @property
    def known_student_count(self) -> int:
        """Number of student reference photos that were successfully encoded."""
        return len(self._known_names)

    def encode_image(self, image_bytes: bytes) -> tuple[list[float] | None, str | None]:
        """Compute a single 128-d face encoding from raw image bytes.

        Intended for the ``/encode`` endpoint, which is used by the backend to
        enroll a student/teacher reference photo. Enforces a strict
        single-face-per-image contract.

        Args:
            image_bytes: Raw bytes of a JPEG/PNG/etc image.

        Returns:
            ``(encoding, error_code)``. On success the encoding is a list of
            128 Python floats (JSON-serialisable) and ``error_code`` is
            ``None``. On failure the encoding is ``None`` and ``error_code`` is
            one of ``"no_face_detected"``, ``"multiple_faces_detected"``,
            ``"invalid_image"``, or ``"encoding_failed"``.

        Raises:
            ValueError: If ``image_bytes`` is empty.
        """
        if not image_bytes:
            raise ValueError("image_bytes is empty")

        buffer = np.frombuffer(image_bytes, dtype=np.uint8)
        image_bgr = cv2.imdecode(buffer, cv2.IMREAD_COLOR)
        if image_bgr is None:
            return None, "invalid_image"

        image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)

        with self._dlib_lock:
            detected_faces = self._detector(image_rgb, 1)
            if len(detected_faces) == 0:
                return None, "no_face_detected"
            if len(detected_faces) > 1:
                return None, "multiple_faces_detected"

            encoding = self._encode_face_locked(image_rgb, detected_faces[0])

        if encoding is None:
            return None, "encoding_failed"

        # numpy -> native Python floats so jsonify works without coercion.
        return [float(x) for x in encoding.tolist()], None

    def recognize_frame(self, image_bytes: bytes) -> tuple[list[dict], int]:
        """Recognize every face in a single image.

        Args:
            image_bytes: Raw bytes of a JPEG/PNG/etc image as sent by the
                backend (e.g. webcam snapshot uploaded via multipart).

        Returns:
            A ``(matches, unknown_count)`` tuple.

            ``matches`` is a list of ``{"name": str, "distance": float,
            "confidence": float}`` dicts, one per *recognized* face (distance
            strictly below ``self.threshold``).

            ``unknown_count`` is the number of faces detected in the frame
            whose best-match distance did not beat the threshold.

        Raises:
            ValueError: If ``image_bytes`` cannot be decoded as an image.
        """
        if not image_bytes:
            raise ValueError("image_bytes is empty")

        buffer = np.frombuffer(image_bytes, dtype=np.uint8)
        image_bgr = cv2.imdecode(buffer, cv2.IMREAD_COLOR)
        if image_bgr is None:
            raise ValueError("Could not decode image bytes")

        image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)

        matches: list[dict] = []
        unknown_count = 0

        with self._dlib_lock:
            detected_faces = self._detector(image_rgb, 1)

            num_faces = len(detected_faces)
            if num_faces > 0:
                print(
                    f"[FACE DEBUG] Frame: {num_faces} face(s) detected; "
                    f"threshold={self.threshold}; "
                    f"known_encodings={len(self._known_encodings)}",
                    flush=True,
                )

            for face_index, face_rect in enumerate(detected_faces):
                encoding = self._encode_face_locked(image_rgb, face_rect)

                if encoding is None or not self._known_encodings:
                    print(
                        f"[FACE DEBUG] Face #{face_index}: "
                        f"{'encoding_failed' if encoding is None else 'no_known_encodings'}"
                        f" -> unknown",
                        flush=True,
                    )
                    unknown_count += 1
                    continue

                distances = np.linalg.norm(
                    np.asarray(self._known_encodings) - encoding, axis=1
                )
                best_index = int(np.argmin(distances))
                best_distance = float(distances[best_index])
                best_name = self._known_names[best_index]
                passed = best_distance < self.threshold

                print(
                    f"[FACE DEBUG] Face #{face_index}: "
                    f"closest='{best_name}' "
                    f"distance={best_distance:.4f} "
                    f"threshold={self.threshold} "
                    f"passed={passed}",
                    flush=True,
                )

                if passed:
                    matches.append({
                        "name": best_name,
                        "distance": best_distance,
                        "confidence": 1.0 - best_distance,
                    })
                else:
                    unknown_count += 1

        return matches, unknown_count
