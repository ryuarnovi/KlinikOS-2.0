import type { User, Patient, StaffProfile, Appointment, MedicalRecord, PharmacyItem, Prescription, BillingTransaction } from '@/types';

export const users: User[] = [
  { id: 1, username: 'admin', email: 'admin@klinik.id', phone: null, full_name: 'Super Admin', role: 'admin', is_active: true, created_at: '2024-01-01' },
  { id: 2, username: 'dr.andi', email: 'andi@klinik.id', phone: null, full_name: 'Dr. Andi Pratama', role: 'dokter', is_active: true, created_at: '2024-01-05' },
  { id: 3, username: 'dr.siti', email: 'siti@klinik.id', phone: null, full_name: 'Dr. Siti Rahayu', role: 'dokter', is_active: true, created_at: '2024-01-05' },
  { id: 4, username: 'ns.dewi', email: 'dewi@klinik.id', phone: null, full_name: 'Ns. Dewi Lestari', role: 'perawat', is_active: true, created_at: '2024-02-01' },
  { id: 5, username: 'apt.budi', email: 'budi@klinik.id', phone: null, full_name: 'Apt. Budi Santoso', role: 'apoteker', is_active: true, created_at: '2024-02-10' },
  { id: 6, username: 'kasir.maya', email: 'maya@klinik.id', phone: null, full_name: 'Maya Putri', role: 'kasir', is_active: true, created_at: '2024-02-15' },
  { id: 7, username: 'pasien.rudi', email: 'rudi@gmail.com', phone: null, full_name: 'Rudi Hermawan', role: 'pasien', is_active: true, created_at: '2024-03-01' },
  { id: 8, username: 'pasien.lina', email: 'lina@gmail.com', phone: null, full_name: 'Lina Marlina', role: 'pasien', is_active: true, created_at: '2024-03-10' },
];

export const patients: Patient[] = [
  { id: 1, nik: '3201010101900001', patient_code: 'P001', full_name: 'Rudi Hermawan', date_of_birth: '1990-01-01', gender: 'L', phone: '081234567890', email: 'rudi@gmail.com', address: 'Jl. Merdeka No. 10, Bandung', blood_type: 'A', allergies: null, is_walkin: false, status: 'active', created_at: '2024-03-01' },
  { id: 2, nik: '3201010101950002', patient_code: 'P002', full_name: 'Lina Marlina', date_of_birth: '1995-05-15', gender: 'P', phone: '081234567891', email: 'lina@gmail.com', address: 'Jl. Asia Afrika No. 25, Bandung', blood_type: 'B', allergies: null, is_walkin: false, status: 'active', created_at: '2024-03-10' },
  { id: 3, nik: '3201010101880003', patient_code: 'P003', full_name: 'Agus Salim', date_of_birth: '1988-08-20', gender: 'L', phone: '081234567892', email: 'agus@gmail.com', address: 'Jl. Dago No. 5, Bandung', blood_type: 'O', allergies: null, is_walkin: true, status: 'active', created_at: '2024-04-01' },
  { id: 4, nik: '3201010102000004', patient_code: 'P004', full_name: 'Rina Wati', date_of_birth: '2000-12-03', gender: 'P', phone: '081234567893', email: 'rina@gmail.com', address: 'Jl. Braga No. 8, Bandung', blood_type: 'AB', allergies: null, is_walkin: true, status: 'active', created_at: '2024-04-05' },
  { id: 5, nik: '3201010101750005', patient_code: 'P005', full_name: 'Hendra Gunawan', date_of_birth: '1975-03-17', gender: 'L', phone: '081234567894', email: 'hendra@gmail.com', address: 'Jl. Pasteur No. 12, Bandung', blood_type: 'A', allergies: null, is_walkin: true, status: 'active', created_at: '2024-04-10' },
];

export const staffProfiles: StaffProfile[] = [
  { id: '1', user_id: '2', nip: 'DKT-2024-001', specialization: 'Dokter Umum', license_number: 'STR-123456', staff_name: 'Dr. Andi Pratama', role: 'dokter' },
  { id: '2', user_id: '3', nip: 'DKT-2024-002', specialization: 'Dokter Gigi', license_number: 'STR-789012', staff_name: 'Dr. Siti Rahayu', role: 'dokter' },
  { id: '3', user_id: '4', nip: 'PRW-2024-001', specialization: 'Perawat Umum', license_number: 'SIPK-345678', staff_name: 'Ns. Dewi Lestari', role: 'perawat' },
  { id: '4', user_id: '5', nip: 'APT-2024-001', specialization: 'Apoteker Klinis', license_number: 'SIPA-901234', staff_name: 'Apt. Budi Santoso', role: 'apoteker' },
];

export const appointments: Appointment[] = [
  { id: '1', patient_name: 'Rudi Hermawan', doctor_name: 'Dr. Andi Pratama', appointment_date: '2024-12-20', appointment_time: '09:00', status: 'completed', complaint: 'Demam tinggi 3 hari' },
  { id: '2', patient_name: 'Lina Marlina', doctor_name: 'Dr. Siti Rahayu', appointment_date: '2024-12-20', appointment_time: '10:00', status: 'completed', complaint: 'Sakit gigi' },
  { id: '3', patient_name: 'Agus Salim', doctor_name: 'Dr. Andi Pratama', appointment_date: '2024-12-21', appointment_time: '09:30', status: 'in_progress', complaint: 'Batuk berdahak' },
  { id: '4', patient_name: 'Rina Wati', doctor_name: 'Dr. Siti Rahayu', appointment_date: '2024-12-21', appointment_time: '11:00', status: 'scheduled', complaint: 'Konsultasi gigi' },
];

export const medicalRecords: MedicalRecord[] = [
  { id: 1, patient_id: 1, patient_name: 'Rudi Hermawan', doctor_id: 2, doctor_name: 'Dr. Andi Pratama', visit_date: '2024-12-20', subjective: 'Pasien mengeluh demam tinggi selama 3 hari', objective: 'Suhu 38.5C', assessment: 'Suspek DB', plan: 'Cek darah', vital_signs: null, icd_code: null, status: 'finalized', created_at: '2024-12-20' },
];

export const pharmacyItems: PharmacyItem[] = [
  { id: 1, name: 'Paracetamol 500mg', sku: 'OBT-001', category: 'Analgesik', description: '', unit: 'Tablet', stock: 500, min_stock: 100, buy_price: 500, sell_price: 1500, expiry_date: '2026-06-30' },
  { id: 2, name: 'Amoxicillin 500mg', sku: 'OBT-002', category: 'Antibiotik', description: '', unit: 'Kapsul', stock: 300, min_stock: 50, buy_price: 800, sell_price: 2500, expiry_date: '2025-12-31' },
];

export const prescriptions: Prescription[] = [
  { id: 1, prescription_code: 'RSP001', medical_record_id: 1, patient_id: 1, patient_name: 'Rudi Hermawan', doctor_id: 2, doctor_name: 'Dr. Andi Pratama', items: [{ id: 1, drug_id: 1, drug_name: 'Paracetamol', qty: 10, dosage: '3x1', unit: 'Tablet' }], status: 'dispensed', notes: null, prescription_date: '2024-12-20' },
];

export const billingTransactions: BillingTransaction[] = [
  { id: 1, patient_id: 1, patient_code: 'P001', patient_name: 'Rudi Hermawan', invoice_number: 'INV-2024-0001', doctor_fee: 150000, medicine_cost: 15000, admin_fee: 10000, total: 175000, paid_amount: 175000, change_amount: 0, payment_method: 'cash', status: 'paid', created_at: '2024-12-20', payment_date: '2024-12-20' },
];

export const dashboardStats = {
  totalPatients: 156,
  todayAppointments: 12,
  activeDoctors: 4,
  monthlyRevenue: 45750000,
  pendingPrescriptions: 8,
  lowStockItems: 2,
};

export const revenueData = [
  { month: 'Jul', revenue: 32000000 },
  { month: 'Agu', revenue: 38000000 },
  { month: 'Sep', revenue: 35000000 },
  { month: 'Okt', revenue: 42000000 },
  { month: 'Nov', revenue: 40000000 },
  { month: 'Des', revenue: 45750000 },
];

export const visitData = [
  { day: 'Sen', visits: 24 },
  { day: 'Sel', visits: 18 },
  { day: 'Rab', visits: 32 },
  { day: 'Kam', visits: 28 },
  { day: 'Jum', visits: 22 },
  { day: 'Sab', visits: 15 },
  { day: 'Min', visits: 0 },
];

export const departmentData = [
  { name: 'Umum', value: 45 },
  { name: 'Gigi', value: 25 },
  { name: 'Anak', value: 15 },
  { name: 'Mata', value: 15 },
];
