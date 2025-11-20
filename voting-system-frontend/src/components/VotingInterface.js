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
    ? Number(selectedOptions[0])  // 👈 ép kiểu cho single
    : selectedOptions.map(Number) // 👈 ép từng phần tử cho multiple
);

  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {pollType === 'single' ? 'Chọn một đáp án:' : 'Chọn các đáp án (có thể chọn nhiều):'}
      </h2>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}
      <div className="space-y-3 mb-6">
        {options.map((option) => (
          <div
            key={option.option_id}
            className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 ${
              selectedOptions.includes(option.option_id)
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            } ${voting ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => handleOptionSelect(option.option_id)}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedOptions.includes(option.option_id)
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-gray-300'
                }`}
              >
                {selectedOptions.includes(option.option_id) && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <p
                className={`text-lg font-medium ${
                  selectedOptions.includes(option.option_id) ? 'text-primary-700' : 'text-gray-900'
                }`}
              >
                {option.option_text}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <button
          onClick={handleSubmitVote}
          disabled={voting}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3 text-lg"
        >
          {voting ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
              Đang bình chọn...
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