import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrder, markReceiptPrinted } from '../../services/api';

const ReceiptScreen = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    // Auto-print after a short delay
    if (order && !order.receiptPrinted) {
      const timer = setTimeout(() => {
        handlePrint();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [order]);

  const fetchOrder = async () => {
    try {
      const response = await getOrder(orderId);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      alert('Failed to load receipt');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    setPrinting(true);
    try {
      // Mark receipt as printed
      if (order && !order.receiptPrinted) {
        await markReceiptPrinted(orderId);
      }
      // Trigger browser print
      window.print();
    } catch (error) {
      console.error('Error printing receipt:', error);
    } finally {
      setPrinting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  const tax = Math.round(order.totalAmount * 0.05);
  const finalTotal = order.totalAmount + tax;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Print-only styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .receipt-container, .receipt-container * {
            visibility: visible;
          }
          .receipt-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none;
          }
        }
      `}</style>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Receipt */}
        <div className="receipt-container bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">🍗 Flying Chicken</h1>
            <p className="text-gray-600">Restaurant Self-Ordering System</p>
            <p className="text-gray-600 mt-2">Order Receipt</p>
          </div>

          {/* Order Info */}
          <div className="border-t-2 border-b-2 border-gray-300 py-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Order Number:</span>
              <span className="font-bold">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Date & Time:</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Payment Method:</span>
              <span>{order.paymentMethod}</span>
            </div>
          </div>

          {/* Items */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Items Ordered:</h2>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between border-b border-gray-200 pb-2">
                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      ₹{item.price} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t-2 border-gray-300 pt-4 mb-6">
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span>₹{order.totalAmount}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Tax (5%):</span>
              <span>₹{tax}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold border-t-2 border-gray-300 pt-4 mt-4">
              <span>Total:</span>
              <span className="text-primary-600">₹{finalTotal}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-600 border-t-2 border-gray-300 pt-6">
            <p className="mb-2">Thank you for your order!</p>
            <p className="text-sm">Please show this receipt at the counter</p>
            <p className="text-sm mt-2">Payment Status: <span className="font-bold text-green-600">{order.paymentStatus}</span></p>
          </div>
        </div>

        {/* Action Buttons (Hidden when printing) */}
        <div className="no-print mt-8 flex space-x-4">
          <button
            onClick={handlePrint}
            className="btn-primary flex-1 text-xl"
            disabled={printing}
          >
            {printing ? 'Printing...' : 'Print Receipt'}
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn-secondary flex-1 text-xl"
          >
            New Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptScreen;

