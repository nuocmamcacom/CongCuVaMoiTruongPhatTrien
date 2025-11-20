import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pollAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import PollCard from '../components/PollCard';
import socketService from '../services/socket';
import toast from 'react-hot-toast';

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
    return <LoadingSpinner text="Đang tải danh sách bình chọn..." />;
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Xin chào <span className="font-medium text-primary-600">{user?.full_name}</span>!
            Quản lý các phiên bình chọn của bạn.
          </p>
        </div>
        <Link
          to="/polls/create"
          className="mt-4 sm:mt-0 btn-primary inline-flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Tạo bình chọn mới
        </Link>
      </div>

      <div className="mb-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'active', label: 'Đang diễn ra' },
            { id: 'closed', label: 'Đã kết thúc' },
            { id: 'created', label: 'Do tôi tạo' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`${
                filter === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <span>{tab.label}</span>
              <span
                className={`${
                  filter === tab.id ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'
                } rounded-full px-2 py-0.5 text-xs font-medium`}
              >
                {tabCounts[tab.id]}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {filteredPolls.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Chưa có bình chọn nào</h3>
          <p className="mt-2 text-gray-500">
            {filter === 'created'
              ? 'Bạn chưa tạo bình chọn nào. Hãy tạo bình chọn đầu tiên của bạn!'
              : 'Không có bình chọn nào phù hợp với bộ lọc hiện tại.'}
          </p>
          {filter === 'created' && (
            <Link to="/polls/create" className="mt-4 btn-primary inline-flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Tạo bình chọn đầu tiên
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPolls.map((poll) => (
            <PollCard key={poll.poll_id} poll={poll} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;