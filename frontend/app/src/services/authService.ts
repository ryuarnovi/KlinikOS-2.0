import api from '@/config/api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email?: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await api.post('/login', data);
    const payload = res.data.data as LoginResponse;
    localStorage.setItem('token', payload.token);
    localStorage.setItem('user', JSON.stringify(payload.user));
    return payload;
  },

  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const res = await api.post('/register', data);
    const payload = res.data.data as LoginResponse;
    localStorage.setItem('token', payload.token);
    localStorage.setItem('user', JSON.stringify(payload.user));
    return payload;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: (): AuthUser | null => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
      const user = JSON.parse(raw) as AuthUser;
      if (user && user.role) {
        user.role = user.role.toLowerCase();
      }
      return user;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  },

  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  },

  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  },
};
