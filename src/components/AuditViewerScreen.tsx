import React, { useState } from 'react';
import { AuditLogEntry } from '../types';
import { INITIAL_AUDIT_LOGS } from '../data/mockInvoices';
import { downloadCsv } from '../utils/format';

interface AuditViewerScreenProps {
  logs?: AuditLogEntry[];
}

export const AuditViewerScreen: React.FC<AuditViewerScreenProps> = ({
  logs = INITIAL_AUDIT_LOGS,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.reason && log.reason.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.previousValue && log.previousValue.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.newValue && log.newValue.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    if (entityFilter !== 'all' && log.entityType !== entityFilter) return false;
    return true;
  });

  const handleExportCsv = () => {
    const headers = [
      'Timestamp (UTC)',
      'Log ID',
      'Actor Name',
      'Actor Role',
      'Action',
      'Entity Type',
      'Entity ID',
      'Previous Value',
      'New Value',
      'Audit Justification',
      'Cryptographic Node IP Hash',
    ];

    const rows = filteredLogs.map((log) => [
      log.timestamp,
      log.id,
      log.actorName,
      log.actorRole,
      log.action,
      log.entityType,
      log.entityId,
      log.previousValue || 'N/A',
      log.newValue || 'N/A',
      log.reason || 'Standard operational verification',
      log.ipHash,
    ]);

    const filename = `Ansury_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCsv(filename, [headers, ...rows]);
  };

  const getActionBadgeColor = (action: AuditLogEntry['action']) => {
    switch (action) {
      case 'CREATE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'APPROVE':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'REJECT':
      case 'DELETE_SOFT':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'ROLE_CHANGE':
      case 'OVERRIDE':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'RECONCILE':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'LOGIN':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  return (
    <div className="p-space-lg space-y-6 max-w-7xl mx-auto">
      {/* Header Deck */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">verified_user</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Immutable Corporate Audit Trail
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographic ledger tracking all corridor approvals, soft deletions, entity changes, and SEC-04 overrides.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          <span>Export Audit Trail (.csv)</span>
        </button>
      </div>

      {/* Security Assurance Banner */}
      <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-emerald-400 text-[20px]">shield</span>
          </div>
          <div>
            <div className="text-xs font-bold tracking-tight">
              Zero Silent Deletions Policy · Append-Only Table
            </div>
            <div className="text-[11px] text-slate-400">
              PostgreSQL Row Level Security blocks direct updates and drops. Reversals require an auditable tombstone record.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-[11px] font-mono bg-white/10 px-2 py-0.5 rounded text-slate-300">
            {filteredLogs.length} Events Verified
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by actor, entity ID, rationale..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Action Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Action:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Actions</option>
              <option value="APPROVE">APPROVE</option>
              <option value="REJECT">REJECT</option>
              <option value="DELETE_SOFT">DELETE_SOFT (Tombstone)</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="ROLE_CHANGE">ROLE_CHANGE</option>
              <option value="RECONCILE">RECONCILE</option>
              <option value="OVERRIDE">OVERRIDE</option>
              <option value="REFUND">REFUND</option>
            </select>
          </div>

          {/* Entity Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Entity:</span>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Entities</option>
              <option value="INVOICE">INVOICE</option>
              <option value="EXPENSE">EXPENSE</option>
              <option value="BANK_TRANSACTION">BANK_TRANSACTION</option>
              <option value="USER">USER</option>
              <option value="VEHICLE">VEHICLE</option>
              <option value="FLOAT_ALLOCATION">FLOAT_ALLOCATION</option>
              <option value="SYSTEM_RULE">SYSTEM_RULE</option>
              <option value="SETTINGS">SETTINGS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Event Timestamp (UTC)</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Audit Rationale</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No audit records match your query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-GB', {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{log.actorName}</div>
                      <div className="text-[11px] text-slate-500">{log.actorRole}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{log.entityType}</div>
                      <div className="font-mono text-[11px] text-slate-500 truncate max-w-[140px]">{log.entityId}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {log.reason || 'Operational validation'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedEntry(log)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/5 rounded-lg border border-primary/20 transition-colors"
                      >
                        Inspect Diff
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Diff Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">history</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Audit Record Inspector ({selectedEntry.id})
                  </h3>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Node Hash: {selectedEntry.ipHash}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedEntry(null)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Actor:</span>
                <p className="font-bold text-slate-900">{selectedEntry.actorName} ({selectedEntry.actorRole})</p>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Timestamp:</span>
                <p className="font-mono text-slate-900">{selectedEntry.timestamp}</p>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Entity:</span>
                <p className="font-mono font-bold text-slate-900">{selectedEntry.entityType} · {selectedEntry.entityId}</p>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Action Taken:</span>
                <p className="font-bold text-slate-900">{selectedEntry.action}</p>
              </div>
            </div>

            {/* Diff comparison */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Previous State
                </span>
                <div className="p-3 bg-red-50/50 border border-red-200 rounded-xl font-mono text-[11px] text-red-900 whitespace-pre-wrap">
                  {selectedEntry.previousValue || '(None / Initial State)'}
                </div>
              </div>

              <div>
                <span className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Recorded New State
                </span>
                <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl font-mono text-[11px] text-emerald-900 whitespace-pre-wrap">
                  {selectedEntry.newValue || '(Removed / Null)'}
                </div>
              </div>

              <div>
                <span className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Mandatory Audit Rationale
                </span>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800">
                  {selectedEntry.reason || 'Verified corridor transaction record.'}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
