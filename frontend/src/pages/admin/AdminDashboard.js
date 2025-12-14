import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-800 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">Welcome, {user.username}</span>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg"
            >
              Customer View
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Menu Management */}
          <div
            onClick={() => navigate('/admin/menu')}
            className="card p-8 cursor-pointer hover:scale-105 transition-transform"
          >
            <div className="text-6xl mb-4 text-center">🍽️</div>
            <h2 className="text-3xl font-bold text-center mb-4">Menu Management</h2>
            <p className="text-gray-600 text-center">
              Add, edit, or remove menu items
            </p>
          </div>

          {/* Orders Management */}
          <div
            onClick={() => navigate('/admin/orders')}
            className="card p-8 cursor-pointer hover:scale-105 transition-transform"
          >
            <div className="text-6xl mb-4 text-center">📋</div>
            <h2 className="text-3xl font-bold text-center mb-4">Orders</h2>
            <p className="text-gray-600 text-center">
              View and manage all orders
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/')}
            className="btn-secondary text-lg"
          >
            View Customer Interface
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

