"use client";
import { patientService, type CreatePatientRequest } from '@/services/patientService';
import { useApi } from '@/hooks/useApi';
import { UserPlus, Search, RefreshCw, AlertCircle, Loader2, X } from 'lucide-react';
import { useState } from 'react';

export function PatientsPage() {
  const { data: patients, loading, error, refetch } = useApi(() => patientService.getAll(), []);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [form, setForm] = useState<CreatePatientRequest>({
    nik: '', full_name: '', date_of_birth: '', gender: 'L',
    phone: '', address: '', blood_type: '', is_walkin: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = (patients || []).filter(p =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.nik?.includes(search)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      if (editingId) {
        await patientService.update(editingId, form);
      } else {
        await patientService.create(form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ nik: '', full_name: '', date_of_birth: '', gender: 'L', phone: '', address: '', blood_type: '', is_walkin: true });
      refetch();
    } catch (err: unknown) {
      setSaveError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p: any) => {
    setEditingId(p.id.toString());
    setForm({
      nik: p.nik || '',
      full_name: p.full_name || '',
      date_of_birth: p.date_of_birth ? p.date_of_birth.split('T')[0] : '',
      gender: p.gender || 'L',
      phone: p.phone || '',
      address: p.address || '',
      blood_type: p.blood_type || '',
      is_walkin: p.is_walkin || false,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus data pasien ini?')) return;
    try {
      await patientService.delete(id.toString());
      refetch();
    } catch (err) {
      alert('Gagal menghapus pasien');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <span className="ml-3 text-slate-500">Memuat data pasien...</span>
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
          <h1 className="text-2xl font-bold text-slate-900">Data Pasien</h1>
          <p className="text-sm text-slate-500 mt-1">
            {patients?.length || 0} pasien terdaftar — Data langsung dari backend API
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={refetch} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm">
            <UserPlus size={16} /> Registrasi Pasien
          </button>
        </div>
      </div>

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">{editingId ? 'Update Data Pasien' : 'Registrasi Pasien Baru'}</h2>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            {saveError && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{saveError}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">NIK (16 digit)</label>
                  <input type="text" required maxLength={16} minLength={16} value={form.nik}
                    onChange={e => setForm(f => ({...f, nik: e.target.value}))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="3201010101900001" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nama Lengkap</label>
                  <input type="text" required value={form.full_name}
                    onChange={e => setForm(f => ({...f, full_name: e.target.value}))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Nama pasien" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Tanggal Lahir</label>
                  <input type="date" required value={form.date_of_birth}
                    onChange={e => setForm(f => ({...f, date_of_birth: e.target.value}))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Gender</label>
                  <select value={form.gender} onChange={e => setForm(f => ({...f, gender: e.target.value as 'L' | 'P'}))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500">
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Gol. Darah</label>
                  <select value={form.blood_type || ''} onChange={e => setForm(f => ({...f, blood_type: e.target.value}))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500">
                    <option value="">-</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Telepon</label>
                <input type="text" value={form.phone || ''} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="081234567890" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Alamat</label>
                <textarea value={form.address || ''} onChange={e => setForm(f => ({...f, address: e.target.value}))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" rows={2}
                  placeholder="Jl. Merdeka No. 10, Jakarta" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_walkin} onChange={e => setForm(f => ({...f, is_walkin: e.target.checked}))}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                <label className="text-sm text-slate-600">Pasien Walk-in</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Cari nama atau NIK..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <UserPlus size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">
            {search ? 'Tidak ada pasien yang cocok dengan pencarian' : 'Belum ada data pasien. Klik "Registrasi Pasien" untuk menambahkan.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(patient => (
            <div key={patient.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 text-base font-bold text-cyan-700">
                    {patient.full_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{patient.full_name}</h3>
                    <p className="text-xs text-slate-400">NIK: {patient.nik}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${patient.is_walkin ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {patient.is_walkin ? 'Walk-in' : 'Terdaftar'}
                </span>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tgl Lahir</span>
                  <span>{patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString('id-ID') : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Gender</span>
                  <span>{patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Gol. Darah</span>
                  <span className="font-semibold text-red-600">{patient.blood_type || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Telepon</span>
                  <span>{patient.phone || '-'}</span>
                </div>
              </div>
              {patient.address && (
                <div className="mt-3 border-t border-slate-100 pt-3 flex items-center justify-between">
                  <p className="text-xs text-slate-400 truncate max-w-[150px]">📍 {patient.address}</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(patient)} className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider">Update</button>
                    <button onClick={() => handleDelete(patient.id)} className="text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-wider">Hapus</button>
                  </div>
                </div>
              )}
              {!patient.address && (
                <div className="mt-3 border-t border-slate-100 pt-3 flex justify-end">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(patient)} className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider">Update</button>
                    <button onClick={() => handleDelete(patient.id)} className="text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-wider">Hapus</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
