/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { api, reportsApi, usersApi, documentReportsApi, districtsApi, notificationsApi, impactStoriesApi, gbvCasesApi, sessionRecordsApi } from './api';
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
  ClipboardList, 
  TrendingUp,
  Info,
  Shield,
  Megaphone,
  ClipboardCheck,
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
  Navigation,
  Layers,
  Heart,
  Sliders,
  Calendar,
  ListTodo,
  Play,
  Eye,
  EyeOff,
  Upload, Globe, Save} from 'lucide-react';

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

import { TeacherChampionPage } from './components/TeacherChampionPage';
import { DistrictsPage } from './components/DistrictsPage';
import { Dashboard } from './components/Dashboard';
import { ReportsPage, getReportRecipient } from './components/ReportsPage';
import { MonthlyCaseReportBanner } from './components/MonthlyCaseReportBanner';
import { MapsPage } from './components/MapsPage';
import { CurriculumPage } from './components/CurriculumPage';
import { ImpactPage } from './components/ImpactPage';
import { SettingsPage } from './components/SettingsPage';
import { CalendarPage } from './components/CalendarPage';
import { AnalyticsPage } from './components/AnalyticsPage';
import { TasksPage } from './components/TasksPage';
import { SasaPage } from './components/SasaPage';
import { QAOfficerPage } from './components/QAOfficerPage';
import { StaffMentorshipPage } from './components/StaffMentorshipPage';
import { SessionMonitoringPage } from './components/SessionMonitoringPage';
import { RegionalViewPage } from './components/RegionalViewPage';
import { MyClustersPage } from './components/MyClustersPage';
import { TeacherProgrammesPage } from './components/TeacherProgrammesPage';
import { TOTConsolePage } from './components/TOTConsolePage';
import { DCConsolePage } from './components/DCConsolePage';
import { AdminConsolePage } from './components/AdminConsolePage';
import { PlanningScheduleForm } from './components/PlanningScheduleForm';
import { PlanningOfficerConsole } from './components/PlanningOfficerConsole';
import { ProgramTrackersForm } from './components/ProgramTrackersForm';
import { AnnualActivitiesPage } from './components/AnnualActivitiesPage';
import { ThisWeekActivitiesPage } from './components/ThisWeekActivitiesPage';
import { FollowupConsistencyPage } from './components/FollowupConsistencyPage';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { AnnouncementsPage } from './components/AnnouncementsPage';
import { SubmitQAReport } from './components/SubmitQAReport';
import { DocumentReportsPage } from './components/DocumentReportsPage';
import { StandardsPoliciesPage } from './components/StandardsPoliciesPage';
import { ProgramManagerPage } from './components/ProgramManagerPage';
import { FieldOfficerPage } from './components/FieldOfficerPage';
import { ProgramStaffPage } from './components/ProgramStaffPage';
import { CartographerPage } from './components/CartographerPage';
import { safeStorage } from './utils/storage';
import { LoginModal } from './components/LoginModal';
import { SubmitReport } from './components/SubmitReport';
import { TrainingsPage } from './components/TrainingsPage';
import { ETTPage } from './components/ETTPage';
import { UsersPage } from './components/UsersPage';
import { AdminDistrictsPage } from './components/AdminDistrictsPage';
import { DataCompletenessPage } from './components/DataCompletenessPage';
import { DataOfficerPage } from './components/DataOfficerPage';
import { MonitoringProvider } from './context/MonitoringContext';
import { CountryProvider } from './context/CountryContext';
import { CountrySelector } from './components/CountrySelector';
import { LanguageSelector } from './components/LanguageSelector';
import { useTranslation } from 'react-i18next';
import { useCountry } from './context/CountryContext';
import { SessionRecordsPage } from './components/SessionRecordsPage';
import { YouthPage } from './components/YouthPage';

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
  manager_home: "Program Manager",
  officer_home: "Field Officer",
  staff_home: "Program Staff",
  cartographer_home: "GIS Cartographer",
  standards: "Standards & Policies",
  document_reports: "Document Reports",
  sasa: "SASA Officer Dashboard",
  data_officer: "M & E Console",
  staff_mentorship: "Staff Mentorship & Evaluation",
  admin_console: "Admin Console",
  planning_schedule: "Planning & Scheduling",
  program_trackers: "Program Trackers",
  annual_activities: "Annual Activity Plan",
  this_week_activities: "This Week's Activities",
  planning_console: "Planning & Scheduling Console",
  dc_console: "DC Console",
  tot_console: "TOT Console",
  teacher_programmes: "Teacher Programmes",
  stot_orientation: "STOT Orientation Training",
  stot_tracker: "ETT Sessions — STOT Tracker",
  tot_training: "TOT Training Sessions",
  cluster_anchors: "Cluster Anchors Sessions",
  regional_view: "Regional Performance Dashboard",
  my_clusters: "My Clusters",
  followup_consistency: "Weekly Follow-up Consistency",
  announcements: "Announcements",
  qa: "Quality Assurance Dashboard",
  submit_qa: "Submit QA Report",
  session_records: "Session Records",
};

// ─── APPS MAIN CONTAINER / CORE ENGINE ────────
function getLandingPageForRole(role: string): string {
  switch (role) {
    case "program_manager": return "manager_home";
    case "field_officer": return "officer_home";
    case "program_staff": return "staff_home";
    case "cartographer": return "cartographer_home";
    case "sasa_officer": return "sasa";
    case "qa_officer": return "qa";
    case "data_entry": return "data_officer";
    case "tot": return "tot_console";
    case "district_coordinator": return "dc_console";
    case "admin": return "admin_console";
    case "planning_officer": return "planning_console";
    default: return "dashboard";
  }
}

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = safeStorage.getItem("ett_theme");
    return saved !== "light";
  });

  const { t, i18n } = useTranslation();
  const [user, setUser] = useState<User | null>(() => {
    const saved = safeStorage.getItem("ett_curr_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [reports, setReports] = useState<Report[]>([]);
  const { activeCountry, setActiveCountry, setDefaultCountry, districtTermPlural } = useCountry();

  // Default a logged-in user's country selector to their own assigned country,
  // unless they've explicitly picked a different one for this browser already.
  useEffect(() => {
    if (!user) return;
    const explicitlyChosen = localStorage.getItem('active_country_user_set');
    if (explicitlyChosen) return;
    const defaultedAlready = sessionStorage.getItem('country_defaulted_for_user');
    if (defaultedAlready === user.id) return;
    if ((user as any).country) {
      setDefaultCountry((user as any).country);
      sessionStorage.setItem('country_defaulted_for_user', user.id);
    }
  }, [user]);

  // Language defaults to English for every country and is only changed when the
  // user explicitly picks one in Settings — it never auto-switches based on country.

useEffect(() => {
  if (user) {
    reportsApi.getAll(activeCountry).then(data => {
      console.log('reportsApi.getAll() raw response:', data);
      setReports(data.map((r: any) => ({
          id: r.id,
          school: r.school,
          district: r.district,
          zone: r.zone,
          boys: r.boys,
          girls: r.girls,
          curriculum: r.curriculum,
          session: r.session,
          challenges: r.challenges,
          success: r.success,
          status: r.status,
          submitted_by: r.submitted_by_name || r.submitted_by,
          submitted_at: r.submitted_at?.split('T')[0],
          submitted_role: r.submitted_role,
          workflow_status: r.workflow_status,
      })));
    });
  }
}, [user, activeCountry]);

  const [users, setUsers] = useState<User[]>([]);

useEffect(() => {
  if (user?.role === 'admin') {
    usersApi.getAll().then(data => {
      setUsers(data.map((u: any) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        name: u.name,
        region: u.region ?? null,
        district: u.district ?? null,
        country: u.country ?? null,
        avatar: u.avatar || u.name?.split(' ').map((x: string) => x[0]).join('').toUpperCase(),
        status: u.status,
        clusterId: u.cluster_id,
        lastActiveAt: u.last_active_at ?? null,
        lastLogin: u.last_login ?? null,
      })));
    });
  }
}, [user]);

  // Refresh users list from server — called after activate/suspend/delete in UsersPage
  const refreshUsers = useCallback(() => {
    if (user?.role === 'admin') {
      usersApi.getAll().then(data => {
        setUsers(data.map((u: any) => ({
          id: u.id,
          email: u.email,
          role: u.role,
          name: u.name,
          region: u.region ?? null,
          district: u.district ?? null,
          country: u.country ?? null,
          avatar: u.avatar || u.name?.split(' ').map((x: string) => x[0]).join('').toUpperCase(),
          status: u.status,
          clusterId: u.cluster_id,
          lastActiveAt: u.last_active_at ?? null,
          lastLogin: u.last_login ?? null,
        })));
      });
    }
  }, [user]);

  const [page, setPage] = useState<string>(() => {
    const saved = safeStorage.getItem("ett_curr_user");
    if (!saved) return "dashboard";
    try {
      const restoredUser = JSON.parse(saved);
      return getLandingPageForRole(restoredUser.role);
    } catch {
      return "dashboard";
    }
  });
  const [toast, setToast] = useState<{ msg: string; type?: 'success'|'warning'|'error'|'info' } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mapFocus, setMapFocus] = useState<any>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [forwardModal, setForwardModal] = useState<Report | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  // Auto-open the login modal if the user arrived via a password-reset email link.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('resetToken')) {
      setIsLoginModalOpen(true);
    }
  }, []);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; label: string; page: string }[]>([]);

  const showToast = useCallback((msg: string, type?: 'success'|'warning'|'error'|'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3800);
  }, []);

  // Synchronize dynamic lists to storage

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


  const getRoleLandingPage = getLandingPageForRole;

  const addReport = async (r: any) => {
  const workflow = getReportRecipient(user?.role || "viewer");
  try {
    const saved = await reportsApi.create({
      ...r,
      sentTo: workflow.sendTo,
      workflowStatus: "sent",
    });
    const newReport: Report = {
      id: saved.id,
      ...r,
      sentTo: workflow.sendTo,
      sentToLabel: workflow.label,
      workflow_status: "sent",
      submitted_role: user?.role || "public",
    };
    setReports((p: Report[]) => [newReport, ...p]);
    showToast(`Report submitted successfully`, 'success');
  } catch (err) {
    showToast(`️ Failed to save report`, 'warning');
  }
};

  const updateStatus = async (id: number, status: 'approved' | 'rejected' | 'forwarded') => {
  try {
    await reportsApi.update(id, { status });
    setReports((p: Report[]) => p.map(r => r.id === id ? { ...r, status } : r));
    showToast(`Report ${status}`, 'success');
  } catch {
    showToast('️ Failed to update report status', 'warning');
  }
};

  // DC Forward file operation
  const forwardReport = async (id: number) => {
  try {
    const recipient = getReportRecipient(user?.role || 'viewer');
    await reportsApi.update(id, { status: 'forwarded', sentTo: recipient.sendTo, workflowStatus: 'forwarded' });
    setReports((p: Report[]) => p.map(r => r.id === id ? {
      ...r,
      status: "forwarded" as const,
      sentTo: recipient.sendTo,
      sentToLabel: recipient.label
    } : r));
    showToast(`File forwarded successfully to the ${recipient.label}`, 'success');
    setForwardModal(null);
  } catch {
    showToast('Failed to forward report', 'error');
  }
};

  // M & E Officer inline edit persistence
  const saveEditedReport = (updated: Report) => {
    setReports((p: Report[]) => p.map(r => r.id === updated.id ? { ...r, ...updated } : r));
    showToast("File record updated successfully", 'success');
  };

  const deleteReport = async (report: Report) => {
    try {
      await reportsApi.delete(report.id);
      setReports(prev => prev.filter(r => r.id !== report.id));
      showToast('Report deleted', 'success');
    } catch {
      showToast('Failed to delete report', 'error');
    }
  };

  const openMapTarget = (target: any) => {
    setMapFocus(target);
    setPage("maps");
  };

  const isStaff = user && ["admin", "district_coordinator", "data_entry", "tot", "program_manager", "field_officer", "program_staff", "sasa_officer"].includes(user.role);

  const [docUnread, setDocUnread] = useState(0);
const [notifications, setNotifications] = useState<any[]>([]);
const [notifUnread, setNotifUnread] = useState(0);

useEffect(() => {
  if (!user) return;
  if (['district_coordinator', 'program_manager', 'admin'].includes(user.role)) {
    documentReportsApi.getUnreadCount().then(data => {
      if (data.count !== undefined) setDocUnread(data.count);
    });
  }
  notificationsApi.getAll().then(setNotifications);
  notificationsApi.getUnreadCount().then(data => {
    if (data.count !== undefined) setNotifUnread(data.count);
  });
}, [user, page]);

const pendingCount = (user && can(user.role, "approveReport")
  ? reports.filter(r => r.status === "pending" && (user.role === "district_coordinator" ? r.district === user.district : true)).length
  : 0) + docUnread + notifUnread;

  // Global search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const query = searchQuery.toLowerCase().trim();
    const results: { id: string; label: string; page: string }[] = [];
    // Search reports
    reports.forEach(r => {
      if (r.school?.toLowerCase().includes(query) || r.district?.toLowerCase().includes(query)) {
        results.push({ id: `report-${r.id}`, label: `Report: ${r.school} (${r.district})`, page: 'reports' });
      }
    });
    // Search pages
    Object.entries(PAGE_LABELS).forEach(([id, label]) => {
      if (label.toLowerCase().includes(query)) {
        results.push({ id: `page-${id}`, label: `Page: ${label}`, page: id });
      }
    });
    setSearchResults(results.slice(0, 8));
  }, [searchQuery, reports]);

  const renderPageContent = () => {
    switch (page) {
      case "dashboard":
        return (
          <>
            <MonthlyCaseReportBanner user={user} showToast={showToast} />
            <Dashboard user={user} reports={reports} setPage={setPage} darkMode={darkMode} />
          </>
        );
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
            onDeleteReport={deleteReport}
          />
        ) : null;
      case "maps":
        return <MapsPage setPage={setPage} user={user} darkMode={darkMode} />;
      case "districts":
        return <DistrictsPage user={user} showToast={showToast} />;
      case 'teacher_resources':
        return <TeacherChampionPage user={user} />;
        case 'data_officer':
        return user?.role === 'data_entry' || user?.role === 'admin'
        ? <DataOfficerPage user={user!} showToast={showToast} />
        : null;
      case "trainings":
        return <TrainingsPage />;
      case "curriculum":
        return <CurriculumPage />;
      case "ett":
        return <ETTPage />;
      case "analytics":
        return user?.role !== 'tot'
          ? <AnalyticsPage reports={reports} />
          : <div className="p-12 text-center text-slate-400 font-semibold italic">This page is restricted for your role.</div>;
      case "users":
        return user?.role === 'admin' ? <UsersPage user={user} users={users} setUsers={setUsers} showToast={showToast} refreshUsers={refreshUsers} /> : <div className="p-12 text-center text-slate-400 font-semibold italic">Restricted to National Admin only.</div>;
      case "admin_districts":
        return user?.role === 'admin' ? <AdminDistrictsPage /> : <div className="p-12 text-center text-slate-400 font-semibold italic">Restricted to National Admin only.</div>;
      case "data_completeness":
        return user?.role === 'admin' ? <DataCompletenessPage /> : <div className="p-12 text-center text-slate-400 font-semibold italic">Restricted to National Admin only.</div>;
      case "impact":
        return <ImpactPage reports={reports} showToast={showToast} user={user} />;
      case 'youth':
        return <YouthPage />;
      case 'announcements':
        return user ? <AnnouncementsPage user={user} showToast={showToast} /> : <div className="p-12 text-center text-slate-400 font-semibold italic">Sign in to view Announcements.</div>;
      case 'staff_mentorship':
        return <StaffMentorshipPage user={user} showToast={showToast} />;
      case 'annual_activities':
        return (user?.role === 'planning_officer' || user?.role === 'admin')
          ? <AnnualActivitiesPage user={user} showToast={showToast} />
          : <div className="p-12 text-center text-slate-400 font-semibold italic">Restricted to the Planning & Scheduling Officer.</div>;
      case 'this_week_activities':
        return user?.role === 'district_coordinator'
          ? <ThisWeekActivitiesPage user={user} showToast={showToast} />
          : <div className="p-12 text-center text-slate-400 font-semibold italic">Restricted to District Coordinators.</div>;
      case 'program_trackers':
        return (user?.role === 'field_officer' || user?.role === 'district_coordinator')
          ? <ProgramTrackersForm user={user} showToast={showToast} />
          : <div className="p-12 text-center text-slate-400 font-semibold italic">Restricted to Field Officers and District Coordinators.</div>;
      case 'planning_schedule':
        return user?.role === 'field_officer'
          ? <PlanningScheduleForm user={user} showToast={showToast} />
          : <div className="p-12 text-center text-slate-400 font-semibold italic">Restricted to Field Officers.</div>;
      case 'planning_console':
        return user?.role === 'planning_officer'
          ? <PlanningOfficerConsole user={user} showToast={showToast} />
          : <div className="p-12 text-center text-slate-400 font-semibold italic">Restricted to the Planning & Scheduling Officer.</div>;
      case 'admin_console':
        return <AdminConsolePage user={user} users={users} setUsers={setUsers} showToast={showToast} refreshUsers={refreshUsers} />;
      case 'dc_console':
        return <DCConsolePage user={user} showToast={showToast} />;
      case 'tot_console':
        return <TOTConsolePage user={user} showToast={showToast} />;
      case 'teacher_programmes':
        return <TeacherProgrammesPage user={user} showToast={showToast} />;
      case 'stot_orientation':
        return <SessionMonitoringPage user={user} showToast={showToast} recordType="stot_orientation" title="STOT Orientation Training" subtitle="Senior TOT orientation and piloting sessions" plannedLabel="Sessions Planned" conductedLabel="Sessions Conducted" />;
      case 'stot_tracker':
        return <SessionMonitoringPage user={user} showToast={showToast} recordType="stot_tracker" title="ETT Sessions — STOT Tracker" subtitle="Senior TOT performance monitoring" plannedLabel="Sessions Planned" conductedLabel="Sessions Conducted" />;
      case 'tot_training':
        return <SessionMonitoringPage user={user} showToast={showToast} recordType="tot_training" title="TOT Training Sessions" subtitle="TOT performance monitoring across regions" plannedLabel="Sessions Planned" conductedLabel="Sessions Conducted" />;
      case 'cluster_anchors':
        return <SessionMonitoringPage user={user} showToast={showToast} recordType="cluster_anchors" title="Cluster Anchors (PEA) Sessions" subtitle="Cluster anchor allocation and engagement monitoring" plannedLabel="Clusters Allocated" conductedLabel="Clusters Engaged" />;
      case 'regional_view':
        return <RegionalViewPage user={user} showToast={showToast} />;
      case 'my_clusters':
        return <MyClustersPage user={user} showToast={showToast} />;
      case 'followup_consistency':
        return <FollowupConsistencyPage user={user} showToast={showToast} />;
      case 'qa':
        return (user?.role === 'qa_officer' || user?.role === 'admin' || user?.role === 'program_manager')
          ? <QAOfficerPage user={user} showToast={showToast} />
          : <div className="p-12 text-center text-slate-400 font-semibold italic">Restricted to Quality Assurance Officers.</div>;
      case 'submit_qa':
        return (user?.role === 'field_officer' || user?.role === 'tot')
          ? <SubmitQAReport user={user} showToast={showToast} />
          : <div className="p-12 text-center text-slate-400 font-semibold italic">Restricted to Field Officers.</div>;
      case 'sasa':
        return (user?.role === 'sasa_officer' || user?.role === 'program_manager')
          ? <SasaPage user={user} reports={reports} showToast={showToast} />
          : <div className="p-12 text-center text-slate-400 font-semibold italic">Restricted to SASA Officers and Regional Managers.</div>;
      case 'document_reports':
        return <DocumentReportsPage user={user} showToast={showToast} />;
      case "calendar":
        return user ? <CalendarPage user={user} /> : <div className="p-12 text-center text-slate-400 font-semibold italic">Sign in to view the Calendar.</div>;
      case "tasks":
        return user ? <TasksPage user={user} /> : <div className="p-12 text-center text-slate-400 font-semibold italic">Sign in to view Tasks.</div>;
      case "settings":
        return <SettingsPage user={user} darkMode={darkMode} setDarkMode={setDarkMode} showToast={showToast} reportsCount={reports.length} />;
      case "manager_home":
        return user ? <ProgramManagerPage reports={reports} user={user} setPage={setPage} /> : null;
      case "officer_home":
        return user ? <FieldOfficerPage user={user} reports={reports} onSubmit={addReport} showToast={showToast} setPage={setPage} /> : null;
      case "staff_home":
        return user ? <ProgramStaffPage user={user} reports={reports} setPage={setPage} /> : null;
      case "cartographer_home":
        return user ? <CartographerPage user={user} showToast={showToast} /> : null;
      case "standards":
        return user ? <StandardsPoliciesPage /> : null;
      default:
        return <Dashboard user={user} reports={reports} setPage={setPage} darkMode={darkMode} />;
    }
  };

  // Role-based navigation
  const PROTECTED_PAGES = ["reports", "calendar", "tasks", "analytics", "users", "manager_home", "officer_home", "staff_home", "cartographer_home", "sasa"];

  const getNavGroups = () => {
    const role = user?.role;

    // Program Manager nav
    if (role === 'program_manager') return [
      { title: "My Workspace", items: [
        { id: "manager_home", label: "Manager Overview", icon: LayoutDashboard, protected: true },
        { id: "analytics", label: "Analytics", icon: BarChart2, protected: true },
        { id: "reports", label: "All Reports", icon: FileText, protected: true },
        { id: "document_reports", label: "Submit a Report", icon: Upload, protected: true },
      ]},
      { title: "Program", items: [
        { id: "districts", label: districtTermPlural, icon: MapPin },
        { id: "trainings", label: "Trainings", icon: GraduationCap },
        { id: "maps", label: "Clusters Map", icon: Map },
        { id: "impact", label: "Success Stories", icon: Heart },
        { id: "youth", label: "Ujamaa Youth", icon: Play },
      ]},
      { title: "More", items: [
        { id: "calendar", label: "Calendar", icon: Calendar, protected: true },
        { id: "tasks", label: "Tasks", icon: ListTodo, protected: true },
        { id: "announcements", label: "Announcements", icon: Megaphone },
        { id: "settings", label: "Settings", icon: Settings },
      ]},
    ];

    // Field Officer nav
    if (role === 'field_officer') return [
      { title: "My Workspace", items: [
        { id: "officer_home", label: "Field Dashboard", icon: LayoutDashboard, protected: true },
        { id: "submit", label: "Submit a Case", icon: FilePlus, protected: true },
        { id: "my_clusters", label: "My Clusters", icon: ClipboardCheck, protected: true },
        { id: "planning_schedule", label: "Planning & Scheduling", icon: ClipboardList, protected: true },
        { id: "program_trackers", label: "Program Trackers", icon: ClipboardList, protected: true },
        { id: "submit_qa", label: "Submit QA Report", icon: ClipboardCheck, protected: true },
        { id: "document_reports", label: "Submit a Report", icon: Upload, protected: true },
      ]},
      { title: "Session Monitoring", items: [
        { id: "teacher_programmes", label: "Teacher Programmes", icon: GraduationCap, protected: true },
      ]},
      { title: "Reference", items: [
        { id: "curriculum", label: "Curriculum", icon: BookOpen },
        { id: "maps", label: "Clusters Map", icon: Map },
        { id: "districts", label: districtTermPlural, icon: MapPin },
      ]},
      { title: "More", items: [
        { id: "calendar", label: "Calendar", icon: Calendar, protected: true },
        { id: "tasks", label: "Tasks", icon: ListTodo, protected: true },
        { id: "announcements", label: "Announcements", icon: Megaphone },
        { id: "settings", label: "Settings", icon: Settings },
      ]},
    ];

    // Program Staff nav
    if (role === 'program_staff') return [
      { title: "My Workspace", items: [
        { id: "staff_home", label: "Staff Dashboard", icon: LayoutDashboard, protected: true },
        { id: "submit", label: "Log Session", icon: FilePlus, protected: true },
        { id: "document_reports", label: "Document Reports", icon: Upload, protected: true },
      ]},
      { title: "Curriculum", items: [
        { id: "curriculum", label: "Curriculum", icon: BookOpen },
        { id: "ett", label: "ETT Standards", icon: Layers },
        { id: "trainings", label: "Trainings", icon: GraduationCap },
      ]},
      { title: "More", items: [
        { id: "maps", label: "Clusters Map", icon: Map },
        { id: "calendar", label: "Calendar", icon: Calendar, protected: true },
        { id: "announcements", label: "Announcements", icon: Megaphone },
        { id: "settings", label: "Settings", icon: Settings },
      ]},
    ];

    // Cartographer nav
    if (role === 'cartographer') return [
      { title: "GIS Workspace", items: [
        { id: "cartographer_home", label: "Cartographer Console", icon: Map, protected: true },
        { id: "maps", label: "Live Map View", icon: Navigation },
        { id: "districts", label: districtTermPlural, icon: MapPin },
        { id: "submit", label: "Submit a Case", icon: FilePlus },
        { id: "document_reports", label: "Document Reports", icon: Upload, protected: true },
      ]},
      { title: "More", items: [
        { id: "analytics", label: "Analytics", icon: BarChart2 },
        { id: "calendar", label: "Calendar", icon: Calendar, protected: true },
        { id: "tasks", label: "Tasks", icon: ListTodo, protected: true },
        { id: "standards", label: "Standards & Policies", icon: Shield, protected: true },
        { id: "announcements", label: "Announcements", icon: Megaphone },
        { id: "settings", label: "Settings", icon: Settings },
      ]},
    ];

    // Quality Assurance Officer nav
    if (role === 'qa_officer') return [
      { title: "QA Workspace", items: [
        { id: "qa", label: "QA Dashboard", icon: ClipboardCheck, protected: true },
        { id: "regional_view", label: "Regional View", icon: MapPin, protected: true },
        { id: "followup_consistency", label: "Follow-up Consistency", icon: Users, protected: true },
        { id: "staff_mentorship", label: "Staff Mentorship", icon: GraduationCap, protected: true },
        { id: "submit", label: "Submit a Case", icon: FilePlus },
      ]},
      { title: "More", items: [
        { id: "analytics", label: "Analytics", icon: BarChart2 },
        { id: "calendar", label: "Calendar", icon: Calendar, protected: true },
        { id: "tasks", label: "Tasks", icon: ListTodo, protected: true },
        { id: "standards", label: "Standards & Policies", icon: Shield, protected: true },
        { id: "announcements", label: "Announcements", icon: Megaphone },
        { id: "settings", label: "Settings", icon: Settings },
      ]},
    ];
    // SASA Officer nav
    if (role === 'sasa_officer') return [
  { title: "SASA Workspace", items: [
    { id: "sasa", label: "SASA Dashboard", icon: Shield, protected: true },
    { id: "submit", label: "Submit Case", icon: FilePlus, protected: true },
    { id: "document_reports", label: "Submit a Report", icon: Upload, protected: true },
  ]},
      { title: "More", items: [
        { id: "analytics", label: "Analytics", icon: BarChart2 },
        { id: "calendar", label: "Calendar", icon: Calendar, protected: true },
        { id: "tasks", label: "Tasks", icon: ListTodo, protected: true },
        { id: "standards", label: "Standards & Policies", icon: Shield, protected: true },
        { id: "announcements", label: "Announcements", icon: Megaphone },
        { id: "settings", label: "Settings", icon: Settings },
      ]},
    ];

// District Coordinator nav
if (role === 'district_coordinator') return [
  { title: "My District", items: [
    { id: "dc_console", label: "DC Console", icon: LayoutDashboard, protected: true },
    { id: "my_clusters", label: "My Clusters", icon: ClipboardCheck, protected: true },
    { id: "program_trackers", label: "Program Trackers", icon: ClipboardList, protected: true },
    { id: "this_week_activities", label: "This Week's Activities", icon: Calendar, protected: true },
    { id: "reports", label: "Reports", icon: FileText, protected: true },
    { id: "document_reports", label: "Submit a Report", icon: Upload, protected: true },
  ]},
  { title: "Programme", items: [
    { id: "submit", label: "Submit a Case", icon: FilePlus },
    { id: "curriculum", label: "Curriculum", icon: BookOpen },
    { id: "analytics", label: "Analytics", icon: BarChart2, protected: true },
    { id: "impact", label: "Success Stories", icon: Heart },
    { id: "youth", label: "Ujamaa Youth", icon: Play },
  ]},
  { title: "Session Monitoring", items: [
    { id: "teacher_programmes", label: "Teacher Programmes", icon: GraduationCap, protected: true },
  ]},
  { title: "More", items: [
    { id: "calendar", label: "Calendar", icon: Calendar, protected: true },
    { id: "tasks", label: "Tasks", icon: ListTodo, protected: true },
    { id: "announcements", label: "Announcements", icon: Megaphone },
    { id: "settings", label: "Settings", icon: Settings },
  ]},
];
    // Planning & Scheduling Officer nav
    if (role === 'planning_officer') return [
      { title: "My Workspace", items: [
        { id: "planning_console", label: "Planning Console", icon: ClipboardList, protected: true },
        { id: "annual_activities", label: "Annual Activity Plan", icon: Calendar, protected: true },
      ]},
      { title: "More", items: [
        { id: "analytics", label: "Analytics", icon: BarChart2 },
        { id: "calendar", label: "Calendar", icon: Calendar, protected: true },
        { id: "tasks", label: "Tasks", icon: ListTodo, protected: true },
        { id: "announcements", label: "Announcements", icon: Megaphone },
        { id: "settings", label: "Settings", icon: Settings },
      ]},
    ];
    // TOT nav -- their own console, no generic Main Dashboard, no Analytics
    if (role === 'tot') return [
      { title: "My Workspace", items: [
        { id: "tot_console", label: "TOT Console", icon: ClipboardCheck, protected: true },
        { id: "submit", label: "Submit a Case", icon: FilePlus },
        { id: "reports", label: "Reports", icon: FileText, protected: true },
        { id: "document_reports", label: "Submit a Report", icon: Upload, protected: true },
      ]},
      { title: "Programme", items: [
        { id: "curriculum", label: "Curriculum", icon: BookOpen },
        { id: "impact", label: "Success Stories", icon: Heart },
        { id: "youth", label: "Ujamaa Youth", icon: Play },
      ]},
      { title: "More", items: [
        { id: "calendar", label: "Calendar", icon: Calendar, protected: true },
        { id: "tasks", label: "Tasks", icon: ListTodo, protected: true },
        { id: "standards", label: "Standards & Policies", icon: Shield, protected: true },
        { id: "announcements", label: "Announcements", icon: Megaphone },
        { id: "settings", label: "Settings", icon: Settings },
      ]},
    ];
    // M & E Officer nav -- a focused workspace, not the generic default bucket
    if (role === 'data_entry') return [
      { title: "My Workspace", items: [
        { id: "data_officer", label: "M & E Console", icon: ClipboardList, protected: true },
        { id: "reports", label: "Reports", icon: FileText, protected: true },
        { id: "submit", label: "Submit a Case", icon: FilePlus },
        { id: "document_reports", label: "Submit a Report", icon: Upload, protected: true },
      ]},
      { title: "More", items: [
        { id: "analytics", label: "Analytics", icon: BarChart2 },
        { id: "calendar", label: "Calendar", icon: Calendar, protected: true },
        { id: "tasks", label: "Tasks", icon: ListTodo, protected: true },
        { id: "standards", label: "Standards & Policies", icon: Shield, protected: true },
        { id: "announcements", label: "Announcements", icon: Megaphone },
        { id: "settings", label: "Settings", icon: Settings },
      ]},
    ];
    // Admin nav -- Admin Console replaces the generic Dashboard as landing page,
    // everything else Admin already had access to stays exactly the same.
    if (role === 'admin') return [
      {
        title: "Dashboard", items: [
          { id: "admin_console", label: "Admin Console", icon: LayoutDashboard, protected: true },
          { id: "maps", label: "Clusters map", icon: Map },
          { id: "districts", label: districtTermPlural, icon: MapPin },
          { id: "trainings", label: "Trainings", icon: GraduationCap },
          { id: "curriculum", label: "Curriculum", icon: BookOpen },
          { id: "standards", label: "Standards & Policies", icon: Shield, protected: true },
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
        title: "Reports", items: [
          { id: "submit", label: "Submit a Case", icon: FilePlus },
          { id: "reports", label: "Reports", icon: FileText, protected: true },
          { id: "document_reports", label: "Submit a Report", icon: Upload, protected: true },
        ]
      },
      {
        title: "More",
        items: [
          { id: "analytics", label: "Analytics", icon: BarChart2 },
          { id: "impact", label: "Success Stories", icon: Heart },
          { id: "youth", label: "Ujamaa Youth", icon: Play },
          { id: 'teacher_resources', label: 'Teacher Resources', icon: BookOpen },
          { id: "admin_districts", label: `${districtTermPlural} & Countries`, icon: Globe, protected: true },
          { id: "data_completeness", label: "Data Completeness", icon: AlertTriangle, protected: true },
          { id: "announcements", label: "Announcements", icon: Megaphone },
          { id: "settings", label: "Settings", icon: Settings }
        ]
      }
    ];
    // Default nav (dc, tot, viewer, public)
    return [
      {
  title: "Dashboard",
  items: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "maps", label: "Clusters map", icon: Map },
    { id: "districts", label: districtTermPlural, icon: MapPin },
    { id: "trainings", label: "Trainings", icon: GraduationCap },
    { id: "curriculum", label: "Curriculum", icon: BookOpen },
    { id: "standards", label: "Standards & Policies", icon: Shield, protected: true },
    ...(user?.role !== 'tot' ? [{ id: 'data_officer', label: 'Monitoring Data', icon: ClipboardList, protected: true }] : []),
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
    { id: "reports", label: "Reports", icon: FileText, protected: true },
    ...(user?.role === 'tot' ? [{ id: "my_clusters", label: "My Clusters", icon: ClipboardCheck, protected: true }] : []),
    ...(user && user.role !== 'tot' && user.role !== 'viewer' ? [{ id: "document_reports", label: "Submit a Report", icon: Upload, protected: true }] : []),
  ]
},
      {
        title: "More",
        items: [
          ...(user?.role !== 'tot' ? [{ id: "analytics", label: "Analytics", icon: BarChart2 }] : []),
          { id: "impact", label: "Success Stories", icon: Heart },
          { id: "youth", label: "Ujamaa Youth", icon: Play },
          { id: 'teacher_resources', label: 'Teacher Resources', icon: BookOpen },
          ...(user?.role === 'admin' ? [{ id: "users", label: "Staff", icon: Users, protected: true }] : []),
          ...(user?.role === 'admin' ? [{ id: "admin_districts", label: `${districtTermPlural} & Countries`, icon: Globe, protected: true }] : []),
          ...(user?.role === 'admin' ? [{ id: "data_completeness", label: "Data Completeness", icon: AlertTriangle, protected: true }] : []),
          { id: "announcements", label: "Announcements", icon: Megaphone },
          { id: "settings", label: "Settings", icon: Settings }
        ]
      }
    ];
  };

  const activeNavGroups = getNavGroups();

  const renderNav = (onNavigate?: () => void, compact = false) => (
    activeNavGroups.map(group => (
      <div key={group.title} className="space-y-0.5 mb-3">
        {!compact && (
          <div className="text-xs text-black dark:text-white font-semibold uppercase tracking-wide px-2 mb-1 opacity-60">{group.title}</div>
        )}
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
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md font-medium transition ${
                isActive
                  ? 'bg-[var(--brand-50)] text-[var(--brand-600)] dark:bg-[var(--brand-600)]/15 dark:text-[var(--brand-400)]'
                  : isLocked
                  ? 'text-slate-400 dark:text-slate-600 hover:bg-[var(--brand-50)] hover:text-[var(--brand-400)] dark:hover:bg-slate-800'
                  : 'text-black hover:bg-[var(--brand-50)] hover:text-[var(--brand-600)] dark:text-white dark:hover:bg-slate-800 dark:hover:text-[var(--brand-400)]'
              } ${compact ? 'justify-start px-2 min-h-[40px] text-sm' : 'text-sm'}`}
              title={isLocked ? "Sign in to access" : undefined}
            >
              <Icon size={16} />
              <span className={`whitespace-nowrap truncate`}>{t(item.label)}</span>
              {isLocked && <Lock size={12} className="ml-auto opacity-40 shrink-0" />}
            </button>
          );
        })}
      </div>
    ))
  );

  return (
    <MonitoringProvider key={user?.id ?? 'guest'}>
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
                    className="fixed top-0 bottom-0 left-0 w-80 bg-white dark:bg-[#0f1623] border-r border-neutral-200 dark:border-slate-800 z-40 p-3 flex flex-col md:hidden shadow-lg"
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
                    <div className="flex-1 overflow-y-auto">{renderNav(() => setSidebarOpen(false), true)}</div>
                    <div className="p-3 border-t border-neutral-200 dark:border-slate-800 flex flex-col gap-2 shrink-0">
                      {user ? (
                        <div className="flex flex-col gap-2">
                          <span className="text-sm font-medium text-black dark:text-white truncate text-center">
                            {user.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => { setUser(null); setPage("dashboard"); showToast("Signed out."); setSidebarOpen(false); }}
                            className="w-full px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            Sign out
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { setIsLoginModalOpen(true); setSidebarOpen(false); }}
                          className="w-full px-3 py-2 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white font-medium text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
                        >
                          Sign in
                        </button>
                      )}
                      <div className="text-xs text-black dark:text-white opacity-60 text-center mt-1">
                        Helpline <b className="text-[var(--brand-600)] dark:text-[var(--brand-400)]">116</b> · VSU <b className="text-[var(--brand-600)] dark:text-[var(--brand-400)]">997</b>
                      </div>
                    </div>
                  </motion.aside>
                </>
              )}
            </AnimatePresence>

            <aside className="hidden md:flex w-80 shrink-0 flex-col bg-white dark:bg-[#0f1623] border-r border-neutral-200 dark:border-slate-800">
              <div className="h-12 flex items-center gap-2 px-3 border-b border-neutral-200 dark:border-slate-800 shrink-0">
                <AfricaLogo size={22} />
                <span className="font-bold text-sm text-black dark:text-white truncate">Ujamaa Dashboard</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2">{renderNav()}</div>
              <div className="p-3 border-t border-neutral-200 dark:border-slate-800 flex flex-col gap-2 shrink-0">
                {user ? (
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-black dark:text-white truncate text-center" title={user.name}>
                      {user.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => { setUser(null); setPage("dashboard"); showToast("Signed out."); }}
                      className="w-full px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsLoginModalOpen(true)}
                    className="w-full px-3 py-2 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white font-medium text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
                  >
                    Sign in
                  </button>
                )}
                <div className="text-xs text-black dark:text-white opacity-60 text-center mt-1">
                  Helpline <b className="text-[var(--brand-600)] dark:text-[var(--brand-400)]">116</b> · VSU <b className="text-[var(--brand-600)] dark:text-[var(--brand-400)]">997</b>
                </div>
              </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0f1623]">
              <header className="h-14 sm:h-12 shrink-0 relative flex items-center justify-between gap-2 px-2 sm:px-4 border-b border-neutral-200 dark:border-slate-800 bg-white dark:bg-[#0f1623]">
                {/* Centered Quick Search pill (desktop) */}
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <button
                    type="button"
                    onClick={() => setSearchOpen(!searchOpen)}
                    className="flex items-center gap-2 w-72 h-9 px-3 rounded-full border border-neutral-200 dark:border-slate-700 hover:border-[var(--brand-400)] text-black dark:text-white bg-neutral-50 dark:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
                  >
                    <Search size={14} className="text-slate-400 shrink-0" />
                    <span className="text-[12px] text-slate-400 truncate">Quick Search (ctrl + D)</span>
                  </button>
                </div>
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => setPage("dashboard")}
                    className="p-2 sm:p-1.5 rounded-md text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-slate-800 min-h-[40px] min-w-[40px] sm:min-h-auto sm:min-w-auto focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
                    aria-label="Back to dashboard"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    className="md:hidden p-2 rounded-md border border-neutral-200 dark:border-slate-700 text-black dark:text-white min-h-[40px] min-w-[40px] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] shrink-0"
                    aria-label="Open menu"
                  >
                    <Sliders size={18} />
                  </button>
                  <h2 className="text-[12px] sm:text-sm font-semibold text-black dark:text-white truncate m-0 min-w-0">
                    {page === 'districts' ? districtTermPlural
                      : page === 'admin_districts' ? `${districtTermPlural} & Countries`
                      : t(PAGE_LABELS[page] || "ETT ScaleUp Program")}
                  </h2>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 shrink-0 flex-nowrap">
                  {/* Global Search Button (mobile only -- desktop uses the centered pill) */}
                  <div className="relative md:hidden">
                    <button
                      type="button"
                      onClick={() => setSearchOpen(!searchOpen)}
                      className="w-9 h-9 flex items-center justify-center rounded-md border border-neutral-200 dark:border-slate-700 hover:border-[var(--brand-400)] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] shrink-0"
                      title="Search"
                      aria-label="Global search"
                    >
                      <Search size={16} />
                    </button>
                  </div>
                  {searchOpen && (
                    <>
                      <div className="fixed inset-0 z-[59]" onClick={() => setSearchOpen(false)} />
                      <div className="fixed left-1/2 top-16 z-[60] w-[min(92vw,22rem)] -translate-x-1/2 rounded-xl border border-neutral-200 bg-white p-3 shadow-2xl dark:border-slate-800 dark:bg-[#0f1623]">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search reports, pages..."
                          className="w-full px-3 py-2 text-xs border border-neutral-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0f1623] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
                          autoFocus
                        />
                        {searchResults.length > 0 && (
                          <div className="mt-2 max-h-60 overflow-y-auto">
                            {searchResults.map(result => (
                              <button
                                key={result.id}
                                onClick={() => { setPage(result.page); setSearchOpen(false); setSearchQuery(''); }}
                                className="w-full text-left px-2 py-1.5 text-xs text-black dark:text-white hover:bg-[var(--brand-50)] dark:hover:bg-slate-800 rounded transition-colors"
                              >
                                {result.label}
                              </button>
                            ))}
                          </div>
                        )}
                        {searchQuery && searchResults.length === 0 && (
                          <p className="text-xs text-center py-2 text-slate-400">No results found</p>
                        )}
                      </div>
                    </>
                  )}

                  {user && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setNotifOpen(!notifOpen)}
                        className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-md border border-neutral-200 dark:border-slate-700 hover:border-[var(--brand-400)] text-black dark:text-white relative focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] shrink-0"
                        title={`${pendingCount} pending reviews`}
                        aria-label="Notifications"
                      >
                        <Bell size={16} />
                        {pendingCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[9px] min-w-[16px] h-4 rounded-full flex items-center justify-center px-0.5">
                            {pendingCount}
                          </span>
                        )}
                      </button>

                      {notifOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                          <div className="fixed left-1/2 top-16 z-[70] w-[min(92vw,18rem)] -translate-x-1/2 rounded-lg shadow-lg p-3 bg-white dark:bg-[#0f1623] border border-neutral-200 dark:border-slate-800 text-black dark:text-white sm:absolute sm:right-0 sm:left-auto sm:top-10 sm:w-64 sm:translate-x-0">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
  <span className="font-semibold text-xs">Notifications</span>
  {notifUnread > 0 && (
    <button
      onClick={() => {
        notificationsApi.markAllRead();
        setNotifUnread(0);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      }}
      className="text-[10px] text-[var(--brand-600)] font-semibold hover:underline"
    >
      Mark all read
    </button>
  )}
</div>
<div className="max-h-[280px] overflow-y-auto space-y-1.5">
  {docUnread > 0 && (
    <button
      type="button"
      onClick={() => { setPage("document_reports"); setNotifOpen(false); }}
      className="w-full text-left p-2 bg-[var(--brand-50)] dark:bg-[var(--brand-950)]/20 rounded border border-[var(--brand-200)] dark:border-[var(--brand-900)]/40 text-[11px] text-black dark:text-white"
    >
      <div className="font-semibold">{docUnread} new document report{docUnread > 1 ? 's' : ''}</div>
      <div className="text-[10px] opacity-60">Click to view inbox</div>
    </button>
  )}
  {notifications.length === 0 && docUnread === 0 && (
    <p className="text-xs py-3 text-center m-0 opacity-60">No notifications.</p>
  )}
  {notifications.map(n => (
    <button
      key={n.id}
      type="button"
      onClick={() => {
        if (!n.is_read) {
          notificationsApi.markRead(n.id);
          setNotifUnread(prev => Math.max(0, prev - 1));
          setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));
        }
        if (n.link) setPage(n.link.replace('/', ''));
        setNotifOpen(false);
      }}
      className={`w-full text-left p-2 rounded border text-[11px] text-black dark:text-white transition-colors ${
        n.is_read
          ? 'border-neutral-200 dark:border-slate-800 bg-white dark:bg-[#0f1623]'
          : 'border-[var(--brand-200)] dark:border-[var(--brand-900)]/40 bg-[var(--brand-50)] dark:bg-[var(--brand-950)]/20'
      }`}
    >
      <div className="font-semibold flex items-center gap-1">
        {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-500)] shrink-0" />}
        {n.title}
      </div>
      <div className="text-[10px] opacity-60 mt-0.5">{n.message}</div>
      <div className="text-[10px] opacity-40 mt-0.5">{new Date(n.created_at).toLocaleDateString()}</div>
    </button>
  ))}
</div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setDarkMode(!darkMode)}
                    className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-md border border-neutral-200 dark:border-slate-700 hover:border-[var(--brand-400)] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
                    title="Toggle theme"
                    aria-label="Toggle dark mode"
                  >
                    {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                  </button>

                  <LanguageSelector />

                  <button
                    type="button"
                    onClick={() => setPage("settings")}
                    className={`w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-md border hover:border-[var(--brand-400)] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] ${
                      page === 'settings' ? 'border-[var(--brand-500)] text-[var(--brand-600)]' : 'border-neutral-200 dark:border-slate-700'
                    }`}
                    title="Settings"
                    aria-label="Settings"
                  >
                    <Settings size={16} />
                  </button>
                  <CountrySelector />

                </div>
              </header>
              <AnnouncementBanner user={user} />

            <main className="flex-1 overflow-y-auto p-4">
              <div className={page === "curriculum" ? "w-full" : "max-w-7xl mx-auto"}>
                {renderPageContent()}
              </div>
            </main>
            {!user && (
              <footer className="shrink-0 border-t border-neutral-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between gap-3 bg-white dark:bg-[#0f1623]">
                <span className="text-[11px] text-black/50 dark:text-white/50">
                  © {new Date().getFullYear()} Ujamaa Pamodzi Africa. All rights reserved.
                </span>
                  <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); showToast('Donation page coming soon!', 'info'); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-[var(--brand-600)] hover:bg-[var(--brand-700)] transition-colors shrink-0"
                >
                  <Heart size={13} /> Donate
                </a>
              </footer>
            )}
            </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

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
              <Btn onClick={() => { saveEditedReport(editingReport); setEditingReport(null); }}>Save File Changes</Btn>
            </div>
          </div>
        </Modal>
      )}

      {forwardModal && (
        <Modal title={`Forward File to ${getReportRecipient(user?.role || 'viewer').label}`} onClose={() => setForwardModal(null)} width={400}>
          <div className="space-y-4 text-xs sm:text-sm">
            <p className="text-slate-500 m-0 leading-relaxed text-xs">
              This action transmits the approved school record of <b>{forwardModal.school}</b> ({forwardModal.district}) to the <b>{getReportRecipient(user?.role || 'viewer').label}</b>.
            </p>
            <div className="bg-[var(--brand-50)] dark:bg-[var(--brand-950)]/20 text-[var(--brand-700)] dark:text-[var(--brand-400)] p-2.5 rounded-lg text-xs border border-[var(--brand-100)] dark:border-[var(--brand-900)]/30">
              Route state: Verified → {getReportRecipient(user?.role || 'viewer').label} aligned
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
          onLogin={u => { setUser(u); setIsLoginModalOpen(false); setPage(getRoleLandingPage(u.role)); showToast(`Welcome back, ${u.name}`, 'success'); }}
          onRegister={u => { setUsers(prev => [u, ...prev]); setUser(u); setIsLoginModalOpen(false); setPage("dashboard"); showToast(`Account certified! Welcome, ${u.name}`, 'success'); }}
          onClose={() => setIsLoginModalOpen(false)}
          users={users}
        />
      )}
      </>
    </MonitoringProvider>
  );
}
