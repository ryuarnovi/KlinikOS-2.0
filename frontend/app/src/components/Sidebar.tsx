"use client";
import { useState } from 'react';
import type { Role } from '@/types';
import { cn } from '@/utils/cn';
import {
  LayoutDashboard, Users, UserCog, CalendarDays, Stethoscope,
  Pill, FileText, Receipt, Database, Server, FolderTree,
  ChevronLeft, ChevronRight, Shield, Activity, Menu, X, Share2
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  userRole: Role;
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const allRoles: Role[] = ['admin', 'dokter', 'perawat', 'apoteker', 'kasir', 'pasien', 'resepsionis'];

const roleColors: Record<Role, string> = {
  admin: 'bg-red-500',
  dokter: 'bg-blue-500',
  perawat: 'bg-green-500',
  apoteker: 'bg-purple-500',
  kasir: 'bg-orange-500',
  pasien: 'bg-teal-500',
  resepsionis: 'bg-cyan-500',
};

interface NavSection {
  title: string;
  items: { id: string; label: string; icon: React.ReactNode; roles: Role[] }[];
}

const navSections: NavSection[] = [
  {
    title: 'Utama',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: <i className="fi fi-rr-apps text-lg" />, roles: ['admin', 'dokter', 'perawat', 'apoteker', 'kasir', 'pasien', 'resepsionis'] },
    ],
  },
  {
    title: 'Manajemen',
    items: [
      { id: 'users', label: 'Users & Roles', icon: <i className="fi fi-rr-users-alt text-lg" />, roles: ['admin'] },
      { id: 'patients', label: 'Pasien', icon: <i className="fi fi-rr-user text-lg" />, roles: ['admin', 'dokter', 'perawat', 'kasir', 'resepsionis'] },
      { id: 'staff', label: 'Staff Profiles', icon: <i className="fi fi-rr-shield-check text-lg" />, roles: ['admin'] },
    ],
  },
  {
    title: 'Klinik',
    items: [
      { id: 'appointments', label: 'Appointments', icon: <i className="fi fi-rr-calendar text-lg" />, roles: ['admin', 'dokter', 'perawat', 'pasien', 'resepsionis'] },
      { id: 'medical-records', label: 'Rekam Medis', icon: <i className="fi fi-rr-stethoscope text-lg" />, roles: ['admin', 'dokter', 'perawat'] },
      { id: 'prescriptions', label: 'Resep Obat', icon: <i className="fi fi-rr-document text-lg" />, roles: ['admin', 'dokter', 'apoteker'] },
      { id: 'referrals', label: 'Rujukan', icon: <i className="fi fi-rr-share text-lg" />, roles: ['admin', 'dokter', 'perawat'] },
    ],
  },
  {
    title: 'Farmasi & Keuangan',
    items: [
      { id: 'pharmacy', label: 'Stok Obat', icon: <i className="fi fi-rr-tablets text-lg" />, roles: ['admin', 'apoteker'] },
      { id: 'billing', label: 'Billing', icon: <i className="fi fi-rr-receipt text-lg" />, roles: ['admin', 'kasir', 'resepsionis'] },
    ],
  },
  {
    title: 'Arsitektur',
    items: [
      { id: 'sql-migration', label: 'SQL Migration', icon: <i className="fi fi-rr-database text-lg" />, roles: ['admin', 'dokter', 'perawat', 'apoteker', 'kasir', 'pasien', 'resepsionis'] },
      { id: 'architecture', label: 'Go Backend', icon: <i className="fi fi-rr-server text-lg" />, roles: ['admin', 'dokter', 'perawat', 'apoteker', 'kasir', 'pasien', 'resepsionis'] },
      { id: 'docker', label: 'Docker Config', icon: <i className="fi fi-rr-box text-lg" />, roles: ['admin', 'dokter', 'perawat', 'apoteker', 'kasir', 'pasien', 'resepsionis'] },
    ],
  },
];

export function Sidebar({ currentPage, onNavigate, userRole, collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const filteredSections = navSections
    .map(section => ({
      ...section,
      items: section.items.filter(item => item.roles.includes(userRole?.toLowerCase() as Role)),
    }))
    .filter(section => section.items.length > 0);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-slate-700 px-4 py-5">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/20">
          <i className="fi fi-rr-pulse text-white text-xl" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold text-white truncate">Klinik ERP</h1>
            <p className="text-[11px] text-slate-400">Enterprise System</p>
          </div>
        )}
      </div>

      {/* User Status */}
      <div className={cn("border-b border-slate-700 p-4", collapsed && "flex justify-center")}>
        {collapsed ? (
          <div
            className={cn("h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold", roleColors[userRole])}
            title={`${userRole} access active`}
          >
            {userRole[0].toUpperCase()}
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl bg-slate-800/50 p-3 border border-slate-700/50">
            <div className={cn("h-2.5 w-2.5 rounded-full flex-shrink-0 animate-pulse", roleColors[userRole])} />
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Access Level</p>
              <p className="text-sm font-semibold text-slate-200 capitalize truncate">{userRole}</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {filteredSections.map(section => (
          <div key={section.title}>
            {!collapsed && (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); onMobileClose(); }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    collapsed && "justify-center px-2",
                    currentPage === item.id
                      ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 shadow-sm"
                      : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <span className={cn(currentPage === item.id && "text-emerald-400")}>{item.icon}</span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle (Desktop) */}
      <div className="border-t border-slate-700 p-3 hidden lg:block">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /> <span>Collapse</span></>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onMobileClose} />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-300 lg:hidden",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <button
          onClick={onMobileClose}
          className="absolute right-3 top-5 text-slate-400 hover:text-white"
        >
          <X size={20} />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col bg-slate-900 transition-all duration-300 flex-shrink-0",
        collapsed ? "w-[72px]" : "w-64"
      )}>
        {sidebarContent}
      </aside>
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="lg:hidden p-2 text-slate-600 hover:text-slate-900">
      <Menu size={24} />
    </button>
  );
}
