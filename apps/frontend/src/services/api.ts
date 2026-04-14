import axios from 'axios';

export const sapClient = axios.create({
  baseURL: '/api/sap',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

sapClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('sap_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
