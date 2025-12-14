// Mock coupon codes for the system
export const COUPONS = {
  WELCOME10: {
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    description: '10% off on your first order',
    minAmount: 100,
  },
  FLAT50: {
    code: 'FLAT50',
    type: 'flat',
    value: 50,
    description: 'Flat ₹50 off',
    minAmount: 200,
  },
  SAVE20: {
    code: 'SAVE20',
    type: 'percentage',
    value: 20,
    description: '20% off on orders above ₹500',
    minAmount: 500,
  },
  HAPPY100: {
    code: 'HAPPY100',
    type: 'flat',
    value: 100,
    description: '₹100 off on orders above ₹1000',
    minAmount: 1000,
  },
};

export const validateCoupon = (code, subtotal) => {
  const coupon = COUPONS[code.toUpperCase()];
  if (!coupon) {
    return { valid: false, error: 'Invalid coupon code' };
  }
  if (subtotal < coupon.minAmount) {
    return {
      valid: false,
      error: `Minimum order amount of ₹${coupon.minAmount} required`,
    };
  }
  return { valid: true, coupon };
};

export const calculateDiscount = (coupon, subtotal) => {
  if (!coupon) return 0;
  if (coupon.type === 'percentage') {
    return Math.round((subtotal * coupon.value) / 100);
  }
  return coupon.value;
};

