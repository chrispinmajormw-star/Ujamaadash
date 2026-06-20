import React, { useState } from 'react';
import {
  TrendingUp, Users, MapPin, BarChart2, CheckCircle, Clock,
  AlertTriangle, Download, Target, Award, ArrowUpRight, ArrowDownRight,
  Globe, BookOpen, Zap, FileText
} from 'lucide-react';
import { Card, Kicker, Btn, StatCard, ProgBar, FilterBar, Badge } from './SubComponents';
import { DISTRICTS, CLUSTERS } from '../data';
import { Report } from '../types';

interface Props {
  reports: Report[];
  user: any;
  setPage: (p: string) => void;
}

const KPICard: React.FC<{
  label: string;
  value: string | number;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendVal?: string;
  color?: string;
  icon: React.ReactNode;
}> = ({ label, value, sub, trend, trendVal, color = '#e85d04', icon }) => (
  <div className="bg-white dark:bg-[#0f1623] rounded-xl border border-neutral-200 dark:border-slate-800 p-4 flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: color + '18' }}>
        <span style={{ color }}>{icon}</span>
      </div>
      {trend && trendVal && (
        <span className={`flex items-center gap-1 text-[11px] font-bold ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-slate-400'}`}>
          {trend === 'up' ? <ArrowUpRight size={12} /> : trend === 'down' ? <ArrowDownRight size={12} /> : null}
          {trendVal}
        </span>
      )}
    </div>
    <div>
      <div className="text-2xl font-extrabold text-black dark:text-white">{value}</div>
      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{label}</div>
      {sub && <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>}
    </div>
  </div>
);

export const ProgramManagerPage: React.FC<Props> = ({ reports, user, setPage }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'districts' | 'pipeline'>('overview');

  const approved = reports.filter(r => r.status === 'approved').length;
  const pending = reports.filter(r => r.status === 'pending').length;
  const totalStudents = CLUSTERS.reduce((a, c) => a + c.students, 0);
  const activeDistricts = DISTRICTS.filter(d => d.s === 'Active').length;
  const totalTOTs = DISTRICTS.reduce((a, d) => a + d.tots, 0);
  const totalTeachers = DISTRICTS.reduce((a, d) => a + d.teachersTrained, 0);
  const totalSchools = DISTRICTS.reduce((a, d) => a + d.schools, 0);
  const coveredSchools = DISTRICTS.reduce((a, d) => a + d.cov, 0);
  const coveragePct = Math.round((coveredSchools / totalSchools) * 100);

  const districtPerf = DISTRICTS.filter(d => d.s === 'Active').map(d => ({
    ...d,
    pct: d.schools > 0 ? Math.round((d.cov / d.schools) * 100) : 0,
    rptCount: reports.filter(r => r.district === d.name).length,
  })).sort((a, b) => b.pct - a.pct);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <Kicker text="Program Management Office" />
          <h1 className="text-lg font-bold text-black dark:text-white m-0">Strategic Overview</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 m-0">
            Welcome back, <span className="font-semibold text-orange-600">{user?.name}</span> — here's your national program pulse.
          </p>
        </div>
        <div className="flex gap-2">
          <Btn variant="secondary" onClick={() => setPage('analytics')}>
            <BarChart2 size={13} className="inline mr-1" /> Full Analytics
          </Btn>
          <Btn onClick={() => setPage('reports')}>
            <FileText size={13} className="inline mr-1" /> All Reports
          </Btn>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label="Active Districts" value={activeDistricts} sub="of 28 total" trend="up" trendVal="+2 this Q" icon={<MapPin size={18} />} color="#e85d04" />
        <KPICard label="Students Reached" value={totalStudents.toLocaleString()} sub="across all clusters" trend="up" trendVal="+12%" icon={<Users size={18} />} color="#0e7490" />
        <KPICard label="Certified TOTs" value={totalTOTs} sub="national trainers" trend="up" trendVal="+45" icon={<Award size={18} />} color="#6d28d9" />
        <KPICard label="School Coverage" value={`${coveragePct}%`} sub={`${coveredSchools} of ${totalSchools} schools`} trend="up" trendVal="+4%" icon={<Target size={18} />} color="#065f46" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label="Teachers Trained" value={totalTeachers.toLocaleString()} icon={<BookOpen size={18} />} color="#92400e" trend="up" trendVal="+128" />
        <KPICard label="Reports Submitted" value={reports.length} sub={`${pending} pending review`} icon={<FileText size={18} />} color="#c44d00" />
        <KPICard label="Approved Sessions" value={approved} sub={`${Math.round((approved / reports.length) * 100)}% approval rate`} icon={<CheckCircle size={18} />} color="#059669" trend="up" trendVal="+8%" />
        <KPICard label="Active Clusters" value={CLUSTERS.length} sub="training hubs" icon={<Globe size={18} />} color="#3730a3" />
      </div>

      {/* Tabs */}
      <FilterBar
        options={[
          { v: 'overview', l: 'PROGRAM OVERVIEW' },
          { v: 'districts', l: 'DISTRICT PERFORMANCE' },
          { v: 'pipeline', l: 'REPORT PIPELINE' },
        ]}
        active={activeTab}
        onChange={(v) => setActiveTab(v as any)}
      />

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Coverage by region */}
          <Card>
            <h3 className="text-sm font-bold text-black dark:text-white mb-4">Coverage by Region</h3>
            <div className="space-y-4">
              {['Northern', 'Central', 'Southern'].map(region => {
                const ds = DISTRICTS.filter(d => d.r === region);
                const cov = ds.reduce((a, d) => a + d.cov, 0);
                const total = ds.reduce((a, d) => a + d.schools, 0);
                const pct = total > 0 ? Math.round((cov / total) * 100) : 0;
                const active = ds.filter(d => d.s === 'Active').length;
                return (
                  <div key={region}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-black dark:text-white">{region} Region</span>
                      <span className="text-slate-500">{active} active districts · {pct}%</span>
                    </div>
                    <ProgBar pct={pct} />
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Curriculum split */}
          <Card>
            <h3 className="text-sm font-bold text-black dark:text-white mb-4">Curriculum Delivery Split</h3>
            <div className="space-y-3">
              {[
                { label: 'HIM — Hero In Me (Boys)', count: reports.filter(r => r.curriculum === 'HIM').length, color: '#3b82f6' },
                { label: 'GESD — Girls Empowerment', count: reports.filter(r => r.curriculum === 'GESD').length, color: '#a855f7' },
                { label: 'Combined Sessions', count: reports.filter(r => r.curriculum === 'Combined').length, color: '#f59e0b' },
              ].map(item => {
                const pct = reports.length > 0 ? Math.round((item.count / reports.length) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium text-black dark:text-white">{item.label}</span>
                      <span className="text-slate-500">{item.count} reports ({pct}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Report status pipeline */}
          <Card>
            <h3 className="text-sm font-bold text-black dark:text-white mb-4">Approval Pipeline Status</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Approved', count: reports.filter(r => r.status === 'approved').length, color: '#059669', bg: '#d1fae5' },
                { label: 'Pending', count: reports.filter(r => r.status === 'pending').length, color: '#d97706', bg: '#fef3c7' },
                { label: 'Rejected', count: reports.filter(r => r.status === 'rejected').length, color: '#dc2626', bg: '#fee2e2' },
                { label: 'Forwarded', count: reports.filter(r => r.status === 'forwarded').length, color: '#6d28d9', bg: '#ede9fe' },
              ].map(item => (
                <div key={item.label} className="rounded-xl p-3 flex items-center gap-3" style={{ backgroundColor: item.bg }}>
                  <div className="text-2xl font-extrabold" style={{ color: item.color }}>{item.count}</div>
                  <div className="text-[11px] font-semibold" style={{ color: item.color }}>{item.label}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick actions */}
          <Card>
            <h3 className="text-sm font-bold text-black dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'Review Pending Reports', sub: `${pending} awaiting action`, icon: <Clock size={14} />, action: () => setPage('reports'), color: '#d97706' },
                { label: 'View District Map', sub: 'Cluster & school coverage', icon: <MapPin size={14} />, action: () => setPage('maps'), color: '#0e7490' },
                { label: 'Analytics Dashboard', sub: 'Charts & trend analysis', icon: <BarChart2 size={14} />, action: () => setPage('analytics'), color: '#6d28d9' },
                { label: 'ETT Trainings', sub: 'Active cohort tracking', icon: <Award size={14} />, action: () => setPage('trainings'), color: '#065f46' },
              ].map(a => (
                <button
                  key={a.label}
                  onClick={a.action}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-neutral-200 dark:border-slate-800 hover:border-orange-400 bg-white dark:bg-[#0f1623] transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: a.color + '18', color: a.color }}>
                    {a.icon}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-black dark:text-white">{a.label}</div>
                    <div className="text-[10px] text-slate-500">{a.sub}</div>
                  </div>
                  <ArrowUpRight size={13} className="ml-auto text-slate-400" />
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'districts' && (
        <Card>
          <h3 className="text-sm font-bold text-black dark:text-white mb-4">District Performance Ranking</h3>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {['District', 'Region', 'TOTs', 'Teachers', 'Coverage', 'Reports', 'Rating'].map(h => (
                    <th key={h} className="text-left p-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {districtPerf.map((d, i) => (
                  <tr key={d.name} className="border-b border-slate-50 dark:border-slate-800/40 hover:bg-orange-50/30 dark:hover:bg-slate-800/30">
                    <td className="p-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-500 flex items-center justify-center">{i + 1}</span>
                        <span className="font-semibold text-black dark:text-white">{d.name}</span>
                      </div>
                    </td>
                    <td className="p-2.5 text-slate-500">{d.r}</td>
                    <td className="p-2.5 font-semibold text-black dark:text-white">{d.tots}</td>
                    <td className="p-2.5 font-semibold text-black dark:text-white">{d.teachersTrained}</td>
                    <td className="p-2.5">
                      <div className="flex items-center gap-2 min-w-[80px]">
                        <ProgBar pct={d.pct} />
                        <span className="text-[10px] text-slate-500 shrink-0">{d.pct}%</span>
                      </div>
                    </td>
                    <td className="p-2.5 text-black dark:text-white">{d.rptCount}</td>
                    <td className="p-2.5">
                      <Badge
                        text={d.pct >= 70 ? 'Strong' : d.pct >= 40 ? 'Progressing' : 'Needs Attention'}
                        color={d.pct >= 70 ? '#059669' : d.pct >= 40 ? '#d97706' : '#dc2626'}
                        bg={d.pct >= 70 ? '#d1fae5' : d.pct >= 40 ? '#fef3c7' : '#fee2e2'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'pipeline' && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <Card><p className="text-center text-slate-400 text-sm py-8">No reports in the system yet.</p></Card>
          ) : (
            reports.slice(0, 15).map(r => (
              <div key={r.id} className="bg-white dark:bg-[#0f1623] rounded-xl border border-neutral-200 dark:border-slate-800 p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-black dark:text-white truncate">{r.school}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{r.district} · {r.curriculum} · {r.submitted_at}</div>
                </div>
                <Badge
                  text={r.status.toUpperCase()}
                  color={r.status === 'approved' ? '#059669' : r.status === 'pending' ? '#d97706' : r.status === 'rejected' ? '#dc2626' : '#6d28d9'}
                  bg={r.status === 'approved' ? '#d1fae5' : r.status === 'pending' ? '#fef3c7' : r.status === 'rejected' ? '#fee2e2' : '#ede9fe'}
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
