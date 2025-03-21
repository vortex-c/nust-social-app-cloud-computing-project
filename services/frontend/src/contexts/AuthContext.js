import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkUserStatus(token);
    } else {
      setLoading(false);
    }
  }, []);

  const checkUserStatus = async (token) => {
    try {
      const res = await axios.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (res.data.success) {
        setCurrentUser(res.data.user);
      } else {
        localStorage.removeItem('token');
      }
    } catch (err) {
      console.error('Error checking authentication status:', err);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const res = await axios.post('/api/auth/login', { email, password });
      
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setCurrentUser(res.data.user);
        return true;
      }
    } catch (err) {
        console.log(err)
      setError(
        err.response?.data?.message || 
        'Login failed. Please check your credentials.'
      );
      return false;
    }
  };

  const register = async (username, email, password) => {
    try {
      setError(null);
      const res = await axios.post('/api/auth/register', { 
        username, 
        email, 
        password 
      });
      
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setCurrentUser(res.data.user);
        return true;
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Registration failed. Please try again.'
      );
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};