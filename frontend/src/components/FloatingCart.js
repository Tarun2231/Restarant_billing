import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCartCount, selectCartTotal } from '../store/slices/cartSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingCart } from 'react-icons/fa';

const FloatingCart = () => {
  const navigate = useNavigate();
  const cartCount = useSelector(selectCartCount) || 0;
  const cartTotal = useSelector(selectCartTotal) || 0;
  const showFloatingCart = useSelector((state) => state.ui?.showFloatingCart ?? true);

  if (!showFloatingCart || cartCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-8 z-50"
      >
        <button
          onClick={() => navigate('/cart')}
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-2xl flex items-center space-x-3 group"
        >
          <div className="relative">
            <FaShoppingCart className="text-2xl" />
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
              >
                {cartCount}
              </motion.span>
            )}
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-sm font-semibold">₹{Math.round(cartTotal * 1.05)}</div>
            <div className="text-xs opacity-90">{cartCount} items</div>
          </div>
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingCart;

