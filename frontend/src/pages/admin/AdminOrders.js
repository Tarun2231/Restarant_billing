import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllOrders, updateOrderStatus as updateOrderStatusAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  FaSearch,
  FaFilter,
  FaDownload,
  FaEye,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaArrowLeft,
  FaPrint,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const AdminOrders = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // list, timeline

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
    } else {
      fetchOrders();
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchOrders, 30000);
      return () => clearInterval(interval);
    }
  }, [user, navigate]);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (orderId && orders.length > 0) {
      const order = orders.find((o) => o._id === orderId);
      if (order) {
        setSelectedOrder(order);
      }
    }
  }, [searchParams, orders]);

  const fetchOrders = async () => {
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
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]); // Set empty array on error
      if (error.response?.status === 401) {
        logout();
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatusAPI(orderId, newStatus);
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, orderStatus: newStatus } : order
        )
      );
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const exportToCSV = () => {
    const headers = ['Order Number', 'Date', 'Items', 'Total', 'Payment Status', 'Order Status'];
    const rows = filteredAndSortedOrders.map((order) => [
      order.orderNumber,
      formatDate(order.createdAt),
      order.items.map((i) => `${i.name} (${i.quantity})`).join('; '),
      order.totalAmount,
      order.paymentStatus,
      order.orderStatus || 'Placed',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Orders exported to CSV');
  };

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    // Ensure orders is always an array
    if (!Array.isArray(orders)) {
      console.warn('Orders is not an array:', orders);
      return [];
    }
    
    let filtered = [...orders]; // Create a copy to avoid mutating original

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.orderNumber?.toLowerCase().includes(query) ||
          order.items?.some((item) => item.name?.toLowerCase().includes(query))
      );
    }

    // Date filter
    if (filterDate) {
      const filterDateObj = new Date(filterDate);
      filterDateObj.setHours(0, 0, 0, 0);
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === filterDateObj.getTime();
      });
    }

    // Status filter
    if (filterStatus) {
      filtered = filtered.filter((order) => order.orderStatus === filterStatus);
    }

    // Payment filter
    if (filterPayment) {
      filtered = filtered.filter((order) => order.paymentStatus === filterPayment);
    }

    // Sort - ensure filtered is an array before sorting
    if (!Array.isArray(filtered)) {
      console.warn('Filtered is not an array, returning empty array');
      return [];
    }
    
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'oldest':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case 'amount-high':
          return (b.totalAmount || 0) - (a.totalAmount || 0);
        case 'amount-low':
          return (a.totalAmount || 0) - (b.totalAmount || 0);
        default:
          return 0;
      }
    });

    return sorted;
  }, [orders, searchQuery, filterDate, filterStatus, filterPayment, sortBy]);

  const getTotalRevenue = () => {
    return filteredAndSortedOrders
      .filter((order) => order.paymentStatus === 'Paid')
      .reduce((sum, order) => sum + order.totalAmount, 0);
  };

  const getStatusColor = (status) => {
    const colors = {
      Placed: 'bg-blue-100 text-blue-800',
      Preparing: 'bg-yellow-100 text-yellow-800',
      Ready: 'bg-purple-100 text-purple-800',
      Delivered: 'bg-green-100 text-green-800',
      Cancelled: 'bg-red-100 text-red-800',
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

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 dark:bg-gray-900 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-gray-300 hover:text-white"
            >
              <FaArrowLeft className="text-lg" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Orders Management</h1>
              <p className="text-gray-400 text-xs mt-1">
                {filteredAndSortedOrders.length} order{filteredAndSortedOrders.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors"
            >
              <FaDownload />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Customer View
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/admin/login');
              }}
              className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg font-semibold transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Orders</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {filteredAndSortedOrders.length}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                ₹{getTotalRevenue().toFixed(2)}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                {filteredAndSortedOrders.filter((o) => o.orderStatus === 'Placed' || o.orderStatus === 'Preparing').length}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Ready</p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {filteredAndSortedOrders.filter((o) => o.orderStatus === 'Ready').length}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <label className="block font-semibold mb-2 dark:text-white">Search</label>
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
              <label className="block font-semibold mb-2 dark:text-white">Date</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block font-semibold mb-2 dark:text-white">Order Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="">All</option>
                <option value="Placed">Placed</option>
                <option value="Preparing">Preparing</option>
                <option value="Ready">Ready</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-2 dark:text-white">Payment</label>
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="">All</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Sort */}
          <div className="mt-4 flex items-center space-x-4">
            <label className="font-semibold dark:text-white">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount-high">Amount: High to Low</option>
              <option value="amount-low">Amount: Low to High</option>
            </select>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterDate('');
                setFilterStatus('');
                setFilterPayment('');
              }}
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredAndSortedOrders.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
              <p className="text-2xl text-gray-500 dark:text-gray-400">No orders found</p>
            </div>
          ) : (
            filteredAndSortedOrders.map((order) => {
              const StatusIcon = getStatusIcon(order.orderStatus || 'Placed');
              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-2xl font-bold dark:text-white">{order.orderNumber}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1 ${getStatusColor(order.orderStatus || 'Placed')}`}>
                          <StatusIcon className="text-xs" />
                          <span>{order.orderStatus || 'Placed'}</span>
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">{formatDate(order.createdAt)}</p>
                      {order.tokenNumber && (
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                          Token: <span className="font-bold">{order.tokenNumber}</span>
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`px-4 py-2 rounded-lg font-bold mb-2 ${
                        order.paymentStatus === 'Paid'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : order.paymentStatus === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {order.paymentStatus}
                      </div>
                      <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        ₹{order.totalAmount}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                    <h4 className="font-semibold mb-2 dark:text-white">Items:</h4>
                    <div className="space-y-2">
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex justify-between text-gray-700 dark:text-gray-300">
                          <span>
                            {item.name} {item.customization?.size && `(${item.customization.size})`} × {item.quantity}
                          </span>
                          <span>₹{(item.price || 0) * (item.quantity || 1)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Payment: {order.paymentMethod} | 
                      {order.receiptPrinted ? ' ✓ Receipt Printed' : ' Receipt Not Printed'}
                    </div>
                    <div className="flex space-x-2">
                      <select
                        value={order.orderStatus || 'Placed'}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className="px-3 py-1 border rounded-lg text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      >
                        <option value="Placed">Placed</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Ready">Ready</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="bg-primary-600 text-white px-4 py-1 rounded-lg hover:bg-primary-700 flex items-center space-x-1"
                      >
                        <FaEye />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold dark:text-white">{selectedOrder.orderNumber}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FaTimesCircle className="text-2xl" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2 dark:text-white">Items</h3>
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <div>
                          <p className="font-medium dark:text-white">{item.name} × {item.quantity}</p>
                          {item.customization && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {item.customization.size && `Size: ${item.customization.size}`}
                              {item.customization.addOns?.length > 0 && ` | Add-ons: ${item.customization.addOns.map(a => a.name).join(', ')}`}
                            </p>
                          )}
                        </div>
                        <p className="font-semibold dark:text-white">₹{(item.price || 0) * (item.quantity || 1)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between text-lg font-bold dark:text-white">
                      <span>Total:</span>
                      <span>₹{selectedOrder.totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;
