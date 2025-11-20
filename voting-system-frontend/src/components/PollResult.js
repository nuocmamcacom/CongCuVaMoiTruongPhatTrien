import React from 'react';

const PollResults = ({ options, totalVotes, userVotes, canVote, hasVoted, isAnonymous }) => {
  const getBarColor = (optionId) => {
    if (userVotes.includes(optionId)) {
      return 'bg-primary-500';
    }
    return 'bg-gray-300';
  };

  const getBarWidth = (voteCount) => {
    if (totalVotes === 0) return '0%';
    return `${(voteCount / totalVotes) * 100}%`;
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Kết quả bình chọn</h2>
        <div className="text-sm text-gray-500">
          Tổng số phiếu: <span className="font-medium text-gray-900">{totalVotes}</span>
        </div>
      </div>

      {hasVoted && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-green-800 font-medium">Bạn đã bình chọn thành công!</span>
          </div>
        </div>
      )}

      {!Array.isArray(options) || options.length === 0 ? (
        <div className="text-center text-gray-500">Chưa có lựa chọn nào cho bình chọn này.</div>
      ) : totalVotes === 0 ? (
        <div className="text-center text-gray-500">Chưa có phiếu bầu nào.</div>
      ) : (
        <div className="space-y-4">
          {options
            .sort((a, b) => b.vote_count - a.vote_count) // Sort by vote count descending
            .map((option, index) => (
              <div key={option.option_id} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {index === 0 && option.vote_count > 0 && (
                      <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.902 0l-2.8 2.034c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.8 7.03c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                      </svg>
                    )}
                    <span className="text-lg font-bold text-gray-800">{option.option_text}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div
                    className={`h-6 rounded-full ${getBarColor(option.option_id)} transition-all duration-500 ease-in-out`}
                    style={{ width: getBarWidth(option.vote_count) }}
                  ></div>
                </div>
                <div className="absolute right-0 top-0 h-6 flex items-center pr-2 text-sm font-medium text-gray-700">
                  {option.vote_count} phiếu
                  {totalVotes > 0 && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({((option.vote_count / totalVotes) * 100).toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default PollResults;