"""Core logic for generating AI-driven task suggestions using the Groq API."""

import json
import os

from groq import Groq

# System prompt is stable and cacheable — no dynamic interpolation.
SYSTEM_PROMPT = """You are an educational task recommendation engine for E-शिक्षा, a smart education platform.

Given a student's free periods and career goal, generate 2-3 specific, actionable learning tasks per free period.

Each task must include:
- title: A concise task name
- description: A clear explanation of what the student should do
- duration_minutes: Estimated time in minutes (must fit within the free period)
- reason: Why this task helps the student's career goal

Rules:
- Tasks must be realistic and achievable in the given time window
- Tasks should directly relate to the student's career goal
- Vary task types: reading, practice, projects, research, review
- Total duration of tasks for a period must not exceed the period length

Respond ONLY with valid JSON matching this structure:
{
  "suggestions": [
    {
      "start_time": "<period start>",
      "end_time": "<period end>",
      "tasks": [
        {
          "title": "string",
          "description": "string",
          "duration_minutes": integer,
          "reason": "string"
        }
      ]
    }
  ]
}"""


def generate_task_suggestions(student_id, free_periods, career_goal):
    """Generate AI-driven task suggestions for a student's free periods.

    Uses the Groq API to produce 2-3 learning tasks per free period,
    tailored to the student's career goal.

    Args:
        student_id: Unique identifier of the student.
        free_periods: List of dicts with 'start_time' and 'end_time' keys.
        career_goal: The student's stated career aspiration.

    Returns:
        dict: A dictionary with 'student_id' and 'suggestions' keys. Each
        suggestion contains the period times and a list of task objects.

    Raises:
        groq.APIError: If the Groq API call fails.
        ValueError: If the API response cannot be parsed as valid JSON.
    """
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable is not set")

    client = Groq(api_key=api_key)

    periods_text = "\n".join(
        f"- {p['start_time']} to {p['end_time']}" for p in free_periods
    )

    user_message = (
        f"Student ID: {student_id}\n"
        f"Career Goal: {career_goal}\n\n"
        f"Free Periods:\n{periods_text}\n\n"
        "Generate task suggestions for each free period."
    )

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        max_tokens=4096,
        temperature=0.7,
        response_format={"type": "json_object"},
    )

    response_text = response.choices[0].message.content

    if not response_text:
        raise ValueError("Empty response from Groq API")

    try:
        parsed = json.loads(response_text)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Failed to parse API response as JSON: {exc}") from exc

    return {
        "student_id": student_id,
        "suggestions": parsed.get("suggestions", []),
    }
