import api from '@/config/api';

export interface Referral {
  id: number;
  patient_id: number;
  medical_record_id?: number;
  doctor_id: number;
  referral_to: string;
  referral_date: string;
  diagnosis?: string;
  notes?: string;
  status: string;
  patient_name?: string;
  doctor_name?: string;
  created_at: string;
}

export interface CreateReferralRequest {
  patient_id: number;
  medical_record_id?: number;
  doctor_id: number;
  referral_to: string;
  referral_date?: string;
  diagnosis?: string;
  notes?: string;
}

export const referralService = {
  getAll: async (): Promise<Referral[]> => {
    const res = await api.get('/referrals');
    return res.data.data || [];
  },

  create: async (data: CreateReferralRequest): Promise<Referral> => {
    const res = await api.post('/referrals', data);
    return res.data.data;
  },

  update: async (id: number, data: Partial<CreateReferralRequest> & { status?: string }): Promise<void> => {
    await api.put(`/referrals/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/referrals/${id}`);
  }
};
