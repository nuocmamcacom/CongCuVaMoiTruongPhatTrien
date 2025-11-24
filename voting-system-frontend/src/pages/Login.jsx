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
    
    console.log('Login credentials:', formData); // Debug log
    
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
      console.error('Login error:', error);
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