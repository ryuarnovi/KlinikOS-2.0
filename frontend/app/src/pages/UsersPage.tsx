"use client";
import { userService, CreateUserRequest } from '@/services/userService';
import { useApi } from '@/hooks/useApi';
import { StatusBadge, RoleBadge } from '@/components/StatusBadge';
import { useState } from 'react';

export function UsersPage() {
  const { data: users, loading, error, refetch } = useApi(() => userService.getAll(), []);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [form, setForm] = useState<CreateUserRequest>({
    username: '', 
    email: '', 
    password: '', 
    full_name: '', 
    role: 'perawat', 
    phone: '',
    nip: '',
    specialization: '',
    license_number: ''
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const filtered = (users || []).filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      if (editingId) {
        await userService.update(editingId, form);
      } else {
        await userService.create(form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ 
        username: '', 
        email: '', 
        password: '', 
        full_name: '', 
        role: 'perawat', 
        phone: '',
        nip: '',
        specialization: '',
        license_number: ''
      });
      refetch();
    } catch (err: any) {
      setSaveError(err?.response?.data?.error || 'Gagal menyimpan data user');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (u: any) => {
    setEditingId(u.id);
    setForm({
      username: u.username,
      email: u.email,
      password: '', // Password empty for security on update
      full_name: u.full_name,
      role: u.role,
      phone: u.phone || '',
      nip: u.nip || '',
      specialization: u.specialization || '',
      license_number: u.license_number || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus user ini?')) return;
    try {
      await userService.delete(id);
      refetch();
    } catch (err) {
      alert('Gagal menghapus user');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <i className="fi fi-rr-spinner text-3xl animate-spin text-emerald-500" />
        <span className="ml-3 text-slate-500">Memuat data pengguna...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users & Roles</h1>
          <p className="text-sm text-slate-500 mt-1">Manajemen pengguna dengan Role-Based Access Control (RBAC)</p>
        </div>
        <button 
          onClick={() => { 
            setEditingId(null); 
            setForm({ 
              username: '', 
              email: '', 
              password: '', 
              full_name: '', 
              role: 'perawat', 
              phone: '',
              nip: '',
              specialization: '',
              license_number: ''
            }); 
            setShowForm(true); 
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <i className="fi fi-rr-user-add text-base" />
          Tambah User
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <i className="fi fi-rr-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau username..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-5 py-3 text-left font-semibold text-slate-600">User</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Username</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Role</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Status</th>
                <th className="px-5 py-3 text-center font-semibold text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-sm font-bold text-slate-600">
                        {user.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{user.full_name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <code className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-600">{user.username}</code>
                  </td>
                  <td className="px-5 py-3.5"><RoleBadge role={user.role} /></td>
                  <td className="px-5 py-3.5"><StatusBadge status={user.is_active ? 'active' : 'inactive'} /></td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleEdit(user)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <i className="fi fi-rr-edit text-[14px]" />
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <i className="fi fi-rr-trash text-[14px]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="my-8 w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">{editingId ? 'Edit User' : 'Tambah User Baru'}</h2>
              <button 
                onClick={() => setShowForm(false)} 
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <i className="fi fi-rr-cross text-xl" />
              </button>
            </div>

            {saveError && (
              <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-3 text-sm text-red-700">
                <i className="fi fi-rr-info text-lg flex-shrink-0" />
                {saveError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                <input required type="text" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Username</label>
                  <input required type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Role</label>
                  <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-emerald-500 focus:bg-white transition-all appearance-none">
                    <option value="admin">Admin</option>
                    <option value="dokter">Dokter</option>
                    <option value="perawat">Perawat</option>
                    <option value="apoteker">Apoteker</option>
                    <option value="kasir">Kasir</option>
                    <option value="resepsionis">Resepsionis</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{editingId ? 'Password (Kosongkan jika tidak diubah)' : 'Password'}</label>
                <input required={!editingId} type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none transition-all" />
              </div>

              {form.role !== 'pasien' && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <p className="text-sm font-bold text-slate-700">Informasi Staff</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">NIP</label>
                      <input type="text" value={form.nip} onChange={e => setForm({...form, nip: e.target.value})}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Spesialisasi</label>
                      <input type="text" value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">No. Izin Praktik / Lisensi</label>
                    <input type="text" value={form.license_number} onChange={e => setForm({...form, license_number: e.target.value})}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none transition-all" />
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t border-slate-100 mt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                  Batal
                </button>
                <button type="submit" disabled={saving} className="flex-[2] rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
                  {saving ? <i className="fi fi-rr-spinner text-lg animate-spin" /> : <i className="fi fi-rr-disk text-lg" />}
                  {saving ? 'Menyimpan...' : 'Simpan Data User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
