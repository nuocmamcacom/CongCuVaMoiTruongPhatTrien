import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pollAPI } from '../services/api';
import { useAuth } from "../contexts/AuthContext.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import socketService from '../services/socket';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button/Button.tsx';
import styles from './Dashboard.module.scss';

const Dashboard = () => {
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        loadPolls();

        socketService.connect();
        socketService.onNewPoll((newPoll) => {
            if (!newPoll.poll_id || isNaN(newPoll.poll_id)) {
                console.error('Invalid newPoll poll_id:', newPoll.poll_id);
                return;
            }
            setPolls(prev => [newPoll, ...prev]);
            toast.success(`Bình chọn mới: ${newPoll.title}`);
        });

        return () => {
            socketService.off('new-poll');
            socketService.disconnect();
        };
    }, []);

    const loadPolls = async () => {
  try {
    setLoading(true);
    const response = await pollAPI.getPolls();
    console.log('Polls response full:', response); // Log toàn bộ response
    console.log('Polls data:', response.data); // Log data thô
    // Xử lý cả trường hợp response.data là mảng hoặc object có data
    const pollData = Array.isArray(response.data) ? response.data : response.data.data || response.data;
    console.log('Processed pollData:', pollData); // Log sau xử lý
    // Log từng phần tử để kiểm tra định dạng
    pollData.forEach((poll, index) => {
      console.log(`Poll ${index}:`, poll);
    });
    const validPolls = pollData.filter(poll => poll && poll.poll_id && !isNaN(poll.poll_id));
    console.log('Valid polls after filter:', validPolls); // Log sau filter
    if (validPolls.length === 0) {
      console.warn('No valid polls found after filter. Raw data:', pollData);
    }
    setPolls(validPolls);
  } catch (error) {
    const message = error.response?.data?.message || 'Không thể tải danh sách bình chọn';
    console.error('Poll fetch error:', error.response?.data || error.message);
    setError(message);
    toast.error(message);
  } finally {
    setLoading(false);
  }
};

  const getFilteredPolls = () => {
        const now = new Date();
        return polls.filter(poll => {
            switch (filter) {
                case 'active':
                    return poll.is_active && (!poll.end_time || new Date(poll.end_time) > now);
                case 'closed':
                    return !poll.is_active || (poll.end_time && new Date(poll.end_time) <= now);
                case 'created':
                    return poll.is_creator === 1;
                default:
                    return true;
            }
        });
    };

  const getTabCounts = () => {
    const now = new Date();
    return {
      all: polls.length,
      active: polls.filter(p => p.is_active && (!p.end_time || new Date(p.end_time) > now)).length,
      closed: polls.filter(p => !p.is_active || (p.end_time && new Date(p.end_time) <= now)).length,
      created: polls.filter(p => p.is_creator === 1).length,
    };
  };

  const filteredPolls = getFilteredPolls();
  const tabCounts = getTabCounts();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        {/* Page Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div>
              <h1 className={styles.title}>Dashboard</h1>
              <p className={styles.subtitle}>
                Quản lý và theo dõi các cuộc bình chọn của bạn
              </p>
            </div>
            <Link to="/polls/create">
              <Button variant="primary" size="md">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
                </svg>
                Tạo bình chọn mới
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'var(--primary-50)', color: 'var(--primary)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>Tổng số bình chọn</div>
              <div className={styles.statValue}>{polls.length}</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'var(--success-50)', color: 'var(--success)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>Đang hoạt động</div>
              <div className={styles.statValue}>{polls.filter(p => p.status === 'active').length}</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'var(--warning-50)', color: 'var(--warning)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>Của tôi</div>
              <div className={styles.statValue}>{polls.filter(p => p.created_by === user?.user_id).length}</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'var(--error-50)', color: 'var(--error)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>
              </svg>
            </div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>Đã kết thúc</div>
              <div className={styles.statValue}>{polls.filter(p => p.status === 'completed').length}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.filterTabs}>
            <button 
              className={`${styles.filterTab} ${filter === 'all' ? styles.active : ''}`}
              onClick={() => setFilter('all')}
            >
              Tất cả
            </button>
            <button 
              className={`${styles.filterTab} ${filter === 'active' ? styles.active : ''}`}
              onClick={() => setFilter('active')}
            >
              Đang hoạt động
            </button>
            <button 
              className={`${styles.filterTab} ${filter === 'my' ? styles.active : ''}`}
              onClick={() => setFilter('my')}
            >
              Của tôi
            </button>
            <button 
              className={`${styles.filterTab} ${filter === 'completed' ? styles.active : ''}`}
              onClick={() => setFilter('completed')}
            >
              Đã kết thúc
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {error && (
            <div className={styles.error}>
              <p>{error}</p>
              <Button variant="outline" size="sm" onClick={loadPolls}>
                Thử lại
              </Button>
            </div>
          )}

          {filteredPolls.length === 0 && !error ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="currentColor">
                  <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm-4 30L10 24l2.83-2.83L20 28.34l15.17-15.17L38 16 20 34z"/>
                </svg>
              </div>
              <h3 className={styles.emptyTitle}>
                {filter === 'all' ? 'Chưa có bình chọn nào' : 
                 filter === 'my' ? 'Bạn chưa tạo bình chọn nào' :
                 filter === 'active' ? 'Không có bình chọn đang hoạt động' :
                 'Không có bình chọn đã kết thúc'}
              </h3>
              <p className={styles.emptyText}>
                Hãy tạo cuộc bình chọn đầu tiên để bắt đầu thu thập ý kiến từ cộng đồng
              </p>
              <Link to="/polls/create">
                <Button variant="primary" size="md">
                  Tạo bình chọn mới
                </Button>
              </Link>
            </div>
          ) : (
            <div className={styles.pollsGrid}>
              {filteredPolls.map(poll => (
                <PollCard key={poll.poll_id} poll={poll} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Modern Poll Card Component
const PollCard = ({ poll }) => {
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'var(--success)';
      case 'completed': return 'var(--secondary-400)';
      case 'draft': return 'var(--warning)';
      default: return 'var(--secondary-400)';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Đang hoạt động';
      case 'completed': return 'Đã kết thúc';
      case 'draft': return 'Nháp';
      default: return 'Không xác định';
    }
  };

  return (
    <Link to={`/polls/${poll.poll_id}`} className={styles.pollCard}>
      <div className={styles.cardHeader}>
        <div 
          className={styles.statusBadge}
          style={{ 
            background: `${getStatusColor(poll.status)}20`,
            color: getStatusColor(poll.status)
          }}
        >
          {getStatusText(poll.status)}
        </div>
        <div className={styles.cardMenu}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
          </svg>
        </div>
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{poll.title}</h3>
        <p className={styles.cardDescription}>
          {poll.description || 'Không có mô tả'}
        </p>
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.cardMeta}>
          <span className={styles.metaItem}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M7 0a7 7 0 1 0 0 14A7 7 0 0 0 7 0ZM3.5 7a.5.5 0 0 1 .5-.5h2.5V4a.5.5 0 0 1 1 0v3a.5.5 0 0 1-.5.5H4a.5.5 0 0 1-.5-.5Z"/>
            </svg>
            {formatDate(poll.created_at)}
          </span>
          <span className={styles.metaItem}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M7 2a5 5 0 1 0 0 10A5 5 0 0 0 7 2ZM5.5 5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0ZM9.5 5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0ZM7 8.5A1.5 1.5 0 0 1 5.5 7h3A1.5 1.5 0 0 1 7 8.5Z"/>
            </svg>
            {poll.total_votes || 0} lượt bình chọn
          </span>
        </div>
      </div>
    </Link>
  );
};

export default Dashboard;