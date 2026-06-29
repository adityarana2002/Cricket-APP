import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BRANDING } from '../config/branding';
import '../styles/navbar.css';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  const userEmail = localStorage.getItem('userEmail');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo and Branding */}
        <Link to="/" className="navbar-brand">
          <div className="logo-wrapper">
            <svg
              className="cricmax-logo"
              viewBox="0 0 512 512"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer C shape in dark blue */}
              <path
                d="M 200 100 Q 100 100 100 256 Q 100 412 200 412 L 220 412 Q 130 412 130 256 Q 130 100 220 100 Z"
                fill="#003D82"
                opacity="0.9"
              />
              {/* Cricket Ball */}
              <circle cx="300" cy="200" r="80" fill="#003D82" stroke="#D4AF37" strokeWidth="3" />
              {/* Ball stitching lines */}
              <path
                d="M 260 200 Q 280 160 320 160 Q 340 180 340 200"
                stroke="#D4AF37"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 360 160 Q 400 140 440 120"
                stroke="#D4AF37"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="brand-text">
            <h1>{BRANDING.APP_NAME}</h1>
            <p className="tagline">{BRANDING.TAGLINE}</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">Home</Link>
          </li>
          <li className="nav-item">
            <Link to="/tournaments" className="nav-link">Tournaments</Link>
          </li>
          <li className="nav-item">
            <Link to="/matches" className="nav-link">Matches</Link>
          </li>
          <li className="nav-item">
            <Link to="/players" className="nav-link">Players</Link>
          </li>
        </ul>

        {/* Auth Section */}
        <div className="auth-section">
          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-email">{userEmail}</span>
              <Link to="/dashboard" className="btn-dashboard">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">
                Login
              </Link>
              <Link to="/register" className="btn-register">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
