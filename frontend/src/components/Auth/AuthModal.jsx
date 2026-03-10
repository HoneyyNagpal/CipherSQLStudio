import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AuthModal.scss';

const AuthModal = ({ mode: initialMode, onClose }) => {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const { login, signup, isLoading, authError, clearAuthError } = useAuth();

  // Clear errors when switching mode
  useEffect(() => {
    clearAuthError();
    setForm({ username: '', email: '', password: '' });
  }, [mode, clearAuthError]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let success;
    if (mode === 'login') {
      success = await login(form.email, form.password);
    } else {
      success = await signup(form.username, form.email, form.password);
    }
    if (success) onClose();
  };

  return (
    <div className="auth-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="auth-modal" role="dialog" aria-modal="true">
        <div className="auth-modal__header">
          <div className="auth-modal__logo">{'>'}_</div>
          <h2 className="auth-modal__title">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="auth-modal__subtitle">
            {mode === 'login'
              ? 'Log in to save your query attempts'
              : 'Sign up to track your progress'}
          </p>
          <button className="auth-modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form className="auth-modal__form" onSubmit={handleSubmit} noValidate>
          {mode === 'signup' && (
            <div className="auth-modal__field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                placeholder="your_username"
                required
                minLength={3}
                maxLength={30}
                autoComplete="username"
              />
            </div>
          )}

          <div className="auth-modal__field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-modal__field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {authError && (
            <div className="auth-modal__error" role="alert">
              {authError}
            </div>
          )}

          <button
            type="submit"
            className={`btn btn--primary auth-modal__submit${isLoading ? ' btn--loading' : ''}`}
            disabled={isLoading}
          >
            {!isLoading && (mode === 'login' ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <div className="auth-modal__footer">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button className="auth-modal__switch-btn" onClick={() => setMode('signup')}>
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button className="auth-modal__switch-btn" onClick={() => setMode('login')}>
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
