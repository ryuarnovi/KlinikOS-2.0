"use client";
import { users } from '@/data/mockData';
import { StatusBadge, RoleBadge } from '@/components/StatusBadge';
import { UserPlus, Search, Filter } from 'lucide-react';
import { useState } from 'react';

export function UsersPage() {
  const [search, setSearch] = useState('');
  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users & Roles</h1>
          <p className="text-sm text-slate-500 mt-1">Manajemen pengguna dengan Role-Based Access Control (RBAC)</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors shadow-sm">
          <UserPlus size={16} />
          Tambah User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau username..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
          <Filter size={16} />
          Filter Role
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-5 py-3 text-left font-semibold text-slate-600">User</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Username</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Role</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Status</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Bergabung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-sm font-bold text-slate-600">
                        {user.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{user.full_name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <code className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-600">{user.username}</code>
                  </td>
                  <td className="px-5 py-3.5"><RoleBadge role={user.role} /></td>
                  <td className="px-5 py-3.5"><StatusBadge status={user.is_active ? 'active' : 'inactive'} /></td>
                  <td className="px-5 py-3.5 text-slate-500">{user.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC Info */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">📋 Role-Based Access Control (RBAC)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-blue-700">
          <div><span className="font-semibold">Admin:</span> Akses penuh ke semua modul</div>
          <div><span className="font-semibold">Dokter:</span> Rekam medis, resep, appointment</div>
          <div><span className="font-semibold">Perawat:</span> Rekam medis, appointment, vital signs</div>
          <div><span className="font-semibold">Apoteker:</span> Stok obat, dispensing resep</div>
          <div><span className="font-semibold">Kasir:</span> Billing, pembayaran, invoice</div>
          <div><span className="font-semibold">Pasien:</span> Lihat appointment & rekam medis sendiri</div>
        </div>
      </div>
    </div>
  );
}
