import api from '@/config/api';

export interface ICD10 {
  id: number;
  code: string;
  description_en: string;
  description_id: string;
  is_active: boolean;
}

export interface ICD9CM {
  id: number;
  code: string;
  description_en: string;
  description_id: string;
  is_active: boolean;
}

export const icdService = {
  searchICD10: async (query: string): Promise<ICD10[]> => {
    if (!query) return [];
    const res = await api.get(`/icd/icd10?q=${encodeURIComponent(query)}`);
    return res.data.data || [];
  },

  searchICD9CM: async (query: string): Promise<ICD9CM[]> => {
    if (!query) return [];
    const res = await api.get(`/icd/icd9cm?q=${encodeURIComponent(query)}`);
    return res.data.data || [];
  }
};
