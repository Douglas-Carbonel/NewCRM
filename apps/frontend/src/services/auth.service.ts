import { strapiClient, setAuthToken, clearAuthToken } from './api';

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
}

export interface AuthResponse {
  jwt: string;
  user: AuthUser;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await strapiClient.post<AuthResponse>('/api/auth/local', payload);
    setAuthToken(data.jwt);
    return data;
  },

  async getMe(): Promise<AuthUser> {
    const { data } = await strapiClient.get<AuthUser>('/api/users/me');
    return data;
  },

  logout(): void {
    clearAuthToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },
};
