"""Flask blueprint for task suggestion endpoints."""

from flask import Blueprint, jsonify, request
from marshmallow import ValidationError

from task_suggestions.generator import generate_task_suggestions
from task_suggestions.schemas import TaskSuggestionInputSchema

task_suggestions_bp = Blueprint("task_suggestions", __name__)

input_schema = TaskSuggestionInputSchema()


@task_suggestions_bp.route("/generate", methods=["POST"])
def generate():
    """Generate task suggestions for a student's free periods.

    Expects a JSON body with student_id, free_periods, and career_goal.
    Validates input with marshmallow, then calls the Anthropic API to
    produce tailored learning tasks.

    Returns:
        JSON response with success status and generated suggestions,
        or an error message with appropriate HTTP status code.
    """
    json_data = request.get_json()

    if not json_data:
        return jsonify({"success": False, "error": "Request body must be JSON"}), 400

    try:
        validated = input_schema.load(json_data)
    except ValidationError as err:
        return jsonify({"success": False, "error": err.messages}), 400

    try:
        result = generate_task_suggestions(
            student_id=validated["student_id"],
            free_periods=validated["free_periods"],
            career_goal=validated["career_goal"],
        )
    except ValueError as exc:
        return jsonify({"success": False, "error": str(exc)}), 500
    except Exception as exc:
        return jsonify({"success": False, "error": f"AI service error: {exc}"}), 500

    return jsonify({"success": True, "data": result}), 200
