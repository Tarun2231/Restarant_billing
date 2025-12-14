import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllOrders } from '../../services/api';
import { FaChartLine, FaDollarSign, FaShoppingCart, FaUsers, FaArrowLeft } from 'react-icons/fa';

const AnalyticsDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('today');

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
    } else {
      fetchAnalytics();
    }
  }, [user, navigate, dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await getAllOrders();
      
      // Handle different response formats
      let ordersData = [];
      if (Array.isArray(response.data)) {
        ordersData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        ordersData = response.data.data;
      } else if (Array.isArray(response)) {
        ordersData = response;
      } else {
        console.warn('Unexpected orders response format:', response);
        ordersData = [];
      }
      
      setOrders(ordersData);
      console.log('✅ Analytics data loaded:', ordersData.length, 'orders');
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
      setOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const filterOrdersByDate = (ordersList) => {
    // Ensure ordersList is always an array
    if (!Array.isArray(ordersList)) {
      console.warn('⚠️ ordersList is not an array:', ordersList);
      return [];
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateRange) {
      case 'today':
        return ordersList.filter(
          (order) => order.createdAt && new Date(order.createdAt) >= today
        );
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return ordersList.filter(
          (order) => order.createdAt && new Date(order.createdAt) >= weekAgo
        );
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return ordersList.filter(
          (order) => order.createdAt && new Date(order.createdAt) >= monthAgo
        );
      default:
        return ordersList;
    }
  };

  // Ensure orders is always an array before filtering
  const filteredOrders = filterOrdersByDate(Array.isArray(orders) ? orders : []);
  const paidOrders = Array.isArray(filteredOrders) 
    ? filteredOrders.filter((o) => o.paymentStatus === 'Paid')
    : [];
  
  const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const totalOrders = filteredOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const uniqueCustomers = Array.isArray(filteredOrders)
    ? new Set(filteredOrders.map((o) => o.orderNumber).filter(Boolean)).size
    : 0;

  // Popular items
  const itemCounts = {};
  if (Array.isArray(filteredOrders)) {
    filteredOrders.forEach((order) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          if (item.name) {
            itemCounts[item.name] = (itemCounts[item.name] || 0) + (item.quantity || 1);
          }
        });
      }
    });
  }
  const popularItems = Object.entries(itemCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Hourly sales
  const hourlySales = {};
  if (Array.isArray(filteredOrders)) {
    filteredOrders.forEach((order) => {
      if (order.createdAt) {
        const hour = new Date(order.createdAt).getHours();
        hourlySales[hour] = (hourlySales[hour] || 0) + (order.totalAmount || 0);
      }
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gray-800 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-gray-300 hover:text-white"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
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
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 mt-2">
                  ₹{totalRevenue.toFixed(2)}
                </p>
              </div>
              <FaDollarSign className="text-4xl text-primary-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                  {totalOrders}
                </p>
              </div>
              <FaShoppingCart className="text-4xl text-blue-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Avg Order Value</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  ₹{averageOrderValue.toFixed(2)}
                </p>
              </div>
              <FaChartLine className="text-4xl text-green-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Customers</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                  {uniqueCustomers}
                </p>
              </div>
              <FaUsers className="text-4xl text-purple-600 opacity-50" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Items */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Popular Items</h2>
            <div className="space-y-3">
              {popularItems.length > 0 ? (
                popularItems.map(([item, count], index) => (
                  <div key={item} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        #{index + 1}
                      </span>
                      <span className="dark:text-white">{item}</span>
                    </div>
                    <span className="font-bold text-gray-600 dark:text-gray-400">
                      {count} sold
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No data available</p>
              )}
            </div>
          </div>

          {/* Hourly Sales */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Peak Hours</h2>
            <div className="space-y-2">
              {Object.entries(hourlySales)
                .sort(([a], [b]) => b - a)
                .slice(0, 5)
                .map(([hour, revenue]) => (
                  <div key={hour} className="flex items-center justify-between">
                    <span className="dark:text-white">
                      {hour}:00 - {parseInt(hour) + 1}:00
                    </span>
                    <span className="font-bold text-primary-600 dark:text-primary-400">
                      ₹{revenue.toFixed(2)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

