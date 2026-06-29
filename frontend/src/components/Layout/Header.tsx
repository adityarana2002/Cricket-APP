import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const user = localStorage.getItem('user');
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Navigation items
  const navItems = [
    { name: 'Local Matches', path: '/local-matches' },
    { name: 'Profile', path: '/profile' },
  ];

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <div className="logo">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🏏</span>
            <span className="font-bold text-xl">Cricket App</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="auth-buttons">
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-sm">
                <span className="text-gray-700">Welcome, </span>
                <span className="font-semibold text-blue-600">
                  {user ? JSON.parse(user).firstName : 'User'}
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-300"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex space-x-3">
              <Link 
                to="/login" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-300"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg transition-colors duration-300"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden text-gray-700"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className="text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
