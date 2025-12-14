import React from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomeScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="text-center text-white max-w-2xl">
        <h1 className="text-6xl md:text-8xl font-bold mb-6 animate-pulse">
          🍗 Flying Chicken
        </h1>
        <p className="text-2xl md:text-3xl mb-12 font-light">
          Welcome to our Self-Ordering System
        </p>
        <p className="text-xl mb-16 text-primary-100">
          Touch the button below to start your order
        </p>
        <button
          onClick={() => navigate('/menu')}
          className="btn-primary text-3xl px-16 py-6 text-white bg-white text-primary-600 hover:bg-primary-50 transform hover:scale-105 shadow-2xl"
        >
          Start Order
        </button>
        <div className="mt-12">
          <button
            onClick={() => navigate('/admin/login')}
            className="text-primary-200 hover:text-white underline text-lg"
          >
            Admin Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;

