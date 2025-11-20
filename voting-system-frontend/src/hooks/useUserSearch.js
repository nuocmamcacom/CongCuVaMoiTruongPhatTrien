// src/hooks/useUserSearch.js
import { useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';

/**
 * Custom hook để tìm kiếm người dùng kèm loading và debounce
 * @param {number} excludeUserId - ID của người dùng hiện tại cần loại bỏ khỏi kết quả
 */
export const useUserSearch = (excludeUserId) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = useCallback(
    debounce(async (query) => {
      if (!query || query.trim().length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await userAPI.searchUsers(query.trim());
        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];

        const filtered = data.filter(
          (u) => u.user_id !== excludeUserId
        );

        setResults(filtered);
      } catch (err) {
        console.error('❌ Lỗi tìm user:', err);
        toast.error('Không thể tìm người dùng');
      } finally {
        setLoading(false);
      }
    }, 500),
    [excludeUserId]
  );

  return {
    results,
    searchUsers,
    loading,
  };
};
