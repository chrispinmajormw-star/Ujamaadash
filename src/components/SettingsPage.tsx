import React from 'react';
import { Moon, Sun, Monitor, Shield, Sparkles, User as UserIcon, HelpCircle, Bell, Calendar, ListTodo, Clock, Cloud, CloudOff, MessageSquare } from 'lucide-react';
import { User } from '../types';
import { Card, Kicker, Btn } from './SubComponents';
import { ROLE_CFG } from '../data';
import { safeStorage } from '../utils/storage';
import { CloudSyncConfig, loadSyncConfig, saveSyncConfig, enableCloudSync, disableCloudSync } from '../utils/cloudSync';
import { SMSConfig, loadSMSConfig as loadSMSConfigUtil, saveSMSConfig as saveSMSConfigUtil, enableSMSNotifications, disableSMSNotifications } from '../utils/sms';

interface SettingsPageProps {
  user: User | null;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  showToast: (msg: string) => void;
  reportsCount: number;
  notificationPrefs?: {
    email: boolean;
    push: boolean;
    pending: boolean;
    approved: boolean;
    rejected: boolean;
    forwarded: boolean;
  };
  setNotificationPrefs?: (prefs: any) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  user,
  darkMode,
  setDarkMode,
  showToast,
  reportsCount,
  notificationPrefs,
  setNotificationPrefs
}) => {
  const rc = user ? ROLE_CFG[user.role] : null;

  const [notifyTraining, setNotifyTraining] = React.useState(() => {
    const saved = safeStorage.getItem('scaleup_notif_training');
    return saved !== null ? saved === 'true' : true;
  });
  const [notifyMeetings, setNotifyMeetings] = React.useState(() => {
    const saved = safeStorage.getItem('scaleup_notif_meetings');
    return saved !== null ? saved === 'true' : true;
  });
  const [weekStartMonday, setWeekStartMonday] = React.useState(() => {
    const saved = safeStorage.getItem('scaleup_week_monday');
    return saved !== null ? saved === 'true' : false;
  });
  const [taskReminders, setTaskReminders] = React.useState(() => {
    const saved = safeStorage.getItem('scaleup_task_reminders');
    return saved !== null ? saved === 'true' : true;
  });
  const [cloudSyncConfig, setCloudSyncConfig] = React.useState<CloudSyncConfig>(loadSyncConfig());
  const [smsConfig, setSmsConfig] = React.useState<SMSConfig>(loadSMSConfigUtil());

  const toggleDarkMode = () => {
    const nextVal = !darkMode;
    setDarkMode(nextVal);
    showToast(`🌙 Dark mode turned ${nextVal ? 'ON' : 'OFF'}`);
  };
  const handleToggleTraining = () => {
    const next = !notifyTraining;
    setNotifyTraining(next);
    safeStorage.setItem('scaleup_notif_training', String(next));
    showToast(`🔔 Training event alerts turned ${next ? 'ON' : 'OFF'}`);
  };
  const handleToggleMeetings = () => {
    const next = !notifyMeetings;
    setNotifyMeetings(next);
    safeStorage.setItem('scaleup_notif_meetings', String(next));
    showToast(`🔔 Meeting alerts turned ${next ? 'ON' : 'OFF'}`);
  };
  const handleToggleWeekStart = () => {
    const next = !weekStartMonday;
    setWeekStartMonday(next);
    safeStorage.setItem('scaleup_week_monday', String(next));
    showToast(`📅 Week start set to ${next ? 'Monday' : 'Sunday'}`);
  };
  const handleToggleReminders = () => {
    const next = !taskReminders;
    setTaskReminders(next);
    safeStorage.setItem('scaleup_task_reminders', String(next));
    showToast(`⏰ Task reminders turned ${next ? 'ON' : 'OFF'}`);
  };

  // ── Reusable toggle rows ──────────────────────────────────────
  const ToggleRow = ({
    icon, label, sub, value, onChange, border = true
  }: {
    icon: React.ReactNode;
    label: string;
    sub: string;
    value: boolean;
    onChange: () => void;
    border?: boolean;
  }) => (
    <div className={`flex items-center justify-between py-3 ${border ? 'border-b border-neutral-200 dark:border-slate-800' : ''}`}>
      <div className="flex items-start gap-3">
        <span className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-500 mt-0.5 flex-shrink-0">
          {icon}
        </span>
        <div>
          <div className="text-sm font-bold text-black dark:text-white">{label}</div>
          <div className="text-xs text-black dark:text-white mt-0.5">{sub}</div>
        </div>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 ml-4 ${
          value ? 'bg-orange-500' : 'bg-gray-200 dark:bg-slate-700'
        }`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Page Header */}
      <div>
        <Kicker text="Application Preferences" />
        <h1 className="text-base font-bold text-slate-900 dark:text-slate-50 m-0">
          System Settings
        </h1>
        <p className="text-xs text-black dark:text-white mt-1 m-0">
          Customize display, alerts, and review account capabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">

          {/* ── Notifications Card ── */}
          <div className="bg-white dark:bg-[#0f1623] border border-neutral-200 dark:border-slate-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="p-2.5 rounded-xl bg-blue-500 text-white shadow-sm shadow-blue-200">
                <Bell size={18} />
              </span>
              <div>
                <h3 className="text-base font-bold text-black dark:text-white m-0">Notification Preferences</h3>
                <p className="text-xs text-black dark:text-white opacity-60 m-0">Configure how you receive alerts.</p>
              </div>
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-800 mb-5" />

            {notificationPrefs && setNotificationPrefs && (
              <div className="space-y-4">
                <SettingToggle
                  label="Email Notifications"
                  sub="Receive updates via email"
                  value={notificationPrefs.email}
                  onChange={() => setNotificationPrefs({ ...notificationPrefs, email: !notificationPrefs.email })}
                />
                <SettingToggle
                  label="Push Notifications"
                  sub="Receive in-app alerts"
                  value={notificationPrefs.push}
                  onChange={() => setNotificationPrefs({ ...notificationPrefs, push: !notificationPrefs.push })}
                />
                <div className="h-px bg-slate-200 dark:bg-slate-800 my-4" />
                <SettingToggle
                  label="Pending Reports"
                  sub="Alert when reports need review"
                  value={notificationPrefs.pending}
                  onChange={() => setNotificationPrefs({ ...notificationPrefs, pending: !notificationPrefs.pending })}
                />
                <SettingToggle
                  label="Approved Reports"
                  sub="Alert when reports are approved"
                  value={notificationPrefs.approved}
                  onChange={() => setNotificationPrefs({ ...notificationPrefs, approved: !notificationPrefs.approved })}
                />
                <SettingToggle
                  label="Rejected Reports"
                  sub="Alert when reports are rejected"
                  value={notificationPrefs.rejected}
                  onChange={() => setNotificationPrefs({ ...notificationPrefs, rejected: !notificationPrefs.rejected })}
                />
                <SettingToggle
                  label="Forwarded Reports"
                  sub="Alert when reports are forwarded"
                  value={notificationPrefs.forwarded}
                  onChange={() => setNotificationPrefs({ ...notificationPrefs, forwarded: !notificationPrefs.forwarded })}
                />
              </div>
            )}
          </div>

          {/* ── Cloud Sync Card ── */}
          <div className="bg-white dark:bg-[#0f1623] border border-neutral-200 dark:border-slate-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="p-2.5 rounded-xl bg-purple-500 text-white shadow-sm shadow-purple-200">
                {cloudSyncConfig.enabled ? <Cloud size={18} /> : <CloudOff size={18} />}
              </span>
              <div>
                <h3 className="text-base font-bold text-black dark:text-white m-0">Cloud Sync</h3>
                <p className="text-xs text-black dark:text-white opacity-60 m-0">Backup and sync data across devices</p>
              </div>
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-800 mb-5" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-black dark:text-white">Enable Cloud Sync</div>
                  <div className="text-xs text-black dark:text-white opacity-60">Sync data to cloud for backup</div>
                </div>
                <button
                  onClick={() => {
                    if (cloudSyncConfig.enabled) {
                      disableCloudSync();
                      setCloudSyncConfig({ ...cloudSyncConfig, enabled: false });
                      showToast("☁️ Cloud sync disabled");
                    } else {
                      enableCloudSync();
                      setCloudSyncConfig({ ...cloudSyncConfig, enabled: true });
                      showToast("☁️ Cloud sync enabled");
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30 ${
                    cloudSyncConfig.enabled ? 'bg-purple-500' : 'bg-gray-200 dark:bg-slate-700'
                  }`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ${cloudSyncConfig.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              {cloudSyncConfig.enabled && cloudSyncConfig.lastSync && (
                <div className="text-xs text-slate-500">
                  Last synced: {new Date(cloudSyncConfig.lastSync).toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* ── SMS Notifications Card ── */}
          <div className="bg-white dark:bg-[#0f1623] border border-neutral-200 dark:border-slate-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="p-2.5 rounded-xl bg-green-500 text-white shadow-sm shadow-green-200">
                {smsConfig.enabled ? <MessageSquare size={18} /> : <MessageSquare size={18} />}
              </span>
              <div>
                <h3 className="text-base font-bold text-black dark:text-white m-0">SMS Notifications</h3>
                <p className="text-xs text-black dark:text-white opacity-60 m-0">Alerts for limited internet regions</p>
              </div>
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-800 mb-5" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-black dark:text-white">Enable SMS Alerts</div>
                  <div className="text-xs text-black dark:text-white opacity-60">Receive SMS for important updates</div>
                </div>
                <button
                  onClick={() => {
                    if (smsConfig.enabled) {
                      disableSMSNotifications();
                      setSmsConfig({ ...smsConfig, enabled: false });
                      showToast("📱 SMS notifications disabled");
                    } else {
                      enableSMSNotifications();
                      setSmsConfig({ ...smsConfig, enabled: true });
                      showToast("📱 SMS notifications enabled");
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 ${
                    smsConfig.enabled ? 'bg-green-500' : 'bg-gray-200 dark:bg-slate-700'
                  }`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ${smsConfig.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              {smsConfig.enabled && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-black dark:text-white mb-1 block">Phone Number</label>
                    <input
                      type="tel"
                      value={smsConfig.phoneNumber}
                      onChange={(e) => {
                        const updated = { ...smsConfig, phoneNumber: e.target.value };
                        setSmsConfig(updated);
                        saveSMSConfigUtil(updated);
                      }}
                      placeholder="+265..."
                      className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-[#0f1623] text-black dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-black dark:text-white mb-1 block">SMS Provider</label>
                    <select
                      value={smsConfig.provider}
                      onChange={(e) => {
                        const updated = { ...smsConfig, provider: e.target.value as 'twilio' | 'africas_talking' | 'custom' };
                        setSmsConfig(updated);
                        saveSMSConfigUtil(updated);
                      }}
                      className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-[#0f1623] text-black dark:text-white"
                    >
                      <option value="twilio">Twilio</option>
                      <option value="africas_talking">Africa's Talking</option>
                      <option value="custom">Custom Provider</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Appearance Card ── */}
          <div className="bg-white dark:bg-[#0f1623] border border-neutral-200 dark:border-slate-800 rounded-lg p-6">

            {/* Card Header */}
            <div className="flex items-center gap-3 mb-5">
              <span className="p-2.5 rounded-xl bg-orange-500 text-white shadow-sm shadow-orange-200">
                <Sparkles size={18} />
              </span>
              <div>
                <h3 className="text-base font-bold text-black dark:text-white m-0">Appearance Theme</h3>
                <p className="text-xs text-black dark:text-white opacity-60 m-0">Set the background contrast mode.</p>
              </div>
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-800 mb-5" />

            {/* Active mode row */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-orange-50 dark:bg-slate-800 border border-orange-200 dark:border-slate-700 mb-4">
              <div className="flex items-center gap-3">
                {darkMode
                  ? <Moon className="text-violet-400" size={20} />
                  : <Sun className="text-orange-500" size={20} />
                }
                <div>
                  <div className="text-sm font-bold text-black dark:text-white">
                    {darkMode ? 'Dark Mode Active' : 'Light Mode Active'}
                  </div>
                  <div className="text-xs text-black dark:text-white">
                    {darkMode
                      ? 'Dark slate background — easy on the eyes at night.'
                      : 'Clean white & orange — sharp and professional.'}
                  </div>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${
                  darkMode ? 'bg-orange-500' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ${darkMode ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Light / Dark selector tiles */}
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => { if (darkMode) setDarkMode(false); }}
                className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 cursor-pointer transition-all ${
                  !darkMode
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10'
                    : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-orange-200'
                }`}
              >
                <Sun size={26} className={!darkMode ? 'text-orange-500' : 'text-gray-300 dark:text-slate-500'} />
                <span className={`text-xs font-bold mt-2 ${!darkMode ? 'text-orange-600' : 'text-black dark:text-white opacity-60'}`}>
                  Light Mode
                </span>
                {!darkMode && (
                  <span className="text-[10px] text-orange-400 font-semibold mt-0.5">Active</span>
                )}
              </div>
              <div
                onClick={() => { if (!darkMode) setDarkMode(true); }}
                className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 cursor-pointer transition-all ${
                  darkMode
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10'
                    : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-orange-200'
                }`}
              >
                <Moon size={26} className={darkMode ? 'text-orange-500' : 'text-gray-300 dark:text-slate-500'} />
                <span className={`text-xs font-bold mt-2 ${darkMode ? 'text-orange-600 dark:text-orange-400' : 'text-black dark:text-white opacity-60'}`}>
                  Dark Mode
                </span>
                {darkMode && (
                  <span className="text-[10px] text-orange-400 font-semibold mt-0.5">Active</span>
                )}
              </div>
            </div>
          </div>

          {/* ── Alerts Card ── */}
          <div className="bg-white dark:bg-[#0f1623] border border-neutral-200 dark:border-slate-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="p-2.5 rounded-xl bg-orange-500 text-white shadow-sm shadow-orange-200">
                <Bell size={18} />
              </span>
              <div>
                <h3 className="text-base font-bold text-black dark:text-white m-0">Operations & Calendar Alerts</h3>
                <p className="text-xs text-black dark:text-white opacity-60 m-0">Set triggers for visits, events, and agenda layouts.</p>
              </div>
            </div>
            <div className="h-px bg-slate-200 dark:bg-slate-800 mb-2" />
            <ToggleRow
              icon={<Calendar size={15} />}
              label="Training Events Alerts"
              sub="Get notifications for scheduled Trainer TOT and curriculum sessions."
              value={notifyTraining}
              onChange={handleToggleTraining}
            />
            <ToggleRow
              icon={<Clock size={15} />}
              label="Meeting Alerts"
              sub="Receive reminders for regional officer coordinate syncs."
              value={notifyMeetings}
              onChange={handleToggleMeetings}
            />
            <ToggleRow
              icon={<Calendar size={15} />}
              label="Week starts on Monday"
              sub="Arrange the Operation Calendar with Monday as the first day."
              value={weekStartMonday}
              onChange={handleToggleWeekStart}
            />
            <ToggleRow
              icon={<ListTodo size={15} />}
              label="Task Reminders"
              sub="Sync dashboard badges for pending operations list actions."
              value={taskReminders}
              onChange={handleToggleReminders}
              border={false}
            />
          </div>

          {/* ── Diagnostics Card ── */}
          <div className="bg-white dark:bg-[#0f1623] border border-neutral-200 dark:border-slate-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="p-2.5 rounded-lg bg-orange-500 text-white">
                <Monitor size={18} />
              </span>
              <div>
                <h3 className="text-base font-bold text-black dark:text-white m-0">Platform Diagnostics</h3>
                <p className="text-xs text-black dark:text-white opacity-60 m-0">System settings and workspace local stats.</p>
              </div>
            </div>
            <div className="h-px bg-slate-200 dark:bg-slate-800 mb-4" />
            <div className="space-y-0 rounded-lg border border-neutral-200 dark:border-slate-800 overflow-hidden text-xs">
              {[
                ['Application Frame', 'React 19 + Vite Container'],
                ['Local Stored Cache', `Active (${reportsCount} reports)`],
                ['Service Environment', '● LIVE RUNNING'],
                ['Storage Engine', 'Local Storage Hook API'],
              ].map(([label, value], i, arr) => (
                <div
                  key={label}
                  className={`flex justify-between items-center px-4 py-3 ${
                    i < arr.length - 1 ? 'border-b border-orange-50 dark:border-slate-800' : ''
                  } ${i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-orange-50/40 dark:bg-slate-800/30'}`}
                >
                  <span className="text-black dark:text-white font-medium">{label}</span>
                  <span className={`font-bold ${value.startsWith('●') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-200'}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                safeStorage.clear();
                showToast('♻️ Cache cleared. Please refresh page.');
              }}
              className="mt-4 w-full py-2.5 rounded-xl border-2 border-orange-200 dark:border-slate-700 text-orange-600 dark:text-slate-300 font-bold text-sm hover:bg-orange-50 dark:hover:bg-slate-800 transition-colors"
            >
              Clear Local Application Cache
            </button>
          </div>

        </div>

        {/* ── Right Column ── */}
        <div className="space-y-5">

          {/* Profile Card */}
          <div className="bg-white dark:bg-[#0f1623] border border-neutral-200 dark:border-slate-800 rounded-lg p-6 text-center">
            <div className="text-[10px] font-extrabold text-orange-500 uppercase tracking-widest mb-4">
              Session Profile
            </div>
            {user ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-orange-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-orange-200 dark:shadow-orange-950/30 mb-3">
                  {user.avatar}
                </div>
                <div className="font-extrabold text-black dark:text-white text-base mb-0.5">
                  {user.name}
                </div>
                <div className="text-xs text-black dark:text-white opacity-60 mb-3">{user.email}</div>
                {rc && (
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{ color: rc.color, backgroundColor: rc.bg }}
                  >
                    {rc.label}
                  </span>
                )}
                {user.district && (
                  <div className="text-xs text-black dark:text-white mt-2 font-medium">
                    📍 {user.district} Region
                  </div>
                )}
                {/* Divider */}
                <div className="w-full h-px bg-slate-200 dark:bg-slate-800 my-4" />
                <div className="w-full text-left space-y-2">
                  {[
                    ['Role', rc?.label || '—'],
                    ['Access', 'Portal Authenticated'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span className="text-black dark:text-white opacity-60">{k}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-4">
                <div className="w-14 h-14 rounded-full bg-orange-50 dark:bg-slate-800 text-orange-400 flex items-center justify-center mb-3 border-2 border-orange-100 dark:border-slate-700">
                  <UserIcon size={24} />
                </div>
                <div className="font-extrabold text-slate-700 dark:text-slate-300 text-sm">
                  Public Guest Access
                </div>
                <p className="text-xs text-black dark:text-white opacity-60 mt-2 leading-relaxed">
                  Log in with credentials from your district lead.
                </p>
              </div>
            )}
          </div>

          {/* Support Card */}
          <div className="bg-orange-500 rounded-2xl p-5 relative overflow-hidden shadow-md shadow-orange-200 dark:shadow-orange-950/30">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -translate-y-8 translate-x-8" />
            <div className="relative">
              <div className="flex items-center gap-2 text-white mb-2">
                <HelpCircle size={16} />
                <span className="text-xs font-extrabold uppercase tracking-wide">Safeguarding Contact</span>
              </div>
              <p className="text-xs text-orange-100 leading-relaxed m-0">
                Need help using the Digital ScaleUp program? Contact the system admin via:
              </p>
              <div className="text-xs font-bold text-white mt-3 bg-white/15 rounded-lg px-3 py-2 break-all">
                support.pamodzi@ujamaa-africa.org
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
