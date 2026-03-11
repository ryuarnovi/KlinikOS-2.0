import api from '@/config/api';

export interface DoctorSchedule {
  id: number;
  doctor_id: number;
  doctor_name?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  quota: number;
  is_active: boolean;
}

export interface StaffShift {
  id: number;
  staff_id: number;
  staff_name?: string;
  shift_date: string;
  shift_type: 'morning' | 'afternoon' | 'night';
  start_time: string;
  end_time: string;
  notes?: string;
}

export const hrisService = {
  // Schedules
  getSchedules: async (doctorId?: number): Promise<DoctorSchedule[]> => {
    const url = doctorId ? `/hris/schedules?doctor_id=${doctorId}` : '/hris/schedules';
    const res = await api.get(url);
    return res.data.data || [];
  },

  createSchedule: async (data: any): Promise<void> => {
    await api.post('/hris/schedules', data);
  },

  updateSchedule: async (id: number, data: any): Promise<void> => {
    await api.put(`/hris/schedules/${id}`, data);
  },

  // Shifts
  getShifts: async (date?: string): Promise<StaffShift[]> => {
    const url = date ? `/hris/shifts?date=${date}` : '/hris/shifts';
    const res = await api.get(url);
    return res.data.data || [];
  },

  createShift: async (data: any): Promise<void> => {
    await api.post('/hris/shifts', data);
  },

  updateShift: async (id: number, data: any): Promise<void> => {
    await api.put(`/hris/shifts/${id}`, data);
  },

  deleteSchedule: async (id: number): Promise<void> => {
    await api.delete(`/hris/schedules/${id}`);
  },

  deleteShift: async (id: number): Promise<void> => {
    await api.delete(`/hris/shifts/${id}`);
  },
};
