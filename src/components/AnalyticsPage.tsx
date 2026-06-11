import { analyticsApi } from '../api';
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
import { Report } from '../types';
import { Card, Kicker, StatCard, ProgBar } from './SubComponents';

// ─── PDF IMPACT REPORT DATA ──────────────────
const REGIONAL_DATA = [
  { region: 'Northern', districts: 6, tots: 249, schools: 83, clusters: 28, color: '#185fa5' },
  { region: 'Central',  districts: 9, tots: 384, schools: 128, clusters: 44, color: '#e85d04' },
  { region: 'Southern', districts: 13, tots: 501, schools: 167, clusters: 55, color: '#059669' },
];

const TOP15_DISTRICTS = [
  { district: 'Lilongwe',  tots: 105, schools: 35, coverage: 29, region: 'Central' },
  { district: 'Blantyre',  tots: 84,  schools: 28, coverage: 27, region: 'Southern' },
  { district: 'Mzimba',    tots: 72,  schools: 24, coverage: 25, region: 'Northern' },
  { district: 'Mangochi',  tots: 66,  schools: 22, coverage: 24, region: 'Southern' },
  { district: 'Kasungu',   tots: 60,  schools: 20, coverage: 24, region: 'Central' },
  { district: 'Karonga',   tots: 54,  schools: 18, coverage: 29, region: 'Northern' },
  { district: 'Zomba',     tots: 54,  schools: 18, coverage: 25, region: 'Southern' },
  { district: 'Thyolo',    tots: 48,  schools: 16, coverage: 24, region: 'Southern' },
  { district: 'Rumphi',    tots: 45,  schools: 15, coverage: 31, region: 'Northern' },
  { district: 'Dowa',      tots: 45,  schools: 15, coverage: 21, region: 'Central' },
  { district: 'Dedza',     tots: 42,  schools: 14, coverage: 21, region: 'Central' },
  { district: 'Mulanje',   tots: 42,  schools: 14, coverage: 22, region: 'Southern' },
  { district: 'Chitipa',   tots: 36,  schools: 12, coverage: 27, region: 'Northern' },
  { district: 'Ntcheu',    tots: 36,  schools: 12, coverage: 21, region: 'Central' },
  { district: 'Machinga',  tots: 36,  schools: 12, coverage: 18, region: 'Southern' },
];

const CLUSTER_DATA = [
  { cluster: 'Karonga Lakeshore', district: 'Karonga',  students: 720,  progress: 90 },
  { cluster: 'Blantyre South',    district: 'Blantyre', students: 890,  progress: 85 },
  { cluster: 'Lilongwe Central',  district: 'Lilongwe', students: 1240, progress: 78 },
  { cluster: 'Zomba Urban',       district: 'Zomba',    students: 1380, progress: 72 },
  { cluster: 'Mzimba Heritage',   district: 'Mzimba',   students: 1050, progress: 62 },
  { cluster: 'Dowa Central',      district: 'Dowa',     students: 1100, progress: 68 },
  { cluster: 'Mangochi Stars',    district: 'Mangochi', students: 680,  progress: 55 },
  { cluster: 'Dedza Highland',    district: 'Dedza',    students: 560,  progress: 45 },
];

const OR = '#e85d04';
const COLORS = { Northern: '#185fa5', Central: '#e85d04', Southern: '#059669' };
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
const downloadReport = (reports: Report[], boys: number, girls: number) => {
  const base = import.meta.env.BASE_URL || '/';
  const link = document.createElement('a');
  link.href = `${base}ETT_Malawi_Impact_Report.pdf`;
  link.download = 'ETT_Malawi_Impact_Report.pdf';
  link.click();
};

// ─── ANALYTICS PAGE ──────────────────────────
interface AnalyticsPageProps { reports: Report[]; }

  export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ reports }) => {
  const [activeRegion, setActiveRegion] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'districts' | 'clusters' | 'reports' | 'monitoring'>('overview');
  const [analytics, setAnalytics] = useState<any>({
    reportsByDistrict: [],
    reportsByStatus: [],
    reportsByCurriculum: [],
    reportsByMonth: [],
    learnersByDistrict: [],
    topSchools: [],
  });

  useEffect(() => {
    analyticsApi.get().then(data => {
      if (!data.error) setAnalytics(data);
    });
  }, []);

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

  const filteredDistricts = activeRegion === 'all'
    ? TOP15_DISTRICTS
    : TOP15_DISTRICTS.filter(d => d.region === activeRegion);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'districts', label: 'Districts' },
    { id: 'clusters', label: 'Clusters' },
    { id: 'reports', label: 'Reports' },
    { id: 'monitoring', label: 'Monitoring' },
  ] as const;

  return (
    <div className="space-y-5 animate-fade-in-up">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <Kicker text="Statistical Ledger" />
          <h1 className="text-base font-bold text-black dark:text-white m-0">Interactive Analytics</h1>
          <p className="text-xs text-slate-400 mt-0.5">ETT Malawi impact data — 22 districts · 1,134 TOTs · 7,620 students</p>
        </div>
        <button
          onClick={() => downloadReport(reports, boys, girls)}
          className="flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg border border-neutral-200 dark:border-slate-700 text-black dark:text-white hover:border-[#e85d04] hover:text-[#e85d04] transition shrink-0"
        >
          <Download size={13} /> Download Impact Report
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: <GraduationCap size={18} className="text-orange-500" />, label: 'TOTs Trained', value: '1,134', sub: '+12% this quarter' },
          { icon: <School size={18} className="text-blue-500" />, label: 'Schools Covered', value: '378', sub: '127 clusters' },
          { icon: <Users size={18} className="text-emerald-500" />, label: 'Students Reached', value: '7,620', sub: `${boys + girls} from reports` },
          { icon: <MapPin size={18} className="text-purple-500" />, label: 'Active Districts', value: '22', sub: '3 completed' },
        ].map((s, i) => (
          <Card key={i} className="p-3">
            <div className="flex items-center gap-2 mb-1">{s.icon}<span className="text-[10px] text-black dark:text-white opacity-70 font-medium">{s.label}</span></div>
            <div className="text-lg font-bold text-black dark:text-white">{s.value}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{s.sub}</div>
          </Card>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg w-fit border border-neutral-200 dark:border-slate-800">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === t.id
                ? 'bg-white dark:bg-[#0f1623] text-black dark:text-white shadow-sm border border-neutral-200 dark:border-slate-700'
                : 'text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
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
            {['all', 'Northern', 'Central', 'Southern'].map(r => (
              <button
                key={r}
                onClick={() => setActiveRegion(r)}
                className={`px-3 py-1 text-[11px] font-bold rounded-full border transition ${
                  activeRegion === r
                    ? 'border-[#e85d04] text-[#e85d04] bg-orange-50 dark:bg-orange-950/20'
                    : 'border-neutral-200 dark:border-slate-700 text-slate-500 hover:border-[#e85d04]'
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Students bar */}
            <Card className="p-4">
              <h4 className="text-xs font-bold text-black dark:text-white mb-4">Students Reached per Cluster</h4>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={CLUSTER_DATA} layout="vertical" barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="cluster" type="category" tick={{ fontSize: 9 }} width={120} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="students" name="Students" fill={OR} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Progress pie */}
            <Card className="p-4">
              <h4 className="text-xs font-bold text-black dark:text-white mb-4">Cluster Progress Distribution</h4>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={CLUSTER_DATA}
                    dataKey="progress"
                    nameKey="cluster"
                    cx="50%" cy="50%"
                    outerRadius={95}
                    paddingAngle={2}
                  >
                    {CLUSTER_DATA.map((_, i) => (
                      <Cell key={i} fill={['#e85d04','#185fa5','#059669','#7c3aed','#f59e0b','#0891b2','#dc2626','#64748b'][i]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Progress bars */}
          <Card className="p-4">
            <h4 className="text-xs font-bold text-black dark:text-white mb-4">Cluster Completion Progress</h4>
            <div className="space-y-3">
              {CLUSTER_DATA.sort((a, b) => b.progress - a.progress).map(c => (
                <div key={c.cluster}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-medium text-black dark:text-white">{c.cluster}</span>
                    <span className="text-slate-400 font-bold">{c.progress}%</span>
                  </div>
                  <ProgBar pct={c.progress} color={c.progress >= 80 ? '#059669' : c.progress >= 60 ? OR : '#f59e0b'} />
                </div>
              ))}
            </div>
          </Card>
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
                    {currPieData.map((_, i) => <Cell key={i} fill={['#185fa5','#a82563','#e85d04'][i]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {currPieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-[11px]">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#185fa5','#a82563','#e85d04'][i] }} />
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
                <Bar dataKey="teachbacks"       name="Teachbacks"        stackId="a" fill="#e85d04" radius={[0,0,0,0]} />
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
                      { name: 'Teachbacks',      value: monActivities.reduce((a,r) => a + (r.teachbacks||0), 0),       fill: '#e85d04' },
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
                      <Cell key={i} fill={['#e85d04','#185fa5','#059669','#7c3aed','#d97706'][i]} />
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
                <Bar dataKey="total" name="Total Activities" fill="#e85d04" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}
    </div>
  );
};
