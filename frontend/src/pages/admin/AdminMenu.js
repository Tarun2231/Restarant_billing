import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../../services/api';

const categories = ['Starters', 'Main Course', 'Drinks', 'Desserts'];

const AdminMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Starters',
    price: '',
    imageUrl: '',
    description: '',
    isAvailable: true,
  });

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
    } else {
      fetchMenu();
    }
  }, [user, navigate]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const response = await getMenu();
      // Handle both array response and data property
      const menuData = Array.isArray(response.data) ? response.data : (response.data?.data || response.data || []);
      setMenuItems(menuData);
    } catch (error) {
      console.error('Error fetching menu:', error);
      if (error.response?.status === 401) {
        logout();
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateMenuItem(editingItem._id, formData);
      } else {
        await createMenuItem(formData);
      }
      setShowModal(false);
      setEditingItem(null);
      resetForm();
      fetchMenu();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save menu item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price,
      imageUrl: item.imageUrl,
      description: item.description || '',
      isAvailable: item.isAvailable,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteMenuItem(id);
        fetchMenu();
      } catch (error) {
        alert('Failed to delete menu item');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Starters',
      price: '',
      imageUrl: '',
      description: '',
      isAvailable: true,
    });
  };

  const openAddModal = () => {
    setEditingItem(null);
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-800 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-gray-300 hover:text-white px-3 py-2 rounded hover:bg-gray-700"
            >
              ← Dashboard
            </button>
            <h1 className="text-3xl font-bold">Menu Management</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm"
            >
              Customer View
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
            <button
              onClick={openAddModal}
              className="bg-primary-600 hover:bg-primary-700 px-6 py-2 rounded-lg"
            >
              + Add Item
            </button>
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menuItems.map((item) => (
            <div key={item._id} className="card p-4">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x200?text=Food+Item';
                }}
              />
              <h3 className="text-xl font-bold mb-2">{item.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{item.category}</p>
              <p className="text-2xl font-bold text-primary-600 mb-4">₹{item.price}</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-2">Price (₹)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="3"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isAvailable" className="font-semibold">Available</label>
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  {editingItem ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMenu;

