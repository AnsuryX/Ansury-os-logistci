import React, { useState, useEffect } from 'react';
import { NavigationPath } from '../types';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: NavigationPath) => void;
  onOpenManual?: () => void;
  onToggle?: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenManual,
  onToggle,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (onToggle) {
          onToggle();
        } else if (isOpen) {
          onClose();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onToggle]);

  if (!isOpen) return null;

  const quickItems = [
    {
      title: 'Operations & User Manual (In-App & Markdown)',
      subtitle: 'Complete guide for Administrators, Financial Controllers, Ops Managers & Drivers',
      category: 'Help & Documentation',
      icon: 'menu_book',
      action: () => {
        onClose();
        if (onOpenManual) onOpenManual();
      },
    },
    {
      title: 'Launch QC & Stress-Test Suite',
      subtitle: '35-Point Automated Launch Verification & Proof Engine',
      category: 'Audit & Verification',
      icon: 'verified_user',
      action: () => {
        onNavigate('launch-qc');
        onClose();
      },
    },
    {
      title: 'Trips & Dispatches Manifests',
      subtitle: 'Manage corridor waybills, customs OSBP holds & driver dockets',
      category: 'Operations',
      icon: 'alt_route',
      action: () => {
        onNavigate('trips');
        onClose();
      },
    },
    {
      title: 'Purge Demo Data / Reset to Clean Slate',
      subtitle: 'Wipe sample invoices, bank txns, vouchers & dispatches',
      category: 'System Administration',
      icon: 'delete_sweep',
      action: () => {
        onNavigate('settings');
        onClose();
      },
    },
    {
      title: 'Invoices & Accounts Receivable (AR)',
      subtitle: 'Manage freight invoices, partial payments, credit terms & aging',
      category: 'Finance',
      icon: 'request_quote',
      action: () => {
        onNavigate('invoices-ar');
        onClose();
      },
    },
    {
      title: 'KDA 542T • Mercedes Actros 2640',
      subtitle: 'Nairobi → Kampala • +14.2% Fuel Spike Telemetry Alert',
      category: 'Fleet & Anomaly',
      icon: 'warning',
      action: () => {
        onNavigate('anomalies-engine');
        onClose();
      },
    },
    {
      title: 'M-Pesa & Bank Reconcile Engine',
      subtitle: 'Corridor Clearing House v2.4 • 4 Txns Need Review',
      category: 'Finance',
      icon: 'sync_alt',
      action: () => {
        onNavigate('reconciliation');
        onClose();
      },
    },
    {
      title: '#EXP-1049: Shell Eldoret Fuel Refill',
      subtitle: 'KES 37,800 • Auto-matched OCR & Telemetry Pass',
      category: 'Expenses',
      icon: 'local_gas_station',
      action: () => {
        onNavigate('expenses');
        onClose();
      },
    },
    {
      title: 'Trip #TRP-0241 Unit Profitability',
      subtitle: 'Vivo Energy Uganda • Gross Margin 57.3% (KES 234,800)',
      category: 'Reports',
      icon: 'analytics',
      action: () => {
        onNavigate('profitability');
        onClose();
      },
    },
    {
      title: 'Ansury AI CFO Copilot',
      subtitle: 'Query real-time liquidity forecast and fleet burn rate',
      category: 'Intelligence',
      icon: 'psychology',
      action: () => {
        onNavigate('ansury-ai-cfo');
        onClose();
      },
    },
  ];

  const filtered = quickItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Palette Card */}
      <div className="relative w-full max-w-xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-[#dce9ff] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search input */}
        <div className="flex items-center px-4 border-b border-[#e5eeff]">
          <span className="material-symbols-outlined text-outline text-[22px]">search</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a truck plate, driver, trip code, or report..."
            className="w-full h-14 px-3 bg-transparent font-body-lg text-on-surface placeholder-outline focus:outline-none"
            autoFocus
          />
          <kbd className="px-2 py-0.5 rounded bg-surface-container text-[11px] font-label-code text-on-surface-variant">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2">
          <div className="px-3 py-1 font-label-sm text-[11px] uppercase tracking-wider text-outline">
            Quick Navigation & Telemetry
          </div>
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-outline font-body-sm">
              No matching dispatches or ledger records found for "{query}".
            </div>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={idx}
                onClick={item.action}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container-low transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px]">
                      {item.icon}
                    </span>
                  </div>
                  <div>
                    <div className="font-headline-sm text-[13px] font-semibold text-on-surface">
                      {item.title}
                    </div>
                    <div className="font-body-sm text-[11px] text-on-surface-variant">
                      {item.subtitle}
                    </div>
                  </div>
                </div>
                <span className="font-label-code text-[10px] text-outline bg-surface-container-low px-2 py-0.5 rounded">
                  {item.category}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-surface-container-low border-t border-[#e5eeff] flex items-center justify-between font-label-sm text-[11px] text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span>Press <strong>↵</strong> to navigate</span>
            <span>•</span>
            <span><strong>↑↓</strong> to cycle</span>
          </div>
          <span className="font-label-code text-primary font-semibold">Ansury OS v2.4</span>
        </div>
      </div>
    </div>
  );
};
