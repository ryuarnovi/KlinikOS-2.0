"use client";
import { billingService, CreateBillingRequest } from '@/services/billingService';
import { patientService } from '@/services/patientService';
import { medicalRecordService } from '@/services/medicalRecordService';
import { prescriptionService } from '@/services/prescriptionService';
import { useApi } from '@/hooks/useApi';
import { StatusBadge } from '@/components/StatusBadge';
import { Receipt, CreditCard, DollarSign, RefreshCw, Loader2, AlertCircle, Plus, X, Save, Trash2, Pill } from 'lucide-react';
import { useState, useEffect } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    snap: any;
  }
}

export function BillingPage() {
  const { data: bills, loading, error, refetch } = useApi(() => billingService.getAll(), []);
  const { data: patients } = useApi(() => patientService.getAll(), []);
  const { data: records } = useApi(() => medicalRecordService.getAll(), []);
  const { data: prescriptions } = useApi(() => prescriptionService.getAll(), []);
  
  const [paying, setPaying] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [qrisBill, setQrisBill] = useState<any>(null);

  const [form, setForm] = useState<CreateBillingRequest>({
    patient_id: 0,
    medical_record_id: undefined,
    invoice_number: 'INV-' + Date.now(),
    doctor_fee: 50000,
    medicine_cost: 0,
    admin_fee: 10000,
    discount: 0,
    tax: 0,
    total: 60000,
    payment_method: 'midtrans',
    paid_amount: 0,
    notes: '',
  });

  const formatCurrency = (n: number) => 'Rp ' + (n || 0).toLocaleString('id-ID');

  const totalRevenue = (bills || []).filter(b => b.status === 'paid').reduce((s, b) => s + b.total, 0);
  const totalPending = (bills || []).filter(b => b.status === 'unpaid').reduce((s, b) => s + b.total, 0);

  const payMethodLabel: Record<string, string> = {
    cash: '💵 Cash', debit: '💳 Debit', credit: '💳 Credit', midtrans: '📲 Online (Midtrans)', transfer: '🏦 Bank Transfer', qris: '📱 QRIS',
  };

  const calculateTotal = (f: CreateBillingRequest) => {
    const subtotal = (f.doctor_fee || 0) + (f.medicine_cost || 0) + (f.admin_fee || 0);
    const afterDiscount = subtotal - (f.discount || 0);
    const taxAmount = afterDiscount * ((f.tax || 0) / 100);
    return Math.max(0, afterDiscount + taxAmount);
  };

  const handleFormChange = (updates: Partial<CreateBillingRequest>) => {
    const newForm = { ...form, ...updates };
    newForm.total = calculateTotal(newForm);
    setForm(newForm);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      await billingService.create(form);
      setShowForm(false);
      refetch();
    } catch (err: any) {
      setSaveError(err?.response?.data?.error || 'Gagal membuat invoice');
    } finally {
      setSaving(false);
    }
  };

  const handlePayMidtrans = async (bill: any) => {
    setPaying(bill.id);
    try {
      const snapData = await billingService.createMidtransSnapToken({
        order_id: bill.payment_code || bill.invoice_number,
        gross_amount: bill.total,
        customer: {
          first_name: bill.patient_name || 'Customer',
          email: 'customer@example.com' // Should ideally come from patient data
        }
      });

      if (window.snap) {
        window.snap.pay(snapData.snap_token, {
          onSuccess: (result: any) => {
            console.log('success', result);
            refetch();
          },
          onPending: (result: any) => {
            console.log('pending', result);
          },
          onError: (result: any) => {
            console.log('error', result);
          },
          onClose: () => {
            console.log('customer closed the popup without finishing the payment');
          }
        });
      }
    } catch (err: any) {
      const detail = err?.response?.data?.detail || '';
      const hint = err?.response?.data?.hint || '';
      alert(`Gagal memproses pembayaran Midtrans.\n${detail}\n${hint ? '💡 ' + hint : ''}`);
    } finally {
      setPaying(null);
    }
  };

  const handlePayBank = async (bill: any) => {
    // Bank transfer - show virtual account info, then mark confirmed
    const confirmed = confirm(
      `Transfer ke:\nBank BCA\nNo. Rek: 1234567890\nA/N: Klinik ERP\nJumlah: ${formatCurrency(bill.total)}\n\nKlik OK jika sudah melakukan transfer.`
    );
    if (!confirmed) return;
    setPaying(bill.id);
    try {
      await billingService.processPayment(bill.id, {
        payment_method: 'transfer',
        paid_amount: bill.total,
        status: 'paid'
      });
      refetch();
    } catch {
      alert('Gagal memproses pembayaran');
    } finally {
      setPaying(null);
    }
  };

  const handlePayQris = (bill: any) => {
    setQrisBill(bill);
  };

  const confirmQrisPayment = async () => {
    if (!qrisBill) return;
    setPaying(qrisBill.id);
    try {
      await billingService.processPayment(qrisBill.id, {
        payment_method: 'qris',
        paid_amount: qrisBill.total,
        status: 'paid'
      });
      setQrisBill(null);
      refetch();
    } catch {
      alert('Gagal memproses pembayaran QRIS');
    } finally {
      setPaying(null);
    }
  };

  const handlePayCash = async (bill: any) => {
    if (!confirm('Konfirmasi pembayaran tunai?')) return;
    setPaying(bill.id);
    try {
      await billingService.processPayment(bill.id, {
        payment_method: 'cash',
        paid_amount: bill.total,
        status: 'paid'
      });
      refetch();
    } catch {
      alert('Gagal memproses pembayaran');
    } finally {
      setPaying(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <span className="ml-3 text-slate-500">Memuat billing...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Script 
        src="https://app.sandbox.midtrans.com/snap/snap.js" 
        data-client-key="Mid-client-pbCPASR6TO34wNDN"
      />
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Billing & Transaksi</h1>
          <p className="text-sm text-slate-500 mt-1">{bills?.length || 0} invoice terdaftar</p>
        </div>
        <div className="flex gap-2">
          <button onClick={refetch} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => { setForm({...form, invoice_number: 'INV-'+Date.now()}); setShowForm(true); }} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition-all active:scale-95">
            <Plus size={16} /> Buat Invoice Baru
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Lunas</p>
          <p className="text-2xl font-black text-emerald-600 tracking-tight">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Belum Dibayar</p>
          <p className="text-2xl font-black text-red-600 tracking-tight">{formatCurrency(totalPending)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Invoice</p>
          <p className="text-2xl font-black text-blue-600 tracking-tight">{bills?.length || 0}</p>
        </div>
      </div>

      {(!bills || bills.length === 0) ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <Receipt size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">Belum ada transaksi billing.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-5 py-3 text-left font-semibold text-slate-600">Invoice</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-600">Pasien</th>
                  <th className="px-5 py-3 text-right font-semibold text-slate-600">Total</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-600">Metode</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-600">Status</th>
                  <th className="px-5 py-3 text-center font-semibold text-slate-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bills.map(bill => (
                  <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <code className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-600">{bill.invoice_number}</code>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-800">{bill.patient_name}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">{new Date(bill.created_at).toLocaleDateString('id-ID')}</p>
                    </td>
                    <td className="px-5 py-3.5 text-right font-black text-slate-900">{formatCurrency(bill.total)}</td>
                    <td className="px-5 py-3.5 text-slate-600 text-xs font-medium">{payMethodLabel[bill.payment_method] || bill.payment_method}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={bill.status} /></td>
                    <td className="px-5 py-3.5">
                      {bill.status === 'unpaid' && (() => {
                        const pm = bill.payment_method;
                        const isLoading = paying === bill.id;
                        if (pm === 'cash') return (
                          <button onClick={() => handlePayCash(bill)} disabled={isLoading}
                            className="mx-auto flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 shadow-sm transition-all active:scale-95">
                            {isLoading ? <Loader2 size={12} className="animate-spin" /> : <DollarSign size={12} />}
                            Bayar Tunai
                          </button>
                        );
                        if (pm === 'transfer') return (
                          <button onClick={() => handlePayBank(bill)} disabled={isLoading}
                            className="mx-auto flex items-center gap-1.5 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-700 disabled:opacity-50 shadow-sm transition-all active:scale-95">
                            {isLoading ? <Loader2 size={12} className="animate-spin" /> : <i className="fi fi-rr-bank text-xs" />}
                            Transfer Bank
                          </button>
                        );
                        if (pm === 'qris') return (
                          <button onClick={() => handlePayQris(bill)} disabled={isLoading}
                            className="mx-auto flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-700 disabled:opacity-50 shadow-sm transition-all active:scale-95">
                            {isLoading ? <Loader2 size={12} className="animate-spin" /> : <i className="fi fi-rr-qrcode text-xs" />}
                            Bayar QRIS
                          </button>
                        );
                        // midtrans or default - full options
                        return (
                          <div className="flex justify-center gap-1.5 flex-wrap">
                            <button onClick={() => handlePayMidtrans(bill)} disabled={isLoading}
                              className="flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 shadow-sm transition-all active:scale-95">
                              {isLoading ? <Loader2 size={11} className="animate-spin" /> : <CreditCard size={11} />}
                              Online
                            </button>
                            <button onClick={() => handlePayCash(bill)} disabled={isLoading}
                              className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 shadow-sm transition-all active:scale-95">
                              {isLoading ? <Loader2 size={11} className="animate-spin" /> : <DollarSign size={11} />}
                              Tunai
                            </button>
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Buat Invoice Baru</h2>
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
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Pilih Pasien</label>
                  <select required value={form.patient_id} onChange={e => handleFormChange({ patient_id: parseInt(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-emerald-500 focus:bg-white transition-all appearance-none">
                    <option value="0">-- Pilih Pasien --</option>
                    {patients?.map(p => (
                      <option key={p.id} value={p.id}>{p.full_name} ({p.nik})</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Pilih Resep (Opsional)</label>
                  <select 
                    onChange={e => {
                      const rxId = parseInt(e.target.value);
                      const rx = prescriptions?.find(r => r.id === rxId);
                      if (rx) {
                        handleFormChange({ 
                          patient_id: rx.patient_id, 
                          medicine_cost: (rx.items || []).length * 15000, // Mock calculation
                          notes: `Invoice untuk Resep ${rx.prescription_code}`
                        });
                      }
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-blue-50/50 px-4 py-2.5 text-sm focus:border-blue-500 focus:bg-white transition-all appearance-none"
                  >
                    <option value="0">-- Pilih Resep Pasien --</option>
                    {prescriptions?.filter(r => r.status !== 'dispensed').map(r => (
                      <option key={r.id} value={r.id}>{r.prescription_code} - {r.patient_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">No. Invoice</label>
                  <input type="text" readOnly value={form.invoice_number} className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Metode Pembayaran</label>
                  <select value={form.payment_method} onChange={e => handleFormChange({ payment_method: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-emerald-500 focus:bg-white transition-all appearance-none cursor-pointer">
                    <option value="midtrans">Midtrans (Online)</option>
                    <option value="qris">QRIS (Scan)</option>
                    <option value="transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Jasa Dokter</label>
                  <input type="number" value={form.doctor_fee} onChange={e => handleFormChange({ doctor_fee: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-emerald-500 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Biaya Obat</label>
                  <input type="number" value={form.medicine_cost} onChange={e => handleFormChange({ medicine_cost: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-emerald-500 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Biaya Admin</label>
                  <input type="number" value={form.admin_fee} onChange={e => handleFormChange({ admin_fee: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-emerald-500 focus:bg-white transition-all" />
                </div>
                <div className="col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-600">Total Tagihan:</span>
                  <span className="text-xl font-black text-slate-900">{formatCurrency(form.total)}</span>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100 mt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                  Batal
                </button>
                <button type="submit" disabled={saving || !form.patient_id} className="flex-[2] rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {saving ? 'Menyimpan...' : 'Simpan & Kirim Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}\n
      {/* QRIS Modal */}
      {qrisBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="text-center mb-6">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 mb-4">
                <i className="fi fi-rr-qrcode text-purple-600 text-3xl" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Pembayaran QRIS</h2>
              <p className="text-sm text-slate-500 mt-1">{qrisBill.patient_name}</p>
            </div>

            {/* QRIS Code Display */}
            <div className="flex flex-col items-center mb-6">
              <div className="bg-white p-4 rounded-2xl border-4 border-purple-600 shadow-lg shadow-purple-500/20 mb-4">
                {/* QR Code using Google Charts API - generates real scannable QR */}
                <img
                  src={`https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(`KLINIKOS-QRIS-${qrisBill.invoice_number}-${qrisBill.total}`)}&choe=UTF-8`}
                  alt="QRIS Code"
                  className="w-48 h-48"
                />
              </div>
              <p className="text-xs text-slate-400 text-center mb-2">Scan QR Code di atas menggunakan aplikasi mobile banking atau e-wallet Anda</p>
              <div className="w-full rounded-xl bg-purple-50 border border-purple-200 p-4 text-center">
                <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">Total Pembayaran</p>
                <p className="text-2xl font-black text-purple-700">{formatCurrency(qrisBill.total)}</p>
                <p className="text-[10px] text-slate-400 mt-1">Invoice: {qrisBill.invoice_number}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setQrisBill(null)}
                className="flex-1 rounded-2xl border border-slate-200 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
              >
                Batal
              </button>
              <button
                onClick={confirmQrisPayment}
                disabled={paying === qrisBill.id}
                className="flex-[2] rounded-2xl bg-gradient-to-r from-purple-600 to-violet-700 py-3.5 text-sm font-bold text-white hover:from-purple-700 hover:to-violet-800 disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-purple-500/25 transition-all active:scale-95"
              >
                {paying === qrisBill.id ? <Loader2 size={18} className="animate-spin" /> : <i className="fi fi-rr-check text-base" />}
                {paying === qrisBill.id ? 'Memproses...' : 'Konfirmasi Pembayaran Diterima'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
