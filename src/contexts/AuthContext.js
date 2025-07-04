// client/src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import api from '../services/api.js'; // Use your configured axios instance

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        // No need to set header here if interceptor does it globally
        // api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (err) {
          console.error("AuthContext: Failed to fetch user with token", err);
          localStorage.removeItem('token');
          // delete api.defaults.headers.common['Authorization']; // Interceptor will handle not adding it
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      setUser(response.data);
      return response.data; // Important for AdminLoginPage to check role immediately
    } catch (error) {
      console.error("AuthContext Login failed:", error.response?.data?.message || error.message);
      throw error.response?.data || error; // Re-throw for component to handle
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      // Only auto-login if not a coach (coaches need approval)
      if (response.data?.role !== 'Coach') {
        localStorage.setItem('token', response.data.token);
        setUser(response.data);
      }
      return response.data;
    } catch (error) {
      console.error("AuthContext Register failed:", error.response?.data?.message || error.message);
      throw error.response?.data || error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    // delete api.defaults.headers.common['Authorization']; // Interceptor will handle this
    setUser(null);
    // Optionally navigate to login or home page: navigate('/login'); (if navigate is available here)
  };

  const getDashboardPath = (user) => {
  if (!user) {
    // Default for guests is the login page.
    return "/login";
  }

  switch (user?.role) {
    case "Admin":
      return "/admin/dashboard";
    case "Coach":
      // A coach's dashboard path might depend on whether they manage a club.
      if (user.isApproved && user.managedClub?._id) {
        // If they manage a club, their main dashboard IS the club dashboard.
        return `/club/${user.managedClub._id}/dashboard`; 
      }
      return "/coach/dashboard"; // A generic dashboard for coaches without a club yet.
    case "Player":
      return "/player/dashboard";
    default:
      // A fallback for any other case, returning to the homepage is safe.
      return "/";
  }
};

  const dashboardPath = useMemo(() => getDashboardPath(user), [user]);


  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading, dashboardPath }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);