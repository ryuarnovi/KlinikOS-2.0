import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Get API URL from env, fallback to localhost
const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
const VITE_API_URL = typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL;

const API_URL: string = NEXT_PUBLIC_API_URL || VITE_API_URL || 'http://localhost:9090/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error: AxiosError) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_URL };
