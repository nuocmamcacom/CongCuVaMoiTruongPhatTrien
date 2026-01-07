import React, { useState } from 'react';
import { formAPI } from '../../services/api';
import toast from 'react-hot-toast';
import QuestionBuilder from './QuestionBuilder';
import styles from './FormBuilder.module.scss';

const FormBuilder = ({ onFormCreated, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        questions: []
    });
    const [creating, setCreating] = useState(false);

    const addQuestion = () => {
        const newQuestion = {
            question_id: Date.now().toString(),
            question_text: '',
            question_type: 'short_text',
            options: [],
            is_required: false,
            order_index: formData.questions.length + 1
        };
        setFormData(prev => ({
            ...prev,
            questions: [...prev.questions, newQuestion]
        }));
    };

    const updateQuestion = (questionId, updates) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.map(q => 
                q.question_id === questionId ? { ...q, ...updates } : q
            )
        }));
    };

    const deleteQuestion = (questionId) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.filter(q => q.question_id !== questionId)
        }));
    };

    const moveQuestion = (questionId, direction) => {
        const currentIndex = formData.questions.findIndex(q => q.question_id === questionId);
        if (direction === 'up' && currentIndex > 0) {
            const newQuestions = [...formData.questions];
            [newQuestions[currentIndex], newQuestions[currentIndex - 1]] = 
            [newQuestions[currentIndex - 1], newQuestions[currentIndex]];
            setFormData(prev => ({ ...prev, questions: newQuestions }));
        } else if (direction === 'down' && currentIndex < formData.questions.length - 1) {
            const newQuestions = [...formData.questions];
            [newQuestions[currentIndex], newQuestions[currentIndex + 1]] = 
            [newQuestions[currentIndex + 1], newQuestions[currentIndex]];
            setFormData(prev => ({ ...prev, questions: newQuestions }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title.trim()) {
            toast.error('Vui lòng nhập tiêu đề form');
            return;
        }

        if (formData.questions.length === 0) {
            toast.error('Vui lòng thêm ít nhất 1 câu hỏi');
            return;
        }

        // Validate all questions have text
        const emptyQuestion = formData.questions.find(q => !q.question_text.trim());
        if (emptyQuestion) {
            toast.error('Vui lòng nhập nội dung cho tất cả câu hỏi');
            return;
        }

        // Validate options for multiple choice questions
        const invalidOptionsQuestion = formData.questions.find(q => 
            ['multiple_choice', 'checkbox'].includes(q.question_type) && 
            (!q.options || q.options.length < 2)
        );
        if (invalidOptionsQuestion) {
            toast.error('Câu hỏi trắc nghiệm cần ít nhất 2 lựa chọn');
            return;
        }

        setCreating(true);
        try {
            const response = await formAPI.createForm(formData);
            toast.success('Tạo form thành công!');
            onFormCreated && onFormCreated(response.data.form_id);
        } catch (error) {
            console.error('Create form error:', error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo form');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className={styles.formBuilder}>
            <form onSubmit={handleSubmit}>
                {/* Header */}
                <div className={styles.header}>
                    <h2 className={styles.title}>Tạo Form Lấy Ý Kiến</h2>
                    <p className={styles.subtitle}>
                        Tạo form để thu thập phản hồi và ý kiến từ người dùng
                    </p>
                </div>

                {/* Form Fields */}
                <div className={styles.formFields}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Tiêu đề</label>
                        <input
                            type="text"
                            className={`${styles.input} ${styles.inputTitle}`}
                            placeholder="Nhập tiêu đề form..."
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Mô tả (tùy chọn)</label>
                        <textarea
                            className={styles.textarea}
                            placeholder="Nhập mô tả ngắn về form..."
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>
                </div>

                {/* Questions Section */}
                <div className={styles.questionsSection}>
                    <div className={styles.sectionLabel}>
                        <span className={styles.sectionTitle}>Danh sách câu hỏi</span>
                        {formData.questions.length > 0 && (
                            <span className={styles.questionCount}>{formData.questions.length}</span>
                        )}
                    </div>

                    {formData.questions.length === 0 ? (
                        <div className={styles.emptyQuestions}>
                            <div className={styles.emptyIcon}>📝</div>
                            <h4 className={styles.emptyTitle}>Chưa có câu hỏi nào</h4>
                            <p className={styles.emptyText}>
                                Bấm nút bên dưới để thêm câu hỏi đầu tiên
                            </p>
                        </div>
                    ) : (
                        <div className={styles.questionsList}>
                            {formData.questions.map((question, index) => (
                                <QuestionBuilder
                                    key={question.question_id}
                                    question={question}
                                    index={index}
                                    totalQuestions={formData.questions.length}
                                    onUpdate={(updates) => updateQuestion(question.question_id, updates)}
                                    onDelete={() => deleteQuestion(question.question_id)}
                                    onMove={(direction) => moveQuestion(question.question_id, direction)}
                                />
                            ))}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={addQuestion}
                        className={styles.addQuestionBtn}
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                        Thêm câu hỏi
                    </button>
                </div>

                {/* Footer Actions */}
                <div className={styles.footer}>
                    <button
                        type="button"
                        onClick={onCancel}
                        className={styles.btnCancel}
                    >
                        Hủy
                    </button>
                    
                    <button
                        type="submit"
                        disabled={creating}
                        className={styles.btnSubmit}
                    >
                        {creating ? 'Đang tạo...' : 'Tạo Form'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FormBuilder;
