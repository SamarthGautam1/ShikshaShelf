const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Fetch teacher-level productivity insights (total students, per-class attendance, at-risk students).
 * @param {string} token - JWT auth token.
 * @returns {Promise<object>} Teacher insights data.
 */
export async function getTeacherInsights(token) {
  const res = await fetch(`${BASE_URL}/api/insights/teacher`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const body = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(body.error || 'Failed to fetch teacher insights');
  }
  return body.data;
}

/**
 * Fetch class-level productivity insights for a specific class.
 * @param {string} classId - The class ID to fetch insights for.
 * @param {string} token - JWT auth token.
 * @returns {Promise<object>} Class insights data.
 */
export async function getClassInsights(classId, token) {
  const res = await fetch(`${BASE_URL}/api/insights/class/${classId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const body = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(body.error || 'Failed to fetch class insights');
  }
  return body.data;
}
