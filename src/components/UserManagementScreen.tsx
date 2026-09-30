import React, { useState } from 'react';
import { AppUser } from '../types';
import { AppRole, ROLE_METADATA } from '../lib/permissions';
import { DEMO_USERS, useAuth } from '../lib/auth';
import { uniqueId } from '../utils/format';

interface UserManagementScreenProps {
  users?: AppUser[];
  onAddUser?: (user: AppUser) => void;
  onUpdateUserRole?: (userId: string, newRole: AppRole, reason: string) => void;
  onToggleUserStatus?: (userId: string, active: boolean, reason: string) => void;
  onResetPassword?: (userId: string, tempSecret: string, reason: string) => void;
  onDeleteUser?: (userId: string, reason: string) => void;
  onLogAudit?: (entry: {
    actorName: string;
    actorRole: string;
    action: 'CREATE' | 'UPDATE' | 'ROLE_CHANGE';
    entityType: 'USER';
    entityId: string;
    previousValue?: string;
    newValue?: string;
    reason: string;
  }) => void;
  currentActorName?: string;
  currentActorRole?: string;
}

export const UserManagementScreen: React.FC<UserManagementScreenProps> = ({
  users: externalUsers,
  onAddUser,
  onUpdateUserRole,
  onToggleUserStatus,
  onResetPassword,
  onDeleteUser,
  onLogAudit,
  currentActorName = 'Ayub Al-Ansari',
  currentActorRole = 'Super Administrator',
}) => {
  const { user: currentAuthUser } = useAuth();
  // Local state seeded with default users
  const [userList, setUserList] = useState<AppUser[]>(
    externalUsers && externalUsers.length > 0
      ? externalUsers
      : Object.values(DEMO_USERS)
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | AppRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Deletion Modal
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);
  const [userDeleteReason, setUserDeleteReason] = useState('');

  // Invite Modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AppRole>('dispatcher_clerk');
  const [invitePhone, setInvitePhone] = useState('+254 ');
  const [inviteTruck, setInviteTruck] = useState('KDA 542T');

  // Change Role Modal
  const [selectedUserForRoleChange, setSelectedUserForRoleChange] = useState<AppUser | null>(null);
  const [newTargetRole, setNewTargetRole] = useState<AppRole>('dispatcher_clerk');
  const [roleChangeRationale, setRoleChangeRationale] = useState('');

  // Status Change Confirmation Modal
  const [selectedUserForStatusToggle, setSelectedUserForStatusToggle] = useState<AppUser | null>(null);
  const [statusToggleReason, setStatusToggleReason] = useState('');

  // Password Reset Modal
  const [selectedUserForPasswordReset, setSelectedUserForPasswordReset] = useState<AppUser | null>(null);
  const [tempPassword, setTempPassword] = useState('');
  const [resetReason, setResetReason] = useState('');
  const [requirePasswordChange, setRequirePasswordChange] = useState(true);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredUsers = userList.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm)) ||
      (u.assignedTruck && u.assignedTruck.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter === 'active' && !u.active) return false;
    if (statusFilter === 'inactive' && u.active) return false;
    return true;
  });

  // Handle Invite New User
  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) {
      triggerToast('Error: Name and email are required fields.');
      return;
    }

    const newUser: AppUser = {
      id: uniqueId('usr'),
      fullName: inviteName.trim(),
      email: inviteEmail.trim().toLowerCase(),
      role: inviteRole,
      phone: invitePhone.trim(),
      assignedTruck: inviteRole === 'driver' ? inviteTruck : undefined,
      active: true,
      createdAt: new Date().toISOString(),
      lastActive: 'Invited (Pending First Login)',
      createdBy: currentActorName,
    };

    setUserList((prev) => [newUser, ...prev]);
    onAddUser?.(newUser);

    onLogAudit?.({
      actorName: currentActorName,
      actorRole: currentActorRole,
      action: 'CREATE',
      entityType: 'USER',
      entityId: newUser.id,
      newValue: `Created User ${newUser.fullName} (${newUser.email}) with role: ${newUser.role}`,
      reason: `Provisioned operator under SEC-01 segregation of duties policy`,
    });

    triggerToast(`User ${newUser.fullName} provisioned with role: ${ROLE_METADATA[newUser.role].label}`);
    setIsInviteModalOpen(false);
    setInviteName('');
    setInviteEmail('');
    setInvitePhone('+254 ');
  };

  // Handle Role Change
  const handleRoleChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForRoleChange) return;

    if (!roleChangeRationale.trim()) {
      triggerToast('Error: Mandatory audit justification is required for role modification.');
      return;
    }

    const oldRole = selectedUserForRoleChange.role;
    const targetUserId = selectedUserForRoleChange.id;

    setUserList((prev) =>
      prev.map((u) => (u.id === targetUserId ? { ...u, role: newTargetRole } : u))
    );

    onUpdateUserRole?.(targetUserId, newTargetRole, roleChangeRationale);

    onLogAudit?.({
      actorName: currentActorName,
      actorRole: currentActorRole,
      action: 'ROLE_CHANGE',
      entityType: 'USER',
      entityId: targetUserId,
      previousValue: `Role: ${oldRole}`,
      newValue: `Role: ${newTargetRole}`,
      reason: roleChangeRationale,
    });

    triggerToast(`Role for ${selectedUserForRoleChange.fullName} updated from ${oldRole} to ${newTargetRole}`);
    setSelectedUserForRoleChange(null);
    setRoleChangeRationale('');
  };

  // Handle Deactivation / Activation (Soft-disable, never delete)
  const handleStatusToggleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForStatusToggle) return;

    if (!statusToggleReason.trim()) {
      triggerToast('Error: Audit justification is required for modifying operator access status.');
      return;
    }

    const newStatus = !selectedUserForStatusToggle.active;
    const targetUserId = selectedUserForStatusToggle.id;

    setUserList((prev) =>
      prev.map((u) => (u.id === targetUserId ? { ...u, active: newStatus } : u))
    );

    onToggleUserStatus?.(targetUserId, newStatus, statusToggleReason);

    onLogAudit?.({
      actorName: currentActorName,
      actorRole: currentActorRole,
      action: 'UPDATE',
      entityType: 'USER',
      entityId: targetUserId,
      previousValue: `Active: ${selectedUserForStatusToggle.active}`,
      newValue: `Active: ${newStatus}`,
      reason: statusToggleReason,
    });

    triggerToast(`Operator account ${selectedUserForStatusToggle.fullName} marked as ${newStatus ? 'Active' : 'Deactivated'}`);
    setSelectedUserForStatusToggle(null);
    setStatusToggleReason('');
  };

  const generateSecureTempPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$';
    let code = 'Ansury-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * (chars.length - 4)));
    }
    code += '#';
    code += Math.floor(1000 + Math.random() * 9000);
    return code;
  };

  const handleOpenPasswordReset = (targetUser: AppUser) => {
    setSelectedUserForPasswordReset(targetUser);
    setTempPassword(generateSecureTempPassword());
    setResetReason('Routine administrative credential rotation & secure access dispatch');
    setCopiedPassword(false);
  };

  const handlePasswordResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPasswordReset) return;

    if (!resetReason.trim()) {
      triggerToast('Error: Audit justification is mandatory for resetting operator credentials.');
      return;
    }

    const targetUserId = selectedUserForPasswordReset.id;

    onResetPassword?.(targetUserId, tempPassword, resetReason);

    onLogAudit?.({
      actorName: currentActorName,
      actorRole: currentActorRole,
      action: 'UPDATE',
      entityType: 'USER',
      entityId: targetUserId,
      previousValue: 'Existing Password Hash',
      newValue: 'Temporary One-Time Credential Issued (Expiring 24H)',
      reason: `Password reset executed: ${resetReason}. Force reset on login: ${requirePasswordChange}`,
    });

    triggerToast(`Temporary credential generated for ${selectedUserForPasswordReset.fullName}. Sent to audit log.`);
    setSelectedUserForPasswordReset(null);
    setTempPassword('');
    setResetReason('');
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(tempPassword);
    setCopiedPassword(true);
    triggerToast('Temporary password copied to clipboard!');
    setTimeout(() => setCopiedPassword(false), 2500);
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-3">
          <span className="material-symbols-outlined text-emerald-400 text-[20px]">verified</span>
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Deck */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">manage_accounts</span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              User & Role Management (SEC-01)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict institutional role-based access control, cryptographic session management, and soft-disable governance.
          </p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="px-4 py-2 bg-primary hover:bg-primary-container text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>Invite New Operator</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
            Total Provisioned
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {userList.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {userList.filter((u) => u.active).length} Active · {userList.filter((u) => !u.active).length} Soft-Disabled
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
            Finance & Treasury
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-mono">
            {userList.filter((u) => u.role === 'finance_controller').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Dual-approval signatories
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
            Operations & Clerks
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-1 font-mono">
            {userList.filter((u) => u.role === 'fleet_ops_manager' || u.role === 'dispatcher_clerk').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Trips & dispatch controllers
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
            Corridor Drivers
          </div>
          <div className="text-2xl font-bold text-slate-700 mt-1 font-mono">
            {userList.filter((u) => u.role === 'driver').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Read-only + fuel voucher write
          </div>
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
            placeholder="Search by name, email, truck, phone..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {(['all', 'super_admin', 'finance_controller', 'fleet_ops_manager', 'dispatcher_clerk', 'driver'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  roleFilter === r
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r === 'all' ? 'All Roles' : ROLE_METADATA[r].label.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {(['all', 'active', 'inactive'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors uppercase tracking-wider ${
                  statusFilter === s
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Operator Profile</th>
                <th className="py-3 px-4">Institutional Role</th>
                <th className="py-3 px-4">Assigned Asset / Corridor</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No operators match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const meta = ROLE_METADATA[u.role];
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {u.fullName
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{u.fullName}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.badgeColor}`}>
                          {meta.label}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {u.role === 'driver' && u.assignedTruck ? (
                          <div className="flex items-center gap-1 font-mono font-bold text-slate-700">
                            <span className="material-symbols-outlined text-[16px] text-slate-400">local_shipping</span>
                            <span>{u.assignedTruck}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500">{u.location || 'Nairobi Central Operating Hub'}</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {u.active ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-slate-400 font-semibold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                            Deactivated
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {u.lastActive || 'Today'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleOpenPasswordReset(u)}
                            title="Reset password or issue one-time emergency PIN"
                            className="px-2 py-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">lock_reset</span>
                            <span>Reset Credential</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUserForRoleChange(u);
                              setNewTargetRole(u.role);
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/5 rounded-lg border border-primary/20 transition-colors"
                          >
                            Change Role
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedUserForStatusToggle(u)}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors ${
                              u.active
                                ? 'text-amber-700 hover:bg-amber-50 border-amber-300'
                                : 'text-emerald-700 hover:bg-emerald-50 border-emerald-300'
                            }`}
                          >
                            {u.active ? 'Deactivate' : 'Reactivate'}
                          </button>

                          <button
                            type="button"
                            disabled={Boolean(currentAuthUser?.id === u.id || (currentAuthUser?.email && currentAuthUser.email.toLowerCase() === u.email.toLowerCase()))}
                            onClick={() => {
                              setUserToDelete(u);
                              setUserDeleteReason('');
                            }}
                            className="px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                            title={currentAuthUser?.id === u.id || (currentAuthUser?.email && currentAuthUser.email.toLowerCase() === u.email.toLowerCase()) ? "Self-deletion prohibited: Cannot remove your active session account" : "Remove / Revoke Operator Access (Admin Only)"}
                          >
                            <span className="material-symbols-outlined text-[13px]">delete</span>
                            <span>Remove</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">person_add</span>
                <h3 className="text-base font-bold text-slate-900">Provision New Institutional Operator</h3>
              </div>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="e.g. Samuel Kiprono"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="e.g. samuel@ansury.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Role & Dispatch Level *
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as AppRole)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="dispatcher_clerk">Dispatcher / Operations Clerk</option>
                    <option value="fleet_ops_manager">Fleet Operations Manager</option>
                    <option value="finance_controller">Senior Financial Controller</option>
                    <option value="driver">Corridor Prime Mover Driver (Read-Only)</option>
                    <option value="super_admin">Super Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    M-Pesa Connected Phone
                  </label>
                  <input
                    type="text"
                    value={invitePhone}
                    onChange={(e) => setInvitePhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>
              </div>

              {inviteRole === 'driver' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Assigned Prime Mover (Vehicle Reg)
                  </label>
                  <input
                    type="text"
                    value={inviteTruck}
                    onChange={(e) => setInviteTruck(e.target.value)}
                    placeholder="e.g. KDA 542T"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Drivers have read-only visibility across all screens, with write authority restricted exclusively to expense claims for their assigned truck.
                  </p>
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px]">
                <span className="font-bold text-slate-900">Governance Policy SEC-01:</span> All invitations generate an immutable audit log entry. The user will be authenticated via Supabase Identity & Auth.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary-container shadow-sm"
                >
                  Confirm & Provision Operator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {selectedUserForRoleChange && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">badge</span>
                <h3 className="text-base font-bold text-slate-900">Reassign Operator Role</h3>
              </div>
              <button onClick={() => setSelectedUserForRoleChange(null)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <div className="font-bold text-slate-900">{selectedUserForRoleChange.fullName}</div>
              <div className="text-slate-500 font-mono text-[11px]">{selectedUserForRoleChange.email}</div>
              <div className="text-slate-600 pt-1">
                Current Role: <span className="font-bold">{ROLE_METADATA[selectedUserForRoleChange.role].label}</span>
              </div>
            </div>

            <form onSubmit={handleRoleChangeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  New Target Role *
                </label>
                <select
                  value={newTargetRole}
                  onChange={(e) => setNewTargetRole(e.target.value as AppRole)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="super_admin">Super Administrator</option>
                  <option value="finance_controller">Senior Financial Controller</option>
                  <option value="fleet_ops_manager">Fleet Operations Manager</option>
                  <option value="dispatcher_clerk">Dispatcher / Operations Clerk</option>
                  <option value="driver">Corridor Prime Mover Driver (Read-Only)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Mandatory Audit Rationale (SEC-01 Requirement) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={roleChangeRationale}
                  onChange={(e) => setRoleChangeRationale(e.target.value)}
                  placeholder="State operational reason or management authorization..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedUserForRoleChange(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary-container shadow-sm"
                >
                  Apply Role Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate / Reactivate Modal */}
      {selectedUserForStatusToggle && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-[22px] ${selectedUserForStatusToggle.active ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {selectedUserForStatusToggle.active ? 'pause_circle' : 'play_circle'}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedUserForStatusToggle.active ? 'Deactivate Operator Access' : 'Reactivate Operator Access'}
                </h3>
              </div>
              <button onClick={() => setSelectedUserForStatusToggle(null)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-600">
              {selectedUserForStatusToggle.active ? (
                <>
                  Soft-disabling <strong>{selectedUserForStatusToggle.fullName}</strong> will immediately revoke dispatch privileges. Per immutable audit standards, operator records are never deleted.
                </>
              ) : (
                <>
                  Re-enabling access for <strong>{selectedUserForStatusToggle.fullName}</strong> will restore system sign-in capabilities under their designated role.
                </>
              )}
            </p>

            <form onSubmit={handleStatusToggleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Audit Justification *
                </label>
                <input
                  type="text"
                  required
                  value={statusToggleReason}
                  onChange={(e) => setStatusToggleReason(e.target.value)}
                  placeholder="e.g. Leave of absence / Corridors reassigned / Contract suspended"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedUserForStatusToggle(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-xl text-white font-semibold shadow-sm ${
                    selectedUserForStatusToggle.active
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {selectedUserForStatusToggle.active ? 'Confirm Deactivation' : 'Confirm Reactivation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset & One-Time PIN Modal */}
      {selectedUserForPasswordReset && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">lock_reset</span>
                <h3 className="text-base font-bold text-slate-900">
                  Reset Operator Credential
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForPasswordReset(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <div className="font-bold text-slate-900">{selectedUserForPasswordReset.fullName}</div>
              <div className="text-slate-500 font-mono text-[11px]">{selectedUserForPasswordReset.email}</div>
              <div className="text-slate-600 pt-1">
                Role: <span className="font-bold">{ROLE_METADATA[selectedUserForPasswordReset.role].label}</span>
              </div>
            </div>

            <form onSubmit={handlePasswordResetSubmit} className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">
                    Temporary One-Time Password / PIN *
                  </label>
                  <button
                    type="button"
                    onClick={() => setTempPassword(generateSecureTempPassword())}
                    className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-0.5"
                  >
                    <span className="material-symbols-outlined text-[13px]">autorenew</span>
                    Regenerate
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-mono font-bold text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors ${
                      copiedPassword
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {copiedPassword ? 'check' : 'content_copy'}
                    </span>
                    <span>{copiedPassword ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Provide this credential securely via encrypted WhatsApp/SMS to the verified operator phone.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Mandatory Audit Rationale (SEC-01) *
                </label>
                <input
                  type="text"
                  required
                  value={resetReason}
                  onChange={(e) => setResetReason(e.target.value)}
                  placeholder="e.g. Lost device, corridor credential renewal, scheduled cycle"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="requireChange"
                  checked={requirePasswordChange}
                  onChange={(e) => setRequirePasswordChange(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
                <label htmlFor="requireChange" className="text-slate-700 text-[11px] cursor-pointer">
                  Require operator to create new password upon next login
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedUserForPasswordReset(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary-container shadow-sm flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  Issue Credential & Log Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audited Operator Account Removal Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">person_remove</span>
                </span>
                <div>
                  <h3 className="text-base font-bold text-rose-900">Remove Operator Account</h3>
                  <span className="text-[11px] text-slate-500 font-mono">Policy SEC-01 • Access Revocation</span>
                </div>
              </div>
              <button onClick={() => setUserToDelete(null)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
              <div className="font-bold text-slate-900 text-sm">{userToDelete.fullName}</div>
              <div className="text-slate-600 font-mono">{userToDelete.email}</div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">Institutional Role:</span>
                <span className="font-bold text-slate-800">{ROLE_METADATA[userToDelete.role]?.label || userToDelete.role}</span>
              </div>
              {userToDelete.assignedTruck && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Assigned Fleet Asset:</span>
                  <span className="font-mono font-bold text-primary">{userToDelete.assignedTruck}</span>
                </div>
              )}
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1">
              <span className="font-bold block">Immutable Audit Security Notice:</span>
              <p className="text-[11px]">
                Revoking operator access permanently removes this identity from active authentication rosters while preserving all previous financial actions and approval history in the immutable audit trail.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!userDeleteReason.trim()) {
                  triggerToast('Error: Mandatory audit rationale is required to remove this operator.');
                  return;
                }
                if (onDeleteUser) {
                  onDeleteUser(userToDelete.id, userDeleteReason);
                }
                setUserList((prev) => prev.filter((u) => u.id !== userToDelete.id));
                triggerToast(`Operator ${userToDelete.fullName} removed from enterprise roster.`);
                setUserToDelete(null);
                setUserDeleteReason('');
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Mandatory Revocation Rationale *
                </label>
                <textarea
                  rows={3}
                  value={userDeleteReason}
                  onChange={(e) => setUserDeleteReason(e.target.value)}
                  placeholder="Reason for revoking operator credentials (e.g. Employment terminated, contractor agreement ended, role relocated)..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-rose-600 text-xs"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 text-xs transition-colors flex items-center gap-1 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[15px]">person_remove</span>
                  Revoke Access & Delete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
