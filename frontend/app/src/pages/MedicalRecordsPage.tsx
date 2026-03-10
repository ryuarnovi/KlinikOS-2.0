"use client";
import { medicalRecordService } from '@/services/medicalRecordService';
import { useApi } from '@/hooks/useApi';
import { StatusBadge } from '@/components/StatusBadge';
import { FilePlus, ClipboardList, RefreshCw, AlertCircle, Loader2, X, Plus, Pill, Trash2, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { pharmacyService } from '@/services/pharmacyService';
import { prescriptionService } from '@/services/prescriptionService';
import { referralService } from '@/services/referralService';
import type { PharmacyItem } from '@/types';
import { patientService } from '@/services/patientService';
import { queueService } from '@/services/queueService';
import { useAuth } from '@/context/AuthContext';
import { CreateMedicalRecordRequest } from '@/services/medicalRecordService';
import { Share2 } from 'lucide-react';

export function MedicalRecordsPage() {
  const { user } = useAuth();
  const { data: records, loading, error, refetch } = useApi(() => medicalRecordService.getAll(), []);
  const { data: patients } = useApi(() => patientService.getAll(), []);
  const { data: queues } = useApi(() => queueService.getAll(), []);
  
  const [selected, setSelected] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
   const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [showReferralForm, setShowReferralForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [referralForm, setReferralForm] = useState({
    referral_to: '',
    referral_date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    notes: '',
  });

  const handleCreateReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!record) return;
    setSaving(true);
    setSaveError(null);
    try {
      await referralService.create({
        patient_id: record.patient_id,
        doctor_id: user?.id || record.doctor_id,
        medical_record_id: record.id,
        ...referralForm
      });
      setShowReferralForm(false);
      alert('Rujukan berhasil dibuat!');
    } catch (err: any) {
      setSaveError(err?.response?.data?.error || 'Gagal membuat rujukan');
    } finally {
      setSaving(false);
    }
  };

  const { data: drugs } = useApi(() => pharmacyService.getItems(), []);
  const [prescriptionItems, setPrescriptionItems] = useState<{ drug_id: number, qty: number, dosage: string, drug_name?: string }[]>([]);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');

  const [form, setForm] = useState<CreateMedicalRecordRequest>({
    patient_id: 0,
    queue_id: 0,
    doctor_id: user?.id || 0,
    visit_date: new Date().toISOString().split('T')[0],
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    vital_signs: '',
    icd_code: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patient_id || !form.doctor_id) {
      setSaveError('Pasien dan Dokter wajib diisi');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await medicalRecordService.create(form);
      setShowForm(false);
      refetch();
      setForm({
        patient_id: 0, queue_id: 0, doctor_id: user?.id || 0,
        visit_date: new Date().toISOString().split('T')[0],
        subjective: '', objective: '', assessment: '', plan: '', vital_signs: '', icd_code: '',
      });
    } catch (err: any) {
      setSaveError(err?.response?.data?.error || 'Gagal menyimpan rekam medis');
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!record || prescriptionItems.length === 0) return;
    setSaving(true);
    setSaveError(null);
    try {
      await prescriptionService.create({
        medical_record_id: record.id,
        patient_id: record.patient_id,
        doctor_id: user?.id || record.doctor_id,
        notes: prescriptionNotes,
        items: prescriptionItems.map(it => ({
          drug_id: it.drug_id,
          qty: it.qty,
          dosage: it.dosage
        }))
      });
      setShowPrescriptionForm(false);
      setPrescriptionItems([]);
      setPrescriptionNotes('');
      alert('Resep berhasil dibuat!');
    } catch (err: any) {
      setSaveError(err?.response?.data?.error || 'Gagal membuat resep');
    } finally {
      setSaving(false);
    }
  };

  const addPrescriptionItem = (drugId: number) => {
    const drug = drugs?.find(d => d.id === drugId);
    if (!drug) return;
    if (prescriptionItems.find(it => it.drug_id === drugId)) return;
    setPrescriptionItems([...prescriptionItems, { drug_id: drugId, qty: 1, dosage: '', drug_name: drug.name }]);
  };

  const record = (records || []).find(r => r.id === selected);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <span className="ml-3 text-slate-500">Memuat rekam medis...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-3" />
        <h3 className="text-lg font-semibold text-red-800">Gagal Memuat Data</h3>
        <p className="text-sm text-red-600 mt-1">{error}</p>
        <button onClick={refetch} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700">
          <RefreshCw size={14} /> Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rekam Medis (SOAP)</h1>
          <p className="text-sm text-slate-500 mt-1">{records?.length || 0} catatan — Data dari backend API</p>
        </div>
        <div className="flex gap-2">
          <button onClick={refetch} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition-all active:scale-95">
            <FilePlus size={16} /> Buat Rekam Medis
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Buat Rekam Medis (SOAP)</h2>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Standard Medical Documentation</p>
              </div>
              <button 
                onClick={() => setShowForm(false)} 
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {saveError && (
              <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-3 text-sm text-red-700">
                <AlertCircle size={18} className="flex-shrink-0" />
                {saveError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Pasien</label>
                  <select
                    required
                    value={form.patient_id || ''}
                    onChange={e => setForm({...form, patient_id: parseInt(e.target.value)})}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all appearance-none"
                  >
                    <option value="">-- Pilih Pasien --</option>
                    {patients?.map(p => (
                      <option key={p.id} value={p.id}>{p.full_name} ({p.nik})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Antrean (Opsional)</label>
                  <select
                    value={form.queue_id || ''}
                    onChange={e => setForm({...form, queue_id: parseInt(e.target.value)})}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all appearance-none"
                  >
                    <option value="0">-- Tanpa Antrean --</option>
                    {queues?.filter(q => q.status !== 'completed').map(q => (
                      <option key={q.id} value={q.id}>#{q.queue_number} - {q.patient_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Visit Date</label>
                  <input
                    type="date"
                    required
                    value={form.visit_date}
                    onChange={e => setForm({...form, visit_date: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tanda Vital / ICD</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="TD, Nadi, Suhu"
                      value={form.vital_signs || ''}
                      onChange={e => setForm({...form, vital_signs: e.target.value})}
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                    <input
                      type="text"
                      placeholder="ICD-10"
                      value={form.icd_code || ''}
                      onChange={e => setForm({...form, icd_code: e.target.value})}
                      className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all uppercase"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 block text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px]">S</span> Subjective
                    </label>
                    <textarea
                      value={form.subjective || ''}
                      onChange={e => setForm({...form, subjective: e.target.value})}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                      rows={3}
                      placeholder="Keluhan utama pasien..."
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 block text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px]">O</span> Objective
                    </label>
                    <textarea
                      value={form.objective || ''}
                      onChange={e => setForm({...form, objective: e.target.value})}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                      rows={3}
                      placeholder="Hasil pemeriksaan fisik..."
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 block text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-[10px]">A</span> Assessment
                    </label>
                    <textarea
                      value={form.assessment || ''}
                      onChange={e => setForm({...form, assessment: e.target.value})}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                      rows={3}
                      placeholder="Diagnosa..."
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 block text-[10px] font-black text-purple-500 uppercase tracking-widest mb-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-[10px]">P</span> Plan
                    </label>
                    <textarea
                      value={form.plan || ''}
                      onChange={e => setForm({...form, plan: e.target.value})}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                      rows={3}
                      placeholder="Rencana terapi/obat..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)} 
                  className="flex-1 rounded-xl border border-slate-200 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={saving || !form.patient_id} 
                  className="flex-[2] rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 text-sm font-bold text-white hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                  {saving ? 'Menyimpan...' : 'Simpan Rekam Medis'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {(!records || records.length === 0) ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12">
          <div className="text-center">
            <ClipboardList size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">Belum ada rekam medis. Hanya Dokter yang bisa membuat rekam medis baru.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-1">
            {records.map(rec => (
              <button key={rec.id} onClick={() => setSelected(rec.id)}
                className={`w-full rounded-xl border p-4 text-left transition-all ${
                  selected === rec.id
                    ? 'border-emerald-300 bg-emerald-50 shadow-md ring-1 ring-emerald-200'
                    : 'border-slate-200 bg-white shadow-sm hover:shadow-md'
                }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-800">{rec.patient_name}</span>
                  <StatusBadge status={rec.status} />
                </div>
                <p className="text-xs text-slate-500">{rec.doctor_name}</p>
                <p className="text-xs text-slate-400 mt-1">{rec.visit_date ? new Date(rec.visit_date).toLocaleDateString('id-ID') : '-'}</p>
                <p className="mt-2 text-xs text-slate-500 line-clamp-2">{rec.assessment}</p>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2">
            {record ? (
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{record.patient_name}</h3>
                      <p className="text-sm text-slate-500">{record.doctor_name} • {record.visit_date ? new Date(record.visit_date).toLocaleDateString('id-ID') : '-'}</p>
                    </div>
                    <StatusBadge status={record.status} />
                  </div>
                </div>
                <div className="p-6 space-y-5">
                  {[
                    { letter: 'S', title: 'Subjective', content: record.subjective, color: 'border-blue-400 bg-blue-50' },
                    { letter: 'O', title: 'Objective', content: record.objective, color: 'border-green-400 bg-green-50' },
                    { letter: 'A', title: 'Assessment', content: record.assessment, color: 'border-amber-400 bg-amber-50' },
                    { letter: 'P', title: 'Plan', content: record.plan, color: 'border-purple-400 bg-purple-50' },
                  ].map(s => (
                    <div key={s.letter} className={`rounded-lg border-l-4 ${s.color} p-4`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-700 shadow-sm">{s.letter}</span>
                        <span className="text-sm font-semibold text-slate-700">{s.title}</span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{s.content}</p>
                    </div>
                  ))}
                  <div className="flex gap-4 pt-6 border-t border-slate-100">
                    <button 
                      onClick={() => {
                        setPrescriptionNotes(`Resep dari Diagnosis: ${record.assessment}\nPlan: ${record.plan}`);
                        setShowPrescriptionForm(true);
                      }}
                      className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                    >
                      <Pill size={18} /> Buat Resep Obat
                    </button>
                    <button 
                      onClick={() => {
                        setReferralForm({
                          ...referralForm,
                          diagnosis: record.assessment || '',
                          notes: `Rujukan dari Plan: ${record.plan || ''}`
                        });
                        setShowReferralForm(true);
                      }}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all"
                    >
                      <Share2 size={18} /> Rujuk Pasien
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12">
                <div className="text-center">
                  <ClipboardList size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-sm text-slate-500">Pilih rekam medis untuk melihat detail SOAP</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {showPrescriptionForm && record && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="my-8 w-full max-w-3xl rounded-3xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Buat Resep Baru</h2>
                <p className="text-sm text-slate-500 mt-1">Pasien: <span className="font-bold text-slate-700">{record.patient_name}</span></p>
              </div>
              <button 
                onClick={() => setShowPrescriptionForm(false)} 
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Pilih Obat dari Inventori</label>
                  <div className="relative group">
                    <Pill className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <select
                      onChange={e => addPrescriptionItem(parseInt(e.target.value))}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-4 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer font-medium"
                      value=""
                    >
                      <option value="">-- Tambah Obat ke Daftar --</option>
                      {drugs?.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.unit}) - Stok: {d.stock}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Catatan Resep (Instruksi Khusus)</label>
                  <textarea
                    value={prescriptionNotes}
                    onChange={e => setPrescriptionNotes(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                    rows={6}
                    placeholder="Instruksi tambahan untuk apoteker..."
                  />
                </div>
              </div>

              <div className="flex flex-col h-full space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Daftar Item Resep</label>
                <div className="flex-1 rounded-2xl border border-slate-100 bg-slate-50/50 p-2 overflow-y-auto max-h-[400px]">
                  {prescriptionItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center px-8">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                        <Pill className="text-slate-300" size={24} />
                      </div>
                      <p className="text-xs text-slate-400 font-medium">Belum ada obat yang dipilih. Silakan pilih dari menu di samping.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {prescriptionItems.map((it, idx) => (
                        <div key={it.drug_id} className="group rounded-xl border border-white bg-white p-4 shadow-sm hover:shadow-md transition-all animate-in slide-in-from-right-2 duration-200">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-bold text-slate-800">{it.drug_name}</span>
                            <button 
                              onClick={() => setPrescriptionItems(prescriptionItems.filter((_, i) => i !== idx))}
                              className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Jumlah</label>
                              <input
                                type="number"
                                required
                                min="1"
                                value={it.qty}
                                onChange={e => {
                                  const newItems = [...prescriptionItems];
                                  newItems[idx].qty = parseInt(e.target.value) || 0;
                                  setPrescriptionItems(newItems);
                                }}
                                className="w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs focus:border-blue-500 focus:bg-white focus:outline-none transition-all font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Dosis (Aturan Pakai)</label>
                              <input
                                type="text"
                                required
                                placeholder="3x1 sesudah makan"
                                value={it.dosage}
                                onChange={e => {
                                  const newItems = [...prescriptionItems];
                                  newItems[idx].dosage = e.target.value;
                                  setPrescriptionItems(newItems);
                                }}
                                className="w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-8 mt-8 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setShowPrescriptionForm(false)} 
                className="flex-1 rounded-2xl border border-slate-200 py-4 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
              >
                Tutup
              </button>
              <button 
                onClick={handleCreatePrescription}
                disabled={saving || prescriptionItems.length === 0} 
                className="flex-[2] rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 py-4 text-sm font-bold text-white hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-blue-500/25 transition-all active:scale-95 translate-y-0 hover:-translate-y-1"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? 'Memproses Resep...' : 'Konfirmasi & Kirim ke Farmasi'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showReferralForm && record && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="my-8 w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Buat Rujukan Pasien</h2>
                <p className="text-sm text-slate-500 mt-1">Pasien: <span className="font-bold text-slate-700">{record.patient_name}</span></p>
              </div>
              <button 
                onClick={() => setShowReferralForm(false)} 
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateReferral} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">RS / Klinik Tujuan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: RS Hasan Sadikin"
                  value={referralForm.referral_to}
                  onChange={e => setReferralForm({...referralForm, referral_to: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/10 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Tanggal Rujukan</label>
                <input
                  type="date"
                  required
                  value={referralForm.referral_date}
                  onChange={e => setReferralForm({...referralForm, referral_date: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/10 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Diagnosa Rujukan</label>
                <textarea
                  required
                  value={referralForm.diagnosis}
                  onChange={e => setReferralForm({...referralForm, diagnosis: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/10 transition-all font-medium"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Catatan Tambahan</label>
                <textarea
                  value={referralForm.notes}
                  onChange={e => setReferralForm({...referralForm, notes: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/10 transition-all font-medium"
                  rows={2}
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowReferralForm(false)} 
                  className="flex-1 rounded-2xl border border-slate-200 py-4 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="flex-[2] rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 py-4 text-sm font-bold text-white hover:from-red-600 hover:to-rose-700 disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-red-500/25 transition-all active:scale-95"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {saving ? 'Menyimpan...' : 'Simpan Rujukan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
