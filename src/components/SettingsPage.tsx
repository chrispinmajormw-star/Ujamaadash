import React, { useState } from 'react';
import {
  Moon, Sun, Monitor, Shield, Sparkles,
  User as UserIcon, HelpCircle, Bell, Calendar,
  ListTodo, Clock, Trash2
} from 'lucide-react';
import { User } from '../types';
import { Card, Kicker } from './SubComponents';
import { ROLE_CFG } from '../data';
import { safeStorage } from '../utils/storage';

interface SettingsPageProps {
  user: User | null;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  showToast: (msg: string) => void;
  reportsCount: number;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  user, darkMode, setDarkMode, showToast, reportsCount
}) => {
  const rc = user ? ROLE_CFG[user.role] : null;
  const [activeTab, setActiveTab] = useState<'appearance' | 'notifications' | 'account' | 'system'>('appearance');

  const [notifyTraining, setNotifyTraining] = useState(() =>
    safeStorage.getItem('scaleup_notif_training') !== 'false');
  const [notifyMeetings, setNotifyMeetings] = useState(() =>
    safeStorage.getItem('scaleup_notif_meetings') !== 'false');
  const [weekStartMonday, setWeekStartMonday] = useState(() =>
    safeStorage.getItem('scaleup_week_monday') === 'true');
  const [taskReminders, setTaskReminders] = useState(() =>
    safeStorage.getItem('scaleup_task_reminders') !== 'false');

  // Toggle helpers
  const toggle = (
    val: boolean, set: (v: boolean) => void,
    key: string, msg: (v: boolean) => string
  ) => {
    const next = !val;
    set(next);
    safeStorage.setItem(key, String(next));
    showToast(msg(next));
  };

  // ── Reusable toggle row ──────────────────────
  const ToggleRow = ({ icon, label, sub, value, onChange, border = true }: {
    icon: React.ReactNode; label: string; sub: string;
    value: boolean; onChange: () => void; border?: boolean;
  }) => (
    <div className={`flex items-center justify-between py-3 ${border ? 'border-b border-neutral-200 dark:border-slate-800' : ''}`}>
      <div className="flex items-start gap-3">
        <span className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-orange-500 shrink-0">
          {icon}
        </span>
        <div>
          <div className="text-xs font-bold text-black dark:text-white">{label}</div>
          <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{sub}</div>
        </div>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ml-4 ${
          value ? 'bg-orange-500' : 'bg-gray-200 dark:bg-slate-700'
        }`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Sparkles },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'account', label: 'Account', icon: UserIcon },
    { id: 'system', label: 'System', icon: Monitor },
  ] as const;

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in-up">

      {/* Header */}
      <div>
        <Kicker text="Application Preferences" />
        <h1 className="text-base font-bold text-black dark:text-white m-0">System Settings</h1>
        <p className="text-xs text-black dark:text-white opacity-60 mt-1 m-0">
          Customize display, alerts, and account capabilities.
        </p>
      </div>

      {/* Tab switcher — matches curriculum page style */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg w-fit border border-neutral-200 dark:border-slate-800 flex-wrap">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === id
                ? 'bg-white dark:bg-[#0f1623] text-black dark:text-white shadow-sm border border-neutral-200 dark:border-slate-700'
                : 'text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* ── APPEARANCE TAB ── */}
      {activeTab === 'appearance' && (
        <Card className="p-5 space-y-5">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-lg bg-orange-500 text-white">
              <Sparkles size={16} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-black dark:text-white m-0">Appearance Theme</h3>
              <p className="text-[11px] text-slate-400 m-0">Set the background contrast mode.</p>
            </div>
          </div>

          <div className="h-px bg-neutral-200 dark:bg-slate-800" />

          {/* Active mode indicator */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-orange-50 dark:bg-slate-800 border border-orange-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              {darkMode
                ? <Moon className="text-violet-400" size={18} />
                : <Sun className="text-orange-500" size={18} />}
              <div>
                <div className="text-xs font-bold text-black dark:text-white">
                  {darkMode ? 'Dark Mode Active' : 'Light Mode Active'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {darkMode ? 'Dark slate — easy on the eyes at night.' : 'Clean white & orange — sharp and professional.'}
                </div>
              </div>
            </div>
            <button
              onClick={() => { setDarkMode(!darkMode); showToast(`🌙 Dark mode ${!darkMode ? 'ON' : 'OFF'}`); }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                darkMode ? 'bg-orange-500' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${darkMode ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Light / Dark tiles */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { mode: false, label: 'Light Mode', Icon: Sun },
              { mode: true,  label: 'Dark Mode',  Icon: Moon },
            ].map(({ mode, label, Icon }) => (
              <div
                key={label}
                onClick={() => setDarkMode(mode)}
                className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 cursor-pointer transition-all ${
                  darkMode === mode
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                    : 'border-neutral-200 dark:border-slate-700 hover:border-orange-200 dark:hover:border-orange-800'
                }`}
              >
                <Icon size={24} className={darkMode === mode ? 'text-orange-500' : 'text-slate-300 dark:text-slate-600'} />
                <span className={`text-xs font-bold mt-2 ${darkMode === mode ? 'text-orange-600 dark:text-orange-400' : 'text-slate-400'}`}>
                  {label}
                </span>
                {darkMode === mode && <span className="text-[10px] text-orange-400 mt-0.5">Active</span>}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── NOTIFICATIONS TAB ── */}
      {activeTab === 'notifications' && (
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="p-2.5 rounded-lg bg-orange-500 text-white">
              <Bell size={16} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-black dark:text-white m-0">Operations & Calendar Alerts</h3>
              <p className="text-[11px] text-slate-400 m-0">Set triggers for visits, events, and agenda layouts.</p>
            </div>
          </div>
          <div className="h-px bg-neutral-200 dark:bg-slate-800 mb-1" />
          <ToggleRow
            icon={<Calendar size={14} />}
            label="Training Event Alerts"
            sub="Get notifications for scheduled TOT and curriculum sessions."
            value={notifyTraining}
            onChange={() => toggle(notifyTraining, setNotifyTraining, 'scaleup_notif_training',
              v => `🔔 Training alerts ${v ? 'ON' : 'OFF'}`)}
          />
          <ToggleRow
            icon={<Clock size={14} />}
            label="Meeting Alerts"
            sub="Receive reminders for regional officer coordinate syncs."
            value={notifyMeetings}
            onChange={() => toggle(notifyMeetings, setNotifyMeetings, 'scaleup_notif_meetings',
              v => `🔔 Meeting alerts ${v ? 'ON' : 'OFF'}`)}
          />
          <ToggleRow
            icon={<Calendar size={14} />}
            label="Week starts on Monday"
            sub="Arrange the Operations Calendar with Monday as first day."
            value={weekStartMonday}
            onChange={() => toggle(weekStartMonday, setWeekStartMonday, 'scaleup_week_monday',
              v => `📅 Week start set to ${v ? 'Monday' : 'Sunday'}`)}
          />
          <ToggleRow
            icon={<ListTodo size={14} />}
            label="Task Reminders"
            sub="Sync dashboard badges for pending operations list actions."
            value={taskReminders}
            onChange={() => toggle(taskReminders, setTaskReminders, 'scaleup_task_reminders',
              v => `⏰ Task reminders ${v ? 'ON' : 'OFF'}`)}
            border={false}
          />
        </Card>
      )}

      {/* ── ACCOUNT TAB ── */}
      {activeTab === 'account' && (
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="p-2.5 rounded-lg bg-orange-500 text-white">
              <UserIcon size={16} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-black dark:text-white m-0">Session Profile</h3>
              <p className="text-[11px] text-slate-400 m-0">Your current authenticated account details.</p>
            </div>
          </div>
          <div className="h-px bg-neutral-200 dark:bg-slate-800 mb-4" />

          {user ? (
            <div className="space-y-4">
              {/* Avatar + name */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-orange-50 dark:bg-slate-800/50 border border-orange-100 dark:border-slate-700">
                <div className="w-14 h-14 rounded-full bg-orange-500 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
                  {user.avatar}
                </div>
                <div>
                  <div className="font-bold text-black dark:text-white text-sm">{user.name}</div>
                  <div className="text-[11px] text-slate-400">{user.email}</div>
                  {rc && (
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ color: rc.color, backgroundColor: rc.bg }}>
                      {rc.label}
                    </span>
                  )}
                </div>
              </div>

              {/* Details grid */}
              <div className="divide-y divide-neutral-100 dark:divide-slate-800 rounded-lg border border-neutral-200 dark:border-slate-800 overflow-hidden">
                {[
                  ['Role', rc?.label || '—'],
                  ['District', user.district || 'National'],
                  ['Access', 'Portal Authenticated'],
                  ['Status', user.status?.toUpperCase() || 'ACTIVE'],
                ].map(([k, v], i) => (
                  <div key={k} className={`flex justify-between items-center px-4 py-2.5 text-xs ${i % 2 === 0 ? 'bg-white dark:bg-[#0f1623]' : 'bg-slate-50/50 dark:bg-slate-800/30'}`}>
                    <span className="text-slate-400 font-medium">{k}</span>
                    <span className="font-bold text-black dark:text-white">{v}</span>
                  </div>
                ))}
              </div>

              {/* Support box */}
              <div className="bg-orange-500 rounded-xl p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/10 -translate-y-6 translate-x-6" />
                <div className="relative flex items-start gap-2">
                  <HelpCircle size={14} className="text-orange-100 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white mb-1">Safeguarding Support</div>
                    <div className="text-[11px] text-orange-100 leading-relaxed">
                      Contact: <span className="font-bold text-white">support.pamodzi@ujamaa-africa.org</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="w-14 h-14 rounded-full bg-orange-50 dark:bg-slate-800 flex items-center justify-center mb-3 border-2 border-orange-100 dark:border-slate-700">
                <UserIcon size={22} className="text-orange-400" />
              </div>
              <div className="font-bold text-slate-700 dark:text-slate-300 text-sm">Public Guest Access</div>
              <p className="text-xs text-slate-400 mt-1">Log in with credentials from your district lead.</p>
            </div>
          )}
        </Card>
      )}

      {/* ── SYSTEM TAB ── */}
      {activeTab === 'system' && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-lg bg-orange-500 text-white">
              <Monitor size={16} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-black dark:text-white m-0">Platform Diagnostics</h3>
              <p className="text-[11px] text-slate-400 m-0">System settings and workspace local stats.</p>
            </div>
          </div>
          <div className="h-px bg-neutral-200 dark:bg-slate-800" />

          <div className="divide-y divide-neutral-100 dark:divide-slate-800 rounded-lg border border-neutral-200 dark:border-slate-800 overflow-hidden">
            {[
              ['Application Frame', 'React 19 + Vite'],
              ['Local Stored Cache', `Active (${reportsCount} reports)`],
              ['Service Environment', '● LIVE RUNNING'],
              ['Storage Engine', 'Local Storage API'],
            ].map(([label, value], i) => (
              <div key={label} className={`flex justify-between items-center px-4 py-2.5 text-xs ${i % 2 === 0 ? 'bg-white dark:bg-[#0f1623]' : 'bg-slate-50/50 dark:bg-slate-800/30'}`}>
                <span className="text-slate-400 font-medium">{label}</span>
                <span className={`font-bold ${String(value).startsWith('●') ? 'text-emerald-500' : 'text-black dark:text-white'}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => { safeStorage.clear(); showToast('♻️ Cache cleared. Please refresh.'); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-red-200 dark:border-red-900/40 text-red-500 font-bold text-xs hover:bg-red-50 dark:hover:bg-red-950/20 transition"
          >
            <Trash2 size={13} /> Clear Local Application Cache
          </button>
        </Card>
      )}
    </div>
  );
};
