import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { processPayment, createOrder } from '../../services/api';

const paymentMethods = [
  { id: 'Cash', label: 'Cash', icon: '💵' },
  { id: 'Card', label: 'Card', icon: '💳' },
  { id: 'UPI', label: 'UPI', icon: '📱' },
];

const PaymentScreen = () => {
  const { items, total, clearCart } = useCart();
  const [selectedMethod, setSelectedMethod] = useState('Cash');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const finalTotal = Math.round(total * 1.05); // Including 5% tax

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

      if (paymentResponse.data.success) {
        // Create order
        const orderItems = items.map(item => ({
          itemId: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        }));

        const orderResponse = await createOrder({
          items: orderItems,
          paymentMethod: selectedMethod,
          paymentStatus: 'Paid',
        });

        // Clear cart
        clearCart();

        // Navigate to receipt
        navigate(`/receipt/${orderResponse.data._id}`);
      } else {
        setError('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-primary-600 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold">Payment</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4">
            {items.map((item) => (
              <div key={item._id} className="flex justify-between text-lg">
                <span>{item.name} × {item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t-2 border-gray-300 pt-4">
            <div className="flex justify-between text-2xl font-bold">
              <span>Total:</span>
              <span className="text-primary-600">₹{finalTotal}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-6">Select Payment Method</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`p-6 rounded-xl border-4 transition-all ${
                  selectedMethod === method.id
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <div className="text-5xl mb-3">{method.icon}</div>
                <div className="text-xl font-bold">{method.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/cart')}
            className="btn-secondary flex-1 text-xl"
            disabled={processing}
          >
            Back to Cart
          </button>
          <button
            onClick={handlePayment}
            className="btn-primary flex-1 text-xl"
            disabled={processing}
          >
            {processing ? 'Processing...' : `Pay ₹${finalTotal}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentScreen;

