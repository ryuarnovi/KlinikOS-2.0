import api from '@/config/api';

export interface QueueItem {
  id: number;
  patient_id: number;
  patient_name: string;
  queue_number: string;
  queue_date: string;
  doctor_id?: number;
  nurse_id?: number;
  status: 'waiting' | 'calling' | 'completed' | 'cancelled';
  created_at: string;
}

export const queueService = {
  getAll: async (): Promise<QueueItem[]> => {
    const res = await api.get('/queues');
    return res.data.data || [];
  },
  
  update: async (id: number, status: string) => {
    await api.put(`/queues/${id}`, { status });
  },

  create: async (data: { patient_id: number; queue_date?: string; queue_number?: string; doctor_id?: number; nurse_id?: number }) => {
    const res = await api.post('/queues', data);
    return res.data;
  },

  delete: async (id: number) => {
    await api.delete(`/queues/${id}`);
  }
};
