// src/pages/CreatePoll.js
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { pollAPI, userAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { debounce } from 'lodash';

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
        // fallback to get all users
        try {
          const res = await userAPI.getAllUsers();
          const users = Array.isArray(res.data)
  ? res.data
  : res.data.data || [];

const filtered = users.filter((u) => u.user_id !== user.user_id);

          setSearchResults(filtered);
        } catch (err) {
          console.error('❌ Không thể tìm user:', err);
          setSearchResults([]);
        }
      } finally {
        setSearchLoading(false);
      }
    }, 500),
    [user.user_id]
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
    setErrors(prev => ({ ...prev, options: '' }));
  };

  const addOption = () => setOptions([...options, '']);
  const removeOption = (index) => {
    if (options.length > 2) setOptions(options.filter((_, i) => i !== index));
  };

  const addParticipant = (u) => {
    if (!participants.some(p => p.user_id === u.user_id)) {
      setParticipants([...participants, u]);
    }
    setSearchTerm('');
    setSearchResults([]);
  };

  const removeParticipant = (uid) => {
    setParticipants(participants.filter(p => p.user_id !== uid));
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Vui lòng nhập tiêu đề';
    if (options.filter(opt => opt.trim()).length < 2) errs.options = 'Cần ít nhất 2 lựa chọn';
    if (formData.start_time && formData.end_time &&
        new Date(formData.start_time) >= new Date(formData.end_time)) {
      errs.end_time = 'Thời gian kết thúc phải sau bắt đầu';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      // Tạo pollData mà KHÔNG bao gồm creator_id
      const pollData = {
        title: formData.title,
        description: formData.description,
        poll_type: formData.poll_type,
        is_anonymous: formData.is_anonymous,
        options: options.filter(opt => opt.trim()),
        participants: participants.map(p => p.user_id),
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
      };
      
      console.log('📤 Sending poll data (no creator_id):', pollData);
      
      const res = await pollAPI.createPoll(pollData);
      toast.success('Tạo bình chọn thành công!');
      navigate(`/polls/${res.data.poll_id}`);
    } catch (err) {
      console.error('❌ Create poll error:', err);
      const msg = err.response?.data?.message || 'Lỗi tạo bình chọn';
      toast.error(msg);
      setErrors({ submit: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tạo bình chọn mới</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tiêu đề */}
        <div>
          <label className="label">Tiêu đề *</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`input-field ${errors.title ? 'border-red-500' : ''}`}
            placeholder="Tiêu đề bình chọn"
          />
          {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
        </div>

        {/* Mô tả */}
        <div>
          <label className="label">Mô tả</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="input-field"
            placeholder="Mô tả (tùy chọn)"
          />
        </div>

        {/* Lựa chọn */}
        <div>
          <label className="label">Lựa chọn *</label>
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                type="text"
                value={opt}
                onChange={(e) => handleOptionChange(i, e.target.value)}
                className="input-field flex-1"
                placeholder={`Lựa chọn ${i + 1}`}
              />
              {options.length > 2 && (
                <button type="button" onClick={() => removeOption(i)} className="text-red-600">X</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addOption} className="text-blue-600 mt-2">+ Thêm lựa chọn</button>
          {errors.options && <p className="text-red-500 text-sm">{errors.options}</p>}
        </div>

        {/* Cấu hình */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="poll_type"
              checked={formData.poll_type === 'multiple'}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, poll_type: e.target.checked ? 'multiple' : 'single' }))
              }
            />
            Chọn nhiều đáp án
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_anonymous"
              checked={formData.is_anonymous}
              onChange={handleInputChange}
            />
            Ẩn danh
          </label>
        </div>

        {/* Thời gian */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Thời gian bắt đầu</label>
            <input
              type="datetime-local"
              name="start_time"
              value={formData.start_time}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Thời gian kết thúc</label>
            <input
              type="datetime-local"
              name="end_time"
              value={formData.end_time}
              onChange={handleInputChange}
              className={`input-field ${errors.end_time ? 'border-red-500' : ''}`}
            />
            {errors.end_time && <p className="text-red-500 text-sm">{errors.end_time}</p>}
          </div>
        </div>

        {/* Người tham gia */}
        <div>
          <label className="label">Tìm người tham gia</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              debouncedSearch(e.target.value);
            }}
            className="input-field"
            placeholder="Nhập tên, email hoặc username..."
          />
          {searchLoading && <p className="text-gray-500 text-sm mt-1">Đang tìm kiếm...</p>}
          {searchResults.length > 0 && (
            <div className="border rounded p-2 mt-2 bg-gray-50 max-h-40 overflow-y-auto">
              {searchResults.map((u) => (
                <div
                  key={u.user_id}
                  onClick={() => addParticipant(u)}
                  className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                >
                  {u.full_name} ({u.username})
                </div>
              ))}
            </div>
          )}
          {participants.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {participants.map((p) => (
                <span
                  key={p.user_id}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center"
                >
                  {p.username}
                  <button
                    type="button"
                    onClick={() => removeParticipant(p.user_id)}
                    className="ml-2 text-blue-500 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4 mt-6">
          <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary">Hủy</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Đang tạo...' : 'Tạo bình chọn'}
          </button>
        </div>

        {errors.submit && <p className="text-red-500 text-center mt-2">{errors.submit}</p>}
      </form>
    </div>
  );
};

export default CreatePoll;