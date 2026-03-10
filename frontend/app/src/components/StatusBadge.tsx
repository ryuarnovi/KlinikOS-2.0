"use client";
import { cn } from '@/utils/cn';

const statusStyles: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  draft: 'bg-slate-100 text-slate-600',
  finalized: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-yellow-100 text-yellow-700',
  prepared: 'bg-blue-100 text-blue-700',
  dispensed: 'bg-green-100 text-green-700',
  unpaid: 'bg-red-100 text-red-700',
  paid: 'bg-green-100 text-green-700',
  refunded: 'bg-orange-100 text-orange-700',
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-slate-100 text-slate-600',
};

const statusLabels: Record<string, string> = {
  scheduled: 'Terjadwal',
  in_progress: 'Berlangsung',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  draft: 'Draft',
  finalized: 'Final',
  pending: 'Menunggu',
  prepared: 'Disiapkan',
  dispensed: 'Diberikan',
  unpaid: 'Belum Bayar',
  paid: 'Lunas',
  refunded: 'Refund',
  active: 'Aktif',
  inactive: 'Nonaktif',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
      statusStyles[status] || 'bg-slate-100 text-slate-600'
    )}>
      {statusLabels[status] || status}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const r = role.toLowerCase();
  const roleStyles: Record<string, string> = {
    admin: 'bg-red-100 text-red-700',
    dokter: 'bg-blue-100 text-blue-700',
    perawat: 'bg-green-100 text-green-700',
    apoteker: 'bg-purple-100 text-purple-700',
    kasir: 'bg-orange-100 text-orange-700',
    pasien: 'bg-teal-100 text-teal-700',
    resepsionis: 'bg-cyan-100 text-cyan-700',
  };

  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase',
      roleStyles[r] || 'bg-slate-100 text-slate-600'
    )}>
      {role}
    </span>
  );
}
