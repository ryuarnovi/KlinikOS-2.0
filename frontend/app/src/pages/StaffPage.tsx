"use client";
import { staffProfiles } from '@/data/mockData';
import { RoleBadge } from '@/components/StatusBadge';
import { Briefcase } from 'lucide-react';

export function StaffPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff Profiles</h1>
          <p className="text-sm text-slate-500 mt-1">Spesialisasi Dokter, NIP Perawat/Apoteker</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors shadow-sm">
          <Briefcase size={16} />
          Tambah Staff
        </button>
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
              {staffProfiles.map(staff => (
                <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-sm font-bold text-indigo-700">
                        {staff.staff_name.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-800">{staff.staff_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <code className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-600">{staff.nip}</code>
                  </td>
                  <td className="px-5 py-3.5"><RoleBadge role={staff.role} /></td>
                  <td className="px-5 py-3.5 text-slate-600">{staff.specialization}</td>
                  <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">{staff.license_number}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
