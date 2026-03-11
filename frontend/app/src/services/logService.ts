import api from '@/config/api';

export interface ActivityLog {
  id: number;
  user_id: number;
  user_name?: string;
  action: string;
  entity: string;
  entity_id: number;
  description: string;
  ip_address: string;
  created_at: string;
}

export const logService = {
  getAll: async (): Promise<ActivityLog[]> => {
    const res = await api.get('/activity-logs');
    return res.data.data || [];
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/activity-logs/${id}`);
  }
};
