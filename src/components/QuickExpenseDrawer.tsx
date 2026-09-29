import React, { useState } from 'react';
import { ExpenseClaim } from '../types';

interface QuickExpenseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (expense: Partial<ExpenseClaim>) => void;
}

export const QuickExpenseDrawer: React.FC<QuickExpenseDrawerProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Fuel Refill');
  const [tripId, setTripId] = useState('TRP-0241');
  const [vendor, setVendor] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mpesa_paybill');
  const [refCode, setRefCode] = useState('');
  const [notes, setNotes] = useState('');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [uploadedFileDataUrl, setUploadedFileDataUrl] = useState<string | null>(null);

  // Dynamic vehicle/driver bindings based on selected trip
  const tripBindings: Record<
    string,
    { truck: string; driver: string; route: string; driverId: string }
  > = {
    'TRP-0241': {
      truck: 'KDA 542T (Mercedes Actros 3340)',
      driver: 'Joseph Mwangi',
      driverId: 'ID 2489',
      route: 'Nairobi → Kampala',
    },
    'TRP-0238': {
      truck: 'KDB 819M (Scania R480)',
      driver: 'Jackson Kiprop',
      driverId: 'Passport A8201',
      route: 'Mombasa → Jinja',
    },
    'TRP-0245': {
      truck: 'KCJ 312L (Isuzu Giga Double Axle)',
      driver: 'Samuel Omwenga',
      driverId: 'EP-0551',
      route: 'Nairobi → Kisumu',
    },
    'TRP-0249': {
      truck: 'KDF 109P (Volvo FH16)',
      driver: 'Musa Kimeto',
      driverId: 'EP-0318',
      route: 'Mombasa Local Depot Shunting',
    },
  };

  const currentBinding = tripBindings[tripId] || tripBindings['TRP-0241'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount) || 0;
    if (numAmount <= 0) return;

    onSubmit({
      id: 'exp-' + Date.now(),
      claimNumber: `#EXP-${Math.floor(1060 + Math.random() * 50)}`,
      category: category,
      amountKes: numAmount,
      vendor: vendor || 'Shell Eldoret Bypass',
      mpesaRef: refCode || 'SL98124KLA',
      truckAsset: currentBinding.truck,
      dispatchId: `${tripId} (${currentBinding.route})`,
      route: currentBinding.route,
      driverName: currentBinding.driver,
      driverId: currentBinding.driverId,
      submittedTime: 'Just now',
      submittedBy: 'Ops Mgr (Otieno O.)',
      telemetryPass: true,
      telemetryNote: 'Odometer auto-verified against GPS gateway.',
      status: 'pending',
      receiptAttached: !!uploadedFile,
      receiptFileName: uploadedFile || undefined,
      receiptDataUrl: uploadedFileDataUrl || undefined,
    });

    // Reset
    setAmount('');
    setVendor('');
    setRefCode('');
    setNotes('');
    setUploadedFile(null);
    setUploadedFileDataUrl(null);
    onClose();
  };

  const categories = [
    { label: 'Fuel', value: 'Fuel Refill', icon: 'local_gas_station' },
    { label: 'Allowance', value: 'Driver Allowance', icon: 'badge' },
    { label: 'Weighbridge', value: 'Toll / Weighbridge', icon: 'toll' },
    { label: 'Repairs', value: 'Maintenance', icon: 'build' },
    { label: 'Border', value: 'Customs & Border', icon: 'rv_hookup' },
    { label: 'Meals/Lodging', value: 'Accomodation', icon: 'hotel' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-on-background/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface-container-lowest shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250">
          {/* Header */}
          <div className="p-space-lg bg-surface-container-low flex items-center justify-between border-b border-[#e5eeff]">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[20px]">bolt</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  30-Second Fast Entry
                </span>
              </div>
              <p className="font-body-sm text-[12px] text-outline mt-0.5">
                Add route expense voucher with auto-trip binding
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-outline hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Form Body */}
          <form
            id="quickExpenseForm"
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-space-lg space-y-4"
          >
            {/* Amount */}
            <div>
              <label className="block font-label-sm text-[11px] text-outline uppercase font-semibold mb-1">
                Expense Amount (KES) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-label-numeric text-[15px] font-bold text-primary">
                  KES
                </span>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-11 pl-14 pr-4 bg-surface-container-low rounded-lg font-label-numeric text-headline-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary font-bold border border-[#dce9ff]"
                  autoFocus
                />
              </div>
            </div>

            {/* Category Pills */}
            <div>
              <label className="block font-label-sm text-[11px] text-outline uppercase font-semibold mb-1.5">
                Category *
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {categories.map((cat) => {
                  const isActive = category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`flex flex-col items-center p-2 rounded-lg text-center transition-colors border ${
                        isActive
                          ? 'bg-primary text-on-primary border-primary font-medium shadow-sm'
                          : 'bg-surface-container-low text-on-surface hover:bg-surface-container border-[#dce9ff]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {cat.icon}
                      </span>
                      <span className="font-label-sm text-[11px] mt-0.5">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trip Manifest Selection */}
            <div>
              <label className="block font-label-sm text-[11px] text-outline uppercase font-semibold mb-1">
                Active Trip Manifest (Auto-links Asset)
              </label>
              <select
                value={tripId}
                onChange={(e) => setTripId(e.target.value)}
                className="w-full h-10 px-3 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer border border-[#dce9ff]"
              >
                <option value="TRP-0241">#TRP-0241 • Nairobi → Kampala (KDA 542T / Mwangi)</option>
                <option value="TRP-0238">#TRP-0238 • Mombasa → Jinja (KDB 819M / Kiprop)</option>
                <option value="TRP-0245">#TRP-0245 • Nairobi → Kisumu (KCJ 312L / Omwenga)</option>
                <option value="TRP-0249">#TRP-0249 • Mombasa Local Shunting (KDF 109P)</option>
              </select>
            </div>

            {/* Auto-filled Asset Pill */}
            <div className="bg-surface-container p-2.5 rounded-lg flex items-center justify-between text-body-sm border border-[#dce9ff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">
                  local_shipping
                </span>
                <div>
                  <span className="font-label-code text-[12px] font-bold text-on-surface block">
                    {currentBinding.truck}
                  </span>
                  <div className="font-body-sm text-[11px] text-outline">
                    Driver: {currentBinding.driver}
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed font-label-code text-[10px] font-bold rounded">
                GPS Linked
              </span>
            </div>

            {/* Vendor */}
            <div>
              <label className="block font-label-sm text-[11px] text-outline uppercase font-semibold mb-1">
                Vendor / Payee Name *
              </label>
              <input
                type="text"
                required
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="e.g. Shell Eldoret Bypass, Total Malaba, KeNHA"
                className="w-full h-9 px-3 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border border-[#dce9ff]"
              />
            </div>

            {/* Payment Method & Ref */}
            <div className="grid grid-cols-2 gap-space-sm">
              <div>
                <label className="block font-label-sm text-[11px] text-outline uppercase font-semibold mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-9 px-2 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer border border-[#dce9ff]"
                >
                  <option value="mpesa_paybill">M-Pesa Paybill / Till</option>
                  <option value="fuel_card">TotalEnergies Fuel Card</option>
                  <option value="cash_float">Direct Cash Float</option>
                  <option value="bank_transfer">KCB Direct EFT</option>
                </select>
              </div>
              <div>
                <label className="block font-label-sm text-[11px] text-outline uppercase font-semibold mb-1">
                  M-Pesa / Slip Ref
                </label>
                <input
                  type="text"
                  value={refCode}
                  onChange={(e) => setRefCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SL98124KLA"
                  className="w-full h-9 px-3 bg-surface-container-low rounded-lg font-label-code text-label-code text-on-surface focus:outline-none focus:ring-1 focus:ring-primary uppercase border border-[#dce9ff]"
                />
              </div>
            </div>

            {/* Receipt Upload */}
            <div>
              <label className="block font-label-sm text-[11px] text-outline uppercase font-semibold mb-1">
                Receipt / Evidence Attachment
              </label>
              <label className="p-space-md bg-surface-container-low rounded-lg text-center cursor-pointer hover:bg-surface-container transition-colors relative flex flex-col items-center justify-center border border-dashed border-[#c7c4d8] block">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadedFile(file.name);
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const res = ev.target?.result as string;
                        if (res) {
                          setUploadedFileDataUrl(res);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <span className="material-symbols-outlined text-[28px] text-primary mb-1">
                  add_a_photo
                </span>
                <span className="font-body-sm text-[13px] font-medium text-on-surface">
                  Snap Photo or Tap to Upload
                </span>
                <span className="font-label-sm text-[11px] text-outline mt-0.5">
                  Instant OCR parsing for KRA compliance
                </span>
                {uploadedFile && (
                  <div className="mt-2 font-label-code text-[11px] text-tertiary bg-emerald-50 px-2 py-1 rounded">
                    Attached: {uploadedFile}
                  </div>
                )}
              </label>
            </div>

            {/* Purpose Notes */}
            <div>
              <label className="block font-label-sm text-[11px] text-outline uppercase font-semibold mb-1">
                Purpose / Corridor Context
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Added 210L diesel before heavy climbing section, odometer verified."
                className="w-full p-2 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary resize-none border border-[#dce9ff]"
              ></textarea>
            </div>
          </form>

          {/* Footer */}
          <div className="p-space-md bg-surface-container-low flex items-center gap-space-sm border-t border-[#e5eeff]">
            <button
              onClick={onClose}
              type="button"
              className="flex-1 py-2 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md hover:bg-surface-container transition-colors text-center border border-[#dce9ff]"
            >
              Cancel
            </button>
            <button
              form="quickExpenseForm"
              type="submit"
              className="flex-1 py-2 rounded-lg bg-primary text-on-primary font-body-md text-body-md font-medium hover:bg-primary-container shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span>Submit Voucher</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
