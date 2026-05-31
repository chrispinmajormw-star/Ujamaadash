import React, { useState } from 'react';
import { Moon, Sun, Monitor, Shield, Sparkles, User as UserIcon, HelpCircle, Bell, Calendar, ListTodo, Clock, Cloud, CloudOff, MessageSquare, Lock, ChevronRight, Edit2, Save, X, Menu, Mail, Check, ArrowRight } from 'lucide-react';
import { User } from '../types';
import { Card, Kicker, Btn } from './SubComponents';
import { ROLE_CFG } from '../data';
import { safeStorage } from '../utils/storage';
import { CloudSyncConfig, loadSyncConfig, saveSyncConfig, enableCloudSync, disableCloudSync } from '../utils/cloudSync';
import { SMSConfig, loadSMSConfig as loadSMSConfigUtil, saveSMSConfig as saveSMSConfigUtil, enableSMSNotifications, disableSMSNotifications } from '../utils/sms';

type ThemeMode = 'light' | 'dark' | 'system';

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
  setUser?: (user: User | null) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  user,
  darkMode,
  setDarkMode,
  showToast,
  reportsCount,
  notificationPrefs,
  setNotificationPrefs,
  setUser
}) => {
  const rc = user ? ROLE_CFG[user.role] : null;

  // Active section state for sidebar navigation
  const [activeSection, setActiveSection] = useState('profile');
  
  // Mobile sidebar toggle state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Theme mode state
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = safeStorage.getItem('ett_theme_mode') as ThemeMode;
    return saved || 'system';
  });

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    district: user?.district || ''
  });

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

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

  // Theme mode handler - override system preferences when light/dark is explicitly selected
  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    safeStorage.setItem('ett_theme_mode', mode);
    
    // When light or dark is explicitly selected, override system preference
    if (mode === 'light') {
      setDarkMode(false);
      safeStorage.setItem('ett_theme', 'light');
      showToast('☀️ Light mode enabled');
    } else if (mode === 'dark') {
      setDarkMode(true);
      safeStorage.setItem('ett_theme', 'dark');
      showToast('🌙 Dark mode enabled');
    } else {
      // System mode - respect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
      safeStorage.setItem('ett_theme', prefersDark ? 'dark' : 'light');
      showToast('🖥️ Theme set to system preference');
    }
  };

  // Profile editing handlers
  const handleSaveProfile = () => {
    if (user && setUser) {
      const updatedUser = { ...user, ...profileForm };
      setUser(updatedUser);
      safeStorage.setItem('ett_curr_user', JSON.stringify(updatedUser));
      setIsEditingProfile(false);
      showToast('✅ Profile updated successfully');
    }
  };

  const handleCancelEdit = () => {
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
      district: user?.district || ''
    });
    setIsEditingProfile(false);
  };

  // Password change handlers
  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('❌ Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast('❌ Password must be at least 6 characters');
      return;
    }
    // In a real app, this would validate current password and update via API
    showToast('✅ Password changed successfully');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordForm(false);
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
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-[#0f1623] border border-slate-200 dark:border-slate-800 shadow-lg"
      >
        <Menu size={24} className="text-slate-600 dark:text-slate-400" />
      </button>

      {/* Sidebar Navigation */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-[#0f1623] border-r border-slate-200 dark:border-slate-800 p-4 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-6">
          <Kicker text="Settings" />
          <h2 className="text-lg font-bold text-black dark:text-white">Preferences</h2>
        </div>
        
        <nav className="space-y-1">
          {[
            { id: 'profile', label: 'Profile', icon: UserIcon },
            { id: 'appearance', label: 'Appearance', icon: Sparkles },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security', icon: Lock },
            { id: 'sync', label: 'Sync & Backup', icon: Cloud },
            { id: 'diagnostics', label: 'Diagnostics', icon: Monitor },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeSection === item.id
                  ? 'bg-orange-500 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <item.icon size={18} />
              {item.label}
              {activeSection === item.id && <ChevronRight size={16} className="ml-auto" />}
            </button>
          ))}
        </nav>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className="space-y-6">
              <div>
                <Kicker text="Account" />
                <h1 className="text-2xl font-bold text-black dark:text-white">Profile Settings</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage your personal information and account details.</p>
              </div>

              <Card className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-orange-500 text-white font-black text-2xl flex items-center justify-center">
                      {user?.avatar || user?.name?.[0] || 'U'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-black dark:text-white">{user?.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
                      {rc && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ color: rc.color, backgroundColor: rc.bg }}>
                          {rc.label}
                        </span>
                      )}
                    </div>
                  </div>
                  {!isEditingProfile ? (
                    <Btn size="sm" onClick={() => setIsEditingProfile(true)}>
                      <Edit2 size={14} className="mr-2" /> Edit Profile
                    </Btn>
                  ) : (
                    <div className="flex gap-2">
                      <Btn variant="secondary" size="sm" onClick={handleCancelEdit}>
                        <X size={14} className="mr-2" /> Cancel
                      </Btn>
                      <Btn size="sm" onClick={handleSaveProfile}>
                        <Save size={14} className="mr-2" /> Save
                      </Btn>
                    </div>
                  )}
                </div>

                {isEditingProfile ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-black dark:text-white mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0f1623] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black dark:text-white mb-2">Email Address</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0f1623] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black dark:text-white mb-2">District</label>
                      <input
                        type="text"
                        value={profileForm.district}
                        onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0f1623] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-sm text-slate-500 dark:text-slate-400">Full Name</span>
                      <span className="text-sm font-medium text-black dark:text-white">{user?.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-sm text-slate-500 dark:text-slate-400">Email Address</span>
                      <span className="text-sm font-medium text-black dark:text-white">{user?.email}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-sm text-slate-500 dark:text-slate-400">Role</span>
                      <span className="text-sm font-medium text-black dark:text-white">{rc?.label}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-slate-500 dark:text-slate-400">District</span>
                      <span className="text-sm font-medium text-black dark:text-white">{user?.district || 'Not assigned'}</span>
                    </div>
                  </div>
                )}
              </Card>

              {/* Password Change Card */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Lock size={20} className="text-orange-500" />
                  <h3 className="text-lg font-bold text-black dark:text-white">Change Password</h3>
                </div>
                
                {!showPasswordForm ? (
                  <Btn size="sm" onClick={() => setShowPasswordForm(true)}>
                    Change Password
                  </Btn>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-black dark:text-white mb-2">Current Password</label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0f1623] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black dark:text-white mb-2">New Password</label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0f1623] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black dark:text-white mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0f1623] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Btn size="sm" onClick={handleChangePassword}>
                        Update Password
                      </Btn>
                      <Btn variant="secondary" size="sm" onClick={() => setShowPasswordForm(false)}>
                        Cancel
                      </Btn>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Appearance Section */}
          {activeSection === 'appearance' && (
            <div className="space-y-6">
              <div>
                <Kicker text="Display" />
                <h1 className="text-2xl font-bold text-black dark:text-white">Appearance</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Customize the look and feel of the application.</p>
              </div>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles size={20} className="text-orange-500" />
                  <h3 className="text-lg font-bold text-black dark:text-white">Theme Mode</h3>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div
                    onClick={() => handleThemeChange('light')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      themeMode === 'light'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-orange-200'
                    }`}
                  >
                    <Sun size={32} className={themeMode === 'light' ? 'text-orange-500' : 'text-slate-400'} />
                    <div className="mt-2 text-sm font-bold text-black dark:text-white">Light</div>
                    {themeMode === 'light' && <div className="text-xs text-orange-500 font-semibold">Active</div>}
                  </div>
                  <div
                    onClick={() => handleThemeChange('dark')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      themeMode === 'dark'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-orange-200'
                    }`}
                  >
                    <Moon size={32} className={themeMode === 'dark' ? 'text-orange-500' : 'text-slate-400'} />
                    <div className="mt-2 text-sm font-bold text-black dark:text-white">Dark</div>
                    {themeMode === 'dark' && <div className="text-xs text-orange-500 font-semibold">Active</div>}
                  </div>
                  <div
                    onClick={() => handleThemeChange('system')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      themeMode === 'system'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-orange-200'
                    }`}
                  >
                    <Monitor size={32} className={themeMode === 'system' ? 'text-orange-500' : 'text-slate-400'} />
                    <div className="mt-2 text-sm font-bold text-black dark:text-white">System</div>
                    {themeMode === 'system' && <div className="text-xs text-orange-500 font-semibold">Active</div>}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <div>
                <Kicker text="Alerts" />
                <h1 className="text-2xl font-bold text-black dark:text-white">Notification Preferences</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Configure how you receive alerts and updates.</p>
              </div>

              <Card className="p-6">
                {notificationPrefs && setNotificationPrefs && (
                  <div className="space-y-4">
                    <ToggleRow
                      icon={<Mail size={15} />}
                      label="Email Notifications"
                      sub="Receive updates via email"
                      value={notificationPrefs.email}
                      onChange={() => setNotificationPrefs({ ...notificationPrefs, email: !notificationPrefs.email })}
                    />
                    <ToggleRow
                      icon={<Bell size={15} />}
                      label="Push Notifications"
                      sub="Receive in-app alerts"
                      value={notificationPrefs.push}
                      onChange={() => setNotificationPrefs({ ...notificationPrefs, push: !notificationPrefs.push })}
                    />
                    <div className="h-px bg-slate-200 dark:bg-slate-800 my-4" />
                    <ToggleRow
                      icon={<Clock size={15} />}
                      label="Pending Reports"
                      sub="Alert when reports need review"
                      value={notificationPrefs.pending}
                      onChange={() => setNotificationPrefs({ ...notificationPrefs, pending: !notificationPrefs.pending })}
                    />
                    <ToggleRow
                      icon={<Check size={15} />}
                      label="Approved Reports"
                      sub="Alert when reports are approved"
                      value={notificationPrefs.approved}
                      onChange={() => setNotificationPrefs({ ...notificationPrefs, approved: !notificationPrefs.approved })}
                    />
                    <ToggleRow
                      icon={<X size={15} />}
                      label="Rejected Reports"
                      sub="Alert when reports are rejected"
                      value={notificationPrefs.rejected}
                      onChange={() => setNotificationPrefs({ ...notificationPrefs, rejected: !notificationPrefs.rejected })}
                    />
                    <ToggleRow
                      icon={<ArrowRight size={15} />}
                      label="Forwarded Reports"
                      sub="Alert when reports are forwarded"
                      value={notificationPrefs.forwarded}
                      onChange={() => setNotificationPrefs({ ...notificationPrefs, forwarded: !notificationPrefs.forwarded })}
                    />
                    <div className="h-px bg-slate-200 dark:bg-slate-800 my-4" />
                    <ToggleRow
                      icon={<Calendar size={15} />}
                      label="Training Events Alerts"
                      sub="Get notifications for scheduled sessions"
                      value={notifyTraining}
                      onChange={handleToggleTraining}
                    />
                    <ToggleRow
                      icon={<ListTodo size={15} />}
                      label="Task Reminders"
                      sub="Sync dashboard badges for pending tasks"
                      value={taskReminders}
                      onChange={handleToggleReminders}
                      border={false}
                    />
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <div>
                <Kicker text="Protection" />
                <h1 className="text-2xl font-bold text-black dark:text-white">Security Settings</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage your account security and privacy.</p>
              </div>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Shield size={20} className="text-orange-500" />
                  <h3 className="text-lg font-bold text-black dark:text-white">SMS Notifications</h3>
                </div>

                <div className="space-y-4">
                  <ToggleRow
                    icon={<MessageSquare size={15} />}
                    label="Enable SMS Alerts"
                    sub="Receive SMS for important updates"
                    value={smsConfig.enabled}
                    onChange={() => {
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
                  />
                  {smsConfig.enabled && (
                    <div className="space-y-3 pl-4">
                      <div>
                        <label className="block text-sm font-bold text-black dark:text-white mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={smsConfig.phoneNumber}
                          onChange={(e) => {
                            const updated = { ...smsConfig, phoneNumber: e.target.value };
                            setSmsConfig(updated);
                            saveSMSConfigUtil(updated);
                          }}
                          placeholder="+265..."
                          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0f1623] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-black dark:text-white mb-2">SMS Provider</label>
                        <select
                          value={smsConfig.provider}
                          onChange={(e) => {
                            const updated = { ...smsConfig, provider: e.target.value as 'twilio' | 'africas_talking' | 'custom' };
                            setSmsConfig(updated);
                            saveSMSConfigUtil(updated);
                          }}
                          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0f1623] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="twilio">Twilio</option>
                          <option value="africas_talking">Africa's Talking</option>
                          <option value="custom">Custom Provider</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Sync Section */}
          {activeSection === 'sync' && (
            <div className="space-y-6">
              <div>
                <Kicker text="Backup" />
                <h1 className="text-2xl font-bold text-black dark:text-white">Sync & Backup</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Configure cloud sync and data backup options.</p>
              </div>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Cloud size={20} className="text-orange-500" />
                  <h3 className="text-lg font-bold text-black dark:text-white">Cloud Sync</h3>
                </div>

                <div className="space-y-4">
                  <ToggleRow
                    icon={cloudSyncConfig.enabled ? <Cloud size={15} /> : <CloudOff size={15} />}
                    label="Enable Cloud Sync"
                    sub="Sync data to cloud for backup"
                    value={cloudSyncConfig.enabled}
                    onChange={() => {
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
                  />
                  {cloudSyncConfig.enabled && cloudSyncConfig.lastSync && (
                    <div className="text-sm text-slate-500 pl-4">
                      Last synced: {new Date(cloudSyncConfig.lastSync).toLocaleString()}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Diagnostics Section */}
          {activeSection === 'diagnostics' && (
            <div className="space-y-6">
              <div>
                <Kicker text="System" />
                <h1 className="text-2xl font-bold text-black dark:text-white">Platform Diagnostics</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">System settings and workspace local stats.</p>
              </div>

              <Card className="p-6">
                <div className="space-y-0 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden text-sm">
                  {[
                    ['Application Frame', 'React 19 + Vite Container'],
                    ['Local Stored Cache', `Active (${reportsCount} reports)`],
                    ['Service Environment', '● LIVE RUNNING'],
                    ['Storage Engine', 'Local Storage Hook API'],
                  ].map(([label, value], i, arr) => (
                    <div
                      key={label}
                      className={`flex justify-between items-center px-4 py-3 ${
                        i < arr.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''
                      } ${i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/30'}`}
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
              </Card>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
