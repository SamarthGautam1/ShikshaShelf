const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Log in with email and password.
 * @param {string} email - User email.
 * @param {string} password - User password.
 * @returns {Promise<object>} Response containing auth token and user data.
 */
export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

/**
 * Register a new user account.
 * @param {string} name - User's full name.
 * @param {string} email - User email.
 * @param {string} password - User password.
 * @param {string} role - User role (student|teacher|admin).
 * @returns {Promise<object>} Response containing the created user data.
 */
export async function register(name, email, password, role) {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });
  return res.json();
}
