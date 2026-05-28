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
  Play
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
import { TasksPage } from './components/TasksPage';
import { safeStorage } from './utils/storage';

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors">
      <Card className="w-full max-w-md p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="mb-6 flex flex-col items-center">
          <AfricaLogo size={42} variant="full" className="mb-3" />
          <h1 className="text-xl font-black text-slate-900 dark:text-slate-50 mt-2 m-0">ETT Malawi Program Portal</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Ujamaa Pamodzi Africa GBV Prevention</p>
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
            <FInput label="Email address *" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="coordinator@ujamaa.mw" />
            <FInput label="Password *" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" />
            {err && (
              <div className="bg-red-500/5 text-red-600 border border-red-500/10 rounded-xl p-2.5 text-xs text-left font-bold leading-normal">
                ⚠️ {err}
              </div>
            )}
            <Btn full onClick={doLogin} disabled={loading}>{loading ? "Signing In..." : "Confirm Sign In"}</Btn>
            <button onClick={() => { setMode('choice'); setErr(''); }} className="mt-2 text-xs font-bold text-slate-400 hover:text-slate-600 block mx-auto">
              ← Back
            </button>
          </div>
        )}

        {mode === 'register' && (
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-2 block">Account Registration</h2>
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
              <div className="bg-red-500/5 text-red-650 text-red-600 p-2 border border-red-500/10 rounded text-xs">
                {err}
              </div>
            )}
            <Btn full onClick={createAccount}>Register Account</Btn>
            <button onClick={() => { setMode('choice'); setErr(''); }} className="mt-2 text-xs font-bold text-slate-400 hover:text-slate-600 block mx-auto">
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
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Report Logged Successfully</h2>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
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
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50">
          {isPublic ? "Report an Incident" : "Submit Session Record"}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50">ETT Certified Trainings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Certify and track teachers, community leaders, and safety champions.</p>
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
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 m-0">{t.name}</h3>
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
      <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50">ETT Malawi Standards</h1>
      <p className="text-xs text-slate-500 dark:text-slate-400">Governance parameters mapping safety, code of conduct, and reporting timelines.</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[
        { icon: <Shield className="text-orange-500" size={24} />, title: "Prevent Violence", text: "Provide aged-appropriate safety toolkits explicitly targeted to mitigate school violence." },
        { icon: <Network className="text-orange-500" size={24} />, title: "Linkage pathways", text: "Construct trusted adult and health pathway loops immediately on GBV disclosure." },
        { icon: <Compass className="text-orange-500" size={24} />, title: "Cluster Delivery", text: "Consolidate resources under local cluster hubs to ensure rural learners receive instruction." }
      ].map((item) => (
        <Card key={item.title} className="p-5 space-y-2">
          <div className="h-9 flex items-center">{item.icon}</div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 m-0">{item.title}</h4>
          <p className="text-[11.5px] leading-relaxed text-slate-500 dark:text-slate-400 m-0">{item.text}</p>
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
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">{title}</h4>
              <p className="text-[11.5px] leading-relaxed text-slate-500 dark:text-slate-400 m-0">{desc}</p>
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
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Implementing Districts</h1>
        <p className="text-xs text-slate-400 dark:text-slate-500">Review 15 active districts and 13 future development regions across Malawi.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl">
        {[
          ["Active Spheres", "15 Districts"],
          ["Training Coverage", "54% Target reached"],
          ["Certified TOTs Certified", "665 Certs"],
          ["Teachers trained", `${DISTRICTS.reduce((acc, d) => acc + d.teachersTrained, 0).toLocaleString()} Trained`]
        ].map(([l, v]) => (
          <div key={l} className="space-y-1">
            <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">{l}</div>
            <div className="text-base font-black text-slate-900 dark:text-slate-50">{v}</div>
          </div>
        ))}
      </div>

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
              className={`p-5 rounded-2xl border cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 bg-white dark:bg-slate-900 ${
                isActive ? 'border-orange-100 dark:border-orange-550/10' : 'border-slate-150 dark:border-slate-850 opacity-75'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-950 dark:text-slate-50 m-0">{d.name}</h3>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold mt-1 inline-block`} style={{ color: rcColors[d.r]?.c || '#4b5563', backgroundColor: rcColors[d.r]?.bg || '#f3f4f6' }}>
                    {d.r}
                  </span>
                </div>
                <Badge text={isActive ? "Active Hub" : "Planned Expansion"} bg={isActive ? "rgba(232,93,4,0.12)" : "rgba(100,116,139,0.1)"} color={isActive ? OR_D : "#64748b"} />
              </div>

              {isActive ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl">
                      <div className="text-[9px] text-slate-400 font-bold mb-0.5">TOTs Certified</div>
                      <div className="text-sm font-black text-slate-800 dark:text-slate-100">{d.tots}</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl">
                      <div className="text-[9px] text-slate-400 font-bold mb-0.5">Teachers Trained</div>
                      <div className="text-sm font-black text-slate-800 dark:text-slate-100">{d.teachersTrained}</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-300 font-bold">
                      <span>Schools coverage</span>
                      <span>{d.cov}/{d.schools} ({pct}%)</span>
                    </div>
                    <ProgBar pct={pct} />
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 text-center text-xs text-slate-400 font-semibold italic">
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
  let boys = 0, girls = 0;

  reports.forEach(r => {
    (byStatus as any)[r.status] = ((byStatus as any)[r.status] || 0) + 1;
    (byCurr as any)[r.curriculum] = ((byCurr as any)[r.curriculum] || 0) + 1;
    byDist[r.district] = (byDist[r.district] || 0) + 1;
    boys += r.boys;
    girls += r.girls;
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

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div>
        <Kicker text="Statistical Ledger" />
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50">Operational Analytics</h1>
        <p className="text-xs text-slate-400">Audited session summaries compiled directly from local database records.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<BarChart2 size={18} className="text-orange-500" />} label="Cumulative reports" value={reports.length} />
        <StatCard icon={<Users size={18} className="text-blue-500" />} label="Boys Trained" value={boys} color="#2563eb" />
        <StatCard icon={<Users size={18} className="text-pink-500" />} label="Girls Trained" value={girls} color="#db2777" />
        <StatCard icon={<Check size={18} className="text-emerald-500" />} label="Collective Learners" value={boys + girls} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5">
          <h4 className="text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-4">File State distribution</h4>
          {Object.entries(byStatus).map(([k, v]) => (
            <Bar key={k} label={k.toUpperCase()} value={v} max={reports.length} color={k === 'approved' ? '#059669' : k === 'rejected' ? '#dc2626' : OR} />
          ))}
        </Card>
        
        <Card className="p-5">
          <h4 className="text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-4">Curriculum usage</h4>
          {Object.entries(byCurr).map(([k, v]) => (
            <Bar key={k} label={k} value={v} max={reports.length} />
          ))}
        </Card>

        <Card className="p-5">
          <h4 className="text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-4">Submission activity by location</h4>
          {Object.entries(byDist).map(([k, v]) => (
            <Bar key={k} label={k} value={v} max={Math.max(...Object.values(byDist), 1)} />
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
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50">Personnel Directory</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500">Deploy district coordinators, certified TOTs, and alignment advocates.</p>
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
                        <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-center font-bold text-xs text-orange-600">
                          {u.avatar}
                        </span>
                        <div>
                          <div className="font-bold text-slate-950 dark:text-slate-50">{u.name}</div>
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
          <FSelect label="Assigned Region Hub" value={nf.district} onChange={sn("district")}>
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

  const isStaff = user && ["admin", "district_coordinator", "data_entry"].includes(user.role);

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
        return isStaff ? <UsersPage user={cu => cu} users={users} setUsers={setUsers} showToast={showToast} /> : null;
      case "impact":
        return <ImpactPage reports={reports} showToast={showToast} user={user} />;
      case "calendar":
        return isStaff ? <CalendarPage user={user} /> : null;
      case "tasks":
        return isStaff ? <TasksPage user={user} /> : null;
      case "settings":
        return <SettingsPage user={user} darkMode={darkMode} setDarkMode={setDarkMode} showToast={showToast} reportsCount={reports.length} />;
      default:
        return <Dashboard user={user} reports={reports} setPage={setPage} darkMode={darkMode} />;
    }
  };

  // Nav categories compiled matches active roles
  const activeNavGroups = isStaff
    ? [
        {
          title: "Dashboard Workspace",
          items: [
            { id: "dashboard", label: "National Hub", icon: LayoutDashboard },
            { id: "submit", label: "Submit session file", icon: FilePlus },
            { id: "reports", label: "Oversight folder", icon: FileText }
          ]
        },
        {
          title: "Planning & Actions",
          items: [
            { id: "calendar", label: "Operations Calendar", icon: Calendar },
            { id: "tasks", label: "Operations Tasks", icon: ListTodo }
          ]
        },
        {
          title: "Educational & Operations",
          items: [
            { id: "maps", label: "Clusters Map", icon: Map },
            { id: "districts", label: "Malawi Districts", icon: MapPin },
            { id: "trainings", label: "Certs & TOTs", icon: GraduationCap },
            { id: "curriculum", label: "Empower curriculums", icon: BookOpen },
            { id: "ett", label: "ETT Standards", icon: Layers }
          ]
        },
        {
          title: "Portal Controls",
          items: [
            { id: "analytics", label: "Analytics Trends", icon: BarChart2 },
            { id: "impact", label: "Transformations", icon: Heart },
            ...(user?.role === 'admin' ? [{ id: "users", label: "Staff Directory", icon: Users }] : []),
            { id: "settings", label: "Settings pref", icon: Settings }
          ]
        }
      ]
    : [
        {
          title: "ScaleUp Public Deck",
          items: [
            { id: "dashboard", label: "National Hub", icon: LayoutDashboard },
            { id: "maps", label: "Intervention Maps", icon: Map },
            { id: "districts", label: "Malawi Districts", icon: MapPin },
            { id: "trainings", label: "Trainings", icon: GraduationCap },
            { id: "curriculum", label: "Digital curriculums", icon: BookOpen },
            { id: "ett", label: "ETT Standards", icon: Layers }
          ]
        },
        {
          title: "Portal Controls",
          items: [
            { id: "analytics", label: "Analytics Trends", icon: BarChart2 },
            { id: "impact", label: "Transformations", icon: Heart },
            { id: "submit", label: user ? "Submit session file" : "Report SGBV Incident", icon: FilePlus },
            { id: "settings", label: "Settings pref", icon: Settings }
          ]
        }
      ];

  return (
    <>
      <div className={`min-h-screen text-slate-800 dark:text-slate-200 flex flex-col transition-colors ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
        
        {/* ── TOP NAVIGATION BAR ── */}
        {!isLoginPage && (
          <header className="sticky top-0 bg-slate-900 border-b border-slate-800 text-white h-16 z-40 flex items-center justify-center px-4 shadow-md">
            <div className="w-full max-w-7xl flex items-center justify-between">
              
              <div className="flex items-center gap-3">
                {page === "dashboard" ? (
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-800/40 cursor-pointer transition text-slate-200"
                    aria-label="Toggle Side Deck"
                  >
                    <Sliders size={18} />
                  </button>
                ) : (
                  <button
                    onClick={() => setPage("dashboard")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-800/40 cursor-pointer text-xs font-bold transition text-slate-200"
                  >
                    <ArrowLeft size={13} /> Back
                  </button>
                )}

                <div className="flex items-center gap-2 select-none">
                  <AfricaLogo size={28} />
                  <span className="font-extrabold text-sm sm:text-base leading-none tracking-tight">ETT Malawi</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Notification bell and status */}
                {user && (
                  <div className="relative">
                    <button
                      onClick={() => setNotifOpen(!notifOpen)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-slate-800 hover:bg-white/10 cursor-pointer relative transition"
                      title={`${pendingCount} pending reviews`}
                    >
                      <Bell size={15} className="text-slate-200" />
                      {pendingCount > 0 && (
                        <span className="absolute -top-1 right-[-2px] bg-red-550 bg-red-600 border border-slate-900 text-white font-extrabold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center p-0.5">
                          {pendingCount}
                        </span>
                      )}
                    </button>

                    {notifOpen && (
                      <div className="absolute right-0 top-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-4 w-72 text-slate-800 dark:text-slate-100 z-50 animate-fade-in-up">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                          <span className="font-extrabold text-xs">Review Folder Alerts</span>
                          {pendingCount > 0 && <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 rounded">Action required</span>}
                        </div>
                        <div className="max-h-[220px] overflow-y-auto space-y-2">
                          {reports.filter(r => r.status === "pending" && (user.role === "district_coordinator" ? r.district === user.district : true)).length === 0 ? (
                            <p className="text-xs text-slate-400 py-4 text-center m-0">No active pending reviewed files found.</p>
                          ) : (
                            reports.filter(r => r.status === "pending" && (user.role === "district_coordinator" ? r.district === user.district : true)).map(r => (
                              <div key={r.id} onClick={() => { setPage("reports"); setNotifOpen(false); }} className="p-2 bg-slate-50 dark:bg-slate-950 rounded border border-slate-100 dark:border-slate-850 hover:border-slate-300 cursor-pointer transition text-left text-[11.5px] font-semibold space-y-0.5">
                                <div className="text-slate-900 dark:text-slate-50 truncate">{r.school}</div>
                                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{r.district} · {r.submitted_at}</div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Direct Preference toggle cog */}
                <button
                  onClick={() => setPage("settings")}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border hover:bg-white/10 cursor-pointer transition ${
                    page === 'settings' ? 'border-orange-500 bg-orange-600/10 text-orange-400' : 'border-slate-800 text-slate-200'
                  }`}
                  title="Configure System theme and preferences"
                >
                  <Settings size={15} />
                </button>

                {/* Quick login pill */}
                {user ? (
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline-block px-3 py-1 bg-white/5 border border-slate-800 font-bold text-xs rounded-full">
                      <Users size={12} className="inline mr-1 text-slate-300" /> {user.name}
                    </span>
                    <button
                      onClick={() => { setUser(null); setPage("dashboard"); showToast("Signed Out of ETT Malawi."); }}
                      className="px-3 py-1.5 rounded-lg bg-red-650 hover:bg-red-700 bg-red-600 text-white font-bold text-xs cursor-pointer border-none transition"
                      title="Deauthorize session credentials"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setPage("login")}
                    className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs cursor-pointer rounded-lg border-none transition"
                  >
                    Staff Gate
                  </button>
                )}
              </div>

            </div>
          </header>
        )}

        {/* ── CENTRAL LAYOUT GRID ── */}
        <div className="flex-1 flex flex-col md:flex-row relative">
          
          {/* Static / Mobile slide deck */}
          <AnimatePresence>
            {sidebarOpen && !isLoginPage && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSidebarOpen(false)}
                  className="fixed inset-0 bg-black z-30 md:hidden"
                />
                <motion.aside
                  initial={{ x: -280 }}
                  animate={{ x: 0 }}
                  exit={{ x: -280 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                  className="fixed top-0 bottom-0 left-0 w-64 bg-slate-950 text-slate-100 z-40 p-5 flex flex-col justify-between overflow-y-auto"
                >
                  <div className="space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <AfricaLogo size={28} />
                        <span className="font-extrabold text-base">ETT Portal Menu</span>
                      </div>
                      <button onClick={() => setSidebarOpen(false)} className="text-white hover:opacity-60 cursor-pointer">
                        <X size={18} />
                      </button>
                    </div>

                    <div className="space-y-4 text-xs font-semibold">
                      {activeNavGroups.map(group => (
                        <div key={group.title} className="space-y-1.5">
                          <div className="text-[10px] text-white/30 tracking-wider uppercase font-bold px-2">{group.title}</div>
                          {group.items.map(item => {
                            const Icon = item.icon;
                            const isActive = page === item.id;
                            return (
                              <div
                                key={item.id}
                                onClick={() => { setPage(item.id); setSidebarOpen(false); }}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition ${
                                  isActive ? 'bg-orange-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                              >
                                <Icon size={14} />
                                <span>{item.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 space-y-2 text-xs">
                    <div className="text-white/40 block text-[10px] uppercase font-bold">Hotlines alignment</div>
                    <div className="font-semibold text-white/80">Child Helpline: 116</div>
                    <div className="font-semibold text-white/80">Police: 997</div>
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Desktop permanent side navigation deck */}
          {!isLoginPage && (
            <aside className="hidden md:flex w-64 border-r border-slate-800 shrink-0 p-5 flex-col justify-between overflow-y-auto bg-[#0f1623]">
              <div className="space-y-5">
                <div className="space-y-4 text-xs font-semibold">
                  {activeNavGroups.map(group => (
                    <div key={group.title} className="space-y-1">
                      <div className="text-[9.5px] text-slate-500 font-extrabold uppercase tracking-widest px-2 mb-2 select-none">
                        {group.title}
                      </div>
                      {group.items.map(item => {
                        const Icon = item.icon;
                        const isActive = page === item.id;
                        return (
                          <div
                            key={item.id}
                            onClick={() => setPage(item.id)}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition ${
                              isActive
                                ? 'bg-orange-500/20 text-orange-400 font-bold border-l-2 border-orange-500 pl-2 rounded-l-none'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <Icon size={13.5} />
                            <span>{item.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-1.5 text-xs leading-normal">
                <div className="text-[10px] font-extrabold uppercase text-slate-600 tracking-wider">Helplines alignment</div>
                <div className="text-slate-400">Child Helpline: <b className="text-white">116</b></div>
                <div className="text-slate-400">VSU Police Desk: <b className="text-white">997</b></div>
              </div>
            </aside>
          )}

          {/* Main workspace container where children display */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            <div className="w-full max-w-7xl mx-auto min-h-[75vh]">
              {renderPageContent()}
            </div>

            {/* Standard aligned footer */}
            {!isLoginPage && (
              <footer className="w-full max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800/80 mt-12 pt-6 pb-6 text-center text-xs text-slate-400 space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <AfricaLogo size={20} />
                  <span className="font-extrabold text-slate-800 dark:text-slate-100">Ujamaa Pamodzi Africa</span>
                </div>
                <p className="m-0 leading-relaxed max-w-xl mx-auto">
                  Country Wide ScaleUp Program adapted to prevent GBV, support disclosures, and enforce child protections.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] font-semibold text-slate-500">
                  <span>Child Helpline: <b>116</b></span>
                  <span>VSU Police Desk: <b>997</b></span>
                  <span>Other Helpline: <b>0984 110 288</b></span>
                </div>
                <div className="text-[10px] text-slate-400 mt-2 font-medium">
                  © 2026 Ujamaa Africa Protection. All rights reserved. Registered Malawi NGOs Association network.
                </div>
              </footer>
            )}
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
            <div className="bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-450 p-2.5 rounded-lg text-xs border border-orange-100 dark:border-orange-900/30">
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
