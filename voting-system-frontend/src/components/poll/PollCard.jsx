import React from 'react';
import { Link } from 'react-router-dom';

const PollCard = ({ poll }) => {
  const isActive = poll.is_active && (!poll.end_time || new Date(poll.end_time) > new Date());
  const isCreator = poll.is_creator === 1;

  const getStatusBadge = () => {
    if (!poll.is_active) {
      return <span className="badge" style={{ background: 'var(--secondary-100)', color: 'var(--text-secondary)' }}>Đã đóng</span>;
    }
    if (poll.end_time && new Date(poll.end_time) <= new Date()) {
      return <span className="badge" style={{ background: 'var(--error-light)', color: 'var(--error)' }}>Hết hạn</span>;
    }
    return <span className="badge badge-success">Đang diễn ra</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div 
      className="card" 
      style={{ 
        padding: 'var(--space-6)',
        transition: 'var(--transition-all)',
        cursor: 'pointer'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-4)', gap: 'var(--space-4)' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ 
            fontSize: 'var(--text-xl)', 
            fontWeight: 'var(--font-semibold)', 
            color: 'var(--text-primary)', 
            marginBottom: 'var(--space-2)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {poll.title}
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
            Tạo bởi: <span style={{ fontWeight: 'var(--font-medium)', color: 'var(--text-secondary)' }}>{poll.creator_name}</span>
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', alignItems: 'flex-end' }}>
          {getStatusBadge()}
          {isCreator && (
            <span className="badge badge-info" style={{ fontSize: 'var(--text-xs)' }}>
              Của tôi
            </span>
          )}
        </div>
      </div>

      {poll.description && (
        <p style={{ 
          fontSize: 'var(--text-sm)', 
          color: 'var(--text-secondary)', 
          marginBottom: 'var(--space-4)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          lineHeight: 'var(--leading-relaxed)'
        }}>
          {poll.description}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span>Loại:</span>
          <span style={{ fontWeight: 'var(--font-medium)', color: 'var(--text-secondary)' }}>
            {poll.poll_type === 'single' ? 'Chọn 1' : 'Chọn nhiều'}
          </span>
        </div>
        {poll.is_anonymous && (
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
            Bình chọn ẩn danh
          </div>
        )}
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
          Tạo: {formatDate(poll.created_at)}
        </div>
        {poll.end_time && (
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
            Kết thúc: {formatDate(poll.end_time)}
          </div>
        )}
        {poll.participants_count != null && (
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
            Người tham gia: {poll.participants_count}
          </div>
        )}
      </div>

      <div style={{ paddingTop: 'var(--space-4)', borderTop: '1px solid var(--secondary-100)' }}>
        <Link 
          to={`/polls/${poll.poll_id}`} 
          className="btn-primary"
          style={{ 
            width: '100%',
            textDecoration: 'none',
            fontSize: 'var(--text-sm)',
            padding: 'var(--space-2) var(--space-4)',
            justifyContent: 'center'
          }}
        >
          {isActive && !poll.has_voted ? 'Tham gia bình chọn' : 'Xem chi tiết'}
        </Link>
      </div>
    </div>
  );
};

export default PollCard;