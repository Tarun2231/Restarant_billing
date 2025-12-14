import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import uiReducer from './slices/uiSlice';
import favoritesReducer from './slices/favoritesSlice';
import orderHistoryReducer from './slices/orderHistorySlice';
import loyaltyReducer from './slices/loyaltySlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    order: orderReducer,
    ui: uiReducer,
    favorites: favoritesReducer,
    orderHistory: orderHistoryReducer,
    loyalty: loyaltyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['cart/loadCartFromStorage'],
      },
    }),
});

