import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  darkMode: false,
  kioskMode: false,
  showFloatingCart: true,
  sidebarOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode);
    },

    setDarkMode: (state, action) => {
      state.darkMode = action.payload;
      localStorage.setItem('darkMode', state.darkMode);
    },

    toggleKioskMode: (state) => {
      state.kioskMode = !state.kioskMode;
    },

    setKioskMode: (state, action) => {
      state.kioskMode = action.payload;
    },

    setShowFloatingCart: (state, action) => {
      state.showFloatingCart = action.payload;
    },

    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
  },
});

export const {
  toggleDarkMode,
  setDarkMode,
  toggleKioskMode,
  setKioskMode,
  setShowFloatingCart,
  toggleSidebar,
} = uiSlice.actions;

export default uiSlice.reducer;

