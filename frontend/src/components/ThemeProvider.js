import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setDarkMode } from '../store/slices/uiSlice';

const ThemeProvider = ({ children }) => {
  const darkMode = useSelector((state) => state.ui.darkMode);
  const dispatch = useDispatch();

  useEffect(() => {
    // Load dark mode preference from localStorage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    dispatch(setDarkMode(savedDarkMode));
  }, [dispatch]);

  useEffect(() => {
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return <>{children}</>;
};

export default ThemeProvider;

