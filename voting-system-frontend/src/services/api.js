import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
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
    console.log('Calling getPollDetails with pollId:', pollId); // Log pollId
    if (!pollId || isNaN(pollId)) {
      throw new Error('Invalid pollId: must be a number');
    }
    return api.get(`/polls/${pollId}`);
  },
  createPoll: (data) => api.post('/polls', data),
  castVote: (data) => api.post('/polls/vote', data),
};

// api.js - thêm function này
export const getAllUsers = async () => {
  try {
    console.log('🚀 Getting all users...');
    const response = await api.get('/users'); // hoặc '/users/all'
    console.log('✅ Users loaded:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Get all users error:', error.response?.data);
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
    console.log('🚀 Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Thêm response interceptor để debug
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export default api;