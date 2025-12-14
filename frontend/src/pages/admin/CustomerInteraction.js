import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllOrders, getOrder } from '../../services/api';
import toast from 'react-hot-toast';
import {
  FaArrowLeft,
  FaSearch,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaShoppingCart,
  FaClock,
  FaCheckCircle,
  FaEye,
  FaArrowRight,
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const CustomerInteraction = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
    } else {
      fetchOrders();
    }
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getAllOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique customers from orders
  const customers = React.useMemo(() => {
    const customerMap = new Map();
    orders.forEach((order) => {
      // Use order number or phone as customer identifier
      const customerId = order.customerPhone || order.orderNumber?.split('-')[0] || 'Unknown';
      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          id: customerId,
          name: order.customerName || 'Guest Customer',
          phone: order.customerPhone || 'N/A',
          email: order.customerEmail || 'N/A',
          totalOrders: 0,
          totalSpent: 0,
          lastOrder: null,
          orders: [],
        });
      }
      const customer = customerMap.get(customerId);
      customer.totalOrders += 1;
      customer.totalSpent += order.totalAmount || 0;
      if (!customer.lastOrder || new Date(order.createdAt) > new Date(customer.lastOrder.createdAt)) {
        customer.lastOrder = order;
      }
      customer.orders.push(order);
    });
    return Array.from(customerMap.values());
  }, [orders]);

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerOrders(customer.orders);
  };

  const filteredCustomers = customers.filter((customer) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.phone.includes(query) ||
      customer.email.toLowerCase().includes(query)
    );
  });

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
              <h1 className="text-3xl font-bold">Customer Interaction</h1>
              <p className="text-gray-400 text-sm mt-1">
                {customers.length} unique customers
              </p>
            </div>
          </div>
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        {!selectedCustomer ? (
          <>
            {/* Search */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers by name, phone, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>

            {/* Customers List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCustomers.map((customer) => (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => handleViewCustomer(customer)}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold dark:text-white">{customer.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{customer.phone}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Total Orders:</span>
                      <span className="font-semibold dark:text-white">{customer.totalOrders}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Total Spent:</span>
                      <span className="font-semibold text-primary-600 dark:text-primary-400">
                        ₹{customer.totalSpent.toFixed(2)}
                      </span>
                    </div>
                    {customer.lastOrder && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Last Order:</span>
                        <span className="font-semibold dark:text-white">
                          {new Date(customer.lastOrder.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <button className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 flex items-center justify-center space-x-2">
                    <span>View Details</span>
                    <FaArrowRight />
                  </button>
                </motion.div>
              ))}
            </div>

            {filteredCustomers.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                <p className="text-2xl text-gray-500 dark:text-gray-400">
                  No customers found
                </p>
              </div>
            )}
          </>
        ) : (
          <div>
            {/* Customer Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 mb-4 flex items-center space-x-2"
              >
                <FaArrowLeft />
                <span>Back to Customers</span>
              </button>

              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold dark:text-white mb-2">
                    {selectedCustomer.name}
                  </h2>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <FaPhone />
                      <span>{selectedCustomer.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <FaEnvelope />
                      <span>{selectedCustomer.email}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    ₹{selectedCustomer.totalSpent.toFixed(2)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                  <div className="mt-2 text-lg font-semibold dark:text-white">
                    {selectedCustomer.totalOrders} Orders
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Orders */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold mb-6 dark:text-white">Order History</h3>
              <div className="space-y-4">
                {customerOrders.map((order) => (
                  <div
                    key={order._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-lg dark:text-white">{order.orderNumber}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                        <div className="mt-2">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              order.paymentStatus === 'Paid'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                          {order.orderStatus && (
                            <span className="ml-2 px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                              {order.orderStatus}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                          ₹{order.totalAmount}
                        </p>
                        <button
                          onClick={() => navigate(`/admin/orders?orderId=${order._id}`)}
                          className="mt-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center space-x-1"
                        >
                          <FaEye />
                          <span>View</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerInteraction;

