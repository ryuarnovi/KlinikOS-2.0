"use client";
import { billingService, CreateBillingRequest } from '@/services/billingService';
import { patientService } from '@/services/patientService';
import { medicalRecordService } from '@/services/medicalRecordService';
import { prescriptionService } from '@/services/prescriptionService';
import { useApi } from '@/hooks/useApi';
import { StatusBadge } from '@/components/StatusBadge';
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
  const [bankBill, setBankBill] = useState<any>(null);
  const [cryptoBill, setCryptoBill] = useState<any>(null);

  // Untuk menyimpan bukti
  const [proofFile, setProofFile] = useState<File | null>(null);

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

  const totalRevenue = (bills || []).reduce((s, b) => s + (b.paid_amount || 0), 0);
  const totalPending = (bills || []).reduce((s, b) => s + (b.total - (b.paid_amount || 0)), 0);

  const payMethodLabel: Record<string, string> = {
    cash: '💵 Cash', debit: '💳 Debit', credit: '💳 Credit', midtrans: '📲 Online (Midtrans)', transfer: '🏦 Bank Transfer', qris: '📱 QRIS', crypto: '🪙 Crypto (SOL/ETH)'
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
          email: 'customer@example.com'
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

  const handlePayBank = (bill: any) => {
    setProofFile(null);
    setBankBill(bill);
  };

  const confirmBankPayment = async () => {
    if (!bankBill) return;
    setPaying(bankBill.id);
    try {
      await billingService.processPayment(bankBill.id, {
        payment_method: 'transfer',
        paid_amount: bankBill.total,
        status: 'paid'
      });
      setBankBill(null);
      setProofFile(null);
      alert('Pembayaran Bank Transfer berhasil direkam!');
      refetch();
    } catch {
      alert('Gagal memproses pembayaran Bank Transfer');
    } finally {
      setPaying(null);
    }
  };

  const handlePayCrypto = (bill: any) => {
    setCryptoBill(bill);
  };

  const confirmCryptoPayment = async () => {
    if (!cryptoBill) return;
    setPaying(cryptoBill.id);
    try {
      const isEth = typeof (window as any).ethereum !== 'undefined';
      const isSol = typeof (window as any).solana !== 'undefined' && (window as any).solana.isPhantom;

      if (isEth) {
         try {
           const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
           // Estimasi 1 ETH = 40.000.000 IDR
           const mockEthValue = Math.floor((cryptoBill.total / 40000000) * 1e18);
           const txHash = await (window as any).ethereum.request({
             method: 'eth_sendTransaction',
             params: [{
               from: accounts[0],
               to: accounts[0], // Mock: kirim ke diri sendiri
               value: '0x' + mockEthValue.toString(16),
             }]
           });
           alert('Transaksi Ethereum berhasil! TxHash: ' + txHash);
         } catch(e: any) {
           throw new Error("Transaksi Ethereum Dibatalkan: " + e.message);
         }
      } else if (isSol) {
         try {
           await (window as any).solana.connect();
           alert('Phantom terdeteksi, memproses simulasi transaksi Solana...');
           await new Promise(r => setTimeout(r, 1500));
         } catch(e: any) {
           throw new Error("Transaksi Solana Dibatalkan: " + e.message);
         }
      } else {
         alert('Wallet Blockchain (Metamask/Phantom) tidak terdeteksi. Melakukan simulasi pembayaran crypto otomatis.');
         await new Promise(r => setTimeout(r, 1000));
      }

      await billingService.processPayment(cryptoBill.id, {
        payment_method: 'crypto',
        paid_amount: cryptoBill.total,
        status: 'paid'
      });
      setCryptoBill(null);
      refetch();
    } catch (err: any) {
      alert('Gagal memproses: ' + err.message);
    } finally {
      setPaying(null);
    }
  };

  const handlePayQris = (bill: any) => {
    setProofFile(null);
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
      setProofFile(null);
      alert('Pembayaran QRIS berhasil direkam!');
      refetch();
    } catch {
      alert('Gagal memproses pembayaran QRIS');
    } finally {
      setPaying(null);
    }
  };

  const handlePayCash = async (bill: any) => {
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

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus/Batalkan invoice ini?')) return;
    try {
      await billingService.delete(id);
      refetch();
    } catch (err) {
      alert('Gagal menghapus invoice');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <i className="fi fi-rr-spinner animate-spin text-3xl text-emerald-500" />
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
          <button onClick={refetch} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 shadow-sm">
            <i className="fi fi-rr-refresh text-xs" /> Refresh
          </button>
          <button onClick={() => { setForm({...form, invoice_number: 'INV-'+Date.now()}); setShowForm(true); }} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition-all active:scale-95">
            <i className="fi fi-rr-plus text-xs" /> Buat Invoice Baru
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
          <i className="fi fi-rr-receipt text-5xl mx-auto text-slate-300 mb-3" />
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
                            {isLoading ? <i className="fi fi-rr-spinner animate-spin" /> : <i className="fi fi-rr-money-bill-wave text-xs" />}
                            Bayar Tunai
                          </button>
                        );
                        if (pm === 'transfer') return (
                          <button onClick={() => handlePayBank(bill)} disabled={isLoading}
                            className="mx-auto flex items-center gap-1.5 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-700 disabled:opacity-50 shadow-sm transition-all active:scale-95">
                            {isLoading ? <i className="fi fi-rr-spinner animate-spin" /> : <i className="fi fi-rr-bank text-xs" />}
                            Transfer Bank
                          </button>
                        );
                        if (pm === 'qris') return (
                          <button onClick={() => handlePayQris(bill)} disabled={isLoading}
                            className="mx-auto flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-700 disabled:opacity-50 shadow-sm transition-all active:scale-95">
                            {isLoading ? <i className="fi fi-rr-spinner animate-spin" /> : <i className="fi fi-rr-qrcode text-xs" />}
                            Bayar QRIS
                          </button>
                        );
                        if (pm === 'crypto') return (
                          <button onClick={() => handlePayCrypto(bill)} disabled={isLoading}
                            className="mx-auto flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 shadow-sm transition-all active:scale-95">
                            {isLoading ? <i className="fi fi-rr-spinner animate-spin" /> : <i className="fi fi-brands-ethereum text-xs" />}
                            Bayar Crypto
                          </button>
                        );
                        // midtrans or default - full options
                        return (
                          <div className="flex justify-center gap-1.5 flex-wrap">
                            <button onClick={() => handlePayMidtrans(bill)} disabled={isLoading}
                              className="flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 shadow-sm transition-all active:scale-95">
                              {isLoading ? <i className="fi fi-rr-spinner animate-spin" /> : <i className="fi fi-rr-credit-card text-[11px]" />}
                              Online
                            </button>
                            <button onClick={() => handlePayCash(bill)} disabled={isLoading}
                              className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 shadow-sm transition-all active:scale-95">
                              {isLoading ? <i className="fi fi-rr-spinner animate-spin" /> : <i className="fi fi-rr-money-bill-wave text-[11px]" />}
                              Tunai
                            </button>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                       <button onClick={() => handleDelete(bill.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus/Batalkan">
                         <i className="fi fi-rr-trash text-sm" />
                       </button>
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
                <i className="fi fi-rr-cross text-lg" />
              </button>
            </div>

            {saveError && (
              <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-3 text-sm text-red-700">
                <i className="fi fi-rr-info text-lg flex-shrink-0" />
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
                          medicine_cost: (rx.items || []).length * 15000,
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
                    <option value="crypto">Crypto (SOL/ETH)</option>
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
                  {saving ? <i className="fi fi-rr-spinner animate-spin text-lg" /> : <i className="fi fi-rr-disk text-lg" />}
                  {saving ? 'Menyimpan...' : 'Simpan & Kirim Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QRIS Modal */}
      {qrisBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm shadow-2xl">
          <div className="w-full max-w-sm rounded-3xl bg-white p-8 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 mb-4">
                <i className="fi fi-rr-qrcode text-purple-600 text-3xl" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Pembayaran QRIS</h2>
              <p className="text-sm text-slate-500 mt-1">{qrisBill.patient_name}</p>
            </div>

            <div className="flex flex-col items-center mb-4">
              <div className="bg-white p-4 rounded-2xl border-4 border-purple-600 shadow-lg shadow-purple-500/20 mb-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`KLINIKOS-QRIS-${qrisBill.invoice_number}-${qrisBill.total}`)}`}
                  alt="QRIS Code"
                  className="w-48 h-48"
                />
              </div>
              <p className="text-xs text-slate-400 text-center mb-2">Scan QR Code di atas menggunakan aplikasi mobile banking/E-Wallet</p>
              <div className="w-full rounded-xl bg-purple-50 border border-purple-200 p-4 text-center">
                <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">Total Pembayaran</p>
                <p className="text-2xl font-black text-purple-700">{formatCurrency(qrisBill.total)}</p>
                <p className="text-[10px] text-slate-400 mt-1">Invoice: {qrisBill.invoice_number}</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Upload Bukti Transfer</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={e => setProofFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 transition-colors"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setQrisBill(null)}
                className="flex-1 rounded-2xl border border-slate-200 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
              >
                Batal
              </button>
              <button
                onClick={confirmQrisPayment}
                disabled={paying === qrisBill.id || !proofFile}
                className="flex-[2] rounded-2xl bg-gradient-to-r from-purple-600 to-violet-700 py-3 text-xs font-bold text-white hover:from-purple-700 hover:to-violet-800 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition-all active:scale-95"
              >
                {paying === qrisBill.id ? <i className="fi fi-rr-spinner animate-spin" /> : <i className="fi fi-rr-check" />}
                {paying === qrisBill.id ? 'Memproses...' : 'Sudah Bayar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bank Transfer Modal */}
      {bankBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm shadow-2xl">
          <div className="w-full max-w-sm rounded-3xl bg-white p-8 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 mb-4">
                <i className="fi fi-rr-bank text-orange-600 text-3xl" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Transfer Bank</h2>
              <p className="text-sm text-slate-500 mt-1">{bankBill.patient_name}</p>
            </div>

            <div className="w-full rounded-xl bg-slate-50 border border-slate-200 p-4 mb-4">
              <p className="text-xs text-slate-500 mb-1">Transfer ke Rekening:</p>
              <p className="font-bold text-slate-800">Bank BCA <span className="text-orange-600 ml-2">1234567890</span></p>
              <p className="text-xs font-semibold text-slate-600 mt-1">A/N Klinik ERP</p>
              
              <div className="mt-4 pt-4 border-t border-slate-200 text-center">
                <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-1">Total Pembayaran</p>
                <p className="text-2xl font-black text-orange-600">{formatCurrency(bankBill.total)}</p>
                <p className="text-[10px] text-slate-400 mt-1">Invoice: {bankBill.invoice_number}</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Upload Bukti Transfer</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={e => setProofFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 transition-colors"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setBankBill(null)}
                className="flex-1 rounded-2xl border border-slate-200 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
              >
                Batal
              </button>
              <button
                onClick={confirmBankPayment}
                disabled={paying === bankBill.id || !proofFile}
                className="flex-[2] rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-xs font-bold text-white hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all active:scale-95"
              >
                {paying === bankBill.id ? <i className="fi fi-rr-spinner animate-spin" /> : <i className="fi fi-rr-check" />}
                {paying === bankBill.id ? 'Memproses...' : 'Sudah Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Crypto Modal */}
      {cryptoBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm shadow-2xl">
          <div className="w-full max-w-sm rounded-3xl bg-white p-8 animate-in fade-in zoom-in duration-200">
            <div className="text-center mb-6">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 mb-4">
                <i className="fi fi-brands-ethereum text-indigo-600 text-3xl" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Crypto Payment</h2>
              <p className="text-sm text-slate-500 mt-1">{cryptoBill.patient_name}</p>
            </div>

            <div className="flex flex-col items-center mb-6">
              <div className="bg-white p-4 rounded-2xl border-4 border-indigo-600 shadow-lg shadow-indigo-500/20 mb-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`solana:solana_address_of_klinikos?amount=0.5&label=KlinikOS&message=${cryptoBill.invoice_number}`)}`}
                  alt="Crypto QR Code"
                  className="w-48 h-48"
                />
              </div>
              <p className="text-xs text-slate-400 text-center mb-4">Pastikan Anda memiliki ektensi Metamask / Phantom Wallet terinstall, atau scan QR</p>
              <div className="w-full rounded-xl bg-indigo-50 border border-indigo-200 p-4 text-center">
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Total Estimasi</p>
                <p className="text-2xl font-black text-indigo-700">~0.0015 ETH</p>
                <p className="text-xs font-semibold text-slate-500 mt-1">(= {formatCurrency(cryptoBill.total)})</p>
                <p className="text-[10px] text-slate-400 mt-1">Invoice: {cryptoBill.invoice_number}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCryptoBill(null)}
                className="flex-1 rounded-2xl border border-slate-200 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
              >
                Batal
              </button>
              <button
                onClick={confirmCryptoPayment}
                disabled={paying === cryptoBill.id}
                className="flex-[2] rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 py-3.5 text-sm font-bold text-white hover:from-indigo-600 hover:to-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/25 transition-all active:scale-95"
              >
                {paying === cryptoBill.id ? <i className="fi fi-rr-spinner animate-spin" /> : <i className="fi fi-brands-ethereum" />}
                {paying === cryptoBill.id ? 'Memproses...' : 'Connect & Pay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
