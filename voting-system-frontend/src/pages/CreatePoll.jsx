import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { pollAPI, userAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext.jsx';
import toast from 'react-hot-toast';
import { debounce } from 'lodash';
import styles from './CreatePoll.module.scss';

const CreatePoll = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    poll_type: 'single',
    is_anonymous: false,
    start_time: '',
    end_time: '',
  });

  const [options, setOptions] = useState(['', '']);
  const [participants, setParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Debounced search function (keep existing logic)
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query || query.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      setSearchLoading(true);
      try {
        const res = await userAPI.searchUsers(query);
        const filtered = res.data.filter(u => u.user_id !== user.user_id);
        setSearchResults(filtered);
      } catch {
        try {
          const res = await userAPI.getAllUsers();
          const users = Array.isArray(res.data) ? res.data : res.data.data || [];
          const filtered = users.filter((u) => u.user_id !== user.user_id);
          setSearchResults(filtered);
        } catch (error) {
          console.error('Search error:', error);
        }
      } finally {
        setSearchLoading(false);
      }
    }, 300),
    [user.user_id]
  );

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const addParticipant = (participant) => {
    const exists = participants.some(p => p.user_id === participant.user_id);
    if (!exists) {
      setParticipants([...participants, participant]);
      setSearchTerm('');
      setSearchResults([]);
    }
  };

  const removeParticipant = (userId) => {
    setParticipants(participants.filter(p => p.user_id !== userId));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Tiêu đề không được để trống';
    if (!formData.description.trim()) newErrors.description = 'Mô tả không được để trống';
    
    const validOptions = options.filter(opt => opt.trim());
    if (validOptions.length < 2) newErrors.options = 'Phải có ít nhất 2 lựa chọn';
    
    if (formData.start_time && formData.end_time) {
      if (new Date(formData.start_time) >= new Date(formData.end_time)) {
        newErrors.end_time = 'Thời gian kết thúc phải sau thời gian bắt đầu';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin form');
      return;
    }

    setLoading(true);
    try {
      const validOptions = options.filter(opt => opt.trim());
      const pollData = {
        ...formData,
        options: validOptions,
        participants: participants.map(p => p.user_id)
      };

      const response = await pollAPI.createPoll(pollData);
      toast.success('Tạo bình chọn thành công!');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Có lỗi xảy ra khi tạo bình chọn';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.createPoll}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <button 
              className={styles.backButton}
              onClick={() => navigate('/dashboard')}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Về Dashboard
            </button>
            <div>
              <h1 className={styles.title}>Tạo bình chọn mới</h1>
              <p className={styles.subtitle}>Tạo cuộc bình chọn để thu thập ý kiến từ cộng đồng</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.content}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Poll Information */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Thông tin bình chọn</h2>
              
              <div className={styles.field}>
                <label className={styles.label}>
                  Tiêu đề <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={`${styles.input} ${errors.title ? styles.error : ''}`}
                  placeholder="Nhập tiêu đề bình chọn..."
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
                {errors.title && <span className={styles.errorText}>{errors.title}</span>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  Mô tả <span className={styles.required}>*</span>
                </label>
                <textarea
                  className={`${styles.textarea} ${errors.description ? styles.error : ''}`}
                  placeholder="Mô tả chi tiết về cuộc bình chọn..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
                {errors.description && <span className={styles.errorText}>{errors.description}</span>}
              </div>
            </div>

            {/* Poll Options */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Lựa chọn</h2>
                <button 
                  type="button" 
                  className={styles.addButton}
                  onClick={addOption}
                  disabled={options.length >= 10}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
                  </svg>
                  Thêm lựa chọn
                </button>
              </div>

              <div className={styles.options}>
                {options.map((option, index) => (
                  <div key={index} className={styles.optionField}>
                    <label className={styles.optionLabel}>Lựa chọn {index + 1}</label>
                    <div className={styles.optionInput}>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder={`Lựa chọn ${index + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          className={styles.removeButton}
                          onClick={() => removeOption(index)}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {errors.options && <span className={styles.errorText}>{errors.options}</span>}
            </div>

            {/* Poll Settings */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Cài đặt</h2>
              
              <div className={styles.settingsGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>Loại bình chọn</label>
                  <select
                    className={styles.select}
                    value={formData.poll_type}
                    onChange={(e) => handleInputChange('poll_type', e.target.value)}
                  >
                    <option value="single">Chọn một</option>
                    <option value="multiple">Chọn nhiều</option>
                  </select>
                </div>

                <div className={styles.checkboxField}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={formData.is_anonymous}
                      onChange={(e) => handleInputChange('is_anonymous', e.target.checked)}
                    />
                    <span className={styles.checkboxText}>Ẩn danh</span>
                  </label>
                </div>
              </div>

              <div className={styles.timeGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>Thời gian bắt đầu</label>
                  <input
                    type="datetime-local"
                    className={styles.input}
                    value={formData.start_time}
                    onChange={(e) => handleInputChange('start_time', e.target.value)}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Thời gian kết thúc</label>
                  <input
                    type="datetime-local"
                    className={`${styles.input} ${errors.end_time ? styles.error : ''}`}
                    value={formData.end_time}
                    onChange={(e) => handleInputChange('end_time', e.target.value)}
                  />
                  {errors.end_time && <span className={styles.errorText}>{errors.end_time}</span>}
                </div>
              </div>
            </div>

            {/* Participants Search */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Tìm người tham gia</h2>
              
              <div className={styles.searchField}>
                <div className={styles.searchInput}>
                  <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                  </svg>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Tìm theo tên, email hoặc username..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      debouncedSearch(e.target.value);
                    }}
                  />
                </div>

                {searchResults.length > 0 && (
                  <div className={styles.searchResults}>
                    {searchResults.map((user) => (
                      <button
                        key={user.user_id}
                        type="button"
                        className={styles.searchResult}
                        onClick={() => addParticipant(user)}
                      >
                        <div className={styles.userAvatar}>
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.userInfo}>
                          <div className={styles.userName}>{user.username}</div>
                          <div className={styles.userEmail}>{user.email}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Participants */}
              {participants.length > 0 && (
                <div className={styles.participants}>
                  <h3 className={styles.participantsTitle}>Người tham gia đã chọn ({participants.length})</h3>
                  <div className={styles.participantsList}>
                    {participants.map((participant) => (
                      <div key={participant.user_id} className={styles.participant}>
                        <div className={styles.userAvatar}>
                          {participant.username.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.userInfo}>
                          <div className={styles.userName}>{participant.username}</div>
                          <div className={styles.userEmail}>{participant.email}</div>
                        </div>
                        <button
                          type="button"
                          className={styles.removeParticipant}
                          onClick={() => removeParticipant(participant.user_id)}
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L7 7.293l1.646-1.647a.5.5 0 0 1 .708.708L7.707 8l1.647 1.646a.5.5 0 0 1-.708.708L7 8.707 5.354 10.354a.5.5 0 0 1-.708-.708L6.293 8 4.646 6.354a.5.5 0 0 1 0-.708z"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className={styles.actions}>
              <button 
                type="button" 
                className={styles.cancelButton}
                onClick={() => navigate('/dashboard')}
                disabled={loading}
              >
                Hủy
              </button>
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className={styles.spinner} />
                    Đang tạo...
                  </>
                ) : (
                  'Tạo bình chọn'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePoll;