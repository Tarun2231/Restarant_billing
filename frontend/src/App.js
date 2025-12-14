import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

// Customer routes
import WelcomeScreen from './pages/customer/WelcomeScreen';
import MenuScreen from './pages/customer/MenuScreen';
import CartScreen from './pages/customer/CartScreen';
import PaymentScreen from './pages/customer/PaymentScreen';
import ReceiptScreen from './pages/customer/ReceiptScreen';

// Admin routes
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMenu from './pages/admin/AdminMenu';
import AdminOrders from './pages/admin/AdminOrders';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="kiosk-container">
            <Routes>
              {/* Customer Routes */}
              <Route path="/" element={<WelcomeScreen />} />
              <Route path="/menu" element={<MenuScreen />} />
              <Route path="/cart" element={<CartScreen />} />
              <Route path="/payment" element={<PaymentScreen />} />
              <Route path="/receipt/:orderId" element={<ReceiptScreen />} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/menu" element={<AdminMenu />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
            </Routes>
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

