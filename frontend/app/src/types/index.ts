export type Role = 'admin' | 'pasien' | 'dokter' | 'perawat' | 'apoteker' | 'kasir' | 'resepsionis';

export interface User {
  id: number;
  username: string;
  email: string | null;
  full_name: string;
  phone: string | null;
  role: Role;
  is_active: boolean;
  created_at: string;
}

export interface Patient {
  id: number;
  patient_code: string;
  nik: string;
  full_name: string;
  date_of_birth: string;
  gender: 'L' | 'P';
  phone: string | null;
  email: string | null;
  address: string | null;
  blood_type: string | null;
  allergies: string | null;
  is_walkin: boolean;
  status: string;
  created_at: string;
}

export interface MedicalRecord {
  id: number;
  patient_id: number;
  patient_name?: string;
  doctor_id: number;
  doctor_name?: string;
  visit_date: string;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  vital_signs: string | null;
  icd_code: string | null;
  status: string;
  created_at: string;
}

export interface PharmacyItem {
  id: number;
  sku: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  stock: number;
  min_stock: number;
  buy_price: number;
  sell_price: number;
  expiry_date: string | null;
}

export interface Prescription {
  id: number;
  prescription_code: string;
  medical_record_id: number;
  patient_id: number;
  patient_name?: string;
  doctor_id: number;
  doctor_name?: string;
  prescription_date: string;
  status: 'pending' | 'processed' | 'dispensed';
  notes: string | null;
  items?: PrescriptionItem[];
}

export interface PrescriptionItem {
  id: number;
  drug_id: number;
  drug_name: string;
  qty: number;
  dosage: string;
  unit: string;
}

export interface BillingTransaction {
  id: number;
  invoice_number: string;
  patient_id: number;
  patient_name: string;
  patient_code: string;
  doctor_fee: number;
  medicine_cost: number;
  admin_fee: number;
  total: number;
  payment_method: string;
  status: 'unpaid' | 'paid' | 'cancelled';
  created_at: string;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  full_name?: string;
  action: string;
  entity: string;
  entity_id: number;
  description: string;
  ip_address: string;
  created_at: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  roles: Role[];
}

export interface StaffProfile {
  id: string;
  user_id: string;
  nip: string;
  specialization: string;
  license_number: string;
  staff_name: string;
  role: string;
}

export interface Appointment {
  id: string;
  patient_name: string;
  doctor_name: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  complaint: string;
}
