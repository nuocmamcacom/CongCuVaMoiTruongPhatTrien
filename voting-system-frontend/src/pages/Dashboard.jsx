import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pollAPI, formAPI } from '../services/api';
import { useAuth } from "../contexts/AuthContext.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import FormBuilder from "../components/form-builder";
import socketService from '../services/socket';
import toast from 'react-hot-toast';
import styles from './Dashboard.module.scss';

const Dashboard = () => {
    const [polls, setPolls] = useState([]);
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState('all');
    const [showFormBuilder, setShowFormBuilder] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        loadData();
        socketService.connect();
        
        socketService.onNewPoll((newPoll) => {
            if (!newPoll.poll_id || typeof newPoll.poll_id !== 'string') return;
            setPolls(prev => [newPoll, ...prev]);
            toast.success(`Bình chọn mới: ${newPoll.title}`);
        });

        return () => {
            socketService.off('new-poll');
            socketService.disconnect();
        };
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [pollsRes, formsRes] = await Promise.all([
                pollAPI.getPolls(),
                formAPI.getForms().catch(() => ({ data: [] }))
            ]);
            
            const pollData = Array.isArray(pollsRes.data) ? pollsRes.data : pollsRes.data?.data || [];
            const validPolls = pollData.filter(poll => poll && poll.poll_id && typeof poll.poll_id === 'string');
            setPolls(validPolls);
            
            const formData = formsRes.data?.forms || formsRes.data || [];
            setForms(formData);
        } catch (error) {
            toast.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const categorizePolls = () => {
        const now = new Date();
        return {
            ongoing: polls.filter(p => p.is_active && (!p.end_time || new Date(p.end_time) > now)),
            upcoming: polls.filter(p => p.start_time && new Date(p.start_time) > now),
            ended: polls.filter(p => !p.is_active || (p.end_time && new Date(p.end_time) <= now))
        };
    };

    const { ongoing, upcoming, ended } = categorizePolls();

    const handleFormCreated = () => {
        setShowFormBuilder(false);
        loadData();
        toast.success('Form đã được tạo thành công!');
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (showFormBuilder) {
        return (
            <div className={styles.modalOverlay}>
                <div className={styles.modalContent}>
                    <FormBuilder 
                        onFormCreated={handleFormCreated}
                        onCancel={() => setShowFormBuilder(false)}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>
            <div className={styles.container}>
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <h1 className={styles.title}>Bảng điều khiển</h1>
                        <p className={styles.subtitle}>
                            Quản lý bình chọn và form lấy ý kiến của bạn
                        </p>
                    </div>
                    <div className={styles.headerActions}>
                        <button 
                            className={styles.btnSecondary}
                            onClick={() => setShowFormBuilder(true)}
                        >
                            Tạo Form
                        </button>
                        <Link to="/polls/create" className={styles.btnPrimary}>
                            Tạo Bình Chọn
                        </Link>
                    </div>
                </header>

                {/* Quick Stats */}
                <div className={styles.statsRow}>
                    <div className={styles.statItem}>
                        <span className={styles.statNumber}>{ongoing.length}</span>
                        <span className={styles.statLabel}>Đang diễn ra</span>
                    </div>
                    <div className={styles.statDivider}></div>
                    <div className={styles.statItem}>
                        <span className={styles.statNumber}>{upcoming.length}</span>
                        <span className={styles.statLabel}>Sắp tới</span>
                    </div>
                    <div className={styles.statDivider}></div>
                    <div className={styles.statItem}>
                        <span className={styles.statNumber}>{ended.length}</span>
                        <span className={styles.statLabel}>Đã kết thúc</span>
                    </div>
                    <div className={styles.statDivider}></div>
                    <div className={styles.statItem}>
                        <span className={styles.statNumber}>{forms.length}</span>
                        <span className={styles.statLabel}>Form ý kiến</span>
                    </div>
                </div>

                {/* View Tabs */}
                <nav className={styles.viewTabs}>
                    <button 
                        className={`${styles.viewTab} ${activeView === 'all' ? styles.active : ''}`}
                        onClick={() => setActiveView('all')}
                    >
                        Tất cả
                    </button>
                    <button 
                        className={`${styles.viewTab} ${activeView === 'polls' ? styles.active : ''}`}
                        onClick={() => setActiveView('polls')}
                    >
                        Bình chọn
                    </button>
                    <button 
                        className={`${styles.viewTab} ${activeView === 'forms' ? styles.active : ''}`}
                        onClick={() => setActiveView('forms')}
                    >
                        Form ý kiến
                    </button>
                </nav>

                {/* Main Content */}
                <main className={styles.mainContent}>
                    {/* Ongoing Section */}
                    {(activeView === 'all' || activeView === 'polls') && ongoing.length > 0 && (
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>Đang diễn ra</h2>
                                <span className={styles.sectionBadge}>{ongoing.length}</span>
                            </div>
                            <div className={styles.ongoingGrid}>
                                {ongoing.map(poll => (
                                    <OngoingPollCard key={poll.poll_id} poll={poll} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Upcoming Section */}
                    {(activeView === 'all' || activeView === 'polls') && upcoming.length > 0 && (
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>Sắp diễn ra</h2>
                                <span className={styles.sectionCount}>{upcoming.length}</span>
                            </div>
                            <div className={styles.standardGrid}>
                                {upcoming.map(poll => (
                                    <PollCard key={poll.poll_id} poll={poll} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Ended Section */}
                    {(activeView === 'all' || activeView === 'polls') && ended.length > 0 && (
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>Đã kết thúc</h2>
                                <span className={styles.sectionCount}>{ended.length}</span>
                            </div>
                            <div className={styles.standardGrid}>
                                {ended.map(poll => (
                                    <PollCard key={poll.poll_id} poll={poll} variant="ended" />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Forms Section */}
                    {(activeView === 'all' || activeView === 'forms') && forms.length > 0 && (
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>Form lấy ý kiến</h2>
                                <span className={styles.sectionCount}>{forms.length}</span>
                            </div>
                            <div className={styles.standardGrid}>
                                {forms.map(form => (
                                    <FormCard key={form._id} form={form} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Empty State */}
                    {polls.length === 0 && forms.length === 0 && (
                        <div className={styles.emptyState}>
                            <h3 className={styles.emptyTitle}>Chưa có nội dung nào</h3>
                            <p className={styles.emptyText}>
                                Bắt đầu tạo bình chọn hoặc form lấy ý kiến đầu tiên của bạn
                            </p>
                            <div className={styles.emptyActions}>
                                <Link to="/polls/create" className={styles.btnPrimary}>
                                    Tạo Bình Chọn
                                </Link>
                                <button 
                                    className={styles.btnSecondary}
                                    onClick={() => setShowFormBuilder(true)}
                                >
                                    Tạo Form
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

// Ongoing Poll Card - Highlighted
const OngoingPollCard = ({ poll }) => {
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

    return (
        <Link to={`/polls/${poll.poll_id}`} className={styles.ongoingCard}>
            <div className={styles.ongoingCardInner}>
                <div className={styles.ongoingStatus}>
                    <span className={styles.liveIndicator}></span>
                    Đang diễn ra
                </div>
                <h3 className={styles.ongoingTitle}>{poll.title}</h3>
                <p className={styles.ongoingDesc}>
                    {poll.description || 'Không có mô tả'}
                </p>
                <div className={styles.ongoingMeta}>
                    <div className={styles.metaRow}>
                        <span className={styles.metaLabel}>Số phiếu</span>
                        <span className={styles.metaValue}>{poll.total_votes || 0}</span>
                    </div>
                    {poll.end_time && (
                        <div className={styles.metaRow}>
                            <span className={styles.metaLabel}>Kết thúc</span>
                            <span className={styles.metaValue}>{formatDate(poll.end_time)}</span>
                        </div>
                    )}
                </div>
                <div className={styles.ongoingAction}>
                    Xem chi tiết
                </div>
            </div>
        </Link>
    );
};

// Standard Poll Card
const PollCard = ({ poll, variant = 'default' }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const isEnded = variant === 'ended';

    return (
        <Link 
            to={`/polls/${poll.poll_id}`} 
            className={`${styles.card} ${isEnded ? styles.cardEnded : ''}`}
        >
            <div className={styles.cardStatus}>
                {isEnded ? 'Đã kết thúc' : 'Sắp diễn ra'}
            </div>
            <h3 className={styles.cardTitle}>{poll.title}</h3>
            <p className={styles.cardDesc}>
                {poll.description || 'Không có mô tả'}
            </p>
            <div className={styles.cardFooter}>
                <span>{formatDate(poll.created_at)}</span>
                <span>{poll.total_votes || 0} phiếu</span>
            </div>
        </Link>
    );
};

// Form Card
const FormCard = ({ form }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <Link to={`/forms/${form._id}`} className={styles.card}>
            <div className={styles.cardType}>Form ý kiến</div>
            <h3 className={styles.cardTitle}>{form.title}</h3>
            <p className={styles.cardDesc}>
                {form.description || 'Không có mô tả'}
            </p>
            <div className={styles.cardFooter}>
                <span>{formatDate(form.created_at)}</span>
                <span>{form.questions?.length || 0} câu hỏi</span>
            </div>
        </Link>
    );
};

export default Dashboard;
