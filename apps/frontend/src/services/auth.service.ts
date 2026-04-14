import { sapClient } from './api';

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface AuthUser {
  username: string;
}

const SAP_USER_KEY = 'sap_user';

export const authService = {
  async login(payload: LoginPayload): Promise<AuthUser> {
    const { data } = await sapClient.post<{ ok: boolean; user: string }>('/auth/login', {
      username: payload.identifier,
      password: payload.password,
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem(SAP_USER_KEY, data.user);
    }
    return { username: data.user };
  },

  getUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const username = localStorage.getItem(SAP_USER_KEY);
    return username ? { username } : null;
  },

  isLoggedIn(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(SAP_USER_KEY);
  },

  logout(): void {
    sapClient.post('/auth/logout').catch(() => {});
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SAP_USER_KEY);
      window.location.href = '/login';
    }
  },
};
