import { createSlice } from '@reduxjs/toolkit';

// Load loyalty points from localStorage
const loadLoyaltyFromStorage = () => {
  try {
    const loyalty = localStorage.getItem('loyalty');
    return loyalty ? JSON.parse(loyalty) : { points: 0, level: 'Bronze', totalSpent: 0 };
  } catch (error) {
    return { points: 0, level: 'Bronze', totalSpent: 0 };
  }
};

const calculateLevel = (points) => {
  if (points >= 10000) return 'Platinum';
  if (points >= 5000) return 'Gold';
  if (points >= 2000) return 'Silver';
  return 'Bronze';
};

const loyaltySlice = createSlice({
  name: 'loyalty',
  initialState: loadLoyaltyFromStorage(),
  reducers: {
    addPoints: (state, action) => {
      const points = action.payload;
      state.points += points;
      state.totalSpent += points * 10; // 1 point = ₹10 spent
      state.level = calculateLevel(state.points);
      localStorage.setItem('loyalty', JSON.stringify(state));
    },
    redeemPoints: (state, action) => {
      const points = action.payload;
      if (state.points >= points) {
        state.points -= points;
        state.level = calculateLevel(state.points);
        localStorage.setItem('loyalty', JSON.stringify(state));
      }
    },
    resetLoyalty: (state) => {
      state.points = 0;
      state.level = 'Bronze';
      state.totalSpent = 0;
      localStorage.setItem('loyalty', JSON.stringify(state));
    },
  },
});

export const { addPoints, redeemPoints, resetLoyalty } = loyaltySlice.actions;
export const selectLoyaltyPoints = (state) => state.loyalty?.points || 0;
export const selectLoyaltyLevel = (state) => state.loyalty?.level || 'Bronze';
export const selectTotalSpent = (state) => state.loyalty?.totalSpent || 0;

export default loyaltySlice.reducer;

