import React from 'react';
import { ExpenseClaim } from '../types';
import { useAuth } from '../lib/auth';

interface ReceiptAuditModalProps {
  claim: ExpenseClaim | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const ReceiptAuditModal: React.FC<ReceiptAuditModalProps> = ({
  claim,
  isOpen,
  onClose,
  onApprove,
  onReject,
}) => {
  const { user, role, permissions } = useAuth();
  if (!isOpen || !claim) return null;

  const isSelfApproval = Boolean(
    user?.fullName &&
      (claim.submittedBy?.toLowerCase() === user.fullName.toLowerCase() ||
        claim.driverName?.toLowerCase() === user.fullName.toLowerCase())
  );
  const canApprove = permissions.canApproveExpenses && !isSelfApproval;
  const isDriver = role === 'driver';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-on-background/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-[#dce9ff] overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-space-md bg-surface-container-low flex items-center justify-between border-b border-[#e5eeff]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">
              receipt_long
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Fiscal Receipt & Telemetry Audit
                </span>
                <span className="font-label-code text-[11px] bg-tertiary-fixed text-on-tertiary-fixed px-1.5 py-0.5 rounded font-bold">
                  CANBUS Matched
                </span>
              </div>
              <p className="font-label-sm text-[11px] text-outline">
                {claim.claimNumber} • {claim.vendor}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-outline hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content Body: Two-column Comparison */}
        <div className="p-space-lg grid grid-cols-1 md:grid-cols-2 gap-space-lg max-h-[75vh] overflow-y-auto">
          {/* Left: Scanned ETR Fiscal Receipt mockup */}
          <div className="bg-[#fffdf7] border border-[#e2d7c0] rounded-xl p-4 shadow-sm font-mono text-[11px] text-slate-800 space-y-2">
            <div className="text-center pb-2 border-b border-dashed border-[#c7b99c]">
              <div className="font-bold text-[13px] tracking-wider">SHELL ELDORET BYPASS</div>
              <div>VIVO ENERGY KENYA LTD</div>
              <div>PIN: P051189240L • VAT REGISTERED</div>
              <div>ETR SERIAL: KRA00291049</div>
            </div>

            <div className="py-1 border-b border-dashed border-[#c7b99c] flex justify-between">
              <span>RECEIPT NO: 0049219</span>
              <span>TIME: 14:08 EAT</span>
            </div>

            <div className="py-1 border-b border-dashed border-[#c7b99c] flex justify-between">
              <span>VEHICLE: KDA 542T</span>
              <span>PUMP: 04 (HIGH-FLOW)</span>
            </div>

            <div className="py-2 border-b border-dashed border-[#c7b99c] space-y-1">
              <div className="flex justify-between font-bold">
                <span>DIESEL 50PPM (ULS)</span>
                <span>KES {claim.amountKes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>210.00 LITRES @ 180.00</span>
                <span>(16% VAT INCL)</span>
              </div>
            </div>

            <div className="py-1 border-b border-dashed border-[#c7b99c] space-y-0.5">
              <div className="flex justify-between">
                <span>PAYMENT: M-PESA B2B</span>
                <span className="font-bold">{claim.mpesaRef}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>CASHIER: J. MAINA</span>
                <span>STATUS: COMPLETE</span>
              </div>
            </div>

            <div className="text-center pt-2 text-[10px] text-slate-500">
              *** KRA TIMS COMPLIANT FISCAL CODE ***
              <br />
              D829-410A-9082-FA19
            </div>
          </div>

          {/* Right: CANBUS & GPS Telemetry Cross-Validation */}
          <div className="space-y-3">
            <div className="bg-surface-container-low p-3 rounded-xl border border-[#dce9ff]">
              <div className="font-label-sm text-[11px] text-outline uppercase font-semibold mb-1">
                Telemetry Cross-Check
              </div>
              <div className="space-y-2 text-body-sm text-[12px]">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Asset Odometer:</span>
                  <span className="font-label-numeric font-bold text-on-surface">
                    418,290 KM
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Geofence Proximity:</span>
                  <span className="text-tertiary font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                    Inside Shell Station (14:02 - 14:18)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Fuel Sensor Tank Delta:</span>
                  <span className="font-label-numeric font-bold text-tertiary">
                    +208.4 L (99.2% Match)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Driver Assigned:</span>
                  <span className="text-on-surface font-medium">{claim.driverName} ({claim.driverId})</span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-[12px]">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                Audit Verification Passed
              </div>
              <p className="font-body-sm text-[11px] text-emerald-700 mt-1">
                Both optical OCR extraction and CANBUS onboard fuel level telemetry corroborate 210L refuel. This expense fulfills KRA Section 23 statutory deduction prerequisites.
              </p>
            </div>

            <div className="bg-surface-container-low p-3 rounded-xl border border-[#dce9ff] text-[11px]">
              <div className="font-semibold text-on-surface mb-0.5">Route Financial Impact</div>
              <div className="text-on-surface-variant">
                Allocated to <strong>{claim.dispatchId}</strong>. Unit trip fuel ratio will recalibrate from 26.4% to 27.2%.
              </div>
            </div>

            {isSelfApproval && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-start gap-2">
                <span className="material-symbols-outlined text-amber-700 text-[18px] shrink-0">gavel</span>
                <div>
                  <strong>SEC-04 Self-Approval Prohibition:</strong> You are logged in as the claimant or submitter of this voucher. Independent Controller approval is strictly mandatory.
                </div>
              </div>
            )}

            {isDriver && (
              <div className="p-3 bg-slate-100 border border-slate-300 rounded-xl text-slate-700 text-xs flex items-start gap-2">
                <span className="material-symbols-outlined text-slate-500 text-[18px] shrink-0">visibility</span>
                <div>
                  <strong>Driver Read-Only Access:</strong> Vouchers can be inspected, but approvals and rejections are reserved for authorized controllers.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-space-md bg-surface-container-low flex items-center justify-between border-t border-[#e5eeff]">
          <button
            disabled={!permissions.canApproveExpenses}
            onClick={() => {
              onReject(claim.id);
              onClose();
            }}
            className="px-4 py-2 rounded-lg text-error hover:bg-error-container/30 font-body-md text-[13px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Reject Claim
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-body-md text-[13px] hover:bg-surface-container-high transition-colors"
            >
              Close
            </button>
            <button
              disabled={!canApprove}
              onClick={() => {
                onApprove(claim.id);
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-primary text-on-primary font-body-md text-[13px] font-medium hover:bg-primary-container shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              {isSelfApproval ? 'Self-Approval Prohibited' : `Approve (KES ${claim.amountKes.toLocaleString()})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
