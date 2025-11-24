import React from 'react';

const PollResults = ({ options, totalVotes, userVotes, canVote, hasVoted, isAnonymous }) => {
  const getBarColor = (optionId) => {
    if (userVotes.includes(optionId)) {
      return 'var(--primary-500)';
    }
    return 'var(--secondary-200)';
  };

  const getBarWidth = (voteCount) => {
    if (totalVotes === 0) return '0%';
    return `${(voteCount / totalVotes) * 100}%`;
  };

  return (
    <div className="card" style={{ padding: 'var(--space-8)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
          Kết quả bình chọn
        </h2>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
          Tổng số phiếu: <span style={{ fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)', fontSize: 'var(--text-lg)' }}>{totalVotes}</span>
        </div>
      </div>

      {hasVoted && (
        <div style={{ 
          marginBottom: 'var(--space-6)', 
          padding: 'var(--space-4)', 
          background: 'var(--success-light)', 
          border: '1px solid var(--success)', 
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)'
        }}>
          <span style={{ fontSize: 'var(--text-lg)' }}>✓</span>
          <span style={{ color: 'var(--success)', fontWeight: 'var(--font-medium)', fontSize: 'var(--text-sm)' }}>
            Bạn đã bình chọn thành công!
          </span>
        </div>
      )}

      {!Array.isArray(options) || options.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--text-tertiary)' }}>
          Chưa có lựa chọn nào cho bình chọn này.
        </div>
      ) : totalVotes === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--text-tertiary)' }}>
          Chưa có phiếu bầu nào.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {options
            .sort((a, b) => b.vote_count - a.vote_count)
            .map((option, index) => (
              <div key={option.option_id} style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    {index === 0 && option.vote_count > 0 && (
                      <span style={{ fontSize: 'var(--text-lg)' }}>🏆</span>
                    )}
                    <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
                      {option.option_text}
                    </span>
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--text-secondary)' }}>
                    {option.vote_count} phiếu
                    {totalVotes > 0 && (
                      <span style={{ marginLeft: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                        ({((option.vote_count / totalVotes) * 100).toFixed(1)}%)
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '12px', 
                  background: 'var(--secondary-100)', 
                  borderRadius: 'var(--radius-full)', 
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div
                    style={{
                      height: '100%',
                      background: getBarColor(option.option_id),
                      borderRadius: 'var(--radius-full)',
                      width: getBarWidth(option.vote_count),
                      transition: 'width 500ms ease-out',
                      boxShadow: userVotes.includes(option.option_id) ? '0 0 8px rgba(37, 99, 235, 0.3)' : 'none'
                    }}
                  />
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default PollResults;