import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally - clear stale tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// ─── Assignment APIs ───────────────────────────────────────────────────────────
export const fetchAssignments = () =>
  api.get('/assignments').then(r => r.data.assignments);

export const fetchAssignment = (id) =>
  api.get(`/assignments/${id}`).then(r => r.data.assignment);

export const fetchSchema = (id) =>
  api.get(`/assignments/${id}/schema`).then(r => r.data.schemas);

export const fetchSampleData = (id) =>
  api.get(`/assignments/${id}/sample-data`).then(r => r.data.sampleData);

// ─── Query APIs ────────────────────────────────────────────────────────────────
export const executeQuery = (assignmentId, sql) =>
  api.post('/query/execute', { assignmentId, sql }).then(r => r.data);

export const fetchAttempts = (assignmentId) =>
  api.get(`/query/attempts/${assignmentId}`).then(r => r.data.attempts);

// ─── Hint APIs ─────────────────────────────────────────────────────────────────
export const fetchHint = ({ assignmentId, currentQuery, errorMessage, questionPart }) =>
  api.post('/hint', { assignmentId, currentQuery, errorMessage, questionPart }).then(r => r.data.hint);

// ─── Auth APIs ─────────────────────────────────────────────────────────────────
export const signup = (username, email, password) =>
  api.post('/auth/signup', { username, email, password }).then(r => r.data);

export const login = (email, password) =>
  api.post('/auth/login', { email, password }).then(r => r.data);

export default api;
