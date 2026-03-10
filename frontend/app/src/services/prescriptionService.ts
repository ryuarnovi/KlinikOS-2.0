import api from '@/config/api';

export interface PrescriptionItem {
  id: number;
  drug_id: number;
  drug_name: string;
  qty: number;
  dosage: string;
  unit: string;
}

export interface Prescription {
  id: number;
  patient_id: number;
  prescription_code: string;
  medical_record_id: number;
  patient_name: string;
  doctor_name: string;
  prescription_date: string;
  status: 'pending' | 'processed' | 'dispensed';
  notes: string;
  items?: PrescriptionItem[];
}

export const prescriptionService = {
  getAll: async (): Promise<Prescription[]> => {
    const res = await api.get('/prescriptions');
    return res.data.data || [];
  },
  
  update: async (id: number, data: Partial<Prescription>) => {
    await api.put(`/prescriptions/${id}`, data);
  },

  create: async (data: any) => {
    const res = await api.post('/prescriptions', data);
    return res.data.data;
  }
};
