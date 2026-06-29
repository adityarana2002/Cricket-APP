import React from 'react';
import { Link } from 'react-router-dom';
import { BRANDING } from '../config/branding';
import '../styles/footer.css';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Brand Section */}
        <div className="footer-section footer-brand">
          <div className="footer-logo">
            <svg
              className="footer-logo-svg"
              viewBox="0 0 512 512"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 200 100 Q 100 100 100 256 Q 100 412 200 412 L 220 412 Q 130 412 130 256 Q 130 100 220 100 Z"
                fill="#D4AF37"
                opacity="0.9"
              />
              <circle cx="300" cy="200" r="80" fill="#D4AF37" stroke="#003D82" strokeWidth="3" />
              <path
                d="M 360 160 Q 400 140 440 120"
                stroke="#003D82"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h3>{BRANDING.APP_NAME}</h3>
          <p className="footer-tagline">{BRANDING.TAGLINE}</p>
          <p className="footer-description">Your ultimate cricket platform for tournaments, scoring, and community</p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/tournaments">Tournaments</Link></li>
            <li><Link to="/matches">Matches</Link></li>
            <li><Link to="/players">Players</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div className="footer-section">
          <h4>Company</h4>
          <ul>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms & Conditions</Link></li>
          </ul>
        </div>

        {/* Social Media */}
        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="social-links">
            <a href={BRANDING.SOCIAL.TWITTER} target="_blank" rel="noopener noreferrer" className="social-link">
              𝕏
            </a>
            <a href={BRANDING.SOCIAL.FACEBOOK} target="_blank" rel="noopener noreferrer" className="social-link">
              f
            </a>
            <a href={BRANDING.SOCIAL.INSTAGRAM} target="_blank" rel="noopener noreferrer" className="social-link">
              📷
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p>&copy; {currentYear} {BRANDING.APP_NAME}. All rights reserved. | Master the Game of Cricket</p>
      </div>
    </footer>
  );
};

export default Footer;
