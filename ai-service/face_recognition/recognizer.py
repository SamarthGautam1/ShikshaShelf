"""Face recognition wrapper around dlib models.

Loads dlib shape predictor and face recognition ResNet models plus a directory
of student reference photos once at startup. Exposes a single thread-safe
method, :py:meth:`FaceRecognizer.recognize_frame`, that accepts raw image
bytes and returns recognized matches.

Threshold convention (dlib):
    face distance < threshold  -> match
    confidence                 = 1 - distance
"""

import os
import threading
from pathlib import Path

import cv2
import dlib
import numpy as np


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
        self._photos_dir = photos_dir

        self._load_known_faces(photos_dir)

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
            photos_dir.mkdir(parents=True, exist_ok=True)
            return

        for photo_name in sorted(os.listdir(photos_dir)):
            if not photo_name.lower().endswith(_SUPPORTED_PHOTO_EXTENSIONS):
                continue

            photo_path = photos_dir / photo_name
            image_bgr = cv2.imread(str(photo_path))
            if image_bgr is None:
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
                    continue
                encoding = self._encode_face_locked(image_rgb, detected_faces[0])

            if encoding is None:
                continue

            display_name = Path(photo_name).stem.replace("_", " ").title()
            self._known_encodings.append(encoding)
            self._known_names.append(display_name)

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

            for face_rect in detected_faces:
                encoding = self._encode_face_locked(image_rgb, face_rect)

                if encoding is None or not self._known_encodings:
                    unknown_count += 1
                    continue

                distances = np.linalg.norm(
                    np.asarray(self._known_encodings) - encoding, axis=1
                )
                best_index = int(np.argmin(distances))
                best_distance = float(distances[best_index])

                if best_distance < self.threshold:
                    matches.append({
                        "name": self._known_names[best_index],
                        "distance": best_distance,
                        "confidence": 1.0 - best_distance,
                    })
                else:
                    unknown_count += 1

        return matches, unknown_count
