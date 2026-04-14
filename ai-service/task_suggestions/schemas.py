"""Marshmallow schemas for task suggestion input/output validation."""

from marshmallow import Schema, fields, validate


class FreePeriodSchema(Schema):
    """Schema for a single free period time slot."""

    start_time = fields.String(
        required=True,
        metadata={"description": "Start time of the free period (e.g. '10:00')"},
    )
    end_time = fields.String(
        required=True,
        metadata={"description": "End time of the free period (e.g. '11:00')"},
    )


class TaskSuggestionInputSchema(Schema):
    """Schema for validating task suggestion generation requests."""

    student_id = fields.String(
        required=True,
        validate=validate.Length(min=1),
        metadata={"description": "Unique identifier of the student"},
    )
    free_periods = fields.List(
        fields.Nested(FreePeriodSchema),
        required=True,
        validate=validate.Length(min=1),
        metadata={"description": "List of free period time slots"},
    )
    career_goal = fields.String(
        required=True,
        validate=validate.Length(min=1),
        metadata={"description": "Student's career goal or aspiration"},
    )


class TaskSchema(Schema):
    """Schema for a single generated task suggestion."""

    title = fields.String(required=True)
    description = fields.String(required=True)
    duration_minutes = fields.Integer(required=True)
    reason = fields.String(required=True)


class PeriodSuggestionsSchema(Schema):
    """Schema for task suggestions for a single free period."""

    start_time = fields.String(required=True)
    end_time = fields.String(required=True)
    tasks = fields.List(fields.Nested(TaskSchema), required=True)


class TaskSuggestionOutputSchema(Schema):
    """Schema for the full task suggestion response payload."""

    student_id = fields.String(required=True)
    suggestions = fields.List(fields.Nested(PeriodSuggestionsSchema), required=True)
