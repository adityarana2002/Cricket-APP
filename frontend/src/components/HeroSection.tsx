import React from 'react';
import { Link } from 'react-router-dom';
import { BRANDING } from '../config/branding';
import '../styles/hero.css';

export const HeroSection: React.FC = () => {
  return (
    <section className="hero">
      <div className="hero-background">
        <div className="background-blur"></div>
        <div className="background-gradient"></div>
      </div>

      <div className="hero-content">
        {/* Large Logo */}
        <div className="hero-logo-wrapper">
          <svg
            className="hero-logo"
            viewBox="0 0 512 512"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer C shape */}
            <path
              d="M 200 100 Q 100 100 100 256 Q 100 412 200 412 L 220 412 Q 130 412 130 256 Q 130 100 220 100 Z"
              fill="#003D82"
              opacity="0.9"
            />
            {/* Cricket Ball */}
            <circle cx="300" cy="200" r="80" fill="#003D82" stroke="#D4AF37" strokeWidth="3" />
            {/* Motion effects */}
            <path
              d="M 360 160 Q 400 140 440 120"
              stroke="#D4AF37"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Main Content */}
        <h1 className="hero-title">
          Welcome to <span className="brand-name">CricMax</span>
        </h1>
        <p className="hero-subtitle">Master the Game of Cricket</p>

        <p className="hero-description">
          Your ultimate platform for cricket tournaments, live scoring, player statistics, and competitive gaming
        </p>

        {/* CTA Buttons */}
        <div className="hero-buttons">
          <Link to="/register" className="btn-primary">
            Get Started
          </Link>
          <Link to="/tournaments" className="btn-secondary">
            Explore Tournaments
          </Link>
        </div>

        {/* Features */}
        <div className="hero-features">
          <div className="feature">
            <div className="feature-icon">🏆</div>
            <h3>Tournaments</h3>
            <p>Create and manage cricket tournaments</p>
          </div>
          <div className="feature">
            <div className="feature-icon">📊</div>
            <h3>Statistics</h3>
            <p>Track player performance and rankings</p>
          </div>
          <div className="feature">
            <div className="feature-icon">⚡</div>
            <h3>Live Updates</h3>
            <p>Real-time match scoring and commentary</p>
          </div>
          <div className="feature">
            <div className="feature-icon">👥</div>
            <h3>Community</h3>
            <p>Connect with cricket enthusiasts</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
