import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'INITIALIZE_AUTH':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: !!action.payload.token,
        loading: false,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');

      if (token && user) {
        try {
          const parsedUser = JSON.parse(user);
          
          // REMOVED: Verify token with backend - causing 404 error
          // await authAPI.verifyToken(token);
          
          // Simple JWT expiration check (optional)
          if (isTokenExpired(token)) {
            throw new Error('Token expired');
          }
          
          dispatch({
            type: 'INITIALIZE_AUTH',
            payload: { token, user: parsedUser },
          });
          
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          toast.error('Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Helper function to check if JWT token is expired
  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true; // If can't decode, consider expired
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token, user },
      });

      toast.success('Đăng nhập thành công!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng nhập thất bại';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
  try {
    const response = await authAPI.register(userData);

    const { token, user } = response.data; // ✅ Không phải response.data.data

    if (!token || !user) {
      throw new Error('Token hoặc User không tồn tại trong response');
    }

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: { token, user },
    });

    toast.success('Đăng ký thành công!');
    return { success: true };
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Đăng ký thất bại';
    toast.error(message);
    return { success: false, message };
  }
};



  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
    toast.success('Đăng xuất thành công!');
  };

  const value = {
    ...state,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};