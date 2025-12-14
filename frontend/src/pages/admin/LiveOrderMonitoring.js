import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllOrders, updateOrderStatus } from '../../services/api';
import { connectSocket, joinAdminRoom, disconnectSocket, getSocket } from '../../services/socket';
import toast from 'react-hot-toast';
import {
  FaArrowLeft,
  FaClock,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaBell,
  FaSearch,
  FaFilter,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const LiveOrderMonitoring = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
      return;
    }

    // Connect to Socket.io
    connectSocket();
    joinAdminRoom();

    // Load orders
    fetchOrders();

    // Set up Socket.io listeners
    const socket = getSocket();
    if (socket) {
      socket.on('order-status-updated', (updatedOrder) => {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === updatedOrder._id ? updatedOrder : order
          )
        );
        toast.success(`Order ${updatedOrder.orderNumber} status updated`, {
          icon: '🔄',
        });
      });

      socket.on('new-order', (newOrder) => {
        setOrders((prev) => [newOrder, ...prev]);
        toast.success(`New order: ${newOrder.orderNumber}`, {
          icon: '🆕',
          duration: 5000,
        });
        if (soundEnabled && audioRef.current) {
          audioRef.current.play().catch(() => {});
        }
      });
    }

    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchOrders, 10000);

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off('order-status-updated');
        socket.off('new-order');
      }
    };
  }, [user, navigate, soundEnabled]);

  const fetchOrders = async () => {
    try {
      const response = await getAllOrders();
      const activeOrders = response.data.filter(
        (order) =>
          order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled'
      );
      setOrders(activeOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated');
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Placed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      Preparing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      Ready: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      Delivered: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      Placed: FaClock,
      Preparing: FaSpinner,
      Ready: FaCheckCircle,
      Delivered: FaCheckCircle,
      Cancelled: FaTimesCircle,
    };
    return icons[status] || FaClock;
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      !searchQuery ||
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items?.some((item) =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesStatus =
      filterStatus === 'all' || order.orderStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getTimeElapsed = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diff = Math.floor((now - created) / 1000 / 60); // minutes
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    return `${hours}h ${diff % 60}m ago`;
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hidden audio element for notifications */}
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />

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
              <h1 className="text-3xl font-bold flex items-center space-x-2">
                <span>Live Order Monitoring</span>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Real-time order tracking • {filteredOrders.length} active orders
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                soundEnabled
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              <FaBell />
              <span>{soundEnabled ? 'Sound On' : 'Sound Off'}</span>
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order number or item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="all">All Status</option>
                <option value="Placed">Placed</option>
                <option value="Preparing">Preparing</option>
                <option value="Ready">Ready</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredOrders.map((order) => {
              const StatusIcon = getStatusIcon(order.orderStatus || 'Placed');
              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 ${
                    order.orderStatus === 'Placed'
                      ? 'border-blue-200 dark:border-blue-800'
                      : order.orderStatus === 'Preparing'
                      ? 'border-yellow-200 dark:border-yellow-800'
                      : 'border-purple-200 dark:border-purple-800'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold dark:text-white">
                        {order.orderNumber}
                      </h3>
                      {order.tokenNumber && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Token: <span className="font-bold">{order.tokenNumber}</span>
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {getTimeElapsed(order.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1 ${getStatusColor(
                        order.orderStatus || 'Placed'
                      )}`}
                    >
                      <StatusIcon className="text-xs" />
                      <span>{order.orderStatus || 'Placed'}</span>
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-semibold mb-2 dark:text-white">Items:</p>
                    <div className="space-y-1">
                      {order.items?.slice(0, 3).map((item, index) => (
                        <div
                          key={index}
                          className="text-sm text-gray-600 dark:text-gray-400"
                        >
                          {item.name} × {item.quantity}
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <div className="text-sm text-gray-500 dark:text-gray-500">
                          +{order.items.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        ₹{order.totalAmount}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {order.paymentMethod}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {order.orderStatus === 'Placed' && (
                      <button
                        onClick={() => handleStatusUpdate(order._id, 'Preparing')}
                        className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 text-sm font-semibold"
                      >
                        Start Preparing
                      </button>
                    )}
                    {order.orderStatus === 'Preparing' && (
                      <button
                        onClick={() => handleStatusUpdate(order._id, 'Ready')}
                        className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 text-sm font-semibold"
                      >
                        Mark Ready
                      </button>
                    )}
                    {order.orderStatus === 'Ready' && (
                      <button
                        onClick={() => handleStatusUpdate(order._id, 'Delivered')}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-sm font-semibold"
                      >
                        Mark Delivered
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/admin/orders?orderId=${order._id}`)}
                      className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                    >
                      View
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredOrders.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <p className="text-2xl text-gray-500 dark:text-gray-400">
              No active orders found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveOrderMonitoring;

