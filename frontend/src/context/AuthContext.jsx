import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { login as loginApi, register as registerApi, getProfile } from '../api/authApi';

export const AuthContext = createContext(null);
const normalizeRole = (role) => (typeof role === 'string' ? role.toLowerCase() : role);
const SESSION_KEY = 'smartcare-platform-session';
const TOKEN_KEY = 'token';

const readJson = (value) => {
  try {
    return value ? JSON.parse(value) : null;
  } catch (_error) {
    return null;
  }
};

const getSavedSession = () =>
  readJson(sessionStorage.getItem(SESSION_KEY));

const getSavedToken = () =>
  sessionStorage.getItem(TOKEN_KEY) ||
  getSavedSession()?.token ||
  '';

const normalizeUser = (userData) => {
  if (!userData) return null;
  const user = { ...userData };
  if (!user.id && user.userId) user.id = user.userId;
  if (!user.id && user._id) user.id = user._id;
  if (!user.fullName && user.name) user.fullName = user.name;
  return user;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getSavedToken());
  const [loading, setLoading] = useState(true);

  const updateSession = useCallback((newToken, userData) => {
    const normalizedUser = normalizeUser(userData);

    if (newToken) {
      const session = { token: newToken, user: normalizedUser, role: normalizedUser?.role };
      sessionStorage.setItem(TOKEN_KEY, newToken);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(SESSION_KEY);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_KEY);
      delete axios.defaults.headers.common['Authorization'];
      setToken(null);
    }
  }, []);

  const setSession = useCallback((nextSession) => {
    const currentSession = { token, user, role: user?.role };
    const resolvedSession =
      typeof nextSession === 'function' ? nextSession(currentSession) : nextSession;

    const nextToken = resolvedSession?.token || token;
    const nextUser = normalizeUser(resolvedSession?.user || user);

    if (!nextToken || !nextUser) {
      updateSession(null);
      setUser(null);
      return;
    }

    updateSession(nextToken, nextUser);
    setUser(nextUser);
  }, [token, updateSession, user]);

  const logout = useCallback(() => {
    updateSession(null);
    setUser(null);
  }, [updateSession]);

  useEffect(() => {
    const fetchProfile = async () => {
      const savedSession = getSavedSession();
      const savedToken = getSavedToken();
      if (savedToken) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          const res = await getProfile();
          const userData = normalizeUser(res.data.user || res.data || savedSession?.user);
          setUser(userData);
          setToken(savedToken);
          updateSession(savedToken, userData);
        } catch (error) {
          console.error('Profile fetch failed:', error);
          logout();
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, [logout, updateSession]);

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
  }, [updateSession]);

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
  }, [updateSession]);

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
      setSession,
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
