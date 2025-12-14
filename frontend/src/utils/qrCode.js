// Generate QR code data for order lookup
export const generateOrderQRData = (orderId, orderNumber) => {
  return JSON.stringify({
    type: 'order',
    orderId,
    orderNumber,
    timestamp: Date.now(),
  });
};

// Generate token number (4-digit)
export const generateTokenNumber = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

