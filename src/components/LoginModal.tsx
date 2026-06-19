import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { User } from '../types';
import { api } from '../api';
import { DISTRICT_LIST } from '../data';
import { AfricaLogo, FInput, FSelect } from './SubComponents';
import { GoogleLogin, googleLogout, CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

export interface LoginModalProps {
  onLogin: (u: User) => void;
  onClose: () => void;
  onRegister: (u: User) => void;
  users: User[];
}

// ─── MALAWI DISTRICTS BY REGION ──────────────────────────────────────────────
const DISTRICTS_BY_REGION: Record<string, string[]> = {
  Northern: [
    'Chitipa', 'Karonga', 'Likoma', 'Mzimba', 'Nkhata Bay', 'Rumphi',
  ],
  Central: [
    'Dedza', 'Dowa', 'Kasungu', 'Lilongwe', 'Mchinji', 'Nkhotakota',
    'Ntcheu', 'Ntchisi', 'Salima',
  ],
  Southern: [
    'Balaka', 'Blantyre', 'Chikwawa', 'Chiradzulu', 'Machinga', 'Mangochi',
    'Mulanje', 'Mwanza', 'Nsanje', 'Thyolo', 'Phalombe', 'Zomba', 'Neno',
  ],
};

const REGIONS = ['Northern', 'Central', 'Southern'];

// Roles a new user can self-select during registration
const REGISTER_ROLES = [
  { value: 'tot',                  label: 'Trainer of Trainers (TOT)' },
  { value: 'district_coordinator', label: 'District Coordinator (DC)' },
  { value: 'program_manager',      label: 'Regional / Program Manager' },
  { value: 'sasa_officer',         label: 'SASA Officer' },
  { value: 'data_entry',           label: 'Data Officer' },
  { value: 'cartographer',         label: 'Cartographer' },
  { value: 'field_officer',        label: 'Field Officer' },
  { value: 'viewer',               label: 'Other / Basic Access' },
];

// Which location fields to show per role
type LocationType = 'hq' | 'region' | 'district';
const ROLE_LOCATION: Record<string, LocationType> = {
  tot:                  'district',
  district_coordinator: 'district',
  field_officer:        'district',
  program_manager:      'region',
  program_staff:        'region',
  sasa_officer:         'hq',
  data_entry:           'hq',
  cartographer:         'hq',
  viewer:               'hq',
};

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onClose, onRegister, users }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'pending'>('login');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const [reg, setReg] = useState({
    name: '',
    role: 'tot',
    region: '',
    district: '',
    email: '',
    password: '',
    showPassword: false,
  });

  // When region changes, clear district so user picks again
  const setRegion = (region: string) => {
    setReg(p => ({ ...p, region, district: '' }));
  };

  const setRole = (role: string) => {
    // Reset location fields when role changes
    setReg(p => ({ ...p, role, region: '', district: '' }));
  };

  const locationType: LocationType = ROLE_LOCATION[reg.role] || 'hq';
  const availableDistricts = reg.region ? (DISTRICTS_BY_REGION[reg.region] || []) : [];

  // ─── LOGIN ──────────────────────────────────────────────────────────────────
  const doLogin = async () => {
    if (!email || !pass) { setErr('Please enter email and password'); return; }
    setLoading(true);
    setErr('');
    try {
      const data = await api.post('/api/users/login', { email, password: pass });
      if (data.error) { setErr(data.error); setLoading(false); return; }
      localStorage.setItem('token', data.token);
      onLogin(data.user);
    } catch {
      setErr('Unable to connect to server. Please try again.');
    }
    setLoading(false);
  };

  // ─── GOOGLE SIGN-IN ───────────────────────────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setErr('Google sign-in did not return a credential. Please try again.');
      return;
    }
    setLoading(true);
    setErr('');
    try {
      // Decoding here is only for local debugging/inspection. The backend
      // MUST independently verify the credential server-side — never trust
      // a client-decoded JWT as proof of authentication.
      const decoded: any = jwtDecode(credentialResponse.credential);

      const data = await api.post('/api/users/google-login', {
        credential: credentialResponse.credential,
      });

      if (data.error) {
        setErr(data.error);
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);
      onLogin(data.user);
    } catch {
      setErr('Unable to sign in with Google. Please try again.');
    }
    setLoading(false);
  };

  const handleGoogleError = () => {
    setErr('Google sign-in failed. Please try again.');
  };

  // ─── REGISTER ───────────────────────────────────────────────────────────────
  const createAccount = async () => {
    setErr('');

    // Validate required fields
    if (!reg.name.trim()) { setErr('Please enter your full name'); return; }
    if (!reg.email.trim()) { setErr('Please enter your email address'); return; }
    if (!reg.password) { setErr('Please set a password'); return; }
    if (reg.password.length < 6) { setErr('Password must be at least 6 characters'); return; }
    if (!reg.role) { setErr('Please select your designation'); return; }

    // Validate location fields based on role
    if (locationType === 'region' && !reg.region) {
      setErr('Please select your region'); return;
    }
    if (locationType === 'district') {
      if (!reg.region) { setErr('Please select your region'); return; }
      if (!reg.district) { setErr('Please select your district'); return; }
    }

    // Check for duplicate email in existing users
    const existingUser = users.find(u => u.email.toLowerCase() === reg.email.trim().toLowerCase());
    if (existingUser) {
      setErr('An account with this email already exists. Please use a different email or sign in.');
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, string> = {
        name: reg.name.trim(),
        email: reg.email.trim(),
        password: reg.password,
        designation: reg.role,
        avatar: reg.name.trim().split(' ').map((x: string) => x[0]).join('').toUpperCase().slice(0, 2),
      };

      if (locationType === 'region' || locationType === 'district') {
        payload.region = reg.region;
      }
      if (locationType === 'district') {
        payload.district = reg.district;
      }

      const data = await api.post('/api/users/register', payload);

      if (data.error) {
        if (data.error.includes('already exists') || data.error.includes('duplicate')) {
          setErr('An account with this email already exists. Please use a different email or sign in.');
        } else {
          setErr(data.error);
        }
        setLoading(false);
        return;
      }

      // Account created successfully - create user object and call onRegister
      const newUser: User = {
        id: data.id || Date.now(),
        email: reg.email.trim(),
        name: reg.name.trim(),
        role: reg.role as User['role'],
        region: locationType === 'region' || locationType === 'district' ? reg.region : null,
        district: locationType === 'district' ? reg.district : null,
        avatar: reg.name.trim().split(' ').map((x: string) => x[0]).join('').toUpperCase().slice(0, 2),
        status: 'active',
      };

      // Immediately log in the user (no admin approval needed)
      onRegister(newUser);
    } catch {
      setErr('Unable to connect to server. Please try again.');
    }
    setLoading(false);
  };

  // ─── SHARED STYLE HELPERS ────────────────────────────────────────────────────
  const inputCls = "w-full px-4 py-3 sm:py-2.5 rounded-xl bg-white/40 dark:bg-black/30 border border-slate-300/50 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/30 transition-all min-h-[44px] sm:min-h-auto";
  const labelCls = "block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1";

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Blurred background overlay */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

      {/* Glassmorphism Modal */}
      <div className="relative w-full max-w-[420px] rounded-3xl bg-white/70 dark:bg-[#0f1623]/70 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-2xl overflow-hidden p-6 sm:p-8 animate-fade-in-up max-h-[90vh] overflow-y-auto">

        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500" aria-label="Close dialog">
          <X size={20} className="sm:hidden" />
          <X size={18} className="hidden sm:block" />
        </button>

        {/* ── LOGIN MODE ─────────────────────────────────────────────────────── */}
        {mode === 'login' && (
          <div className="flex flex-col">
            <div className="flex justify-center mb-5">
              <AfricaLogo size={42} variant="full" />
            </div>

            <h2 className="text-2xl font-light text-center text-slate-900 dark:text-white mb-2">
              Welcome <span className="font-semibold">back!</span>
            </h2>
            <p className="text-[11.5px] text-center text-slate-600 dark:text-slate-300 mb-8 px-2 leading-relaxed">
              Sign in to access your dashboard
            </p>

            <div className="space-y-4">
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email" autoComplete="email" className={inputCls}
                  onKeyDown={e => e.key === 'Enter' && doLogin()}
                />
              </div>

              <div>
                <label className={labelCls}>Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)}
                    placeholder="••••••••" autoComplete="current-password"
                    className={`${inputCls} pr-10`}
                    onKeyDown={e => e.key === 'Enter' && doLogin()}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded"
                    aria-label={showPass ? 'Hide password' : 'Show password'}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between px-1 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 focus:ring-offset-0 bg-white/50 border-slate-300 dark:border-slate-600" />
                  <span className="text-xs text-slate-600 dark:text-slate-300">Remember me</span>
                </label>
                <button className="text-xs text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 rounded px-2 py-1">
                  Forgot password?
                </button>
              </div>
            </div>

            {err && (
              <div className="mt-4 bg-red-500/10 text-red-600 border border-red-500/20 rounded-xl p-3 text-xs text-center font-semibold">{err}</div>
            )}

            <button onClick={doLogin} disabled={loading}
              className="w-full mt-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98] disabled:opacity-70 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
              {loading ? 'Signing In...' : 'Log In'}
            </button>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-200 dark:bg-white/10"></div>
              <span className="text-[11px] text-slate-400">Or</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-white/10"></div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                width="100%"
              />
            </div>

            <div className="mt-8 text-center text-[11px] text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <button onClick={() => { setMode('register'); setErr(''); }}
                className="font-bold text-slate-900 dark:text-white hover:text-orange-500 transition-colors">
                Sign Up
              </button>
            </div>
          </div>
        )}

        {/* ── REGISTER MODE ──────────────────────────────────────────────────── */}
        {mode === 'register' && (
          <div className="flex flex-col">
            <div className="flex justify-center mb-4">
              <AfricaLogo size={32} variant="full" />
            </div>
            <h2 className="text-xl font-light text-center text-slate-900 dark:text-white mb-1">
              Create an <span className="font-semibold">account</span>
            </h2>
            <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
              Create your account with your role and location details. You'll have immediate access once registered.
            </p>

            <div className="space-y-3">
              {/* Full Name */}
              <div>
                <label className={labelCls}>Full Name *</label>
                <input type="text" value={reg.name} onChange={e => setReg(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Chrispin Banda" className={inputCls} />
              </div>

              {/* Email */}
              <div>
                <label className={labelCls}>Email Address *</label>
                <input type="email" value={reg.email} onChange={e => setReg(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com" className={inputCls} />
              </div>

              {/* Password */}
              <div>
                <label className={labelCls}>Password *</label>
                <div className="relative">
                  <input
                    type={reg.showPassword ? 'text' : 'password'}
                    value={reg.password}
                    onChange={e => setReg(p => ({ ...p, password: e.target.value }))}
                    placeholder="At least 6 characters"
                    className={`${inputCls} pr-10`}
                  />
                  <button type="button"
                    onClick={() => setReg(p => ({ ...p, showPassword: !p.showPassword }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none rounded"
                    aria-label="Toggle password">
                    {reg.showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Designation / Role */}
              <div>
                <label className={labelCls}>Your Designation *</label>
                <select value={reg.role} onChange={e => setRole(e.target.value)} className={inputCls}>
                  {REGISTER_ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              {/* ── LOCATION FIELDS — shown based on role ── */}

              {/* HQ roles: show a simple "HQ / National" notice */}
              {locationType === 'hq' && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-[11px] text-blue-700 dark:text-blue-300 font-semibold">
                  <span>🏛️</span>
                  <span>This designation is based at National Headquarters (HQ).</span>
                </div>
              )}

              {/* Region roles (Program Manager): Region only */}
              {(locationType === 'region' || locationType === 'district') && (
                <div>
                  <label className={labelCls}>
                    {locationType === 'region' ? 'Your Region *' : 'Region *'}
                  </label>
                  <select value={reg.region} onChange={e => setRegion(e.target.value)} className={inputCls}>
                    <option value="">— Select Region —</option>
                    {REGIONS.map(r => (
                      <option key={r} value={r}>{r} Region</option>
                    ))}
                  </select>
                </div>
              )}

              {/* District roles (TOT, DC): Region + District */}
              {locationType === 'district' && reg.region && (
                <div>
                  <label className={labelCls}>District *</label>
                  <select value={reg.district} onChange={e => setReg(p => ({ ...p, district: e.target.value }))} className={inputCls}>
                    <option value="">— Select District in {reg.region} Region —</option>
                    {availableDistricts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Summary badge — shows user exactly where they'll land */}
              {(reg.region || locationType === 'hq') && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 text-[11px] text-orange-700 dark:text-orange-300">
                  <span className="mt-0.5">📍</span>
                  <span>
                    {locationType === 'hq' && 'You will be assigned to National HQ.'}
                    {locationType === 'region' && reg.region && `You will be assigned to the ${reg.region} Region.`}
                    {locationType === 'district' && reg.region && !reg.district && `Select your district in ${reg.region} Region.`}
                    {locationType === 'district' && reg.district && `You will be placed in ${reg.district} District, ${reg.region} Region.`}
                  </span>
                </div>
              )}
            </div>

            {err && (
              <div className="mt-3 bg-red-500/10 text-red-600 p-2.5 border border-red-500/20 rounded-xl text-xs text-center font-semibold">{err}</div>
            )}

            <button onClick={createAccount} disabled={loading}
              className="w-full mt-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98] disabled:opacity-70 min-h-[44px]">
              {loading ? 'Submitting...' : 'Submit Registration'}
            </button>

            <div className="mt-5 text-center text-[11px] text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <button onClick={() => { setMode('login'); setErr(''); }}
                className="font-bold text-slate-900 dark:text-white hover:text-orange-500 transition-colors">
                Log In
              </button>
            </div>
          </div>
        )}

        {/* ── PENDING MODE ───────────────────────────────────────────────────── */}
        {mode === 'pending' && (
          <div className="flex flex-col items-center text-center gap-4 py-6">
            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-3xl">⏳</div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Account Submitted!</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Your registration has been received. The <strong>System Administrator</strong> will
              review and activate your account. You will be contacted once approved.
            </p>
            <button onClick={onClose}
              className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm">
              Got it
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
