import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './Header.module.scss';

const Header: React.FC = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const location = useLocation();

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigationItems = [
    { path: '/dashboard', label: 'Home' },
    { path: '/polls/create', label: 'Create Poll' },
    { path: '/polls', label: 'Active Polls' },
  ];

  const isActivePath = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Brand */}
          <div className={styles.brand}>
            <Link to="/dashboard" className={styles.brandLink}>
              <div className={styles.brandIcon}>
                <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path
                    clipRule="evenodd"
                    d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
                    fillRule="evenodd"
                  />
                </svg>
              </div>
              <h1 className={styles.brandTitle}>Realtime Voting</h1>
            </Link>

            {/* Navigation */}
            <nav className={styles.nav}>
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`${styles.navLink} ${isActivePath(item.path) ? styles.active : ''}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            {/* Search */}
            <div className={styles.search}>
              <span className={`material-symbols-outlined ${styles.searchIcon}`}>
                search
              </span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search for polls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Mobile Search Button */}
            <button
              className={styles.mobileSearchButton}
              aria-label="Search"
            >
              <span className="material-symbols-outlined">search</span>
            </button>

            {/* User Menu */}
            {user && (
              <div className={styles.userMenu} ref={userMenuRef}>
                <button
                  className={styles.userMenuButton}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2qXN24qKRQriJ38ZK9fbUy0rWn4lmq-XU8kuBIZvHh93yJ5B7yXy0-Itb5cdNTsI4N_6h0U9b-u8JM8KUY8vy2ye0njquuhCGCYDuBXjhQYctstuFkgmMx9WBO76RTtmoRZK-XYuWsMryjlFzBuvu36eh46gpd55o11y7JAKCG0S0U0qS7AVofaBV-peIvtcupOpdQf9xWWnkpL8BaA4zSrct_o19ZbDnEZ7lfLt9QG8I9J3uyV3efZJxCLhTBwLg2lUaTSfa32SS"
                    alt="User avatar"
                  />
                </button>

                <div className={`${styles.userMenuDropdown} ${isUserMenuOpen ? styles.open : ''}`}>
                  <div className={styles.userMenuProfile}>
                    <div className={styles.userMenuProfileName}>{user.full_name}</div>
                    <div className={styles.userMenuProfileEmail}>{user.email}</div>
                  </div>

                  <Link
                    to="/profile"
                    className={styles.userMenuItem}
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <span className="material-symbols-outlined">person</span>
                    <span className={styles.userMenuItemText}>User Profile</span>
                  </Link>

                  <Link
                    to="/settings"
                    className={styles.userMenuItem}
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <span className="material-symbols-outlined">settings</span>
                    <span className={styles.userMenuItemText}>Account Settings</span>
                  </Link>

                  <Link
                    to="/help"
                    className={styles.userMenuItem}
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <span className="material-symbols-outlined">help</span>
                    <span className={styles.userMenuItemText}>Help/Support</span>
                  </Link>

                  <button
                    className={`${styles.userMenuItem} ${styles.danger}`}
                    onClick={handleLogout}
                  >
                    <span className="material-symbols-outlined">logout</span>
                    <span className={styles.userMenuItemText}>Logout</span>
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className={styles.mobileMenuButton}
              aria-label="Open navigation menu"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;