import api from '@/config/api';

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone: string;
  nip?: string;
  specialization?: string;
  license_number?: string;
  role: string;
  is_active: boolean;
  profile_picture_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  nip?: string;
  specialization?: string;
  license_number?: string;
  role: string;
}

export interface UpdateUserRequest {
  full_name?: string;
  email?: string;
  phone?: string;
  nip?: string;
  specialization?: string;
  license_number?: string;
  role?: string;
  is_active?: boolean;
  password?: string;
}

export const userService = {
  getAll: async (): Promise<UserResponse[]> => {
    const res = await api.get('/users');
    return res.data.data;
  },

  getById: async (id: number): Promise<UserResponse> => {
    const res = await api.get(`/users/${id}`);
    return res.data.data;
  },

  create: async (data: CreateUserRequest): Promise<UserResponse> => {
    const res = await api.post('/users', data);
    return res.data;
  },

  update: async (id: number, data: UpdateUserRequest): Promise<void> => {
    await api.put(`/users/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  getMe: async (): Promise<UserResponse> => {
    const res = await api.get('/users/me');
    return res.data.data;
  },

  updateMe: async (data: UpdateUserRequest): Promise<void> => {
    await api.put('/users/me', data);
  },

  uploadMePhoto: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post('/users/me/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.url;
  }
};
