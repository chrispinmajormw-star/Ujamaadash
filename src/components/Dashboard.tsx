import React, { useEffect, useRef } from 'react';
import { HelpCircle, Star, Shield, LayoutDashboard, FilePlus, ChevronRight, Mail, Phone, MapPin, GraduationCap, School, BookOpen, TrendingUp, FileText, Clock, CheckSquare, Users, Heart, Map } from 'lucide-react';
import { User, Report } from '../types';
import { ROLE_CFG, can, DISTRICTS, DISTRICT_INFO, MAP_CLUSTERS } from '../data';
import { Card, Kicker, Btn, StatCard, Badge, Pill, TH, ProgBar } from './SubComponents';

interface DashboardProps {
  user: User | null;
  reports: Report[];
  setPage: (p: string) => void;
  darkMode: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, reports, setPage, darkMode }) => {
  const currentUser = user || { role: "viewer" as const, name: "Public Viewer", district: null };
  const isPublic = !user;
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

  const SUMMARY_BADGES = [
    { label: "Total Clusters", value: "396", pale: "bg-orange-100 text-orange-800 border border-orange-200" },
    { label: "TOTs Trained", value: "665", pale: "bg-black text-white" },
    { label: "Teachbacks", value: "288", pale: "bg-orange-600 text-white" },
    { label: "Meetings Held", value: "371", pale: "bg-orange-50 text-orange-900 border border-orange-200" },
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
    <div className="space-y-6">

      {/* ── Hero Banner ── */}
      <div style={{ background: "#0f1623" }} className="rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
        {/* Orange accent bar top */}
        <div style={{ background: "#e85d04" }} className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl" />
        {/* Decorative circle */}
        <div style={{ background: "rgba(232,93,4,0.12)" }} className="absolute top-[-60px] right-[-60px] w-64 h-64 rounded-full pointer-events-none" />
        <div style={{ background: "rgba(232,93,4,0.06)" }} className="absolute bottom-[-40px] left-[-40px] w-48 h-48 rounded-full pointer-events-none" />

        <div className="relative flex flex-col items-center justify-center text-center space-y-4">
          <span style={{ background: "rgba(232,93,4,0.15)", color: "#e85d04", border: "1px solid rgba(232,93,4,0.3)" }}
            className="text-[11px] font-bold uppercase tracking-widest rounded-full px-4 py-1">
            {isStaff ? "System Dashboard Access" : "Malawi National ScaleUp Dashboard"}
          </span>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-none text-white max-w-4xl">
            {user ? currentUser.name : "ETT Country Wide ScaleUp Program"}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
            <span style={{ background: "#e85d04" }} className="text-white px-3 py-1 rounded-full flex items-center gap-1">
              {user ? ROLE_CFG[user.role]?.label : "Public Guest"}
            </span>
            {currentUser.district && (
              <span className="text-gray-400">aligned: {currentUser.district} region</span>
            )}
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
            {isPublic ? (
              <>
                <button
                  onClick={() => setPage("submit")}
                  style={{ background: "#e85d04" }}
                  className="text-white font-bold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity"
                >
                  Report SGBV Incident
                </button>
                <button
                  onClick={() => setPage("login")}
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                  className="text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-white/15 transition-colors"
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setPage("submit")}
                  style={{ background: "#e85d04" }}
                  className="text-white font-bold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity"
                >
                  Submit Report
                </button>
                {isStaff && can(user.role, "approveReport") && pending > 0 && (
                  <button
                    onClick={() => setPage("reports")}
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                    className="text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-white/15 transition-colors"
                  >
                    Review Pending ({pending})
                  </button>
                )}
                {isStaff && can(user.role, "manageUsers") && (
                  <button
                    onClick={() => setPage("users")}
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                    className="text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-white/15 transition-colors"
                  >
                    Manage Users
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {!isStaff ? (
          <>
            {[
              { icon: <GraduationCap size={18} style={{ color: "#e85d04" }} />, label: "Students Reached", value: "592,200+" },
              { icon: <School size={18} style={{ color: "#e85d04" }} />, label: "Schools Covered", value: "2,964" },
              { icon: <MapPin size={18} style={{ color: "#e85d04" }} />, label: "Implementing Districts", value: "15" },
              { icon: <Shield size={18} style={{ color: "#e85d04" }} />, label: "TOTs Certified", value: "665" },
              { icon: <BookOpen size={18} style={{ color: "#e85d04" }} />, label: "Lessons Conducted", value: "17,784+" },
              { icon: <TrendingUp size={18} style={{ color: "#e85d04" }} />, label: "Target coverage", value: "54%" },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div style={{ background: "#fff4ee" }} className="w-9 h-9 rounded-xl flex items-center justify-center mb-3">
                  {s.icon}
                </div>
                <div style={{ color: "#e85d04" }} className="text-2xl font-black leading-tight">{s.value}</div>
                <div className="text-xs text-gray-500 mt-1 font-semibold">{s.label}</div>
              </div>
            ))}
          </>
        ) : (
          <>
            {[
              { icon: <FileText size={18} style={{ color: "#e85d04" }} />, label: "Total Files", value: my.length, color: "#e85d04" },
              { icon: <Clock size={18} className="text-amber-600" />, label: "Awaiting Review", value: pending, color: "#d97706" },
              { icon: <CheckSquare size={18} className="text-green-600" />, label: "Approved", value: approved, color: "#059669" },
              { icon: <Users size={18} style={{ color: "#e85d04" }} />, label: "Learners", value: students, color: "#e85d04" },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div style={{ background: "#fff4ee" }} className="w-9 h-9 rounded-xl flex items-center justify-center mb-3">
                  {s.icon}
                </div>
                <div style={{ color: s.color }} className="text-2xl font-black leading-tight">{s.value}</div>
                <div className="text-xs text-gray-500 mt-1 font-semibold">{s.label}</div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── Program Core Offerings (public only) ── */}
      {!isStaff && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div style={{ color: "#e85d04" }} className="text-[11px] font-extrabold uppercase tracking-widest mb-1">What We Do</div>
              <h3 className="text-base font-bold text-gray-900 m-0">ScaleUp Program Core Offerings</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" style={{ color: "#e85d04" }}>
                    <circle cx="12" cy="9" r="4" />
                    <path d="M8.5 7C7 6.5 6.5 7 6 8.5s.5 2.5 1.5 1" />
                    <path d="M15.5 7c1.5-.5 2-.0 2.5 1.5s-.5 2.5-1.5 1" />
                    <path d="M6 20c0-3.5 3-5 6-5s6 1.5 6 5" />
                  </svg>
                ),
                iconBg: "#fff4ee",
                title: "Girls Empowerment (GESD)",
                text: "Age-appropriate boundary assertiveness training. Equips girls to detect danger early, voice boundaries, and implement physical protection maneuvers.",
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" style={{ color: "#0f1623" }}>
                    <circle cx="12" cy="9" r="4.5" />
                    <path d="M8.5 7.5c.5-1.5 2-2.5 3.5-2.5s3 1 3.5 2.5" />
                    <path d="M6 20c0-3.5 3-5 6-5s6 1.5 6 5" />
                  </svg>
                ),
                iconBg: "#f3f4f6",
                title: "Boys Transformation (HIM)",
                text: "Empowers boys to challenge harmful gender norms, embrace positive masculinity, respect women, and step up as allies to defend school security.",
              },
              {
                icon: <Heart size={22} style={{ color: "#e85d04" }} />,
                iconBg: "#fff4ee",
                title: "Survivors Support (SASA)",
                text: "Provides trauma-informed safe paths, psychological linkage channels, and responsive SGBV reporting pathways to support student recovery.",
              },
            ].map((item, i) => (
              <div key={i} className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                <div style={{ background: item.iconBg }} className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed m-0">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recent Submissions (staff only) ── */}
      {isStaff && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <div style={{ color: "#e85d04" }} className="text-[11px] font-extrabold uppercase tracking-widest mb-0.5">Data</div>
              <h3 className="text-base font-bold text-gray-900 m-0">Recent File Submissions</h3>
            </div>
            <button
              onClick={() => setPage(user && user.role === "data_entry" ? "my_reports" : "reports")}
              style={{ color: "#e85d04", border: "1px solid #fbd5b8" }}
              className="text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors"
            >
              See All →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr style={{ background: "#fff4ee" }}>
                  {["School", "Region", "Curriculum", "Collective", "Status", "Submitted On"].map(c => (
                    <th key={c} className="px-4 py-2.5 text-left text-[10px] font-extrabold text-orange-700 uppercase tracking-wider border-b border-orange-100 whitespace-nowrap">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {my.slice(0, 5).map(r => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                    <td className="p-3 font-bold text-gray-900 whitespace-nowrap">{r.school}</td>
                    <td className="p-3 text-gray-500">{r.district}</td>
                    <td className="p-3">
                      <span style={{ background: "#fff4ee", color: "#e85d04" }} className="px-2.5 py-0.5 rounded-full text-xs font-bold">
                        {r.curriculum}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-gray-800">{r.boys + r.girls}</td>
                    <td className="p-3"><Pill s={r.status} /></td>
                    <td className="p-3 text-[10.5px] text-gray-400 whitespace-nowrap">{r.submitted_at}</td>
                  </tr>
                ))}
                {my.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-400 font-semibold">
                      No school files verified yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Annual Milestones ── */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <div style={{ color: "#e85d04" }} className="text-[11px] font-extrabold uppercase tracking-widest">Program Transitions</div>
            <h3 className="text-base font-bold text-gray-900 m-0">Annual Expansion Milestones</h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SUMMARY_BADGES.map(b => (
              <span key={b.label} className={`px-2.5 py-0.5 rounded text-[10.5px] font-bold ${b.pale}`}>
                {b.value} {b.label}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {YEARLY_DATA.map(d => (
            <div
              key={d.year}
              style={d.current ? { borderColor: "#e85d04", background: "#fff8f4" } : {}}
              className={`p-4 rounded-xl border flex flex-col justify-between bg-white ${
                d.planned ? "border-gray-200 opacity-60" : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-black mb-2">
                <span style={{ color: d.planned ? "#9ca3af" : "#0f1623" }}>{d.year}</span>
                {d.current && (
                  <span style={{ background: "#e85d04" }} className="text-white text-[8px] font-bold px-1.5 py-0.5 rounded">Live</span>
                )}
                {d.planned && (
                  <span className="bg-gray-100 text-gray-400 text-[8px] font-bold px-1.5 py-0.5 rounded">Plan</span>
                )}
              </div>
              <div className="mb-2">
                <div className="text-[10px] text-gray-400 font-semibold mb-0.5">Learners Trained</div>
                <div style={{ color: "#0f1623" }} className="text-base font-extrabold">
                  {d.learners > 0 ? d.learners.toLocaleString() : "—"}
                </div>
              </div>
              <div className="text-[9.5px] text-gray-400 line-clamp-2">
                tgt: {d.targetSchools} schools · {d.targetLearners >= 1000000 ? `${(d.targetLearners / 1000000).toFixed(1)}M` : `${d.targetLearners / 1000}k`} pupils
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Map ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <div style={{ color: "#e85d04" }} className="text-[11px] font-extrabold uppercase tracking-widest mb-0.5">Geographical Reach</div>
            <h3 className="text-base font-bold text-gray-900 m-0">Malawi National ScaleUp Interactive Map</h3>
          </div>
          <button
            onClick={() => setPage("maps")}
            style={{ color: "#e85d04", border: "1px solid #fbd5b8" }}
            className="text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors"
          >
            Full Map →
          </button>
        </div>
        <div className="h-72 w-full border border-gray-100 rounded-xl overflow-hidden">
          <div id="dashboard-ett-map" className="h-full w-full" />
        </div>
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div style={{ color: "#e85d04" }} className="text-[10px] font-extrabold uppercase tracking-widest mb-1">Trends</div>
          <h4 className="text-sm font-bold text-gray-900 m-0 mb-1">Impact Scaling Trends</h4>
          <p className="text-[10px] text-gray-400 m-0 mb-4">Learner populations reached against target trajectories</p>
          <div className="h-44 w-full relative">
            <canvas id="up-line-learners" />
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div style={{ color: "#e85d04" }} className="text-[10px] font-extrabold uppercase tracking-widest mb-1">Metrics</div>
          <h4 className="text-sm font-bold text-gray-900 m-0 mb-1">Operational Metrics</h4>
          <p className="text-[10px] text-gray-400 m-0 mb-4">Schools certified and teacher certifications by year</p>
          <div className="h-44 w-full relative">
            <canvas id="up-bar-year" />
          </div>
        </div>
      </div>

      {/* ── Bottom 3 Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Quick Access */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div style={{ color: "#e85d04" }} className="text-[11px] font-extrabold uppercase tracking-widest mb-1">Quick Access</div>
          <h3 className="text-sm font-bold text-gray-900 mb-4">Navigation Actions</h3>
          <div className="space-y-2">
            <button
              onClick={() => setPage("submit")}
              style={{ background: "#e85d04" }}
              className="w-full text-white font-bold py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <FilePlus size={14} /> {user ? "Submit session data" : "Report a Case"}
            </button>
            <button
              onClick={() => setPage("curriculum")}
              style={{ border: "1px solid #e5e7eb", color: "#0f1623" }}
              className="w-full font-bold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <BookOpen size={14} /> View Curriculum
            </button>
            <button
              onClick={() => setPage("maps")}
              style={{ border: "1px solid #fbd5b8", color: "#e85d04", background: "#fff8f4" }}
              className="w-full font-bold py-2.5 rounded-xl text-sm hover:bg-orange-100/50 transition-colors flex items-center justify-center gap-2"
            >
              <Map size={14} /> Explore Maps
            </button>
          </div>
        </div>

        {/* Hotline */}
        <div style={{ background: "#0f1623" }} className="rounded-2xl p-5 relative overflow-hidden">
          <div style={{ background: "#e85d04" }} className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" />
          <h3 className="text-sm font-extrabold text-white uppercase mb-4 tracking-wide">Support Hotline</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <div style={{ background: "rgba(232,93,4,0.2)" }} className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone size={14} style={{ color: "#e85d04" }} />
              </div>
              <div>
                <div className="text-white font-bold text-xs">Child Helpline Malawi</div>
                <div className="text-gray-400 text-[11px]">116 (toll-free)</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div style={{ background: "rgba(255,255,255,0.08)" }} className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield size={14} className="text-white" />
              </div>
              <div>
                <div className="text-white font-bold text-xs">VSU Police Emergency</div>
                <div className="text-gray-400 text-[11px]">997 / 991</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div style={{ background: "rgba(232,93,4,0.2)" }} className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone size={14} style={{ color: "#e85d04" }} />
              </div>
              <div>
                <div className="text-white font-bold text-xs">Ujamaa Pamodzi Helpline</div>
                <div className="text-gray-400 text-[11px]">0984 110 288</div>
              </div>
            </div>
          </div>
        </div>

        {/* Districts */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div style={{ color: "#e85d04" }} className="text-[11px] font-extrabold uppercase tracking-widest mb-1">Territorial Scope</div>
          <h3 className="text-sm font-bold text-gray-900 mb-4">Districts by Region</h3>
          <div className="space-y-4">
            {[
              { r: "Northern", active: "2/6", ds: ["Mzimba", "Karonga"] },
              { r: "Central", active: "8/9", ds: ["Lilongwe", "Dowa", "Kasungu", "Dedza"] },
              { r: "Southern", active: "5/13", ds: ["Blantyre", "Zomba", "Mangochi", "Machinga"] },
            ].map(g => (
              <div key={g.r}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold text-gray-800">{g.r} region</span>
                  <span style={{ color: "#e85d04" }} className="text-xs font-extrabold">{g.active} active</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {g.ds.map(d => (
                    <span
                      key={d}
                      onClick={() => setPage("districts")}
                      style={{ background: "#fff4ee", color: "#c44d00", border: "1px solid #fbd5b8" }}
                      className="px-2 py-0.5 rounded text-[10.5px] font-semibold cursor-pointer hover:bg-orange-100 transition-colors"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
