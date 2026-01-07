import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './FormResponses.scss';

const FormResponses = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(null);
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exportingExcel, setExportingExcel] = useState(false);

    useEffect(() => {
        loadFormAndResponses();
    }, [id]);

    const loadFormAndResponses = async () => {
        try {
            setLoading(true);
            
            // Load form details and responses in parallel
            const [formData, responsesData] = await Promise.all([
                formAPI.getFormDetails(id),
                formAPI.getFormResponses(id)
            ]);
            
            setForm(formData);
            setResponses(responsesData);
        } catch (error) {
            console.error('Error loading form responses:', error);
            if (error.response?.status === 404) {
                toast.error('Form không tồn tại');
                navigate('/dashboard');
            } else if (error.response?.status === 403) {
                toast.error('Bạn không có quyền xem phản hồi này');
                navigate('/dashboard');
            } else {
                toast.error('Có lỗi xảy ra khi tải dữ liệu');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = async () => {
        try {
            setExportingExcel(true);
            const response = await formAPI.exportToExcel(id);
            
            // Create blob and download
            const blob = new Blob([response.data], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${form.title.replace(/[^a-zA-Z0-9]/g, '_')}_responses.xlsx`;
            document.body.appendChild(a);
            a.click();
            
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            toast.success('Đã xuất file Excel thành công!');
        } catch (error) {
            console.error('Export error:', error);
            if (error.response?.status === 403) {
                toast.error('Bạn không có quyền xuất file Excel');
            } else {
                toast.error('Có lỗi xảy ra khi xuất file Excel');
            }
        } finally {
            setExportingExcel(false);
        }
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    };

    const getAnswerText = (question, answer) => {
        if (!answer) return 'Không trả lời';
        
        switch (question.type) {
            case 'checkbox':
                return Array.isArray(answer) ? answer.join(', ') : answer;
            case 'rating':
                const maxRating = question.options?.maxRating || 5;
                return `${answer}/${maxRating} ${'★'.repeat(answer)}${'☆'.repeat(maxRating - answer)}`;
            default:
                return answer;
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!form) {
        return (
            <div className="form-responses__error">
                <h2>Form không tồn tại</h2>
                <button onClick={() => navigate('/dashboard')} className="btn btn--primary">
                    Quay về Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="form-responses">
            <div className="form-responses__container">
                {/* Header */}
                <div className="form-responses__header">
                    <div className="form-responses__header-content">
                        <div className="form-responses__breadcrumb">
                            <Link to="/dashboard" className="breadcrumb-link">Dashboard</Link>
                            <span className="breadcrumb-separator">/</span>
                            <span className="breadcrumb-current">Phản hồi Form</span>
                        </div>
                        
                        <h1 className="form-responses__title">{form.title}</h1>
                        {form.description && (
                            <p className="form-responses__description">{form.description}</p>
                        )}
                        
                        <div className="form-responses__stats">
                            <div className="stat-item">
                                <span className="stat-label">Tổng phản hồi:</span>
                                <span className="stat-value">{responses.length}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Ngày tạo:</span>
                                <span className="stat-value">{formatDate(form.created_at)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="form-responses__actions">
                        <Link 
                            to={`/forms/${id}`}
                            className="btn btn--outline"
                        >
                            Xem Form
                        </Link>
                        
                        <button
                            onClick={handleExportExcel}
                            disabled={exportingExcel || responses.length === 0}
                            className="btn btn--success"
                        >
                            {exportingExcel ? (
                                <>
                                    <div className="spinner-mini"></div>
                                    Đang xuất...
                                </>
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                                    </svg>
                                    Xuất Excel
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="form-responses__content">
                    {responses.length === 0 ? (
                        <div className="form-responses__empty">
                            <div className="empty-state">
                                <h3 className="empty-state__title">Chưa có phản hồi nào</h3>
                                <p className="empty-state__text">
                                    Form của bạn chưa nhận được phản hồi nào. 
                                    Hãy chia sẻ link form để mọi người có thể tham gia!
                                </p>
                                <div className="empty-state__actions">
                                    <Link 
                                        to={`/forms/${id}`}
                                        className="btn btn--primary"
                                    >
                                        Xem Form
                                    </Link>
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(window.location.origin + `/forms/${id}`);
                                            toast.success('Đã copy link form!');
                                        }}
                                        className="btn btn--outline"
                                    >
                                        Copy Link
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Summary Statistics */}
                            <div className="form-responses__summary">
                                <h2 className="section-title">Thống kê tổng quan</h2>
                                <div className="summary-grid">
                                    {form.questions.map(question => (
                                        <QuestionSummary 
                                            key={question._id}
                                            question={question}
                                            responses={responses}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Individual Responses */}
                            <div className="form-responses__list">
                                <h2 className="section-title">Danh sách phản hồi</h2>
                                <div className="responses-table">
                                    <div className="responses-table__header">
                                        <div className="table-cell">STT</div>
                                        <div className="table-cell">Thời gian</div>
                                        {form.questions.map(question => (
                                            <div key={question._id} className="table-cell">
                                                {question.question}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="responses-table__body">
                                        {responses.map((response, index) => (
                                            <div key={response._id} className="responses-table__row">
                                                <div className="table-cell">{index + 1}</div>
                                                <div className="table-cell">
                                                    {formatDate(response.submitted_at)}
                                                </div>
                                                {form.questions.map(question => {
                                                    const answer = response.answers.find(a => a.question_id === question._id);
                                                    return (
                                                        <div key={question._id} className="table-cell">
                                                            {getAnswerText(question, answer?.answer)}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// Question Summary Component
const QuestionSummary = ({ question, responses }) => {
    const getQuestionStats = () => {
        const answers = responses
            .map(r => r.answers.find(a => a.question_id === question._id))
            .filter(a => a && a.answer)
            .map(a => a.answer);

        const totalResponses = answers.length;
        
        switch (question.type) {
            case 'multiple_choice':
                const choiceCounts = {};
                answers.forEach(answer => {
                    choiceCounts[answer] = (choiceCounts[answer] || 0) + 1;
                });
                
                return {
                    type: 'choice',
                    totalResponses,
                    choices: Object.entries(choiceCounts).map(([choice, count]) => ({
                        choice,
                        count,
                        percentage: totalResponses > 0 ? (count / totalResponses * 100).toFixed(1) : 0
                    }))
                };

            case 'checkbox':
                const allChoices = {};
                answers.forEach(answer => {
                    if (Array.isArray(answer)) {
                        answer.forEach(choice => {
                            allChoices[choice] = (allChoices[choice] || 0) + 1;
                        });
                    }
                });
                
                return {
                    type: 'choice',
                    totalResponses,
                    choices: Object.entries(allChoices).map(([choice, count]) => ({
                        choice,
                        count,
                        percentage: totalResponses > 0 ? (count / totalResponses * 100).toFixed(1) : 0
                    }))
                };

            case 'rating':
                const ratings = answers.map(a => parseInt(a)).filter(r => !isNaN(r));
                const average = ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1) : 0;
                const maxRating = question.options?.maxRating || 5;
                
                return {
                    type: 'rating',
                    totalResponses,
                    average,
                    maxRating,
                    distribution: [...Array(maxRating)].map((_, i) => {
                        const rating = i + 1;
                        const count = ratings.filter(r => r === rating).length;
                        return {
                            rating,
                            count,
                            percentage: totalResponses > 0 ? (count / totalResponses * 100).toFixed(1) : 0
                        };
                    })
                };

            default:
                return {
                    type: 'text',
                    totalResponses,
                    sampleAnswers: answers.slice(0, 3)
                };
        }
    };

    const stats = getQuestionStats();

    return (
        <div className="question-summary">
            <div className="question-summary__header">
                <h3 className="question-summary__title">{question.question}</h3>
                <span className="question-summary__count">
                    {stats.totalResponses} phản hồi
                </span>
            </div>

            <div className="question-summary__content">
                {stats.type === 'choice' && (
                    <div className="choice-stats">
                        {stats.choices.map((choice, index) => (
                            <div key={index} className="choice-stat">
                                <div className="choice-stat__label">{choice.choice}</div>
                                <div className="choice-stat__bar">
                                    <div 
                                        className="choice-stat__fill"
                                        style={{ width: `${choice.percentage}%` }}
                                    ></div>
                                </div>
                                <div className="choice-stat__count">
                                    {choice.count} ({choice.percentage}%)
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {stats.type === 'rating' && (
                    <div className="rating-stats">
                        <div className="rating-average">
                            Điểm trung bình: <strong>{stats.average}/{stats.maxRating}</strong>
                        </div>
                        <div className="rating-distribution">
                            {stats.distribution.map(item => (
                                <div key={item.rating} className="rating-item">
                                    <span>{item.rating}★</span>
                                    <div className="rating-bar">
                                        <div 
                                            className="rating-fill"
                                            style={{ width: `${item.percentage}%` }}
                                        ></div>
                                    </div>
                                    <span>{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {stats.type === 'text' && (
                    <div className="text-stats">
                        <div className="sample-answers">
                            {stats.sampleAnswers.map((answer, index) => (
                                <div key={index} className="sample-answer">
                                    "{answer.substring(0, 100)}{answer.length > 100 ? '...' : ''}"
                                </div>
                            ))}
                            {stats.totalResponses > 3 && (
                                <div className="more-answers">
                                    Và {stats.totalResponses - 3} phản hồi khác...
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FormResponses;