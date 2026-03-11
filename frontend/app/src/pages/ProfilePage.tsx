"use client";
import { useState, useEffect, useRef } from 'react';
import { userService, UserResponse } from '@/services/userService';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/config/api';

export function ProfilePage() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    nip: '',
    specialization: '',
    license_number: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await userService.getMe();
      setUser(data);
      setFormData({
        full_name: data.full_name || '',
        email: data.email || '',
        phone: data.phone || '',
        password: '',
        nip: data.nip || '',
        specialization: data.specialization || '',
        license_number: data.license_number || '',
      });
    } catch (err) {
      toast.error('Gagal memuat profil');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB');
      return;
    }

    setUploading(true);
    try {
      const photoUrl = await userService.uploadMePhoto(file);
      setUser(prev => prev ? { ...prev, profile_picture_url: photoUrl } : null);
      toast.success('Foto profil berhasil diperbarui');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal mengunggah foto');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userService.updateMe(formData);
      toast.success('Profil berhasil diperbarui');
      loadProfile();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  const role = user?.role?.toLowerCase();
  const isDoctor = role === 'dokter';
  const isNurse = role === 'perawat';
  const isApothecary = role === 'apoteker';
  const isStaff = ['dokter', 'perawat', 'apoteker', 'kasir', 'resepsionis'].includes(role || '');

  // Full URL for profile picture
  const profilePhoto = user?.profile_picture_url 
    ? (user.profile_picture_url.startsWith('http') ? user.profile_picture_url : `${API_URL.replace('/api', '')}${user.profile_picture_url}`)
    : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profil Saya</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola biodata dan informasi akun Anda.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden relative">
             {/* Background Decoration */}
            <div className={`absolute top-0 left-0 w-full h-24 bg-gradient-to-r ${isDoctor ? 'from-blue-500 to-indigo-600' : 'from-emerald-500 to-teal-600'} opacity-10`} />
            
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="relative group">
                <div className="h-28 w-28 rounded-full bg-white p-1 shadow-md border border-slate-100 overflow-hidden">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="h-full w-full object-cover rounded-full" />
                  ) : (
                    <div className="h-full w-full rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                      <i className="fi fi-rr-user text-5xl" />
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                       <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center text-slate-600 hover:text-emerald-600 transition-colors"
                >
                  <i className="fi fi-rr-camera text-sm" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              <h2 className="text-xl font-bold text-slate-900 mt-4">{user?.full_name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${isDoctor ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {user?.role}
                </span>
                {user?.is_active && (
                  <span className="flex h-2 w-2 rounded-full bg-green-500" title="Akun Aktif" />
                )}
              </div>

              <div className="mt-6 w-full pt-6 border-t border-slate-100 text-left space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium font-inter">Username</span>
                  <span className="text-slate-900 font-semibold">@{user?.username}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium font-inter">ID Pegawai</span>
                  <span className="text-slate-900 font-semibold">#USR-{user?.id.toString().padStart(4, '0')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium font-inter">Member Sejak</span>
                  <span className="text-slate-900 font-semibold">{new Date(user?.created_at || '').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Role Description Card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 shadow-sm">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Hak Akses Role</h4>
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-lg bg-white p-2 text-slate-400 shadow-sm border border-slate-100">
                <i className="fi fi-rr-shield-check" />
              </div>
              <p className="text-xs leading-relaxed text-slate-500">
                Sebagai <strong>{user?.role}</strong>, Anda memiliki otorisasi untuk mengakses fitur {isDoctor ? 'pemeriksaan medis dan resep' : isApothecary ? 'manajemen obat dan farmasi' : 'layanan administrasi klinik'}.
              </p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <i className="fi fi-rr-edit text-emerald-500" />
                Informasi Biodata
              </h3>
              <span className="text-[10px] text-slate-400 font-medium italic">Pembaruan terakhir: {new Date(user?.updated_at || '').toLocaleDateString('id-ID')}</span>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* General Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-4 border-emerald-500 pl-3">Identitas Umum</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 ml-1">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-2.5 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm font-medium"
                      value={formData.full_name}
                      onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 ml-1">Email Aktif</label>
                    <input
                      type="email"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-2.5 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm font-medium"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 ml-1">Nomor Telepon/WA</label>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-2.5 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm font-medium"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 ml-1">Ubah Password <span className="text-[10px] text-slate-400 font-normal">(Opsional)</span></label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-2.5 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm font-medium"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Roles Specific Info */}
              {isStaff && (
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-4 border-blue-500 pl-3">Kredensial Profesi</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 ml-1">Nomor Induk Pegawai (NIP)</label>
                      <input
                        type="text"
                        placeholder="Contoh: 1980xxxx xxxxxxxx"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-2.5 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium"
                        value={formData.nip}
                        onChange={e => setFormData({ ...formData, nip: e.target.value })}
                      />
                    </div>
                    
                    {(isDoctor || isNurse) && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 ml-1">Bidang Spesialisasi</label>
                        <input
                          type="text"
                          placeholder="Misal: Umum, Gigi, dsb."
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-2.5 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium"
                          value={formData.specialization}
                          onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                        />
                      </div>
                    )}

                    {(isDoctor || isApothecary || isNurse) && (
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-slate-600 ml-1">
                          {isApothecary ? 'SIPA (Surat Izin Praktik Apoteker)' : isDoctor ? 'STR (Surat Tanda Registrasi)' : 'SIPP (Surat Izin Praktik Perawat)'}
                        </label>
                        <input
                          type="text"
                          placeholder="Masukkan nomor izin resmi"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-2.5 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium"
                          value={formData.license_number}
                          onChange={e => setFormData({ ...formData, license_number: e.target.value })}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-50">
                <button
                  type="submit"
                  disabled={saving}
                  className={`rounded-xl px-10 py-3.5 font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 ${isDoctor ? 'bg-blue-600 shadow-blue-200 hover:bg-blue-700' : 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700'}`}
                >
                  <div className="flex items-center gap-2">
                    {saving ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <i className="fi fi-rr-disk" />
                    )}
                    <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
