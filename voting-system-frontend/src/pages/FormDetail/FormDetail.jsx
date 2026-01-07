import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import styles from './FormDetail.module.scss';

const FormDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const authState = useAuth();
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [answers, setAnswers] = useState({});
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadForm();
    }, [id]);

    const loadForm = async () => {
        try {
            setLoading(true);
            const response = await formAPI.getFormDetails(id);
            const formData = response.data.form;
            setForm(formData);
            
            // Initialize answers with default values
            const initialAnswers = {};
            if (formData?.questions) {
                formData.questions.forEach(question => {
                    switch (question.question_type) {
                        case 'checkbox':
                            initialAnswers[question.question_id] = [];
                            break;
                        default:
                            initialAnswers[question.question_id] = '';
                    }
                });
            }
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

    const handleExportToExcel = async () => {
        try {
            setExporting(true);
            const response = await formAPI.exportToExcel(id);
            
            // Create blob and download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${form.title || 'form'}_responses.xlsx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.success('Xuất Excel thành công!');
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            toast.error('Có lỗi xảy ra khi xuất Excel');
        } finally {
            setExporting(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        form.questions?.forEach(question => {
            if (question.is_required) {
                const answer = answers[question.question_id];
                
                if (!answer || 
                    (typeof answer === 'string' && answer.trim() === '') ||
                    (Array.isArray(answer) && answer.length === 0)) {
                    newErrors[question.question_id] = 'Câu hỏi này bắt buộc phải trả lời';
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
            
            const formattedAnswers = Object.entries(answers).map(([questionId, value]) => {
                // Find the question to get its type
                const question = form.questions?.find(q => q.question_id === questionId);
                const questionType = question?.question_type || 'short_text';
                
                const answer = {
                    question_id: questionId,
                    question_type: questionType
                };
                
                // Set the correct field based on question type
                switch (questionType) {
                    case 'multiple_choice':
                    case 'checkbox':
                        answer.selected_options = Array.isArray(value) ? value : [value];
                        break;
                    case 'rating':
                        answer.rating_value = parseInt(value) || 0;
                        break;
                    default: // short_text, paragraph
                        answer.answer_text = String(value);
                }
                
                return answer;
            }).filter(a => {
                // Filter out empty answers
                if (a.answer_text) return a.answer_text.trim() !== '';
                if (a.selected_options) return a.selected_options.length > 0;
                if (a.rating_value) return a.rating_value > 0;
                return false;
            });

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
            <div className={styles.errorContainer}>
                <h2>Form không tồn tại</h2>
                <button onClick={() => navigate('/')} className={styles.btnPrimary}>
                    Quay về trang chủ
                </button>
            </div>
        );
    }

    return (
        <div className={styles.formDetailPage}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.headerTop}>
                        <div>
                            <h1 className={styles.title}>{form.title}</h1>
                            {form.description && (
                                <p className={styles.description}>{form.description}</p>
                            )}
                            <div className={styles.meta}>
                                <span className={styles.questionsCount}>
                                    {form.questions?.length || 0} câu hỏi
                                </span>
                                <span className={styles.requiredNote}>
                                    * Bắt buộc
                                </span>
                            </div>
                        </div>
                        {authState?.user?.user_id && form.creator_id && 
                         String(authState.user.user_id) === String(form.creator_id) && (
                            <button
                                onClick={handleExportToExcel}
                                disabled={exporting}
                                className={styles.btnExport}
                                title="Xuất kết quả khảo sát sang file Excel"
                            >
                                {exporting ? '⏳ Đang xuất...' : '📥 Xuất Excel'}
                            </button>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {form.questions?.map((question, index) => (
                        <QuestionRenderer
                            key={question.question_id || `question-${index}`}
                            question={question}
                            questionNumber={index + 1}
                            value={answers[question.question_id] || ''}
                            onChange={(value) => handleAnswerChange(question.question_id, value)}
                            error={errors[question.question_id]}
                        />
                    ))}

                    <div className={styles.actions}>
                        <button
                            type="submit"
                            className={styles.btnSubmit}
                            disabled={submitting}
                        >
                            {submitting ? 'Đang gửi...' : 'Gửi phản hồi'}
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className={styles.btnCancel}
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
        switch (question.question_type) {
            case 'short_text':
                return (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Nhập câu trả lời ngắn..."
                        className={`${styles.input} ${error ? styles.inputError : ''}`}
                        maxLength={255}
                    />
                );

            case 'paragraph':
                return (
                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Nhập câu trả lời dài..."
                        className={`${styles.textarea} ${error ? styles.textareaError : ''}`}
                        rows={4}
                        maxLength={1000}
                    />
                );

            case 'multiple_choice':
                return (
                    <div className={styles.options}>
                        {question.options?.map((option, index) => (
                            <label key={option.option_id || index} className={styles.radioOption}>
                                <input
                                    type="radio"
                                    name={`question-${question.question_id}`}
                                    value={option.option_text}
                                    checked={value === option.option_text}
                                    onChange={(e) => onChange(e.target.value)}
                                />
                                <span className={styles.optionLabel}>{option.option_text}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'checkbox':
                return (
                    <div className={styles.options}>
                        {question.options?.map((option, index) => (
                            <label key={option.option_id || index} className={styles.checkboxOption}>
                                <input
                                    type="checkbox"
                                    value={option.option_text}
                                    checked={Array.isArray(value) && value.includes(option.option_text)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            onChange([...(Array.isArray(value) ? value : []), option.option_text]);
                                        } else {
                                            onChange((Array.isArray(value) ? value : []).filter(v => v !== option.option_text));
                                        }
                                    }}
                                />
                                <span className={styles.optionLabel}>{option.option_text}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'rating':
                const maxRating = question.rating_scale?.max || 5;
                return (
                    <div className={styles.rating}>
                        {[...Array(maxRating)].map((_, index) => {
                            const rating = index + 1;
                            return (
                                <label key={rating} className={styles.ratingItem}>
                                    <input
                                        type="radio"
                                        name={`rating-${question.question_id}`}
                                        value={rating}
                                        checked={parseInt(value) === rating}
                                        onChange={(e) => onChange(parseInt(e.target.value))}
                                    />
                                    <span className={styles.ratingStar}>
                                        {parseInt(value) >= rating ? '★' : '☆'}
                                    </span>
                                    <span className={styles.ratingNumber}>{rating}</span>
                                </label>
                            );
                        })}
                        <div className={styles.ratingLabels}>
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
        <div className={styles.questionCard}>
            <div className={styles.questionHeader}>
                <h3 className={styles.questionText}>
                    <span className={styles.questionNumber}>{questionNumber}.</span>
                    {question.question_text}
                    {question.is_required && <span className={styles.requiredMarker}>*</span>}
                </h3>
            </div>

            <div className={styles.questionContent}>
                {renderQuestionContent()}
                {error && (
                    <div className={styles.errorMessage}>{error}</div>
                )}
            </div>
        </div>
    );
};

export default FormDetail;