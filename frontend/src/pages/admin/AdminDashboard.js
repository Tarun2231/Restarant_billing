import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStats } from '../../services/api';
import { connectSocket, joinAdminRoom, getSocket } from '../../services/socket';
import toast from 'react-hot-toast';
import { 
  FaUtensils, 
  FaClipboardList, 
  FaChartLine, 
  FaBox, 
  FaUsers, 
  FaTable,
  FaDollarSign,
  FaShoppingCart,
  FaExclamationTriangle,
  FaClock,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayRevenue: 0,
    todayOrders: 0,
    pendingOrders: 0,
    lowStockItems: 0,
    totalMenuItems: 0,
    revenueChange: 0,
    ordersChange: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
    } else {
      // Connect to Socket.io for real-time updates
      connectSocket();
      joinAdminRoom();
      
      fetchDashboardData();
      
      // Set up Socket.io listeners for real-time updates
      const socket = getSocket();
      if (socket) {
        socket.on('new-order', () => {
          // Refresh dashboard when new order arrives
          console.log('🆕 New order received - refreshing dashboard');
          fetchDashboardData();
        });
        
        socket.on('order-status-updated', () => {
          // Refresh dashboard when order status changes
          console.log('🔄 Order status updated - refreshing dashboard');
          fetchDashboardData();
        });
        
        socket.on('inventory-updated', (data) => {
          // Refresh dashboard when inventory changes
          console.log('📦 Inventory updated - refreshing dashboard:', data);
          fetchDashboardData();
        });
        
        socket.on('dashboard-update', (data) => {
          // Explicit dashboard update event
          console.log('📊 Dashboard update event received:', data);
          fetchDashboardData();
        });
      }
      
      // Refresh every 30 seconds
      const interval = setInterval(fetchDashboardData, 30000);
      
      return () => {
        clearInterval(interval);
        if (socket) {
          socket.off('new-order');
          socket.off('order-status-updated');
          socket.off('inventory-updated');
          socket.off('dashboard-update');
        }
      };
    }
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // ALL CALCULATIONS DONE ON BACKEND - NO FRONTEND CALCULATIONS
      const response = await getDashboardStats();
      
      if (response.data?.success && response.data?.data) {
        const dashboardData = response.data.data;
        
        // Set stats from backend response - NO CALCULATIONS HERE
        setStats({
          todayRevenue: dashboardData.todayRevenue || 0,
          todayOrders: dashboardData.todayOrders || 0,
          pendingOrders: dashboardData.pendingOrders || 0,
          lowStockItems: dashboardData.lowStockItems || 0,
          totalMenuItems: dashboardData.totalMenuItems || 0,
          revenueChange: dashboardData.revenueChange || 0,
          ordersChange: dashboardData.ordersChange || 0,
        });

        // Recent orders from backend - NO SORTING OR FILTERING HERE
        setRecentOrders(dashboardData.recentOrders || []);
        
        console.log('✅ Dashboard stats loaded from backend:', dashboardData);
      } else {
        console.error('❌ Invalid dashboard stats response:', response);
        toast.error('Failed to load dashboard data');
        // Set defaults on error
        setStats({
          todayRevenue: 0,
          todayOrders: 0,
          pendingOrders: 0,
          lowStockItems: 0,
          totalMenuItems: 0,
          revenueChange: 0,
          ordersChange: 0,
        });
        setRecentOrders([]);
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      // Set defaults on error
      setStats({
        todayRevenue: 0,
        todayOrders: 0,
        pendingOrders: 0,
        lowStockItems: 0,
        totalMenuItems: 0,
        revenueChange: 0,
        ordersChange: 0,
      });
      setRecentOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (!user) {
    return null;
  }

  const statCards = [
    {
      title: "Today's Revenue",
      value: `₹${stats.todayRevenue.toFixed(2)}`,
      icon: FaDollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: stats.revenueChange,
      changeLabel: 'vs yesterday',
    },
    {
      title: "Today's Orders",
      value: stats.todayOrders,
      icon: FaShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: stats.ordersChange,
      changeLabel: 'vs yesterday',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: FaClock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      urgent: stats.pendingOrders > 0,
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockItems,
      icon: FaExclamationTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      urgent: stats.lowStockItems > 0,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 dark:bg-gray-950 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">
              Welcome back, {user.username}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/kitchen')}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Kitchen Display
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Customer View
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Real-time Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <stat.icon className={`text-2xl ${stat.color}`} />
                </div>
                {stat.urgent && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                    Alert
                  </span>
                )}
              </div>
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-1">
                {stat.title}
              </h3>
              <p className="text-3xl font-bold dark:text-white mb-2">{stat.value}</p>
              {stat.change !== undefined && (
                <div className="flex items-center text-sm">
                  {stat.change >= 0 ? (
                    <FaArrowUp className="text-green-500 mr-1" />
                  ) : (
                    <FaArrowDown className="text-red-500 mr-1" />
                  )}
                  <span className={stat.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {Math.abs(stat.change)}%
                  </span>
                  <span className="text-gray-500 ml-1">{stat.changeLabel}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Quick Actions & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
              <h2 className="text-xl font-bold mb-4 dark:text-white">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/admin/menu')}
                  className="bg-purple-600 text-white p-4 rounded-lg cursor-pointer hover:bg-purple-700 transition-colors"
                >
                  <FaUtensils className="text-3xl mb-2" />
                  <h3 className="font-bold text-sm mb-1">Menu</h3>
                  <p className="text-xs opacity-90">Manage items</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/admin/orders')}
                  className="bg-blue-600 text-white p-4 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  <FaClipboardList className="text-3xl mb-2" />
                  <h3 className="font-bold text-sm mb-1">Orders</h3>
                  <p className="text-xs opacity-90">View orders</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/admin/live-orders')}
                  className="bg-red-600 text-white p-4 rounded-lg cursor-pointer hover:bg-red-700 transition-colors relative"
                >
                  <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <FaClock className="text-3xl mb-2" />
                  <h3 className="font-bold text-sm mb-1">Live Monitor</h3>
                  <p className="text-xs opacity-90">Real-time orders</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/admin/analytics')}
                  className="bg-green-600 text-white p-4 rounded-lg cursor-pointer hover:bg-green-700 transition-colors"
                >
                  <FaChartLine className="text-3xl mb-2" />
                  <h3 className="font-bold text-sm mb-1">Analytics</h3>
                  <p className="text-xs opacity-90">Reports</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/admin/inventory')}
                  className="bg-orange-600 text-white p-4 rounded-lg cursor-pointer hover:bg-orange-700 transition-colors"
                >
                  <FaBox className="text-3xl mb-2" />
                  <h3 className="font-bold text-sm mb-1">Inventory</h3>
                  <p className="text-xs opacity-90">Stock levels</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/admin/staff')}
                  className="bg-indigo-600 text-white p-4 rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors"
                >
                  <FaUsers className="text-3xl mb-2" />
                  <h3 className="font-bold text-sm mb-1">Staff</h3>
                  <p className="text-xs opacity-90">Manage team</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/admin/tables')}
                  className="bg-pink-600 text-white p-4 rounded-lg cursor-pointer hover:bg-pink-700 transition-colors"
                >
                  <FaTable className="text-3xl mb-2" />
                  <h3 className="font-bold text-sm mb-1">Tables</h3>
                  <p className="text-xs opacity-90">Table mgmt</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/admin/customers')}
                  className="bg-cyan-600 text-white p-4 rounded-lg cursor-pointer hover:bg-cyan-700 transition-colors"
                >
                  <FaUsers className="text-3xl mb-2" />
                  <h3 className="font-bold text-sm mb-1">Customers</h3>
                  <p className="text-xs opacity-90">View customers</p>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Recent Orders</h2>
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8">
                  <div className="spinner mx-auto"></div>
                </div>
              ) : recentOrders.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No recent orders
                </p>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="border-l-4 border-orange-600 pl-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer transition-colors"
                    onClick={() => navigate(`/admin/orders?orderId=${order._id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm dark:text-white">{order.orderNumber}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-orange-600 dark:text-orange-400 text-sm">
                          ₹{order.totalAmount}
                        </p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            order.paymentStatus === 'Paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => navigate('/admin/orders')}
              className="w-full mt-4 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 font-semibold transition-colors"
            >
              View All Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

