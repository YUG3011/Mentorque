import axios from 'axios';

const FALLBACK_API_URL = 'https://mentorque-backend-0dvh.onrender.com/api';

function resolveApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL?.trim();
  const base = envUrl && /^https?:\/\//i.test(envUrl) ? envUrl : FALLBACK_API_URL;
  const normalizedBase = base.replace(/\/+$/, '');

  // Support both forms: https://host and https://host/api
  return normalizedBase.endsWith('/api') ? normalizedBase : `${normalizedBase}/api`;
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't perform a global redirect for login attempts — let the caller handle errors.
      const requestPath = error.config?.url || '';
      const isAuthLogin = /\/auth\/(user|mentor|admin)\/login/.test(requestPath);
      if (!isAuthLogin) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
      // If it was an auth login request, simply reject and allow the login form to show the error.
    }
    return Promise.reject(error);
  }
);

export default api;
