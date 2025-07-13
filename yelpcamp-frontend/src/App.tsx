import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { updateIntercomPage } from './services/intercomService';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import BackToTop from './components/BackToTop';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Campgrounds from './pages/Campgrounds';
import CampgroundDetail from './pages/CampgroundDetail';
import NewCampground from './pages/NewCampground';
import EditCampground from './pages/EditCampground';
import UserProfile from './pages/UserProfile';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Orders from './pages/Orders';
import ProtectedRoute from './components/ProtectedRoute';
import BookingDetail from './pages/BookingDetail';

import './App.css';

// Component to handle route changes for Intercom
function IntercomRouteHandler() {
  const location = useLocation();

  useEffect(() => {
    updateIntercomPage();
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <CartProvider>
      <div className="App">
        <IntercomRouteHandler />
        <Navbar />
      <main className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/campgrounds" element={<Campgrounds />} />
          <Route path="/campgrounds/:id" element={<CampgroundDetail />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/campgrounds/new"
            element={
              <ProtectedRoute>
                <NewCampground />
              </ProtectedRoute>
            }
          />
          <Route
            path="/campgrounds/:id/edit"
            element={
              <ProtectedRoute>
                <EditCampground />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/:id"
            element={
              <ProtectedRoute>
                <BookingDetail />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      
      {/* Back to Top Button */}
      <BackToTop />
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
    </CartProvider>
  );
}

export default App;
