import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FeatureSuggestions from '../components/FeatureSuggestions';
import './HomePage.css';

const HomePage: React.FC = () => {
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  
  const features = [
    {
      icon: '🏏',
      title: 'Live Scoring',
      description: 'Score matches ball-by-ball with real-time updates and over summaries'
    },
    {
      icon: '📊',
      title: 'Detailed Scorecards',
      description: 'Full batting and bowling scorecards saved automatically after every match'
    },
    {
      icon: '🌙',
      title: 'Dark & Light Mode',
      description: 'Professional dark and light themes — switch any time during a match'
    },
    {
      icon: '⚡',
      title: 'Instant Setup',
      description: 'Create a local match in seconds and start scoring right away'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeatureIndex((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-down">
              🏏 Cricket App
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 animate-fade-in-up">
              Your Ultimate Cricket Match Management Platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-100">
              {!isLoggedIn ? (
                <>
                  <Link 
                    to="/login" 
                    className="bg-white text-blue-900 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-900 font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <Link 
                  to="/dashboard" 
                  className="bg-white text-blue-900 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg w-fit"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Suggestions */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <FeatureSuggestions />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Powerful Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage cricket matches, teams, and players in one place
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`bg-white rounded-xl shadow-lg p-6 transition-all duration-500 transform hover:scale-105 hover:shadow-xl border-2 ${
                  index === currentFeatureIndex ? 'border-blue-500' : 'border-transparent'
                }`}
              >
                <div className="text-4xl mb-4 text-center">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">{feature.title}</h3>
                <p className="text-gray-600 text-center">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="text-5xl mb-4">🏏</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Scoring in Seconds</h2>
          <p className="text-xl opacity-90 mb-8 max-w-xl mx-auto">
            No setup required. Create a match, add players, and score ball-by-ball instantly.
          </p>
          {!isLoggedIn ? (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="/register" className="bg-white text-blue-900 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105">
                Get Started Free
              </a>
              <a href="/login" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-900 font-bold py-3 px-8 rounded-lg transition-all duration-300">
                Sign In
              </a>
            </div>
          ) : (
            <a href="/local-matches" className="bg-white text-blue-900 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 inline-block">
              Go to Local Matches
            </a>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Ready to Play?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Create a local match, score it live, and review the full scorecard when it's done.
          </p>
          {!isLoggedIn ? (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Sign In Now
              </Link>
              <Link
                to="/register"
                className="bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold py-3 px-8 rounded-lg transition-all duration-300"
              >
                Create Account
              </Link>
            </div>
          ) : (
            <Link
              to="/local-matches"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 inline-block"
            >
              Go to Local Matches
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
