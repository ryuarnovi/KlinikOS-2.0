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
import { SqlMigrationPage } from '@/pages/SqlMigrationPage';
import { ArchitecturePage } from '@/pages/ArchitecturePage';
import { DockerPage } from '@/pages/DockerPage';
import { ReferralsPage } from '@/pages/ReferralsPage';
import { Bell, Search, LogOut } from 'lucide-react';

function AuthenticatedApp() {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      case 'sql-migration': return <SqlMigrationPage />;
      case 'architecture': return <ArchitecturePage />;
      case 'docker': return <DockerPage />;
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
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari menu, pasien, obat..."
                  className="w-64 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
              <Bell size={18} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <div className="hidden sm:flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5">
              <div className={`h-2.5 w-2.5 rounded-full ${roleColorBar[userRole]}`} />
              <span className="text-sm font-medium text-slate-700">{user?.full_name}</span>
              <span className="text-xs text-slate-400">({userRole})</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
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

  return <AuthenticatedApp />;
}
