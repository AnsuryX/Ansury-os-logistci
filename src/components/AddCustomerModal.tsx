import React, { useState } from 'react';
import { Customer } from '../types';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomer: (customer: Customer) => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  onClose,
  onAddCustomer,
}) => {
  const [name, setName] = useState('');
  const [tinNumber, setTinNumber] = useState('');
  const [corridor, setCorridor] = useState('Mombasa - Malaba - Kampala (HFO Corridor)');
  const [cargoType, setCargoType] = useState('Heavy Fuel Oil (HFO) & Bitumen Bulk');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [billingCurrency, setBillingCurrency] = useState<'USD' | 'KES' | 'UGX'>('USD');
  const [creditDays, setCreditDays] = useState('15');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter customer company name');
      return;
    }
    if (!contactPerson.trim()) {
      setErrorMsg('Please provide a contact person');
      return;
    }

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: name.trim().toUpperCase(),
      tinNumber: tinNumber.trim() || 'TIN-PENDING',
      corridor,
      cargoType,
      contactPerson: contactPerson.trim(),
      phone: phone.trim() || '+256 000 000000',
      email: email.trim() || 'dispatch@client.com',
      billingCurrency,
      totalVolumeTonnes: 0,
      totalRevenueUsd: 0,
      outstandingArUsd: 0,
      creditDays: parseInt(creditDays, 10) || 15,
      activeTrips: 0,
      status: 'Contract Active',
      location: location.trim() || 'Kampala, Uganda',
      contractExpiry: '31 Dec 2027',
    };

    onAddCustomer(newCust);
    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg border border-[#dce9ff] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e5eeff] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">apartment</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-base font-bold text-on-surface">
                Register Shipper / Customer Contract
              </h2>
              <p className="font-body-sm text-[11px] text-outline">
                Add petroleum marketing company, bulk cargo shipper & billing profile
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-outline hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-[13px]">
          {errorMsg && (
            <div className="p-3 bg-error-container text-on-error-container rounded-xl font-body-sm text-[12px] flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                Company Name *
              </label>
              <input
                type="text"
                placeholder="e.g. HASS PETROLEUM (U) LTD"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl font-body-sm text-[13px] font-semibold text-on-surface border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                TIN / Tax Identification
              </label>
              <input
                type="text"
                placeholder="e.g. 10019482012"
                value={tinNumber}
                onChange={(e) => setTinNumber(e.target.value)}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl font-label-code text-[13px] text-on-surface border border-[#dce9ff] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                Primary Corridor
              </label>
              <select
                value={corridor}
                onChange={(e) => setCorridor(e.target.value)}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl font-body-sm text-[13px] text-on-surface border border-[#dce9ff] focus:outline-none"
              >
                <option value="Mombasa - Malaba - Kampala (HFO Corridor)">
                  Mombasa - Malaba - Kampala (HFO Corridor)
                </option>
                <option value="Mombasa - Jinja - Kampala Transit">
                  Mombasa - Jinja - Kampala Transit
                </option>
                <option value="Nairobi - Katuna - Kigali (Rwanda Route)">
                  Nairobi - Katuna - Kigali (Rwanda Route)
                </option>
                <option value="Eldoret - Malaba - Goma DRC">
                  Eldoret - Malaba - Goma DRC
                </option>
                <option value="Mombasa - Busia - Juba (South Sudan)">
                  Mombasa - Busia - Juba (South Sudan)
                </option>
              </select>
            </div>

            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                Cargo Specification
              </label>
              <select
                value={cargoType}
                onChange={(e) => setCargoType(e.target.value)}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl font-body-sm text-[13px] text-on-surface border border-[#dce9ff] focus:outline-none"
              >
                <option value="Heavy Fuel Oil (HFO) & Bitumen Bulk">Heavy Fuel Oil (HFO) & Bitumen Bulk</option>
                <option value="AGO Diesel 50ppm / PMS Petrol">AGO Diesel 50ppm / PMS Petrol</option>
                <option value="Jet A-1 Aviation Fuel">Jet A-1 Aviation Fuel</option>
                <option value="Crude Palm Oil (CPO Liquid Bulk)">Crude Palm Oil (CPO Liquid Bulk)</option>
                <option value="General Industrial Dry Bulk">General Industrial Dry Bulk</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                Contact Person *
              </label>
              <input
                type="text"
                placeholder="e.g. Dennis Ochieng"
                value={contactPerson}
                onChange={(e) => {
                  setContactPerson(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl font-body-sm text-[13px] text-on-surface border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="e.g. +256 772 123456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl font-body-sm text-[13px] text-on-surface border border-[#dce9ff] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                Billing Currency
              </label>
              <select
                value={billingCurrency}
                onChange={(e) => setBillingCurrency(e.target.value as 'USD' | 'KES' | 'UGX')}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl font-body-sm text-[13px] text-on-surface border border-[#dce9ff] focus:outline-none"
              >
                <option value="USD">USD ($) - SWIFT pacs.008 Wires</option>
                <option value="KES">KES (KSh) - RTGS Inward</option>
                <option value="UGX">UGX (Uganda Shillings)</option>
              </select>
            </div>

            <div>
              <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
                Payment Credit Terms (Days)
              </label>
              <input
                type="number"
                value={creditDays}
                onChange={(e) => setCreditDays(e.target.value)}
                className="w-full h-10 px-3 bg-surface-container-low rounded-xl font-label-code text-[13px] text-on-surface border border-[#dce9ff] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-label-sm text-[11px] text-outline font-semibold uppercase mb-1">
              Delivery Depot / Headquarter Address
            </label>
            <input
              type="text"
              placeholder="e.g. 5th Street Industrial Area, Kampala, Uganda"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full h-10 px-3 bg-surface-container-low rounded-xl font-body-sm text-[13px] text-on-surface border border-[#dce9ff] focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#e5eeff] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-container text-on-surface-variant font-body-sm text-[12px] font-medium hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary text-on-primary font-body-sm text-[12px] font-semibold hover:bg-primary-container shadow-sm transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              Save Shipper Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
