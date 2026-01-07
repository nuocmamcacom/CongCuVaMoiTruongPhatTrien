import React from 'react';
import styles from './FormBuilder.module.scss';

const QuestionBuilder = ({ question, index, totalQuestions, onUpdate, onDelete, onMove }) => {
    const questionTypes = [
        { value: 'short_text', label: 'Văn bản ngắn' },
        { value: 'paragraph', label: 'Đoạn văn' },
        { value: 'multiple_choice', label: 'Trắc nghiệm (1 lựa chọn)' },
        { value: 'checkbox', label: 'Hộp kiểm (nhiều lựa chọn)' },
        { value: 'rating', label: 'Đánh giá (1-5 sao)' }
    ];

    const needsOptions = ['multiple_choice', 'checkbox'].includes(question.question_type);
    const isRadio = question.question_type === 'multiple_choice';

    const addOption = () => {
        const newOption = {
            option_id: Date.now().toString(),
            option_text: ''
        };
        onUpdate({
            options: [...(question.options || []), newOption]
        });
    };

    const updateOption = (optionId, text) => {
        onUpdate({
            options: question.options.map(opt => 
                opt.option_id === optionId ? { ...opt, option_text: text } : opt
            )
        });
    };

    const deleteOption = (optionId) => {
        onUpdate({
            options: question.options.filter(opt => opt.option_id !== optionId)
        });
    };

    return (
        <div className={styles.questionCard}>
            {/* Question Header */}
            <div className={styles.questionHeader}>
                <div className={styles.questionNumber}>{index + 1}</div>
                
                <input
                    type="text"
                    className={styles.questionInput}
                    placeholder="Nhập câu hỏi..."
                    value={question.question_text}
                    onChange={(e) => onUpdate({ question_text: e.target.value })}
                    required
                />

                {/* Question Controls */}
                <div className={styles.questionActions}>
                    <button
                        type="button"
                        onClick={() => onMove('up')}
                        disabled={index === 0}
                        className={styles.actionBtn}
                        title="Di chuyển lên"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
                        </svg>
                    </button>

                    <button
                        type="button"
                        onClick={() => onMove('down')}
                        disabled={index === totalQuestions - 1}
                        className={styles.actionBtn}
                        title="Di chuyển xuống"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                        </svg>
                    </button>

                    <button
                        type="button"
                        onClick={onDelete}
                        className={styles.deleteBtn}
                        title="Xóa câu hỏi"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Question Settings */}
            <div className={styles.questionSettings}>
                <div className={styles.settingGroup}>
                    <label className={styles.settingLabel}>Loại câu hỏi</label>
                    <select
                        value={question.question_type}
                        onChange={(e) => onUpdate({ 
                            question_type: e.target.value, 
                            options: ['multiple_choice', 'checkbox'].includes(e.target.value) ? question.options : [] 
                        })}
                        className={styles.select}
                    >
                        {questionTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                <label className={styles.checkboxGroup}>
                    <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={question.is_required}
                        onChange={(e) => onUpdate({ is_required: e.target.checked })}
                    />
                    <span className={styles.checkboxLabel}>Bắt buộc trả lời</span>
                </label>
            </div>

            {/* Options for multiple choice/checkbox */}
            {needsOptions && (
                <div className={styles.optionsSection}>
                    <div className={styles.optionsLabel}>Các lựa chọn</div>
                    
                    <div className={styles.optionsList}>
                        {(question.options || []).map((option, optIndex) => (
                            <div key={option.option_id} className={styles.optionRow}>
                                <div className={isRadio ? styles.optionIndicatorRadio : styles.optionIndicator}>
                                    {String.fromCharCode(65 + optIndex)}
                                </div>
                                <input
                                    type="text"
                                    className={styles.optionInput}
                                    placeholder={`Lựa chọn ${optIndex + 1}...`}
                                    value={option.option_text}
                                    onChange={(e) => updateOption(option.option_id, e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => deleteOption(option.option_id)}
                                    className={styles.optionDeleteBtn}
                                    title="Xóa lựa chọn"
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={addOption}
                        className={styles.addOptionBtn}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                        Thêm lựa chọn
                    </button>
                </div>
            )}

            {/* Rating Preview */}
            {question.question_type === 'rating' && (
                <div className={styles.ratingPreview}>
                    <div className={styles.ratingLabel}>Xem trước</div>
                    <div className={styles.ratingStars}>
                        {[1, 2, 3, 4, 5].map(num => (
                            <span key={num} className={styles.ratingStar}>★</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionBuilder;
