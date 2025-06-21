import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { AuthProvider } from './context/AuthContext';
import { updateIntercomPage } from './services/intercomService';
import Navbar from './components/Navbar';
import BackToTop from './components/BackToTop';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Campgrounds from './pages/Campgrounds';
import CampgroundDetail from './pages/CampgroundDetail';
import NewCampground from './pages/NewCampground';
import EditCampground from './pages/EditCampground';
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';

// Component to handle route changes for Intercom
function IntercomRouteHandler() {
  const location = useLocation();

  useEffect(() => {
    updateIntercomPage();
  }, [location.pathname]);

  return null;
}

// Component that uses Intercom (must be inside AuthProvider)
function AppContent() {
  return (
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
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
