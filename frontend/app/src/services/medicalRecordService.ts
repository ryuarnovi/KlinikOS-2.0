import api from '@/config/api';
import type { MedicalRecord } from '@/types';

export interface CreateMedicalRecordRequest {
  patient_id: number;
  queue_id: number;
  doctor_id: number;
  visit_date: string; // "YYYY-MM-DD"
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  vital_signs?: string;
  icd_code?: string;
}

export const medicalRecordService = {
  getAll: async (): Promise<MedicalRecord[]> => {
    const res = await api.get('/medical-records');
    return res.data.data || [];
  },

  getById: async (id: number): Promise<MedicalRecord> => {
    const res = await api.get(`/medical-records/${id}`);
    return res.data.data;
  },

  create: async (data: CreateMedicalRecordRequest): Promise<MedicalRecord> => {
    const res = await api.post('/medical-records', data);
    return res.data.data;
  },

  update: async (id: number, data: Partial<CreateMedicalRecordRequest>): Promise<MedicalRecord> => {
    const res = await api.put(`/medical-records/${id}`, data);
    return res.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/medical-records/${id}`);
  }
};
