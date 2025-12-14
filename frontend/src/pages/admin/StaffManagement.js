import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUsers, FaUserPlus, FaEdit, FaTrash, FaArrowLeft, FaShieldAlt, FaUser } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const StaffManagement = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Mock staff data - in production, this would come from API
  const [staff, setStaff] = useState([
    { id: 1, name: 'John Doe', email: 'john@restaurant.com', role: 'Manager', status: 'Active', phone: '+91 9876543210' },
    { id: 2, name: 'Jane Smith', email: 'jane@restaurant.com', role: 'Chef', status: 'Active', phone: '+91 9876543211' },
    { id: 3, name: 'Mike Johnson', email: 'mike@restaurant.com', role: 'Waiter', status: 'Active', phone: '+91 9876543212' },
    { id: 4, name: 'Sarah Williams', email: 'sarah@restaurant.com', role: 'Cashier', status: 'Inactive', phone: '+91 9876543213' },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Waiter',
    phone: '',
    status: 'Active',
  });

  const roles = ['Manager', 'Chef', 'Waiter', 'Cashier', 'Kitchen Staff'];

  const handleAddStaff = () => {
    if (!formData.name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const newStaff = {
      id: staff.length + 1,
      ...formData,
    };
    
    setStaff([...staff, newStaff]);
    toast.success('Staff member added successfully');
    setShowAddModal(false);
    setFormData({ name: '', email: '', role: 'Waiter', phone: '', status: 'Active' });
  };

  const handleEditStaff = (staffMember) => {
    setEditingStaff(staffMember);
    setFormData({
      name: staffMember.name,
      email: staffMember.email,
      role: staffMember.role,
      phone: staffMember.phone,
      status: staffMember.status,
    });
    setShowAddModal(true);
  };

  const handleUpdateStaff = () => {
    if (!formData.name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setStaff(staff.map((s) => (s.id === editingStaff.id ? { ...s, ...formData } : s)));
    toast.success('Staff member updated successfully');
    setShowAddModal(false);
    setEditingStaff(null);
    setFormData({ name: '', email: '', role: 'Waiter', phone: '', status: 'Active' });
  };

  const handleDeleteStaff = (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      setStaff(staff.filter((s) => s.id !== id));
      toast.success('Staff member deleted');
    }
  };

  const handleToggleStatus = (id) => {
    setStaff(staff.map((s) => (s.id === id ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' } : s)));
    toast.success('Status updated');
  };

  const getRoleColor = (role) => {
    const colors = {
      Manager: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      Chef: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      Waiter: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      Cashier: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'Kitchen Staff': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 dark:bg-gray-900 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-gray-300 hover:text-white px-3 py-2 rounded hover:bg-gray-700"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Staff Management</h1>
              <p className="text-gray-400 text-sm mt-1">{staff.length} staff members</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                setEditingStaff(null);
                setFormData({ name: '', email: '', role: 'Waiter', phone: '', status: 'Active' });
                setShowAddModal(true);
              }}
              className="bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <FaUserPlus />
              <span>Add Staff</span>
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/admin/login');
              }}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Staff</p>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 mt-2">
                  {staff.length}
                </p>
              </div>
              <FaUsers className="text-4xl text-primary-600 opacity-50" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Active</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {staff.filter((s) => s.status === 'Active').length}
                </p>
              </div>
              <FaShieldAlt className="text-4xl text-green-600 opacity-50" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Managers</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                  {staff.filter((s) => s.role === 'Manager').length}
                </p>
              </div>
              <FaUser className="text-4xl text-purple-600 opacity-50" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Kitchen Staff</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                  {staff.filter((s) => s.role === 'Chef' || s.role === 'Kitchen Staff').length}
                </p>
              </div>
              <FaUsers className="text-4xl text-orange-600 opacity-50" />
            </div>
          </div>
        </div>

        {/* Staff List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 dark:text-white">Staff Members</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold dark:text-white">Name</th>
                  <th className="text-left py-3 px-4 font-semibold dark:text-white">Email</th>
                  <th className="text-left py-3 px-4 font-semibold dark:text-white">Phone</th>
                  <th className="text-left py-3 px-4 font-semibold dark:text-white">Role</th>
                  <th className="text-left py-3 px-4 font-semibold dark:text-white">Status</th>
                  <th className="text-right py-3 px-4 font-semibold dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                          {member.name.charAt(0)}
                        </div>
                        <span className="font-medium dark:text-white">{member.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">{member.email}</td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">{member.phone}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRoleColor(member.role)}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleStatus(member.id)}
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          member.status === 'Active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {member.status}
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditStaff(member)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 p-2"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(member.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 p-2"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6"
          >
            <h2 className="text-2xl font-bold mb-6 dark:text-white">
              {editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-2 dark:text-white">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2 dark:text-white">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2 dark:text-white">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  placeholder="Enter phone"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2 dark:text-white">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-2 dark:text-white">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={editingStaff ? handleUpdateStaff : handleAddStaff}
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
                >
                  {editingStaff ? 'Update' : 'Add'} Staff
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingStaff(null);
                    setFormData({ name: '', email: '', role: 'Waiter', phone: '', status: 'Active' });
                  }}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;

