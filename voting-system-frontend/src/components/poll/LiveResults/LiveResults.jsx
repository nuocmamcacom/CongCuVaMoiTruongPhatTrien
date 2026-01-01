import React, { useState, useEffect } from 'react';
import Card from '../../common/ui/Card/Card.jsx';
import BarChart from '../../common/charts/BarChart/BarChart.jsx';
import Button from '../../ui/Button/Button.tsx';
import './LiveResults.scss';

// Mock data generator
const generateMockVote = (options) => {
  const randomOption = options[Math.floor(Math.random() * options.length)];
  const voters = [
    'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Minh Cường', 'Phạm Thị Dung',
    'Hoàng Văn Em', 'Đỗ Thị Giang', 'Vũ Minh Hải', 'Đinh Thị Lan',
    'Bùi Văn Long', 'Cao Thị Mai', 'Đặng Minh Nam', 'Lý Thị Oanh'
  ];
  
  return {
    id: Date.now(),
    voter: voters[Math.floor(Math.random() * voters.length)],
    option: randomOption.label,
    optionId: randomOption.id,
    timestamp: new Date(),
  };
};

const LiveResults = () => {
  const [pollData] = useState({
    title: 'Bạn thích ngôn ngữ lập trình nào nhất?',
    description: 'Khảo sát về sở thích công nghệ trong team phát triển',
    totalVotes: 0,
    isActive: true,
  });

  const [options, setOptions] = useState([
    { id: 1, label: 'JavaScript', value: 45, color: '#F7DF1E' },
    { id: 2, label: 'Python', value: 38, color: '#3776AB' },
    { id: 3, label: 'Java', value: 22, color: '#ED8B00' },
    { id: 4, label: 'C#', value: 15, color: '#239120' },
    { id: 5, label: 'Go', value: 8, color: '#00ADD8' },
  ]);

  const [recentVotes, setRecentVotes] = useState([]);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate real-time votes
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // Generate new vote every 2-4 seconds
      const newVote = generateMockVote(options);
      
      // Update vote counts
      setOptions(prev => prev.map(option => 
        option.id === newVote.optionId 
          ? { ...option, value: option.value + 1 }
          : option
      ));

      // Add to recent votes feed
      setRecentVotes(prev => [newVote, ...prev.slice(0, 9)]);
      setLastUpdate(new Date());
      
    }, Math.random() * 2000 + 2000); // 2-4 seconds

    return () => clearInterval(interval);
  }, [isLive, options]);

  const totalVotes = options.reduce((sum, option) => sum + option.value, 0);

  const handleToggleLive = () => {
    setIsLive(!isLive);
  };

  const handleExport = () => {
    const data = {
      poll: pollData,
      results: options,
      totalVotes,
      exportTime: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'poll-results.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="live-results">
      <div className="container">
        {/* Header */}
        <div className="live-results__header">
          <div className="live-results__title-section">
            <h1 className="text-h2">{pollData.title}</h1>
            <p className="text-body-large text-muted">{pollData.description}</p>
            <div className="live-results__meta">
              <span className={`live-results__status ${isLive ? 'live-results__status--live' : 'live-results__status--paused'}`}>
                {isLive ? 'LIVE' : 'TẠMTẬP'}
              </span>
              <span className="live-results__total">{totalVotes} lượt bình chọn</span>
              <span className="live-results__update">Cập nhật lần cuối: {formatTime(lastUpdate)}</span>
            </div>
          </div>
          
          <div className="live-results__actions">
            <Button variant="secondary" onClick={handleToggleLive}>
              {isLive ? 'Tạm dừng Live' : 'Bật Live'}
            </Button>
            <Button variant="ghost" onClick={handleExport}>
              Xuất kết quả
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="live-results__content">
          {/* Chart Section */}
          <div className="live-results__chart-section">
            <Card variant="elevated" padding="lg">
              <div className="card__header">
                <h3 className="card__title">Kết quả bình chọn</h3>
                <div className="live-results__chart-controls">
                  <span className="text-caption">Tự động cập nhật</span>
                </div>
              </div>
              
              <BarChart 
                data={options} 
                animated={true} 
                height={400}
                className="live-results__chart"
              />
            </Card>
          </div>

          {/* Vote Feed */}
          <div className="live-results__feed-section">
            <Card variant="default" padding="lg">
              <div className="card__header">
                <h3 className="card__title">Hoạt động gần đây</h3>
                <div className={`live-results__feed-indicator ${isLive ? 'live-results__feed-indicator--active' : ''}`}>
                  {isLive && <span className="live-results__pulse"></span>}
                  <span className="text-caption">{isLive ? 'Đang cập nhật' : 'Đã tạm dừng'}</span>
                </div>
              </div>

              <div className="live-results__feed">
                {recentVotes.length === 0 ? (
                  <div className="live-results__empty">
                    <p className="text-body text-muted">Chưa có hoạt động nào...</p>
                  </div>
                ) : (
                  recentVotes.map(vote => (
                    <div key={vote.id} className="live-results__vote-item">
                      <div className="live-results__vote-content">
                        <div className="live-results__vote-voter">
                          <strong>{vote.voter}</strong>
                        </div>
                        <div className="live-results__vote-action">
                          đã bình chọn cho <span className="live-results__vote-option">"{vote.option}"</span>
                        </div>
                      </div>
                      <div className="live-results__vote-time">
                        {formatTime(vote.timestamp)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="live-results__stats">
          <Card variant="primary" padding="md" className="live-results__stat-card">
            <div className="live-results__stat-value">{totalVotes}</div>
            <div className="live-results__stat-label">Tổng số vote</div>
          </Card>

          <Card variant="elevated" padding="md" className="live-results__stat-card">
            <div className="live-results__stat-value">{options.length}</div>
            <div className="live-results__stat-label">Tùy chọn</div>
          </Card>

          <Card variant="elevated" padding="md" className="live-results__stat-card">
            <div className="live-results__stat-value">
              {options.length > 0 ? Math.max(...options.map(o => o.value)) : 0}
            </div>
            <div className="live-results__stat-label">Vote cao nhất</div>
          </Card>

          <Card variant="elevated" padding="md" className="live-results__stat-card">
            <div className="live-results__stat-value">
              {isLive ? (
                <span className="live-results__live-indicator">●</span>
              ) : (
                '⏸'
              )}
            </div>
            <div className="live-results__stat-label">Trạng thái</div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LiveResults;/ /   C h a r t   a u t o - u p d a t e   v i a   s o c k e t  
 