import { Modal } from './SubComponents';
import { programmeStatsApi, statsApi, api } from '../api';
import { TTSGenderChart } from './TTSGenderChart';
import { BiweeklyReachChart } from './BiweeklyReachChart';
import { getStaticMapClusters } from '../utils/mapFallback';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, FilePlus, GraduationCap, School, TrendingUp, FileText, Clock,BookOpen, CheckSquare, Users, Map, MapPin, Edit2, RefreshCw, Star, ArrowRightCircle, Heart, ShieldCheck, Play } from 'lucide-react';
import { DashboardAnnouncementsBanner } from './DashboardAnnouncementsBanner';
import { User, Report } from '../types';
import { ROLE_CFG, can, DISTRICTS, DISTRICT_INFO } from '../data';
import { Card, PageHeader, Btn, Pill, TrendIndicator } from './SubComponents';
import { useCountry } from '../context/CountryContext';

interface DashboardProps {
  user: User | null;
  reports: Report[];
  setPage: (p: string) => void;
  darkMode: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, reports, setPage, darkMode }) => {
  const { t } = useTranslation();
  const currentUser = user || { role: "viewer" as const, name: "Public Viewer", district: null, region: null };
  const isStaff = user && ["admin", "district_coordinator", "data_entry", "tot", "program_manager", "field_officer"].includes(user.role);

  // Filter reports based on role scope
  const my = (currentUser.role === "data_entry" || currentUser.role === "tot")
    ? reports.filter(r => r.district === currentUser.district)
    : currentUser.role === "district_coordinator"
      ? reports.filter(r => r.district === currentUser.district)
      : currentUser.role === "program_manager"
        ? reports.filter(r => {
            // Filter by region — match districts in their region
            return true; // backend already filters; frontend shows all for now
          })
        : reports;

  const pending = my.filter(r => r.status === "pending").length;

  // ── KPI STATS ─────────────────────────────────────────────────────────────
  // Live counts from DB — Admin can override via Edit Stats modal
  const [stats, setStats] = useState({
    learners: 0, teachers: 0, schools: 0, tots: 0, stots: 0,
    approvedReports: 0, clusters: 0,
  });
  const [statsLoaded, setStatsLoaded] = useState(false);

  // Stable user identifiers to prevent loadStats from re-firing on every render
  const userId   = user?.id;
  const userRole = user?.role;
  const userDistrict = user?.district;
  const userRegion = user?.region;
  const { activeCountry } = useCountry();

  const loadStats = useCallback(() => {
    // Load global stats — works for both public and logged-in users
    if ((userRole === 'district_coordinator' || userRole === 'tot') && userDistrict) {
      api.get(`/api/stats/district/${encodeURIComponent(userDistrict)}`).then(data => {
        if (!data.error) { setStats(prev => ({ ...prev, ...data })); setStatsLoaded(true); }
      });
    } else if (userRole === 'program_manager' && userRegion) {
      // Program/Regional Managers only see figures for districts in their own region.
      statsApi.get(activeCountry, userRegion).then(data => {
        if (!data.error) { setStats(prev => ({ ...prev, ...data })); setStatsLoaded(true); }
      });
    } else {
      statsApi.get(activeCountry).then(data => {
        if (!data.error) { setStats(prev => ({ ...prev, ...data })); setStatsLoaded(true); }
      });
    }
  }, [userRole, userDistrict, userRegion, activeCountry]);

  useEffect(() => { loadStats(); }, [loadStats]);
  const [editStats, setEditStats] = useState(false);
  const [ownCountryYearlyData, setOwnCountryYearlyData] = useState<any[]>([]);
  const [editingYear, setEditingYear] = useState<any | null>(null);
  const approved = my.filter(r => r.status === "approved").length;
  const students = my.reduce((acc, r) => acc + r.boys + r.girls, 0);

  // Merge live stats with admin overrides.
  // Once loaded, never go back to 0 — keep last known values during reload.
  const displayStats = {
    learners: statsLoaded ? stats.learners : stats.learners || 0,
    teachers: statsLoaded ? stats.teachers : stats.teachers || 0,
    schools:  statsLoaded ? stats.schools  : stats.schools  || 0,
    tots:     statsLoaded ? stats.tots     : stats.tots     || 0,
    stots:    statsLoaded ? stats.stots    : stats.stots    || 0,
    casesReferred: statsLoaded ? (stats as any).casesReferred : (stats as any).casesReferred || 0,
  };

  const [YEARLY_DATA, setYEARLY_DATA] = useState<any[]>([]);

useEffect(() => {
  programmeStatsApi.getAll(activeCountry).then(data => {
    if (Array.isArray(data) && data.length > 0) {
      const currentYear = new Date().getFullYear();
      const filtered = data.filter((d: any) =>
        !d.is_planned && parseInt(d.year) <= currentYear
      );
      setYEARLY_DATA(filtered.map((d: any) => ({
        year: d.year,
        schools: d.schools,
        teachers: d.teachers,
        learners: d.learners,
        targetSchools: d.target_schools,
        targetLearners: d.target_learners,
        current: d.is_current,
        planned: d.is_planned,
      })));
    }
  });
}, [activeCountry]);

  const chartRefs = useRef<Record<string, any>>({});
  const mapRef = useRef<any>(null);

  useEffect(() => {
    const Chart = (window as any).Chart;
    if (!Chart) return;

    const kill = (id: string) => {
      if (chartRefs.current[id]) {
        chartRefs.current[id].destroy();
        delete chartRefs.current[id];
      }
    };

    // Canvas/Chart.js cannot resolve CSS var() syntax directly — read the actual
    // computed color value so charts follow the user's selected theme color.
    const C_ORANGE = getComputedStyle(document.documentElement).getPropertyValue('--brand').trim() || '#e85d04';
    const C_BLACK = "#0f1623";
    const C_GRID = "rgba(15, 22, 35, 0.06)";
    const C_TICK = "#6b7280";

    const buildCharts = () => {
      const lineCtx = document.getElementById("up-line-learners") as HTMLCanvasElement;
      if (lineCtx) {
        kill("line-learners");
        chartRefs.current["line-learners"] = new Chart(lineCtx, {
          type: "line",
          data: {
            labels: YEARLY_DATA.map(d => d.year),
            datasets: [
              {
                label: "Actual learners",
                data: YEARLY_DATA.map(d => d.learners),
                borderColor: C_ORANGE,
                backgroundColor: "rgba(232, 93, 4, 0.08)",
                fill: true,
                tension: 0.35,
                pointRadius: 4,
                pointBackgroundColor: C_ORANGE
              },
              {
                label: "Target learners",
                data: YEARLY_DATA.map(d => d.targetLearners),
                borderColor: C_BLACK,
                backgroundColor: "rgba(15, 22, 35, 0.04)",
                fill: true,
                borderDash: [5, 4],
                tension: 0.35,
                pointRadius: 4,
                pointBackgroundColor: C_BLACK
              },
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: "top",
                labels: { font: { size: 10 }, color: C_TICK }
              }
            },
            scales: {
              x: { grid: { display: false }, ticks: { color: C_TICK, font: { size: 10 } } },
              y: { grid: { color: C_GRID }, ticks: { color: C_TICK, font: { size: 10 } } },
            },
          },
        });
      }

      const barYearCtx = document.getElementById("up-bar-year") as HTMLCanvasElement;
      if (barYearCtx) {
        kill("bar-year");
        chartRefs.current["bar-year"] = new Chart(barYearCtx, {
          type: "bar",
          data: {
            labels: YEARLY_DATA.map(d => d.year),
            datasets: [
              { label: "Schools reached", data: YEARLY_DATA.map(d => d.schools), backgroundColor: C_ORANGE, borderRadius: 5 },
              { label: "Teachers trained", data: YEARLY_DATA.map(d => d.teachers), backgroundColor: C_BLACK, borderRadius: 5 },
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: "top",
                labels: { font: { size: 10 }, color: C_TICK }
              }
            },
            scales: {
              x: { grid: { display: false }, ticks: { color: C_TICK, font: { size: 10 } } },
              y: { grid: { color: C_GRID }, ticks: { color: C_TICK, font: { size: 10 } } },
            },
          },
        });
      }
    };

    const raf = requestAnimationFrame(buildCharts);
    return () => {
      cancelAnimationFrame(raf);
      Object.keys(chartRefs.current).forEach(kill);
    };
  }, [darkMode, YEARLY_DATA]);

  // Live clusters for dashboard map
  const [dashClusters, setDashClusters] = useState<any[]>([]);
  useEffect(() => {
    import('../api').then(({ mapClustersApi }) => {
      mapClustersApi.getAll({ country: activeCountry }).then((data) => {
        setDashClusters(data.length > 0 ? data : getStaticMapClusters());
      }).catch(() => {
        setDashClusters(getStaticMapClusters());
      });
    });
  }, [activeCountry]);

  useEffect(() => {
    const L = (window as any).L;
    if (!L) return;
    const mapEl = document.getElementById("dashboard-ett-map");
    if (!mapEl) return;

    const map = L.map("dashboard-ett-map", { zoomControl: false, scrollWheelZoom: false }).setView(
      activeCountry === 'Kenya' ? [-0.5, 37.5] :
      activeCountry === 'Somaliland' ? [9.5, 46.0] :
      [-13.2, 34.0],
      activeCountry === 'Kenya' ? 5.5 : 6.5
    );
    mapRef.current = map;

    L.tileLayer(
      darkMode
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      { attribution: '&copy; OpenStreetMap &copy; CARTO', maxZoom: 18 }
    ).addTo(map);

    // Render live clusters + schools with same icons as MapsPage
    dashClusters.forEach(cluster => {
      // Connector lines
      cluster.schools?.forEach((school: any) => {
        L.polyline([[cluster.lat, cluster.lng], [school.lat, school.lng]], {
          color: "var(--brand)", weight: 1.2, opacity: 0.35, dashArray: "4 4"
        }).addTo(map);
      });

      // School markers — trained=green square, untrained=amber hollow
      cluster.schools?.forEach((school: any) => {
        const trained = school.ett_trained;
        const bg     = trained ? '#16a34a' : '#d97706';
        const border = trained ? '#064e3b' : '#78350f';
        const html = `
          <div style="display:flex;flex-direction:column;align-items:center;">
            <div style="width:10px;height:10px;border-radius:2px;background:${trained ? bg : 'transparent'};border:1.5px ${trained ? 'solid' : 'dashed'} ${trained ? border : '#d97706'};box-shadow:0 1px 3px rgba(0,0,0,.25);"></div>
          </div>`;
        const icon = L.divIcon({ className: '', html, iconAnchor: [5, 5] });
        L.marker([school.lat, school.lng], { icon, zIndexOffset: 100 })
          .addTo(map)
          .bindPopup(`<div style="font-family:sans-serif;min-width:160px">
 <div style="font-weight:800;font-size:12px">${school.name}</div>
 <div style="font-size:10px;color:${trained ? '#16a34a': '#d97706'};font-weight:700;margin:2px 0">${trained ? 'ETT Trained': '○ Not Trained'}</div>
 <div style="font-size:10px;color:#6b7280">${cluster.district}</div>
 <div style="font-size:10px;color:#6b7280"> ${((school.boys_enrolled||0)+(school.girls_enrolled||0)).toLocaleString()} learners</div>
 </div>`);
      });

      // Cluster centre — dark circle with orange ring + orange name label
      const clusterHtml = `
        <div style="display:flex;flex-direction:column;align-items:center;">
          <div style="width:14px;height:14px;border-radius:50%;background:${darkMode?'#1e293b':'#0f1623'};border:2px solid var(--brand);box-shadow:0 2px 5px rgba(0,0,0,.4);"></div>
          <div style="margin-top:2px;background:var(--brand);color:white;font-size:7px;font-weight:800;padding:1px 4px;border-radius:3px;white-space:nowrap;max-width:70px;overflow:hidden;text-overflow:ellipsis;pointer-events:none;">
            ${cluster.name.length > 14 ? cluster.name.slice(0, 14) + '…' : cluster.name}
          </div>
        </div>`;
      const centerIcon = L.divIcon({ className: '', html: clusterHtml, iconAnchor: [7, 7] });
      L.marker([cluster.lat, cluster.lng], { icon: centerIcon, zIndexOffset: 300 })
        .addTo(map)
        .bindPopup(`<div style="font-family:sans-serif;min-width:180px">
 <div style="font-weight:800;font-size:13px">${cluster.name}</div>
 <div style="font-size:10px;color:var(--brand);font-weight:700;margin-bottom:4px">${cluster.district} · ${cluster.region}</div>
 <div style="font-size:10px;color:#6b7280"> ${cluster.students?.toLocaleString()} learners</div>
 <div style="font-size:10px;color:#6b7280"> ${cluster.school_count} schools · ${cluster.trained} trained</div>
 ${cluster.lead ? `<div style="font-size:10px;color:#6b7280">Lead: <b>${cluster.lead}</b></div>` : ''}
            <div style="background:#f1f5f9;border-radius:3px;height:5px;overflow:hidden;margin-top:5px">
              <div style="width:${cluster.progress||0}%;height:100%;background:var(--brand);border-radius:3px"></div>
            </div>
            <div style="font-size:9px;color:#9ca3af;text-align:right;margin-top:1px">${cluster.progress||0}% progress</div>
          </div>`);
    });

    return () => { map.remove(); mapRef.current = null; };
  }, [darkMode, dashClusters, activeCountry]);

  return (
    <div className="space-y-6">

      <PageHeader
        title={
          <span className="border-l-[4px] border-[var(--brand-500)] pl-2.5 py-0.5 inline-block">
            {user ? t('dashboard.welcome', { name: currentUser.name }) : t('dashboard.program_overview')}
          </span>
        }
        subtitle={user ? `${ROLE_CFG[user.role]?.label}${user.region ? ` · ${user.region} Region` : ''}${user.district ? ` · ${user.district}` : ''}` : `${t('dashboard.ujamaa_dashboard')} · Ujamaa Africa`}
        actions={
          <>
          {user?.role === 'admin' && (
          <Btn size="sm" variant="ghost" onClick={() => setEditStats(true)}>
            {t('dashboard.edit_programme_stats')}
          </Btn>
          )}
            <Btn size="sm" onClick={() => setPage("submit")}>
              <FilePlus size={13} /> {user ? t('dashboard.submit_report') : t('dashboard.report_case')}
            </Btn>
            {isStaff && can(user!.role, "approveReport") && pending > 0 && (
              <Btn size="sm" variant="secondary" onClick={() => setPage("reports")}>
                {t('dashboard.pending_count', { count: pending })}
              </Btn>
            )}
          </>
        }
      />

      <DashboardAnnouncementsBanner />

      {/* KPI row */}
      <div className="space-y-2">
        {/* Admin refresh button for KPI cards -- all figures are live, no manual override */}
        {user?.role === 'admin' && (
          <div className="flex justify-end gap-2">
            <button onClick={loadStats} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[var(--brand-600)] transition-colors">
              <RefreshCw size={12} /> {t('dashboard.refresh')}
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {!isStaff ? (
            <>
              {[
                { icon: <GraduationCap size={18} />, label: t('dashboard.learners_reached'),  value: displayStats.learners.toLocaleString(),  key: 'learners', primary: true },
                { icon: <Users size={16} />,         label: t('dashboard.teachers_trained'),   value: displayStats.teachers.toLocaleString(),  key: 'teachers', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/30' },
                { icon: <School size={16} />,        label: t('dashboard.schools_reached'),    value: displayStats.schools.toLocaleString(),   key: 'schools', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
                { icon: <Shield size={16} />,        label: t('dashboard.tots_certified'),     value: displayStats.tots.toLocaleString(),      key: 'tots', color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800/60' },
                { icon: <Star size={16} />,          label: t('dashboard.senior_stots'),value: displayStats.stots.toLocaleString(),     key: 'stots', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/30' },
                { icon: <ArrowRightCircle size={16} />, label: t('dashboard.gbv_cases_referred'), value: displayStats.casesReferred.toLocaleString(), key: 'casesReferred', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30' },
              ].map((s: any, i) => (
                s.primary ? (
                  <div
                    key={i}
                    className="p-4 rounded-2xl relative group hover-lift animate-fade-in-up stagger-item cursor-default"
                    style={{
                      background: "linear-gradient(135deg, var(--brand) 0%, var(--brand-700) 100%)",
                      boxShadow: "0 6px 20px -4px color-mix(in srgb, var(--brand) 35%, transparent)",
                      animationDelay: `${i * 60}ms`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="p-1 rounded-lg bg-white/15" style={{ filter: "brightness(0) invert(1) opacity(0.9)" }}>{s.icon}</span>
                      <span className="text-[10px] text-white opacity-85 font-semibold leading-tight tracking-wide">{s.label}</span>
                    </div>
                    <div className="text-3xl font-black text-white tracking-tight">{s.value}</div>
                  </div>
                ) : (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 hover-lift animate-fade-in-up stagger-item cursor-default"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`p-1 rounded-lg ${s.bg} ${s.color}`}>{s.icon}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-tight tracking-wide">{s.label}</span>
                    </div>
                    <div className="text-xl font-bold text-black dark:text-white tracking-tight">{s.value}</div>
                  </div>
                )
              ))}
            </>
          ) : (
            <>
              {[
                { icon: <FileText size={18} />, label: t('dashboard.total_reports'), value: my.length,   trend: 12, primary: true },
                { icon: <Clock size={16} />,        label: t('dashboard.pending'),       value: pending,     trend: -5, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
                { icon: <CheckSquare size={16} />,label: t('dashboard.approved'),      value: approved,    trend: 18, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
                { icon: <Users size={16} />,       label: t('dashboard.learners'),      value: students,    trend: 8, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/30'  },
                { icon: <Shield size={16} />,      label: t('dashboard.tots'),          value: displayStats.tots, trend: 0, color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800/60' },
              ].map((s: any, i) => (
                s.primary ? (
                  <div
                    key={i}
                    className="p-4 rounded-2xl hover-lift animate-fade-in-up stagger-item cursor-default"
                    style={{
                      background: "linear-gradient(135deg, var(--brand) 0%, var(--brand-700) 100%)",
                      boxShadow: "0 6px 20px -4px color-mix(in srgb, var(--brand) 35%, transparent)",
                      animationDelay: `${i * 60}ms`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="p-1 rounded-lg bg-white/15" style={{ filter: "brightness(0) invert(1) opacity(0.9)" }}>{s.icon}</span>
                      <span className="text-[10px] text-white opacity-85 font-semibold">{s.label}</span>
                    </div>
                    <div className="text-3xl font-black text-white tracking-tight">{s.value}</div>
                    <TrendIndicator value={s.trend} className="mt-1 !text-white/80" />
                  </div>
                ) : (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 hover-lift animate-fade-in-up stagger-item cursor-default"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`p-1 rounded-lg ${s.bg} ${s.color}`}>{s.icon}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{s.label}</span>
                    </div>
                    <div className="text-xl font-bold text-black dark:text-white tracking-tight">{s.value}</div>
                    <TrendIndicator value={s.trend} className="mt-1" />
                  </div>
                )
              ))}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Recent submissions / activity */}
        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-black dark:text-white m-0">
              {isStaff ? t('dashboard.recent_submissions') : t('dashboard.program_milestones')}
            </h3>
            {isStaff && (
              <button type="button" onClick={() => setPage(user?.role === "data_entry" ? "my_reports" : "reports")} className="text-[10px] font-semibold text-[var(--brand-600)] hover:underline">
                {t('dashboard.view_all')}
              </button>
            )}
          </div>
          {isStaff ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-white dark:bg-[#0f1623]">
                    {[t('dashboard.th_school'), t('dashboard.th_district'), t('dashboard.th_curriculum'), t('dashboard.learners'), t('dashboard.th_status'), t('dashboard.th_date')].map(c => (
                      <th key={c} className="px-3 py-2 text-[10px] font-semibold text-black dark:text-white uppercase opacity-70">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {my.slice(0, 6).map(r => (
                    <tr key={r.id} className="border-t border-neutral-200 dark:border-slate-800 text-black dark:text-white">
                      <td className="px-3 py-2 font-medium">{r.school}</td>
                      <td className="px-3 py-2 text-black dark:text-white opacity-80">{r.district}</td>
                      <td className="px-3 py-2"><span className="text-[10px] font-semibold text-[var(--brand-600)]">{r.curriculum}</span></td>
                      <td className="px-3 py-2">{r.boys + r.girls}</td>
                      <td className="px-3 py-2"><Pill s={r.status} /></td>
                      <td className="px-3 py-2 opacity-60">{r.submitted_at}</td>
                    </tr>
                  ))}
                  {my.length === 0 && (
                    <tr><td colSpan={6} className="px-3 py-8 text-center text-black dark:text-white opacity-50">{t('dashboard.no_reports_yet')}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {YEARLY_DATA.filter(d => !d.planned).map(d => (
                <div key={d.year} className={`p-2.5 rounded-md border text-xs bg-white dark:bg-[#0f1623] text-black dark:text-white ${d.current ? 'border-[var(--brand-400)]' : 'border-neutral-200 dark:border-slate-800'}`}>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>{d.year}</span>
                    {d.current && <span className="text-[9px] text-[var(--brand-600)]">{t('dashboard.current')}</span>}
                  </div>
                  <div className="text-sm font-bold">{d.learners > 0 ? d.learners.toLocaleString() : "—"}</div>
                  <div className="text-[10px] opacity-60">learners · {d.schools} schools</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Map + charts row -- map is the headline visual; the two smaller
          charts stay deliberately quieter until the viewer wants detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        <Card className="p-0 overflow-hidden flex flex-col lg:col-span-2">
          <div className="px-4 py-3 border-b border-neutral-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <h3 className="text-base font-bold m-0">{t('dashboard.coverage_map')}</h3>
            <button type="button" onClick={() => setPage("maps")} className="text-[10px] font-semibold text-[var(--brand-600)] hover:underline">{t('dashboard.expand')}</button>
          </div>
          <div className="flex-1 min-h-[260px]">
            <div id="dashboard-ett-map" className="h-full w-full" />
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4">
          <Card className="opacity-90">
            <h3 className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 m-0 uppercase tracking-wide">{t('dashboard.learner_growth')}</h3>
            <div className="h-28 relative"><canvas id="up-line-learners" /></div>
          </Card>
          <Card className="opacity-90">
            <h3 className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 m-0 uppercase tracking-wide">{t('dashboard.schools_teachers_by_year')}</h3>
            <div className="h-28 relative"><canvas id="up-bar-year" /></div>
          </Card>
        </div>
      </div>

      {/* Quick links — always last */}
      <Card>
        <h3 className="text-sm font-bold text-black dark:text-white mb-3 m-0">{t('dashboard.quick_links')}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: t('nav.clusters_map'), page: "maps", icon: Map },
            { label: t('dashboard.districts'), page: "districts", icon: School },
            { label: t('nav.curriculum'), page: "curriculum", icon: BookOpen },
            { label: t('dashboard.analytics'), page: "analytics", icon: TrendingUp },
          ].map(({ label, page: p, icon: Icon }) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-black dark:text-white hover:bg-[var(--brand-50)] dark:hover:bg-slate-800 hover:text-[var(--brand-600)] border border-neutral-200 dark:border-slate-800 hover:border-[var(--brand-200)] dark:hover:border-[var(--brand-900)]/40 transition-colors"
            >
              <Icon size={14} className="text-[var(--brand-600)] shrink-0" /> {label}
            </button>
          ))}
        </div>
      </Card>

      {editStats && user?.role === 'admin' && (() => {
        if (ownCountryYearlyData.length === 0) {
          programmeStatsApi.getAll((user as any)?.country).then((data: any) => {
            if (Array.isArray(data)) {
              setOwnCountryYearlyData(data.map((d: any) => ({
                year: d.year, schools: d.schools, teachers: d.teachers, learners: d.learners,
                targetSchools: d.target_schools, targetLearners: d.target_learners,
                current: d.is_current, planned: d.is_planned,
              })));
            }
          }).catch(() => {});
        }
        return true;
      })() && (
  <Modal title="Programme Statistics" onClose={() => { setEditStats(false); setEditingYear(null); }} width={600}>
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {ownCountryYearlyData.map(d => (
        <div key={d.year} className="p-3 rounded-lg border border-neutral-200 dark:border-slate-800">
          {editingYear?.year === d.year ? (
            <div className="space-y-2">
              <div className="font-bold text-sm text-black dark:text-white mb-2">{d.year}</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['Schools', 'schools'], ['Teachers', 'teachers'],
                  ['Learners', 'learners'], ['Target Schools', 'targetSchools'],
                  ['Target Learners', 'targetLearners'],
                ].map(([label, key]) => (
                  <div key={key}>
                    <label className="text-[10px] font-bold uppercase text-black/50 dark:text-white/50">{label}</label>
                    <input
                      type="number"
                      value={editingYear[key]}
                      onChange={e => setEditingYear((p: any) => ({ ...p, [key]: parseInt(e.target.value) || 0 }))}
                      className="w-full text-xs border border-neutral-200 dark:border-slate-700 rounded px-2 py-1 bg-white dark:bg-slate-800 text-black dark:text-white"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 justify-end mt-2">
                <Btn size="sm" variant="ghost" onClick={() => setEditingYear(null)}>Cancel</Btn>
                <Btn size="sm" variant="primary" onClick={async () => {
                  const data = await programmeStatsApi.update(editingYear.year, {
                    schools: editingYear.schools,
                    teachers: editingYear.teachers,
                    learners: editingYear.learners,
                    target_schools: editingYear.targetSchools,
                    target_learners: editingYear.targetLearners,
                    is_current: editingYear.current || false,
                    is_planned: editingYear.planned || false,
                    country: (user as any)?.country,
                  });
                  if (!data.error) {
                    setYEARLY_DATA(prev => prev.map(y => y.year === editingYear.year ? editingYear : y));
                    setEditingYear(null);
                  }
                }}>Save</Btn>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-black dark:text-white">{d.year}</span>
                {d.current && <span className="ml-2 text-[10px] bg-[var(--brand-100)] text-[var(--brand-700)] px-1.5 rounded font-bold">Current</span>}
                {d.planned && <span className="ml-2 text-[10px] bg-slate-100 text-slate-600 px-1.5 rounded font-bold">Planned</span>}
                <div className="text-[11px] text-black/50 dark:text-white/50 mt-0.5">
                  {d.schools.toLocaleString()} schools · {d.teachers.toLocaleString()} teachers · {d.learners.toLocaleString()} learners
                </div>
              </div>
              <Btn
                size="sm"
                variant="ghost"
                disabled={activeCountry === 'all'}
                title={activeCountry === 'all' ? 'Select a specific country to edit its milestones' : undefined}
                onClick={() => { if (activeCountry !== 'all') setEditingYear({ ...d }); }}
              >
                {activeCountry === 'all' ? 'Edit (select a country)' : 'Edit'}
              </Btn>
            </div>
          )}
        </div>
      ))}
    </div>
  </Modal>
)}

    </div>
  );
};
