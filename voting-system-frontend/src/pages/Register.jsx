import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import toast from 'react-hot-toast';
import styles from './Register.module.scss';

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
    <div className={styles.registerPage}>
      <div className={styles.container}>
        {/* Left Panel - Branding */}
        <div className={styles.brandPanel}>
          <div className={styles.brandLogo}>
            <div className={styles.logoIcon}>V</div>
            <div className={styles.logoText}>VotingSystem</div>
          </div>
          <h1 className={styles.brandTitle}>Tham gia cộng đồng</h1>
          <p className={styles.brandDesc}>Tạo bình chọn, khảo sát và nhận phản hồi từ mọi người chỉ trong vài phút.</p>
        </div>

        {/* Right Panel - Form */}
        <div className={styles.formPanel}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Tạo tài khoản</h2>
            <p className={styles.formSubtitle}>Điền thông tin để bắt đầu</p>
          </div>

          {errors.submit && (
            <div className={styles.errorBox}>
              {errors.submit}
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label htmlFor="full_name" className={styles.label}>
                Họ và tên
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                className={`${styles.input} ${errors.full_name ? styles.inputError : ''}`}
                placeholder="Nhập họ và tên của bạn"
                value={formData.full_name}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.full_name && <span className={styles.errorText}>{errors.full_name}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="username" className={styles.label}>
                Tên đăng nhập
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className={`${styles.input} ${errors.username ? styles.inputError : ''}`}
                placeholder="Chọn một tên đăng nhập"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.username && <span className={styles.errorText}>{errors.username}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                placeholder="Nhập địa chỉ email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.email && <span className={styles.errorText}>{errors.email}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                placeholder="Tạo một mật khẩu mạnh"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.password && <span className={styles.errorText}>{errors.password}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Xác nhận mật khẩu
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
            </button>
          </form>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              Đã có tài khoản?{' '}
              <Link to="/login" className={styles.footerLink}>
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;