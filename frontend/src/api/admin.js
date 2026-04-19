const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Fetch school-wide admin statistics (total students, teachers, classes, attendance rate).
 * @param {string} token - JWT auth token.
 * @returns {Promise<object>} Admin stats data.
 */
export async function getAdminStats(token) {
  const res = await fetch(`${BASE_URL}/api/admin/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const body = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(body.error || 'Failed to fetch admin stats');
  }
  return body.data;
}

/**
 * Fetch the list of users, optionally filtered by role.
 * @param {string} token - JWT auth token.
 * @param {string} [role] - Optional role filter ('student' | 'teacher' | 'admin').
 * @returns {Promise<object>} User list data.
 */
export async function getAdminUsers(token, role) {
  const params = role ? `?role=${encodeURIComponent(role)}` : '';
  const res = await fetch(`${BASE_URL}/api/admin/users${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const body = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(body.error || 'Failed to fetch users');
  }
  return body.data;
}

/**
 * Fetch the attendance report data for admin overview.
 * @param {string} token - JWT auth token.
 * @returns {Promise<object>} Attendance report data.
 */
export async function getAttendanceReport(token) {
  const res = await fetch(`${BASE_URL}/api/admin/attendance/report`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const body = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(body.error || 'Failed to fetch attendance report');
  }
  return body.data;
}

/**
 * Download the attendance report as a CSV file.
 * @param {string} token - JWT auth token.
 * @returns {Promise<Blob>} CSV file as a Blob.
 */
export async function getAttendanceCSV(token) {
  const res = await fetch(`${BASE_URL}/api/admin/reports/attendance`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error('Failed to download attendance report');
  }
  return res.blob();
}
