"use client";
import { useApi } from '@/hooks/useApi';
import { prescriptionService } from '@/services/prescriptionService';
import { StatusBadge } from '@/components/StatusBadge';
import { FileText, CheckCircle, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export function PrescriptionsPage() {
  const { data: prescriptions, loading, error, refetch } = useApi(() => prescriptionService.getAll(), []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <span className="ml-3 text-slate-500">Memuat resep...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-3" />
        <h3 className="text-lg font-semibold text-red-800">Gagal Memuat Resep</h3>
        <p className="text-sm text-red-600 mt-1">{error}</p>
        <button onClick={refetch} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700">
          <RefreshCw size={14} /> Coba Lagi
        </button>
      </div>
    );
  }

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await prescriptionService.update(id, { status: status as any });
      refetch();
    } catch {
      alert('Gagal merubah status resep');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Resep Obat</h1>
          <p className="text-sm text-slate-500 mt-1">Resep yang dibuat Dokter untuk ditebus Apoteker</p>
        </div>
        <button onClick={refetch} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 shadow-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {(!prescriptions || prescriptions.length === 0) ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <FileText size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">Belum ada resep terdaftar.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map(rx => (
            <div key={rx.id} className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
                    <FileText size={20} className="text-violet-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{rx.patient_name}</h3>
                    <p className="text-xs text-slate-500">{rx.doctor_name || 'Dokter'} • {rx.prescription_date ? new Date(rx.prescription_date).toLocaleDateString('id-ID') : '-'}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Kode Resep: {rx.prescription_code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={rx.status} />
                  {rx.status === 'pending' && (
                    <button 
                      onClick={() => handleStatusUpdate(rx.id, 'processed')}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
                    >
                      <CheckCircle size={12} />
                      Siapkan
                    </button>
                  )}
                  {rx.status === 'processed' && (
                    <button 
                      onClick={() => handleStatusUpdate(rx.id, 'dispensed')}
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                    >
                      <CheckCircle size={12} />
                      Serahkan
                    </button>
                  )}
                </div>
              </div>
              <div className="border-t border-slate-100 px-5 py-3">
                <p className="text-xs font-semibold text-slate-500 mb-2">Detail Obat:</p>
                <div className="space-y-1.5">
                  {rx.items?.map((item, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                      <span className="font-medium text-slate-700">{item.drug_name}</span>
                      <div className="text-right">
                        <span className="text-slate-800 font-semibold">{item.qty}x</span>
                        <p className="text-xs text-slate-400">{item.dosage}</p>
                      </div>
                    </div>
                  ))}
                  {(!rx.items || rx.items.length === 0) && <p className="text-xs text-slate-400 italic">Tidak ada detail obat</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
