import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [therapistProfile, setTherapistProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Get current user details on bootstrap or token update
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setTherapistProfile(null);
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
        setTherapistProfile(res.data.therapistProfile);
      } catch (error) {
        console.error('Session validation failed:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: userToken, user: userData } = res.data;
      
      localStorage.setItem('token', userToken);
      setToken(userToken);
      setUser(userData);
      toast.success('Logged in successfully!');
      return { success: true, user: userData };
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check credentials.';
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (formData, isMultipart = false) => {
    setLoading(true);
    try {
      const config = isMultipart 
        ? { headers: { 'Content-Type': 'multipart/form-data' } } 
        : {};

      const res = await api.post('/auth/signup', formData, config);
      const { token: userToken, user: userData } = res.data;

      localStorage.setItem('token', userToken);
      setToken(userToken);
      setUser(userData);
      toast.success('Registration completed successfully!');
      return { success: true, user: userData };
    } catch (error) {
      // Parse validation errors
      let msg = 'Registration failed.';
      if (error.response?.data?.errors) {
        msg = error.response.data.errors.map(err => err.msg).join(' ');
      } else if (error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setTherapistProfile(null);
    toast.success('Logged out successfully.');
  };

  const updateContextUser = (updatedUser, updatedProfile = null) => {
    setUser(updatedUser);
    if (updatedProfile) {
      setTherapistProfile(updatedProfile);
    }
  };

  return (
    <AuthContext.Provider value={{ user, therapistProfile, token, loading, login, signup, logout, updateContextUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
