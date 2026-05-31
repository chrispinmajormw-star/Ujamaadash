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
  Menu,
  Download
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
  OR_PALE,
  Breadcrumbs,
  TrendIndicator
} from './components/SubComponents';

import { Dashboard } from './components/Dashboard';
import { ReportsPage, getReportRecipient } from './components/ReportsPage';
import { MapsPage } from './components/MapsPage';
import { CurriculumPage } from './components/CurriculumPage';
import { ImpactPage } from './components/ImpactPage';
import { SettingsPage } from './components/SettingsPage';
import { NotificationsPage } from './components/NotificationsPage';
import { CalendarPage } from './components/CalendarPage';
import { TasksPage } from './components/TasksPage';
import { Tour } from './components/SubComponents';
import { safeStorage } from './utils/storage';
import { validateField, validateForm, getPasswordStrength } from './utils/validation';
import { exportAnalyticsToCSV } from './utils/export';
import { addAuditLog } from './utils/audit';

// ─── LOGIN PANEL ─────────────────────────────
interface LoginPageProps {
  onLogin: (u: User) => void;
  onPublicView: () => void;
  onRegister: (u: User) => void;
  users: User[];
  darkMode: boolean;
}
const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onPublicView, onRegister, users, darkMode }) => {
  const [mode, setMode] = useState<'choice' | 'login' | 'register'>('choice');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [reg, setReg] = useState({ name: "", district: "", designation: "", email: "", school: "", cluster: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const doLogin = async () => {
    setErr('');
    setFieldErrors({});
    
    // Validate login form
    const emailValidation = validateField('email', email);
    const passwordValidation = validateField('password', pass);
    
    if (!emailValidation.isValid || !passwordValidation.isValid) {
      setFieldErrors({ ...emailValidation.errors, ...passwordValidation.errors });
      return;
    }
    
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setLoading(false);
    const u = users.find(x => x.email === email && x.password === pass);
    if (!u) { setErr("Invalid email or password"); return; }
    onLogin(u);
  };

  const createAccount = () => {
    setErr('');
    setFieldErrors({});
    
    // Validate registration form
    const validation = validateForm(reg, ['name', 'district', 'designation', 'email', 'password']);
    
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }
    
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

  const handleFieldChange = (field: string, value: string) => {
    setReg(prev => ({ ...prev, [field]: value }));
    // Real-time validation
    if (value) {
      const validation = validateField(field, value);
      setFieldErrors(prev => ({
        ...prev,
        [field]: validation.isValid ? '' : validation.errors[field]
      }));
    } else {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const passwordStrength = getPasswordStrength(reg.password);

  return (
    <div className="min-h-full bg-white dark:bg-[#0f1623] flex items-center justify-center p-4">
      <Card className="w-full max-w-sm p-6">
        <div className="mb-5 flex flex-col items-center">
          <AfricaLogo size={36} variant="full" className="mb-2" />
          <h1 className="text-base font-bold text-black dark:text-white m-0">ETT Malawi Portal</h1>
          <p className="text-[11px] text-black dark:text-white mt-1 m-0 opacity-60">Staff sign-in</p>
        </div>

        {mode === 'choice' && (
          <div className="space-y-2.5">
            <Btn full onClick={() => setMode('login')}>Sign In</Btn>
            <Btn full variant="secondary" onClick={() => setMode('register')}>Create Staff Account</Btn>
            <Btn full variant="ghost" onClick={onPublicView}>View Public Dashboard</Btn>
          </div>
        )}

        {mode === 'login' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4 block">Sign In</h2>
            <div>
              <FInput label="Email address *" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="coordinator@ujamaa.mw" />
              {fieldErrors.email && <p className="text-[10px] text-red-600 mt-1">{fieldErrors.email}</p>}
            </div>
            <div>
              <FInput label="Password *" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" />
              {fieldErrors.password && <p className="text-[10px] text-red-600 mt-1">{fieldErrors.password}</p>}
            </div>
            {err && (
              <div className="bg-red-500/5 text-red-600 border border-red-500/10 rounded-xl p-2.5 text-xs text-left font-bold leading-normal">
                ⚠️ {err}
              </div>
            )}
            <Btn full onClick={doLogin} disabled={loading}>{loading ? "Signing In..." : "Confirm Sign In"}</Btn>
            <button onClick={() => { setMode('choice'); setErr(''); setFieldErrors({}); }} className="mt-2 text-xs font-bold text-slate-400 hover:text-slate-600 block mx-auto">
              ← Back
            </button>
          </div>
        )}

        {mode === 'register' && (
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-2 block">Account Registration</h2>
            <div>
              <FInput label="Full Name *" value={reg.name} onChange={e => handleFieldChange('name', e.target.value)} />
              {fieldErrors.name && <p className="text-[10px] text-red-600 mt-1">{fieldErrors.name}</p>}
            </div>
            <div>
              <FSelect label="Malawian District Match *" value={reg.district} onChange={e => handleFieldChange('district', e.target.value)}>
                <option value="">Choose District...</option>
                {DISTRICT_LIST.map(d => <option key={d}>{d}</option>)}
              </FSelect>
              {fieldErrors.district && <p className="text-[10px] text-red-600 mt-1">{fieldErrors.district}</p>}
            </div>
            <div>
              <FInput label="Designation *" placeholder="e.g. Teacher, TOT, DC" value={reg.designation} onChange={e => handleFieldChange('designation', e.target.value)} />
              {fieldErrors.designation && <p className="text-[10px] text-red-600 mt-1">{fieldErrors.designation}</p>}
            </div>
            <div>
              <FInput label="Email address *" type="email" value={reg.email} onChange={e => handleFieldChange('email', e.target.value)} />
              {fieldErrors.email && <p className="text-[10px] text-red-600 mt-1">{fieldErrors.email}</p>}
            </div>
            <FInput label="Associated School Hub" placeholder="e.g. Mbayani Primary" value={reg.school} onChange={e => setReg({ ...reg, school: e.target.value })} />
            <div>
              <FInput label="Current Password *" type="password" value={reg.password} onChange={e => handleFieldChange('password', e.target.value)} />
              {fieldErrors.password && <p className="text-[10px] text-red-600 mt-1">{fieldErrors.password}</p>}
              {reg.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-300" 
                        style={{ width: `${passwordStrength.strength}%`, backgroundColor: passwordStrength.color }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold" style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
                  </div>
                  <p className="text-[9px] text-gray-500">Must contain 8+ characters, uppercase, lowercase, number, and special character</p>
                </div>
              )}
            </div>
            {err && (
              <div className="bg-red-500/5 text-red-600 p-2 border border-red-500/10 rounded text-xs">
                {err}
              </div>
            )}
            <Btn full onClick={createAccount}>Register Account</Btn>
            <button onClick={() => { setMode('choice'); setErr(''); setFieldErrors({}); }} className="mt-2 text-xs font-bold text-slate-400 hover:text-slate-600 block mx-auto">
              ← Back
            </button>
          </div>
        )}
      </Card>
    </div>
  );
};

// ─── SAFE REPORT CASE SUBMISSION ─────────────
interface SubmitReportProps {
  user: User | null;
  onSubmit: (r: any) => void;
  showToast: (msg: string) => void;
  onSaveDraft?: (r: Partial<Report>) => void;
}
const SubmitReport: React.FC<SubmitReportProps> = ({ user, onSubmit, showToast, onSaveDraft }) => {
  const isPublic = !user;
  const assignedCluster = user?.role === "tot" ? CLUSTERS.find(c => c.id === user.clusterId) : null;
  
  const defaultFields = isPublic
    ? { school: "", district: "", zone: "", boys: "", girls: "", curriculum: "Harassment or intimidation", session: "", challenges: "", success: "" }
    : { school: "", district: user?.district || "", zone: assignedCluster?.name || "", boys: "", girls: "", curriculum: "HIM", session: "", challenges: "", success: "" };

  const [f, setF] = useState(defaultFields);
  const [done, setDone] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<File[]>([]);
  const s = (k: string) => (e: any) => {
    setF(p => ({ ...p, [k]: e.target.value }));
    // Real-time validation
    if (e.target.value) {
      const validation = validateField(k, e.target.value);
      setFieldErrors(prev => ({
        ...prev,
        [k]: validation.isValid ? '' : validation.errors[k]
      }));
    } else {
      setFieldErrors(prev => ({ ...prev, [k]: '' }));
    }
  };

  const submitFile = () => {
    setFieldErrors({});
    
    if (isPublic) {
      const validation = validateForm(f, ['school', 'district', 'session']);
      if (!validation.isValid) {
        setFieldErrors(validation.errors);
        showToast("⚠️ Fill in coordinates for the case");
        return;
      }
      onSubmit({ ...f, boys: 0, girls: 0, zone: f.zone || "Public align", status: "pending", submitted_by: "Public report channel", submitted_at: new Date().toISOString().split("T")[0] });
      setDone(true);
      showToast("Case report sent securely");
      return;
    }
    
    const validation = validateForm(f, ['school', 'district', 'zone', 'session']);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      showToast("⚠️ Fill in mandatory fields");
      return;
    }
    
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
          {isPublic ? "Report an Incident" : "Submit Session Record"}
        </h1>
        <p className="text-xs text-black dark:text-white opacity-80 mt-1 m-0">
          {isPublic ? "Report SGBV, harassment, defilement, or child protection concerns securely." : "Submit certified teacher checklist records."}
        </p>
      </div>

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <FInput label={isPublic ? "Incident Location *" : "School Name *"} placeholder="e.g. Kawale Primary" value={f.school} onChange={s("school")} />
            {fieldErrors.school && <p className="text-[10px] text-red-600 mt-1">{fieldErrors.school}</p>}
          </div>
          <div>
            <FSelect label="Malawian District *" value={f.district} onChange={s("district")}>
              <option value="">Select District...</option>
              {DISTRICT_LIST.map(d => <option key={d}>{d}</option>)}
            </FSelect>
            {fieldErrors.district && <p className="text-[10px] text-red-600 mt-1">{fieldErrors.district}</p>}
          </div>
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
            <div>
              <FArea label="SGBV Case details *" placeholder="Provide details safely. Do not post names if insecure." value={f.session} onChange={s("session")} />
              {fieldErrors.session && <p className="text-[10px] text-red-600 mt-1">{fieldErrors.session}</p>}
            </div>
            <FArea label="Follow up channel details (Optional)" placeholder="Preferred contact way" value={f.challenges} onChange={s("challenges")} />
          </>
        ) : (
          <>
            <div>
              <FInput label="Education Hub / Zone *" placeholder="e.g. Kawale Area Zone" value={f.zone} onChange={s("zone")} disabled={!!assignedCluster} />
              {fieldErrors.zone && <p className="text-[10px] text-red-600 mt-1">{fieldErrors.zone}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FInput label="Boys Present *" type="number" value={f.boys} onChange={s("boys")} />
                {fieldErrors.boys && <p className="text-[10px] text-red-600 mt-1">{fieldErrors.boys}</p>}
              </div>
              <div>
                <FInput label="Girls Present *" type="number" value={f.girls} onChange={s("girls")} />
                {fieldErrors.girls && <p className="text-[10px] text-red-600 mt-1">{fieldErrors.girls}</p>}
              </div>
            </div>
            <FSelect label="Active Curriculum Content *" value={f.curriculum} onChange={s("curriculum")}>
              <option value="HIM">HIM — Hero In Me (Boys)</option>
              <option value="GESD">GESD — Girls Empowerment</option>
              <option value="Combined">Topic 6: Combined session</option>
            </FSelect>
            <div>
              <FSelect label="Topic / Session Name *" value={f.session} onChange={s("session")}>
                <option value="">Select Lesson...</option>
                {(SESSION_LISTS[f.curriculum] || []).map(o => <option key={o}>{o}</option>)}
              </FSelect>
              {fieldErrors.session && <p className="text-[10px] text-red-600 mt-1">{fieldErrors.session}</p>}
            </div>
            <FArea label="Faced Challenges" placeholder="Resources required or bottlenecks" value={f.challenges} onChange={s("challenges")} />
            <FArea label="Memorable Success highlights" placeholder="Describe participant engagement" value={f.success} onChange={s("success")} />
            
            {!isPublic && (
              <div>
                <label className="block text-[11px] font-bold text-black dark:text-white mb-1">Training Photos (Optional)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setPhotos(files);
                  }}
                  className="w-full px-2 py-1.5 text-[11px] border border-gray-200 dark:border-slate-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-[#0f1623] text-black dark:text-white"
                />
                {photos.length > 0 && (
                  <p className="text-[10px] text-slate-500 mt-1">{photos.length} photo(s) selected</p>
                )}
              </div>
            )}
          </>
        )}

        <div className="flex gap-2 justify-end pt-3">
          <Btn variant="secondary" onClick={() => setF(defaultFields)}>Reset Sheet</Btn>
          {onSaveDraft && (
            <Btn variant="secondary" onClick={() => onSaveDraft(f)}>Save as Draft</Btn>
          )}
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
      <h1 className="text-base font-bold text-black dark:text-white m-0">ETT Malawi Standards</h1>
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

// ─── REGIONAL ANALYTICS VIEW ──────────────────
interface AnalyticsPageProps {
  reports: Report[];
}
const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ reports }) => {
  const byStatus = { approved: 0, pending: 0, rejected: 0, forwarded: 0 };
  const byCurr = { HIM: 0, GESD: 0, Combined: 0 };
  const byDist: Record<string, number> = {};
  const byMonth: Record<string, number> = {};
  let boys = 0, girls = 0;

  reports.forEach(r => {
    (byStatus as any)[r.status] = ((byStatus as any)[r.status] || 0) + 1;
    (byCurr as any)[r.curriculum] = ((byCurr as any)[r.curriculum] || 0) + 1;
    byDist[r.district] = (byDist[r.district] || 0) + 1;
    boys += r.boys;
    girls += r.girls;
    
    // Track reports by month
    const month = r.submitted_at.substring(0, 7); // YYYY-MM format
    byMonth[month] = (byMonth[month] || 0) + 1;
  });

  const Bar: React.FC<{ label: string; value: number; max: number; color?: string }> = ({ label, value, max, color = OR }) => (
    <div className="space-y-1 mb-3">
      <div className="flex justify-between text-xs font-semibold">
        <span>{label}</span>
        <span className="font-bold whitespace-nowrap">{value} records</span>
      </div>
      <ProgBar pct={max > 0 ? Math.round((value / max)*100) : 0} color={color} />
    </div>
  );

  const handleExportAnalytics = () => {
    exportAnalyticsToCSV({
      totalReports: reports.length,
      boysTrained: boys,
      girlsTrained: girls,
      totalLearners: boys + girls,
      approved: byStatus.approved,
      pending: byStatus.pending,
      rejected: byStatus.rejected,
      forwarded: byStatus.forwarded
    }, `ett-analytics-${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <Kicker text="Statistical Ledger" />
          <h1 className="text-base font-bold text-black dark:text-white m-0">Operational Analytics</h1>
          <p className="text-xs text-slate-400">Audited session summaries compiled directly from local database records.</p>
        </div>
        <Btn
          variant="secondary"
          onClick={handleExportAnalytics}
          className="gap-2"
        >
          <Download size={14} />
          Export Analytics
        </Btn>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<BarChart2 size={18} className="text-orange-500" />} label="Cumulative reports" value={reports.length} />
        <StatCard icon={<Users size={18} className="text-blue-500" />} label="Boys Trained" value={boys} color="#2563eb" />
        <StatCard icon={<Users size={18} className="text-pink-500" />} label="Girls Trained" value={girls} color="#db2777" />
        <StatCard icon={<Check size={18} className="text-emerald-500" />} label="Collective Learners" value={boys + girls} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5">
          <h4 className="text-xs font-extrabold uppercase text-black dark:text-white opacity-80 tracking-wider mb-4">File State distribution</h4>
          {Object.entries(byStatus).map(([k, v]) => (
            <Bar key={k} label={k.toUpperCase()} value={v} max={reports.length} color={k === 'approved' ? '#059669' : k === 'rejected' ? '#dc2626' : OR} />
          ))}
        </Card>
        
        <Card className="p-5">
          <h4 className="text-xs font-extrabold uppercase text-black dark:text-white opacity-80 tracking-wider mb-4">Curriculum usage</h4>
          {Object.entries(byCurr).map(([k, v]) => (
            <Bar key={k} label={k} value={v} max={reports.length} />
          ))}
        </Card>

        <Card className="p-5">
          <h4 className="text-xs font-extrabold uppercase text-black dark:text-white opacity-80 tracking-wider mb-4">Submission activity by location</h4>
          {Object.entries(byDist).map(([k, v]) => (
            <Bar key={k} label={k} value={v} max={Math.max(...Object.values(byDist), 1)} />
          ))}
        </Card>

        <Card className="p-5">
          <h4 className="text-xs font-extrabold uppercase text-black dark:text-white opacity-80 tracking-wider mb-4">Monthly submission trend</h4>
          {Object.entries(byMonth).sort().map(([k, v]) => (
            <Bar key={k} label={k} value={v} max={Math.max(...Object.values(byMonth), 1)} color="#8b5cf6" />
          ))}
        </Card>
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
  dashboard: "Overview",
  submit: "Submit Report",
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());
  const [notificationPrefs, setNotificationPrefs] = useState({
    email: true,
    push: true,
    pending: true,
    approved: true,
    rejected: false,
    forwarded: false
  });
  const [pinnedWidgets, setPinnedWidgets] = useState<string[]>(['kpi', 'charts', 'map']);
  const [draftReports, setDraftReports] = useState<Report[]>([]);
  const [bulkReports, setBulkReports] = useState<Partial<Report>[]>([]);
  const [showTour, setShowTour] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);

  const SESSION_TIMEOUT_MINUTES = 30; // 30 minutes of inactivity

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3800);
  }, []);

  // Session timeout management
  useEffect(() => {
    if (!user) {
      if (sessionTimeout) clearTimeout(sessionTimeout);
      setSessionTimeout(null);
      setShowSessionWarning(false);
      return;
    }

    const resetSessionTimer = () => {
      if (sessionTimeout) clearTimeout(sessionTimeout);
      setShowSessionWarning(false);
      
      // Set timeout for auto-logout
      const timeout = setTimeout(() => {
        setUser(null);
        setPage('dashboard');
        showToast('Session expired due to inactivity');
      }, SESSION_TIMEOUT_MINUTES * 60 * 1000);
      
      setSessionTimeout(timeout);
    };

    // Show warning 1 minute before timeout
    const warningTimeout = setTimeout(() => {
      setShowSessionWarning(true);
    }, (SESSION_TIMEOUT_MINUTES - 1) * 60 * 1000);

    resetSessionTimer();

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => {
      resetSessionTimer();
    };

    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (sessionTimeout) clearTimeout(sessionTimeout);
      if (warningTimeout) clearTimeout(warningTimeout);
    };
  }, [user]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      // Ctrl/Cmd + N for new report
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        if (user) {
          setPage('submit');
        }
      }
      // Escape to close modals
      if (e.key === 'Escape') {
        setNotifOpen(false);
        setSearchOpen(false);
        setEditingReport(null);
        setForwardModal(null);
      }
      // Ctrl/Cmd + / to focus search input
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        // Focus on search input if available
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user, page]);

  // Synchronize dynamic lists to storage
  useEffect(() => {
    safeStorage.setItem("ett_reports", JSON.stringify(reports));
    setLastUpdated(new Date().toISOString());
  }, [reports]);

  // Load draft reports from local storage
  useEffect(() => {
    try {
      const savedDrafts = safeStorage.getItem("ett_drafts");
      if (savedDrafts) {
        setDraftReports(JSON.parse(savedDrafts));
      }
    } catch (e) {
      console.error("Failed to load draft reports:", e);
    }
  }, []);

  // Check if tour should be shown for first-time users
  useEffect(() => {
    const tourShown = safeStorage.getItem("ett_tour_completed");
    if (!tourShown && user) {
      setShowTour(true);
    }
  }, [user]);

  const tourSteps = [
    { target: "dashboard", title: "Welcome to ETT Dashboard", content: "This is your main dashboard showing key performance indicators, charts, and maps for the ETT Malawi program." },
    { target: "reports", title: "Reports Management", content: "View, filter, and manage all session reports. You can approve, reject, or forward reports based on your role." },
    { target: "submit", title: "Submit Reports", content: "Submit new session records with details about learners, curriculum, and training outcomes." },
    { target: "maps", title: "Interactive Maps", content: "View school clusters, districts, and training locations on an interactive map with layer toggles." },
    { target: "analytics", title: "Analytics", content: "View detailed analytics and statistics about training progress and impact." },
    { target: "settings", title: "Settings", content: "Customize your preferences including dark mode, notifications, and other app settings." }
  ];

  const handleTourComplete = () => {
    setShowTour(false);
    setTourCompleted(true);
    safeStorage.setItem("ett_tour_completed", "true");
    showToast("🎉 Tour completed!");
  };

  // Save draft reports to local storage
  useEffect(() => {
    safeStorage.setItem("ett_drafts", JSON.stringify(draftReports));
  }, [draftReports]);

  const saveAsDraft = (report: Partial<Report>) => {
    const draft: Report = {
      ...report,
      id: Date.now(),
      status: 'draft',
      submitted_at: new Date().toISOString().split("T")[0],
      submitted_by: user?.name || "Unknown",
      boys: report.boys || 0,
      girls: report.girls || 0,
      school: report.school || "",
      district: report.district || "",
      zone: report.zone || "",
      curriculum: report.curriculum || "",
      session: report.session || ""
    } as Report;
    setDraftReports([...draftReports, draft]);
    showToast("💾 Report saved as draft");
  };

  const submitBulkReports = () => {
    const validReports = bulkReports.filter(r => 
      r.school && r.district && r.session && r.boys !== undefined && r.girls !== undefined
    );
    
    if (validReports.length === 0) {
      showToast("⚠️ No valid reports to submit");
      return;
    }

    const newReports = validReports.map(r => ({
      ...r,
      id: Date.now() + Math.random(),
      status: "pending",
      submitted_at: new Date().toISOString().split("T")[0],
      submitted_by: user?.name || "Unknown",
      boys: r.boys || 0,
      girls: r.girls || 0
    })) as Report[];

    setReports([...reports, ...newReports]);
    setBulkReports([]);
    showToast(`✅ ${newReports.length} reports submitted successfully`);
  };

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
    const report = reports.find(r => r.id === id);
    if (report && user) {
      addAuditLog({
        action: status,
        entityType: 'report',
        entityId: id,
        entityName: report.school,
        performedBy: user.name,
        performedByRole: user.role,
        details: `Report from ${report.school} in ${report.district} was ${status}`
      });
    }
    setReports(p => p.map(r => r.id === id ? { ...r, status } : r));
  };

  // DC Forward file operation
  const forwardReport = (id: number) => {
    const report = reports.find(r => r.id === id);
    if (report && user) {
      addAuditLog({
        action: 'forwarded',
        entityType: 'report',
        entityId: id,
        entityName: report.school,
        performedBy: user.name,
        performedByRole: user.role,
        details: `Report from ${report.school} in ${report.district} was forwarded to National Admin`
      });
    }
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

  const isLoginPage = page === "login" || (!user && !["dashboard", "submit", "maps", "districts", "trainings", "curriculum", "ett", "analytics", "impact", "settings"].includes(page));

  const renderPageContent = () => {
    if (page === "login") {
      return (
        <LoginPage
          onLogin={u => { setUser(u); setPage("dashboard"); showToast(`👋 Welcome back, ${u.name}`); }}
          onRegister={u => { setUsers(prev => [u, ...prev]); setUser(u); setPage("dashboard"); showToast(`🎉 Account certified! Welcome, ${u.name}`); }}
          onPublicView={() => { setUser(null); setPage("dashboard"); }}
          users={users}
          darkMode={darkMode}
        />
      );
    }

    switch (page) {
      case "dashboard":
        return <Dashboard user={user} reports={reports} setPage={setPage} darkMode={darkMode} />;
      case "submit":
        return <SubmitReport user={user} onSubmit={addReport} showToast={showToast} onSaveDraft={saveAsDraft} />;
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
            onBulkSubmit={submitBulkReports}
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
      case "notifications":
        return user ? <NotificationsPage user={user} reports={reports} showToast={showToast} /> : <div className="p-12 text-center text-slate-400 font-semibold italic">Sign in to view Notifications.</div>;
      case "settings":
        return <SettingsPage user={user} darkMode={darkMode} setDarkMode={setDarkMode} showToast={showToast} reportsCount={reports.length} notificationPrefs={notificationPrefs} setNotificationPrefs={setNotificationPrefs} setUser={setUser} />;
      default:
        return <Dashboard user={user} reports={reports} setPage={setPage} darkMode={darkMode} pinnedWidgets={pinnedWidgets} setPinnedWidgets={setPinnedWidgets} />;
    }
  };

  // Unified nav — same for all users. protected=true items redirect to login if not signed in.
  const PROTECTED_PAGES = ["submit", "reports", "calendar", "tasks", "analytics", "users"];
  const activeNavGroups = [
    {
      title: "Overview",
      items: [
        { id: "dashboard", label: "Overview", icon: LayoutDashboard },
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
        { id: "submit", label: "Submit report", icon: FilePlus, protected: true },
        { id: "reports", label: "Reports", icon: FileText, protected: true }
      ]
    },
    {
      title: "More",
      items: [
        { id: "notifications", label: "Notifications", icon: Bell, protected: true },
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
                if (isLocked) { setPage("login"); onNavigate?.(); return; }
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
        {isLoginPage ? (
          <div className="flex-1 overflow-y-auto">{renderPageContent()}</div>
        ) : (
          <>
            <aside className="flex w-56 shrink-0 flex-col bg-white dark:bg-[#0f1623] border-r border-neutral-200 dark:border-slate-800">
              <div className="h-12 flex items-center gap-2 px-3 border-b border-neutral-200 dark:border-slate-800 shrink-0">
                <AfricaLogo size={22} />
                <span className="font-bold text-sm text-black dark:text-white truncate">ETT Malawi</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2">{renderNav()}</div>
              <div className="p-3 border-t border-neutral-200 dark:border-slate-800 text-[10px] text-black dark:text-white opacity-60 shrink-0">
                Helpline <b className="text-orange-600 dark:text-orange-400">116</b> · VSU <b className="text-orange-600 dark:text-orange-400">997</b>
              </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0f1623]">
              <header className="h-14 shrink-0 flex items-center justify-between gap-3 px-3 sm:px-4 border-b border-neutral-200 dark:border-slate-800 bg-white dark:bg-[#0f1623]" role="banner">
                <div className="flex items-center gap-2 min-w-0">
                  <h2 className="text-sm font-semibold text-black dark:text-white truncate m-0">
                    {PAGE_LABELS[page] || "Overview"}
                  </h2>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {user && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setNotifOpen(!notifOpen)}
                        className="w-8 h-8 flex items-center justify-center rounded-md border border-neutral-200 dark:border-slate-700 hover:border-orange-400 text-black dark:text-white relative"
                        title={`${pendingCount} pending reviews`}
                        aria-label={`Notifications: ${pendingCount} pending reviews`}
                        aria-expanded={notifOpen}
                        aria-haspopup="true"
                      >
                        <Bell size={14} />
                        {pendingCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[9px] min-w-[16px] h-4 rounded-full flex items-center justify-center px-0.5" aria-label={`${pendingCount} pending`}>
                            {pendingCount}
                          </span>
                        )}
                      </button>

                      {notifOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                          <div className="absolute right-0 top-10 sm:right-0 bg-white dark:bg-[#0f1623] border border-neutral-200 dark:border-slate-800 rounded-lg shadow-lg p-3 w-72 sm:w-64 z-50 text-black dark:text-white">
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
                    aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
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
                    aria-label="Open settings"
                    aria-current={page === 'settings' ? 'page' : undefined}
                  >
                    <Settings size={14} />
                  </button>

                  {user ? (
                    <>
                      <span className="hidden sm:inline text-xs font-medium text-black dark:text-white max-w-[100px] sm:max-w-[120px] truncate">
                        {user.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => { setUser(null); setPage("dashboard"); showToast("Signed out."); }}
                        className="px-2 sm:px-2.5 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold text-xs"
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPage("login")}
                      className="px-2 sm:px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-md"
                    >
                      Sign in
                    </button>
                  )}
                </div>
              </header>

              <main className="flex-1 overflow-y-auto p-3 sm:p-4">
                <div className="max-w-7xl mx-auto">
                  {page !== 'login' && (
                    <div className="flex items-center justify-end mb-2 text-[10px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Last updated: {new Date(lastUpdated).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {renderPageContent()}
                </div>
              </main>
            </div>
          </>
        )}
      </div>

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      {/* Session timeout warning */}
      {showSessionWarning && (
        <div className="fixed bottom-4 right-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-lg shadow-lg p-4 z-[99999] max-w-sm">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⏰</span>
            <div className="flex-1">
              <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm mb-1">Session Expiring Soon</h4>
              <p className="text-xs text-amber-700 dark:text-amber-300">Your session will expire in 1 minute due to inactivity. Continue working to stay signed in.</p>
            </div>
            <button
              onClick={() => setShowSessionWarning(false)}
              className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Help/Tour for first-time users */}
      <Tour
        steps={tourSteps}
        isOpen={showTour}
        onClose={() => setShowTour(false)}
        onComplete={handleTourComplete}
      />

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
    </>
  );
}
