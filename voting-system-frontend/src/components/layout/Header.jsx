import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import styles from './Header.module.scss';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            <div className={styles.logo}>
              <span className={styles.logoIcon}>📊</span>
            </div>
            <span className={styles.brandName}>VoteHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.nav}>
            <Link to="/dashboard" className={styles.navLink}>
              Dashboard
            </Link>
            <Link to="/polls/create" className={styles.navLink}>
              Tạo bình chọn
            </Link>
          </nav>

          {/* User Menu */}
          {isAuthenticated && (
            <div className={styles.userMenu}>
              <button 
                className={styles.userButton}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <div className={styles.avatar}>
                  <span>{user?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
                </div>
                <span className={styles.username}>{user?.username}</span>
                <svg 
                  className={`${styles.chevron} ${isMenuOpen ? styles.open : ''}`}
                  width="16" 
                  height="16" 
                  viewBox="0 0 16 16"
                >
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <div className={styles.userInfo}>
                      <div className={styles.avatarLarge}>
                        <span>{user?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
                      </div>
                      <div>
                        <div className={styles.displayName}>{user?.username}</div>
                        <div className={styles.userEmail}>{user?.email}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.dropdownDivider} />
                  
                  <div className={styles.dropdownBody}>
                    <Link to="/profile" className={styles.dropdownItem}>
                      <span>Hồ sơ</span>
                    </Link>
                    <Link to="/settings" className={styles.dropdownItem}>
                      <span>Cài đặt</span>
                    </Link>
                  </div>
                  
                  <div className={styles.dropdownDivider} />
                  
                  <div className={styles.dropdownBody}>
                    <button 
                      onClick={handleLogout}
                      className={styles.dropdownItem}
                    >
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button 
            className={styles.mobileMenuButton}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path 
                d="M3 12h18M3 6h18M3 18h18" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;