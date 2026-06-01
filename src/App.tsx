/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  Map,
  Network,
  MapPin,
  GraduationCap,
  BookOpen,
  BarChart2,
  Users,
  TrendingUp,
  Info,
  Shield,
  Star,
  Settings,
  Bell,
  LogOut,
  X,
  Plus,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  Search,
  Check,
  Edit2,
  AlertTriangle,
  Phone,
  Mail,
  Moon,
  Sun,
  Lock,
  Compass,
  Layers,
  Heart,
  Sliders,
  Calendar,
  ListTodo,
  Play,
  Eye,
  EyeOff
} from 'lucide-react';

import { User, Report, Cluster, District, Training, Session } from './types';
import {
  ROLE_CFG,
  can,
  USERS_INIT,
  REPORTS_INIT,
  CLUSTERS,
  DISTRICTS,
  DISTRICT_INFO,
  HIM_SESSIONS,
  GESD_SESSIONS,
  SESSION_LISTS,
  DISTRICT_LIST,
  TOP15
} from './data';

import {
  Badge,
  Pill,
  ProgBar,
  Card,
  Kicker,
  Btn,
  FInput,
  FSelect,
  FArea,
  Modal,
  Toast,
  StatCard,
  TH,
  FilterBar,
  AfricaLogo,
  OR,
  OR_D,
  OR_PALE
} from './components/SubComponents';

import { Dashboard } from './components/Dashboard';
import { ReportsPage, getReportRecipient } from './components/ReportsPage';
import { MapsPage } from './components/MapsPage';
import { CurriculumPage } from './components/CurriculumPage';
import { ImpactPage } from './components/ImpactPage';
import { SettingsPage } from './components/SettingsPage';
import { CalendarPage } from './components/CalendarPage';
import { AnalyticsPage } from './components/AnalyticsPage';
import { TasksPage } from './components/TasksPage';
import { safeStorage } from './utils/storage';

// ─── LOGIN PANEL ─────────────────────────────
interface LoginModalProps {
  onLogin: (u: User) => void;
  onClose: () => void;
  onRegister: (u: User) => void;
  users: User[];
}

const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onClose, onRegister, users }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
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
    const u = users.find(x => x.email === email && x.password === pass);
    if (!u) { setErr("Invalid email or password"); return; }
    onLogin(u);
  };

  const createAccount = () => {
    if (!reg.name || !reg.district || !reg.designation || !reg.email || !reg.password) { setErr("Please fill all mandatory fields"); return; }
    const exists = users.find(u => u.email === reg.email);
    if (exists) { setErr("Account already exists"); return; }
    const newUser: User = {
      id: Date.now().toString(),
      name: reg.name,
      district: reg.district,
      email: reg.email,
      password: reg.password,
      role: 'viewer',
      avatar: reg.name.split(" ").map(x => x[0]).join("").toUpperCase(),
      status: 'active'
    };
    onRegister(newUser);
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
        ) : (
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
        )}
      </div>
    </div>
  );
};

// ─── SAFE REPORT CASE SUBMISSION ─────────────
interface SubmitReportProps {
  user: User | null;
  onSubmit: (r: any) => void;
  showToast: (msg: string) => void;
}
const SubmitReport: React.FC<SubmitReportProps> = ({ user, onSubmit, showToast }) => {
  const isPublic = !user;
  const assignedCluster = user?.role === "tot" ? CLUSTERS.find(c => c.id === user.clusterId) : null;
  
  const defaultFields = isPublic
    ? { school: "", district: "", zone: "", boys: "", girls: "", curriculum: "Harassment or intimidation", session: "", challenges: "", success: "" }
    : { school: "", district: user?.district || "", zone: assignedCluster?.name || "", boys: "", girls: "", curriculum: "HIM", session: "", challenges: "", success: "" };

  const [f, setF] = useState(defaultFields);
  const [done, setDone] = useState(false);
  const s = (k: string) => (e: any) => setF(p => ({ ...p, [k]: e.target.value }));

  const submitFile = () => {
    if (isPublic) {
      if (!f.school || !f.district || !f.session) { showToast("⚠️ Fill in coordinates for the case"); return; }
      onSubmit({ ...f, boys: 0, girls: 0, zone: f.zone || "Public align", status: "pending", submitted_by: "Public report channel", submitted_at: new Date().toISOString().split("T")[0] });
      setDone(true);
      showToast("Case report sent securely");
      return;
    }
    if (!f.school || !f.district || !f.zone || !f.session) { showToast("⚠️ Fill in mandatory fields"); return; }
    onSubmit({ ...f, boys: parseInt(f.boys) || 0, girls: parseInt(f.girls) || 0, status: "pending", submitted_by: user.name, submitted_at: new Date().toISOString().split("T")[0] });
    setDone(true);
    showToast("✅ Report submitted for DC approval");
  };

  if (done) return (
    <div className="max-w-md mx-auto text-center py-10 space-y-4">
      <span className="text-5xl block">✅</span>
      <h2 className="text-xl font-bold text-black dark:text-white">Report Logged Successfully</h2>
      <p className="text-xs sm:text-sm text-black dark:text-white opacity-80 leading-relaxed">
        {isPublic ? "Thank you. Confidential caseworkers will align support immediately." : "Aligned under pending review states."}
      </p>
      <div className="flex gap-2 justify-center">
        <Btn onClick={() => { setF(defaultFields); setDone(false); }}>Add New Entry</Btn>
        <Btn variant="secondary" onClick={() => setDone(false)}>Dismiss</Btn>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in-up">
      <div>
        <Kicker text={isPublic ? "Case Submission Portal" : "Primary Field Reporting"} />
        <h1 className="text-base font-bold text-black dark:text-white m-0">
          {isPublic ? "Submit a Case" : "Submit Session Record"}
        </h1>
        <p className="text-xs text-black dark:text-white opacity-80 mt-1 m-0">
          {isPublic ? "Report SGBV, harassment, defilement, or child protection concerns securely." : "Submit certified teacher checklist records."}
        </p>
      </div>

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FInput label={isPublic ? "Incident Location *" : "School Name *"} placeholder="e.g. Kawale Primary" value={f.school} onChange={s("school")} />
          <FSelect label="Malawian District *" value={f.district} onChange={s("district")}>
            <option value="">Select District...</option>
            {DISTRICT_LIST.map(d => <option key={d}>{d}</option>)}
          </FSelect>
        </div>

        {isPublic ? (
          <>
            <FSelect label="Incident Nature *" value={f.curriculum} onChange={s("curriculum")}>
              {["Harassment or intimidation", "Sexual assault concern", "Child abuse / defilement", "Transactional coercion", "Threats or stalking", "Forced relationship", "Protection referral need", "Other SGBV concern"].map(o => <option key={o}>{o}</option>)}
            </FSelect>
            <FSelect label="Affected Party / Persona" value={f.zone} onChange={s("zone")}>
              <option value="">Prefer not to say</option>
              <option>Girl learners</option>
              <option>Boy learners</option>
              <option>Assigned Teacher</option>
              <option>Community Mother</option>
            </FSelect>
            <FArea label="SGBV Case details *" placeholder="Provide details safely. Do not post names if insecure." value={f.session} onChange={s("session")} />
            <FArea label="Follow up channel details (Optional)" placeholder="Preferred contact way" value={f.challenges} onChange={s("challenges")} />
          </>
        ) : (
          <>
            <FInput label="Education Hub / Zone *" placeholder="e.g. Kawale Area Zone" value={f.zone} onChange={s("zone")} disabled={!!assignedCluster} />
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Boys Present *" type="number" value={f.boys} onChange={s("boys")} />
              <FInput label="Girls Present *" type="number" value={f.girls} onChange={s("girls")} />
            </div>
            <FSelect label="Active Curriculum Content *" value={f.curriculum} onChange={s("curriculum")}>
              <option value="HIM">HIM — Hero In Me (Boys)</option>
              <option value="GESD">GESD — Girls Empowerment</option>
              <option value="Combined">Topic 6: Combined session</option>
            </FSelect>
            <FSelect label="Topic / Session Name *" value={f.session} onChange={s("session")}>
              <option value="">Select Lesson...</option>
              {(SESSION_LISTS[f.curriculum] || []).map(o => <option key={o}>{o}</option>)}
            </FSelect>
            <FArea label="Faced Challenges" placeholder="Resources required or bottlenecks" value={f.challenges} onChange={s("challenges")} />
            <FArea label="Memorable Success highlights" placeholder="Describe participant engagement" value={f.success} onChange={s("success")} />
          </>
        )}

        <div className="flex gap-2 justify-end pt-3">
          <Btn variant="secondary" onClick={() => setF(defaultFields)}>Reset Sheet</Btn>
          <Btn onClick={submitFile}>Send Record</Btn>
        </div>
      </Card>
    </div>
  );
};

// ─── COHORTS / CERTIFIED TRAININGS ────────────
const TRAININGS: Training[] = [
  { name: "ETT Cohort 12 — Lilongwe Urban", loc: "Lilongwe", venue: "Lilongwe Teachers College", trainers: "Grace Kamwendo, Peter Banda", dates: "28 Apr — 3 May 2026", pax: 32, day: 4, s: 'active' },
  { name: "ETT Cohort 13 — Blantyre South", loc: "Blantyre", venue: "Soche Community Centre", trainers: "Mary Chirwa, James Phiri", dates: "29 Apr — 4 May 2026", pax: 28, day: 3, s: 'active' },
  { name: "ETT Cohort 14 — Mzimba North", loc: "Mzimba", venue: "Mzimba District Education Office", trainers: "Agnes Nyirenda, Joseph Mhango", dates: "5 May — 10 May 2026", pax: 25, day: null, s: 'upcoming' },
  { name: "ETT Cohort 15 — Zomba Rural", loc: "Zomba", venue: "Zomba Rural District Hall", trainers: "Esther Mzumara, David Mkandawire", dates: "12 May — 17 May 2026", pax: 30, day: null, s: 'upcoming' },
  { name: "ETT Cohort 11 — Karonga CDSS", loc: "Karonga", venue: "Karonga Teachers Hub", trainers: "Grace Kamwendo, Fatsani Ngoma", dates: "14 Apr — 19 Apr 2026", pax: 26, day: 6, s: 'completed' },
  { name: "ETT Cohort 10 — Mangochi CDSS", loc: "Mangochi", venue: "Mangochi Centre", trainers: "Mary Chirwa, Peter Banda", dates: "7 Apr — 12 Apr 2026", pax: 34, day: 6, s: 'completed' },
];
const TrainingsPage: React.FC = () => {
  const [filt, setFilt] = useState<string>("all");
  const visible = filt === "all" ? TRAININGS : TRAININGS.filter(t => t.s === filt);
  return (
    <div className="space-y-5 animate-fade-in-up">
      <div>
        <Kicker text="Capacity Engineering" />
        <h1 className="text-base font-bold text-black dark:text-white m-0">ETT Certified Trainings</h1>
        <p className="text-xs text-black dark:text-white opacity-80 mt-1 m-0">Certify and track teachers, community leaders, and safety champions.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={<Play size={18} className="text-blue-500" />} label="Active Cohorts" value={2} />
        <StatCard icon={<Calendar size={18} className="text-amber-500" />} label="Upcoming Projects" value={2} color="#d97706" />
        <StatCard icon={<Check size={18} className="text-emerald-500" />} label="Completed Cycles" value={2} color="#059669" />
      </div>

      <FilterBar options={["all", "active", "upcoming", "completed"].map(x => ({ v: x, l: x.toUpperCase() }))} active={filt} onChange={setFilt} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visible.map((t, idx) => {
          const pct = t.s === "completed" ? 100 : t.s === "upcoming" ? 0 : Math.round(((t.day || 1) / 6)*100);
          return (
            <Card key={idx} className="flex flex-col justify-between">
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-sm font-bold text-black dark:text-white m-0">{t.name}</h3>
                  <Badge text={t.s} className="uppercase shrink-0 text-[10px]" />
                </div>
                <p className="text-xs text-slate-400">📅 {t.dates} · pax: {t.pax} teachers</p>
                <p className="text-xs text-slate-500 m-0">🏫 Venue: {t.venue} · Lead: {t.trainers}</p>
              </div>

              {t.s !== "upcoming" && (
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{t.s === "completed" ? "Certified Cycle" : `Active Day ${t.day} of 6`}</span>
                    <span>{pct}% Completed</span>
                  </div>
                  <ProgBar pct={pct} />
                  <div className="flex gap-1 pt-1">
                    {Array.from({ length: 6 }).map((_, i) => {
                      const n = i + 1;
                      const done = t.s === "completed" || n < (t.day || 1);
                      const isToday = t.s === "active" && n === t.day;
                      return (
                        <span
                          key={n}
                          className={`w-6 h-6 text-[10px] rounded-full flex items-center justify-center font-bold ${
                            done ? 'bg-orange-500 text-white' : isToday ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          }`}
                        >
                          {n}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ─── ETT PROTOCOLS VIEW ──────────────────────
const ETTPage: React.FC = () => (
  <div className="space-y-6 max-w-4xl mx-auto animate-fade-in-up">
    <div>
      <Kicker text="Standard Operating Procedures" />
      <h1 className="text-base font-bold text-black dark:text-white m-0">ETT Standards</h1>
      <p className="text-xs text-black dark:text-white opacity-80 mt-1 m-0">Governance parameters mapping safety, code of conduct, and reporting timelines.</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[
        { icon: <Shield className="text-orange-500" size={24} />, title: "Prevent Violence", text: "Provide aged-appropriate safety toolkits explicitly targeted to mitigate school violence." },
        { icon: <Network className="text-orange-500" size={24} />, title: "Linkage pathways", text: "Construct trusted adult and health pathway loops immediately on GBV disclosure." },
        { icon: <Compass className="text-orange-500" size={24} />, title: "Cluster Delivery", text: "Consolidate resources under local cluster hubs to ensure rural learners receive instruction." }
      ].map((item) => (
        <Card key={item.title} className="p-5 space-y-2">
          <div className="h-9 flex items-center">{item.icon}</div>
          <h4 className="text-xs sm:text-sm font-bold text-black dark:text-white m-0">{item.title}</h4>
          <p className="text-[11.5px] leading-relaxed text-black dark:text-white opacity-80 m-0">{item.text}</p>
        </Card>
      ))}
    </div>

    <Card className="p-6">
      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-widest mb-4">6-Step Classroom Protocols</h3>
      <div className="space-y-3">
        {[
          ["1", "Community engagement", "Sensitize guardians and headmasters regarding empowerment transformations before launching ETT groups."],
          ["2", "Interactive lesson schedules", "Incorporate GESD and HIM classes during school safety times in separate, secure environments."],
          ["3", "Aged-targeted class models", "Adapt modules into 45-minute lesson layouts. Minimum 6 verified cycles per cohort."],
          ["4", "Immediate disclosure mapping", "Always review referral channels following the 'Breaking the Silence' modules."],
          ["5", "District authorities alignment", "Form safety partnerships with VSU Police and Child protection officers in the clusters."],
          ["6", "Field file logging", "Always export reports to the ETT Portal for District Coordinator verification."]
        ].map(([n, title, desc]) => (
          <div key={n} className="flex gap-4 p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="w-7 h-7 bg-orange-500 text-white rounded-full font-bold text-xs shrink-0 flex items-center justify-center">
              {n}
            </span>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-black dark:text-white mb-1">{title}</h4>
              <p className="text-[11.5px] leading-relaxed text-black dark:text-white opacity-80 m-0">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

// ─── DISTRICTS ENHANCED VIEW ─────────────────
interface DistrictsPageProps {
  user: User | null;
  onOpenMap: (t: { type: string; name: string; ts: number }) => void;
}
const DistrictsPage: React.FC<DistrictsPageProps> = ({ user, onOpenMap }) => {
  const [region, setRegion] = useState("all");
  const filtered = DISTRICTS.filter(d => region === "all" || d.r === region);
  const rcColors: Record<string, { c: string; bg: string }> = {
    Northern: { c: "#1e40af", bg: "#dbeafe" },
    Central: { c: OR_D, bg: "#fff1e6" },
    Southern: { c: "#065f46", bg: "#d1fae5" }
  };
  return (
    <div className="space-y-5 animate-fade-in-up">
      <div>
        <Kicker text="Demographic Coverage" />
        <h1 className="text-base font-bold text-black dark:text-white">Implementing Districts</h1>
        <p className="text-xs text-black dark:text-white opacity-80">Review 15 active districts and 13 future development regions across Malawi.</p>
      </div>

      <Card className="grid grid-cols-2 md:grid-cols-4 gap-3 !p-4">
        {[
          ["Active Spheres", "15 Districts"],
          ["Training Coverage", "54% Target reached"],
          ["Certified TOTs Certified", "665 Certs"],
          ["Teachers trained", `${DISTRICTS.reduce((acc, d) => acc + d.teachersTrained, 0).toLocaleString()} Trained`]
        ].map(([l, v]) => (
          <div key={l} className="space-y-1">
            <div className="text-[10px] text-black dark:text-white opacity-80 uppercase tracking-wide">{l}</div>
            <div className="text-base font-bold text-black dark:text-white">{v}</div>
          </div>
        ))}
      </Card>

      <FilterBar
        options={["all", "Northern", "Central", "Southern"].map(o => ({ v: o, l: o === "all" ? "ALL REGIONS" : `${o.toUpperCase()}` }))}
        active={region}
        onChange={setRegion}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(d => {
          const isActive = d.s === "Active";
          const pct = d.schools > 0 ? Math.round((d.cov / d.schools)*100) : 0;
          return (
            <div
              key={d.name}
              onClick={() => onOpenMap({ type: "district", name: d.name, ts: Date.now() })}
              className={`p-4 rounded-lg border cursor-pointer transition-colors bg-white dark:bg-[#0f1623] text-black dark:text-white ${
                isActive ? 'border-orange-300 dark:border-orange-900/50' : 'border-neutral-200 dark:border-slate-800 opacity-75'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-sm font-bold text-black dark:text-white m-0">{d.name}</h3>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold mt-1 inline-block`} style={{ color: rcColors[d.r]?.c || '#4b5563', backgroundColor: rcColors[d.r]?.bg || '#f3f4f6' }}>
                    {d.r}
                  </span>
                </div>
                <Badge text={isActive ? "Active Hub" : "Planned Expansion"} bg={isActive ? "rgba(232,93,4,0.12)" : "rgba(100,116,139,0.1)"} color={isActive ? OR_D : "#64748b"} />
              </div>

              {isActive ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white dark:bg-[#0f1623] border border-orange-200 dark:border-orange-900/40 p-2 rounded-lg">
                      <div className="text-[9px] text-orange-600 font-semibold mb-0.5">TOTs Certified</div>
                      <div className="text-sm font-bold text-black dark:text-white">{d.tots}</div>
                    </div>
                    <div className="bg-white dark:bg-[#0f1623] border border-orange-200 dark:border-orange-900/40 p-2 rounded-lg">
                      <div className="text-[9px] text-orange-600 font-semibold mb-0.5">Teachers Trained</div>
                      <div className="text-sm font-bold text-black dark:text-white">{d.teachersTrained}</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-black dark:text-white opacity-80 font-medium">
                      <span>Schools coverage</span>
                      <span>{d.cov}/{d.schools} ({pct}%)</span>
                    </div>
                    <ProgBar pct={pct} />
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-[#0f1623] border border-neutral-200 dark:border-slate-700 rounded-lg p-4 text-center text-xs text-black dark:text-white opacity-60 font-medium italic">
                  Expansion assessment planned.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};


// ─── USER DIRECTORY ──────────────────────────
interface UsersPageProps {
  user: User;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  showToast: (msg: string) => void;
}
const UsersPage: React.FC<UsersPageProps> = ({ user: cu, users, setUsers, showToast }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [filt, setFilt] = useState("all");
  const [search, setSearch] = useState("");
  const [nf, setNf] = useState({ first: "", last: "", email: "", role: "data_entry" as any, district: "" });

  if (cu.role !== 'admin') {
    return <div className="p-12 text-center text-slate-400 font-semibold italic">Restricted to Central National Admin only.</div>;
  }

  const sn = (k: string) => (e: any) => setNf(p => ({ ...p, [k]: e.target.value }));

  const addUser = () => {
    if (!nf.first || !nf.last || !nf.email) { showToast("⚠️ Fill in user coordinates"); return; }
    const newUser: User = {
      id: Date.now().toString(),
      email: nf.email,
      password: "temp123",
      role: nf.role,
      name: `${nf.first} ${nf.last}`,
      district: nf.district || null,
      avatar: (nf.first[0] + nf.last[0]).toUpperCase(),
      status: 'pending'
    };
    setUsers(p => [newUser, ...p]);
    setShowAdd(false);
    setNf({ first: "", last: "", email: "", role: "data_entry", district: "" });
    showToast(`✅ Profile for ${newUser.name} ready — awaiting activation`);
  };

  const visible = users.filter(u => {
    if (filt !== "all" && u.role !== filt) return false;
    const q = search.toLowerCase();
    if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex justify-between items-end">
        <div>
          <Kicker text="Staff Alignment" />
          <h1 className="text-base font-bold text-black dark:text-white m-0">Personnel Directory</h1>
          <p className="text-xs text-black dark:text-white opacity-80 mt-1 m-0">Deploy district coordinators, certified TOTs, and alignment advocates.</p>
        </div>
        <Btn onClick={() => setShowAdd(true)}><Plus size={14} className="inline mr-1" /> Add User</Btn>
      </div>

      <Card>
        <FilterBar
          options={["all", "admin", "tot", "data_entry", "district_coordinator"].map(x => ({
            v: x,
            l: x === 'all' ? 'ALL STAFF' : ROLE_CFG[x as keyof typeof ROLE_CFG]?.label.toUpperCase() || x
          }))}
          active={filt}
          onChange={setFilt}
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search staff name..."
        />

        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800/60">
          <table className="w-full border-collapse text-left text-xs">
            <TH cols={["Consultant details", "Certified Position", "Region Boundary", "Security State", "Action Panels"]} />
            <tbody>
              {visible.map((u, i) => {
                const config = ROLE_CFG[u.role as keyof typeof ROLE_CFG];
                return (
                  <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800/40">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-orange-600">
                          {u.avatar}
                        </span>
                        <div>
                          <div className="font-bold text-black dark:text-white">{u.name}</div>
                          <div className="text-[10.5px] text-slate-400 mt-0.5">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge text={config?.label || u.role} color={config?.color} bg={config?.bg} />
                    </td>
                    <td className="p-3 text-slate-500 font-semibold">{u.district || "National alignment"}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-xs leading-normal">
                        <span className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {u.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1.5">
                        {u.status === "pending" && (
                          <Btn size="sm" variant="success" onClick={() => {
                            setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: "active" as const } : x));
                            showToast(`Activated ${u.name}`);
                          }}>
                            Activate
                          </Btn>
                        )}
                        {u.status === "active" && u.id !== cu.id && (
                          <Btn size="sm" variant="secondary" className="text-red-600 bg-red-50 dark:bg-red-950/20" onClick={() => {
                            setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: "pending" as const } : x));
                            showToast(`Suspended profile credentials`);
                          }}>
                            Suspend
                          </Btn>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {showAdd && (
        <Modal title="Deploy New ETT Consultant Profile" onClose={() => setShowAdd(false)}>
          <div className="grid grid-cols-2 gap-3">
            <FInput label="First Name *" value={nf.first} onChange={sn("first")} />
            <FInput label="Last Name *" value={nf.last} onChange={sn("last")} />
          </div>
          <FInput label="Email address *" type="email" value={nf.email} onChange={sn("email")} placeholder="champion@ujamaa.mw" />
          <FSelect label="Certified ETT Position *" value={nf.role} onChange={sn("role")}>
            <option value="tot">Trainer of Trainers (TOT)</option>
            <option value="district_coordinator">District Coordinator (DC)</option>
            <option value="data_entry">Data Entry Officer</option>
            <option value="viewer">Basic View Inspector</option>
          </FSelect>
          <FSelect label="Assigned Region" value={nf.district} onChange={sn("district")}>
            <option value="">Choose District (None/National)</option>
            {DISTRICT_LIST.map(d => <option key={d}>{d}</option>)}
          </FSelect>
          <div className="flex gap-2 justify-end pt-3">
            <Btn variant="secondary" size="sm" onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn onClick={addUser} size="sm">Deploy Profile</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

const PAGE_LABELS: Record<string, string> = {
  dashboard: "ETT ScaleUp Program",
  submit: "Submit a Case",
  reports: "Reports",
  my_reports: "My Reports",
  maps: "Clusters Map",
  districts: "Districts",
  trainings: "Trainings",
  curriculum: "Curriculum",
  ett: "ETT Standards",
  analytics: "Analytics",
  users: "Staff Directory",
  impact: "Impact Stories",
  calendar: "Calendar",
  tasks: "Tasks",
  settings: "Settings",
};

// ─── APPS MAIN CONTAINER / CORE ENGINE ────────
export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = safeStorage.getItem("ett_theme");
    return saved !== "light";
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = safeStorage.getItem("ett_curr_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [reports, setReports] = useState<Report[]>(() => {
    const saved = safeStorage.getItem("ett_reports");
    return saved ? JSON.parse(saved) : REPORTS_INIT;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = safeStorage.getItem("ett_users");
    return saved ? JSON.parse(saved) : USERS_INIT;
  });

  const [page, setPage] = useState<string>("dashboard");
  const [toast, setToast] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mapFocus, setMapFocus] = useState<any>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [forwardModal, setForwardModal] = useState<Report | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3800);
  }, []);

  // Synchronize dynamic lists to storage
  useEffect(() => {
    safeStorage.setItem("ett_reports", JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    safeStorage.setItem("ett_users", JSON.stringify(users));
  }, [users]);

  // Synchronize authenticated user to storage
  useEffect(() => {
    if (user) {
      safeStorage.setItem("ett_curr_user", JSON.stringify(user));
    } else {
      safeStorage.removeItem("ett_curr_user");
    }
  }, [user]);

  // Synchronize Theme toggles strictly
  useEffect(() => {
    const rootEl = document.documentElement;
    if (darkMode) {
      rootEl.classList.add("dark");
      safeStorage.setItem("ett_theme", "dark");
    } else {
      rootEl.classList.remove("dark");
      safeStorage.setItem("ett_theme", "light");
    }
  }, [darkMode]);

  const addReport = (r: any) => {
    const workflow = getReportRecipient(user?.role || "viewer");
    const newReport: Report = {
      id: Date.now(),
      ...r,
      sentTo: workflow.sendTo,
      sentToLabel: workflow.label,
      workflow_status: "sent",
      submitted_role: user?.role || "public",
    };
    setReports(p => [newReport, ...p]);
    if (user && can(user.role, "approveReport")) {
      showToast("📋 New file logged under current DC oversight reviews.");
    } else if (workflow.sendTo) {
      showToast(`✅ File logged and transmitted to the ${workflow.label}`);
    }
  };

  const updateStatus = (id: number, status: 'approved' | 'rejected' | 'forwarded') => {
    setReports(p => p.map(r => r.id === id ? { ...r, status } : r));
  };

  // DC Forward file operation
  const forwardReport = (id: number) => {
    setReports(p => p.map(r => r.id === id ? {
      ...r,
      status: "forwarded" as const,
      sentTo: "admin",
      sentToLabel: "National Admin"
    } : r));
    showToast("📨 File forwarded successfully to the National Admin");
    setForwardModal(null);
  };

  // Data Officer inline edit persistence
  const saveEditedReport = (updated: Report) => {
    setReports(p => p.map(r => r.id === updated.id ? { ...r, ...updated } : r));
    showToast("💾 File record updated successfully");
  };

  const openMapTarget = (target: any) => {
    setMapFocus(target);
    setPage("maps");
  };

  const isStaff = user && ["admin", "district_coordinator", "data_entry", "tot"].includes(user.role);

  const pendingCount = user && can(user.role, "approveReport")
    ? reports.filter(r => r.status === "pending" && (user.role === "district_coordinator" ? r.district === user.district : true)).length
    : 0;

  const renderPageContent = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard user={user} reports={reports} setPage={setPage} darkMode={darkMode} />;
      case "submit":
        return <SubmitReport user={user} onSubmit={addReport} showToast={showToast} />;
      case "reports":
      case "my_reports":
        return isStaff ? (
          <ReportsPage
            user={user}
            reports={reports}
            onUpdateStatus={updateStatus}
            showToast={showToast}
            onEditReport={setEditingReport}
            onForwardReport={setForwardModal}
          />
        ) : null;
      case "maps":
        return <MapsPage setPage={setPage} user={user} darkMode={darkMode} />;
      case "districts":
        return <DistrictsPage user={user} onOpenMap={openMapTarget} />;
      case "trainings":
        return <TrainingsPage />;
      case "curriculum":
        return <CurriculumPage />;
      case "ett":
        return <ETTPage />;
      case "analytics":
        return <AnalyticsPage reports={reports} />;
      case "users":
        return user?.role === 'admin' ? <UsersPage user={user} users={users} setUsers={setUsers} showToast={showToast} /> : <div className="p-12 text-center text-slate-400 font-semibold italic">Restricted to National Admin only.</div>;
      case "impact":
        return <ImpactPage reports={reports} showToast={showToast} user={user} />;
      case "calendar":
        return user ? <CalendarPage user={user} /> : <div className="p-12 text-center text-slate-400 font-semibold italic">Sign in to view the Calendar.</div>;
      case "tasks":
        return user ? <TasksPage user={user} /> : <div className="p-12 text-center text-slate-400 font-semibold italic">Sign in to view Tasks.</div>;
      case "settings":
        return <SettingsPage user={user} darkMode={darkMode} setDarkMode={setDarkMode} showToast={showToast} reportsCount={reports.length} />;
      default:
        return <Dashboard user={user} reports={reports} setPage={setPage} darkMode={darkMode} />;
    }
  };

  // Unified nav — same for all users. protected=true items redirect to login if not signed in.
  const PROTECTED_PAGES = ["reports", "calendar", "tasks", "analytics", "users"];
  const activeNavGroups = [
    {
      title: "Dashboard",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "maps", label: "Clusters map", icon: Map },
        { id: "districts", label: "Districts", icon: MapPin },
        { id: "trainings", label: "Trainings", icon: GraduationCap },
        { id: "curriculum", label: "Curriculum", icon: BookOpen },
        { id: "ett", label: "ETT standards", icon: Layers }
      ]
    },
    {
      title: "Planning",
      items: [
        { id: "calendar", label: "Calendar", icon: Calendar, protected: true },
        { id: "tasks", label: "Tasks", icon: ListTodo, protected: true }
      ]
    },
    {
      title: "Reports",
      items: [
        { id: "submit", label: "Submit a Case", icon: FilePlus },
        { id: "reports", label: "Reports", icon: FileText, protected: true }
      ]
    },
    {
      title: "More",
      items: [
        { id: "analytics", label: "Analytics", icon: BarChart2 },
        { id: "impact", label: "Impact stories", icon: Heart },
        ...(user?.role === 'admin' ? [{ id: "users", label: "Staff", icon: Users, protected: true }] : []),
        { id: "settings", label: "Settings", icon: Settings }
      ]
    }
  ];

  const renderNav = (onNavigate?: () => void) => (
    activeNavGroups.map(group => (
      <div key={group.title} className="space-y-0.5 mb-3">
        <div className="text-[10px] text-black dark:text-white font-semibold uppercase tracking-wide px-2 mb-1 opacity-60">{group.title}</div>
        {group.items.map((item: any) => {
          const Icon = item.icon;
          const isActive = page === item.id;
          const isLocked = item.protected && !user;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (isLocked) { setIsLoginModalOpen(true); onNavigate?.(); return; }
                setPage(item.id); onNavigate?.();
              }}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition ${
                isActive
                  ? 'bg-orange-50 text-orange-600 dark:bg-orange-600/15 dark:text-orange-400'
                  : isLocked
                  ? 'text-slate-400 dark:text-slate-600 hover:bg-orange-50 hover:text-orange-400 dark:hover:bg-slate-800'
                  : 'text-black hover:bg-orange-50 hover:text-orange-600 dark:text-white dark:hover:bg-slate-800 dark:hover:text-orange-400'
              }`}
              title={isLocked ? "Sign in to access" : undefined}
            >
              <Icon size={14} />
              <span>{item.label}</span>
              {isLocked && <Lock size={10} className="ml-auto opacity-40" />}
            </button>
          );
        })}
      </div>
    ))
  );

  return (
    <>
      <div className="h-screen flex overflow-hidden bg-white dark:bg-[#0f1623] text-black dark:text-white transition-colors">
        <AnimatePresence>
          {sidebarOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black z-30 md:hidden"
                  />
                  <motion.aside
                    initial={{ x: -224 }}
                    animate={{ x: 0 }}
                    exit={{ x: -224 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                    className="fixed top-0 bottom-0 left-0 w-56 bg-white dark:bg-[#0f1623] border-r border-neutral-200 dark:border-slate-800 z-40 p-3 flex flex-col md:hidden shadow-lg"
                  >
                    <div className="flex justify-between items-center pb-3 mb-2 border-b border-neutral-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <AfricaLogo size={22} />
                        <span className="font-bold text-sm text-black dark:text-white">Ujamaa Dashboard</span>
                      </div>
                      <button type="button" onClick={() => setSidebarOpen(false)} className="text-black dark:text-white opacity-60 hover:opacity-100">
                        <X size={16} />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">{renderNav(() => setSidebarOpen(false))}</div>
                    <div className="pt-2 border-t border-neutral-200 dark:border-slate-800 text-[10px] text-black dark:text-white opacity-60">
                      Helpline <b className="text-orange-600 dark:text-orange-400">116</b> · VSU <b className="text-orange-600 dark:text-orange-400">997</b>
                    </div>
                  </motion.aside>
                </>
              )}
            </AnimatePresence>

            <aside className="hidden md:flex w-56 shrink-0 flex-col bg-white dark:bg-[#0f1623] border-r border-neutral-200 dark:border-slate-800">
              <div className="h-12 flex items-center gap-2 px-3 border-b border-neutral-200 dark:border-slate-800 shrink-0">
                <AfricaLogo size={22} />
                <span className="font-bold text-sm text-black dark:text-white truncate">Ujamaa Dashboard</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2">{renderNav()}</div>
              <div className="p-3 border-t border-neutral-200 dark:border-slate-800 text-[10px] text-black dark:text-white opacity-60 shrink-0">
                Helpline <b className="text-orange-600 dark:text-orange-400">116</b> · VSU <b className="text-orange-600 dark:text-orange-400">997</b>
              </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0f1623]">
              <header className="h-12 shrink-0 flex items-center justify-between gap-3 px-3 border-b border-neutral-200 dark:border-slate-800 bg-white dark:bg-[#0f1623]">
                <div className="flex items-center gap-2 min-w-0">
                  <button
                    type="button"
                    onClick={() => setPage("dashboard")}
                    className="p-1.5 rounded-md text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-slate-800 mr-1"
                    aria-label="Back to dashboard"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    className="md:hidden p-1.5 rounded-md border border-neutral-200 dark:border-slate-700 text-black dark:text-white"
                    aria-label="Open menu"
                  >
                    <Sliders size={16} />
                  </button>
                  <h2 className="text-sm font-semibold text-black dark:text-white truncate m-0">
                    {PAGE_LABELS[page] || "ETT ScaleUp Program"}
                  </h2>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {user && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setNotifOpen(!notifOpen)}
                        className="w-8 h-8 flex items-center justify-center rounded-md border border-neutral-200 dark:border-slate-700 hover:border-orange-400 text-black dark:text-white relative"
                        title={`${pendingCount} pending reviews`}
                      >
                        <Bell size={14} />
                        {pendingCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[9px] min-w-[16px] h-4 rounded-full flex items-center justify-center px-0.5">
                            {pendingCount}
                          </span>
                        )}
                      </button>

                      {notifOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                          <div className="absolute right-0 top-10 bg-white dark:bg-[#0f1623] border border-neutral-200 dark:border-slate-800 rounded-lg shadow-lg p-3 w-64 z-50 text-black dark:text-white">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                            <span className="font-semibold text-xs">Pending reviews</span>
                            {pendingCount > 0 && <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 rounded">Action required</span>}
                          </div>
                          <div className="max-h-[200px] overflow-y-auto space-y-1.5">
                            {reports.filter(r => r.status === "pending" && (user.role === "district_coordinator" ? r.district === user.district : true)).length === 0 ? (
                              <p className="text-xs py-3 text-center m-0 opacity-60">No pending files.</p>
                            ) : (
                              reports.filter(r => r.status === "pending" && (user.role === "district_coordinator" ? r.district === user.district : true)).map(r => (
                                <button
                                  key={r.id}
                                  type="button"
                                  onClick={() => { setPage("reports"); setNotifOpen(false); }}
                                  className="w-full text-left p-2 bg-white dark:bg-[#0f1623] rounded border border-neutral-200 dark:border-slate-800 hover:border-orange-400 text-[11px] text-black dark:text-white"
                                >
                                  <div className="font-semibold truncate">{r.school}</div>
                                  <div className="text-[10px] opacity-60">{r.district} · {r.submitted_at}</div>
                                </button>
                              ))
                            )}
                          </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setDarkMode(!darkMode)}
                    className="w-8 h-8 flex items-center justify-center rounded-md border border-neutral-200 dark:border-slate-700 hover:border-orange-400 text-black dark:text-white"
                    title="Toggle theme"
                  >
                    {darkMode ? <Sun size={14} /> : <Moon size={14} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPage("settings")}
                    className={`w-8 h-8 flex items-center justify-center rounded-md border hover:border-orange-400 text-black dark:text-white ${
                      page === 'settings' ? 'border-orange-500 text-orange-600' : 'border-neutral-200 dark:border-slate-700'
                    }`}
                    title="Settings"
                  >
                    <Settings size={14} />
                  </button>

                  {user ? (
                    <>
                      <span className="hidden sm:inline text-xs font-medium text-black dark:text-white max-w-[120px] truncate">
                        {user.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => { setUser(null); setPage("dashboard"); showToast("Signed out."); }}
                        className="px-2.5 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold text-xs"
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsLoginModalOpen(true)}
                      className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-md"
                    >
                      Sign in
                    </button>
                  )}
                </div>
              </header>

              <main className="flex-1 overflow-y-auto p-4">
                <div className="max-w-7xl mx-auto">
                  {renderPageContent()}
                </div>
              </main>
            </div>
      </div>

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      {/* Persistence and forwarding models */}
      {editingReport && (
        <Modal title={`Edit Session Record: ${editingReport.school}`} onClose={() => setEditingReport(null)}>
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <FInput label="School Name Hub" value={editingReport.school} onChange={e => setEditingReport({ ...editingReport, school: e.target.value })} />
              <FInput label="District align" value={editingReport.district} onChange={e => setEditingReport({ ...editingReport, district: e.target.value })} />
            </div>
            <FInput label="Zone description" value={editingReport.zone} onChange={e => setEditingReport({ ...editingReport, zone: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Boys Present *" type="number" value={editingReport.boys} onChange={e => setEditingReport({ ...editingReport, boys: parseInt(e.target.value) || 0 })} />
              <FInput label="Girls Present *" type="number" value={editingReport.girls} onChange={e => setEditingReport({ ...editingReport, girls: parseInt(e.target.value) || 0 })} />
            </div>
            <FSelect label="Curriculum Class" value={editingReport.curriculum} onChange={e => setEditingReport({ ...editingReport, curriculum: e.target.value })}>
              <option value="HIM">HIM — Boys Heroism</option>
              <option value="GESD">GESD — Girls Protection</option>
            </FSelect>
            <FInput label="Lesson Description" value={editingReport.session} onChange={e => setEditingReport({ ...editingReport, session: e.target.value })} />
            <FArea label="Challenges met" value={editingReport.challenges} onChange={e => setEditingReport({ ...editingReport, challenges: e.target.value })} />
            <FArea label="Stories of Change" value={editingReport.success} onChange={e => setEditingReport({ ...editingReport, success: e.target.value })} />
            <div className="flex gap-2 justify-end pt-2">
              <Btn variant="secondary" onClick={() => setEditingReport(null)}>Cancel</Btn>
              <Btn onClick={() => { saveEditedReport(editingReport); setEditingReport(null); }}>💾 Save File Changes</Btn>
            </div>
          </div>
        </Modal>
      )}

      {forwardModal && (
        <Modal title="Forward File to National Office" onClose={() => setForwardModal(null)} width={400}>
          <div className="space-y-4 text-xs sm:text-sm">
            <p className="text-slate-500 m-0 leading-relaxed text-xs">
              This action transmits the approved school record of <b>{forwardModal.school}</b> ({forwardModal.district}) to the <b>National Administrator</b> database log folder.
            </p>
            <div className="bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 p-2.5 rounded-lg text-xs border border-orange-100 dark:border-orange-900/30">
              📨 Route state: Central DC Verified → National Administrator aligned
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Btn variant="secondary" onClick={() => setForwardModal(null)}>Cancel</Btn>
              <Btn onClick={() => forwardReport(forwardModal.id)}>Confirm Transmission</Btn>
            </div>
          </div>
        </Modal>
      )}

      {isLoginModalOpen && (
        <LoginModal
          onLogin={u => { setUser(u); setIsLoginModalOpen(false); setPage("dashboard"); showToast(`👋 Welcome back, ${u.name}`); }}
          onRegister={u => { setUsers(prev => [u, ...prev]); setUser(u); setIsLoginModalOpen(false); setPage("dashboard"); showToast(`🎉 Account certified! Welcome, ${u.name}`); }}
          onClose={() => setIsLoginModalOpen(false)}
          users={users}
        />
      )}
    </>
  );
}
