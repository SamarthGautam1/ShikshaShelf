import React, { useState } from 'react';
import Login from './pages/Login.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import TeacherDashboard from './pages/TeacherDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx'; // Import the new dashboard

// --- Main App Component (The Router) ---
export default function App() {
  const [user, setUser] = useState(null); // can be 'student', 'teacher', 'admin', or null

  const handleLogin = (userType) => {
    setUser(userType);
  };
  
  const handleLogout = () => {
    setUser(null); // Resetting the user state is what logs them out
  };

  // If the user is not logged in, show the Login page
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // If the user is logged in, pass the logout function to the correct dashboard
  return (
    <div>
      {user === 'student' && <StudentDashboard onLogout={handleLogout} />}
      {user === 'teacher' && <TeacherDashboard onLogout={handleLogout} />}
      {user === 'admin' && <AdminDashboard onLogout={handleLogout} />}
    </div>
  );
}

