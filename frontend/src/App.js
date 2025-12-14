import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { store } from './store/store';
import { AuthProvider } from './context/AuthContext';
import ThemeProvider from './components/ThemeProvider';
import PageTransition from './components/PageTransition';
import FloatingCart from './components/FloatingCart';

// Customer routes
import WelcomeScreen from './pages/customer/WelcomeScreen';
import MenuScreenEnhanced from './pages/customer/MenuScreenEnhanced';
import CartScreenEnhanced from './pages/customer/CartScreenEnhanced';
import PaymentScreen from './pages/customer/PaymentScreen';
import ReceiptScreen from './pages/customer/ReceiptScreen';
import OrderHistory from './pages/customer/OrderHistory';
import OrderTracking from './pages/customer/OrderTracking';

// Admin routes
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMenu from './pages/admin/AdminMenu';
import AdminOrders from './pages/admin/AdminOrders';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';
import InventoryManagement from './pages/admin/InventoryManagement';
import StaffManagement from './pages/admin/StaffManagement';
import TableManagement from './pages/admin/TableManagement';
import LiveOrderMonitoring from './pages/admin/LiveOrderMonitoring';
import CustomerInteraction from './pages/admin/CustomerInteraction';

// Kitchen Display System
import KitchenDisplay from './pages/kitchen/KitchenDisplay';

function App() {
  // Get basename from environment or use default for GitHub Pages
  const basename = process.env.PUBLIC_URL || '/Restarant_billing';
  
  return (
    <Provider store={store}>
      <Router basename={basename}>
        <ThemeProvider>
          <AuthProvider>
            <div className="kiosk-container">
              <AnimatePresence mode="wait">
                <Routes>
                  {/* Customer Routes */}
                  <Route
                    path="/"
                    element={
                      <PageTransition>
                        <WelcomeScreen />
                      </PageTransition>
                    }
                  />
                  <Route
                    path="/menu"
                    element={
                      <PageTransition>
                        <MenuScreenEnhanced />
                      </PageTransition>
                    }
                  />
                  <Route
                    path="/cart"
                    element={
                      <PageTransition>
                        <CartScreenEnhanced />
                      </PageTransition>
                    }
                  />
                  <Route
                    path="/payment"
                    element={
                      <PageTransition>
                        <PaymentScreen />
                      </PageTransition>
                    }
                  />
                  <Route
                    path="/receipt/:orderId"
                    element={
                      <PageTransition>
                        <ReceiptScreen />
                      </PageTransition>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <PageTransition>
                        <OrderHistory />
                      </PageTransition>
                    }
                  />
                  <Route
                    path="/track/:orderId"
                    element={
                      <PageTransition>
                        <OrderTracking />
                      </PageTransition>
                    }
                  />

                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/menu" element={<AdminMenu />} />
                  <Route path="/admin/orders" element={<AdminOrders />} />
                  <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
                  <Route path="/admin/inventory" element={<InventoryManagement />} />
                  <Route path="/admin/staff" element={<StaffManagement />} />
                  <Route path="/admin/tables" element={<TableManagement />} />
                  <Route path="/admin/live-orders" element={<LiveOrderMonitoring />} />
                  <Route path="/admin/customers" element={<CustomerInteraction />} />

                  {/* Kitchen Display */}
                  <Route path="/kitchen" element={<KitchenDisplay />} />
                </Routes>
              </AnimatePresence>
              <FloatingCart />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 2000,
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </Provider>
  );
}

export default App;

