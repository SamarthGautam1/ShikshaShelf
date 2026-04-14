const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Fetch today's timetable for the authenticated student.
 * @param {string} token - JWT auth token.
 * @returns {Promise<object>} Response containing entries and freePeriods arrays.
 */
export async function getTodayTimetable(token) {
  const res = await fetch(`${BASE_URL}/api/timetable/student/today`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const body = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(body.error || 'Failed to fetch timetable');
  }
  return body.data;
}

/**
 * Fetch AI-generated task suggestions for the student's free periods today.
 * @param {string} token - JWT auth token.
 * @returns {Promise<object>} Response containing suggestions array.
 */
export async function getTodaySuggestions(token) {
  const res = await fetch(`${BASE_URL}/api/tasks/suggestions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const body = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(body.error || 'Failed to fetch suggestions');
  }
  return body.data;
}
