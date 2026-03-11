"use client";
import { logService } from '@/services/logService';
import { useApi } from '@/hooks/useApi';
import { useState } from 'react';

export function ActivityLogsPage() {
  const { data: logs, loading, error, refetch } = useApi(() => logService.getAll(), []);
  const [search, setSearch] = useState('');

  const filtered = (logs || []).filter(l => 
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.entity.toLowerCase().includes(search.toLowerCase()) ||
    (l.user_name || '').toLowerCase().includes(search.toLowerCase()) ||
    l.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus log ini?')) return;
    try {
      await logService.delete(id);
      refetch();
    } catch (err) {
      alert('Gagal menghapus log');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <i className="fi fi-rr-spinner text-3xl animate-spin text-emerald-500" />
        <span className="ml-3 text-slate-500">Memuat log aktivitas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Activity Logs</h1>
          <p className="text-sm text-slate-500 mt-1">Audit trail seluruh aktivitas sistem (Immutable by default)</p>
        </div>
        <button onClick={refetch} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
          <i className="fi fi-rr-refresh text-xs" /> Refresh
        </button>
      </div>

      <div className="relative max-w-md">
        <i className="fi fi-rr-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari aksi, modul, atau user..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Timestamp</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">User</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Action</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Module</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Description</th>
                <th className="px-5 py-3 text-center font-semibold text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400 italic">Tidak ada log aktivitas ditemukan</td>
                </tr>
              ) : filtered.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 font-mono text-xs">
                    {new Date(log.created_at).toLocaleString('id-ID')}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                       <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                         {log.user_name?.charAt(0) || '?'}
                       </div>
                       <span className="font-medium text-slate-700">{log.user_name || 'System'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      log.action === 'CREATE' ? 'bg-emerald-50 text-emerald-600' :
                      log.action === 'UPDATE' ? 'bg-blue-50 text-blue-600' :
                      log.action === 'DELETE' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-tight">{log.entity}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate" title={log.description}>
                    {log.description}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button onClick={() => handleDelete(log.id)} className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <i className="fi fi-rr-trash text-sm" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
