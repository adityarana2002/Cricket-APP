import React, { useState } from 'react';
import apiClient from '../../services/api';
import './RegisterPage.css';

interface RegisterFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  country: string;
}

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    country: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/register', formData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-overlay" />

      <div className="register-card">
        {/* Brand */}
        <div className="brand-header">
          <span className="brand-icon">🏏</span>
          <h1 className="brand-name">CricMax</h1>
          <p className="brand-tagline">Master the Game</p>
        </div>
        <div className="brand-divider" />

        <h2 className="form-title">Create Your Account</h2>

        {error && (
          <div className="error-message">
            <span>⚠</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
                required
                autoComplete="given-name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last name"
                required
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="country">Country</label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
            >
              <option value="">Select your country</option>
              <option value="India">🇮🇳 India</option>
              <option value="Australia">🇦🇺 Australia</option>
              <option value="England">🏴󠁧󠁢󠁥󠁮󠁧󠁿 England</option>
              <option value="Pakistan">🇵🇰 Pakistan</option>
              <option value="New Zealand">🇳🇿 New Zealand</option>
              <option value="South Africa">🇿🇦 South Africa</option>
              <option value="West Indies">🏏 West Indies</option>
              <option value="Sri Lanka">🇱🇰 Sri Lanka</option>
              <option value="Bangladesh">🇧🇩 Bangladesh</option>
              <option value="Afghanistan">🇦🇫 Afghanistan</option>
              <option value="Other">🌍 Other</option>
            </select>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" />
                Creating account…
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <a href="/login">Sign in instead</a></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
