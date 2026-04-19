"""Flask entry point for the E-शिक्षा AI microservice.

Loads environment variables from .env, registers blueprints, and starts the
development server on the port specified by FLASK_PORT (default 5000).
"""

import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify

load_dotenv(Path(__file__).parent / '.env')

app = Flask(__name__)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.route("/api/v1/health", methods=["GET"])
def health():
    """Return a simple health check response.

    Returns:
        JSON with success status and service name.
    """
    return jsonify({"success": True, "data": {"service": "ai-service", "status": "healthy"}}), 200


# ---------------------------------------------------------------------------
# Register blueprints
# ---------------------------------------------------------------------------

from task_suggestions.routes import task_suggestions_bp  # noqa: E402
from face_recognition.recognizer import FaceRecognizer  # noqa: E402
from face_recognition.routes import face_recognition_bp  # noqa: E402

app.register_blueprint(task_suggestions_bp, url_prefix="/api/v1/task-suggestions")

# Instantiate the face recognizer once at startup so dlib models and student
# reference encodings are loaded a single time for the lifetime of the process.
try:
    app.face_recognizer = FaceRecognizer()
    app.register_blueprint(face_recognition_bp, url_prefix="/api/v1/face-recognition")
except FileNotFoundError as exc:
    # Model weights missing — log and continue so the rest of the service still boots.
    app.logger.error("Face recognizer could not start: %s", exc)
    app.face_recognizer = None


# ---------------------------------------------------------------------------
# Error handlers
# ---------------------------------------------------------------------------

@app.errorhandler(404)
def not_found(_error):
    """Handle 404 errors with a consistent JSON response."""
    return jsonify({"success": False, "error": "Resource not found"}), 404


@app.errorhandler(405)
def method_not_allowed(_error):
    """Handle 405 errors with a consistent JSON response."""
    return jsonify({"success": False, "error": "Method not allowed"}), 405


@app.errorhandler(500)
def internal_error(_error):
    """Handle 500 errors with a consistent JSON response."""
    return jsonify({"success": False, "error": "Internal server error"}), 500


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    port = int(os.environ.get("FLASK_PORT", 5000))
    debug = os.environ.get("FLASK_ENV", "production") == "development"
    app.run(host="0.0.0.0", port=port, debug=debug)
