import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Browse from './pages/Browse';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Likes from './pages/Likes';
import FooterPage from './pages/FooterPage';
import './App.css';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function AppLayout({ isLoggedIn, onLogout, onLoginSuccess }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isHomeRoute = location.pathname === '/';

  return (
    <div className="App">
      {!isAdminRoute && !isHomeRoute && <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} />}

      <main className="main-content">
        <Suspense fallback={<div className="route-loading">Loading...</div>}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
            <Route path="/register" element={<Register onLoginSuccess={onLoginSuccess} />} />
            <Route path="/login" element={<Login onLoginSuccess={onLoginSuccess} />} />
            <Route path="/info/:slug" element={<FooterPage />} />
            <Route path="/admin" element={<AdminDashboard />} />

            {/* Protected Routes */}
            {isLoggedIn ? (
              <>
                <Route path="/browse" element={<Browse />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/likes" element={<Likes />} />
              </>
            ) : (
              <Route
                path="/browse"
                element={<Navigate to="/login" replace />}
              />
            )}

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('token');
  });

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <AppLayout
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        onLoginSuccess={handleLoginSuccess}
      />
    </Router>
  );
}

export default App;
