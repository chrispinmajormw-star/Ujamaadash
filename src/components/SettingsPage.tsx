import React, { useState, useEffect } from 'react';
import {
  Moon, Sun, Monitor, Sparkles, User as UserIcon,
  HelpCircle, Bell, Calendar, ListTodo, Clock,
  Trash2, Lock, Save, Eye, EyeOff, RefreshCw,
  CheckCircle, AlertCircle, Wifi, Database, Server,
  Shield, Languages,
} from 'lucide-react';
import { User } from '../types';
import { Card, Kicker } from './SubComponents';
import { ROLE_CFG } from '../data';
import { safeStorage } from '../utils/storage';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../i18n';
import { useTheme, THEME_PRESETS } from '../context/ThemeContext';
import { usersApi, statsApi, api } from '../api';

interface SettingsPageProps {
  user: User | null;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  showToast: (msg: string) => void;
  reportsCount: number;
  setUser?: (u: User) => void;
}

// ─── TOGGLE ROW ───────────────────────────────────────────────────────────────
const ToggleRow = ({ icon, label, sub, value, onChange, border=true }: {
  icon: React.ReactNode; label: string; sub: string;
  value: boolean; onChange: () => void; border?: boolean;
}) => (
  <div className={`flex items-center justify-between py-3 ${border?'border-b border-neutral-200 dark:border-slate-800':''}`}>
    <div className="flex items-start gap-3">
      <span className="p-2 rounded-lg bg-[var(--brand-50)] dark:bg-[var(--brand-950)]/20 text-[var(--brand-500)] shrink-0">{icon}</span>
      <div>
        <div className="text-xs font-bold text-black dark:text-white">{label}</div>
        <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{sub}</div>
      </div>
    </div>
    <button onClick={onChange}
      style={{ width: '44px', height: '24px', minWidth: '44px', maxWidth: '44px', minHeight: '24px', maxHeight: '24px' }}
      className={`relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ml-4 ${value?'bg-[var(--brand-500)]':'bg-gray-200 dark:bg-slate-700'}`}>
      <span style={{ width: '20px', height: '20px' }} className={`inline-block transform rounded-full bg-white shadow transition duration-200 ${value?'translate-x-5':'translate-x-0'}`}/>
    </button>
  </div>
);

// ─── PASSWORD FIELD ───────────────────────────────────────────────────────────
const PwField = ({ label, value, onChange }: { label: string; value: string; onChange: (v:string)=>void }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5 block">{label}</label>
      <div className="relative">
        <input
          type={show?'text':'password'}
          value={value}
          onChange={e=>onChange(e.target.value)}
          className="w-full px-3 py-2 pr-9 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] dark:text-white"
        />
        <button type="button" onClick={()=>setShow(s=>!s)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          {show?<EyeOff size={13}/>:<Eye size={13}/>}
        </button>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export const SettingsPage: React.FC<SettingsPageProps> = ({
  user, darkMode, setDarkMode, showToast, reportsCount, setUser
}) => {
  const rc = user ? ROLE_CFG[user.role] : null;
  const { t, i18n } = useTranslation();
  const { brandColor, setBrandColor, resetBrandColor } = useTheme();
  const setLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('app_language', code);
    localStorage.setItem('app_language_user_set', 'true');
    showToast(`Language changed`, 'success');
  };
  const [activeTab, setActiveTab] = useState<'appearance'|'language'|'notifications'|'account'|'security'|'system'>('appearance');
  useEffect(() => {
    if (!user && (activeTab === 'account' || activeTab === 'security' || activeTab === 'system')) {
      setActiveTab('appearance');
    }
    if (user?.role !== 'admin' && activeTab === 'system') {
      setActiveTab('appearance');
    }
  }, [user, activeTab]);

  // ── Notification prefs ───────────────────────────────────────────────────
  // Training/Meeting/Task alerts are real server-side settings now (they
  // control whether the backend actually creates those notifications for
  // you) -- Week Start stays a pure local display preference.
  const [notifyTraining, setNotifyTraining] = useState(true);
  const [notifyMeetings, setNotifyMeetings] = useState(true);
  const [weekStartMonday, setWeekStartMonday] = useState(()=>safeStorage.getItem('scaleup_week_monday')==='true');
  const [taskReminders,  setTaskReminders]  = useState(true);
  useEffect(() => {
    if (!user) return;
    usersApi.getMyNotificationPreferences().then((data: any) => {
      if (data?.error) return;
      if (typeof data.notify_training === 'boolean') setNotifyTraining(data.notify_training);
      if (typeof data.notify_meetings === 'boolean') setNotifyMeetings(data.notify_meetings);
      if (typeof data.notify_tasks === 'boolean') setTaskReminders(data.notify_tasks);
    }).catch(() => {});
  }, [user]);
  const toggleServerPref = (val:boolean, set:(v:boolean)=>void, field:string, msg:(v:boolean)=>string) => {
    const next=!val; set(next);
    usersApi.updateMyNotificationPreferences({ [field]: next }).catch(() => {});
    showToast(msg(next));
  };
  const toggle = (val:boolean, set:(v:boolean)=>void, key:string, msg:(v:boolean)=>string) => {
    const next=!val; set(next); safeStorage.setItem(key,String(next)); showToast(msg(next));
  };

  // ── Profile edit ──────────────────────────────────────────────────────────
  const [profileName,  setProfileName]  = useState(user?.name||'');
  const [profileEmail, setProfileEmail] = useState(user?.email||'');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(()=>{
    setProfileName(user?.name||'');
    setProfileEmail(user?.email||'');
  },[user]);

  const saveProfile = async () => {
    if (!profileName.trim()) { showToast('Name cannot be empty', 'warning'); return; }
    setSavingProfile(true);
    try {
      const updated = await usersApi.updateProfile({ name: profileName.trim(), email: profileEmail.trim() });
      if (updated?.id) {
        setUser?.({ ...user!, name: updated.name, email: updated.email });
        showToast('Profile updated successfully', 'success');
      } else {
        showToast('Update failed — try again', 'error');
      }
    } catch {
      showToast('Could not reach server');
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Password change ───────────────────────────────────────────────────────
  const [currentPw, setCurrentPw]   = useState('');
  const [newPw,     setNewPw]       = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [savingPw,  setSavingPw]    = useState(false);
  const [pwStrength, setPwStrength] = useState(0);

  useEffect(()=>{
    if (!newPw) { setPwStrength(0); return; }
    let s=0;
    if (newPw.length>=8) s++;
    if (/[A-Z]/.test(newPw)) s++;
    if (/[0-9]/.test(newPw)) s++;
    if (/[^A-Za-z0-9]/.test(newPw)) s++;
    setPwStrength(s);
  },[newPw]);

  const pwStrengthLabel = ['','Weak','Fair','Good','Strong'][pwStrength];
  const pwStrengthColor = ['','bg-red-500','bg-amber-500','bg-blue-500','bg-emerald-500'][pwStrength];

  const changePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) { showToast('All password fields are required', 'warning'); return; }
    if (newPw !== confirmPw) { showToast('New passwords do not match', 'warning'); return; }
    if (newPw.length < 8)    { showToast('Password must be at least 8 characters', 'warning'); return; }
    setSavingPw(true);
    try {
      const res = await usersApi.changePassword({ currentPassword: currentPw, newPassword: newPw });
      if (res?.success) {
        showToast('Password changed successfully', 'success');
        setCurrentPw(''); setNewPw(''); setConfirmPw('');
      } else {
        showToast(`${res?.error || 'Password change failed'}`, 'error');
      }
    } catch {
      showToast('Could not reach server', 'error');
    } finally {
      setSavingPw(false);
    }
  };

  // ── System health ─────────────────────────────────────────────────────────
  const [dbStatus,      setDbStatus]      = useState<'checking'|'ok'|'error'>('checking');
  const [apiLatency,    setApiLatency]    = useState<number|null>(null);

  useEffect(()=>{
    if (activeTab!=='system') return;
    const start=Date.now();
    api.get('/health/db')
      .then(d=>{
        setDbStatus(d.status==='ok'?'ok':'error');
        setApiLatency(Date.now()-start);
      })
      .catch(()=>{ setDbStatus('error'); setApiLatency(null); });
  },[activeTab]);

  const tabs = [
    {id:'appearance',    label:'Appearance',    icon:Sparkles},
    {id:'language',      label:'Language',      icon:Languages},
    {id:'notifications', label:'Notifications', icon:Bell},
    ...(user ? [
      {id:'account' as const,  label:'Account',  icon:UserIcon},
      {id:'security' as const, label:'Security', icon:Lock},
    ] : []),
    // Low-level infrastructure diagnostics (DB status, API latency, exact
    // backend/hosting stack) -- Admin-only, not useful or appropriate for
    // general staff to see day-to-day.
    ...(user?.role === 'admin' ? [
      {id:'system' as const, label:'System', icon:Monitor},
    ] : []),
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in-up pb-10">

      <div>
        <Kicker text="Application Preferences" />
        <h1 className="text-base font-bold text-black dark:text-white m-0">System Settings</h1>
        <p className="text-xs text-black dark:text-white opacity-60 mt-1 m-0">
          Customize display, alerts, and account capabilities.
        </p>
      </div>

      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg w-fit border border-neutral-200 dark:border-slate-800 flex-wrap">
        {tabs.map(({id,label,icon:Icon})=>(
          <button key={id} onClick={()=>setActiveTab(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab===id
                ?'bg-white dark:bg-[#0f1623] text-black dark:text-white shadow-sm border border-neutral-200 dark:border-slate-700'
                :'text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white'
            }`}>
            <Icon size={12}/>{label}
          </button>
        ))}
      </div>

      {/* ── APPEARANCE ── */}
      {activeTab==='appearance'&&(
        <Card className="p-5 space-y-5">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-lg bg-[var(--brand-500)] text-white"><Sparkles size={16}/></span>
            <div>
              <h3 className="text-sm font-bold text-black dark:text-white m-0">Appearance Theme</h3>
              <p className="text-[11px] text-slate-400 m-0">Set the background contrast mode.</p>
            </div>
          </div>
          <div className="h-px bg-neutral-200 dark:bg-slate-800"/>
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--brand-50)] dark:bg-slate-800 border border-[var(--brand-200)] dark:border-slate-700">
            <div className="flex items-center gap-3">
              {darkMode?<Moon className="text-violet-400" size={18}/>:<Sun className="text-[var(--brand-500)]" size={18}/>}
              <div>
                <div className="text-xs font-bold text-black dark:text-white">{darkMode?'Dark Mode Active':'Light Mode Active'}</div>
                <div className="text-[11px] text-slate-400">{darkMode?'Dark slate — easy on the eyes at night.':'Clean white & orange — sharp and professional.'}</div>
              </div>
            </div>
            <button onClick={()=>{setDarkMode(!darkMode);showToast(`Dark mode ${!darkMode?'ON':'OFF'}`, 'success');}}
              style={{ width: '44px', height: '24px', minWidth: '44px', maxWidth: '44px', minHeight: '24px', maxHeight: '24px' }}
              className={`relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${darkMode?'bg-[var(--brand-500)]':'bg-gray-200'}`}>
              <span style={{ width: '20px', height: '20px' }} className={`inline-block transform rounded-full bg-white shadow transition duration-200 ${darkMode?'translate-x-5':'translate-x-0'}`}/>
            </button>
          </div>
        </Card>
      )}

      {/* ── LANGUAGE ── */}
      {activeTab==='language'&&(
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-lg bg-[var(--brand-500)] text-white"><Languages size={16}/></span>
            <div>
              <h3 className="text-sm font-bold text-black dark:text-white m-0">Language</h3>
              <p className="text-[11px] text-slate-400 m-0">Choose the language used throughout the dashboard.</p>
            </div>
          </div>
          <div className="h-px bg-neutral-200 dark:bg-slate-800"/>
          <div className="grid grid-cols-2 gap-3">
            {SUPPORTED_LANGUAGES.map(l => (
              <div key={l.code} onClick={() => setLanguage(l.code)}
                className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${i18n.language===l.code?'border-[var(--brand-500)] bg-[var(--brand-50)] dark:bg-[var(--brand-950)]/20':'border-neutral-200 dark:border-slate-700 hover:border-[var(--brand-200)] dark:hover:border-[var(--brand-800)]'}`}>
                <span className={`text-xs font-bold ${i18n.language===l.code?'text-[var(--brand-600)] dark:text-[var(--brand-400)]':'text-slate-500 dark:text-slate-300'}`}>{l.label}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
      {/* ── THEME COLOR ── */}
      {activeTab==='appearance'&&(
        <Card className="p-0 overflow-hidden">
          <div
            className="px-5 pt-5 pb-6 relative"
            style={{ background: `linear-gradient(135deg, ${brandColor}, ${brandColor}cc)` }}
          >
            <div className="flex items-center justify-between relative z-10">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/70">Accent Color</div>
                <div className="text-xl font-black text-white mt-0.5">Theme</div>
              </div>
              <button
                onClick={resetBrandColor}
                className="text-[11px] font-bold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg transition backdrop-blur-sm"
              >
                Reset
              </button>
            </div>
            <p className="text-[11px] text-white/70 mt-3 relative z-10 max-w-xs">
              Pick an accent color used throughout the dashboard. Saved on this device only — no account needed.
            </p>
          </div>

          <div className="p-5 space-y-5">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-3">Presets</div>
              <div className="grid grid-cols-4 gap-3">
                {THEME_PRESETS.map(preset => {
                  const isActive = brandColor === preset.value;
                  return (
                    <button
                      key={preset.value}
                      onClick={() => setBrandColor(preset.value)}
                      className={`group relative flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                        isActive ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#0f1623]' : 'hover:-translate-y-0.5'
                      }`}
                      style={isActive ? { '--tw-ring-color': preset.value } as React.CSSProperties : undefined}
                    >
                      <span
                        className="w-10 h-10 rounded-full shrink-0 shadow-sm flex items-center justify-center transition-transform group-hover:scale-105"
                        style={{ background: preset.value }}
                      >
                        {isActive && <CheckCircle size={16} className="text-white drop-shadow" />}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 text-center leading-tight">
                        {preset.name.replace(' (Default)', '')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-neutral-100 dark:bg-slate-800" />

            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <input
                  type="color"
                  value={brandColor}
                  onChange={e => setBrandColor(e.target.value)}
                  className="w-11 h-11 rounded-xl border-2 border-neutral-200 dark:border-slate-700 cursor-pointer bg-transparent"
                />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Custom color</div>
                <div className="text-[11px] font-mono text-slate-400 uppercase">{brandColor}</div>
              </div>
            </div>
          </div>
        </Card>
      )}
      {/* ── NOTIFICATIONS ── */}
      {activeTab==='notifications'&&(
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="p-2.5 rounded-lg bg-[var(--brand-500)] text-white"><Bell size={16}/></span>
            <div>
              <h3 className="text-sm font-bold text-black dark:text-white m-0">Operations & Calendar Alerts</h3>
              <p className="text-[11px] text-slate-400 m-0">Control what triggers alerts in your dashboard.</p>
            </div>
          </div>
          <div className="h-px bg-neutral-200 dark:bg-slate-800 mb-1"/>
          <ToggleRow icon={<Calendar size={14}/>} label="Training Event Alerts" sub="Get notifications for scheduled TOT and curriculum sessions."
            value={notifyTraining} onChange={()=>toggleServerPref(notifyTraining,setNotifyTraining,'notify_training',v=>`Training alerts ${v?'ON':'OFF'}`)}/>
          <ToggleRow icon={<Clock size={14}/>} label="Meeting Alerts" sub="Receive reminders for regional officer coordinate syncs."
            value={notifyMeetings} onChange={()=>toggleServerPref(notifyMeetings,setNotifyMeetings,'notify_meetings',v=>`Meeting alerts ${v?'ON':'OFF'}`)}/>
          <ToggleRow icon={<Calendar size={14}/>} label="Week starts on Monday" sub="Arrange the Operations Calendar with Monday as first day."
            value={weekStartMonday} onChange={()=>toggle(weekStartMonday,setWeekStartMonday,'scaleup_week_monday',v=>`Week start set to ${v?'Monday':'Sunday'}`)}/>
          <ToggleRow icon={<ListTodo size={14}/>} label="Task Reminders" sub="Sync dashboard badges for pending operations list actions."
            value={taskReminders} onChange={()=>toggleServerPref(taskReminders,setTaskReminders,'notify_tasks',v=>`Task reminders ${v?'ON':'OFF'}`)} border={false}/>
        </Card>
      )}

      {/* ── ACCOUNT ── */}
      {activeTab==='account'&&(
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="p-2.5 rounded-lg bg-[var(--brand-500)] text-white"><UserIcon size={16}/></span>
              <div>
                <h3 className="text-sm font-bold text-black dark:text-white m-0">Profile Information</h3>
                <p className="text-[11px] text-slate-400 m-0">Update your name and email address.</p>
              </div>
            </div>
            <div className="h-px bg-neutral-200 dark:bg-slate-800 mb-4"/>
            {user?(
              <div className="space-y-4">
                {/* Avatar */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--brand-50)] dark:bg-slate-800/50 border border-[var(--brand-100)] dark:border-slate-700">
                  <div className="w-14 h-14 rounded-full bg-[var(--brand-500)] text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
                    {user.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-black dark:text-white text-sm">{user.name}</div>
                    <div className="text-[11px] text-slate-400">{user.email}</div>
                    {rc&&<span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{color:rc.color,backgroundColor:rc.bg}}>{rc.label}</span>}
                  </div>
                </div>

                {/* Editable fields */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5 block">Full Name</label>
                    <input value={profileName} onChange={e=>setProfileName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] dark:text-white"/>
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5 block">Email Address</label>
                    <input value={profileEmail} onChange={e=>setProfileEmail(e.target.value)} type="email"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] dark:text-white"/>
                  </div>
                  <div className="divide-y divide-neutral-100 dark:divide-slate-800 rounded-lg border border-neutral-200 dark:border-slate-800 overflow-hidden">
                    {[['Role',rc?.label||'—'],['District',user.district||'National'],['Status',user.status?.toUpperCase()||'ACTIVE']].map(([k,v],i)=>(
                      <div key={k} className={`flex justify-between items-center px-4 py-2.5 text-xs ${i%2===0?'bg-white dark:bg-[#0f1623]':'bg-slate-50/50 dark:bg-slate-800/30'}`}>
                        <span className="text-slate-400 font-medium">{k}</span>
                        <span className="font-bold text-black dark:text-white">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={saveProfile} disabled={savingProfile}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--brand-500)] hover:bg-[var(--brand-600)] disabled:opacity-60 text-white font-bold text-xs transition">
                  {savingProfile?<RefreshCw size={13} className="animate-spin"/>:<Save size={13}/>}
                  {savingProfile?'Saving…':'Save Profile Changes'}
                </button>

                <div className="bg-[var(--brand-500)] rounded-xl p-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/10 -translate-y-6 translate-x-6"/>
                  <div className="relative flex items-start gap-2">
                    <HelpCircle size={14} className="text-[var(--brand-100)] shrink-0 mt-0.5"/>
                    <div>
                      <div className="text-xs font-bold text-white mb-1">Safeguarding Support</div>
                      <div className="text-[11px] text-[var(--brand-100)] leading-relaxed">
                        Contact: <span className="font-bold text-white">support.pamodzi@ujamaa-africa.org</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ):(
              <div className="flex flex-col items-center py-8 text-center">
                <div className="w-14 h-14 rounded-full bg-[var(--brand-50)] dark:bg-slate-800 flex items-center justify-center mb-3">
                  <UserIcon size={22} className="text-[var(--brand-400)]"/>
                </div>
                <div className="font-bold text-slate-700 dark:text-slate-300 text-sm">Not logged in</div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── SECURITY ── */}
      {activeTab==='security'&&(
        <div className="space-y-4">
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-lg bg-[var(--brand-500)] text-white"><Lock size={16}/></span>
              <div>
                <h3 className="text-sm font-bold text-black dark:text-white m-0">Change Password</h3>
                <p className="text-[11px] text-slate-400 m-0">Update your login password. Min 8 characters.</p>
              </div>
            </div>
            <div className="h-px bg-neutral-200 dark:bg-slate-800"/>

            <PwField label="Current Password" value={currentPw} onChange={setCurrentPw}/>
            <PwField label="New Password"     value={newPw}     onChange={setNewPw}/>

            {/* Strength bar */}
            {newPw&&(
              <div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                  <span>Password Strength</span>
                  <span className={`${['','text-red-500','text-amber-500','text-blue-500','text-emerald-500'][pwStrength]}`}>
                    {pwStrengthLabel}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${pwStrengthColor}`} style={{width:`${pwStrength*25}%`}}/>
                </div>
                <div className="mt-2 space-y-0.5 text-[10px] text-slate-400">
                  {[['At least 8 characters',newPw.length>=8],['Uppercase letter',/[A-Z]/.test(newPw)],['Number',/[0-9]/.test(newPw)],['Special character',/[^A-Za-z0-9]/.test(newPw)]].map(([label,ok])=>(
                    <div key={String(label)} className="flex items-center gap-1.5">
                      {ok?<CheckCircle size={10} className="text-emerald-500"/>:<AlertCircle size={10} className="text-slate-300"/>}
                      <span className={ok?'text-emerald-600 dark:text-emerald-400':''}>{String(label)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <PwField label="Confirm New Password" value={confirmPw} onChange={setConfirmPw}/>

            {confirmPw&&newPw&&(
              <div className={`flex items-center gap-1.5 text-[11px] font-bold ${newPw===confirmPw?'text-emerald-600':'text-red-500'}`}>
                {newPw===confirmPw?<CheckCircle size={12}/>:<AlertCircle size={12}/>}
                {newPw===confirmPw?'Passwords match':'Passwords do not match'}
              </div>
            )}

            <button onClick={changePassword} disabled={savingPw||newPw!==confirmPw||!currentPw}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--brand-500)] hover:bg-[var(--brand-600)] disabled:opacity-50 text-white font-bold text-xs transition">
              {savingPw?<RefreshCw size={13} className="animate-spin"/>:<Shield size={13}/>}
              {savingPw?'Changing Password…':'Change Password'}
            </button>
          </Card>

          {/* Session info */}
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="p-2.5 rounded-lg bg-[var(--brand-500)] text-white"><Shield size={16}/></span>
              <div>
                <h3 className="text-sm font-bold text-black dark:text-white m-0">Active Session</h3>
                <p className="text-[11px] text-slate-400 m-0">Your current login session details.</p>
              </div>
            </div>
            <div className="divide-y divide-neutral-100 dark:divide-slate-800 rounded-lg border border-neutral-200 dark:border-slate-800 overflow-hidden">
              {[
                ['Logged in as', user?.name||'—'],
                ['Role',         rc?.label||'—'],
                ['Auth method',  'JWT Bearer Token'],
                ['Token stored', 'Local Storage'],
              ].map(([k,v],i)=>(
                <div key={k} className={`flex justify-between items-center px-4 py-2.5 text-xs ${i%2===0?'bg-white dark:bg-[#0f1623]':'bg-slate-50/50 dark:bg-slate-800/30'}`}>
                  <span className="text-slate-400 font-medium">{k}</span>
                  <span className="font-bold text-black dark:text-white">{v}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── SYSTEM ── */}
      {activeTab==='system'&&(
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-lg bg-[var(--brand-500)] text-white"><Monitor size={16}/></span>
            <div>
              <h3 className="text-sm font-bold text-black dark:text-white m-0">Platform Diagnostics</h3>
              <p className="text-[11px] text-slate-400 m-0">Live system health and workspace info.</p>
            </div>
          </div>
          <div className="h-px bg-neutral-200 dark:bg-slate-800"/>

          {/* Live health indicators */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-3 text-center">
              <Database size={16} className={`mx-auto mb-1 ${dbStatus==='ok'?'text-emerald-500':dbStatus==='error'?'text-red-500':'text-slate-400 animate-pulse'}`}/>
              <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Database</div>
              <div className={`text-xs font-black mt-0.5 ${dbStatus==='ok'?'text-emerald-600':dbStatus==='error'?'text-red-500':'text-slate-400'}`}>
                {dbStatus==='checking'?'Checking…':dbStatus==='ok'?'Connected':'Error'}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-3 text-center">
              <Wifi size={16} className="mx-auto mb-1 text-emerald-500"/>
              <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">API</div>
              <div className="text-xs font-black mt-0.5 text-emerald-600">
                {apiLatency!==null?`${apiLatency}ms`:'—'}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-3 text-center">
              <Server size={16} className="mx-auto mb-1 text-blue-500"/>
              <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Environment</div>
              <div className="text-xs font-black mt-0.5 text-blue-600">Production</div>
            </div>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-slate-800 rounded-lg border border-neutral-200 dark:border-slate-800 overflow-hidden">
            {[
              ['Application Frame', 'React + Vite'],
              ['Local Cache',       `${reportsCount} reports cached`],
              ['Service Status',    '● LIVE'],
              ['Storage Engine',    'LocalStorage + PostgreSQL'],
              ['Backend',           'Node.js / Express on AWS EC2'],
            ].map(([label,value],i)=>(
              <div key={String(label)} className={`flex justify-between items-center px-4 py-2.5 text-xs ${i%2===0?'bg-white dark:bg-[#0f1623]':'bg-slate-50/50 dark:bg-slate-800/30'}`}>
                <span className="text-slate-400 font-medium">{label}</span>
                <span className={`font-bold ${String(value).startsWith('●')?'text-emerald-500':'text-black dark:text-white'}`}>{value}</span>
              </div>
            ))}
          </div>

          <button onClick={()=>{safeStorage.clear();showToast('Cache cleared. Please refresh.', 'success');}}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-red-200 dark:border-red-900/40 text-red-500 font-bold text-xs hover:bg-red-50 dark:hover:bg-red-950/20 transition">
            <Trash2 size={13}/> Clear Local Application Cache
          </button>
        </Card>
      )}
    </div>
  );
};
