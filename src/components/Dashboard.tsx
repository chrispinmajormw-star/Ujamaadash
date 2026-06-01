import React, { useEffect, useRef } from 'react';
import { Shield, FilePlus, MapPin, GraduationCap, School, BookOpen, TrendingUp, FileText, Clock, CheckSquare, Users, Map } from 'lucide-react';
import { User, Report } from '../types';
import { ROLE_CFG, can, DISTRICTS, DISTRICT_INFO, MAP_CLUSTERS } from '../data';
import { Card, PageHeader, Btn, Pill, TrendIndicator } from './SubComponents';

interface DashboardProps {
  user: User | null;
  reports: Report[];
  setPage: (p: string) => void;
  darkMode: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, reports, setPage, darkMode }) => {
  const currentUser = user || { role: "viewer" as const, name: "Public Viewer", district: null };
  const isStaff = user && ["admin", "district_coordinator", "data_entry"].includes(user.role);

  const my = (currentUser.role === "data_entry" || currentUser.role === "tot")
    ? reports.filter(r => r.submitted_by === currentUser.name)
    : currentUser.role === "district_coordinator"
      ? reports.filter(r => r.district === currentUser.district)
      : reports;

  const pending = my.filter(r => r.status === "pending").length;
  const approved = my.filter(r => r.status === "approved").length;
  const students = my.reduce((acc, r) => acc + r.boys + r.girls, 0);

  const YEARLY_DATA = [
    { year: "2023", schools: 116, teachers: 228, learners: 45600, targetSchools: 225, targetLearners: 45000 },
    { year: "2024", schools: 357, teachers: 727, learners: 145400, targetSchools: 950, targetLearners: 190005 },
    { year: "2025", schools: 975, teachers: 1973, learners: 395000, targetSchools: 3000, targetLearners: 600000 },
    { year: "2026", schools: 1482, teachers: 2964, learners: 592200, targetSchools: 6000, targetLearners: 1200000, current: true },
    { year: "2027", schools: 0, teachers: 0, learners: 0, targetSchools: 10000, targetLearners: 2000000, planned: true },
  ];

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

    const C_ORANGE = "#e85d04";
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
  }, [darkMode]);

  useEffect(() => {
    const L = (window as any).L;
    if (!L) return;
    const mapEl = document.getElementById("dashboard-ett-map");
    if (!mapEl) return;

    const map = L.map("dashboard-ett-map", { zoomControl: true }).setView([-13.2, 34.0], 6.5);
    mapRef.current = map;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 18
    }).addTo(map);

    L.control.scale({ imperial: false }).addTo(map);

    const ACTIVE_DISTRICTS = new Set([
      "Mzimba", "Mzunzu", "Lilongwe", "Dowa", "Kasungu", "Dedza", "Ntcheu", "Ntchisi", "Nkhotakota", "Salima",
      "Blantyre", "Zomba", "Mangochi", "Machinga", "Balaka"
    ]);

    DISTRICTS.forEach(district => {
      const coords = DISTRICT_INFO[district.name];
      if (!coords) return;
      const isActive = ACTIVE_DISTRICTS.has(district.name);
      L.circleMarker([coords.lat, coords.lng], {
        radius: isActive ? 6 : 4,
        fillColor: isActive ? "#e85d04" : "#d1d5db",
        color: "#fff",
        weight: 1.5,
        fillOpacity: isActive ? 0.9 : 0.4
      }).addTo(map).bindTooltip(district.name, { permanent: false, direction: "top", offset: [0, -4] });
    });

    MAP_CLUSTERS.forEach(cluster => {
      cluster.schools.forEach(school => {
        L.polyline([[cluster.lat, cluster.lng], [school.lat, school.lng]], {
          color: "#e85d04", weight: 1.5, opacity: 0.4, dashArray: "4 4"
        }).addTo(map);
      });

      cluster.schools.forEach(school => {
        const schoolIcon = L.divIcon({
          className: "custom-leaflet-school-marker",
          html: `<div style="width:8px;height:8px;border-radius:50%;background:#e85d04;border:1.5px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.25)"></div>`,
          iconAnchor: [4, 4]
        });
        L.marker([school.lat, school.lng], { icon: schoolIcon, zIndexOffset: 100 })
          .addTo(map)
          .bindPopup(`<div style="font-size:12px;font-weight:700">${school.name}</div><div style="font-size:10px;color:#6b7280">${cluster.district} · Lead: ${cluster.lead}</div>`);
      });

      const centerIcon = L.divIcon({
        className: "custom-leaflet-center-marker",
        html: `<div style="width:13px;height:13px;border-radius:50%;background:#0f1623;border:2.5px solid #e85d04;box-shadow:0 2px 5px rgba(0,0,0,.3)"></div>`,
        iconAnchor: [6, 6]
      });
      L.marker([cluster.lat, cluster.lng], { icon: centerIcon, zIndexOffset: 300 }).addTo(map)
        .bindPopup(`<div style="font-size:13px;font-weight:800">${cluster.name}</div><div style="font-size:11px;color:#6b7280">District: ${cluster.district} · Lead: ${cluster.lead}</div><div style="font-size:11px;color:#6b7280">Learners: ${cluster.students} · Trained: ${cluster.trained}/${cluster.schools.length}</div>`);
    });

    return () => { map.remove(); mapRef.current = null; };
  }, [darkMode]);

  return (
    <div className="space-y-4">

      <PageHeader
        title={
          <span className="border-l-[4px] border-orange-500 pl-2.5 py-0.5 inline-block">
            {user ? `Welcome, ${currentUser.name}` : "Program overview"}
          </span>
        }
        subtitle={user ? `${ROLE_CFG[user.role]?.label}${currentUser.district ? ` · ${currentUser.district}` : ''}` : "Ujamaa Dashboard · Ujamaa Pamodzi Africa"}
        actions={
          <>
            <Btn size="sm" onClick={() => setPage("submit")}>
              <FilePlus size={13} /> {user ? "Submit report" : "Report case"}
            </Btn>
            {isStaff && can(user!.role, "approveReport") && pending > 0 && (
              <Btn size="sm" variant="secondary" onClick={() => setPage("reports")}>
                Pending ({pending})
              </Btn>
            )}
          </>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {!isStaff ? (
          <>
            {[
              { icon: <GraduationCap size={16} className="text-orange-600" />, label: "Learners", value: "592,200+" },
              { icon: <School size={16} className="text-orange-600" />, label: "Schools", value: "2,964" },
              { icon: <MapPin size={16} className="text-orange-600" />, label: "Districts", value: "15" },
              { icon: <Shield size={16} className="text-orange-600" />, label: "TOTs", value: "665" },
              { icon: <BookOpen size={16} className="text-orange-600" />, label: "Lessons", value: "17,784+" },
              { icon: <TrendingUp size={16} className="text-orange-600" />, label: "Coverage", value: "54%" },
            ].map((s, i) => (
              <div key={i} className="p-3 rounded-lg" style={{ background: "linear-gradient(135deg, #e85d04 0%, #c44d00 100%)", boxShadow: "0 4px 14px rgba(232,93,4,0.25)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ filter: "brightness(0) invert(1) opacity(0.85)" }}>{s.icon}</span>
                  <span className="text-[10px] text-white opacity-85 font-medium">{s.label}</span>
                </div>
                <div className="text-lg font-bold text-white">{s.value}</div>
              </div>
            ))}
          </>
        ) : (
          <>
            {[
              { icon: <FileText size={16} className="text-orange-600" />, label: "Total reports", value: my.length, trend: 12 },
              { icon: <Clock size={16} className="text-amber-600" />, label: "Pending", value: pending, trend: -5 },
              { icon: <CheckSquare size={16} className="text-emerald-600" />, label: "Approved", value: approved, trend: 18 },
              { icon: <Users size={16} className="text-orange-600" />, label: "Learners", value: students, trend: 8 },
            ].map((s: any, i) => (
              <div key={i} className="p-3 rounded-lg" style={{ background: "linear-gradient(135deg, #e85d04 0%, #c44d00 100%)", boxShadow: "0 4px 14px rgba(232,93,4,0.25)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ filter: "brightness(0) invert(1) opacity(0.85)" }}>{s.icon}</span>
                  <span className="text-[10px] text-white opacity-85 font-medium">{s.label}</span>
                </div>
                <div className="text-lg font-bold text-white">{s.value}</div>
                <TrendIndicator value={s.trend} className="mt-1 !text-white/80" />
              </div>
            ))}
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent submissions / activity */}
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-black dark:text-white m-0">
              {isStaff ? "Recent submissions" : "Program milestones"}
            </h3>
            {isStaff && (
              <button type="button" onClick={() => setPage(user?.role === "data_entry" ? "my_reports" : "reports")} className="text-[10px] font-semibold text-orange-600 hover:underline">
                View all
              </button>
            )}
          </div>
          {isStaff ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-white dark:bg-[#0f1623]">
                    {["School", "District", "Curriculum", "Learners", "Status", "Date"].map(c => (
                      <th key={c} className="px-3 py-2 text-[10px] font-semibold text-black dark:text-white uppercase opacity-70">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {my.slice(0, 6).map(r => (
                    <tr key={r.id} className="border-t border-neutral-200 dark:border-slate-800 text-black dark:text-white">
                      <td className="px-3 py-2 font-medium">{r.school}</td>
                      <td className="px-3 py-2 text-black dark:text-white opacity-80">{r.district}</td>
                      <td className="px-3 py-2"><span className="text-[10px] font-semibold text-orange-600">{r.curriculum}</span></td>
                      <td className="px-3 py-2">{r.boys + r.girls}</td>
                      <td className="px-3 py-2"><Pill s={r.status} /></td>
                      <td className="px-3 py-2 opacity-60">{r.submitted_at}</td>
                    </tr>
                  ))}
                  {my.length === 0 && (
                    <tr><td colSpan={6} className="px-3 py-8 text-center text-black dark:text-white opacity-50">No reports yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {YEARLY_DATA.filter(d => !d.planned).map(d => (
                <div key={d.year} className={`p-2.5 rounded-md border text-xs bg-white dark:bg-[#0f1623] text-black dark:text-white ${d.current ? 'border-orange-400' : 'border-neutral-200 dark:border-slate-800'}`}>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>{d.year}</span>
                    {d.current && <span className="text-[9px] text-orange-600">Current</span>}
                  </div>
                  <div className="text-sm font-bold">{d.learners > 0 ? d.learners.toLocaleString() : "—"}</div>
                  <div className="text-[10px] opacity-60">learners · {d.schools} schools</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick links */}
        <Card>
          <h3 className="text-xs font-semibold text-black dark:text-white mb-3 m-0">Quick links</h3>
          <div className="space-y-1.5">
            {[
              { label: "Clusters map", page: "maps", icon: Map },
              { label: "Districts", page: "districts", icon: MapPin },
              { label: "Curriculum", page: "curriculum", icon: BookOpen },
              { label: "Analytics", page: "analytics", icon: TrendingUp },
            ].map(({ label, page: p, icon: Icon }) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium text-black dark:text-white hover:bg-orange-50 dark:hover:bg-slate-800 hover:text-orange-600 border border-transparent hover:border-orange-200 dark:hover:border-orange-900/40"
              >
                <Icon size={14} className="text-orange-600" /> {label}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Map + charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-semibold m-0">Coverage map</h3>
            <button type="button" onClick={() => setPage("maps")} className="text-[10px] font-semibold text-orange-600 hover:underline">Expand</button>
          </div>
          <div className="h-56">
            <div id="dashboard-ett-map" className="h-full w-full" />
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4">
          <Card>
            <h3 className="text-xs font-semibold mb-2 m-0">Learner growth</h3>
            <div className="h-36 relative"><canvas id="up-line-learners" /></div>
          </Card>
          <Card>
            <h3 className="text-xs font-semibold mb-2 m-0">Schools & teachers by year</h3>
            <div className="h-36 relative"><canvas id="up-bar-year" /></div>
          </Card>
        </div>
      </div>
    </div>
  );
};
