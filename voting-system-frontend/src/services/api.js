import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  verifyToken: (token) => api.get('/auth/verify', { headers: { Authorization: `Bearer ${token}` } }),
};


export const pollAPI = {
  getPolls: () => api.get('/polls'),
  getPollDetails: (pollId) => {
    if (!pollId || typeof pollId !== 'string') {
      throw new Error('Invalid pollId: must be a string');
    }
    return api.get(`/polls/${pollId}`);
  },
  createPoll: (data) => api.post('/polls', data),
  castVote: (data) => api.post('/polls/vote', data),
};

// api.js - thêm function này
export const getAllUsers = async () => {
  try {
    const response = await api.get('/users'); // hoặc '/users/all'
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const userAPI = {
    searchUsers: (query) => api.get(`/users/search?q=${encodeURIComponent(query)}`),
    getAllUsers: () => api.get('/users'),
};
// Thêm vào api.js
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;