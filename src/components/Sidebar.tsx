import React from 'react';
import { NavigationPath } from '../types';
import { LOGO_URL } from '../data/mockData';
import { useAuth } from '../lib/auth';
import { ROLE_METADATA } from '../lib/permissions';

interface NavItem {
  path: NavigationPath;
  label: string;
  icon: string;
  iconClass?: string;
  badge?: number;
  badgeText?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  currentPath: NavigationPath;
  onNavigate: (path: NavigationPath) => void;
  pendingAnomaliesCount?: number;
  activeVehiclesCount?: number;
  totalVehiclesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  pendingAnomaliesCount = 0,
  activeVehiclesCount = 10,
  totalVehiclesCount = 12,
}) => {
  const { user, role, permissions, signOut } = useAuth();
  const roleMeta = ROLE_METADATA[role];

  const navSections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        { path: 'overview' as NavigationPath, label: 'Dashboard', icon: 'dashboard' },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { path: 'trips' as NavigationPath, label: 'Trips & Dispatches', icon: 'alt_route' },
        { path: 'vehicles-fleet' as NavigationPath, label: 'Vehicles & Fleet', icon: 'local_shipping' },
        { path: 'drivers' as NavigationPath, label: 'Drivers & Operators', icon: 'badge' },
        { path: 'customers' as NavigationPath, label: 'Customers & Shippers', icon: 'apartment' },
      ],
    },
    {
      title: 'FINANCE',
      items: [
        { path: 'expenses' as NavigationPath, label: 'Expenses & Vouchers', icon: 'receipt_long' },
        { path: 'reconciliation' as NavigationPath, label: 'Bank & MPESA Reconcile', icon: 'sync_alt' },
        { path: 'invoices-ar' as NavigationPath, label: 'Invoices & AR', icon: 'request_quote' },
        { path: 'payments' as NavigationPath, label: 'Disbursements', icon: 'payments' },
      ],
    },
    {
      title: 'FLEET & FUEL',
      items: [
        { path: 'fuel-control' as NavigationPath, label: 'Fuel Control & Card Log', icon: 'local_gas_station' },
        {
          path: 'anomalies-engine' as NavigationPath,
          label: 'Anomalies & Engine',
          icon: 'warning',
          iconClass: 'text-error',
          badge: pendingAnomaliesCount,
        },
      ],
    },
    {
      title: 'REPORTS',
      items: [
        {
          path: 'financial-statements' as NavigationPath,
          label: 'Financial Statements',
          icon: 'account_balance_wallet',
          iconClass: 'text-primary',
          badgeText: 'REAL',
        },
        { path: 'pl-cashflow' as NavigationPath, label: 'P&L & Cash Flow', icon: 'account_balance' },
        { path: 'profitability' as NavigationPath, label: 'Route Profitability', icon: 'analytics' },
      ],
    },
    {
      title: 'INTELLIGENCE',
      items: [
        {
          path: 'ansury-ai-cfo' as NavigationPath,
          label: 'Ansury AI CFO',
          icon: 'psychology',
          iconClass: 'text-primary',
        },
      ],
    },
    {
      title: 'AUDIT & VERIFICATION',
      items: [
        {
          path: 'launch-qc' as NavigationPath,
          label: 'Launch QC & Stress-Test',
          icon: 'verified_user',
          iconClass: 'text-tertiary',
          badgeText: '35/35',
        },
        ...(permissions.canViewAuditLogs
          ? [
              {
                path: 'audit-logs' as NavigationPath,
                label: 'Audit Log Trail',
                icon: 'history_edu',
                iconClass: 'text-primary',
                badgeText: 'SEC-04',
              },
            ]
          : []),
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        ...(permissions.canManageUsers
          ? [
              {
                path: 'user-management' as NavigationPath,
                label: 'User Management',
                icon: 'manage_accounts',
                iconClass: 'text-primary',
                badgeText: 'SEC-01',
              },
            ]
          : []),
        {
          path: 'settings' as NavigationPath,
          label: 'Settings & Company',
          icon: 'settings',
        },
      ],
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-container-lowest z-50 flex flex-col shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-[#e5eeff]">
      {/* Brand Header */}
      <div
        className="h-16 px-space-lg flex items-center gap-space-sm bg-surface-container-lowest border-b border-[#eff4ff] cursor-pointer"
        onClick={() => onNavigate('overview')}
      >
        <img
          alt="Ansury Logistics OS Logo"
          className="h-8 w-auto object-contain shrink-0"
          src={LOGO_URL}
          onError={(e) => {
            // fallback to SVG if remote image doesn't load
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="flex flex-col min-w-0">
          <span className="font-headline-sm text-headline-sm text-on-surface truncate leading-tight font-semibold">
            Ansury OS
          </span>
          <span className="font-label-code text-[10px] text-primary uppercase tracking-wider font-semibold">
            Enterprise Haul
          </span>
        </div>
      </div>

      {/* Driver Mode Banner */}
      {role === 'driver' && (
        <div className="mx-2 mt-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white flex items-center gap-2 border border-slate-700">
          <span className="material-symbols-outlined text-amber-400 text-[16px]">visibility</span>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
              Driver Mode (Read-Only)
            </div>
            <div className="text-[10px] text-slate-300 truncate">
              {user?.assignedTruck ? `Asset: ${user.assignedTruck}` : 'Northern Corridor'}
            </div>
          </div>
        </div>
      )}

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-space-sm py-space-sm space-y-3">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-space-sm py-1 font-label-sm text-[11px] uppercase tracking-wider text-outline font-semibold">
              {section.title}
            </div>
            <nav className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => onNavigate(item.path)}
                    type="button"
                    className={`w-full flex items-center gap-2.5 px-space-sm py-1.5 rounded-lg text-left transition-colors font-body-md text-body-md ${
                      isActive
                        ? 'bg-primary text-on-primary font-medium shadow-sm'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[18px] shrink-0 ${
                        isActive ? 'text-white' : item.iconClass || ''
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`ml-auto font-label-code text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                          isActive
                            ? 'bg-white text-primary'
                            : 'bg-error-container text-on-error-container'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {item.badgeText && (
                      <span
                        className={`ml-auto font-label-code text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          isActive
                            ? 'bg-white text-primary'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}
                      >
                        {item.badgeText}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Telemetry Status Footer */}
      <div className="p-space-sm bg-surface-container-low border-t border-[#e5eeff] space-y-2">
        <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="font-label-code text-[11px] text-on-surface-variant font-medium">
              GPS Telemetry Live
            </span>
          </div>
          <span className="font-label-code text-[11px] text-tertiary font-bold">
            {activeVehiclesCount}/{totalVehiclesCount} Active
          </span>
        </div>

        {/* Current Operator & Sign Out */}
        <div className="p-2 rounded-lg bg-white border border-[#e5eeff] flex items-center justify-between">
          <div className="min-w-0 pr-1">
            <div className="text-[11px] font-bold text-slate-900 truncate">
              {user?.fullName || 'Operator'}
            </div>
            <div className="text-[10px] text-primary font-semibold truncate">
              {roleMeta?.badgeTitle || role}
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            title="Sign Out of Ansury OS"
            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
