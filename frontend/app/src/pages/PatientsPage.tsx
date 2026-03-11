"use client";
import { patientService, type CreatePatientRequest } from '@/services/patientService';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { cn } from '@/utils/cn';

export function PatientsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'resepsionis';
  
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
        <i className="fi fi-rr-spinner text-3xl animate-spin text-indigo-500" />
        <span className="ml-3 text-slate-500 font-bold uppercase tracking-widest text-xs">Memuat data pasien...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50/50 p-8 text-center animate-in fade-in zoom-in">
        <i className="fi fi-rr-info mx-auto text-5xl text-red-400 mb-4" />
        <h3 className="text-lg font-black text-red-800 tracking-tight">Gagal Memuat Data</h3>
        <p className="text-xs text-red-600/70 mt-1 uppercase font-bold tracking-widest">{error}</p>
        <button onClick={refetch} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white hover:bg-red-700 shadow-lg shadow-red-100">
          <i className="fi fi-rr-refresh" /> Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Data Pasien</h1>
          <p className="text-sm text-slate-500 mt-1 uppercase tracking-widest font-bold text-[10px]">
            {patients?.length || 0} Pasien Terdaftar — Data Berbasis Plotting Role
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={refetch} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <i className="fi fi-rr-refresh" />
          </button>
          {isAdmin && (
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-black text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95">
              <i className="fi fi-rr-user-add text-lg" /> Registrasi Pasien
            </button>
          )}
        </div>
      </div>

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">{editingId ? 'Update Data Pasien' : 'Registrasi Pasien Baru'}</h2>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Lengkapi data identitas pasien sesuai KTP</p>
              </div>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all">
                <i className="fi fi-rr-cross text-xl" />
              </button>
            </div>

            {saveError && (
              <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-100 p-4 text-xs font-bold text-rose-600 animate-pulse">{saveError}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">NIK (16 digit)</label>
                  <input type="text" required maxLength={16} minLength={16} value={form.nik}
                    onChange={e => setForm(f => ({...f, nik: e.target.value}))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="3201010101900001" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nama Lengkap</label>
                  <input type="text" required value={form.full_name}
                    onChange={e => setForm(f => ({...f, full_name: e.target.value}))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="Nama pasien" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tanggal Lahir</label>
                  <input type="date" required value={form.date_of_birth}
                    onChange={e => setForm(f => ({...f, date_of_birth: e.target.value}))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm focus:border-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Gender</label>
                  <select value={form.gender} onChange={e => setForm(f => ({...f, gender: e.target.value as 'L' | 'P'}))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm focus:border-indigo-500 focus:outline-none">
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Gol. Darah</label>
                  <select value={form.blood_type || ''} onChange={e => setForm(f => ({...f, blood_type: e.target.value}))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm focus:border-indigo-500 focus:outline-none">
                    <option value="">-</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Telepon</label>
                <input type="text" value={form.phone || ''} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="081234567890" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Alamat</label>
                <textarea value={form.address || ''} onChange={e => setForm(f => ({...f, address: e.target.value}))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm focus:border-indigo-500 focus:outline-none" rows={2}
                  placeholder="Jl. Merdeka No. 10, Jakarta" />
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <input type="checkbox" checked={form.is_walkin} onChange={e => setForm(f => ({...f, is_walkin: e.target.checked}))}
                  className="h-5 w-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all" />
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Pasien Walk-in (Tanpa Appointment Online)</label>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-2xl border border-slate-200 py-4 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 rounded-2xl bg-indigo-600 py-4 text-sm font-black text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-all">
                  {saving ? <i className="fi fi-rr-spinner animate-spin text-lg" /> : <i className="fi fi-rr-check text-lg" />}
                  {saving ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="relative max-w-md">
        <i className="fi fi-rr-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Cari nama atau NIK..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm transition-all" />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-20 text-center animate-in fade-in slide-in-from-bottom-4">
          <div className="h-20 w-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6">
            <i className="fi fi-rr-user-add text-4xl text-slate-200" />
          </div>
          <h3 className="text-lg font-black text-slate-800 tracking-tight">Data Pasien Tidak Ditemukan</h3>
          <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">
            {search ? 'Gunakan kata kunci pencarian lain' : 'Klik "Registrasi Pasien" jika Anda memiliki akses'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(patient => (
            <div key={patient.id} className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl hover:border-indigo-100 hover:scale-[1.01] transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                    {patient.full_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">{patient.full_name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                       <p className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 rounded-md border border-slate-100">NIK: {patient.nik}</p>
                    </div>
                  </div>
                </div>
                <span className={cn(
                   "rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider",
                   patient.is_walkin ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                )}>
                  {patient.is_walkin ? 'Walk-in' : 'Terdaftar'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50 text-[11px]">
                <div className="space-y-1">
                  <p className="font-bold text-slate-400 uppercase tracking-widest">Tgl Lahir</p>
                  <p className="text-slate-800 font-bold">{patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'}) : '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-400 uppercase tracking-widest">Gender</p>
                  <p className="text-slate-800 font-bold">{patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-400 uppercase tracking-widest">Gol. Darah</p>
                  <p className="text-rose-600 font-black">{patient.blood_type || 'TIDAK TAHU'}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-400 uppercase tracking-widest">Telepon</p>
                  <p className="text-slate-800 font-bold">{patient.phone || '-'}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <i className="fi fi-rr-marker text-xs" />
                  <p className="text-[10px] font-bold truncate max-w-[120px] uppercase tracking-tight">{patient.address || 'Alamat Belum Diisi'}</p>
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(patient)} className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all" title="Update Data">
                      <i className="fi fi-rr-edit" />
                    </button>
                    <button onClick={() => handleDelete(patient.id)} className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all" title="Hapus Pasien">
                      <i className="fi fi-rr-trash" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
