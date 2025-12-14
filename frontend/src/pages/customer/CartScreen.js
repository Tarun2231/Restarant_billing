import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const CartScreen = () => {
  const { items, total, removeItem, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4 text-gray-700">Your cart is empty</h2>
          <button
            onClick={() => navigate('/menu')}
            className="btn-primary text-xl mt-6"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-primary-600 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-4xl font-bold">Your Cart</h1>
          <button
            onClick={() => navigate('/menu')}
            className="bg-white text-primary-600 px-6 py-3 rounded-lg font-bold text-xl hover:bg-primary-50"
          >
            Continue Shopping
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Cart Items */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between p-4 border-b border-gray-200 last:border-0"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100?text=Food';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{item.name}</h3>
                    <p className="text-gray-600">₹{item.price} each</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 bg-gray-100 rounded-lg px-3 py-2">
                    <button
                      onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                      className="w-10 h-10 rounded-full bg-white text-gray-800 font-bold hover:bg-gray-200"
                    >
                      −
                    </button>
                    <span className="text-xl font-bold w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                      className="w-10 h-10 rounded-full bg-white text-gray-800 font-bold hover:bg-gray-200"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right w-32">
                    <p className="text-xl font-bold">₹{item.price * item.quantity}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item._id)}
                    className="text-red-600 hover:text-red-800 text-2xl px-3"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="space-y-4">
            <div className="flex justify-between text-xl">
              <span className="font-semibold">Subtotal:</span>
              <span className="font-bold">₹{total}</span>
            </div>
            <div className="flex justify-between text-xl">
              <span className="font-semibold">Tax (5%):</span>
              <span className="font-bold">₹{Math.round(total * 0.05)}</span>
            </div>
            <div className="border-t-2 border-gray-300 pt-4">
              <div className="flex justify-between text-3xl">
                <span className="font-bold">Total:</span>
                <span className="font-bold text-primary-600">₹{Math.round(total * 1.05)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={clearCart}
            className="btn-secondary flex-1 text-xl"
          >
            Clear Cart
          </button>
          <button
            onClick={() => navigate('/payment')}
            className="btn-primary flex-1 text-xl"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartScreen;

