import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import toast from 'react-hot-toast';
import './Register.scss';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors({
      ...errors,
      [e.target.name]: '',
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!/^[a-zA-Z0-9_]{3,}$/.test(formData.username)) {
      newErrors.username = 'Tên đăng nhập chỉ chứa chữ, số, dấu gạch dưới và ít nhất 3 ký tự';
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (formData.full_name.length < 2) {
      newErrors.full_name = 'Họ tên phải có ít nhất 2 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    const { confirmPassword, ...registerData } = formData;
    try {
      const { success, message } = await register(registerData);
      if (success) {
        toast.success('Đăng ký thành công!');
        navigate('/dashboard');
      } else {
        setErrors({ submit: message });
        toast.error(message);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng ký thất bại';
      setErrors({ submit: message });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register">
      <div className="register__container">
        <div className="register__card">
          <div className="register__header">
            <div className="register__logo">
              <div className="register__logo-icon">V</div>
            </div>
            <h1 className="register__title">Create Account</h1>
            <p className="register__subtitle">Join VotingSystem today</p>
          </div>

          {errors.submit && (
            <div className="register__error">
              {errors.submit}
            </div>
          )}

          <form className="register__form" onSubmit={handleSubmit}>
            <div className="register__field">
              <label htmlFor="full_name" className="register__label">
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                className={`register__input ${errors.full_name ? 'register__input--error' : ''}`}
                placeholder="Enter your full name"
                value={formData.full_name}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.full_name && <p className="register__field-error">{errors.full_name}</p>}
            </div>

            <div className="register__field">
              <label htmlFor="username" className="register__label">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className={`register__input ${errors.username ? 'register__input--error' : ''}`}
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.username && <p className="register__field-error">{errors.username}</p>}
            </div>

            <div className="register__field">
              <label htmlFor="email" className="register__label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`register__input ${errors.email ? 'register__input--error' : ''}`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.email && <p className="register__field-error">{errors.email}</p>}
            </div>

            <div className="register__field">
              <label htmlFor="password" className="register__label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`register__input ${errors.password ? 'register__input--error' : ''}`}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.password && <p className="register__field-error">{errors.password}</p>}
            </div>

            <div className="register__field">
              <label htmlFor="confirmPassword" className="register__label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className={`register__input ${errors.confirmPassword ? 'register__input--error' : ''}`}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.confirmPassword && <p className="register__field-error">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`register__button ${loading ? 'register__button--loading' : ''}`}
            >
              {loading ? (
                <>
                  <span className="register__spinner"></span>
                  <span>Creating account...</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="register__footer">
            <p className="register__footer-text">
              Already have an account?{' '}
              <Link to="/login" className="register__footer-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;