import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaClock, FaCheckCircle, FaUtensils, FaBox } from 'react-icons/fa';
import { selectOrderHistory, loadOrderHistory } from '../../store/slices/orderHistorySlice';
import { getOrder } from '../../services/api';
import DarkModeToggle from '../../components/DarkModeToggle';

const OrderHistory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const orders = useSelector(selectOrderHistory);

  useEffect(() => {
    dispatch(loadOrderHistory());
  }, [dispatch]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Placed':
        return <FaClock className="text-blue-500" />;
      case 'Preparing':
        return <FaUtensils className="text-yellow-500" />;
      case 'Ready':
        return <FaBox className="text-orange-500" />;
      case 'Completed':
        return <FaCheckCircle className="text-green-500" />;
      default:
        return <FaClock className="text-gray-500" />;
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <div className="bg-primary-600 dark:bg-primary-700 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/menu')}
              className="text-white hover:text-gray-200"
            >
              ← Back
            </button>
            <h1 className="text-4xl font-bold">Order History</h1>
          </div>
          <DarkModeToggle />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl text-gray-500 dark:text-gray-400 mb-4">
              No orders yet
            </p>
            <button onClick={() => navigate('/menu')} className="btn-primary">
              Start Ordering
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <motion.div
                key={order._id || order.orderNumber}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => navigate(`/receipt/${order._id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold dark:text-white">
                      {order.orderNumber || `Order #${order._id?.slice(-6)}`}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                      {formatDate(order.createdAt || order.date)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.orderStatus || 'Placed')}
                    <span className="font-semibold dark:text-white">
                      {order.orderStatus || 'Placed'}
                    </span>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">
                        {order.items?.length || 0} items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        ₹{order.totalAmount || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;

