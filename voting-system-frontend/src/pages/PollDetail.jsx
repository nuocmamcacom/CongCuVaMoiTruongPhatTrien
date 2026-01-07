import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { pollAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import styles from './PollDetail.module.scss';

const PollDetails = () => {
    const { pollId } = useParams();
    const navigate = useNavigate();
    const authState = useAuth();
    const [pollData, setPollData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState([]);

    useEffect(() => {
        if (!pollId || typeof pollId !== 'string') {
            toast.error('ID bình chọn không hợp lệ');
            setLoading(false);
            navigate('/dashboard');
            return;
        }
        loadPoll();
    }, [pollId, navigate]);

    const loadPoll = async () => {
        try {
            const response = await pollAPI.getPollDetails(pollId);
            setPollData(response.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Không thể tải bình chọn');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleExportToExcel = async () => {
        try {
            setExporting(true);
            const token = localStorage.getItem('token');
            console.log('Export token:', token); // Debug
            console.log('Auth state:', authState); // Debug
            const response = await pollAPI.exportToExcel(pollId);
            
            // Create blob and download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${pollData.poll.title || 'poll'}_results.xlsx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.success('Xuất Excel thành công!');
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            console.error('Error status:', error.response?.status);
            console.error('Error data:', error.response?.data);
            toast.error('Có lỗi xảy ra khi xuất Excel');
        } finally {
            setExporting(false);
        }
    };

    const handleOptionClick = (optionId) => {
        if (!pollData?.can_vote || hasVoted) return;

        if (pollData.poll.poll_type === 'single') {
            setSelectedOptions([optionId]);
        } else {
            setSelectedOptions(prev => 
                prev.includes(optionId) 
                    ? prev.filter(id => id !== optionId)
                    : [...prev, optionId]
            );
        }
    };

    const handleVote = async () => {
        if (selectedOptions.length === 0) {
            toast.error('Vui lòng chọn ít nhất một lựa chọn');
            return;
        }

        setVoting(true);
        try {
            const optionId = pollData.poll.poll_type === 'single' 
                ? String(selectedOptions[0])
                : selectedOptions.map(id => String(id));
            
            await pollAPI.castVote({
                poll_id: pollId,
                option_id: optionId,
            });
            toast.success('Bình chọn thành công!');
            await loadPoll();
            setSelectedOptions([]);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setVoting(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) return <LoadingSpinner />;
    
    if (!pollData) {
        return (
            <div className={styles.pollDetailPage}>
                <div className={styles.container}>
                    <div className={styles.notFound}>
                        <h2 className={styles.notFoundTitle}>Không tìm thấy bình chọn</h2>
                        <p className={styles.notFoundText}>Bình chọn có thể đã bị xóa hoặc không tồn tại</p>
                    </div>
                </div>
            </div>
        );
    }

    const { poll, options, user_votes, can_vote } = pollData;
    const totalVotes = options.reduce((sum, opt) => sum + opt.vote_count, 0);
    const hasVoted = user_votes && user_votes.length > 0;
    const isActive = poll.is_active && (!poll.end_time || new Date(poll.end_time) > new Date());
    const isSingleChoice = poll.poll_type === 'single';

    return (
        <div className={styles.pollDetailPage}>
            <div className={styles.container}>
                {/* Back Button */}
                <Link to="/dashboard" className={styles.backBtn}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                    </svg>
                    Quay lại
                </Link>

                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.headerTop}>
                        <div className={styles.headerLeft}>
                            <div className={isActive ? styles.statusActive : styles.statusEnded}>
                                {isActive && <span className={styles.liveIndicator}></span>}
                                <span className={styles.statusBadge}>
                                    {isActive ? 'Đang diễn ra' : 'Đã kết thúc'}
                                </span>
                            </div>
                            
                            <h1 className={styles.title}>{poll.title}</h1>
                            
                            {poll.description && (
                                <p className={styles.description}>{poll.description}</p>
                            )}

                            <div className={styles.meta}>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaLabel}>Tổng phiếu</span>
                                    <span className={styles.metaValue}>{totalVotes}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaLabel}>Loại</span>
                                    <span className={styles.metaValue}>
                                        {isSingleChoice ? 'Chọn một' : 'Chọn nhiều'}
                                    </span>
                                </div>
                                {poll.end_time && (
                                    <div className={styles.metaItem}>
                                        <span className={styles.metaLabel}>Kết thúc</span>
                                        <span className={styles.metaValue}>{formatDate(poll.end_time)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {authState?.user?.user_id && poll.creator_id && 
                         String(authState.user.user_id) === String(poll.creator_id) && (
                            <button
                                onClick={handleExportToExcel}
                                disabled={exporting}
                                className={styles.btnExport}
                                title="Xuất kết quả bình chọn sang file Excel"
                            >
                                {exporting ? '⏳ Đang xuất...' : '📥 Xuất Excel'}
                            </button>
                        )}
                    </div>
                </header>

                {/* Main Content */}
                <main className={styles.mainContent}>
                    {can_vote && !hasVoted ? (
                        /* Voting Interface */
                        <div className={styles.votingCard}>
                            <h3 className={styles.votingTitle}>
                                {isSingleChoice ? 'Chọn một lựa chọn' : 'Chọn một hoặc nhiều lựa chọn'}
                            </h3>
                            
                            <div className={styles.optionsList}>
                                {options.map(option => {
                                    const isSelected = selectedOptions.includes(option.option_id);
                                    return (
                                        <div
                                            key={option.option_id}
                                            className={`${styles.optionItem} ${isSelected ? styles.optionSelected : ''}`}
                                            onClick={() => handleOptionClick(option.option_id)}
                                        >
                                            <div className={`
                                                ${styles.optionIndicator} 
                                                ${!isSingleChoice ? styles.optionIndicatorCheckbox : ''}
                                                ${isSelected ? styles.optionIndicatorSelected : ''}
                                            `}></div>
                                            <span className={styles.optionText}>{option.option_text}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                className={styles.voteBtn}
                                onClick={handleVote}
                                disabled={voting || selectedOptions.length === 0}
                            >
                                {voting ? (
                                    <>
                                        <span className={styles.spinner}></span>
                                        Đang gửi...
                                    </>
                                ) : (
                                    'Gửi bình chọn'
                                )}
                            </button>
                        </div>
                    ) : (
                        /* Results View */
                        <div className={styles.resultsCard}>
                            <div className={styles.resultsHeader}>
                                <h3 className={styles.resultsTitle}>Kết quả bình chọn</h3>
                                <span className={styles.totalVotes}>{totalVotes} phiếu bầu</span>
                            </div>

                            <div className={styles.resultsList}>
                                {options.map(option => {
                                    const percent = totalVotes > 0 
                                        ? Math.round((option.vote_count / totalVotes) * 100) 
                                        : 0;
                                    const isVoted = user_votes?.some(v => v.option_id === option.option_id);

                                    return (
                                        <div key={option.option_id} className={styles.resultItem}>
                                            <div className={styles.resultHeader}>
                                                <span className={styles.resultText}>
                                                    {option.option_text}
                                                    {isVoted && <span className={styles.votedBadge}>Đã chọn</span>}
                                                </span>
                                                <div className={styles.resultStats}>
                                                    <span className={styles.resultPercent}>{percent}%</span>
                                                    <span className={styles.resultCount}>{option.vote_count} phiếu</span>
                                                </div>
                                            </div>
                                            <div className={styles.progressBar}>
                                                <div 
                                                    className={`${styles.progressFill} ${isVoted ? styles.progressFillVoted : ''}`}
                                                    style={{ width: `${percent}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {hasVoted && (
                                <div className={styles.votedMessage}>
                                    <span className={styles.votedIcon}>✓</span>
                                    Bạn đã tham gia bình chọn này
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default PollDetails;