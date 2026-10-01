// ====================================================================
// ANSURY OS — RBAC PERMISSIONS ENGINE & ROLE ACCESS MATRIX
// Policy: SEC-01 (Role Segregation) & SEC-04 (Dual Authorization)
// ====================================================================

import { NavigationPath } from '../types';

export type AppRole =
  | 'super_admin'
  | 'finance_controller'
  | 'fleet_ops_manager'
  | 'dispatcher_clerk'
  | 'driver';

export interface RolePermissions {
  // Administration & Security
  canManageUsers: boolean;
  canEditSettings: boolean;
  canViewAuditLogs: boolean;
  canDeleteRecords: boolean;

  // Finance & Treasury
  canApproveExpenses: boolean;
  canSubmitExpenses: boolean;
  canManageInvoices: boolean;
  canMatchReconciliation: boolean;
  canExportFinancials: boolean;
  canIssueRefunds: boolean;

  // Fleet & Operations
  canCreateTrips: boolean;
  canEditFleet: boolean;
  canResolveAnomalies: boolean;
  canManageCustomers: boolean;

  // Driver Mode Restriction
  isReadOnly: boolean;
  canSubmitDriverVoucherOnly: boolean;
}

export interface RoleMetadata {
  id: AppRole;
  label: string;
  badgeTitle: string;
  badgeColor: string;
  description: string;
  responsibilities: string[];
}

export const ROLE_METADATA: Record<AppRole, RoleMetadata> = {
  super_admin: {
    id: 'super_admin',
    label: 'Super Administrator',
    badgeTitle: 'SUPER ADMIN (FULL CONTROL)',
    badgeColor: 'bg-primary text-white',
    description: 'Complete administrative control over identity, system settings, treasury rules, and audit logs.',
    responsibilities: [
      'User provisioning & role assignment (SEC-01)',
      'Enterprise company & banking configuration',
      'Immutable audit trail inspection',
      'Dual-authorization governance override',
    ],
  },
  finance_controller: {
    id: 'finance_controller',
    label: 'Senior Financial Controller',
    badgeTitle: 'FINANCE CONTROLLER',
    badgeColor: 'bg-emerald-700 text-white',
    description: 'Full treasury, accounts receivable, corridor vouchers, and reconciliation authority.',
    responsibilities: [
      'Invoice issuance & AR sub-ledger management',
      'Expense voucher approval & dual-authorization sign-off',
      'Bank & M-Pesa automated match engine',
      'Financial statements (P&L, Balance Sheet, Cash Flow)',
    ],
  },
  fleet_ops_manager: {
    id: 'fleet_ops_manager',
    label: 'Fleet Operations Manager',
    badgeTitle: 'FLEET OPS MANAGER',
    badgeColor: 'bg-blue-700 text-white',
    description: 'Corridor haulage dispatches, vehicle health, fleet fuel telemetry, and driver allocations.',
    responsibilities: [
      'Prime mover & rigid truck specifications & maintenance',
      'Waybill dispatch & turnaround scheduling',
      'Telemetry anomaly investigation & fuel spike resolution',
      'Corridor advance voucher submissions',
    ],
  },
  dispatcher_clerk: {
    id: 'dispatcher_clerk',
    label: 'Dispatcher / Operations Clerk',
    badgeTitle: 'DISPATCHER / CLERK',
    badgeColor: 'bg-amber-600 text-white',
    description: 'Trip logging, corridor waybill updates, shipper intake, and operational expense submissions.',
    responsibilities: [
      'Trip entry and waybill documentation',
      'Shipper delivery coordination',
      'Driver toll & border expense voucher submissions',
      'Read-only corridor rate review',
    ],
  },
  driver: {
    id: 'driver',
    label: 'Corridor Prime Mover Driver',
    badgeTitle: 'DRIVER (READ-ONLY)',
    badgeColor: 'bg-slate-700 text-white',
    description: 'Read-only visibility across fleet, trips, fuel metrics, and personal truck vouchers; voucher submission only.',
    responsibilities: [
      'Read-only inspection of fleet status and trips',
      'Personal route fuel efficiency monitoring',
      'Submit corridor fuel advance & toll vouchers for assigned truck',
      'All approvals, adjustments, and settings locked',
    ],
  },
};

export const ROLE_PERMISSIONS: Record<AppRole, RolePermissions> = {
  super_admin: {
    canManageUsers: true,
    canEditSettings: true,
    canViewAuditLogs: true,
    canDeleteRecords: true,
    canApproveExpenses: true,
    canSubmitExpenses: true,
    canManageInvoices: true,
    canMatchReconciliation: true,
    canExportFinancials: true,
    canIssueRefunds: true,
    canCreateTrips: true,
    canEditFleet: true,
    canResolveAnomalies: true,
    canManageCustomers: true,
    isReadOnly: false,
    canSubmitDriverVoucherOnly: false,
  },
  finance_controller: {
    canManageUsers: false,
    canEditSettings: false,
    canViewAuditLogs: true,
    canDeleteRecords: false,
    canApproveExpenses: true,
    canSubmitExpenses: true,
    canManageInvoices: true,
    canMatchReconciliation: true,
    canExportFinancials: true,
    canIssueRefunds: true,
    canCreateTrips: false,
    canEditFleet: false,
    canResolveAnomalies: false,
    canManageCustomers: true,
    isReadOnly: false,
    canSubmitDriverVoucherOnly: false,
  },
  fleet_ops_manager: {
    canManageUsers: false,
    canEditSettings: false,
    canViewAuditLogs: false,
    canDeleteRecords: false,
    canApproveExpenses: false,
    canSubmitExpenses: true,
    canManageInvoices: false,
    canMatchReconciliation: false,
    canExportFinancials: false,
    canIssueRefunds: false,
    canCreateTrips: true,
    canEditFleet: true,
    canResolveAnomalies: true,
    canManageCustomers: false,
    isReadOnly: false,
    canSubmitDriverVoucherOnly: false,
  },
  dispatcher_clerk: {
    canManageUsers: false,
    canEditSettings: false,
    canViewAuditLogs: false,
    canDeleteRecords: false,
    canApproveExpenses: false,
    canSubmitExpenses: true,
    canManageInvoices: false,
    canMatchReconciliation: false,
    canExportFinancials: false,
    canIssueRefunds: false,
    canCreateTrips: true,
    canEditFleet: false,
    canResolveAnomalies: false,
    canManageCustomers: false,
    isReadOnly: false,
    canSubmitDriverVoucherOnly: false,
  },
  driver: {
    canManageUsers: false,
    canEditSettings: false,
    canViewAuditLogs: false,
    canDeleteRecords: false,
    canApproveExpenses: false,
    canSubmitExpenses: true, // Write-only for submitting expense vouchers for his own truck
    canManageInvoices: false,
    canMatchReconciliation: false,
    canExportFinancials: false,
    canIssueRefunds: false,
    canCreateTrips: false,
    canEditFleet: false,
    canResolveAnomalies: false,
    canManageCustomers: false,
    isReadOnly: true, // "driver: read-only access to every screen (dashboard, fleet, trips, his fuel data, his vouchers), plus write only for: submitting expense vouchers for his own truck, uploading trip docs"
    canSubmitDriverVoucherOnly: true,
  },
};

export function getRolePermissions(role: AppRole): RolePermissions {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.driver;
}

export function canAccessRoute(role: AppRole, path: NavigationPath): boolean {
  // User Management is strictly Super Admin
  if (path === ('user-management' as NavigationPath)) {
    return role === 'super_admin';
  }

  // Audit Logs are accessible by Super Admin and Finance Controller
  if (path === ('audit-logs' as NavigationPath)) {
    return role === 'super_admin' || role === 'finance_controller';
  }

  // All other operational, dashboard, and financial screens are viewable
  // (per requirement: "driver sees everything, controls nothing")
  return true;
}
