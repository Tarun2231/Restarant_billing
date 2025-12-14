import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getMenu, updateMenuItem } from '../../services/api';
import toast from 'react-hot-toast';

const InventoryManagement = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, low, out

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
      console.log('📦 Fetching inventory...');
      const response = await getMenu();
      
      console.log('📦 Raw API response:', response);
      
      // Handle different response formats
      let items = [];
      if (Array.isArray(response.data)) {
        items = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        items = response.data.data;
      } else if (Array.isArray(response)) {
        items = response;
      } else {
        console.warn('⚠️ Unexpected menu response format:', response);
        items = [];
      }
      
      console.log('📦 Parsed items:', items.length, items);
      
      // Use real stock data from database - NO MOCK DATA
      const itemsWithStock = items.map((item) => ({
        ...item,
        stock: item.stock !== undefined ? item.stock : 100, // Use database value or default
        minStock: item.minStock !== undefined ? item.minStock : 10, // Use database value or default
      }));
      
      setMenuItems(itemsWithStock);
      console.log('✅ Inventory loaded:', itemsWithStock.length, 'items');
      
      if (itemsWithStock.length === 0) {
        toast.error('No inventory items found');
      }
    } catch (error) {
      console.error('❌ Error fetching inventory:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error(`Failed to load inventory: ${error.response?.data?.error || error.message}`);
      setMenuItems([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = async (itemId, newStock) => {
    try {
      const updatedItem = await updateMenuItem(itemId, { stock: newStock });
      
      // Update local state
      setMenuItems((items) =>
        items.map((item) => 
          item._id === itemId 
            ? { ...item, stock: newStock, minStock: updatedItem.data?.minStock || item.minStock } 
            : item
        )
      );
      
      toast.success(`Stock updated to ${newStock}`);
      console.log(`✅ Stock updated: Item ${itemId} → ${newStock}`);
      
      // Note: Dashboard will auto-refresh via Socket.io event from backend
    } catch (error) {
      console.error('❌ Error updating stock:', error);
      toast.error(`Failed to update stock: ${error.response?.data?.error || error.message}`);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    if (filter === 'low') return item.stock < item.minStock && item.stock > 0;
    if (filter === 'out') return item.stock === 0;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 dark:bg-gray-950 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ x: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/dashboard')}
              className="text-gray-300 hover:text-white transition-colors flex items-center gap-1"
            >
              <span>←</span> Back
            </motion.button>
            <h1 className="text-2xl font-bold">Inventory Management</h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              logout();
              navigate('/admin/login');
            }}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition-colors shadow-md"
          >
            Logout
          </motion.button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6"
        >
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter('all')}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                filter === 'all'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              All Items
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter('low')}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                filter === 'low'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Low Stock
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter('out')}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                filter === 'out'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Out of Stock
            </motion.button>
          </div>
        </motion.div>

        {/* Inventory List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-500 dark:text-gray-400 text-lg font-semibold">
                {filter === 'all' 
                  ? 'No items found' 
                  : filter === 'low' 
                  ? 'No low stock items' 
                  : 'No out of stock items'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredItems.map((item, index) => {
                const isLowStock = item.stock < item.minStock && item.stock > 0;
                const isOutOfStock = item.stock === 0;

                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`flex items-center justify-between p-5 hover:shadow-md transition-all ${
                      isOutOfStock
                        ? 'bg-red-50 dark:bg-red-900/10'
                        : isLowStock
                        ? 'bg-orange-50 dark:bg-orange-900/10'
                        : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'
                    }`}
                  >
                    {/* Left: Image & Item Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 rounded-lg overflow-hidden shadow-md flex-shrink-0">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/100?text=Food';
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.category}
                        </p>
                      </div>
                    </div>

                    {/* Right: Stock Info & Controls */}
                    <div className="flex items-center gap-6">
                      {/* Stock Display */}
                      <div className="text-right min-w-[80px]">
                        <p
                          className={`text-3xl font-bold mb-1 ${
                            isOutOfStock
                              ? 'text-red-600 dark:text-red-400'
                              : isLowStock
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-green-600 dark:text-green-400'
                          }`}
                        >
                          {item.stock}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          Min: {item.minStock}
                        </p>
                      </div>

                      {/* Stock Controls */}
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          defaultValue={item.stock}
                          onBlur={(e) => {
                            const newStock = parseInt(e.target.value) || 0;
                            if (newStock !== item.stock) {
                              handleStockUpdate(item._id, newStock);
                            }
                          }}
                          className="w-20 px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-center font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleStockUpdate(item._id, item.stock + 10)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:shadow-lg transition-all"
                        >
                          +10
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;

