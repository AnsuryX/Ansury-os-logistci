import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import { LOGO_URL } from '../data/mockData';

export const LoginScreen: React.FC = () => {
  const { signIn, resetPassword, confirmPasswordReset, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Forgot Password Real Flow State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email.trim()) {
      setErrorMessage('Please enter an authorized corporate email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    const res = await signIn(email.trim(), password);
    if (!res.success) {
      setErrorMessage(res.error || 'Authentication failed. Please verify your credentials or reset your password.');
    }
  };

  // Step 1: Request Verification Code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);

    const clean = resetEmail.trim().toLowerCase();
    if (!clean) {
      setResetError('Please enter your registered corporate email.');
      return;
    }

    setIsSubmittingReset(true);
    try {
      const res = await resetPassword(clean);
      if (res.success) {
        setGeneratedCode(res.verificationCode || null);
        if (res.verificationCode) {
          setResetCode(res.verificationCode);
        }
        setResetSuccess(res.message);
        setResetStep(2);
      } else {
        setResetError(res.message || 'Unable to process reset request.');
      }
    } finally {
      setIsSubmittingReset(false);
    }
  };

  // Step 2: Confirm Code & Set Real New Password
  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);

    if (!resetCode.trim()) {
      setResetError('Please enter the 6-digit verification code.');
      return;
    }

    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match. Please verify.');
      return;
    }

    setIsSubmittingReset(true);
    try {
      const res = await confirmPasswordReset(resetEmail.trim(), resetCode.trim(), newPassword);
      if (res.success) {
        setResetSuccess(res.message);
        triggerToast('Password reset successful! You can now sign in.');
        setEmail(resetEmail.trim());
        setPassword(newPassword);
        setTimeout(() => {
          setIsResetModalOpen(false);
          setResetStep(1);
          setResetEmail('');
          setResetCode('');
          setNewPassword('');
          setConfirmPassword('');
          setGeneratedCode(null);
          setResetSuccess(null);
        }, 1800);
      } else {
        setResetError(res.message);
      }
    } finally {
      setIsSubmittingReset(false);
    }
  };

  const handleOpenResetModal = () => {
    setResetEmail(email.trim() || 'ayubalansari98@gmail.com');
    setResetStep(1);
    setResetError(null);
    setResetSuccess(null);
    setGeneratedCode(null);
    setIsResetModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-primary/20">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-3 border border-emerald-500/30">
          <span className="material-symbols-outlined text-emerald-400 text-[20px]">verified</span>
          <span className="text-xs font-semibold">{successToast}</span>
        </div>
      )}

      {/* Subtle Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[32rem] h-[32rem] bg-blue-500/5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[32rem] h-[32rem] bg-emerald-500/5 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
      </div>

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center items-center gap-3">
          <img
            src={LOGO_URL}
            alt="Ansury Logistics OS"
            className="h-11 w-auto object-contain shrink-0"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="text-left">
            <h1 className="font-headline-lg text-2xl font-bold text-slate-900 tracking-tight leading-tight">
              Ansury Logistics OS
            </h1>
            <p className="font-label-code text-[11px] text-primary uppercase font-bold tracking-wider">
              Northern Corridor Fleet & Financial OS
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/60 rounded-2xl border border-slate-200 sm:px-10 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Operator Sign In
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Authenticate using your institutional dispatch, finance, or driver credentials.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <span className="material-symbols-outlined text-rose-600 text-[18px] shrink-0 mt-0.5">error</span>
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Corporate Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
                  mail
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. operator@ansury.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleOpenResetModal}
                  className="text-[11px] text-primary hover:text-primary-container font-semibold transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-primary focus:ring-primary w-3.5 h-3.5"
                />
                <span className="text-xs text-slate-600">Remember this workstation</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">SEC-01 Guard</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold tracking-wide transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              <span>{isLoading ? 'Authenticating...' : 'Sign In to Corridor OS'}</span>
            </button>
          </form>

          {/* Quick Credential Helper Note */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <span className="material-symbols-outlined text-primary text-[16px]">info</span>
              <span>Default Initial Access</span>
            </div>
            <p className="text-slate-500 leading-snug">
              Sign in with <span className="font-mono font-bold text-slate-700">ayubalansari98@gmail.com</span> and password <span className="font-mono font-bold text-slate-700">Ansury@2026!</span>, or use your corporate assigned email.
            </p>
          </div>

          {/* Security Node Footer */}
          <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Cryptographic Node · Supabase JWT &amp; RLS Enforced</span>
          </div>
        </div>
      </div>

      {/* REAL FORGOT PASSWORD MODAL */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">lock_reset</span>
                <h3 className="text-base font-bold text-slate-900">
                  {resetStep === 1 ? 'Reset Operator Password' : 'Enter Code & Set New Password'}
                </h3>
              </div>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {resetError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-[18px]">error</span>
                <span>{resetError}</span>
              </div>
            )}

            {resetSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">verified</span>
                <span>{resetSuccess}</span>
              </div>
            )}

            {resetStep === 1 ? (
              <form onSubmit={handleRequestCode} className="space-y-4 text-xs">
                <p className="text-slate-600">
                  Enter your registered corporate email address. A real 6-digit cryptographic verification code will be generated for your session node.
                </p>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="e.g. ayubalansari98@gmail.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsResetModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReset}
                    className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-container shadow-sm flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">send</span>
                    <span>{isSubmittingReset ? 'Dispatching...' : 'Generate Verification Code'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleConfirmReset} className="space-y-4 text-xs">
                {generatedCode && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-950 space-y-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
                      Active Node Security Dispatch
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-lg font-bold tracking-widest text-primary">
                        {generatedCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setResetCode(generatedCode);
                          triggerToast('Code auto-filled!');
                        }}
                        className="text-[11px] font-semibold text-primary underline"
                      >
                        Auto-Fill Code
                      </button>
                    </div>
                    <p className="text-[10px] text-blue-700">
                      Code valid for 15 minutes. Enter code and specify your new password below.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    6-Digit Verification Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="e.g. 582914"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold tracking-wider text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {showNewPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Confirm New Password *
                    </label>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setResetStep(1)}
                    className="text-slate-500 hover:text-slate-700 text-xs font-semibold"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReset}
                    className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-container shadow-sm flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span>{isSubmittingReset ? 'Updating...' : 'Set New Password & Authenticate'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
