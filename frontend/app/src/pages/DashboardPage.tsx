"use client";
import type { Role } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { patientService } from '@/services/patientService';
import { queueService } from '@/services/queueService';
import { billingService } from '@/services/billingService';
import { medicalRecordService } from '@/services/medicalRecordService';
import { prescriptionService } from '@/services/prescriptionService';
import { pharmacyService } from '@/services/pharmacyService';
import { useApi } from '@/hooks/useApi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useMemo } from 'react';

interface Props {
  role: Role;
}

function StatCard({ title, value, icon, color, subtitle }: {
  title: string; value: string | number; icon: React.ReactNode; color: string; subtitle?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function DashboardPage({ role }: { role: Role }) {
  const { user } = useAuth();
  const { data: patients } = useApi(() => patientService.getAll(), []);
  const { data: queues } = useApi(() => queueService.getAll(), []);
  const { data: billings } = useApi(() => billingService.getAll(), []);
  const { data: prescriptions } = useApi(() => prescriptionService.getAll(), []);
  const { data: records } = useApi(() => medicalRecordService.getAll(), []);
  const { data: drugs } = useApi(() => pharmacyService.getItems(), []);

  const totalPatients = patients?.length || 0;
  const todayAppointments = queues?.length || 0;
  
  const totalRevenue = useMemo(() => {
    return (billings || []).reduce((sum, b) => sum + (Number(b.paid_amount) || 0), 0);
  }, [billings]);
  
  const formatCurrency = (n: number) => 'Rp ' + (n || 0).toLocaleString('id-ID');
  const pendingPrescriptions = prescriptions?.filter(p => !p.status || p.status === 'pending').length || 0;
  const recordsCount = records?.length || 0;
  const lowStock = drugs?.filter(d => d.stock < 20).length || 0;

  const revenueData = useMemo(() => {
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const map = new Map();
    days.forEach(d => map.set(d, 0));

    if (billings && billings.length > 0) {
      billings.forEach(b => {
        const val = Number(b.paid_amount) || 0;
        if (val > 0) {
          const date = new Date(b.payment_date || b.created_at);
          if (!isNaN(date.getTime())) {
            const dayName = days[date.getDay()];
            map.set(dayName, (map.get(dayName) || 0) + val);
          }
        }
      });
    }
    return days.map(name => ({ name, total: map.get(name) }));
  }, [billings]);

  const visitData = useMemo(() => {
    const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const map = new Map();
    days.forEach(d => map.set(d, 0));

    if (queues && queues.length > 0) {
      queues.forEach(q => {
        const date = new Date(q.queue_date);
        const dayIndex = date.getDay();
        if (dayIndex > 0) {
          const dayName = days[dayIndex - 1];
          map.set(dayName, (map.get(dayName) || 0) + 1);
        }
      });
    }
    return days.map(name => ({ name, pasien: map.get(name) }));
  }, [queues]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Selamat datang, <span className="font-semibold text-emerald-600">{user?.full_name || 'User'}</span>!
          Role: <span className="font-semibold text-slate-700 capitalize">{user?.role || role}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Pasien"
          value={totalPatients}
          icon={<i className="fi fi-rr-users text-white text-xl" />}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          subtitle="Tersinkronisasi"
        />
        <StatCard
          title="Total Antrean"
          value={todayAppointments}
          icon={<i className="fi fi-rr-calendar text-white text-xl" />}
          color="bg-gradient-to-br from-emerald-500 to-emerald-600"
          subtitle="Tersinkronisasi"
        />
        <StatCard
          title="Revenue (Terbayar)"
          value={formatCurrency(totalRevenue)}
          icon={<i className="fi fi-rr-chart-line-up text-white text-xl" />}
          color="bg-gradient-to-br from-violet-500 to-violet-600"
          subtitle="Total semua pembayaran masuk"
        />
        <StatCard
          title="Rekam Medis"
          value={recordsCount}
          icon={<i className="fi fi-rr-stethoscope text-white text-xl" />}
          color="bg-gradient-to-br from-amber-500 to-amber-600"
          subtitle="Total catatan medis"
        />
        <StatCard
          title="Resep Pending"
          value={pendingPrescriptions}
          icon={<i className="fi fi-rr-medicine text-white text-xl" />}
          color="bg-gradient-to-br from-indigo-500 to-indigo-600"
          subtitle="Menunggu penyiapan obat"
        />
        <StatCard
          title="Stok Obat Menipis"
          value={lowStock}
          icon={<i className="fi fi-rr-boxes text-white text-xl" />}
          color="bg-gradient-to-br from-red-500 to-red-600"
          subtitle="Stok di bawah 20 item"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tren Pendapatan</h3>
            <p className="text-lg font-bold text-slate-800 mt-1">Status Keuangan Mingguan</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis 
                  tickFormatter={(val: number) => {
                    if (val === 0) return 'Rp 0';
                    if (val >= 1000000) return `Rp ${val / 1000000}jt`;
                    if (val >= 1000) return `Rp ${val / 1000}rb`;
                    return `Rp ${val}`;
                  }}
                  axisLine={false} 
                  tickLine={false} 
                  style={{ fontSize: 10, fill: '#94a3b8' }} 
                  width={70}
                />
                <Tooltip 
                  formatter={(value: any) => formatCurrency(Number(value))}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kunjungan Pasien</h3>
            <p className="text-lg font-bold text-slate-800 mt-1">Volume Antrean per Hari</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visitData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} style={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="pasien" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
