"use client";
import { cn } from '@/utils/cn';

const statusStyles: Record<string, string> = {
  scheduled: 'border-blue-200 bg-blue-50 text-blue-700',
  in_progress: 'border-amber-200 bg-amber-50 text-amber-700',
  completed: 'border-green-200 bg-green-50 text-green-700',
  cancelled: 'border-red-200 bg-red-50 text-red-700',
  draft: 'border-slate-200 bg-slate-50 text-slate-700',
  finalized: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  pending: 'border-yellow-200 bg-yellow-50 text-yellow-700',
  prepared: 'border-blue-200 bg-blue-50 text-blue-700',
  dispensed: 'border-green-200 bg-green-50 text-green-700',
  unpaid: 'border-red-200 bg-red-50 text-red-700',
  paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  cicil: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  refunded: 'border-orange-200 bg-orange-50 text-orange-700',
  active: 'border-green-200 bg-green-50 text-green-700',
  inactive: 'border-slate-200 bg-slate-50 text-slate-700',
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
  cicil: 'Cicilan',
  refunded: 'Refund',
  active: 'Aktif',
  inactive: 'Nonaktif',
};

export function StatusBadge({ status }: { status: string }) {
  const s = (status || '').toLowerCase();
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border',
      statusStyles[s] || 'border-slate-200 bg-slate-50 text-slate-700'
    )}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {statusLabels[s] || status}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const r = role.toLowerCase();
  const roleStyles: Record<string, string> = {
    admin: 'border-red-200 bg-red-50 text-red-700',
    dokter: 'border-blue-200 bg-blue-50 text-blue-700',
    perawat: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    apoteker: 'border-purple-200 bg-purple-50 text-purple-700',
    kasir: 'border-orange-200 bg-orange-50 text-orange-700',
    pasien: 'border-teal-200 bg-teal-50 text-teal-700',
    resepsionis: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  };

  return (
    <span className={cn(
      'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-widest border',
      roleStyles[r] || 'border-slate-200 bg-slate-50 text-slate-700'
    )}>
      {role}
    </span>
  );
}
