import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentOrder: null,
  orderHistory: [],
  paymentState: 'idle', // idle, initiated, processing, success, failed
  estimatedTime: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },

    setPaymentState: (state, action) => {
      state.paymentState = action.payload;
    },

    setEstimatedTime: (state, action) => {
      state.estimatedTime = action.payload;
    },

    addToHistory: (state, action) => {
      state.orderHistory.unshift(action.payload);
      // Keep only last 50 orders
      if (state.orderHistory.length > 50) {
        state.orderHistory = state.orderHistory.slice(0, 50);
      }
    },

    clearCurrentOrder: (state) => {
      state.currentOrder = null;
      state.paymentState = 'idle';
      state.estimatedTime = null;
    },
  },
});

export const {
  setCurrentOrder,
  setPaymentState,
  setEstimatedTime,
  addToHistory,
  clearCurrentOrder,
} = orderSlice.actions;

export default orderSlice.reducer;

