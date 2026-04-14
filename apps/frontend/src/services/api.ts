import axios from 'axios';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export const strapiClient = axios.create({
  baseURL: STRAPI_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

strapiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('strapi_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

strapiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('strapi_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('strapi_token', token);
  }
}

export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('strapi_token');
  }
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('strapi_token');
}
