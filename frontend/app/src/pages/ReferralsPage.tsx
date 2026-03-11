"use client";
import { referralService, CreateReferralRequest } from '@/services/referralService';
import { patientService } from '@/services/patientService';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { queueService } from '@/services/queueService';
import { prescriptionService } from '@/services/prescriptionService';

import { useState } from 'react';
import { cn } from '@/utils/cn';

export function ReferralsPage() {
  const { user } = useAuth();
  const { data: referrals, loading, error, refetch } = useApi(() => referralService.getAll(), []);
  const { data: patients } = useApi(() => patientService.getAll(), []);
  
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState<CreateReferralRequest>({
    patient_id: 0,
    doctor_id: user?.id || 0,
    referral_to: '',
    referral_date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    notes: '',
  });

  const filtered = (referrals || []).filter(r => {
    const pName = (r.patient_name || '').toLowerCase();
    const rTo = (r.referral_to || '').toLowerCase();
    const q = search.toLowerCase();
    return pName.includes(q) || rTo.includes(q);
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patient_id || !form.referral_to) return;
    setSaving(true);
    setSaveError(null);
    try {
      await referralService.create(form);
      setShowForm(false);
      refetch();
      setForm({
        patient_id: 0, doctor_id: user?.id || 0, referral_to: '',
        referral_date: new Date().toISOString().split('T')[0],
        diagnosis: '', notes: '',
      });
    } catch (err: any) {
      setSaveError(err?.response?.data?.error || 'Gagal membuat rujukan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await referralService.delete(id);
      refetch();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Gagal menghapus rujukan');
    }
  };

  const handleCreateQueue = async (patientId: number, referralId: number) => {
    try {
      await queueService.create({
        patient_id: patientId,
        queue_date: new Date().toISOString().split('T')[0],
      });
      await referralService.update(referralId, { status: 'processed' });
      alert('Antrean berhasil dibuat!');
      refetch();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Gagal membuat antrean.');
    }
  };

  const handleCreatePrescription = async (patientId: number, referralId: number) => {
    try {
      await prescriptionService.create({
        patient_id: patientId,
        doctor_id: user?.id || 1,
        prescription_code: 'RX-' + Date.now(),
        notes: 'Dari rujukan',
        items: []
      });
      await referralService.update(referralId, { status: 'processed' });
      alert('Draft resep berhasil dibuat!');
      refetch();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Gagal membuat resep.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <i className="fi fi-rr-spinner text-3xl animate-spin text-blue-500" />
        <span className="ml-3 text-slate-500">Memuat rujukan pasien...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rujukan Pasien</h1>
          <p className="text-sm text-slate-500 mt-1">{referrals?.length || 0} rujukan terdaftar</p>
        </div>
        <div className="flex gap-2">
          <button onClick={refetch} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
            <i className="fi fi-rr-refresh text-[14px]" /> Refresh
          </button>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition-all active:scale-95">
            <i className="fi fi-rr-share text-base" /> Buat Rujukan Baru
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <i className="fi fi-rr-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Cari pasien atau RS tujuan..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <i className="fi fi-rr-share mx-auto text-5xl text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">Belum ada rujukan pasien terdaftar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(r => (
            <div key={r.id} className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all border-l-4 border-l-blue-500">
              <button 
                onClick={() => handleDelete(r.id)}
                className="absolute top-4 right-4 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all z-10"
              >
                <i className="fi fi-rr-trash text-base" />
              </button>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">{r.patient_name}</h3>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-0.5">Rujukan Pasien</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-600">
                  <i className="fi fi-rr-marker text-base text-blue-500" />
                  <span className="text-sm font-semibold">{r.referral_to}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <i className="fi fi-rr-calendar text-base text-blue-500" />
                  <span className="text-sm">{new Date(r.referral_date).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-50">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Diagnosis</p>
                <p className="text-sm text-slate-600 line-clamp-2">{r.diagnosis || 'Tidak ada diagnosis tertulis'}</p>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-400 font-medium pb-4 border-b border-slate-50">
                <span>Dokter: {r.doctor_name}</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full uppercase tracking-tighter",
                  r.status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                )}>{r.status}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button onClick={() => handleCreateQueue(r.patient_id, r.id)} disabled={r.status === 'processed'} className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 px-3 py-2.5 text-xs font-bold hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  <i className="fi fi-rr-calendar-plus text-[14px]" /> + Antrean
                </button>
                <button onClick={() => handleCreatePrescription(r.patient_id, r.id)} disabled={r.status === 'processed'} className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 px-3 py-2.5 text-xs font-bold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  <i className="fi fi-rr-medicine text-[14px]" /> + Resep
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="my-8 w-full max-w-xl rounded-2xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Buat Rujukan Pasien</h2>
              <button onClick={() => setShowForm(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <i className="fi fi-rr-cross text-xl" />
              </button>
            </div>

            {saveError && (
              <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-3 text-sm text-red-700">
                <i className="fi fi-rr-info text-lg flex-shrink-0" />
                {saveError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Pilih Pasien</label>
                <select required value={form.patient_id} onChange={e => setForm({...form, patient_id: parseInt(e.target.value)}) }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none transition-all appearance-none cursor-pointer">
                  <option value="0">-- Pilih Pasien --</option>
                  {patients?.map(p => (
                    <option key={p.id} value={p.id}>{p.full_name} ({p.nik})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Rumah Sakit / Klinik Tujuan</label>
                <input required type="text" placeholder="Nama Fasilitas Kesehatan Tujuan" value={form.referral_to} onChange={e => setForm({...form, referral_to: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none transition-all" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tanggal Rujukan</label>
                <input required type="date" value={form.referral_date} onChange={e => setForm({...form, referral_date: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none transition-all" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Diagnosis (Opsional)</label>
                <textarea rows={3} value={form.diagnosis} onChange={e => setForm({...form, diagnosis: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                  placeholder="Isi dengan diagnosa sementara atau hasil pemeriksaan..." />
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100 mt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-slate-200 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                  Batal
                </button>
                <button type="submit" disabled={saving || !form.patient_id} className="flex-[2] rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                  {saving ? <i className="fi fi-rr-spinner text-lg animate-spin" /> : <i className="fi fi-rr-disk text-lg" />}
                  {saving ? 'Memproses...' : 'Buat Rujukan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
