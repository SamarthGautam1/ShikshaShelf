import React from 'react';
import logo from '../assets/logo dashboard.png'; 


// This is a prop that will be a function passed from App.jsx
export default function Login({ onLogin }) {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
                <button onClick={() => setActiveTab('dashboard')} className="h-20 w-full flex items-center justify-center p-2 transition-opacity duration-200 hover:opacity-80">
                                    <img src={logo} alt="E-Shiksha Logo" className="h-60 w-auto" />
                                </button>
          </div>
        <div className="flex flex-col space-y-4">
          <p className="text-center font-semibold text-gray-700">Select your role to login:</p>
          <button
            onClick={() => onLogin('teacher')}
            className="w-full px-4 py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Login as Teacher
          </button>
          <button
            onClick={() => onLogin('student')}
            className="w-full px-4 py-3 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            Login as Student
          </button>
           <button
            onClick={() => onLogin('admin')}
            className="w-full px-4 py-3 font-bold text-white bg-gray-700 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Login as Administrator
          </button>
        </div>
      </div>
    </div>
  );
}
