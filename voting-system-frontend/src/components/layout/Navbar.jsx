import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import './Navbar.scss';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsProfileOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar__container">
        <div className="navbar__content">
          <Link to="/dashboard" className="navbar__brand">
            <div className="navbar__logo">
              <span className="navbar__logo-text">V</span>
            </div>
            <span className="navbar__title">VoteHub</span>
          </Link>

          <div className="navbar__nav">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="navbar__link">
                  Dashboard
                </Link>
                <Link to="/polls/create" className="navbar__link navbar__link--primary">
                  Tạo bình chọn
                </Link>
                
                <div className="navbar__profile">
                  <button
                    className="navbar__profile-btn"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                  >
                    <div className="navbar__avatar">
                      {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="navbar__username">{user?.full_name}</span>
                    <span className={`navbar__arrow ${isProfileOpen ? 'navbar__arrow--open' : ''}`}>
                      ▼
                    </span>
                  </button>

                  {isProfileOpen && (
                    <div className="navbar__dropdown">
                      <div className="navbar__dropdown-header">
                        <div className="navbar__dropdown-name">{user?.full_name}</div>
                        <div className="navbar__dropdown-email">{user?.email}</div>
                      </div>
                      <div className="navbar__dropdown-divider"></div>
                      <button onClick={handleLogout} className="navbar__dropdown-item navbar__dropdown-item--danger">
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="navbar__link">
                  Đăng nhập
                </Link>
                <Link to="/register" className="navbar__link navbar__link--primary">
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          <button
            className="navbar__toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className={`navbar__burger ${isMenuOpen ? 'navbar__burger--open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>

        {isMenuOpen && (
          <div className="navbar__mobile">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="navbar__mobile-link" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/polls/create" className="navbar__mobile-link" onClick={() => setIsMenuOpen(false)}>
                  Tạo bình chọn
                </Link>
                <div className="navbar__mobile-user">{user?.full_name}</div>
                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="navbar__mobile-link navbar__mobile-link--danger">
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="navbar__mobile-link" onClick={() => setIsMenuOpen(false)}>
                  Đăng nhập
                </Link>
                <Link to="/register" className="navbar__mobile-link" onClick={() => setIsMenuOpen(false)}>
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;