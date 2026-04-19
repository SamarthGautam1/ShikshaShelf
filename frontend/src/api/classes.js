const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Fetch the list of classes assigned to the authenticated teacher.
 * @param {string} token - JWT auth token.
 * @returns {Promise<Array<{id: string, name: string}>>} Array of class objects.
 */
export async function getTeacherClasses(token) {
  const res = await fetch(`${BASE_URL}/api/classes`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const body = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(body.error || 'Failed to fetch classes');
  }
  return body.data;
}

/**
 * Fetch the list of students across the authenticated teacher's classes.
 * @param {string} token - JWT auth token.
 * @returns {Promise<Array<{id: string, name: string, class_name: string, attendance_percentage: number}>>} Array of student objects.
 */
export async function getTeacherStudents(token) {
  const res = await fetch(`${BASE_URL}/api/classes/teacher/students`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const body = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(body.error || 'Failed to fetch students');
  }
  return body.data;
}
