import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { selectLoyaltyLevel, selectLoyaltyPoints } from '../../store/slices/loyaltySlice';
import { selectOrderHistory } from '../../store/slices/orderHistorySlice';

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const loyaltyLevel = useSelector(selectLoyaltyLevel);
  const loyaltyPoints = useSelector(selectLoyaltyPoints);
  const orderHistory = useSelector(selectOrderHistory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center p-4">
      <div className="text-center text-white max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="text-7xl mb-4">🍗</div>
          <h1 className="text-5xl md:text-6xl font-bold mb-2">Flying Chicken</h1>
          <p className="text-xl md:text-2xl text-white/90">Self-Ordering System</p>
        </motion.div>
        
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate('/menu')}
          className="bg-white text-orange-600 font-bold text-xl md:text-2xl px-12 py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-orange-50 transition-all duration-200 mb-8"
        >
          Start Order
        </motion.button>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 text-sm"
        >
          {orderHistory.length > 0 && (
            <button
              onClick={() => navigate('/orders')}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              Order History ({orderHistory.length})
            </button>
          )}
          {loyaltyPoints > 0 && (
            <div className="bg-white/20 px-4 py-2 rounded-lg">
              <span className="text-xs">⭐ {loyaltyLevel}</span>
              <span className="ml-2 font-semibold">{loyaltyPoints} pts</span>
            </div>
          )}
          <button
            onClick={() => navigate('/admin/login')}
            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
          >
            Admin Login
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default WelcomeScreen;

