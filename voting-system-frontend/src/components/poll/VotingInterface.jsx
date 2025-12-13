import React, { useState } from 'react';

const VotingInterface = ({ options, pollType, onVote, voting }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [error, setError] = useState('');

  const handleOptionSelect = (optionId) => {
    if (voting) return;
    if (pollType === 'single') {
      setSelectedOptions([optionId]);
    } else {
      setSelectedOptions((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
    }
    setError('');
  };

  const handleSubmitVote = () => {
    if (selectedOptions.length === 0) {
      setError('Vui lòng chọn ít nhất một đáp án');
      return;
    }
    onVote(
      pollType === 'single'
        ? selectedOptions[0]
        : selectedOptions
    );
  };

  return (
    <div className="card" style={{ padding: 'var(--space-8)' }}>
      <h2 style={{ 
        fontSize: 'var(--text-2xl)', 
        fontWeight: 'var(--font-semibold)', 
        color: 'var(--text-primary)', 
        marginBottom: 'var(--space-6)'
      }}>
        {pollType === 'single' ? 'Chọn một đáp án:' : 'Chọn các đáp án (có thể chọn nhiều):'}
      </h2>
      
      {error && (
        <div style={{ 
          marginBottom: 'var(--space-6)', 
          padding: 'var(--space-4)', 
          background: 'var(--error-light)', 
          border: '1px solid var(--error)', 
          borderRadius: 'var(--radius-md)', 
          color: 'var(--error)',
          fontSize: 'var(--text-sm)'
        }}>
          {error}
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        {options.map((option) => (
          <div
            key={option.option_id}
            onClick={() => handleOptionSelect(option.option_id)}
            style={{
              padding: 'var(--space-5)',
              border: `2px solid ${selectedOptions.includes(option.option_id) ? 'var(--primary-500)' : 'var(--secondary-200)'}`,
              borderRadius: 'var(--radius-lg)',
              background: selectedOptions.includes(option.option_id) ? 'var(--primary-50)' : 'var(--bg-white)',
              cursor: voting ? 'not-allowed' : 'pointer',
              opacity: voting ? 0.5 : 1,
              transition: 'var(--transition-all)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)'
            }}
            onMouseEnter={(e) => {
              if (!voting) {
                e.currentTarget.style.borderColor = selectedOptions.includes(option.option_id) 
                  ? 'var(--primary-600)' 
                  : 'var(--secondary-300)';
              }
            }}
            onMouseLeave={(e) => {
              if (!voting) {
                e.currentTarget.style.borderColor = selectedOptions.includes(option.option_id) 
                  ? 'var(--primary-500)' 
                  : 'var(--secondary-200)';
              }
            }}
          >
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: `2px solid ${selectedOptions.includes(option.option_id) ? 'var(--primary-500)' : 'var(--secondary-300)'}`,
              background: selectedOptions.includes(option.option_id) ? 'var(--primary-500)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'var(--transition-all)'
            }}>
              {selectedOptions.includes(option.option_id) && (
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'white'
                }} />
              )}
            </div>
            <span style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-medium)',
              color: selectedOptions.includes(option.option_id) ? 'var(--primary-700)' : 'var(--text-primary)'
            }}>
              {option.option_text}
            </span>
          </div>
        ))}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={handleSubmitVote}
          disabled={voting}
          className="btn-primary"
          style={{ 
            padding: 'var(--space-4) var(--space-10)',
            fontSize: 'var(--text-lg)',
            minWidth: '200px'
          }}
        >
          {voting ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTopColor: 'white',
                borderRadius: '50%',
                animation: 'spin 0.6s linear infinite'
              }} />
              <span>Đang bình chọn...</span>
            </div>
          ) : (
            `Bình chọn${selectedOptions.length > 1 ? ` (${selectedOptions.length} lựa chọn)` : ''}`
          )}
        </button>
      </div>
    </div>
  );
};

export default VotingInterface;