import api from '@/config/api';
import type { Patient } from '@/types';

export interface CreatePatientRequest {
  nik: string;
  full_name: string;
  date_of_birth: string;
  gender: 'L' | 'P';
  phone?: string;
  address?: string;
  blood_type?: string;
  allergies?: string;
  emergency_contact?: string;
  emergency_contact_phone?: string;
  is_walkin: boolean;
}

export const patientService = {
  getAll: async (): Promise<Patient[]> => {
    const res = await api.get('/patients');
    return res.data.data || [];
  },

  getById: async (id: string): Promise<Patient> => {
    const res = await api.get(`/patients/${id}`);
    return res.data.data;
  },

  create: async (data: CreatePatientRequest): Promise<Patient> => {
    const res = await api.post('/patients', data);
    return res.data.data;
  },

  update: async (id: string, data: Partial<CreatePatientRequest>): Promise<Patient> => {
    const res = await api.put(`/patients/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/patients/${id}`);
  },
};
