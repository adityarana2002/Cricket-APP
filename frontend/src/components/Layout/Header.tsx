import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const rawUser = localStorage.getItem('user');
  const isLoggedIn = !!localStorage.getItem('token');

  let user: { firstName?: string; lastName?: string; email?: string } | null = null;
  try { user = rawUser ? JSON.parse(rawUser) : null; } catch { user = null; }

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() || 'U';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsMenuOpen(false);
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Local Matches', path: '/local-matches' },
    { name: 'Profile', path: '/profile' },
  ];

  return (
    <header className={`cmx-header ${isScrolled ? 'cmx-scrolled' : ''}`}>
      <div className="cmx-header-inner">

        {/* Brand */}
        <Link to={isLoggedIn ? '/dashboard' : '/'} className="cmx-brand" onClick={() => setIsMenuOpen(false)}>
          <span className="cmx-brand-badge">🏏</span>
          <span className="cmx-brand-text">
            <span className="cmx-brand-name">CricMax</span>
            <span className="cmx-brand-tag">Master the Game</span>
          </span>
        </Link>

        {/* Desktop nav */}
        {isLoggedIn && (
          <nav className="cmx-nav">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `cmx-nav-link ${isActive ? 'cmx-nav-active' : ''}`}
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        )}

        {/* Right side */}
        <div className="cmx-actions">
          {isLoggedIn ? (
            <>
              <div className="cmx-user">
                <div className="cmx-avatar">{initials}</div>
                <span className="cmx-user-name">{user?.firstName ?? 'Player'}</span>
              </div>
              <button onClick={handleLogout} className="cmx-logout">Logout</button>
            </>
          ) : (
            <div className="cmx-auth-btns">
              <Link to="/login" className="cmx-btn cmx-btn-ghost">Login</Link>
              <Link to="/register" className="cmx-btn cmx-btn-gold">Get Started</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          {isLoggedIn && (
            <button
              className="cmx-burger"
              onClick={() => setIsMenuOpen(o => !o)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <span className={`cmx-burger-bar ${isMenuOpen ? 'cmx-bar-1' : ''}`} />
              <span className={`cmx-burger-bar ${isMenuOpen ? 'cmx-bar-2' : ''}`} />
              <span className={`cmx-burger-bar ${isMenuOpen ? 'cmx-bar-3' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isLoggedIn && (
        <div className={`cmx-mobile ${isMenuOpen ? 'cmx-mobile-open' : ''}`}>
          <div className="cmx-mobile-user">
            <div className="cmx-avatar cmx-avatar-lg">{initials}</div>
            <div className="cmx-mobile-user-info">
              <span className="cmx-mobile-name">{user?.firstName} {user?.lastName}</span>
              {user?.email && <span className="cmx-mobile-email">{user.email}</span>}
            </div>
          </div>
          <nav className="cmx-mobile-nav">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `cmx-mobile-link ${isActive ? 'cmx-mobile-active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
                <span className="cmx-mobile-arrow">›</span>
              </NavLink>
            ))}
          </nav>
          <button onClick={handleLogout} className="cmx-mobile-logout">Logout</button>
        </div>
      )}

      {/* Backdrop */}
      {isMenuOpen && <div className="cmx-backdrop" onClick={() => setIsMenuOpen(false)} />}
    </header>
  );
};

export default Header;
