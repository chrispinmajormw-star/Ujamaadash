import { analyticsApi, districtsApi, mapClustersApi } from '../api';
import { useMonitoring } from '../context/MonitoringContext';
import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadialBarChart, RadialBar
} from 'recharts';
import {
  BarChart2, Users, Check, TrendingUp, Download,
  MapPin, GraduationCap, School, FileText, Filter
} from 'lucide-react';
import { RegionalPerformanceCharts } from './RegionalPerformanceCharts';
import { CasesByDistrictChart } from './CasesByDistrictChart';
import { sessionMonitoringApi, gbvCasesApi } from '../api';
import { Report } from '../types';
import { Card, Kicker, StatCard, ProgBar } from './SubComponents';
import { useCountry } from '../context/CountryContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── LIVE DATA SHAPING HELPERS ───────────────
// These take raw rows from /api/districts and /api/map/clusters and reshape
// them into exactly the structures the charts below expect — replacing what
// used to be hardcoded REGIONAL_DATA / TOP15_DISTRICTS / CLUSTER_DATA arrays.

const REGION_COLOR: Record<string, string> = { Northern: '#185fa5', Central: 'var(--brand)', Southern: '#059669' };

function buildRegionalData(districts: any[]) {
  const byRegion: Record<string, { region: string; districts: number; tots: number; schools: number; clusters: number; color: string }> = {};
  districts.forEach(d => {
    const region = d.region || 'Other';
    if (!byRegion[region]) {
      byRegion[region] = { region, districts: 0, tots: 0, schools: 0, clusters: 0, color: REGION_COLOR[region] || '#64748b' };
    }
    byRegion[region].districts += 1;
    byRegion[region].tots += Number(d.tots) || 0;
    byRegion[region].schools += Number(d.schools) || 0;
    byRegion[region].clusters += Number(d.zones) || 0;
  });
  return Object.values(byRegion);
}

function buildTop15Districts(districts: any[]) {
  return [...districts]
    .sort((a, b) => (Number(b.tots) || 0) - (Number(a.tots) || 0))
    .slice(0, 15)
    .map(d => ({
      district: d.name,
      tots: Number(d.tots) || 0,
      schools: Number(d.schools) || 0,
      coverage: Number(d.coverage) || 0,
      region: d.region,
    }));
}

function buildClusterData(clusters: any[]) {
  return clusters.map(c => ({
    cluster: c.name,
    district: c.district,
    students: Number(c.students) || 0,
    progress: Number(c.progress) || 0,
  }));
}

const OR = 'var(--brand)';
const COLORS = { Northern: '#185fa5', Central: 'var(--brand)', Southern: '#059669' };
const PIE_COLORS = ['#059669', '#f59e0b', '#dc2626', '#3b82f6'];

// ─── CUSTOM TOOLTIP ──────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#0f1623] border border-neutral-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-lg text-xs">
      {label && <p className="font-bold text-black dark:text-white mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value.toLocaleString()}{p.name?.includes('coverage') || p.name?.includes('progress') ? '%' : ''}
        </p>
      ))}
    </div>
  );
};

// ─── PDF DOWNLOAD ────────────────────────────
function drawBarChart(
  doc: jsPDF,
  data: { label: string; value: number }[],
  x: number,
  y: number,
  width: number,
  height: number,
  color: [number, number, number]
) {
  const max = Math.max(...data.map(d => d.value || 0), 1);
  const barGap = 4;
  const barWidth = (width - barGap * (data.length - 1)) / data.length;
  doc.setFontSize(7);
  data.forEach((d, i) => {
    const val = d.value || 0;
    const barHeight = (val / max) * (height - 14);
    const bx = x + i * (barWidth + barGap);
    const by = y + height - barHeight - 10;
    doc.setFillColor(...color);
    doc.rect(bx, by, barWidth, barHeight, 'F');
    doc.setTextColor(0);
    doc.text(String(val), bx + barWidth / 2, by - 2, { align: 'center' });
    doc.text(String(d.label || '').slice(0, 10), bx + barWidth / 2, y + height - 3, { align: 'center' });
  });
}

const downloadReport = (
  regionalData: any[] = [],
  top15Districts: any[] = [],
  clusterData: any[] = [],
  totalTots: number = 0,
  totalSchools: number = 0,
  totalStudents: number = 0,
  activeDistricts: number = 0,
  totalDistricts: number = 0,
  byStatus: Record<string, number> = {},
  byCurr: Record<string, number> = {},
  byDist: Record<string, number> = {},
  boys: number = 0,
  girls: number = 0,
  monActivities: any[] = [],
  monIssues: any[] = [],
  reportCountry: string = 'all',
  regionalPerformance: any[] = [],
  casesByDistrict: any[] = []
) => {
  console.log('downloadReport inputs:', { regionalData, top15Districts, clusterData, totalTots, totalSchools, totalStudents, activeDistricts, totalDistricts, byStatus, byCurr, byDist, boys, girls, monActivities, monIssues });

  const safeTots = totalTots || 0;
  const safeSchools = totalSchools || 0;
  const safeStudents = totalStudents || 0;
  const safeBoys = boys || 0;
  const safeGirls = girls || 0;
  const safeActive = activeDistricts || 0;
  const safeTotalDistricts = totalDistricts || 0;
  const safeClusters = (clusterData || []).length;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const countryLabel = reportCountry && reportCountry !== 'all' ? reportCountry : 'All Countries (Combined)';
  doc.text(`Program Analysis Report — ${countryLabel}`, 14, 18);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('Ujamaa Africa | Empowerment & Transformation Training', 14, 24);
  doc.text(`Generated: ${today}`, pageWidth - 14, 24, { align: 'right' });
  doc.setTextColor(0);

  const completedDistricts = safeTotalDistricts - safeActive;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', 14, 34);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const summary = `The ETT program is currently operating across ${safeActive} of Malawi's districts. A total of ${safeTots.toLocaleString()} TOTs have been trained, covering ${safeSchools.toLocaleString()} schools through ${safeClusters.toLocaleString()} school clusters, reaching ${safeStudents.toLocaleString()} students (${safeBoys.toLocaleString()} boys, ${safeGirls.toLocaleString()} girls) based on submitted reports.`;
  const summaryLines = doc.splitTextToSize(summary, pageWidth - 28);
  doc.text(summaryLines, 14, 40);

  let y = 40 + summaryLines.length * 5 + 6;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Program Metrics', 14, y);
  autoTable(doc, {
    startY: y + 4,
    head: [['Metric', 'Value']],
    body: [
      ['TOTs Trained', safeTots.toLocaleString()],
      ['Schools Covered', safeSchools.toLocaleString()],
      ['School Clusters', safeClusters.toLocaleString()],
      ['Students Reached', safeStudents.toLocaleString()],
      ['Boys Reached', safeBoys.toLocaleString()],
      ['Girls Reached', safeGirls.toLocaleString()],
      ['Active Districts', String(safeActive)],
      ['Completed Districts', String(completedDistricts)],
    ],
    theme: 'grid',
    headStyles: { fillColor: [232, 93, 4] },
    styles: { fontSize: 9 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Regional Breakdown', 14, y);
  autoTable(doc, {
    startY: y + 4,
    head: [['Region', 'Districts', 'TOTs', 'Schools', 'Clusters']],
    body: (regionalData || []).map(r => [r.region ?? '—', String(r.districts ?? 0), String(r.tots ?? 0), String(r.schools ?? 0), String(r.clusters ?? 0)]),
    theme: 'grid',
    headStyles: { fillColor: [232, 93, 4] },
    styles: { fontSize: 9 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;
  if (y > 220) { doc.addPage(); y = 20; }
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTs by Region (chart)', 14, y);
  drawBarChart(
    doc,
    (regionalData || []).map(r => ({ label: r.region ?? '—', value: r.tots ?? 0 })),
    14, y + 4, pageWidth - 28, 45,
    [232, 93, 4]
  );

  y = y + 4 + 45 + 12;
  if (y > 240) { doc.addPage(); y = 20; }
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('District Performance (Top 15)', 14, y);
  autoTable(doc, {
    startY: y + 4,
    head: [['#', 'District', 'Region', 'TOTs', 'Schools', 'Coverage']],
    body: (top15Districts || []).map((d, i) => [
      String(i + 1), d.district ?? '—', d.region ?? '—', String(d.tots ?? 0), String(d.schools ?? 0), `${d.coverage ?? 0}%`,
    ]),
    theme: 'grid',
    headStyles: { fillColor: [232, 93, 4] },
    styles: { fontSize: 8 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;
  if (y > 240) { doc.addPage(); y = 20; }
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('School Clusters', 14, y);
  autoTable(doc, {
    startY: y + 4,
    head: [['Cluster', 'District', 'Students', 'Progress']],
    body: (clusterData || []).map(c => [c.cluster ?? '—', c.district ?? '—', (c.students ?? 0).toLocaleString(), `${c.progress ?? 0}%`]),
    theme: 'grid',
    headStyles: { fillColor: [232, 93, 4] },
    styles: { fontSize: 8 },
  });

  doc.addPage();
  y = 20;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Reports Overview', 14, y);
  y += 6;

  doc.setFontSize(11);
  doc.text('Reports by Status', 14, y);
  autoTable(doc, {
    startY: y + 4,
    head: [['Status', 'Count']],
    body: Object.entries(byStatus || {}).map(([k, v]) => [k, String(v ?? 0)]),
    theme: 'grid',
    headStyles: { fillColor: [24, 95, 165] },
    styles: { fontSize: 9 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.text('Reports by Curriculum', 14, y);
  autoTable(doc, {
    startY: y + 4,
    head: [['Curriculum', 'Count']],
    body: Object.entries(byCurr || {}).map(([k, v]) => [k, String(v ?? 0)]),
    theme: 'grid',
    headStyles: { fillColor: [24, 95, 165] },
    styles: { fontSize: 9 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;
  if (y > 220) { doc.addPage(); y = 20; }
  doc.setFontSize(11);
  doc.text('Reports by District', 14, y);
  const distEntries = Object.entries(byDist || {}).sort((a, b) => (Number(b[1]) || 0) - (Number(a[1]) || 0));
  autoTable(doc, {
    startY: y + 4,
    head: [['District', 'Reports Submitted']],
    body: distEntries.map(([k, v]) => [k, String(v ?? 0)]),
    theme: 'grid',
    headStyles: { fillColor: [24, 95, 165] },
    styles: { fontSize: 8 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;
  if (y > 220) { doc.addPage(); y = 20; }
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Reports by Status (chart)', 14, y);
  drawBarChart(
    doc,
    Object.entries(byStatus || {}).map(([k, v]) => ({ label: k, value: Number(v) || 0 })),
    14, y + 4, pageWidth - 28, 45,
    [24, 95, 165]
  );

  doc.addPage();
  y = 20;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Monitoring Overview', 14, y);
  y += 6;

  const safeActivities = monActivities || [];
  const safeIssues = monIssues || [];

  doc.setFontSize(11);
  doc.text(`District Monitoring Activity (${safeActivities.length} entries)`, 14, y);
  autoTable(doc, {
    startY: y + 4,
    head: [['District', 'Month', 'Teachbacks', 'PEA Monitoring', 'Cluster Meetings', 'Issue-Based', 'Routine', 'Submitted By']],
    body: safeActivities.slice(0, 20).map((a: any) => [
      a?.district ?? '—',
      a?.month ?? '—',
      String(a?.teachbacks ?? 0),
      String(a?.pea_monitoring ?? 0),
      String(a?.cluster_meetings ?? 0),
      String(a?.issue_based ?? 0),
      String(a?.routine ?? 0),
      a?.submitted_by_name ?? '—',
    ]),
    theme: 'grid',
    headStyles: { fillColor: [5, 150, 105] },
    styles: { fontSize: 7 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;
  if (y > 220) { doc.addPage(); y = 20; }
  doc.setFontSize(11);
  doc.text(`District Issues Reported (${safeIssues.length} entries)`, 14, y);
  autoTable(doc, {
    startY: y + 4,
    head: [['District', 'Month', 'Teacher Transfers', 'Lack of Interest', 'Other Issues', 'Lack of Admin Support', 'Learner Behaviour', 'Submitted By']],
    body: safeIssues.slice(0, 20).map((i: any) => [
      i?.district ?? '—',
      i?.month ?? '—',
      String(i?.teacher_transfers ?? 0),
      String(i?.lack_of_interest ?? 0),
      String(i?.other_issues ?? 0),
      String(i?.lack_of_admin_support ?? 0),
      String(i?.learner_behaviour ?? 0),
      i?.submitted_by_name ?? '—',
    ]),
    theme: 'grid',
    headStyles: { fillColor: [220, 38, 38] },
    styles: { fontSize: 7 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;
  if (y > 220) { doc.addPage(); y = 20; }
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Sira (SASA) — Regional Performance & Case Data', 14, y);
  y += 6;
  const safeRegionalPerf = regionalPerformance || [];
  const safeCasesByDistrict = casesByDistrict || [];
  doc.setFontSize(11);
  doc.text(`Regional Performance (${safeRegionalPerf.length} regions)`, 14, y);
  autoTable(doc, {
    startY: y + 4,
    head: [['Region', 'Sessions Monitored', 'Avg Score', 'Officers Tracked', 'Consistency %']],
    body: safeRegionalPerf.map((r: any) => [
      r?.region ?? '—',
      String(r?.sessionsMonitored ?? 0),
      String(r?.avgScore ?? 0),
      String(r?.officersTracked ?? 0),
      r?.consistencyPct !== null && r?.consistencyPct !== undefined ? `${r.consistencyPct}%` : '—',
    ]),
    theme: 'grid',
    headStyles: { fillColor: [232, 93, 4] },
    styles: { fontSize: 7 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;
  if (y > 220) { doc.addPage(); y = 20; }
  doc.setFontSize(11);
  doc.text(`Cases Identified by District (${safeCasesByDistrict.length} districts)`, 14, y);
  autoTable(doc, {
    startY: y + 4,
    head: [['District', 'Cases Identified']],
    body: safeCasesByDistrict.map((c: any) => [c?.district ?? '—', String(c?.count ?? 0)]),
    theme: 'grid',
    headStyles: { fillColor: [124, 58, 237] },
    styles: { fontSize: 7 },
  });

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Ujamaa Africa | ETT Malawi Program`, 14, doc.internal.pageSize.getHeight() - 10);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
  }

  doc.save(`Program_Analysis_Report_${countryLabel.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
};

// ─── ANALYTICS PAGE ──────────────────────────
interface AnalyticsPageProps { reports: Report[]; }

  export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ reports }) => {
  console.log('AnalyticsPage received reports:', reports);
  const [activeRegion, setActiveRegion] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'districts' | 'clusters' | 'reports' | 'monitoring' | 'sira'>('overview');
  const [analytics, setAnalytics] = useState<any>({
    reportsByDistrict: [],
    reportsByStatus: [],
    reportsByCurriculum: [],
    reportsByMonth: [],
    learnersByDistrict: [],
    topSchools: [],
  });
  const [districts, setDistricts] = useState<any[]>([]);
  const [clusters, setClusters] = useState<any[]>([]);
  const [clusterDistrictFilter, setClusterDistrictFilter] = useState<string>('all');
  const { activeCountry } = useCountry();
  useEffect(() => {
    analyticsApi.get().then(data => {
      if (!data.error) setAnalytics(data);
    });
    districtsApi.getAll(activeCountry).then(setDistricts);
    mapClustersApi.getAll({ country: activeCountry }).then(setClusters);
  }, [activeCountry]);

  const REGIONAL_DATA = buildRegionalData(districts);
  const TOP15_DISTRICTS = buildTop15Districts(districts);
  const CLUSTER_DATA = buildClusterData(clusters);
  const CLUSTER_DISTRICTS = Array.from(new Set(clusters.map((c: any) => c.district).filter(Boolean))).sort();
  const FILTERED_CLUSTER_DATA = clusterDistrictFilter === 'all'
    ? CLUSTER_DATA
    : CLUSTER_DATA.filter(c => c.district === clusterDistrictFilter);
  // District-level rollup, shown when no specific district is picked -- keeps
  // the chart readable no matter how many clusters exist system-wide.
  const CLUSTER_BY_DISTRICT = Object.values(
    CLUSTER_DATA.reduce((acc: any, c: any) => {
      const key = c.district || 'Unassigned';
      if (!acc[key]) acc[key] = { district: key, clusters: 0, students: 0, progressSum: 0 };
      acc[key].clusters += 1;
      acc[key].students += c.students;
      acc[key].progressSum += c.progress;
      return acc;
    }, {})
  ).map((d: any) => ({ ...d, avgProgress: d.clusters ? Math.round(d.progressSum / d.clusters) : 0 }));

  // Use monitoring context for real-time data sync
  const { activities: monActivities, issues: monIssues } = useMonitoring();

  // Compute from live reports
  const byStatus = { approved: 0, pending: 0, rejected: 0, forwarded: 0 };
  const byCurr = { HIM: 0, GESD: 0, Combined: 0 };
  const byDist: Record<string, number> = {};
  let boys = 0, girls = 0;

  reports.forEach(r => {
    (byStatus as any)[r.status] = ((byStatus as any)[r.status] || 0) + 1;
    (byCurr as any)[r.curriculum] = ((byCurr as any)[r.curriculum] || 0) + 1;
    byDist[r.district] = (byDist[r.district] || 0) + 1;
    boys += r.boys; girls += r.girls;
  });

  const statusPieData = analytics.reportsByStatus.map((r: any) => ({ name: r.status, value: parseInt(r.count) }));
  const currPieData = analytics.reportsByCurriculum.map((r: any) => ({ name: r.curriculum, value: parseInt(r.count) }));
  const distBarData = analytics.reportsByDistrict.map((r: any) => ({ district: r.district, reports: parseInt(r.count) }));

  const totalTots = districts.reduce((a, d) => a + (Number(d.tots) || 0), 0);
  const totalSchools = districts.reduce((a, d) => a + (Number(d.schools) || 0), 0);
  const totalStudents = clusters.reduce((a, c) => a + (Number(c.students) || 0), 0);
  const activeDistricts = districts.filter(d => d.status === 'Active').length;
  const plannedDistricts = districts.filter(d => d.status === 'Planned').length;

  const filteredDistricts = activeRegion === 'all'
    ? TOP15_DISTRICTS
    : TOP15_DISTRICTS.filter(d => d.region === activeRegion);

  const [regionalPerformance, setRegionalPerformance] = useState<any[]>([]);
  const [casesByDistrict, setCasesByDistrict] = useState<any[]>([]);

  useEffect(() => {
    sessionMonitoringApi.getRegionalPerformance(activeCountry).then(setRegionalPerformance).catch(() => {});
    gbvCasesApi.getCasesByDistrict(activeCountry).then(setCasesByDistrict).catch(() => {});
  }, [activeCountry]);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'districts', label: 'Districts' },
    { id: 'clusters', label: 'Clusters' },
    { id: 'reports', label: 'Reports' },
    { id: 'monitoring', label: 'Monitoring' },
    { id: 'sira', label: 'Sira (SASA)' },
  ] as const;

  return (
    <div className="space-y-5 animate-fade-in-up">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <Kicker text="Statistical Ledger" />
          <h1 className="text-base font-bold text-black dark:text-white m-0">Interactive Analytics</h1>
          <p className="text-xs text-slate-400 mt-0.5">ETT Malawi impact data — {districts.length} districts · {totalTots.toLocaleString()} TOTs · {totalStudents.toLocaleString()} students</p>
        </div>
        <button
          onClick={() => downloadReport(
  REGIONAL_DATA || [], TOP15_DISTRICTS || [], CLUSTER_DATA || [],
  totalTots || 0, totalSchools || 0, totalStudents || 0, activeDistricts || 0, (districts || []).length,
  byStatus || {}, byCurr || {}, byDist || {}, boys || 0, girls || 0,
  monActivities || [], monIssues || [], activeCountry,
  regionalPerformance || [], casesByDistrict || []
)}
          className="flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg border border-neutral-200 dark:border-slate-700 text-black dark:text-white hover:border-[var(--brand)] hover:text-[var(--brand)] transition shrink-0"
        >
          <Download size={13} /> Download Report {activeCountry && activeCountry !== 'all' ? `(${activeCountry})` : '(All Countries)'}
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: <GraduationCap size={18} className="text-[var(--brand-500)]" />, label: 'TOTs Trained', value: totalTots.toLocaleString(), sub: `${districts.length} districts tracked` },
          { icon: <School size={18} className="text-blue-500" />, label: 'Schools Covered', value: totalSchools.toLocaleString(), sub: `${clusters.length} clusters` },
          { icon: <Users size={18} className="text-emerald-500" />, label: 'Students Reached', value: totalStudents.toLocaleString(), sub: `${boys + girls} from reports` },
          { icon: <MapPin size={18} className="text-purple-500" />, label: 'Active Districts', value: String(activeDistricts), sub: `${plannedDistricts} planned` },
        ].map((s, i) => (
          <Card key={i} className="p-3">
            <div className="flex items-center gap-2 mb-1">{s.icon}<span className="text-[10px] text-black dark:text-white opacity-70 font-medium">{s.label}</span></div>
            <div className="text-lg font-bold text-black dark:text-white">{s.value}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{s.sub}</div>
          </Card>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="overflow-x-auto pb-1 -mb-1">
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg w-max min-w-full border border-neutral-200 dark:border-slate-800">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-white dark:bg-[#0f1623] text-black dark:text-white shadow-sm border border-neutral-200 dark:border-slate-700'
                  : 'text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div className="space-y-5">

          {/* Regional bar chart */}
          <Card className="p-4">
            <h4 className="text-xs font-bold text-black dark:text-white mb-4">TOTs by Region</h4>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={REGIONAL_DATA} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="region" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="tots" name="TOTs Trained" radius={[4, 4, 0, 0]}>
                  {REGIONAL_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
                <Bar dataKey="schools" name="Schools" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Regional pie */}
            <Card className="p-4">
              <h4 className="text-xs font-bold text-black dark:text-white mb-4">TOT Distribution by Region</h4>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={REGIONAL_DATA}
                    dataKey="tots"
                    nameKey="region"
                    cx="50%" cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    label={({ region, percent }) => `${region} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {REGIONAL_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {REGIONAL_DATA.map(d => (
                  <div key={d.region} className="flex items-center gap-1.5 text-[11px]">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-black dark:text-white opacity-70">{d.region}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Cluster progress radial */}
            <Card className="p-4">
              <h4 className="text-xs font-bold text-black dark:text-white mb-4">Cluster Progress Overview</h4>
              <ResponsiveContainer width="100%" height={220}>
                <RadialBarChart
                  innerRadius="20%"
                  outerRadius="90%"
                  data={CLUSTER_DATA.slice(0, 5).map(c => ({ ...c, fill: OR }))}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar dataKey="progress" background={{ fill: '#f1f5f9' }} cornerRadius={4} label={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconSize={8}
                    formatter={(value, entry: any) => (
                      <span className="text-[10px] text-black dark:text-white opacity-70">{entry.payload.cluster}</span>
                    )}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>
      )}

      {/* ── DISTRICTS TAB ── */}
      {activeTab === 'districts' && (
        <div className="space-y-4">
          <div className="flex gap-1 flex-wrap">
            {['all', ...Array.from(new Set(districts.map((d: any) => d.region).filter(Boolean))).sort()].map(r => (
              <button
                key={r}
                onClick={() => setActiveRegion(r)}
                className={`px-3 py-1 text-[11px] font-bold rounded-full border transition ${
                  activeRegion === r
                    ? 'border-[var(--brand)] text-[var(--brand)] bg-[var(--brand-50)] dark:bg-[var(--brand-950)]/20'
                    : 'border-neutral-200 dark:border-slate-700 text-slate-500 hover:border-[var(--brand)]'
                }`}
              >
                {r === 'all' ? 'All Regions' : r}
              </button>
            ))}
          </div>

          {/* TOTs per district bar */}
          <Card className="p-4">
            <h4 className="text-xs font-bold text-black dark:text-white mb-4">TOTs Trained — Top 15 Districts</h4>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={filteredDistricts} layout="vertical" barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="district" type="category" tick={{ fontSize: 10 }} width={72} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="tots" name="TOTs" radius={[0, 4, 4, 0]}>
                  {filteredDistricts.map((d, i) => (
                    <Cell key={i} fill={COLORS[d.region as keyof typeof COLORS] || OR} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Coverage line chart */}
          <Card className="p-4">
            <h4 className="text-xs font-bold text-black dark:text-white mb-4">School Coverage % by District</h4>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={filteredDistricts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="district" tick={{ fontSize: 9 }} angle={-35} textAnchor="end" height={55} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="coverage"
                  name="coverage %"
                  stroke={OR}
                  strokeWidth={2.5}
                  dot={{ fill: OR, r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* ── CLUSTERS TAB ── */}
      {activeTab === 'clusters' && (
        <div className="space-y-4">
          {/* District filter -- keeps this tab readable no matter how many clusters exist */}
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-slate-400" />
            <select
              value={clusterDistrictFilter}
              onChange={(e) => setClusterDistrictFilter(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-black dark:text-white"
            >
              <option value="all">All Districts ({CLUSTER_BY_DISTRICT.length} districts, {CLUSTER_DATA.length} clusters)</option>
              {CLUSTER_DISTRICTS.map((d: any) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {clusterDistrictFilter === 'all' ? (
            <>
              <Card className="p-4">
                <h4 className="text-xs font-bold text-black dark:text-white mb-4">Clusters & Students by District</h4>
                <ResponsiveContainer width="100%" height={Math.max(260, CLUSTER_BY_DISTRICT.length * 28)}>
                  <BarChart data={CLUSTER_BY_DISTRICT} layout="vertical" barCategoryGap="25%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="district" type="category" tick={{ fontSize: 10 }} width={120} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="clusters" name="Clusters" fill="#185fa5" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="students" name="Students" fill={OR} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              <Card className="p-4">
                <h4 className="text-xs font-bold text-black dark:text-white mb-4">Average Cluster Progress, by District</h4>
                <div className="space-y-3">
                  {CLUSTER_BY_DISTRICT.sort((a: any, b: any) => b.avgProgress - a.avgProgress).map((d: any) => (
                    <div key={d.district}>
                      <div className="flex justify-between text-[11px] mb-1">
                        <button
                          type="button"
                          onClick={() => setClusterDistrictFilter(d.district)}
                          className="font-medium text-black dark:text-white hover:text-[var(--brand-600)] hover:underline text-left"
                        >
                          {d.district} <span className="text-slate-400 font-normal">({d.clusters} clusters)</span>
                        </button>
                        <span className="text-slate-400 font-bold">{d.avgProgress}%</span>
                      </div>
                      <ProgBar pct={d.avgProgress} color={d.avgProgress >= 80 ? '#059669' : d.avgProgress >= 60 ? OR : '#f59e0b'} />
                    </div>
                  ))}
                </div>
              </Card>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Card className="p-4">
                  <h4 className="text-xs font-bold text-black dark:text-white mb-4">Students Reached per Cluster — {clusterDistrictFilter}</h4>
                  <ResponsiveContainer width="100%" height={Math.max(260, FILTERED_CLUSTER_DATA.length * 28)}>
                    <BarChart data={FILTERED_CLUSTER_DATA} layout="vertical" barCategoryGap="20%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="cluster" type="category" tick={{ fontSize: 9 }} width={120} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="students" name="Students" fill={OR} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
                <Card className="p-4">
                  <h4 className="text-xs font-bold text-black dark:text-white mb-4">Cluster Progress Distribution — {clusterDistrictFilter}</h4>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={FILTERED_CLUSTER_DATA}
                        dataKey="progress"
                        nameKey="cluster"
                        cx="50%" cy="50%"
                        outerRadius={95}
                        paddingAngle={2}
                      >
                        {FILTERED_CLUSTER_DATA.map((_, i) => (
                          <Cell key={i} fill={['var(--brand)','#185fa5','#059669','#7c3aed','#f59e0b','#0891b2','#dc2626','#64748b'][i % 8]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </div>
              <Card className="p-4">
                <h4 className="text-xs font-bold text-black dark:text-white mb-4">Cluster Completion Progress — {clusterDistrictFilter}</h4>
                <div className="space-y-3">
                  {FILTERED_CLUSTER_DATA.sort((a, b) => b.progress - a.progress).map(c => (
                    <div key={c.cluster}>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="font-medium text-black dark:text-white">{c.cluster}</span>
                        <span className="text-slate-400 font-bold">{c.progress}%</span>
                      </div>
                      <ProgBar pct={c.progress} color={c.progress >= 80 ? '#059669' : c.progress >=60 ? OR : '#f59e0b'} />
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>
      )}

      {/* ── REPORTS TAB ── */}
      {activeTab === 'reports' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Status pie */}
            <Card className="p-4">
              <h4 className="text-xs font-bold text-black dark:text-white mb-4">Report Status Distribution</h4>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%" cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    label={({ name, percent }) => percent > 0 ? `${name} ${(percent*100).toFixed(0)}%` : ''}
                    labelLine={false}
                  >
                    {statusPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {statusPieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-[11px]">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                    <span className="text-black dark:text-white opacity-70 capitalize">{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Curriculum pie */}
            <Card className="p-4">
              <h4 className="text-xs font-bold text-black dark:text-white mb-4">Curriculum Usage</h4>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={currPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%" cy="50%"
                    outerRadius={80}
                    paddingAngle={4}
                    label={({ name, percent }) => percent > 0 ? `${name} ${(percent*100).toFixed(0)}%` : ''}
                    labelLine={false}
                  >
                    {currPieData.map((_, i) => <Cell key={i} fill={['#185fa5','#a82563','var(--brand)'][i]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {currPieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-[11px]">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#185fa5','#a82563','var(--brand)'][i] }} />
                    <span className="text-black dark:text-white opacity-70">{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Reports by district bar */}
          {distBarData.length > 0 && (
            <Card className="p-4">
              <h4 className="text-xs font-bold text-black dark:text-white mb-4">Report Submissions by District</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={distBarData} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="district" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="reports" name="Reports" fill={OR} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Gender split */}
          <Card className="p-4">
            <h4 className="text-xs font-bold text-black dark:text-white mb-4">Gender Breakdown</h4>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={[{ label: 'Learners', Boys: boys, Girls: girls }]} barCategoryGap="50%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Boys" fill="#185fa5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Girls" fill="#a82563" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* ── MONITORING TAB ── */}
      {activeTab === 'sira' && (
        <div className="space-y-5">
          <RegionalPerformanceCharts />
          <CasesByDistrictChart />
        </div>
      )}

      {activeTab === 'monitoring' && (
        <div className="space-y-5">
          {/* Activity totals by month stacked bar */}
          <Card className="p-4">
            <h4 className="text-xs font-bold text-black dark:text-white mb-1">Monitoring Activities by Month</h4>
            <p className="text-[10px] text-slate-400 mb-4">TB = Teachbacks · PEA = PEA Monitoring · CM = Cluster Meetings · IB = Issue Based · RT = Routine</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={(() => {
                const byMonth: Record<string, any> = {};
                monActivities.forEach(r => {
                  if (!byMonth[r.month]) byMonth[r.month] = { month: r.month, teachbacks: 0, pea_monitoring: 0, cluster_meetings: 0, issue_based: 0, routine: 0 };
                  byMonth[r.month].teachbacks      += r.teachbacks || 0;
                  byMonth[r.month].pea_monitoring  += r.pea_monitoring || 0;
                  byMonth[r.month].cluster_meetings+= r.cluster_meetings || 0;
                  byMonth[r.month].issue_based     += r.issue_based || 0;
                  byMonth[r.month].routine         += r.routine || 0;
                });
                return Object.values(byMonth);
              })()} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="teachbacks"       name="Teachbacks"        stackId="a" fill="var(--brand)" radius={[0,0,0,0]} />
                <Bar dataKey="pea_monitoring"   name="PEA Monitoring"    stackId="a" fill="#185fa5" />
                <Bar dataKey="cluster_meetings" name="Cluster Meetings"  stackId="a" fill="#059669" />
                <Bar dataKey="issue_based"      name="Issue Based"       stackId="a" fill="#7c3aed" />
                <Bar dataKey="routine"          name="Routine"           stackId="a" fill="#d97706" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Activities pie — total share */}
            <Card className="p-4">
              <h4 className="text-xs font-bold text-black dark:text-white mb-4">Activity Type Distribution</h4>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Teachbacks',      value: monActivities.reduce((a,r) => a + (r.teachbacks||0), 0),       fill: 'var(--brand)' },
                      { name: 'PEA Monitoring',  value: monActivities.reduce((a,r) => a + (r.pea_monitoring||0), 0),   fill: '#185fa5' },
                      { name: 'Cluster Meetings',value: monActivities.reduce((a,r) => a + (r.cluster_meetings||0), 0), fill: '#059669' },
                      { name: 'Issue Based',     value: monActivities.reduce((a,r) => a + (r.issue_based||0), 0),      fill: '#7c3aed' },
                      { name: 'Routine',         value: monActivities.reduce((a,r) => a + (r.routine||0), 0),          fill: '#d97706' },
                    ]}
                    dataKey="value" nameKey="name" cx="50%" cy="50%"
                    innerRadius={55} outerRadius={85} paddingAngle={3}
                    label={({ name, percent }) => `${(percent*100).toFixed(0)}%`} labelLine={false}
                  >
                    {[0,1,2,3,4].map(i => (
                      <Cell key={i} fill={['var(--brand)','#185fa5','#059669','#7c3aed','#d97706'][i]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Issues pie */}
            <Card className="p-4">
              <h4 className="text-xs font-bold text-black dark:text-white mb-4">Prevailing Issues Distribution</h4>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Teacher Transfers',    value: monIssues.reduce((a,r) => a + (r.teacher_transfers||0), 0),     fill: '#dc2626' },
                      { name: 'Lack of Interest',     value: monIssues.reduce((a,r) => a + (r.lack_of_interest||0), 0),      fill: '#f59e0b' },
                      { name: 'Other Issues',         value: monIssues.reduce((a,r) => a + (r.other_issues||0), 0),          fill: '#6b7280' },
                      { name: 'Lack of Admin Support',value: monIssues.reduce((a,r) => a + (r.lack_of_admin_support||0), 0), fill: '#7c3aed' },
                      { name: 'Learner Behaviour',    value: monIssues.reduce((a,r) => a + (r.learner_behaviour||0), 0),     fill: '#0891b2' },
                    ]}
                    dataKey="value" nameKey="name" cx="50%" cy="50%"
                    outerRadius={85} paddingAngle={3}
                    label={({ name, percent }) => `${(percent*100).toFixed(0)}%`} labelLine={false}
                  >
                    {[0,1,2,3,4].map(i => (
                      <Cell key={i} fill={['#dc2626','#f59e0b','#6b7280','#7c3aed','#0891b2'][i]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Issues trend by month */}
          <Card className="p-4">
            <h4 className="text-xs font-bold text-black dark:text-white mb-4">Prevailing Issues Trend by Month</h4>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={(() => {
                const byMonth: Record<string, any> = {};
                monIssues.forEach(r => {
                  if (!byMonth[r.month]) byMonth[r.month] = { month: r.month, teacher_transfers: 0, lack_of_interest: 0, other_issues: 0, lack_of_admin_support: 0, learner_behaviour: 0 };
                  byMonth[r.month].teacher_transfers     += r.teacher_transfers || 0;
                  byMonth[r.month].lack_of_interest      += r.lack_of_interest || 0;
                  byMonth[r.month].other_issues          += r.other_issues || 0;
                  byMonth[r.month].lack_of_admin_support += r.lack_of_admin_support || 0;
                  byMonth[r.month].learner_behaviour     += r.learner_behaviour || 0;
                });
                return Object.values(byMonth);
              })()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="teacher_transfers"     name="Teacher Transfers"     stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="lack_of_interest"      name="Lack of Interest"      stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="other_issues"          name="Other Issues"          stroke="#6b7280" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="lack_of_admin_support" name="Admin Support"         stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="learner_behaviour"     name="Learner Behaviour"     stroke="#0891b2" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Activities by district horizontal bar */}
          <Card className="p-4">
            <h4 className="text-xs font-bold text-black dark:text-white mb-4">Total Monitoring Activities by District</h4>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart layout="vertical" barCategoryGap="20%"
                data={(() => {
                  const byDist: Record<string, any> = {};
                  monActivities.forEach(r => {
                    if (!byDist[r.district]) byDist[r.district] = { district: r.district, total: 0 };
                    byDist[r.district].total += (r.teachbacks||0) + (r.pea_monitoring||0) + (r.cluster_meetings||0) + (r.issue_based||0) + (r.routine||0);
                  });
                  return Object.values(byDist).sort((a: any, b: any) => b.total - a.total);
                })()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="district" type="category" tick={{ fontSize: 10 }} width={80} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" name="Total Activities" fill="var(--brand)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}
    </div>
  );
};
