import React, { useState } from 'react';

interface HeaderProps {
  onOpenCommandPalette: () => void;
  onNavigateSettings?: () => void;
  notificationCount?: number;
  companyName?: string;
  accountNumber?: string;
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCommandPalette,
  onNavigateSettings,
  notificationCount = 3,
  companyName = 'BEYAYAN LIMITED',
  accountNumber = '01306297851250',
  userName = 'David Kimani',
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl z-40 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#eff4ff] flex items-center justify-between px-space-lg">
      {/* Global Search Bar with ⌘K */}
      <div className="flex items-center gap-space-md flex-1 max-w-xl">
        <div
          onClick={onOpenCommandPalette}
          className="relative w-full flex items-center cursor-pointer group"
        >
          <span className="material-symbols-outlined absolute left-3 text-outline text-[18px] group-hover:text-primary transition-colors">
            search
          </span>
          <input
            className="w-full h-9 pl-9 pr-14 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface placeholder-outline focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-all"
            placeholder="Search Trucks, Trips, Expenses, Invoices..."
            readOnly
            type="text"
          />
          <div className="absolute right-2.5 flex items-center gap-0.5 bg-surface-container-lowest px-1.5 py-0.5 rounded font-label-code text-[11px] text-on-surface-variant shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-[#e5eeff]">
            <span>⌘K</span>
          </div>
        </div>
      </div>

      {/* Right Controls & Profile */}
      <div className="flex items-center gap-space-md">
        {/* Live Verified Audit Badge */}
        <div className="hidden lg:flex items-center gap-1.5 bg-surface-container-low px-2.5 py-1 rounded-full border border-[#dce9ff]">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span className="font-label-sm text-[11px] text-on-surface font-semibold">
            Live Treasury Node
          </span>
        </div>

        {/* Currency Denomination */}
        <div className="flex items-center bg-surface-container-low px-2.5 py-1 rounded-lg gap-1.5 border border-[#dce9ff]">
          <span className="font-label-numeric text-[12px] text-on-surface font-bold">
            USD / KES
          </span>
          <span className="font-label-sm text-[11px] text-outline hidden md:inline">
            1 USD = 127.20 KSh
          </span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            aria-label="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error ring-2 ring-surface-container-lowest"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest rounded-xl shadow-xl border border-[#e5eeff] p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#e5eeff]">
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Corridor Notifications
                </span>
                <span className="font-label-code text-[11px] bg-error-container text-on-error-container px-1.5 py-0.5 rounded-full font-bold">
                  {notificationCount} Alerts
                </span>
              </div>
              <div className="divide-y divide-[#eff4ff] py-1">
                <div className="py-2 flex items-start gap-2">
                  <span className="material-symbols-outlined text-error text-[18px] mt-0.5">warning</span>
                  <div>
                    <p className="font-body-sm text-[12px] font-medium text-on-surface">KDA 542T: +14.2% Fuel Spike</p>
                    <p className="font-label-sm text-[11px] text-outline">Naivasha Escarpment idle stops</p>
                  </div>
                </div>
                <div className="py-2 flex items-start gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-[18px] mt-0.5">pending_actions</span>
                  <div>
                    <p className="font-body-sm text-[12px] font-medium text-on-surface">6 Expense Vouchers Pending</p>
                    <p className="font-label-sm text-[11px] text-outline">KES 142,500 Mombasa corridor</p>
                  </div>
                </div>
                <div className="py-2 flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">sync</span>
                  <div>
                    <p className="font-body-sm text-[12px] font-medium text-on-surface">Safaricom API Statement Synced</p>
                    <p className="font-label-sm text-[11px] text-outline">Today 14:42 EAT • 42 Txns Settled</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings Button */}
        {onNavigateSettings && (
          <button
            aria-label="Settings"
            onClick={onNavigateSettings}
            className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors flex items-center gap-1"
            title="Settings & Corporate Administration"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span className="hidden md:inline font-body-sm text-[12px] font-semibold text-outline hover:text-primary">
              Settings
            </span>
          </button>
        )}

        {/* Company & Profile Info */}
        <div
          onClick={onNavigateSettings}
          className={`flex items-center gap-2.5 pl-2 border-l border-[#e5eeff] ${
            onNavigateSettings ? 'cursor-pointer hover:opacity-85 transition-opacity' : ''
          }`}
          title="Click to view and edit company and user details"
        >
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="font-headline-sm text-[13px] text-on-surface leading-tight truncate max-w-[200px] font-bold">
              {companyName}
            </span>
            <span className="font-label-sm text-[11px] text-outline">
              I&M A/C {accountNumber}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm text-white font-bold text-[13px]">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
};
