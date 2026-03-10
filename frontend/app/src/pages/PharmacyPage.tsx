"use client";
import { pharmacyService, CreatePharmacyItemRequest } from '@/services/pharmacyService';
import { useApi } from '@/hooks/useApi';
import { Package, Search, AlertTriangle, RefreshCw, Loader2, AlertCircle, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/cn';

export function PharmacyPage() {
  const { data: items, loading, error, refetch } = useApi(() => pharmacyService.getItems(), []);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [form, setForm] = useState<CreatePharmacyItemRequest>({
    sku: '',
    name: '',
    description: '',
    category: '',
    unit: '',
    stock: 0,
    min_stock: 0,
    sell_price: 0,
    buy_price: 0,
    expiry_date: '',
  });

  const filtered = (items || []).filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (n: number) => 'Rp ' + (n || 0).toLocaleString('id-ID');

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setForm({
      sku: item.sku,
      name: item.name,
      description: item.description || '',
      category: item.category || '',
      unit: item.unit,
      stock: item.stock,
      min_stock: item.min_stock,
      sell_price: item.sell_price,
      buy_price: item.buy_price,
      expiry_date: item.expiry_date ? new Date(item.expiry_date).toISOString().split('T')[0] : '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus obat ini?')) return;
    try {
      await pharmacyService.deleteItem(id);
      refetch();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Gagal menghapus obat');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      if (editingId) {
        await pharmacyService.updateItem(editingId, form);
      } else {
        await pharmacyService.createItem(form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm({
        sku: '', name: '', description: '', category: '', unit: '', stock: 0, min_stock: 0, sell_price: 0, buy_price: 0, expiry_date: '',
      });
      refetch();
    } catch (err: any) {
      setSaveError(err?.response?.data?.error || 'Gagal menyimpan data obat');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <span className="ml-3 text-slate-500">Memuat stok obat...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stok Obat (Farmasi)</h1>
          <p className="text-sm text-slate-500 mt-1">{items?.length || 0} item terdaftar</p>
        </div>
        <div className="flex gap-2">
          <button onClick={refetch} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => { setEditingId(null); setShowForm(true); }} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition-all active:scale-95">
            <Plus size={16} /> Tambah Obat
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Cari obat atau SKU..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm" />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <Package size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">Belum ada stok obat terdaftar.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-5 py-3 text-left font-semibold text-slate-600">Nama Obat</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-600">SKU</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-600">Kategori</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-600">Satuan</th>
                  <th className="px-5 py-3 text-right font-semibold text-slate-600">Stok</th>
                  <th className="px-5 py-3 text-right font-semibold text-slate-600">Harga Jual</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-600">Exp Date</th>
                  <th className="px-5 py-3 text-center font-semibold text-slate-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(item => {
                  const isLow = item.stock <= item.min_stock;
                  return (
                    <tr key={item.id} className={cn("hover:bg-slate-50/50 transition-colors", isLow && "bg-red-50/50")}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          {isLow && <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />}
                          <span className="font-medium text-slate-800">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <code className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-600">{item.sku}</code>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">{item.category || '-'}</span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">{item.unit}</td>
                      <td className={cn("px-5 py-3.5 text-right font-bold", isLow ? "text-red-600" : "text-slate-800")}>
                        {item.stock}
                        {isLow && <p className="text-[10px] font-normal text-red-400">Min: {item.min_stock}</p>}
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium text-slate-800">{formatCurrency(item.sell_price)}</td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs">
                        {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEdit(item)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">{editingId ? 'Edit Data Obat' : 'Tambah Obat Baru'}</h2>
              <button onClick={() => setShowForm(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            {saveError && (
              <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-3 text-sm text-red-700">
                <AlertCircle size={18} className="flex-shrink-0" />
                {saveError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nama Obat</label>
                  <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">SKU (Kode Obat)</label>
                  <input required type="text" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Kategori</label>
                  <input type="text" value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Satuan (Unit)</label>
                  <input required type="text" placeholder="Tablet, Botol, Pcs" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Stok Awal / Berjalan</label>
                  <input required type="number" value={form.stock} onChange={e => setForm({...form, stock: parseInt(e.target.value) || 0})}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Harga Beli (Satuan)</label>
                  <input required type="number" value={form.buy_price} onChange={e => setForm({...form, buy_price: parseInt(e.target.value) || 0})}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Harga Jual (Satuan)</label>
                  <input required type="number" value={form.sell_price} onChange={e => setForm({...form, sell_price: parseInt(e.target.value) || 0})}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Minimum Stok (Alert)</label>
                  <input required type="number" value={form.min_stock} onChange={e => setForm({...form, min_stock: parseInt(e.target.value) || 0})}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Expiry Date</label>
                  <input type="date" value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none transition-all" />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100 mt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                  Batal
                </button>
                <button type="submit" disabled={saving} className="flex-[2] rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {saving ? 'Menyimpan...' : 'Simpan Data Obat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
