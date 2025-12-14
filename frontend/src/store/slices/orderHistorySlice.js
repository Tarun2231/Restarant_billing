import { createSlice } from '@reduxjs/toolkit';

const orderHistorySlice = createSlice({
  name: 'orderHistory',
  initialState: {
    orders: [],
    currentTrackingOrder: null,
  },
  reducers: {
    addOrder: (state, action) => {
      state.orders.unshift(action.payload);
      // Keep only last 50 orders
      if (state.orders.length > 50) {
        state.orders = state.orders.slice(0, 50);
      }
      // Save to localStorage
      localStorage.setItem('orderHistory', JSON.stringify(state.orders));
    },
    setCurrentTrackingOrder: (state, action) => {
      state.currentTrackingOrder = action.payload;
    },
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload;
      const order = state.orders.find((o) => o._id === orderId);
      if (order) {
        order.orderStatus = status;
        localStorage.setItem('orderHistory', JSON.stringify(state.orders));
      }
    },
    loadOrderHistory: (state) => {
      try {
        const saved = localStorage.getItem('orderHistory');
        if (saved) {
          state.orders = JSON.parse(saved);
        }
      } catch (error) {
        console.error('Error loading order history:', error);
      }
    },
  },
});

export const {
  addOrder,
  setCurrentTrackingOrder,
  updateOrderStatus,
  loadOrderHistory,
} = orderHistorySlice.actions;
export const selectOrderHistory = (state) => state.orderHistory?.orders || [];
export const selectCurrentTrackingOrder = (state) => state.orderHistory?.currentTrackingOrder;

export default orderHistorySlice.reducer;

