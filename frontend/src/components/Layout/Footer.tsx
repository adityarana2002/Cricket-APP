import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Cricket App</h3>
          <p>Your ultimate cricket match management platform</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/matches">Matches</a></li>
            <li><a href="/teams">Teams</a></li>
            <li><a href="/players">Players</a></li>
            <li><a href="/leaderboards">Leaderboards</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact</h4>
          <p>Email: info@cricketapp.com</p>
          <p>Phone: +1 (555) 123-4567</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {currentYear} Cricket App. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
