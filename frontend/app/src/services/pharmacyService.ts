import api from '@/config/api';
import type { PharmacyItem } from '@/types';

export interface CreatePharmacyItemRequest {
  sku: string;
  name: string;
  description?: string;
  function?: string;
  side_effects?: string;
  category?: string;
  brand?: string;
  dosage?: string;
  group?: string;
  shape?: string;
  unit: string;
  stock: number;
  min_stock: number;
  sell_price: number;
  buy_price: number;
  expiry_date?: string;
}

export const pharmacyService = {
  getItems: async (): Promise<PharmacyItem[]> => {
    const res = await api.get('/pharmacy/items');
    return res.data.data || [];
  },

  createItem: async (data: CreatePharmacyItemRequest): Promise<PharmacyItem> => {
    const res = await api.post('/pharmacy/items', data);
    return res.data.data;
  },

  updateItem: async (id: number, data: Partial<CreatePharmacyItemRequest>): Promise<PharmacyItem> => {
    const res = await api.put(`/pharmacy/items/${id}`, data);
    return res.data.data;
  },

  getLowStock: async (threshold: number = 10): Promise<PharmacyItem[]> => {
    const res = await api.get(`/pharmacy/low-stock?threshold=${threshold}`);
    return res.data.data || [];
  },
 
  deleteItem: async (id: number): Promise<void> => {
    await api.delete(`/pharmacy/items/${id}`);
  },
};
