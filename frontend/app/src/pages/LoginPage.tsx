"use client";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

import { API_URL } from '@/config/api';

export function LoginPage() {
  const { login, register, error, loading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    username: '',
    password: '',
    email: '',
    full_name: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        await login({ username: form.username, password: form.password });
      } else {
        await register({
          username: form.username,
          password: form.password,
          email: form.email,
          full_name: form.full_name,
          phone: form.phone,
          role: 'pasien',
        });
      }
    } catch {
      // error already handled by context
    }
  };

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 mb-4 shadow-lg shadow-emerald-500/30">
            <i className="fi fi-rr-heart-rate text-3xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Klinik ERP</h1>
          <p className="text-sm text-slate-400 mt-1">Enterprise Resource Planning System</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 shadow-2xl">
          {/* Tabs */}
          <div className="flex rounded-lg bg-white/10 p-1 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/20 border border-red-500/30 px-4 py-3 mb-4">
              <i className="fi fi-rr-info text-base text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-300">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={e => updateField('full_name', e.target.value)}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  placeholder="Dr. John Doe"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={e => updateField('username', e.target.value)}
                className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                placeholder="username"
                required
              />
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => updateField('email', e.target.value)}
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    placeholder="email@klinik.id"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">No. Telepon</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={e => updateField('phone', e.target.value)}
                    className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    placeholder="081234567890"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => updateField('password', e.target.value)}
                  className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-2.5 pr-10 text-sm text-white placeholder-white/40 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                >
                  {showPassword ? <i className="fi fi-rr-eye-crossed text-base" /> : <i className="fi fi-rr-eye text-base" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/30"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : mode === 'login' ? (
                <><i className="fi fi-rr-sign-in-alt text-base" /> Masuk</>
              ) : (
                <><i className="fi fi-rr-user-add text-base" /> Daftar</>
              )}
            </button>
          </form>
        </div>

        {/* Demo Accounts
        {mode === 'login' && (
          <div className="mt-6 rounded-xl bg-white/5 border border-white/10 p-4 backdrop-blur-sm">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Demo Accounts (Pass: root210605)</p>
            <div className="flex flex-wrap gap-2">
              {['admin', 'dokter', 'perawat', 'apoteker', 'kasir', 'resepsionis'].map(u => (
                <button
                  key={u}
                  onClick={() => updateField('username', u)}
                  className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium text-white/70 hover:bg-white/20 hover:text-white transition-colors border border-white/5"
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        )} */}

        {/* API Info */}
        <div className="mt-4 text-center">
          <p className="text-[10px] text-white/20">
            Backend API: <code className="text-emerald-400/30">{API_URL}</code>
          </p>
        </div>
      </div>
    </div>
  );
}
