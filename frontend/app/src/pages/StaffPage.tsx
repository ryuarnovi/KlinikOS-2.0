"use client";
import { hrisService, DoctorSchedule, StaffShift } from '@/services/hrisService';
import { userService } from '@/services/userService';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';

export function StaffPage() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();
  const isAdmin = role === 'admin';
  const isDoctor = role === 'dokter';
  const isStaff = ['perawat', 'apoteker', 'kasir', 'resepsionis'].includes(role || '');
  
  const { data: users } = useApi(() => userService.getStaff(), []);
  const { data: schedules, refetch: refetchSchedules } = useApi(() => hrisService.getSchedules(), []);
  const { data: shifts, refetch: refetchShifts } = useApi(() => hrisService.getShifts(), []);
  
  const [activeTab, setActiveTab] = useState<'profiles' | 'schedules' | 'shifts'>('profiles');

  useEffect(() => {
    if (isDoctor) setActiveTab('schedules');
    else if (isStaff) setActiveTab('shifts');
    else if (isAdmin) setActiveTab('profiles');
  }, [isDoctor, isStaff, isAdmin]);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Form States
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(null);
  const [editingShiftId, setEditingShiftId] = useState<number | null>(null);

  const [scheduleForm, setScheduleForm] = useState({
    doctor_id: 0,
    day_of_week: 1,
    start_time: '08:00',
    end_time: '14:00',
    quota: 20
  });

  const [shiftForm, setShiftForm] = useState({
    staff_id: 0,
    shift_date: new Date().toISOString().split('T')[0],
    shift_type: 'morning',
    start_time: '07:00',
    end_time: '14:00',
    notes: ''
  });

  const doctors = (users || []).filter(u => u.role.toLowerCase() === 'dokter');
  const staffRoles = ['dokter', 'perawat', 'apoteker', 'kasir', 'resepsionis'];
  const nonDoctorStaff = (users || []).filter(u => u.role.toLowerCase() !== 'dokter' && staffRoles.includes(u.role.toLowerCase()));
  
  const filteredStaff = (users || []).filter(u => 
    staffRoles.includes(u.role.toLowerCase()) && (
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (u.nip || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const formatTimeDisplay = (timeStr: string) => {
    if (!timeStr) return '--:--';
    let timePart = timeStr;
    if (timeStr.includes('T')) {
      timePart = timeStr.split('T')[1];
    }
    const parts = timePart.split(':');
    if (parts.length >= 2) {
      const hours = parts[0].slice(-2).padStart(2, '0');
      const minutes = parts[1].padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    return timePart;
  };

  const resetScheduleForm = () => {
    setScheduleForm({
      doctor_id: 0,
      day_of_week: 1,
      start_time: '08:00',
      end_time: '14:00',
      quota: 20
    });
    setEditingScheduleId(null);
  };

  const handleCreateOrUpdateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingScheduleId) {
        await hrisService.updateSchedule(editingScheduleId, scheduleForm);
      } else {
        await hrisService.createSchedule(scheduleForm);
      }
      setShowScheduleForm(false);
      resetScheduleForm();
      refetchSchedules();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Gagal menyimpan jadwal');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSchedule = (s: DoctorSchedule) => {
    setScheduleForm({
      doctor_id: s.doctor_id,
      day_of_week: s.day_of_week,
      start_time: formatTimeDisplay(s.start_time),
      end_time: formatTimeDisplay(s.end_time),
      quota: s.quota
    });
    setEditingScheduleId(s.id);
    setShowScheduleForm(true);
  };

  const handleDeleteSchedule = async (id: number) => {
    if (!confirm('Hapus jadwal ini?')) return;
    try {
      await hrisService.deleteSchedule(id);
      refetchSchedules();
    } catch (err) {
      alert('Gagal menghapus jadwal');
    }
  };

  const resetShiftForm = () => {
    setShiftForm({
      staff_id: 0,
      shift_date: new Date().toISOString().split('T')[0],
      shift_type: 'morning',
      start_time: '07:00',
      end_time: '14:00',
      notes: ''
    });
    setEditingShiftId(null);
  };

  const handleCreateOrUpdateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingShiftId) {
        await hrisService.updateShift(editingShiftId, shiftForm);
      } else {
        await hrisService.createShift(shiftForm);
      }
      setShowShiftForm(false);
      resetShiftForm();
      refetchShifts();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Gagal menyimpan shift');
    } finally {
      setLoading(false);
    }
  };

  const handleEditShift = (s: StaffShift) => {
    setShiftForm({
      staff_id: s.staff_id,
      shift_date: s.shift_date.split('T')[0],
      shift_type: s.shift_type as any,
      start_time: formatTimeDisplay(s.start_time),
      end_time: formatTimeDisplay(s.end_time),
      notes: s.notes || ''
    });
    setEditingShiftId(s.id);
    setShowShiftForm(true);
  };

  const handleDeleteShift = async (id: number) => {
    if (!confirm('Hapus shift ini?')) return;
    try {
      await hrisService.deleteShift(id);
      refetchShifts();
    } catch (err) {
      alert('Gagal menghapus shift');
    }
  };

  const availableTabs = [
    { id: 'profiles', label: 'Profil Staff', icon: 'fi-rr-users', visible: isAdmin },
    { id: 'schedules', label: 'Jadwal Dokter', icon: 'fi-rr-calendar', visible: isAdmin || isDoctor },
    { id: 'shifts', label: 'Shift Harian', icon: 'fi-rr-clock', visible: isAdmin || isStaff },
  ].filter(t => t.visible);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Human Resource (HRIS)</h1>
          <p className="text-sm text-slate-500 mt-1 uppercase tracking-widest font-bold text-[10px]">
            {isAdmin ? 'Manajemen Staff & Jadwal Operasional' : `Jadwal Personal - ${role?.toUpperCase()}`}
          </p>
        </div>
      </div>

      <div className="flex gap-1 rounded-xl bg-slate-100 p-1 w-fit">
        {availableTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all",
              activeTab === tab.id 
                ? "bg-white text-indigo-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            )}
          >
            <i className={cn("fi text-base", tab.icon)} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profiles' && isAdmin && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="relative max-w-md">
            <i className="fi fi-rr-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari staff atau NIP..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-6 py-4 text-left font-bold text-slate-400 uppercase tracking-widest text-[10px]">Staff</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-400 uppercase tracking-widest text-[10px]">NIP / Identitas</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-400 uppercase tracking-widest text-[10px]">Role</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-400 uppercase tracking-widest text-[10px]">Spesialisasi</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-400 uppercase tracking-widest text-[10px]">No. SIP/STR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStaff.map(staff => (
                    <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                            {staff.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{staff.full_name}</p>
                            <p className="text-[10px] text-slate-400">{staff.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-mono text-slate-600 border border-slate-200">{staff.nip || 'BELUM DIISI'}</code>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                          staff.role === 'dokter' ? "bg-blue-50 text-blue-600 border border-blue-100" :
                          staff.role === 'admin' ? "bg-rose-50 text-rose-600 border border-rose-100" :
                          "bg-slate-100 text-slate-600 border border-slate-200"
                        )}>
                          {staff.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{staff.specialization || '-'}</td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">{staff.license_number || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'schedules' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
             <div>
               <h2 className="font-bold text-slate-800 text-lg">
                 {isAdmin ? 'Master Jadwal Praktek' : 'Jadwal Praktek Saya'}
               </h2>
               <p className="text-xs text-slate-400">
                 {isAdmin ? 'Atur ketersediaan jam kerja dokter' : 'Ketersediaan jam praktek Anda yang terdaftar di sistem'}
               </p>
             </div>
             {isAdmin && (
               <button onClick={() => { resetScheduleForm(); setShowScheduleForm(true); }} className="bg-indigo-600 text-white text-sm px-4 py-2.5 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2">
                 <i className="fi fi-rr-plus" /> Tambah Jadwal
               </button>
             )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(isAdmin ? doctors : doctors.filter(d => d.id === user?.id)).map(doc => {
              const docSchedules = (schedules || []).filter(s => s.doctor_id === doc?.id);
              if (!isAdmin && docSchedules.length === 0) return (
                <div key="no-schedule" className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
                   <i className="fi fi-rr-calendar-exclamation text-4xl text-slate-200 mb-4 block" />
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Anda belum memiliki jadwal yang terdaftar</p>
                </div>
              );

              return (
                <div key={doc?.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                      <i className="fi fi-rr-doctor text-2xl" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 tracking-tight">{doc?.full_name}</h3>
                      <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{(doc as any)?.specialization || 'Dokter Umum'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {days.map((day, idx) => {
                      const daySchedules = docSchedules.filter(s => s.day_of_week === idx);
                      return (
                        <div key={day} className="flex flex-col gap-1 py-2 border-b border-slate-50 last:border-0">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <span>{day}</span>
                            {daySchedules.length === 0 && <span className="text-slate-200 font-normal">Tidak Ada Jadwal</span>}
                          </div>
                          {daySchedules.map(s => (
                            <div key={s.id} className="group flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 hover:border-indigo-200 transition-all">
                              <span className="text-slate-700 font-bold text-xs uppercase tracking-tight">
                                {formatTimeDisplay(s.start_time)} - {formatTimeDisplay(s.end_time)}
                                <span className="ml-2 text-indigo-500 font-black">(Q: {s.quota})</span>
                              </span>
                              {isAdmin && (
                                <div className="flex items-center gap-2">
                                  <button onClick={() => handleEditSchedule(s)} className="text-slate-300 hover:text-indigo-500 transition-colors">
                                    <i className="fi fi-rr-edit text-xs" />
                                  </button>
                                  <button onClick={() => handleDeleteSchedule(s.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                    <i className="fi fi-rr-trash text-xs" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'shifts' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
             <div>
               <h2 className="font-bold text-slate-800 text-lg">
                 {isAdmin ? 'Monitoring Shift Harian' : 'Plot Shift Saya'}
               </h2>
               <p className="text-xs text-slate-400">
                 {isAdmin ? 'Pantau pembagian shift kerja staf hari ini' : 'Daftar jadwal shift kerja Anda'}
               </p>
             </div>
             {isAdmin && (
               <button onClick={() => { resetShiftForm(); setShowShiftForm(true); }} className="bg-indigo-600 text-white text-sm px-4 py-2.5 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2">
                 <i className="fi fi-rr-plus" /> Plot Shift Baru
               </button>
             )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="px-6 py-4 text-left">Nama Staff</th>
                    <th className="px-6 py-4 text-left">Tanggal</th>
                    <th className="px-6 py-4 text-left">Shift / Waktu</th>
                    <th className="px-6 py-4 text-left">Catatan Tugas</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {((shifts || []).filter(s => isAdmin || s.staff_id === user?.id)).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Tidak ada data shift ditemukan</td>
                    </tr>
                  ) : ((shifts || []).filter(s => isAdmin || s.staff_id === user?.id)).map(shift => (
                    <tr key={shift.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700">{shift.staff_name}</td>
                      <td className="px-6 py-4 text-slate-500">{new Date(shift.shift_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-black uppercase",
                            shift.shift_type === 'morning' ? "bg-amber-100 text-amber-700" :
                            shift.shift_type === 'afternoon' ? "bg-blue-100 text-blue-700" :
                            "bg-indigo-900 text-indigo-100"
                          )}>
                            {shift.shift_type}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-600">
                            {formatTimeDisplay(shift.start_time)} - {formatTimeDisplay(shift.end_time)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{shift.notes || '-'}</td>
                      <td className="px-6 py-4 text-center">
                        {isAdmin && (
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleEditShift(shift)} className="text-slate-300 hover:text-indigo-500 transition-colors p-2">
                              <i className="fi fi-rr-edit" />
                            </button>
                            <button onClick={() => handleDeleteShift(shift.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2">
                              <i className="fi fi-rr-trash" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modals - Only accessible by Admin */}
      {isAdmin && showScheduleForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-black text-slate-900 mb-6 tracking-tight">
              {editingScheduleId ? 'Edit Jadwal Dokter' : 'Tambah Jadwal Dokter'}
            </h2>
            <form onSubmit={handleCreateOrUpdateSchedule} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Dokter</label>
                <select required value={scheduleForm.doctor_id} onChange={e => setScheduleForm({...scheduleForm, doctor_id: parseInt(e.target.value)})}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none">
                  <option value="0">-- Pilih Dokter --</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Hari</label>
                <select required value={scheduleForm.day_of_week} onChange={e => setScheduleForm({...scheduleForm, day_of_week: parseInt(e.target.value)})}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none">
                  {days.map((day, idx) => <option key={day} value={idx}>{day}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Jam Mulai</label>
                  <input type="time" required value={scheduleForm.start_time} onChange={e => setScheduleForm({...scheduleForm, start_time: e.target.value})}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Jam Selesai</label>
                  <input type="time" required value={scheduleForm.end_time} onChange={e => setScheduleForm({...scheduleForm, end_time: e.target.value})}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Kuota Pasien</label>
                <input type="number" required value={scheduleForm.quota} onChange={e => setScheduleForm({...scheduleForm, quota: parseInt(e.target.value)})}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => { setShowScheduleForm(false); resetScheduleForm(); }} className="flex-1 rounded-2xl border border-slate-200 py-3.5 text-sm font-bold text-slate-600">Batal</button>
                <button type="submit" disabled={loading} className="flex-1 rounded-2xl bg-indigo-600 text-white py-3.5 text-sm font-bold shadow-lg shadow-indigo-100 uppercase tracking-wider">
                  {loading ? 'Menyimpan...' : 'Simpan Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAdmin && showShiftForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-black text-slate-900 mb-6 tracking-tight">
              {editingShiftId ? 'Edit Plot Shift Staf' : 'Atur Plot Shift Staf'}
            </h2>
            <form onSubmit={handleCreateOrUpdateShift} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pilih Staf</label>
                <select required value={shiftForm.staff_id} onChange={e => setShiftForm({...shiftForm, staff_id: parseInt(e.target.value)})}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none">
                  <option value="0">-- Pilih Staf --</option>
                  {nonDoctorStaff.map(s => <option key={s.id} value={s.id}>{s.role.toUpperCase()}: {s.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tanggal Shift</label>
                <input type="date" required value={shiftForm.shift_date} onChange={e => setShiftForm({...shiftForm, shift_date: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tipe Shift</label>
                <div className="flex gap-2">
                  {['morning', 'afternoon', 'night'].map(type => (
                    <button key={type} type="button" onClick={() => setShiftForm({...shiftForm, shift_type: type as any})}
                      className={cn(
                        "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                        shiftForm.shift_type === type ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "bg-slate-50 text-slate-400 border border-slate-100"
                      )}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Jam Mulai</label>
                  <input type="time" required value={shiftForm.start_time} onChange={e => setShiftForm({...shiftForm, start_time: e.target.value})}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Jam Selesai</label>
                  <input type="time" required value={shiftForm.end_time} onChange={e => setShiftForm({...shiftForm, end_time: e.target.value})}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Catatan Tugas</label>
                <input type="text" value={shiftForm.notes} onChange={e => setShiftForm({...shiftForm, notes: e.target.value})}
                  placeholder="Misal: Penjaga Kasir Depan"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => { setShowShiftForm(false); resetShiftForm(); }} className="flex-1 rounded-2xl border border-slate-200 py-3.5 text-sm font-bold text-slate-600">Batal</button>
                <button type="submit" disabled={loading} className="flex-1 rounded-2xl bg-indigo-600 text-white py-3.5 text-sm font-bold shadow-lg shadow-indigo-100 uppercase tracking-wider">
                  {loading ? 'Menyimpan...' : 'Simpan Plot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
