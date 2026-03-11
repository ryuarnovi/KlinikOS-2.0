"use client";
import { useState, useEffect } from 'react';
import type { Role } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { LoginPage } from '@/pages/LoginPage';
import { Sidebar, MobileMenuButton } from '@/components/Sidebar';
import { DashboardPage } from '@/pages/DashboardPage';
import { UsersPage } from '@/pages/UsersPage';
import { PatientsPage } from '@/pages/PatientsPage';
import { StaffPage } from '@/pages/StaffPage';
import { AppointmentsPage } from '@/pages/AppointmentsPage';
import { MedicalRecordsPage } from '@/pages/MedicalRecordsPage';
import { PharmacyPage } from '@/pages/PharmacyPage';
import { PrescriptionsPage } from '@/pages/PrescriptionsPage';
import { BillingPage } from '@/pages/BillingPage';

import { ReferralsPage } from '@/pages/ReferralsPage';
import { ActivityLogsPage } from '@/pages/ActivityLogsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { Toaster } from 'react-hot-toast';
import { patientService } from '@/services/patientService';
import { pharmacyService } from '@/services/pharmacyService';
import { queueService } from '@/services/queueService';
import { useApi } from '@/hooks/useApi';


function AuthenticatedApp() {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const userRole = (user?.role?.toLowerCase() as Role) || 'pasien';

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage role={userRole} />;
      case 'users': return <UsersPage />;
      case 'patients': return <PatientsPage />;
      case 'staff': return <StaffPage />;
      case 'appointments': return <AppointmentsPage />;
      case 'medical-records': return <MedicalRecordsPage />;
      case 'pharmacy': return <PharmacyPage />;
      case 'prescriptions': return <PrescriptionsPage />;
      case 'billing': return <BillingPage />;
      case 'referrals': return <ReferralsPage />;
      case 'activity-logs': return <ActivityLogsPage />;
      case 'profile': return <ProfilePage />;

      default: return <DashboardPage role={userRole} />;
    }
  };

  const roleColorBar: Record<Role, string> = {
    admin: 'bg-red-500',
    dokter: 'bg-blue-500',
    perawat: 'bg-green-500',
    apoteker: 'bg-purple-500',
    kasir: 'bg-orange-500',
    pasien: 'bg-teal-500',
    resepsionis: 'bg-cyan-500',
  };

  const { data: patients } = useApi(() => patientService.getAll(), []);
  const { data: pharmacyItems } = useApi(() => pharmacyService.getItems(), []);
  const { data: queues } = useApi(() => queueService.getAll(), []);

  const lowStockItems = pharmacyItems?.filter(item => item.stock < 20) || [];
  const waitingQueues = queues?.filter(q => q.status === 'waiting') || [];
  
  const notifications = [
    ...waitingQueues.map(q => ({
      id: `q-${q.id}`,
      title: 'Antrean Aktif',
      message: `Pasien ${q.patient_name} sedang menunggu di antrean ${q.queue_number}.`,
      icon: 'fi-rr-calendar',
      bgIcon: 'bg-blue-100 text-blue-600',
      bgCard: 'bg-blue-50/30 hover:bg-blue-50/50',
      path: 'appointments'
    })),
    ...lowStockItems.map(i => ({
      id: `m-${i.id}`,
      title: 'Stok Menipis',
      message: `Otorisasi restock: Stok ${i.name} tersisa ${i.stock} ${i.unit}.`,
      icon: 'fi-rr-medicine',
      bgIcon: 'bg-amber-100 text-amber-600',
      bgCard: 'bg-amber-50/30 hover:bg-amber-50/50',
      path: 'pharmacy'
    }))
  ];

  const notificationCount = notifications.length;

  const searchResults = [
    ...(patients || []).filter(p => p.full_name?.toLowerCase().includes(searchQuery.toLowerCase())).map(p => ({
      id: `p-${p.id}`, type: 'Pasien', title: p.full_name, subtitle: `NIK: ${p.nik}`, icon: 'fi-rr-user text-emerald-500', path: 'patients'
    })),
    ...(pharmacyItems || []).filter(i => i.name?.toLowerCase().includes(searchQuery.toLowerCase())).map(i => ({
      id: `m-${i.id}`, type: 'Obat', title: i.name, subtitle: `Stok: ${i.stock}`, icon: 'fi-rr-medicine text-blue-500', path: 'pharmacy'
    }))
  ].slice(0, 5); // Limit to top 5 results

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        userRole={userRole}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <MobileMenuButton onClick={() => setMobileMenuOpen(true)} />
            <div className="hidden sm:flex items-center gap-2">
              <div className="relative">
                <i className="fi fi-rr-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchDropdown(e.target.value.length > 0);
                  }}
                  onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                  onFocus={() => { if (searchQuery.length > 0) setShowSearchDropdown(true); }}
                  placeholder="Cari menu, pasien, obat..."
                  className="w-64 rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                />
                
                {/* Search Dropdown */}
                {showSearchDropdown && searchQuery.length > 0 && (
                  <div className="absolute top-full left-0 mt-2 w-full rounded-xl border border-slate-100 bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 mb-1">
                      {searchResults.length > 0 ? 'Hasil Pencarian' : 'Tidak ditemukan'}
                    </div>
                    <div className="space-y-1">
                      {searchResults.map(res => (
                        <button key={res.id} onMouseDown={() => { setCurrentPage(res.path); setShowSearchDropdown(false); setSearchQuery(''); }} className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50 transition-colors">
                          <i className={`fi ${res.icon}`} />
                          <div>
                            <p className="text-sm font-bold text-slate-700">{res.title}</p>
                            <p className="text-[10px] text-slate-400">{res.type} • {res.subtitle}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative z-50">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative rounded-xl p-2.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <i className="fi fi-rr-bell text-xl pointer-events-none" />
                {notificationCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-slate-100 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/50 rounded-t-2xl">
                    <h3 className="font-bold text-slate-800">Notifikasi</h3>
                    {notificationCount > 0 && (
                       <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-black text-red-600">{notificationCount} Baru</span>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
                    {notifications.slice(0, 5).map(notif => (
                      <button key={notif.id} onClick={() => { setCurrentPage(notif.path); setShowNotifications(false); }} className={`w-full flex items-start gap-3 rounded-xl p-3 text-left transition-colors relative ${notif.bgCard}`}>
                        <div className={`mt-0.5 rounded-full p-1.5 ${notif.bgIcon}`}>
                          <i className={`fi ${notif.icon} text-xs`} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">{notif.title}</p>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{notif.message}</p>
                        </div>
                      </button>
                    ))}
                    {notificationCount === 0 && (
                      <div className="p-4 text-center text-sm text-slate-400">Belum ada notifikasi baru</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-1.5 shadow-sm">
              <div className={`h-2.5 w-2.5 rounded-full shadow-inner ${roleColorBar[userRole]}`} />
              <span className="text-sm font-bold text-slate-700">{user?.full_name}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{userRole}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
              title="Logout"
            >
              <i className="fi fi-rr-sign-out-alt text-lg" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <>
      <AuthenticatedApp />
      <Toaster position="top-right" />
    </>
  );
}
