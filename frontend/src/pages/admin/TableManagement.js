import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaTable, FaPlus, FaEdit, FaTrash, FaArrowLeft, FaUsers, FaCheckCircle, FaClock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const TableManagement = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Mock table data - in production, this would come from API
  const [tables, setTables] = useState([
    { id: 1, number: 1, capacity: 4, status: 'Available', location: 'Window', currentOrder: null },
    { id: 2, number: 2, capacity: 2, status: 'Occupied', location: 'Corner', currentOrder: 'ORD-12345' },
    { id: 3, number: 3, capacity: 6, status: 'Reserved', location: 'Center', currentOrder: null, reservationTime: '19:00' },
    { id: 4, number: 4, capacity: 4, status: 'Available', location: 'Window', currentOrder: null },
    { id: 5, number: 5, capacity: 8, status: 'Occupied', location: 'Private', currentOrder: 'ORD-12346' },
    { id: 6, number: 6, capacity: 2, status: 'Cleaning', location: 'Corner', currentOrder: null },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [formData, setFormData] = useState({
    number: '',
    capacity: 4,
    location: 'Center',
    status: 'Available',
  });

  const locations = ['Window', 'Corner', 'Center', 'Private', 'Outdoor'];
  const statuses = ['Available', 'Occupied', 'Reserved', 'Cleaning', 'Maintenance'];

  const handleAddTable = () => {
    if (!formData.number || !formData.capacity) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const newTable = {
      id: tables.length + 1,
      ...formData,
      number: parseInt(formData.number),
      capacity: parseInt(formData.capacity),
      currentOrder: null,
    };
    
    setTables([...tables, newTable]);
    toast.success('Table added successfully');
    setShowAddModal(false);
    setFormData({ number: '', capacity: 4, location: 'Center', status: 'Available' });
  };

  const handleEditTable = (table) => {
    setEditingTable(table);
    setFormData({
      number: table.number.toString(),
      capacity: table.capacity.toString(),
      location: table.location,
      status: table.status,
    });
    setShowAddModal(true);
  };

  const handleUpdateTable = () => {
    if (!formData.number || !formData.capacity) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setTables(tables.map((t) => 
      t.id === editingTable.id 
        ? { ...t, ...formData, number: parseInt(formData.number), capacity: parseInt(formData.capacity) }
        : t
    ));
    toast.success('Table updated successfully');
    setShowAddModal(false);
    setEditingTable(null);
    setFormData({ number: '', capacity: 4, location: 'Center', status: 'Available' });
  };

  const handleDeleteTable = (id) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      setTables(tables.filter((t) => t.id !== id));
      toast.success('Table deleted');
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setTables(tables.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
    toast.success('Table status updated');
  };

  const getStatusColor = (status) => {
    const colors = {
      Available: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      Occupied: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      Reserved: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      Cleaning: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      Maintenance: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    if (status === 'Available') return <FaCheckCircle className="text-green-600" />;
    if (status === 'Occupied') return <FaUsers className="text-red-600" />;
    return <FaClock className="text-yellow-600" />;
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
              <h1 className="text-3xl font-bold">Table Management</h1>
              <p className="text-gray-400 text-sm mt-1">{tables.length} tables</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                setEditingTable(null);
                setFormData({ number: '', capacity: 4, location: 'Center', status: 'Available' });
                setShowAddModal(true);
              }}
              className="bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <FaPlus />
              <span>Add Table</span>
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
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Tables</p>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 mt-2">
                  {tables.length}
                </p>
              </div>
              <FaTable className="text-4xl text-primary-600 opacity-50" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Available</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {tables.filter((t) => t.status === 'Available').length}
                </p>
              </div>
              <FaCheckCircle className="text-4xl text-green-600 opacity-50" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Occupied</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                  {tables.filter((t) => t.status === 'Occupied').length}
                </p>
              </div>
              <FaUsers className="text-4xl text-red-600 opacity-50" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Reserved</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                  {tables.filter((t) => t.status === 'Reserved').length}
                </p>
              </div>
              <FaClock className="text-4xl text-yellow-600 opacity-50" />
            </div>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((table) => (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 ${
                table.status === 'Available'
                  ? 'border-green-200 dark:border-green-800'
                  : table.status === 'Occupied'
                  ? 'border-red-200 dark:border-red-800'
                  : 'border-yellow-200 dark:border-yellow-800'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold dark:text-white">Table {table.number}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{table.location}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1 ${getStatusColor(table.status)}`}>
                    {getStatusIcon(table.status)}
                    <span>{table.status}</span>
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <FaUsers />
                  <span>Capacity: {table.capacity} guests</span>
                </div>
                {table.currentOrder && (
                  <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-400">
                    <FaCheckCircle />
                    <span>Order: {table.currentOrder}</span>
                  </div>
                )}
                {table.reservationTime && (
                  <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400">
                    <FaClock />
                    <span>Reserved for: {table.reservationTime}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <select
                  value={table.status}
                  onChange={(e) => handleStatusChange(table.id, e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleEditTable(table)}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 p-2"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteTable(table.id)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 p-2"
                >
                  <FaTrash />
                </button>
              </div>
            </motion.div>
          ))}
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
              {editingTable ? 'Edit Table' : 'Add Table'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-2 dark:text-white">Table Number *</label>
                <input
                  type="number"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  placeholder="Enter table number"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2 dark:text-white">Capacity *</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  placeholder="Enter capacity"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2 dark:text-white">Location</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
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
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={editingTable ? handleUpdateTable : handleAddTable}
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
                >
                  {editingTable ? 'Update' : 'Add'} Table
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingTable(null);
                    setFormData({ number: '', capacity: 4, location: 'Center', status: 'Available' });
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

export default TableManagement;

