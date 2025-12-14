import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaUndo, FaTrash, FaTag } from 'react-icons/fa';
import {
  selectCartItems,
  selectCartTotal,
  removeItem,
  updateQuantity,
  undoRemoveItem,
  applyCoupon,
  removeCoupon,
  clearCart,
  selectCoupon,
  selectLastRemovedItem,
} from '../../store/slices/cartSlice';
import { validateCoupon, calculateDiscount } from '../../utils/coupons';
import DarkModeToggle from '../../components/DarkModeToggle';

const CartScreenEnhanced = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems) || [];
  const subtotal = useSelector(selectCartTotal) || 0;
  const coupon = useSelector(selectCoupon);
  const lastRemovedItem = useSelector(selectLastRemovedItem);

  const [couponCode, setCouponCode] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);

  const tax = Math.round(subtotal * 0.05);
  const discount = coupon ? calculateDiscount(coupon, subtotal) : 0;
  const finalTotal = subtotal + tax - discount;

  // Auto-hide undo notification after 5 seconds
  useEffect(() => {
    if (lastRemovedItem) {
      const timer = setTimeout(() => {
        // Auto-hide undo notification
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [lastRemovedItem]);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      dispatch(removeItem(itemId));
      toast.success('Item removed from cart', {
        icon: '🗑️',
      });
    } else {
      dispatch(updateQuantity({ itemId, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = (itemId) => {
    dispatch(removeItem(itemId));
    toast.success('Item removed', {
      icon: '🗑️',
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: () => {
          dispatch(undoRemoveItem());
          toast.success('Item restored!');
        },
      },
    });
  };

  const handleApplyCoupon = () => {
    const validation = validateCoupon(couponCode, subtotal);
    if (validation.valid) {
      dispatch(applyCoupon(validation.coupon));
      toast.success(`Coupon "${couponCode}" applied!`);
      setCouponCode('');
      setShowCouponInput(false);
    } else {
      toast.error(validation.error);
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    toast.success('Coupon removed');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4 text-gray-700 dark:text-gray-300">
            Your cart is empty
          </h2>
          <button onClick={() => navigate('/menu')} className="btn-primary text-xl mt-6">
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="bg-orange-600 text-white p-4 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Your Cart</h1>
          <div className="flex items-center gap-3">
            <DarkModeToggle />
            <button
              onClick={() => navigate('/menu')}
              className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>

      {/* Undo Notification */}
      <AnimatePresence>
        {lastRemovedItem && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 flex items-center space-x-4"
          >
            <span className="text-gray-700 dark:text-gray-300">
              Item removed from cart
            </span>
            <button
              onClick={() => {
                dispatch(undoRemoveItem());
                toast.success('Item restored!');
              }}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
            >
              <FaUndo />
              <span>Undo</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Cart Items */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
          <div className="space-y-3">
            {items.map((item) => (
              <motion.div
                key={item.cartItemId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-4 p-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100?text=Food';
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold dark:text-white">{item.name}</h3>
                      {item.isCombo && (
                        <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-0.5 rounded">
                          COMBO
                        </span>
                      )}
                    </div>
                    {item.isCombo && item.comboItems && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span className="font-semibold">Includes: </span>
                        {item.comboItems.join(', ')}
                      </div>
                    )}
                    {item.customization && !item.isCombo && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {item.customization.size && (
                          <span className="mr-2">Size: {item.customization.size}</span>
                        )}
                        {item.customization.addOns?.length > 0 && (
                          <span>
                            Add-ons: {item.customization.addOns.map((a) => a.name).join(', ')}
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-gray-600 dark:text-gray-400">₹{item.price} each</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-2 py-1">
                    <button
                      onClick={() => handleQuantityChange(item.cartItemId, item.quantity - 1)}
                      className="w-8 h-8 rounded bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold hover:bg-gray-200 dark:hover:bg-gray-500 text-sm"
                    >
                      −
                    </button>
                    <span className="text-lg font-bold w-6 text-center dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.cartItemId, item.quantity + 1)}
                      className="w-8 h-8 rounded bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold hover:bg-gray-200 dark:hover:bg-gray-500 text-sm"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right w-24">
                    <p className="text-lg font-bold dark:text-white">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.cartItemId)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 text-lg p-1"
                  >
                    <FaTrash />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Coupon Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
          {!coupon ? (
            <div>
              {!showCouponInput ? (
                <button
                  onClick={() => setShowCouponInput(true)}
                  className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  <FaTag />
                  <span>Have a coupon code?</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  />
                  <button onClick={handleApplyCoupon} className="btn-primary">
                    Apply
                  </button>
                  <button
                    onClick={() => {
                      setShowCouponInput(false);
                      setCouponCode('');
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <span className="text-green-600 dark:text-green-400 font-semibold">
                  Coupon Applied: {coupon.code}
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {coupon.description}
                </p>
              </div>
              <button
                onClick={handleRemoveCoupon}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-lg font-bold mb-3 dark:text-white">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
              <span className="font-semibold dark:text-white">₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tax (5%):</span>
              <span className="font-semibold dark:text-white">₹{tax}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Discount:</span>
                <span className="font-semibold">-₹{discount}</span>
              </div>
            )}
            <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
              <div className="flex justify-between text-xl">
                <span className="font-bold dark:text-white">Total:</span>
                <span className="font-bold text-orange-600 dark:text-orange-400">
                  ₹{finalTotal}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={() => dispatch(clearCart())} 
            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 flex-1 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Clear Cart
          </button>
          <button 
            onClick={() => navigate('/payment')} 
            className="bg-orange-600 text-white flex-1 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartScreenEnhanced;

