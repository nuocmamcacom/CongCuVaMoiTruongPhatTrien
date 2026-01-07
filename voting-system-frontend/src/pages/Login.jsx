import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from './Login.module.scss';

const Login = () => {
  const { login, loading, dispatch } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  // Handle Google OAuth callback
  useEffect(() => {
    const token = searchParams.get('token');
    const user = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      if (error === 'auth_error') {
        toast.error('Lỗi xác thực Google. Vui lòng thử lại.');
      } else if (error === 'auth_failed') {
        toast.error('Đăng nhập Google thất bại. Vui lòng thử lại.');
      }
      return;
    }

    if (token && user) {
      try {
        const userData = JSON.parse(decodeURIComponent(user));
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { token, user: userData }
        });
        toast.success(`Chào mừng ${userData.full_name}!`);
        navigate('/dashboard');
      } catch (error) {
        toast.error('Có lỗi khi xử lý đăng nhập Google');
      }
    }
  }, [searchParams, dispatch, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const result = await login(formData);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      // Error handled in login function
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`;
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.container}>
        {/* Left Panel - Branding */}
        <div className={styles.brandPanel}>
          <div className={styles.brandLogo}>
            <div className={styles.logoIcon}>V</div>
            <span className={styles.logoText}>VotingSystem</span>
          </div>
          
          <h1 className={styles.brandTitle}>
            Nền tảng bình chọn<br />thời gian thực
          </h1>
          <p className={styles.brandDesc}>
            Tạo bình chọn, thu thập ý kiến và xem kết quả theo thời gian thực một cách dễ dàng và hiệu quả.
          </p>

          <div className={styles.brandFeatures}>
            <div className={styles.feature}>
              <span className={styles.featureCheck}>✓</span>
              Kết quả cập nhật theo thời gian thực
            </div>
            <div className={styles.feature}>
              <span className={styles.featureCheck}>✓</span>
              Hỗ trợ đa dạng loại câu hỏi
            </div>
            <div className={styles.feature}>
              <span className={styles.featureCheck}>✓</span>
              Xuất báo cáo Excel chi tiết
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className={styles.formPanel}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Đăng nhập</h2>
            <p className={styles.formSubtitle}>Chào mừng bạn quay trở lại</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label htmlFor="username" className={styles.label}>
                Tên đăng nhập
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={formData.username}
                onChange={handleChange}
                className={styles.input}
                placeholder="Nhập tên đăng nhập hoặc email"
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={styles.input}
                placeholder="Nhập mật khẩu"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading ? (
                <>
                  <span className={styles.spinner}></span>
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          <div className={styles.divider}>
            <span className={styles.dividerText}>hoặc</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className={styles.googleBtn}
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Tiếp tục với Google
          </button>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              Chưa có tài khoản?
              <Link to="/register" className={styles.footerLink}>
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;