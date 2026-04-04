import { useState } from 'react';
import Login from './pages/Login.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import TeacherDashboard from './pages/TeacherDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

/**
 * Read a JSON value from localStorage, returning null on any failure.
 * @param {string} key
 * @returns {*|null}
 */
function readStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// --- Main App Component (The Router) ---
export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('eshiksha_token'));
  const [user, setUser] = useState(() => readStorage('eshiksha_user'));

  /**
   * Called by Login on successful authentication.
   * Persists token and user to localStorage so the session survives refresh.
   * @param {string} authToken - JWT (or demo) token.
   * @param {object} authUser  - User object with at least a `role` field.
   */
  const handleLogin = (authToken, authUser) => {
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem('eshiksha_token', authToken);
    localStorage.setItem('eshiksha_user', JSON.stringify(authUser));
  };

  /**
   * Clear auth state and localStorage, returning the user to the login screen.
   */
  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('eshiksha_token');
    localStorage.removeItem('eshiksha_user');
  };

  // Route guard: if no token, always show Login
  if (!token || !user) {
    return <Login onLogin={handleLogin} />;
  }

  // Route to the correct dashboard based on user.role
  const role = user.role;
  return (
    <div>
      {role === 'student' && <StudentDashboard token={token} user={user} onLogout={handleLogout} />}
      {role === 'teacher' && <TeacherDashboard token={token} user={user} onLogout={handleLogout} />}
      {role === 'admin' && <AdminDashboard token={token} user={user} onLogout={handleLogout} />}
    </div>
  );
}

