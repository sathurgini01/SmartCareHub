import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { login as loginApi, register as registerApi, getProfile } from '../api/authApi';

export const AuthContext = createContext(null);
const normalizeRole = (role) => (typeof role === 'string' ? role.toLowerCase() : role);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          // Set axios default header for all subsequent requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          const res = await getProfile();
          setUser(res.data.user || res.data);
          setToken(savedToken);
        } catch (error) {
          console.error('Profile fetch failed:', error);
          logout();
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const login = async (arg1, arg2) => {
    let loginData;
    if (typeof arg1 === 'string' && typeof arg2 === 'string') {
      loginData = { email: arg1, password: arg2 };
    } else {
      loginData = arg1;
    }

    const res = await loginApi(loginData);
    const { token: newToken, user: userData } = res.data;
    const finalUser = userData || res.data?.user || res.data;
    const expectedRole = normalizeRole(loginData?.role);
    const actualRole = normalizeRole(finalUser?.role);

    if (expectedRole && actualRole && expectedRole !== actualRole) {
      throw new Error(`This account is ${actualRole}, not ${expectedRole}.`);
    }

    localStorage.setItem('token', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(finalUser);
    
    return { success: true, user: finalUser };
  };

  const register = async (arg1, arg2) => {
    const data = typeof arg1 === 'string' ? { ...(arg2 || {}), role: normalizeRole(arg1) } : { ...(arg1 || {}) };
    if (data.role) {
      data.role = normalizeRole(data.role);
    }

    const res = await registerApi(data);
    if (res.data.token) {
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setUser(userData);
    }
    return { success: true, ...res.data };
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;
  const isAdmin = user?.role === 'admin';
  const isDoctor = user?.role === 'doctor';
  const isPatient = user?.role === 'patient';

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      register, 
      loading,
      isAuthenticated,
      isAdmin,
      isDoctor,
      isPatient,
      // Legacy compatibility
      loginUser: login,
      logoutUser: logout,
      registerUser: register,
      session: { user, token, role: user?.role }
    }}>
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

export default AuthContext;
