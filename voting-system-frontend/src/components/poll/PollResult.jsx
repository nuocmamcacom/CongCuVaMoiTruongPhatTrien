import React, { useState } from 'react';
import { pollAPI } from '../../services/api';
import toast from 'react-hot-toast';

// Add CSS animation for shine effect
const styles = `
  @keyframes shine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('poll-results-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'poll-results-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

const PollResults = ({ options, totalVotes, userVotes, canVote, hasVoted, isAnonymous, pollId, pollTitle }) => {
  const [isExporting, setIsExporting] = useState(false);

  // Export Excel functionality
  const handleExportExcel = async () => {
    console.log('Export Excel clicked:', { pollId, pollTitle }); // Debug log
    
    if (!pollId) {
      console.error('No pollId provided to PollResults component'); // Better error log
      toast.error('Không thể xuất Excel: thiếu thông tin poll');
      return;
    }

    setIsExporting(true);
    try {
      const response = await pollAPI.exportToExcel(pollId);
      
      // Create blob and download
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pollTitle || 'poll'}-results.xlsx`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Đã xuất file Excel thành công!');
    } catch (error) {
      console.error('Export Excel error:', error);
      if (error.response?.status === 403) {
        toast.error('Bạn không có quyền xuất file Excel cho poll này');
      } else if (error.response?.status === 404) {
        toast.error('Không tìm thấy poll');
      } else {
        toast.error('Có lỗi xảy ra khi xuất file Excel');
      }
    } finally {
      setIsExporting(false);
    }
  };

  // Calculate max vote count for ranking
  const maxVoteCount = options.length > 0 ? Math.max(...options.map(opt => opt.vote_count)) : 0;

  const getBarColor = (option, isUserVoted) => {
    // Priority 1: User voted - always blue
    if (isUserVoted) {
      return '#3B82F6'; // Blue for user votes
    }
    
    // Priority 2: Highest vote count - green
    if (option.vote_count === maxVoteCount && option.vote_count > 0) {
      return '#10B981'; // Green for winner
    }
    
    // Priority 3: Has votes but not winner - orange
    if (option.vote_count > 0) {
      return '#F59E0B'; // Orange for participated
    }
    
    // Default: No votes - light gray
    return '#E5E7EB'; // Light gray for no votes
  };

  const getBarWidth = (voteCount) => {
    if (totalVotes === 0) return '0%';
    const percentage = (voteCount / totalVotes) * 100;
    return `${percentage}%`;
  };

  return (
    <div className="card" style={{ padding: 'var(--space-8)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
          Kết quả bình chọn
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
            Tổng số phiếu: <span style={{ fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)', fontSize: 'var(--text-lg)' }}>{totalVotes}</span>
          </div>
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-3) var(--space-4)',
              background: isExporting ? '#94A3B8' : '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              cursor: isExporting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
            }}
            onMouseOver={(e) => {
              if (!isExporting) {
                e.target.style.background = '#059669';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.3)';
              }
            }}
            onMouseOut={(e) => {
              if (!isExporting) {
                e.target.style.background = '#10B981';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.2)';
              }
            }}
          >
            {isExporting ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
                </svg>
                Đang xuất...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z M11,4H13V7H16L11,2V4Z"/>
                </svg>
                Xuất Excel
              </>
            )}
          </button>
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
            .map((option, index) => {
              const isUserVoted = userVotes.includes(option.option_id);
              const isWinner = option.vote_count === maxVoteCount && option.vote_count > 0;
              
              return (
                <div key={option.option_id} style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      {isWinner && (
                        <span style={{ fontSize: 'var(--text-lg)' }}>🏆</span>
                      )}
                      {isUserVoted && (
                        <span style={{ fontSize: 'var(--text-sm)', color: '#3B82F6' }}>✓</span>
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
                  height: '16px', 
                  background: '#F3F4F6', 
                  borderRadius: '8px', 
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1px solid #E5E7EB'
                }}>
                  {option.vote_count > 0 && (
                    <div
                      style={{
                        height: '100%',
                        background: getBarColor(option, isUserVoted),
                        borderRadius: '8px',
                        width: getBarWidth(option.vote_count),
                        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: isUserVoted 
                          ? '0 0 16px rgba(59, 130, 246, 0.5)' 
                          : isWinner 
                          ? '0 0 12px rgba(16, 185, 129, 0.3)'
                          : '0 2px 4px rgba(0, 0, 0, 0.1)',
                        position: 'relative'
                      }}
                    >
                      {/* Shine effect for winners */}
                      {isWinner && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                          animation: 'shine 2s infinite'
                        }} />
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PollResults;