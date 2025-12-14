import { createSlice } from '@reduxjs/toolkit';

// Load favorites from localStorage
const loadFavoritesFromStorage = () => {
  try {
    const favorites = localStorage.getItem('favorites');
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    return [];
  }
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: {
    items: loadFavoritesFromStorage(),
  },
  reducers: {
    addToFavorites: (state, action) => {
      const item = action.payload;
      if (!state.items.find((fav) => fav._id === item._id)) {
        state.items.push(item);
        localStorage.setItem('favorites', JSON.stringify(state.items));
      }
    },
    removeFromFavorites: (state, action) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
      localStorage.setItem('favorites', JSON.stringify(state.items));
    },
    toggleFavorite: (state, action) => {
      const item = action.payload;
      const index = state.items.findIndex((fav) => fav._id === item._id);
      if (index >= 0) {
        state.items.splice(index, 1);
      } else {
        state.items.push(item);
      }
      localStorage.setItem('favorites', JSON.stringify(state.items));
    },
  },
});

export const { addToFavorites, removeFromFavorites, toggleFavorite } = favoritesSlice.actions;
export const selectFavorites = (state) => state.favorites?.items || [];
export const selectIsFavorite = (itemId) => (state) =>
  state.favorites?.items?.some((item) => item._id === itemId) || false;

export default favoritesSlice.reducer;

