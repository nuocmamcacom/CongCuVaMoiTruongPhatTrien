import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './FormDetail.scss';

const FormDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [answers, setAnswers] = useState({});
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadForm();
    }, [id]);

    const loadForm = async () => {
        try {
            setLoading(true);
            const data = await formAPI.getFormDetails(id);
            setForm(data);
            
            // Initialize answers with default values
            const initialAnswers = {};
            data.questions.forEach(question => {
                switch (question.type) {
                    case 'checkbox':
                        initialAnswers[question._id] = [];
                        break;
                    default:
                        initialAnswers[question._id] = '';
                }
            });
            setAnswers(initialAnswers);
        } catch (error) {
            console.error('Error loading form:', error);
            if (error.response?.status === 404) {
                toast.error('Form không tồn tại');
                navigate('/');
            } else {
                toast.error('Có lỗi xảy ra khi tải form');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
        
        // Clear error for this question
        if (errors[questionId]) {
            setErrors(prev => ({
                ...prev,
                [questionId]: null
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        form.questions.forEach(question => {
            if (question.required) {
                const answer = answers[question._id];
                
                if (!answer || 
                    (typeof answer === 'string' && answer.trim() === '') ||
                    (Array.isArray(answer) && answer.length === 0)) {
                    newErrors[question._id] = 'Câu hỏi này bắt buộc phải trả lời';
                }
            }
        });
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Vui lòng hoàn thành tất cả câu hỏi bắt buộc');
            return;
        }

        try {
            setSubmitting(true);
            
            const formattedAnswers = Object.entries(answers).map(([questionId, value]) => ({
                question_id: questionId,
                answer: value
            }));

            await formAPI.submitResponse(id, {
                answers: formattedAnswers
            });

            toast.success('Gửi phản hồi thành công!');
            
            // Navigate to thank you page or back to home
            navigate('/', { 
                state: { 
                    message: 'Cảm ơn bạn đã gửi phản hồi!' 
                } 
            });
        } catch (error) {
            console.error('Error submitting form:', error);
            if (error.response?.status === 400) {
                toast.error('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại');
            } else {
                toast.error('Có lỗi xảy ra khi gửi phản hồi');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!form) {
        return (
            <div className="form-detail__error">
                <h2>Form không tồn tại</h2>
                <button onClick={() => navigate('/')} className="btn btn--primary">
                    Quay về trang chủ
                </button>
            </div>
        );
    }

    return (
        <div className="form-detail">
            <div className="form-detail__container">
                <div className="form-detail__header">
                    <h1 className="form-detail__title">{form.title}</h1>
                    {form.description && (
                        <p className="form-detail__description">{form.description}</p>
                    )}
                    <div className="form-detail__meta">
                        <span className="form-detail__questions-count">
                            {form.questions.length} câu hỏi
                        </span>
                        <span className="form-detail__required-note">
                            * Bắt buộc
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="form-detail__form">
                    {form.questions.map((question, index) => (
                        <QuestionRenderer
                            key={question._id}
                            question={question}
                            questionNumber={index + 1}
                            value={answers[question._id] || ''}
                            onChange={(value) => handleAnswerChange(question._id, value)}
                            error={errors[question._id]}
                        />
                    ))}

                    <div className="form-detail__actions">
                        <button
                            type="submit"
                            className="btn btn--primary btn--large"
                            disabled={submitting}
                        >
                            {submitting ? 'Đang gửi...' : 'Gửi phản hồi'}
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="btn btn--outline"
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Question Renderer Component
const QuestionRenderer = ({ question, questionNumber, value, onChange, error }) => {
    const renderQuestionContent = () => {
        switch (question.type) {
            case 'short_text':
                return (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Nhập câu trả lời ngắn..."
                        className={`form-input ${error ? 'form-input--error' : ''}`}
                        maxLength={question.options?.maxLength || 255}
                    />
                );

            case 'paragraph':
                return (
                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Nhập câu trả lời dài..."
                        className={`form-textarea ${error ? 'form-textarea--error' : ''}`}
                        rows={4}
                        maxLength={question.options?.maxLength || 1000}
                    />
                );

            case 'multiple_choice':
                return (
                    <div className="form-options">
                        {question.options?.choices?.map((choice, index) => (
                            <label key={index} className="form-radio">
                                <input
                                    type="radio"
                                    name={`question-${question._id}`}
                                    value={choice}
                                    checked={value === choice}
                                    onChange={(e) => onChange(e.target.value)}
                                />
                                <span className="form-radio__label">{choice}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'checkbox':
                return (
                    <div className="form-options">
                        {question.options?.choices?.map((choice, index) => (
                            <label key={index} className="form-checkbox">
                                <input
                                    type="checkbox"
                                    value={choice}
                                    checked={Array.isArray(value) && value.includes(choice)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            onChange([...(Array.isArray(value) ? value : []), choice]);
                                        } else {
                                            onChange((Array.isArray(value) ? value : []).filter(v => v !== choice));
                                        }
                                    }}
                                />
                                <span className="form-checkbox__label">{choice}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'rating':
                const maxRating = question.options?.maxRating || 5;
                return (
                    <div className="form-rating">
                        {[...Array(maxRating)].map((_, index) => {
                            const rating = index + 1;
                            return (
                                <label key={rating} className="form-rating__item">
                                    <input
                                        type="radio"
                                        name={`rating-${question._id}`}
                                        value={rating}
                                        checked={parseInt(value) === rating}
                                        onChange={(e) => onChange(parseInt(e.target.value))}
                                    />
                                    <span className="form-rating__star">
                                        {parseInt(value) >= rating ? '★' : '☆'}
                                    </span>
                                    <span className="form-rating__number">{rating}</span>
                                </label>
                            );
                        })}
                        <div className="form-rating__labels">
                            <span>1 = Rất không hài lòng</span>
                            <span>{maxRating} = Rất hài lòng</span>
                        </div>
                    </div>
                );

            default:
                return <div>Loại câu hỏi không được hỗ trợ</div>;
        }
    };

    return (
        <div className="form-question">
            <div className="form-question__header">
                <h3 className="form-question__title">
                    <span className="form-question__number">{questionNumber}.</span>
                    {question.question}
                    {question.required && <span className="form-question__required">*</span>}
                </h3>
                {question.description && (
                    <p className="form-question__description">{question.description}</p>
                )}
            </div>

            <div className="form-question__content">
                {renderQuestionContent()}
                {error && (
                    <div className="form-question__error">{error}</div>
                )}
            </div>
        </div>
    );
};

export default FormDetail;