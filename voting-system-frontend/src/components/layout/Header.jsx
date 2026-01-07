import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import styles from './Header.module.scss';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.navbar}>
          {/* Logo & Brand */}
          <Link to="/dashboard" className={styles.brand}>
            <div className={styles.logo}>V</div>
            <span className={styles.brandName}>VotingSystem</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.nav}>
            <Link to="/dashboard" className={styles.navLink}>
              Dashboard
            </Link>
          </nav>

          {/* User Menu */}
          {isAuthenticated && (
            <div className={styles.userMenu} ref={menuRef}>
              <button 
                className={styles.userButton}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <div className={styles.avatar}>
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className={styles.username}>{user?.username}</span>
                <svg 
                  className={`${styles.chevron} ${isMenuOpen ? styles.chevronOpen : ''}`}
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <>
                  <div className={styles.dropdownBackdrop} onClick={() => setIsMenuOpen(false)} />
                  <div className={styles.dropdown}>
                    {/* User Info */}
                    <div className={styles.dropdownHeader}>
                      <div className={styles.avatarLarge}>
                        {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className={styles.userInfo}>
                        <div className={styles.displayName}>{user?.full_name || user?.username}</div>
                        <div className={styles.userEmail}>{user?.email}</div>
                      </div>
                    </div>
                    
                    <div className={styles.dropdownDivider} />
                    
                    {/* Quick Actions */}
                    <div className={styles.dropdownSection}>
                      <div className={styles.sectionLabel}>Tạo mới</div>
                      <Link 
                        to="/polls/create" 
                        className={styles.dropdownItem}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className={styles.itemIcon}>📊</span>
                        <span>Tạo Bình Chọn</span>
                      </Link>
                    </div>
                    
                    <div className={styles.dropdownDivider} />
                    
                    {/* Account */}
                    <div className={styles.dropdownSection}>
                      <div className={styles.sectionLabel}>Tài khoản</div>
                      <Link 
                        to="/profile" 
                        className={styles.dropdownItem}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className={styles.itemIcon}>👤</span>
                        <span>Hồ sơ</span>
                      </Link>
                      <Link 
                        to="/settings" 
                        className={styles.dropdownItem}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className={styles.itemIcon}>⚙️</span>
                        <span>Cài đặt</span>
                      </Link>
                    </div>
                    
                    <div className={styles.dropdownDivider} />
                    
                    {/* Logout */}
                    <div className={styles.dropdownSection}>
                      <button 
                        onClick={handleLogout}
                        className={`${styles.dropdownItem} ${styles.logoutItem}`}
                      >
                        <span className={styles.itemIcon}>🚪</span>
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Auth Links for non-authenticated users */}
          {!isAuthenticated && (
            <div className={styles.authLinks}>
              <Link to="/login" className={styles.loginLink}>
                Đăng nhập
              </Link>
              <Link to="/register" className={styles.registerLink}>
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;