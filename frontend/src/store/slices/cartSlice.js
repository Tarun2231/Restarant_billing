import { createSlice } from '@reduxjs/toolkit';

// Load cart from localStorage
const loadCartFromLocalStorage = () => {
  try {
    const cartData = localStorage.getItem('cart');
    return cartData ? JSON.parse(cartData) : { items: [], coupon: null };
  } catch (error) {
    return { items: [], coupon: null };
  }
};

const loadedData = loadCartFromLocalStorage();
const initialState = {
  items: loadedData.items || [],
  coupon: loadedData.coupon || null,
  lastRemovedItem: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action) => {
      const { item, customization = {} } = action.payload;
      const existingItemIndex = state.items.findIndex(
        (cartItem) =>
          cartItem._id === item._id &&
          JSON.stringify(cartItem.customization) === JSON.stringify(customization)
      );

      if (existingItemIndex >= 0) {
        state.items[existingItemIndex].quantity += 1;
      } else {
        state.items.push({
          ...item,
          quantity: 1,
          customization,
          cartItemId: Date.now() + Math.random(), // Unique ID for cart item
        });
      }
      localStorage.setItem('cart', JSON.stringify(state));
    },

    removeItem: (state, action) => {
      const itemId = action.payload;
      const removedItem = state.items.find((item) => item.cartItemId === itemId);
      state.items = state.items.filter((item) => item.cartItemId !== itemId);
      state.lastRemovedItem = removedItem; // Store for undo
      localStorage.setItem('cart', JSON.stringify(state));
    },

    updateQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      const item = state.items.find((item) => item.cartItemId === itemId);
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((item) => item.cartItemId !== itemId);
        } else {
          item.quantity = quantity;
        }
      }
      localStorage.setItem('cart', JSON.stringify(state));
    },

    undoRemoveItem: (state) => {
      if (state.lastRemovedItem) {
        state.items.push(state.lastRemovedItem);
        state.lastRemovedItem = null;
        localStorage.setItem('cart', JSON.stringify(state));
      }
    },

    applyCoupon: (state, action) => {
      state.coupon = action.payload;
      localStorage.setItem('cart', JSON.stringify(state));
    },

    removeCoupon: (state) => {
      state.coupon = null;
      localStorage.setItem('cart', JSON.stringify(state));
    },

    clearCart: (state) => {
      state.items = [];
      state.coupon = null;
      state.lastRemovedItem = null;
      localStorage.setItem('cart', JSON.stringify(state));
    },

    loadCartFromStorage: (state) => {
      const stored = loadCartFromLocalStorage();
      return { ...state, ...stored };
    },
  },
});

export const {
  addItem,
  removeItem,
  updateQuantity,
  undoRemoveItem,
  applyCoupon,
  removeCoupon,
  clearCart,
  loadCartFromStorage,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart?.items || [];
export const selectCartTotal = (state) => {
  const items = state.cart?.items || [];
  const subtotal = items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );
  return subtotal;
};
export const selectCartCount = (state) => {
  const items = state.cart?.items || [];
  return items.reduce((sum, item) => sum + (item.quantity || 0), 0);
};
export const selectCoupon = (state) => state.cart?.coupon || null;
export const selectLastRemovedItem = (state) => state.cart?.lastRemovedItem || null;

export default cartSlice.reducer;

