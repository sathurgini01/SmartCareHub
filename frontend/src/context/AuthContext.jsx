import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { login as loginApi, register as registerApi, getProfile } from '../api/authApi';

export const AuthContext = createContext(null);
const normalizeRole = (role) => (typeof role === 'string' ? role.toLowerCase() : role);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const normalizeUser = (userData) => {
    if (!userData) return null;
    const user = { ...userData };
    if (!user.id && user.userId) user.id = user.userId;
    if (!user.id && user._id) user.id = user._id;
    if (!user.fullName && user.name) user.fullName = user.name;
    return user;
  };

  const updateSession = (newToken, userData) => {
    if (newToken) {
      sessionStorage.setItem('token', newToken);
      sessionStorage.setItem('smartcare-platform-session', JSON.stringify({ token: newToken, user: userData }));
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
    } else {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('smartcare-platform-session');
      delete axios.defaults.headers.common['Authorization'];
      setToken(null);
    }
  };

  const logout = useCallback(() => {
    updateSession(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const savedToken = sessionStorage.getItem('token');
      if (savedToken) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          const res = await getProfile();
          const userData = normalizeUser(res.data.user || res.data);
          setUser(userData);
          setToken(savedToken);
          // Sync session
          sessionStorage.setItem('smartcare-platform-session', JSON.stringify({ token: savedToken, user: userData }));
        } catch (error) {
          console.error('Profile fetch failed:', error);
          logout();
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, [logout]);

  const login = useCallback(async (arg1, arg2, arg3) => {
    let loginData;
    if (typeof arg1 === 'string' && typeof arg2 === 'string') {
      loginData = { email: arg1, password: arg2 };
      if (arg3) loginData.role = arg3;
      else if (typeof arg3 === 'object') Object.assign(loginData, arg3);
    } else {
      loginData = arg1;
    }
    
    const res = await loginApi(loginData);
    const newToken = res.data.token;
    const userData = normalizeUser(res.data.user || res.data);
    
    const expectedRole = normalizeRole(loginData?.role);
    const actualRole = normalizeRole(userData?.role);

    if (expectedRole && actualRole && expectedRole !== actualRole) {
      throw new Error(`This account is ${actualRole}, not ${expectedRole}.`);
    }

    if (userData) delete userData.token;

    updateSession(newToken, userData);
    setUser(userData);
    
    return { success: true, user: userData };
  }, []);

  const register = useCallback(async (arg1, arg2) => {
    let registerData;
    if (typeof arg1 === 'string' && typeof arg2 === 'object') {
       registerData = { ...arg2, role: normalizeRole(arg1) };
    } else {
       registerData = { ...arg1 };
       if (registerData.role) registerData.role = normalizeRole(registerData.role);
    }

    const res = await registerApi(registerData);
    if (res.data && res.data.token) {
       const newToken = res.data.token;
       const userData = normalizeUser(res.data.user || res.data);
       if (userData) delete userData.token;

       updateSession(newToken, userData);
       setUser(userData);
    }
    return { success: true, ...res.data };
  }, []);

  const isAuthenticated = !!token;
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const isDoctor = user?.role?.toLowerCase() === 'doctor';
  const isPatient = user?.role?.toLowerCase() === 'patient';

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
