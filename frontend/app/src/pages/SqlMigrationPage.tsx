"use client";
import { useState } from 'react';
import { CodeBlock } from '@/components/CodeBlock';
import { migrationUp, migrationDown } from '@/data/sqlMigrations';
import { Database, ArrowUp, ArrowDown, Table2 } from 'lucide-react';

const tables = [
  { name: 'roles', desc: 'RBAC roles (Admin, Pasien, Dokter, Perawat, Apoteker, Kasir)', color: 'bg-red-100 text-red-700' },
  { name: 'users', desc: 'Akun login dengan password hash dan relasi ke role', color: 'bg-blue-100 text-blue-700' },
  { name: 'patients', desc: 'Data pasien (1:1 ke users, nullable untuk walk-in)', color: 'bg-cyan-100 text-cyan-700' },
  { name: 'staff_profiles', desc: 'NIP, spesialisasi dokter, no. lisensi', color: 'bg-indigo-100 text-indigo-700' },
  { name: 'appointments', desc: 'Jadwal temu Pasien ↔ Dokter', color: 'bg-green-100 text-green-700' },
  { name: 'medical_records', desc: 'Rekam medis SOAP + vital signs (JSONB)', color: 'bg-emerald-100 text-emerald-700' },
  { name: 'pharmacy_items', desc: 'Stok obat, satuan, harga beli/jual', color: 'bg-purple-100 text-purple-700' },
  { name: 'prescriptions', desc: 'Resep yang dibuat Dokter', color: 'bg-violet-100 text-violet-700' },
  { name: 'prescription_items', desc: 'Detail obat per resep', color: 'bg-fuchsia-100 text-fuchsia-700' },
  { name: 'billing_transactions', desc: 'Invoice (jasa dokter + biaya obat)', color: 'bg-orange-100 text-orange-700' },
  { name: 'stock_ledger', desc: 'Audit trail masuk/keluar stok obat', color: 'bg-amber-100 text-amber-700' },
];

export function SqlMigrationPage() {
  const [tab, setTab] = useState<'up' | 'down' | 'erd'>('up');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">SQL Migration Files</h1>
        <p className="text-sm text-slate-500 mt-1">
          File migrasi PostgreSQL menggunakan <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">golang-migrate/migrate/v4</code>
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-0">
        {[
          { id: 'up' as const, label: '000001_init.up.sql', icon: <ArrowUp size={14} /> },
          { id: 'down' as const, label: '000001_init.down.sql', icon: <ArrowDown size={14} /> },
          { id: 'erd' as const, label: 'Skema & Relasi', icon: <Table2 size={14} /> },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'border-b-2 border-emerald-500 text-emerald-700 bg-emerald-50/50'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'up' && (
        <CodeBlock code={migrationUp} language="SQL" title="db/migrations/000001_init.up.sql" maxHeight="600px" />
      )}

      {tab === 'down' && (
        <CodeBlock code={migrationDown} language="SQL" title="db/migrations/000001_init.down.sql" maxHeight="400px" />
      )}

      {tab === 'erd' && (
        <div className="space-y-6">
          {/* Table List */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Database size={16} />
              Daftar Tabel ({tables.length} tabel)
            </h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {tables.map(t => (
                <div key={t.name} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                  <span className={`rounded px-2 py-0.5 text-xs font-bold font-mono ${t.color}`}>{t.name}</span>
                  <span className="text-xs text-slate-500">{t.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Relations */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-700">🔗 Relasi Antar Tabel</h3>
            <div className="space-y-3 text-sm">
              {[
                { from: 'users', to: 'roles', type: 'N:1', desc: 'Setiap user memiliki satu role' },
                { from: 'patients', to: 'users', type: '1:1', desc: 'Pasien terdaftar terhubung ke akun user (nullable untuk walk-in)' },
                { from: 'staff_profiles', to: 'users', type: '1:1', desc: 'Profil staff (dokter/perawat/apoteker) terhubung ke user' },
                { from: 'appointments', to: 'patients + users', type: 'N:1', desc: 'Appointment menghubungkan pasien dengan dokter' },
                { from: 'medical_records', to: 'patients + users', type: 'N:1', desc: 'Rekam medis mencatat doctor_id dan patient_id' },
                { from: 'prescriptions', to: 'medical_records', type: 'N:1', desc: 'Resep dibuat berdasarkan rekam medis' },
                { from: 'prescription_items', to: 'prescriptions + pharmacy_items', type: 'N:1', desc: 'Detail obat per resep' },
                { from: 'billing_transactions', to: 'medical_records + patients', type: 'N:1', desc: 'Invoice untuk setiap kunjungan' },
                { from: 'stock_ledger', to: 'pharmacy_items', type: 'N:1', desc: 'Audit trail keluar masuk stok' },
              ].map((rel, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                  <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-bold font-mono text-slate-700 flex-shrink-0">{rel.type}</span>
                  <div>
                    <span className="font-mono text-xs text-emerald-700">{rel.from}</span>
                    <span className="mx-1 text-slate-400">→</span>
                    <span className="font-mono text-xs text-blue-700">{rel.to}</span>
                    <p className="text-xs text-slate-500 mt-0.5">{rel.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Access Matrix */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm overflow-x-auto">
            <h3 className="mb-4 text-sm font-semibold text-slate-700">🔐 Role-Based Data Access Matrix</h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-2 px-3 text-left font-semibold text-slate-600">Tabel</th>
                  <th className="py-2 px-3 text-center font-semibold text-red-600">Admin</th>
                  <th className="py-2 px-3 text-center font-semibold text-blue-600">Dokter</th>
                  <th className="py-2 px-3 text-center font-semibold text-green-600">Perawat</th>
                  <th className="py-2 px-3 text-center font-semibold text-purple-600">Apoteker</th>
                  <th className="py-2 px-3 text-center font-semibold text-orange-600">Kasir</th>
                  <th className="py-2 px-3 text-center font-semibold text-teal-600">Pasien</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  ['users', 'CRUD', 'R', 'R', '-', '-', 'R (self)'],
                  ['patients', 'CRUD', 'R', 'R', '-', 'R', 'R (self)'],
                  ['appointments', 'CRUD', 'RU', 'RU', '-', '-', 'CR (self)'],
                  ['medical_records', 'R', 'CRUD', 'RU', '-', '-', 'R (self)'],
                  ['prescriptions', 'R', 'CR', '-', 'RU', '-', '-'],
                  ['pharmacy_items', 'CRUD', '-', '-', 'CRUD', '-', '-'],
                  ['billing_transactions', 'CRUD', '-', '-', '-', 'CRUD', 'R (self)'],
                  ['stock_ledger', 'R', '-', '-', 'CR', '-', '-'],
                ].map(([table, ...perms]) => (
                  <tr key={table} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-semibold text-slate-700">{table}</td>
                    {perms.map((p, i) => (
                      <td key={i} className="py-2 px-3 text-center">
                        <span className={`rounded px-1.5 py-0.5 font-mono ${p === '-' ? 'text-slate-300' : 'bg-emerald-100 text-emerald-700 font-semibold'}`}>
                          {p}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
