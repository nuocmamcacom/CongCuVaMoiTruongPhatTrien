// Login.js - Fixed version
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '', // Backend expects 'username', not 'email'
    password: ''
  });

  // Method 1: Using controlled inputs (Recommended)
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Login credentials:', formData); // Debug log
    
    // Validate
    if (!formData.username || !formData.password) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const result = await login(formData);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  // Method 2: Alternative - Extract from FormData properly
  const handleSubmitFormData = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    // Convert FormData to plain object
    const credentials = {
      username: formData.get('username'), // Backend expects 'username'
      password: formData.get('password')
    };
    
    console.log('Login credentials:', credentials); // Debug log
    
    // Validate
    if (!credentials.username || !credentials.password) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const result = await login(credentials);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đăng nhập vào tài khoản của bạn
          </h2>
        </div>
        
        {/* Method 1: Controlled form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username hoặc Email
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username hoặc địa chỉ email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Mật khẩu"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Chưa có tài khoản? Đăng ký ngay
            </Link>
          </div>
        </form>

        {/* Method 2: Uncontrolled form - Alternative approach */}
        {/* 
        <form className="mt-8 space-y-6" onSubmit={handleSubmitFormData}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                name="email"
                type="email"
                required
                className="..."
                placeholder="Địa chỉ email"
              />
            </div>
            <div>
              <input
                name="password"
                type="password"
                required
                className="..."
                placeholder="Mật khẩu"
              />
            </div>
          </div>
          <button type="submit">Đăng nhập</button>
        </form>
        */}
      </div>
    </div>
  );
};

export default Login;