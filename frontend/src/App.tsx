import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Layout/Header';
import SplashScreen from './components/SplashScreen';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import LocalMatchPage from './pages/LocalMatchPage';
import './App.css';

interface PrivateRouteProps {
  element: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  const isLoggedIn = !!localStorage.getItem('token');
  return isLoggedIn ? element : <Navigate to="/login" replace />;
};

function App() {
  const isLoggedIn = !!localStorage.getItem('token');

  // Show the cricket launch animation once per app launch (each fresh open /
  // PWA relaunch starts a new session). In-session refreshes skip it.
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    try { return !sessionStorage.getItem('cmx_splashShown'); } catch { return true; }
  });

  const handleSplashDone = () => {
    try { sessionStorage.setItem('cmx_splashShown', '1'); } catch { /* ignore */ }
    setShowSplash(false);
  };

  return (
    <Router>
      {showSplash && <SplashScreen onFinish={handleSplashDone} />}
      <div className="app-container">
        {isLoggedIn && <Header />}
        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/local-matches" element={<PrivateRoute element={<LocalMatchPage />} />} />
            <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
            <Route path="/profile" element={<PrivateRoute element={<ProfilePage />} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
