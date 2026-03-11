"use client";
import { useApi } from '@/hooks/useApi';
import { queueService } from '@/services/queueService';
import { StatusBadge } from '@/components/StatusBadge';
import { patientService } from '@/services/patientService';
import { userService } from '@/services/userService';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { cn } from '@/utils/cn';

export function AppointmentsPage() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();
  const isAdmin = role === 'admin' || role === 'resepsionis';
  
  const getPageTitle = () => {
    if (role === 'resepsionis') return 'Antrian Pasien';
    return 'Antrean Pasien (Appointments)';
  };
  const { data: queues, loading, error, refetch } = useApi(() => queueService.getAll(), []);
  const { data: patients } = useApi(() => patientService.getAll(), []);
  const { data: usersList } = useApi(() => userService.getStaff(), []);
  
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedNurseId, setSelectedNurseId] = useState<string>('');
  const [queueDate, setQueueDate] = useState(new Date().toISOString().split('T')[0]);

  const doctors = (usersList || []).filter(u => u.role.toLowerCase() === 'dokter');
  const nurses = (usersList || []).filter(u => u.role.toLowerCase() === 'perawat');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    setSaving(true);
    setSaveError(null);
    try {
      await queueService.create({
        patient_id: parseInt(selectedPatientId),
        queue_date: queueDate,
        doctor_id: selectedDoctorId ? parseInt(selectedDoctorId) : undefined,
        nurse_id: selectedNurseId ? parseInt(selectedNurseId) : undefined,
      });
      setShowForm(false);
      setSelectedPatientId('');
      setSelectedDoctorId('');
      setSelectedNurseId('');
      refetch();
    } catch (err: any) {
      setSaveError(err?.response?.data?.error || 'Gagal membuat antrean');
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
        <span className="ml-3 text-slate-500 font-bold uppercase tracking-widest text-xs">Memuat antrean...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50/50 p-8 text-center animate-in fade-in zoom-in">
        <i className="fi fi-rr-info mx-auto text-5xl text-red-400 mb-4" />
        <h3 className="text-lg font-black text-red-800 tracking-tight">Gagal Memuat Antrean</h3>
        <p className="text-xs text-red-600/70 mt-1 uppercase font-bold tracking-widest">{error}</p>
        <button onClick={refetch} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white hover:bg-red-700 shadow-lg shadow-red-100 transition-all">
          <i className="fi fi-rr-refresh" /> Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{getPageTitle()}</h1>
          <p className="text-sm text-slate-500 mt-1 uppercase tracking-widest font-bold text-[10px]">Plotting & Manajemen Antrean Harian</p>
        </div>
        <div className="flex gap-2">
          <button onClick={refetch} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <i className="fi fi-rr-refresh" />
          </button>
          {isAdmin && (
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-black text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95">
              <i className="fi fi-rr-calendar-plus text-lg" /> Ambil Antrean
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Plotting Antrean Baru</h2>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Tentukan Dokter & Perawat Pendamping</p>
              </div>
              <button onClick={() => setShowForm(false)} className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all">
                <i className="fi fi-rr-cross text-xl" />
              </button>
            </div>

            {saveError && (
              <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-100 p-4 text-xs font-bold text-rose-600 animate-pulse">{saveError}</div>
            )}

            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pilih Pasien</label>
                <select
                  required
                  value={selectedPatientId}
                  onChange={e => setSelectedPatientId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                >
                  <option value="">-- Cari Pasien --</option>
                  {patients?.map(p => (
                    <option key={p.id} value={p.id}>{p.full_name} ({p.nik})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Plot Dokter</label>
                  <select
                    value={selectedDoctorId}
                    onChange={e => setSelectedDoctorId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">-- Pilih Dokter --</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Plot Perawat</label>
                  <select
                    value={selectedNurseId}
                    onChange={e => setSelectedNurseId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">-- Pilih Perawat --</option>
                    {nurses.map(n => <option key={n.id} value={n.id}>{n.full_name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tanggal Rencana Visit</label>
                <input
                  type="date"
                  required
                  value={queueDate}
                  onChange={e => setQueueDate(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                <p className="text-[10px] text-amber-700 font-bold leading-relaxed">
                  <i className="fi fi-rr-info mr-2" />
                  Sistem akan mengalokasikan nomor antrean secara otomatis (Format: Q-TIME). Pasien akan muncul di dashboard dokter/perawat yang Anda pilih.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-2xl border border-slate-200 py-4 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">Batal</button>
                <button type="submit" disabled={saving || !selectedPatientId} className="flex-1 rounded-2xl bg-indigo-600 py-4 text-sm font-black text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-all">
                  {saving ? <i className="fi fi-rr-spinner animate-spin text-lg" /> : <i className="fi fi-rr-check text-lg" />}
                  {saving ? 'Memproses...' : 'Simpan Plotting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {(!queues || queues.length === 0) ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-20 text-center animate-in fade-in slide-in-from-bottom-4">
          <div className="h-20 w-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6">
            <i className="fi fi-rr-calendar-plus text-4xl text-slate-200" />
          </div>
          <h3 className="text-lg font-black text-slate-800 tracking-tight">Antrean Kosong</h3>
          <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">Gunakan tombol di atas untuk menambah antrean</p>
        </div>
      ) : (
        Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)).map(([date, items]) => (
          <div key={date} className="space-y-4 animate-in fade-in slide-in-from-left-2 transition-all">
            <h3 className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-[0.2em] py-2 px-1">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              {new Date(date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items?.map(q => (
                <div key={q.id} className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-xl hover:border-indigo-100 hover:scale-[1.01] transition-all">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-colors">
                        <span className="text-[10px] font-black text-indigo-500 uppercase group-hover:text-indigo-200">No</span>
                        <span className="text-xl font-black text-indigo-700 leading-none group-hover:text-white">{q.queue_number}</span>
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">{q.patient_name}</h4>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                           <span className="px-2 py-0.5 bg-slate-100 rounded-lg text-[9px] font-bold text-slate-500 uppercase tracking-wider">#{q.patient_id}</span>
                           <StatusBadge status={q.status} />
                        </div>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex flex-col gap-2">
                         {q.status === 'waiting' && (
                           <button
                             onClick={() => handleUpdateStatus(q.id, 'calling')}
                             className="rounded-xl bg-indigo-50 px-4 py-2 text-[10px] font-black text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest shadow-sm active:scale-95"
                           >
                             Panggil
                           </button>
                         )}
                         {q.status === 'calling' && (
                           <button
                             onClick={() => handleUpdateStatus(q.id, 'completed')}
                             className="rounded-xl bg-emerald-50 px-4 py-2 text-[10px] font-black text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all uppercase tracking-widest shadow-sm active:scale-95"
                           >
                             Selesai
                           </button>
                         )}
                         <button
                           onClick={() => handleDelete(q.id)}
                           className="self-end p-2 text-slate-200 hover:text-rose-500 transition-colors"
                         >
                           <i className="fi fi-rr-trash text-sm" />
                         </button>
                      </div>
                    )}
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
