const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Generate a QR token for a class attendance session.
 * @param {string} classId - The class ID to generate a QR token for.
 * @param {string} token - JWT auth token.
 * @returns {Promise<object>} Response containing the QR token data.
 */
export async function generateQRToken(classId, token) {
  const res = await fetch(`${BASE_URL}/api/attendance/qr/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ classId }),
  });
  return res.json();
}

/**
 * Scan (validate) a QR token to mark attendance.
 * @param {string} qrToken - The scanned QR token string.
 * @param {string} authToken - JWT auth token.
 * @returns {Promise<object>} Response confirming attendance was recorded.
 */
export async function scanQRToken(qrToken, authToken) {
  const res = await fetch(`${BASE_URL}/api/attendance/qr/scan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ token: qrToken }),
  });
  return res.json();
}

/**
 * Fetch attendance records for a specific class.
 * @param {string} classId - The class ID to fetch attendance for.
 * @param {string} token - JWT auth token.
 * @returns {Promise<object>} Response containing attendance records.
 */
export async function getClassAttendance(classId, token) {
  const res = await fetch(`${BASE_URL}/api/attendance/class/${classId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}
