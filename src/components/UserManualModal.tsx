import React, { useState } from 'react';

interface UserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ManualSection =
  | 'overview'
  | 'admin_users'
  | 'driver_portal'
  | 'finance_reconcile'
  | 'fleet_telemetry'
  | 'invoices_ar'
  | 'shortcuts_data';

export const UserManualModal: React.FC<UserManualModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<ManualSection>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(
      'Ansury Logistics OS User Manual is available in the root directory as USER_MANUAL.md'
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const sections: { id: ManualSection; label: string; icon: string }[] = [
    { id: 'overview', label: '1. Overview & Corridors', icon: 'hub' },
    { id: 'admin_users', label: '2. Admin & User Roles', icon: 'manage_accounts' },
    { id: 'driver_portal', label: '3. Driver Workstation', icon: 'local_shipping' },
    { id: 'finance_reconcile', label: '4. Bank & M-Pesa Reconcile', icon: 'sync_alt' },
    { id: 'fleet_telemetry', label: '5. Fleet & CANBUS Telemetry', icon: 'speed' },
    { id: 'invoices_ar', label: '6. Invoices, AR & KRA Tax', icon: 'receipt_long' },
    { id: 'shortcuts_data', label: '7. Shortcuts & Data Purge', icon: 'keyboard' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Shell */}
      <div className="relative w-full max-w-5xl h-[90vh] bg-surface-container-lowest rounded-2xl shadow-2xl border border-[#dce9ff] flex flex-col overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-4 bg-surface-container-low border-b border-[#e5eeff] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">menu_book</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-base font-bold text-on-surface">
                Ansury Logistics OS — Operations & User Manual
              </h2>
              <p className="text-[11px] text-outline">
                Institutional documentation for Fleet Owners, Controllers, Dispatchers & Drivers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copiedLink ? 'check' : 'content_copy'}
              </span>
              <span>{copiedLink ? 'Reference Copied' : 'USER_MANUAL.md'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-white border-b border-[#eff4ff] flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400 text-[18px] ml-1">search</span>
          <input
            type="text"
            placeholder="Search manual topics (e.g. 'reset password', 'pre-trip checklist', 'M-Pesa reconciliation', 'KRA Section 23', 'fuel spike')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-xs bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 text-xs">
              Clear
            </button>
          )}
        </div>

        {/* Content Body: Sidebar + Main Viewer */}
        <div className="flex-1 flex overflow-hidden">
          {/* Internal Section Navigation */}
          <div className="w-64 border-r border-[#e5eeff] bg-surface-container-low/50 p-2 overflow-y-auto space-y-1">
            <div className="text-[10px] font-bold uppercase text-slate-400 px-2 py-1 tracking-wider">
              Sections
            </div>
            {sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveTab(sec.id)}
                className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  activeTab === sec.id
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-600 hover:bg-surface-container hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">{sec.icon}</span>
                <span className="truncate">{sec.label}</span>
              </button>
            ))}

            <div className="pt-4 mt-4 border-t border-[#e5eeff] px-2 text-[11px] text-slate-500 space-y-2">
              <div className="font-bold text-slate-700">Quick Contacts</div>
              <div>Dispatch: +254 711 002 918</div>
              <div>Malaba OSBP: +254 722 890 114</div>
              <div>I&M Bank Float: 01306297851250</div>
            </div>
          </div>

          {/* Main Manual Content */}
          <div className="flex-1 overflow-y-auto p-space-lg text-xs leading-relaxed text-slate-700 space-y-6">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="text-lg font-bold text-slate-900">
                    1. System Architecture & Northern Corridor Map
                  </h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Enterprise Operating System for East African Cross-Border Logistics & Finance
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2 text-blue-950">
                  <div className="font-bold flex items-center gap-1.5 text-sm">
                    <span className="material-symbols-outlined text-blue-700">alt_route</span>
                    Northern Corridor Primary Transit Spine
                  </div>
                  <p>
                    <strong>Mombasa Port (Kilindini)</strong> $\to$ <strong>Nairobi ICD Embakasi</strong> $\to$ <strong>Nakuru / Mai Mahiu</strong> $\to$ <strong>Eldoret Bypass</strong> $\to$ <strong>Malaba OSBP (Kenya/Uganda Border)</strong> $\to$ <strong>Jinja</strong> $\to$ <strong>Kampala Bweyogerere</strong> $\to$ <strong>Kigali (Rwanda)</strong> $\to$ <strong>Juba (South Sudan)</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 block">Dual Currency Operations</span>
                    <p className="text-slate-500">
                      Standardized multi-currency engine supporting KES and USD. Freight tariffs quoted in USD are automatically converted to KES for KRA fiscal schedules at the standard bank peg (1 USD = 132.50 KES).
                    </p>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 block">Banking & Float Integration</span>
                    <p className="text-slate-500">
                      Direct automated matching with I&M Bank Kenya (Corporate Account 01306297851250) and Safaricom M-Pesa B2C Paybill 809214 for automated driver trip advances.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'admin_users' && (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="text-lg font-bold text-slate-900">
                    2. User Management, Credential Resets & Role Matrix (SEC-01)
                  </h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Strict segregation of duties, role provisioning, and administrative credential governance
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm">Institutional Role Matrix</h4>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    {[
                      { role: 'Super Administrator', badge: 'bg-primary text-white', desc: 'Full configuration, user provisioning, audit inspection, and system settings.' },
                      { role: 'Senior Financial Controller', badge: 'bg-emerald-700 text-white', desc: 'AR aging, invoices, bank reconciliation match engine, and KRA tax schedules.' },
                      { role: 'Fleet Operations Manager', badge: 'bg-blue-700 text-white', desc: 'Fleet specs, CANBUS telematics, fuel spike anomaly debriefs, and dispatches.' },
                      { role: 'Dispatcher / Clerk', badge: 'bg-amber-600 text-white', desc: 'Waybill entry, route milestone updates, and toll expense submissions.' },
                      { role: 'Corridor Prime Mover Driver', badge: 'bg-slate-700 text-white', desc: 'Read-only fleet observability, dedicated Driver Portal, vehicle pre-trip checklist, 30-second receipt snap, and SOS breakdown broadcast.' },
                    ].map((r) => (
                      <div key={r.role} className="p-3 flex items-start gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${r.badge}`}>
                          {r.role}
                        </span>
                        <span className="text-slate-600">{r.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-slate-900 text-sm">How to Reset an Operator&apos;s Password</h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
                    <li>Go to <strong>User Management</strong> in the sidebar.</li>
                    <li>Click <strong>&quot;Reset Credential&quot;</strong> on the target operator&apos;s row.</li>
                    <li>The system automatically computes a secure one-time password (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-800">Ansury-W8K2#7419</code>).</li>
                    <li>Click <strong>Copy</strong> and provide mandatory SEC-01 audit rationale.</li>
                    <li>Click <strong>Issue Credential &amp; Log Audit</strong>. The credential is armed and audited.</li>
                  </ol>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="font-bold text-rose-900 text-sm flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-rose-600">gavel</span>
                    Audited Deletion &amp; Removal Procedures (Super Admin Only)
                  </h4>
                  <p className="text-slate-600 text-xs">
                    In compliance with GAAP and KRA audit standards, deletions require explicit administrator rationale and write immutable tombstones:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                    <li><strong>Customers &amp; Shippers:</strong> In Customers, click the trash icon. If the shipper has open AR or active shipments, typing DELETE is mandatory.</li>
                    <li><strong>Fleet Assets (Vehicles):</strong> In Fleet, click Decommission. In-transit vehicles require confirmation to ensure route logs remain continuous.</li>
                    <li><strong>Drivers &amp; Operators:</strong> In User Management or Drivers tab, click Remove. Unassigns from vehicle; active admin self-deletion is strictly blocked.</li>
                    <li><strong>Expenses &amp; Invoices:</strong> In Expenses or Invoices, click Void to record audited reversal tombstones without silently wiping ledgers.</li>
                    <li><strong>Trips &amp; Waybills:</strong> In Trips, cancel manifests with mandatory shipper/customs reason.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'driver_portal' && (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="text-lg font-bold text-slate-900">
                    3. Driver Portal, Pre-Trip Checklist & Corridor SOS
                  </h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    In-cab workstation for prime mover operators on the Northern Corridor
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm">Core Driver Tools</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                      <span className="font-bold text-emerald-950 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[18px] text-emerald-700">fact_check</span>
                        Pre-Trip Safety Inspection
                      </span>
                      <p className="text-emerald-900 text-[11px]">
                        Inspect tyres, dual 600L fuel tanks, oil/coolant, air brake pressure &gt; 8.0 bar, ECTS seal, and 9kg fire extinguisher before departure. Tap &quot;Sign &amp; Submit Inspection&quot; to send digital clearance to Central Dispatch.
                      </p>
                    </div>

                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                      <span className="font-bold text-rose-950 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[18px] text-rose-700">emergency</span>
                        Corridor SOS &amp; Delay Alert
                      </span>
                      <p className="text-rose-900 text-[11px]">
                        One-tap alert for Malaba/Busia customs congestion (&gt;4 hours), KeNHA weighbridge delay, mechanical puncture, or fuel card POS terminal errors. Transmits immediately to the 24/7 Breakdown Dispatch desk.
                      </p>
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                      <span className="font-bold text-blue-950 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[18px] text-blue-700">add_a_photo</span>
                        30-Second Receipt Snap
                      </span>
                      <p className="text-blue-900 text-[11px]">
                        Snap paper fuel receipts at Shell, Total, or Rubis. The OCR pipeline extracts vendor, amount in KES, and M-Pesa transaction code for instant controller review.
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="font-bold text-slate-900 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[18px] text-slate-700">assignment</span>
                        Digital Transit Waybill
                      </span>
                      <p className="text-slate-600 text-[11px]">
                        Access and print electronic dockets with cargo descriptions, weight, seal numbers, and delivery instructions to present to border customs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'finance_reconcile' && (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="text-lg font-bold text-slate-900">
                    4. Bank Reconciliation, M-Pesa Automated Matching & SEC-04
                  </h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Automated 3-way reconciliation against I&amp;M Bank Kenya and Safaricom Paybill 809214
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">Automated Reconciliation Queues</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li><strong>Auto-Matched:</strong> High-confidence algorithmic matches between bank statement debits/credits and ERP vouchers.</li>
                    <li><strong>Review Required:</strong> Minor timing variances or multi-truck bulk refuels requiring controller confirmation.</li>
                    <li><strong>Unmatched Statement:</strong> Bank wires or disbursements lacking an associated waybill or invoice.</li>
                    <li><strong>ERP Sub-Ledger:</strong> Open uncollected invoices or pending driver expense floats.</li>
                  </ul>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-amber-700">gavel</span>
                    Policy SEC-04: Prohibition of Self-Approval
                  </div>
                  <p className="text-[11px]">
                    Under policy SEC-04, no operator or manager may approve their own expense voucher or fuel float claim. When an operator submits a voucher, the &quot;Approve&quot; action is strictly restricted to an independent Financial Controller or Administrator.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'fleet_telemetry' && (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="text-lg font-bold text-slate-900">
                    5. Fleet Specifications, CANBUS Telematics &amp; Anomaly Engine
                  </h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Live fuel efficiency monitoring, CANBUS flow meters, and fuel spike detection
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">CANBUS Fuel Metrics (km/L &amp; L/100km)</h4>
                  <p className="text-slate-600">
                    Ansury OS ingests live telemetry from Mercedes-Benz Actros 2640, Scania R450, and Isuzu Giga prime movers. Target fuel baselines are calibrated by corridor terrain:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li><strong>Mombasa $\to$ Nairobi:</strong> Target 2.60 km/L (38.5 L/100km)</li>
                    <li><strong>Mai Mahiu Escarpment:</strong> Target 2.10 km/L (Heavy gradient climbing)</li>
                    <li><strong>Eldoret $\to$ Malaba:</strong> Target 2.85 km/L (Flat terrain cruising)</li>
                  </ul>
                </div>

                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-slate-900 text-sm">Resolving Telemetry Anomalies</h4>
                  <p className="text-slate-600">
                    When CANBUS registers an unexpected fuel level drop outside an approved fuel depot, an incident is flagged in <strong>Anomalies &amp; Engine</strong>. The Fleet Operations Manager conducts a debrief, enters notes, and clicks &quot;Resolve Anomaly&quot; to clear the alert.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'invoices_ar' && (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="text-lg font-bold text-slate-900">
                    6. Invoices, Accounts Receivable Aging &amp; KRA Tax Schedules
                  </h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Freight billing, partial payments, credit terms, and KRA Section 23 compliance
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">AR Aging Buckets</h4>
                  <p className="text-slate-600">
                    Invoices are categorized based on contractual shipper terms (typically 15 to 45 days):
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                    <div className="p-2 bg-slate-50 border rounded-lg text-center font-bold text-emerald-800">Current (0-30d)</div>
                    <div className="p-2 bg-slate-50 border rounded-lg text-center font-bold text-blue-800">31-60 Days</div>
                    <div className="p-2 bg-slate-50 border rounded-lg text-center font-bold text-amber-800">61-90 Days</div>
                    <div className="p-2 bg-slate-50 border rounded-lg text-center font-bold text-rose-800">90+ Days (Overdue)</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-slate-900 text-sm">KRA Section 23 Fuel Tax Schedule</h4>
                  <p className="text-slate-600">
                    Under Section 23 of the Kenya Income Tax Act, corporate transport fuel expenses require verifiable proof of fiscal ETR receipts and vehicle asset assignment. Use <strong>&quot;Export KRA Section 23 Schedule&quot;</strong> in Expenses to generate the compliant audit filing.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'shortcuts_data' && (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="text-lg font-bold text-slate-900">
                    7. Keyboard Shortcuts &amp; Enterprise Data Management
                  </h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Productivity accelerators, demo data purging, and factory reset
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">Global Shortcuts</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                      <span>Command Palette &amp; Omni-Search</span>
                      <kbd className="px-2.5 py-1 bg-slate-100 border border-slate-300 rounded font-mono font-bold text-slate-800">Ctrl + K / Cmd + K</kbd>
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                      <span>Quick Corridor Expense Voucher</span>
                      <kbd className="px-2.5 py-1 bg-slate-100 border border-slate-300 rounded font-mono font-bold text-slate-800">From Header / Driver Bar</kbd>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-slate-900 text-sm">Data Purge &amp; Restore</h4>
                  <p className="text-slate-600">
                    Located in <strong>Settings &amp; Company $\to$ Data Management</strong>:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li><strong>Purge Demo Data:</strong> Erases test invoices, sample transactions, and vouchers to prepare the tenant for live operation.</li>
                    <li><strong>Restore Sample Demo Data:</strong> Re-populates the rich sample dataset for training, scenario stress-testing, and compliance drills.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-surface-container-low border-t border-[#e5eeff] flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Ansury Logistics OS • Northern Corridor Haulage Edition • v2.8.4
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-container shadow-xs"
          >
            Close Manual
          </button>
        </div>
      </div>
    </div>
  );
};
