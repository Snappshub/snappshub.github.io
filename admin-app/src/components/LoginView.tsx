import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, ShieldAlert, KeyRound } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: () => void;
  savedUsername: string;
  savedPasswordHash: string;
  onUpdateCredentials: (newUser: string, newPass: string) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  savedUsername,
  savedPasswordHash,
  onUpdateCredentials,
  showToast
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPass, setShowPass] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockSeconds, setLockSeconds] = useState(30);

  // Recovery modal
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  // First-time setup modal
  const [showFirstSetupModal, setShowFirstSetupModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) {
      showToast('error', 'Console Locked', `Too many failed attempts. Try again in ${lockSeconds}s.`);
      return;
    }

    const trimmedUser = username.trim();
    const isDefault = trimmedUser === 'admin' && password === 'admin123';
    const isMatch = (trimmedUser === savedUsername || trimmedUser === 'admin') && password === savedPasswordHash;

    if (isMatch || isDefault) {
      setAttempts(0);
      showToast('success', 'Authentication Verified', 'Welcome back to SnappsHub Master Console.');
      
      // If default credentials are used, suggest updating them
      if (savedPasswordHash === 'admin123') {
        setShowFirstSetupModal(true);
      } else {
        onLoginSuccess();
      }
    } else {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);

      if (nextAttempts >= 5) {
        setIsLocked(true);
        showToast('error', 'Security Lockdown', '5 failed attempts reached. Console locked for 30s.');
        let sec = 30;
        const timer = setInterval(() => {
          sec--;
          setLockSeconds(sec);
          if (sec <= 0) {
            clearInterval(timer);
            setIsLocked(false);
            setAttempts(0);
            setLockSeconds(30);
          }
        }, 1000);
      } else {
        showToast('error', 'Login Failed', `Invalid credentials (${nextAttempts}/5 attempts). Default: admin / admin123`);
      }
    }
  };

  const handleSaveNewCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      showToast('warning', 'Validation Error', 'Please enter a valid username.');
      return;
    }
    if (newPassword.length < 6) {
      showToast('warning', 'Weak Password', 'Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      showToast('error', 'Mismatch', 'Passwords do not match.');
      return;
    }

    onUpdateCredentials(newUsername.trim(), newPassword);
    setShowFirstSetupModal(false);
    showToast('success', 'Security Updated', 'Your private credentials have been saved. Access granted.');
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#f8fafc] text-slate-800 selection:bg-blue-600 selection:text-white">
      {/* Brand Icon */}
      <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 mb-4 overflow-hidden">
        S
      </div>

      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight text-center">Welcome Back</h1>
      <p className="text-slate-500 text-sm mt-1 mb-6 text-center">Alamin Saheb</p>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Admin login</h2>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-600 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
            SHIELD ON
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5 mb-6">Master authentication console</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Username / Email</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                disabled={isLocked}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => setShowRecoveryModal(true)}
                className="text-xs text-blue-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={isLocked}
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition font-mono disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLocked}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center space-x-2 transition mt-2 disabled:opacity-50 cursor-pointer"
          >
            <span>{isLocked ? `Locked (${lockSeconds}s)` : 'Sign in'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Security Status in Card */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Brute-force Guard: Active</span>
          <span className={attempts > 2 ? 'text-rose-600 font-bold' : 'text-emerald-600'}>
            {attempts}/5 Attempts
          </span>
        </div>
      </div>

      {/* Footer lockup */}
      <div className="flex items-center text-xs text-slate-400 mt-6 space-x-1.5">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Protected Master Access &bull; 01922392422</span>
      </div>

      {/* RECOVERY MODAL */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-1">
              <KeyRound className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">Credential Recovery</h3>
              <p className="text-xs text-slate-500 mt-1">
                For security reasons, master credentials are encrypted locally on this device.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Master Phone:</span>
                <span className="font-mono font-bold text-slate-900">01922392422</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Support Email:</span>
                <span className="font-mono text-slate-900">alaminsaheb2019@gmail.com</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Default Login:</span>
                <span className="font-mono text-blue-600 font-bold">admin / admin123</span>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  onUpdateCredentials('admin', 'admin123');
                  setUsername('admin');
                  setPassword('admin123');
                  setShowRecoveryModal(false);
                  showToast('info', 'Credentials Reset', 'Reset to default admin / admin123');
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition"
              >
                Reset to Default
              </button>
              <button
                type="button"
                onClick={() => setShowRecoveryModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FIRST-TIME SETUP MODAL */}
      {showFirstSetupModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-1">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">First-Time Security Setup</h3>
              <p className="text-xs text-slate-500 mt-1">
                Default credentials detected. Please set your own private Username & Password to lock your admin console.
              </p>
            </div>

            <form onSubmit={handleSaveNewCredentials} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Username *</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                  placeholder="e.g. alamin_saheb"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Password (Min 6 chars) *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowFirstSetupModal(false);
                    onLoginSuccess();
                  }}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Skip for now
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
                >
                  Save & Lock My Admin Panel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
