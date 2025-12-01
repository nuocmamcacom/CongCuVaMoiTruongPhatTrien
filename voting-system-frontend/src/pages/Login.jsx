import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import './Login.scss';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '', // Backend expects 'username', not 'email'
    password: ''
  });

  // Method 1: Using controlled inputs (Recommended)
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.username || !formData.password) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const result = await login(formData);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
    }
  };

  return (
    <div className="login">
      <div className="login__container">
        <div className="login__card">
          <div className="login__header">
            <div className="login__logo">
              <div className="login__logo-icon">V</div>
            </div>
            <h1 className="login__title">Welcome Back</h1>
            <p className="login__subtitle">Sign in to continue to VotingSystem</p>
          </div>

          <form className="login__form" onSubmit={handleSubmit}>
            <div className="login__field">
              <label htmlFor="username" className="login__label">
                Username or Email
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="login__input"
                placeholder="Enter your username or email"
              />
            </div>

            <div className="login__field">
              <label htmlFor="password" className="login__label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="login__input"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`login__button ${loading ? 'login__button--loading' : ''}`}
            >
              {loading ? (
                <>
                  <span className="login__spinner"></span>
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="login__divider">
            <span className="login__divider-text">or</span>
          </div>

          <button
            type="button"
            onClick={() => alert('Google login coming soon!')}
            className="login__google-button"
          >
            <svg className="login__google-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="login__footer">
            <p className="login__footer-text">
              Don't have an account?{' '}
              <Link to="/register" className="login__footer-link">
                Sign up now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;