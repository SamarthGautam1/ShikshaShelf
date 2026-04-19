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
    body: JSON.stringify({ class_id: classId }),
  });
  return res.json();
}

/**
 * Scan (validate) a QR token to mark attendance.
 * @param {string} qrToken - The scanned QR token string.
 * @param {string} classId - The class ID associated with the QR session.
 * @param {string} authToken - JWT auth token.
 * @returns {Promise<object>} Response confirming attendance was recorded.
 */
export async function scanQRToken(qrToken, classId, authToken) {
  const res = await fetch(`${BASE_URL}/api/attendance/qr/scan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ token: qrToken, class_id: classId }),
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

/**
 * Fetch the authenticated student's overall attendance summary.
 * @param {string} token - JWT auth token.
 * @returns {Promise<{total_classes: number, attended: number, percentage: number}>} Summary data.
 */
export async function getMyAttendanceSummary(token) {
  const res = await fetch(`${BASE_URL}/api/attendance/me/summary`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const body = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(body.error || 'Failed to fetch attendance summary');
  }
  return body.data;
}

/**
 * Submit a captured camera frame to the backend for face recognition.
 * The backend forwards the image to the AI service, resolves any matched
 * students, inserts attendance rows, and broadcasts `attendance:marked`
 * events over Socket.io for each newly-marked student.
 * @param {string} imageBase64 - Base64-encoded JPEG frame (no data URL prefix).
 * @param {string} classId - The class ID to mark attendance for.
 * @param {string} token - JWT auth token.
 * @returns {Promise<object>} Response: { success, data: { recognized, unknown_count } }.
 */
export async function recognizeFace(imageBase64, classId, token) {
  const res = await fetch(`${BASE_URL}/api/attendance/face/recognize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ image_base64: imageBase64, class_id: classId }),
  });
  return res.json();
}
