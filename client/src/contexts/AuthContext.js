import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // axios 기본 설정
  axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // axios 인터셉터 추가 - 토큰 만료 시 자동 로그아웃
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          // 토큰이 유효하지 않거나 만료된 경우
          console.log('토큰이 만료되었습니다. 자동 로그아웃합니다.');
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
          setError(null);
          toast.error('로그인이 만료되었습니다. 다시 로그인해주세요.');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Set authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await axios.get('/api/auth/me');
      setUser({
        ...response.data.user,
        token: token // 토큰을 user 객체에 추가
      });
      setError(null);
    } catch (error) {
      console.log('Auth check failed:', error.message);
      // Clear invalid token
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setError(null); // Don't show error for failed auth check
    } finally {
      setLoading(false);
    }
  };

  // 회원가입
  const register = (userData) => {
    return new Promise(async (resolve, reject) => {
      try {
        setLoading(true);
        const response = await axios.post('/api/auth/register', userData);
        const { token, user } = response.data;
        
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser({
          ...user,
          token: token // 토큰을 user 객체에 추가
        });
        setError(null);
        
        toast.success('회원가입이 완료되었습니다!');
        resolve({ success: true });
      } catch (error) {
        const message = error.response?.data?.message || '회원가입 중 오류가 발생했습니다.';
        setError(message);
        toast.error(message);
        reject({ success: false, error: message });
      } finally {
        setLoading(false);
      }
    });
  };

  // 로그인
  const login = (credentials) => {
    return new Promise(async (resolve, reject) => {
      try {
        setLoading(true);
        const response = await axios.post('/api/auth/login', credentials);
        const { token, user } = response.data;
        
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser({
          ...user,
          token: token // 토큰을 user 객체에 추가
        });
        setError(null);
        
        toast.success('로그인이 완료되었습니다!');
        resolve({ success: true });
      } catch (error) {
        const message = error.response?.data?.message || '로그인 중 오류가 발생했습니다.';
        setError(message);
        toast.error(message);
        reject({ success: false, error: message });
      } finally {
        setLoading(false);
      }
    });
  };

  // 로그아웃
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setError(null);
    toast.success('로그아웃되었습니다.');
  };

  // 사용자 정보 업데이트
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  // 프로필 업데이트
  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/api/users/profile', profileData);
      const updatedUser = response.data.user;
      
      setUser(updatedUser);
      toast.success('프로필이 업데이트되었습니다!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || '프로필 업데이트 중 오류가 발생했습니다.';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    login,
    logout,
    register,
    updateUser,
    updateProfile,
    loading,
    error,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 