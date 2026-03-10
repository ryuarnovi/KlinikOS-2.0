import api from '@/config/api';
import type { BillingTransaction } from '@/types';

export interface CreateBillingRequest {
  medical_record_id?: number;
  patient_id: number;
  prescription_id?: number;
  doctor_fee: number;
  medicine_cost: number;
  admin_fee?: number;
  discount?: number;
  tax?: number;
  total: number;
  payment_method: string;
  paid_amount: number;
  notes?: string;
  invoice_number: string;
}

export const billingService = {
  getAll: async (): Promise<BillingTransaction[]> => {
    const res = await api.get('/billing');
    return res.data.data || [];
  },

  create: async (data: CreateBillingRequest): Promise<BillingTransaction> => {
    const res = await api.post('/billing', data);
    return res.data.data;
  },

  update: async (id: number, data: Partial<CreateBillingRequest>): Promise<void> => {
    await api.put(`/billing/${id}`, data);
  },

  processPayment: async (id: number, data: { payment_method: string, paid_amount: number, status?: string }) => {
    const res = await api.patch(`/billing/${id}/pay`, data);
    return res.data;
  },

  createMidtransSnapToken: async (data: { order_id: string, gross_amount: number, customer: { first_name: string, email: string } }): Promise<any> => {
    const res = await api.post('/payment/midtrans', data);
    return res.data;
  },
};
