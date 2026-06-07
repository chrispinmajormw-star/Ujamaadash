import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { User } from '../types';
import { api } from '../api';
import { DISTRICT_LIST } from '../data';
import { AfricaLogo, FInput, FSelect } from './SubComponents';

export interface LoginModalProps {
  onLogin: (u: User) => void;
  onClose: () => void;
  onRegister: (u: User) => void;
  users: User[];
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onClose, onRegister, users }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'pending'>('login');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [reg, setReg] = useState({ name: "", district: "", designation: "", email: "", school: "", cluster: "", password: "" });

  const doLogin = async () => {
    if (!email || !pass) { setErr("Please enter email and password"); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setLoading(false);
    try {
      const data = await api.post('/api/users/login', { email, password: pass });
      if (data.error) {
        setErr(data.error);
        return;
      }
      localStorage.setItem('token', data.token);
      onLogin(data.user);
    } catch (err) {
      setErr('Unable to connect to server. Please try again.');
    }
  };

  const createAccount = async () => {
    if (!reg.name || !reg.district || !reg.designation || !reg.email || !reg.password) { setErr("Please fill all mandatory fields"); return; }
    setLoading(true);
    try {
      const data = await api.post('/api/users/register', {
        name: reg.name,
        district: reg.district,
        email: reg.email,
        password: reg.password,
        role: 'viewer',
        avatar: reg.name.split(" ").map(x => x[0]).join("").toUpperCase(),
      });
      if (data.error) { 
        if (data.error.includes('not active')) {
          setErr('Your account is pending approval by the Administrator.');
        } else {
          setErr(data.error); 
        }
        return; 
      }
      setErr('');
      setMode('pending');
    } catch (err) {
      setErr('Unable to connect to server. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Blurred background overlay */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      
      {/* Glassmorphism Modal container */}
      <div className="relative w-full max-w-[420px] rounded-3xl bg-white/70 dark:bg-[#0f1623]/70 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-2xl overflow-hidden p-8 animate-fade-in-up">
        
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 transition-colors">
          <X size={18} />
        </button>

        {mode === 'login' ? (
          <div className="flex flex-col">
            <div className="flex justify-center mb-5">
               <AfricaLogo size={42} variant="full" />
            </div>
            
            <h2 className="text-2xl font-light text-center text-slate-900 dark:text-white mb-2">
              Welcome <span className="font-semibold">back!</span>
            </h2>
            <p className="text-[11.5px] text-center text-slate-600 dark:text-slate-300 mb-8 px-2 leading-relaxed">
              Sign in to access your dashboard, field reports, and national alignment
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email" 
                  className="w-full px-4 py-3 rounded-xl bg-white/40 dark:bg-black/30 border border-slate-300/50 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Password</label>
                <div className="relative">
                  <input 
                    type={showPass ? "text" : "password"} 
                    value={pass}
                    onChange={e => setPass(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full pl-4 pr-10 py-3 rounded-xl bg-white/40 dark:bg-black/30 border border-slate-300/50 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                     {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between px-1 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded text-orange-500 focus:ring-orange-500 focus:ring-offset-0 bg-white/50 border-slate-300 dark:border-slate-600" />
                  <span className="text-xs text-slate-600 dark:text-slate-300">Remember me</span>
                </label>
                <button className="text-xs text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors">
                  Forgot password?
                </button>
              </div>
            </div>

            {err && (
              <div className="mt-4 bg-red-500/10 text-red-600 border border-red-500/20 rounded-xl p-3 text-xs text-center font-semibold">
                {err}
              </div>
            )}

            <button 
              onClick={doLogin} 
              disabled={loading}
              className="w-full mt-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? "Signing In..." : "Log In"}
            </button>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-200 dark:bg-white/10"></div>
              <span className="text-[11px] text-slate-400">Or</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-white/10"></div>
            </div>

            <button 
              onClick={() => alert("Google Sign In is not configured.")}
              className="w-full py-3 rounded-xl bg-white/40 dark:bg-white/5 border border-slate-300/50 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 text-slate-800 dark:text-white font-semibold text-xs transition-all flex items-center justify-center gap-2"
            >
               <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                 <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                 <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                 <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                 <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
               </svg>
               Sign In with Google
            </button>

            <div className="mt-8 text-center text-[11px] text-slate-500 dark:text-slate-400">
              Don't have an account? <button onClick={() => setMode('register')} className="font-bold text-slate-900 dark:text-white hover:text-orange-500 transition-colors">Sign Up</button>
            </div>
          </div>
        ) : mode === 'register' ? (
          <div className="flex flex-col h-full max-h-[70vh]">
            <div className="flex justify-center mb-4">
               <AfricaLogo size={32} variant="full" />
            </div>
            <h2 className="text-xl font-light text-center text-slate-900 dark:text-white mb-6">
              Create an <span className="font-semibold">account</span>
            </h2>
            
            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              <FInput label="Full Name *" value={reg.name} onChange={e => setReg({ ...reg, name: e.target.value })} />
              <FSelect label="Malawian District Match *" value={reg.district} onChange={e => setReg({ ...reg, district: e.target.value })}>
                <option value="">Choose District...</option>
                {DISTRICT_LIST.map(d => <option key={d}>{d}</option>)}
              </FSelect>
              <FInput label="Designation *" placeholder="e.g. Teacher, TOT, DC" value={reg.designation} onChange={e => setReg({ ...reg, designation: e.target.value })} />
              <FInput label="Email address *" type="email" value={reg.email} onChange={e => setReg({ ...reg, email: e.target.value })} />
              <FInput label="Associated School Hub" placeholder="e.g. Mbayani Primary" value={reg.school} onChange={e => setReg({ ...reg, school: e.target.value })} />
              <FInput label="Current Password *" type="password" value={reg.password} onChange={e => setReg({ ...reg, password: e.target.value })} />
              {err && (
                <div className="bg-red-500/10 text-red-600 p-2 border border-red-500/20 rounded text-xs text-center font-semibold">
                  {err}
                </div>
              )}
            </div>

            <button 
              onClick={createAccount}
              className="w-full mt-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98]"
            >
              Sign Up
            </button>

            <div className="mt-6 text-center text-[11px] text-slate-500 dark:text-slate-400">
              Already have an account? <button onClick={() => { setMode('login'); setErr(''); }} className="font-bold text-slate-900 dark:text-white hover:text-orange-500 transition-colors">Log In</button>
            </div>
          </div>
        ) : mode === 'pending' ? (
          <div className="flex flex-col items-center text-center gap-4 py-6">
            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-3xl">⏳</div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Account Submitted!</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Your account is <strong>pending approval</strong> by the National Administrator. You will be contacted once your account is activated.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm"
            >
              Got it
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
