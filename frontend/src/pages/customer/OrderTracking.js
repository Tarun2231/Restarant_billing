import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaClock, FaUtensils, FaBox, FaCheckCircle } from 'react-icons/fa';
import { getOrder } from '../../services/api';
import toast from 'react-hot-toast';

const statusSteps = [
  { key: 'Placed', label: 'Order Placed', icon: FaClock, color: 'blue' },
  { key: 'Preparing', label: 'Preparing', icon: FaUtensils, color: 'yellow' },
  { key: 'Ready', label: 'Ready', icon: FaBox, color: 'orange' },
  { key: 'Completed', label: 'Completed', icon: FaCheckCircle, color: 'green' },
];

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    // Poll for status updates every 5 seconds
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await getOrder(orderId);
      setOrder(response.data);
      if (response.data.orderStatus === 'Ready') {
        toast.success('Your order is ready!', { icon: '🎉' });
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    return statusSteps.findIndex((step) => step.key === order.orderStatus) || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">Order not found</h2>
          <button onClick={() => navigate('/')} className="btn-primary">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const currentStep = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <div className="bg-primary-600 dark:bg-primary-700 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold">Track Your Order</h1>
          <p className="text-primary-100 mt-2">Order #{order.orderNumber}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Status Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-6">
          <div className="relative">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= currentStep;
              const isCurrent = index === currentStep;

              return (
                <div key={step.key} className="flex items-center mb-8 last:mb-0">
                  <div className="flex flex-col items-center mr-4">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all ${
                        isActive
                          ? `bg-${step.color}-500 border-${step.color}-500 text-white`
                          : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400'
                      }`}
                    >
                      <Icon className="text-2xl" />
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div
                        className={`w-1 h-16 mt-2 ${
                          isActive ? `bg-${step.color}-500` : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`text-xl font-bold ${
                        isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </h3>
                    {isCurrent && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Your order is currently being {step.label.toLowerCase()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Order Details</h2>
          <div className="space-y-2">
            {order.items?.map((item, index) => (
              <div key={index} className="flex justify-between text-lg dark:text-gray-300">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
            <div className="flex justify-between text-2xl font-bold">
              <span className="dark:text-white">Total:</span>
              <span className="text-primary-600 dark:text-primary-400">
                ₹{order.totalAmount}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex space-x-4">
          <button onClick={() => navigate('/receipt/' + orderId)} className="btn-primary flex-1">
            View Receipt
          </button>
          <button onClick={() => navigate('/menu')} className="btn-secondary flex-1">
            New Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;

