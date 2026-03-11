"use client";
import { userService } from '@/services/userService';
import { useApi } from '@/hooks/useApi';
import { RoleBadge } from '@/components/StatusBadge';
import { useState } from 'react';

export function StaffPage() {
  const { data: users, loading, error, refetch } = useApi(() => userService.getAll(), []);
  const [search, setSearch] = useState('');

  const staffRoles = ['dokter', 'perawat', 'apoteker', 'kasir', 'resepsionis'];
  
  const filtered = (users || []).filter(u => 
    staffRoles.includes(u.role.toLowerCase()) && (
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (u.nip || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <i className="fi fi-rr-spinner text-3xl animate-spin text-emerald-500" />
        <span className="ml-3 text-slate-500">Memuat profil staff...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff Profiles</h1>
          <p className="text-sm text-slate-500 mt-1">Spesialisasi Dokter, NIP Perawat/Apoteker dari Database</p>
        </div>
        <div className="flex gap-2">
           <button onClick={refetch} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
            <i className="fi fi-rr-refresh text-xs" /> Refresh
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <i className="fi fi-rr-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari staff atau NIP..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Staff</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">NIP</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Role</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Spesialisasi</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">No. Lisensi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400 italic">Data staff tidak ditemukan</td>
                </tr>
              ) : filtered.map(staff => (
                <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-sm font-bold text-indigo-700">
                        {staff.full_name.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-800">{staff.full_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <code className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-600">{staff.nip || '-'}</code>
                  </td>
                  <td className="px-5 py-3.5"><RoleBadge role={staff.role} /></td>
                  <td className="px-5 py-3.5 text-slate-600">{staff.specialization || '-'}</td>
                  <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">{staff.license_number || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
