import { useState } from 'react';
import PropTypes from 'prop-types';
import logo from '../assets/logo dashboard.png';
import { login } from '../api/auth.js';

/**
 * Login page with real email/password authentication and demo quick-login buttons.
 * @param {{ onLogin: (token: string, user: object) => void }} props
 */
export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Handle real login form submission via the auth API.
   * @param {React.FormEvent} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success && res.data) {
        onLogin(res.data.token, res.data.user);
      } else {
        setError(res.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.log('Login error:', err);
      if (err.message && err.message.includes('Failed to fetch')) {
        setError('Could not connect to the server. Please try again.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Quick-login with a demo role (no real API call).
   * Creates a mock token and user object for local development.
   * @param {string} role
   */
  const handleDemoLogin = (role) => {
    const demoUser = { id: `demo_${role}`, name: `Demo ${role}`, email: `${role}@demo.local`, role };
    onLogin('demo-token', demoUser);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
                <button className="h-20 w-full flex items-center justify-center p-2 transition-opacity duration-200 hover:opacity-80">
                                    <img src={logo} alt="E-Shiksha Logo" className="h-60 w-auto" />
                                </button>
          </div>

        {/* Real login form */}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <h2 className="text-center font-semibold text-gray-700">Sign in to your account</h2>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center space-x-2">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-sm text-gray-500">or use a demo account</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Demo quick-login buttons */}
        <div className="flex flex-col space-y-3">
          <button
            onClick={() => handleDemoLogin('teacher')}
            className="w-full px-4 py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Login as Teacher
          </button>
          <button
            onClick={() => handleDemoLogin('student')}
            className="w-full px-4 py-3 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            Login as Student
          </button>
           <button
            onClick={() => handleDemoLogin('admin')}
            className="w-full px-4 py-3 font-bold text-white bg-gray-700 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Login as Administrator
          </button>
        </div>
      </div>
    </div>
  );
}

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
};
