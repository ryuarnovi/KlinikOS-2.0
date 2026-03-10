"use client";
import type { Role } from '@/types';
import { useAuth } from '@/context/AuthContext';
import {
  Users, CalendarDays, Stethoscope, TrendingUp,
  Pill, AlertTriangle, Activity, Server
} from 'lucide-react';
import { API_URL } from '@/config/api';

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

export function DashboardPage({ role }: Props) {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Selamat datang, <span className="font-semibold text-emerald-600">{user?.full_name || 'User'}</span>!
          Role: <span className="font-semibold">{user?.role || role}</span>
        </p>
      </div>

      {/* Connection Status */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500">
            <Server size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-emerald-800">✅ Terhubung ke Backend</h3>
            <p className="text-xs text-emerald-600">
              API: <code className="bg-emerald-100 px-1 rounded">{API_URL}</code> •
              User: <code className="bg-emerald-100 px-1 rounded">{user?.username}</code> •
              Role: <code className="bg-emerald-100 px-1 rounded">{user?.role}</code>
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Pasien"
          value="—"
          icon={<Users size={20} className="text-white" />}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          subtitle="Lihat di menu Pasien"
        />
        <StatCard
          title="Appointment Hari Ini"
          value="—"
          icon={<CalendarDays size={20} className="text-white" />}
          color="bg-gradient-to-br from-emerald-500 to-emerald-600"
          subtitle="Lihat di menu Appointments"
        />
        {(role === 'admin' || role === 'kasir') && (
          <StatCard
            title="Revenue"
            value="—"
            icon={<TrendingUp size={20} className="text-white" />}
            color="bg-gradient-to-br from-violet-500 to-violet-600"
            subtitle="Lihat di menu Billing"
          />
        )}
        {(role === 'admin' || role === 'apoteker') && (
          <StatCard
            title="Resep Pending"
            value="—"
            icon={<Pill size={20} className="text-white" />}
            color="bg-gradient-to-br from-amber-500 to-amber-600"
            subtitle="Lihat di menu Resep"
          />
        )}
        {role === 'dokter' && (
          <StatCard
            title="Pasien Diperiksa"
            value="—"
            icon={<Stethoscope size={20} className="text-white" />}
            color="bg-gradient-to-br from-violet-500 to-violet-600"
            subtitle="Lihat di menu Rekam Medis"
          />
        )}
        {role === 'perawat' && (
          <StatCard
            title="Vital Signs"
            value="—"
            icon={<Activity size={20} className="text-white" />}
            color="bg-gradient-to-br from-pink-500 to-pink-600"
            subtitle="Lihat di menu Rekam Medis"
          />
        )}
        <StatCard
          title="Stok Rendah"
          value="—"
          icon={<AlertTriangle size={20} className="text-white" />}
          color="bg-gradient-to-br from-red-500 to-red-600"
          subtitle="Lihat di menu Farmasi"
        />
      </div>

      {/* API Endpoints Reference */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">🔗 API Endpoints yang Terhubung</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { method: 'POST', path: '/api/login', desc: 'Login (Public)', color: 'bg-green-100 text-green-700' },
            { method: 'POST', path: '/api/register', desc: 'Register (Public)', color: 'bg-green-100 text-green-700' },
            { method: 'GET', path: '/api/patients', desc: 'List Pasien', color: 'bg-blue-100 text-blue-700' },
            { method: 'GET', path: '/api/queues', desc: 'Antrean (Queues)', color: 'bg-blue-100 text-blue-700' },
            { method: 'GET', path: '/api/medical-records', desc: 'List Rekam Medis', color: 'bg-blue-100 text-blue-700' },
            { method: 'POST', path: '/api/medical-records', desc: 'Create SOAP (Dokter)', color: 'bg-green-100 text-green-700' },
            { method: 'GET', path: '/api/prescriptions', desc: 'List Resep', color: 'bg-blue-100 text-blue-700' },
            { method: 'GET', path: '/api/pharmacy/items', desc: 'Stok Obat', color: 'bg-blue-100 text-blue-700' },
            { method: 'GET', path: '/api/billing', desc: 'List Billing', color: 'bg-blue-100 text-blue-700' },
            { method: 'PATCH', path: '/api/billing/:id/pay', desc: 'Process Payment', color: 'bg-amber-100 text-amber-700' },
          ].map((ep, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${ep.color}`}>{ep.method}</span>
              <code className="text-xs font-mono text-slate-600 flex-1 truncate">{ep.path}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Role Info */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">📋 Akses untuk Role: {user?.role || role}</h3>
        <div className="text-xs text-blue-700 space-y-1">
          {role === 'admin' && <p>✅ Akses penuh ke semua modul: Users, Patients, Medical Records, Pharmacy, Billing</p>}
          {role === 'dokter' && <p>✅ Patients (Read), Medical Records (CRUD), Prescriptions (Create)</p>}
          {role === 'perawat' && <p>✅ Patients (Read), Medical Records (Read, Update vital signs)</p>}
          {role === 'apoteker' && <p>✅ Pharmacy (CRUD), Prescriptions (Dispense)</p>}
          {role === 'kasir' && <p>✅ Patients (Read), Billing (CRUD, Process Payment)</p>}
          {role === 'pasien' && <p>✅ Appointments (Read self), Medical Records (Read self)</p>}
        </div>
      </div>
    </div>
  );
}
