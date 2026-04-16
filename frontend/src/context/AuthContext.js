import { createContext, useContext, useEffect, useState } from 'react';
import {
  bootstrapSession,
  login,
  logout,
  registerAdmin,
  registerDoctor
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    bootstrapSession()
      .then((savedSession) => setSession(savedSession))
      .finally(() => setAuthLoading(false));
  }, []);

  async function loginUser(payload) {
    const nextSession = await login(payload);
    setSession(nextSession);
    return nextSession;
  }

  async function registerUser(role, payload) {
    return role === 'admin' ? registerAdmin(payload) : registerDoctor(payload);
  }

  async function logoutUser() {
    await logout();
    setSession(null);
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        role: session?.role || null,
        authLoading,
        loginUser,
        registerUser,
        logoutUser,
        setSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
