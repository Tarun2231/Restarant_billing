import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await adminLogin({ username, password });
      if (response.data.success) {
        login(response.data.user, response.data.token);
        navigate('/admin/dashboard');
      }
    } catch (error) {
      // Show user-friendly error messages
      if (error.userMessage) {
        setError(error.userMessage);
      } else if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response) {
        const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
        if (isProduction) {
          setError('Backend API is not available. The backend server needs to be deployed separately. Please check the deployment documentation.');
        } else {
          setError('Cannot connect to backend server. Please ensure the backend is running on http://localhost:5000');
        }
      } else {
        setError(error.response?.data?.error || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">Admin Login</h1>
        <p className="text-center text-gray-600 mb-8">Restaurant Management System</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full btn-primary text-xl"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-primary-600 hover:underline"
          >
            Back to Customer View
          </button>
        </div>
        
        <div className="mt-4 text-sm text-gray-500 text-center">
          <p>Demo Credentials:</p>
          <p>Username: <strong>admin</strong></p>
          <p>Password: <strong>admin123</strong></p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

