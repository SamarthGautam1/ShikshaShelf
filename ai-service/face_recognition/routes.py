"""Flask blueprint for face recognition endpoints."""

import base64
import binascii

from flask import Blueprint, current_app, jsonify, request


face_recognition_bp = Blueprint("face_recognition", __name__)


def _extract_image_bytes() -> tuple[bytes | None, str | None, int]:
    """Pull raw image bytes out of the current Flask request.

    Supports two shapes:
      1. ``multipart/form-data`` with an ``image`` file field.
      2. JSON body ``{"image_base64": "..."}`` (data URL prefix allowed).

    Returns:
        ``(image_bytes, error_message, http_status)``. Exactly one of
        ``image_bytes`` or ``error_message`` is non-``None``.
    """
    uploaded_file = request.files.get("image")
    if uploaded_file is not None:
        data = uploaded_file.read()
        if not data:
            return None, "Uploaded image file is empty", 400
        return data, None, 200

    if request.is_json:
        payload = request.get_json(silent=True) or {}
        encoded = payload.get("image_base64")
        if not encoded or not isinstance(encoded, str):
            return None, "Missing 'image_base64' field in JSON body", 400

        # Strip a data URL prefix like "data:image/jpeg;base64," if present.
        if encoded.startswith("data:") and "," in encoded:
            encoded = encoded.split(",", 1)[1]

        try:
            return base64.b64decode(encoded, validate=True), None, 200
        except (binascii.Error, ValueError):
            return None, "Invalid base64 image data", 400

    return None, "Request must be multipart/form-data with 'image' or JSON with 'image_base64'", 400


@face_recognition_bp.route("/recognize", methods=["POST"])
def recognize():
    """Recognize faces in an uploaded image.

    Accepts either multipart/form-data (field ``image``) or a JSON body with
    ``image_base64``. Delegates to the ``FaceRecognizer`` instance stored on
    the Flask app (``current_app.face_recognizer``).

    Returns:
        JSON ``{"success": True, "data": {"matches": [...], "unknown_count": N}}``
        on success, or ``{"success": False, "error": "..."}`` with status 400
        for malformed input and 500 for internal failures.
    """
    image_bytes, error, status = _extract_image_bytes()
    if error is not None:
        return jsonify({"success": False, "error": error}), status

    recognizer = getattr(current_app, "face_recognizer", None)
    if recognizer is None:
        return jsonify({"success": False, "error": "Face recognizer not initialized"}), 500

    try:
        matches, unknown_count = recognizer.recognize_frame(image_bytes)
    except ValueError as exc:
        return jsonify({"success": False, "error": str(exc)}), 400
    except Exception as exc:  # noqa: BLE001 — surface unexpected errors as 500
        return jsonify({"success": False, "error": f"Face recognition error: {exc}"}), 500

    return jsonify({
        "success": True,
        "data": {
            "matches": matches,
            "unknown_count": unknown_count,
        },
    }), 200
