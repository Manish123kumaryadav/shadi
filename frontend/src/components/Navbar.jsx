import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Heart, MessageCircle, User, LogOut, Home, Search } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ isLoggedIn, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo py-2">
          <Heart className="logo-icon" />
          <span>ShaadiMatch</span>
        </Link>

        {/* Mobile Menu Button */}
        <button className="menu-toggle" onClick={toggleMenu}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Navigation Links */}
        <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <Link
              to="/"
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <Home size={18} /> Home
            </Link>
          </li>

          {isLoggedIn ? (
            <>
              <li className="nav-item">
                <Link
                  to="/browse"
                  className={`nav-link ${isActive('/browse') ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <Search size={18} /> Browse Profiles
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  to="/likes"
                  className={`nav-link ${isActive('/likes') ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <Heart size={18} /> Likes & Views
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  to="/messages"
                  className={`nav-link ${isActive('/messages') ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <MessageCircle size={18} /> Messages
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  to="/profile"
                  className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <User size={18} /> My Profile
                </Link>
              </li>

              <li className="nav-item logout-item">
                <button className="nav-link logout-btn" onClick={handleLogout}>
                  <LogOut size={18} /> Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link
                  to="/login"
                  className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  to="/register"
                  className={`nav-link register-link ${isActive('/register') ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
