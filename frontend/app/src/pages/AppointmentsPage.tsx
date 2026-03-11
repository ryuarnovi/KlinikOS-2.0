"use client";
import { useApi } from '@/hooks/useApi';
import { queueService } from '@/services/queueService';
import { StatusBadge } from '@/components/StatusBadge';

import { patientService } from '@/services/patientService';
import { useState } from 'react';
export function AppointmentsPage() {
  const { data: queues, loading, error, refetch } = useApi(() => queueService.getAll(), []);
  const { data: patients } = useApi(() => patientService.getAll(), []);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [queueDate, setQueueDate] = useState(new Date().toISOString().split('T')[0]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    setSaving(true);
    setSaveError(null);
    try {
      await queueService.create({
        patient_id: parseInt(selectedPatientId),
        queue_date: queueDate,
      });
      setShowForm(false);
      setSelectedPatientId('');
      refetch();
    } catch (err: any) {
      setSaveError(err?.response?.data?.error || 'Gagal mengambil antrean');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await queueService.update(id, status);
      refetch();
    } catch (err) {
      alert('Gagal mengupdate status antrean');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus antrean ini?')) return;
    try {
      await queueService.delete(id);
      refetch();
    } catch (err) {
      alert('Gagal menghapus antrean');
    }
  };

  const grouped: Record<string, any[]> = {};
  (queues || []).forEach(q => {
    const date = q.queue_date.split('T')[0];
    if (!grouped[date]) grouped[date] = [];
    grouped[date]!.push(q);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <i className="fi fi-rr-spinner text-3xl animate-spin text-emerald-500" />
        <span className="ml-3 text-slate-500">Memuat antrean...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <i className="fi fi-rr-info mx-auto text-5xl text-red-400 mb-3" />
        <h3 className="text-lg font-semibold text-red-800">Gagal Memuat Antrean</h3>
        <p className="text-sm text-red-600 mt-1">{error}</p>
        <button onClick={refetch} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700">
          <i className="fi fi-rr-refresh text-[14px]" /> Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Antrean Pasien</h1>
          <p className="text-sm text-slate-500 mt-1">Daftar antrean hari ini dan akan datang</p>
        </div>
        <div className="flex gap-2">
          <button onClick={refetch} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
            <i className="fi fi-rr-refresh text-[14px]" /> Refresh
          </button>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors shadow-sm">
            <i className="fi fi-rr-calendar-plus text-base" /> Ambll Antrean
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Ambil Antrean Baru</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><i className="fi fi-rr-cross text-xl" /></button>
            </div>
            {saveError && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{saveError}</div>
            )}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wider">Cari Pasien</label>
                <select
                  required
                  value={selectedPatientId}
                  onChange={e => setSelectedPatientId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 appearance-none bg-slate-50"
                >
                  <option value="">-- Pilih Pasien --</option>
                  {patients?.map(p => (
                    <option key={p.id} value={p.id}>{p.full_name} ({p.nik})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wider">Tanggal Rencana Visit</label>
                <input
                  type="date"
                  required
                  value={queueDate}
                  onChange={e => setQueueDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50"
                />
              </div>
              <p className="text-[10px] text-slate-400 italic bg-amber-50 p-2 rounded border border-amber-100">
                Catatan: Nomor antrean akan di-generate otomatis oleh sistem (Q-TIMESTAMP).
              </p>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-lg border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Batal</button>
                <button type="submit" disabled={saving || !selectedPatientId} className="flex-1 rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all">
                  {saving ? <i className="fi fi-rr-spinner animate-spin text-base" /> : <i className="fi fi-rr-calendar-plus text-base" />}
                  {saving ? 'Memproses...' : 'Ambil Nomor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {(!queues || queues.length === 0) ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <i className="fi fi-rr-calendar-plus text-5xl mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">Belum ada antrean terdaftar.</p>
        </div>
      ) : (
        Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([date, items]) => (
          <div key={date} className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {new Date(date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h3>
            <div className="space-y-2 pl-4 border-l-2 border-slate-200">
              {items?.map(q => (
                <div key={q.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">No</span>
                        <span className="text-lg font-black text-emerald-700 leading-none">{q.queue_number}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <i className="fi fi-rr-user text-[14px] text-slate-400" />
                          <span className="font-medium text-slate-800">{q.patient_name}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">ID Pasien: #{q.patient_id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <StatusBadge status={q.status} />
                       {q.status === 'waiting' && (
                         <button
                           onClick={() => handleUpdateStatus(q.id, 'calling')}
                           className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 hover:bg-emerald-100 transition-colors uppercase tracking-tight"
                         >
                           Panggil
                         </button>
                       )}
                       {q.status === 'calling' && (
                         <button
                           onClick={() => handleUpdateStatus(q.id, 'completed')}
                           className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 hover:bg-blue-100 transition-colors uppercase tracking-tight"
                         >
                           Selesai
                         </button>
                       )}
                       <button
                         onClick={() => handleDelete(q.id)}
                         className="rounded-lg bg-red-50 p-1.5 text-red-500 hover:bg-red-100 transition-colors"
                       >
                         <i className="fi fi-rr-trash text-sm" />
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
