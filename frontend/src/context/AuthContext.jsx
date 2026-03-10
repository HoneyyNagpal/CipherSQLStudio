import { createContext, useContext, useState, useCallback } from 'react';
import { signup as apiSignup, login as apiLogin } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const saveSession = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const { token, user: userData } = await apiLogin(email, password);
      saveSession(token, userData);
      return true;
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      setAuthError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (username, email, password) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const { token, user: userData } = await apiSignup(username, email, password);
      saveSession(token, userData);
      return true;
    } catch (err) {
      const msg = err.response?.data?.error || 'Signup failed. Please try again.';
      setAuthError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  return (
    <AuthContext.Provider value={{ user, isLoading, authError, login, signup, logout, clearAuthError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
