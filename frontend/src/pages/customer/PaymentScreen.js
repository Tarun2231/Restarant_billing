import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaMoneyBillWave, FaCreditCard, FaMobileAlt } from 'react-icons/fa';
import {
  selectCartItems,
  selectCartTotal,
  selectCoupon,
  clearCart,
} from '../../store/slices/cartSlice';
import { addOrder } from '../../store/slices/orderHistorySlice';
import { addPoints } from '../../store/slices/loyaltySlice';
import { calculateDiscount } from '../../utils/coupons';
import { processPayment, createOrder } from '../../services/api';

const paymentMethods = [
  { 
    id: 'Cash', 
    label: 'Cash', 
    icon: FaMoneyBillWave,
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-500',
    iconColor: 'text-green-600'
  },
  { 
    id: 'Card', 
    label: 'Card', 
    icon: FaCreditCard,
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
    iconColor: 'text-blue-600'
  },
  { 
    id: 'UPI', 
    label: 'UPI', 
    icon: FaMobileAlt,
    color: 'purple',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-500',
    iconColor: 'text-purple-600'
  },
];

const PaymentScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems) || [];
  const subtotal = useSelector(selectCartTotal) || 0;
  const coupon = useSelector(selectCoupon);
  const loyaltyPoints = useSelector((state) => state.loyalty?.points || 0);
  
  const [selectedMethod, setSelectedMethod] = useState('Cash');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const tax = Math.round(subtotal * 0.05);
  const discount = coupon ? calculateDiscount(coupon, subtotal) : 0;
  const finalTotal = subtotal + tax - discount;

  const handlePayment = async () => {
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Simulate payment processing
      const paymentResponse = await processPayment({
        amount: finalTotal,
        paymentMethod: selectedMethod,
      });

      if (paymentResponse.data && paymentResponse.data.success) {
        // Create order - handle both regular items and combo items
        const orderItems = items.map(item => ({
          itemId: item.isCombo ? null : item._id, // Combo items don't have menu itemId
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          customization: item.customization || {},
          isCombo: item.isCombo || false,
          comboItems: item.comboItems || []
        }));

        const orderResponse = await createOrder({
          items: orderItems,
          paymentMethod: selectedMethod,
          paymentStatus: 'Paid',
        });

        if (orderResponse.data) {
          // Add to order history
          dispatch(addOrder(orderResponse.data));
          
          // Add loyalty points (1 point per ₹10 spent)
          const pointsEarned = Math.floor(finalTotal / 10);
          if (pointsEarned > 0) {
            dispatch(addPoints(pointsEarned));
          }

          // Clear cart
          dispatch(clearCart());
          toast.success(`Order placed! Earned ${pointsEarned} loyalty points!`, { icon: '✅' });

          // Navigate to receipt
          navigate(`/receipt/${orderResponse.data._id || orderResponse.data.order?._id}`);
        } else {
          setError('Order creation failed. Please try again.');
        }
      } else {
        setError(paymentResponse.data?.error || 'Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      
      // Show user-friendly error messages
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      
      if (error.userMessage) {
        setError(error.userMessage);
      } else if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response) {
        if (isProduction) {
          setError('Backend API is not available. Payment cannot be processed. Please deploy the backend server.');
        } else {
          setError('Cannot connect to backend server. Please ensure the backend is running on http://localhost:5000');
        }
      } else {
        setError(error.response?.data?.error || error.message || 'Payment failed. Please try again.');
      }
    } finally {
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
        >
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-3xl font-bold mb-4 text-gray-700 dark:text-gray-300">
            Your cart is empty
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/menu')}
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all"
          >
            Browse Menu
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="bg-orange-600 text-white p-6 shadow-md">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold">Payment</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6"
        >
          <h2 className="text-2xl font-bold mb-5 dark:text-white">Order Summary</h2>
          
          {/* Order Items */}
          <div className="space-y-3 mb-5">
            {items.map((item) => (
              <div key={item.cartItemId || item._id} className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {item.name} × {item.quantity}
                </span>
                <span className="text-gray-900 dark:text-white font-semibold">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Subtotal:</span>
              <span className="font-semibold">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Tax (5%):</span>
              <span className="font-semibold">₹{tax}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Discount:</span>
                <span className="font-semibold">-₹{discount}</span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold dark:text-white">Total:</span>
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                ₹{finalTotal}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6"
        >
          <h2 className="text-2xl font-bold mb-6 dark:text-white">Select Payment Method</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paymentMethods.map((method, index) => {
              const IconComponent = method.icon;
              const isSelected = selectedMethod === method.id;
              return (
                <motion.button
                  key={method.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`p-6 rounded-xl transition-all duration-300 ${
                    isSelected
                      ? `${method.borderColor} border-4 ${method.bgColor} dark:bg-gray-700 shadow-lg`
                      : 'border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-md'
                  }`}
                >
                  <div className={`flex justify-center mb-4 ${isSelected ? method.iconColor : 'text-gray-600 dark:text-gray-400'}`}>
                    <IconComponent className="text-5xl" />
                  </div>
                  <div className={`text-xl font-bold text-center ${
                    isSelected 
                      ? 'text-gray-900 dark:text-white' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {method.label}
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-3 text-center"
                    >
                      <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                        ✓ Selected
                      </span>
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-100 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-6 py-4 rounded-xl mb-6"
          >
            <p className="font-semibold">{error}</p>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/cart')}
            className="bg-gray-500 hover:bg-gray-600 text-white flex-1 py-4 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all duration-300"
            disabled={processing}
          >
            Back to Cart
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePayment}
            className="bg-orange-600 hover:bg-orange-700 text-white flex-1 py-4 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={processing}
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Processing...
              </span>
            ) : (
              `Pay ₹${finalTotal}`
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentScreen;

