import React, { useState, useEffect } from 'react';
import {
  Users, MapPin, BarChart2, CheckCircle, Clock,
  Download, Target, Award, ArrowUpRight, ArrowDownRight,
  Globe, BookOpen, FileText
} from 'lucide-react';
import { Card, Kicker, Btn, ProgBar, FilterBar, Badge } from './SubComponents';
import { districtsApi, statsApi } from '../api';
import { useCountry } from '../context/CountryContext';
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
}> = ({ label, value, sub, trend, trendVal, color = 'var(--brand)', icon }) => (
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
  const [allDistricts, setAllDistricts] = useState<any[]>([]);
  const [liveStats, setLiveStats] = useState({ learners: 0, teachers: 0, tots: 0, schools: 0 });
  const { activeCountry } = useCountry();

  const myRegion = user?.region;

  useEffect(() => {
    districtsApi.getAll(activeCountry).then((res: any) => {
      setAllDistricts(Array.isArray(res) ? res : []);
    }).catch(() => {});
    statsApi.get(activeCountry, myRegion).then((data: any) => {
      if (!data.error) setLiveStats(data);
    }).catch(() => {});
  }, [activeCountry, myRegion]);

  // Program Managers only ever see districts in their own assigned region --
  // this page used to run on static demo data with no region scoping at all.
  const districts = myRegion ? allDistricts.filter(d => d.region === myRegion) : allDistricts;
  const regionReports = myRegion
    ? reports.filter(r => districts.some(d => d.name === r.district))
    : reports;

  const approved = regionReports.filter(r => r.status === 'approved').length;
  const pending = regionReports.filter(r => r.status === 'pending').length;
  const activeDistrictsCount = districts.filter(d => d.status === 'Active').length;
  const totalTOTs = liveStats.tots;
  const totalTeachers = liveStats.teachers;
  const totalStudents = liveStats.learners;
  const totalSchools = districts.reduce((a, d) => a + (d.schools || 0), 0);
  const avgCoveragePct = districts.length > 0
    ? Math.round(districts.reduce((a, d) => a + (Number(d.coverage) || 0), 0) / districts.length)
    : 0;

  const districtPerf = districts.filter(d => d.status === 'Active').map(d => ({
    ...d,
    pct: Math.round(Number(d.coverage) || 0),
    rptCount: regionReports.filter(r => r.district === d.name).length,
  })).sort((a, b) => b.pct - a.pct);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <Kicker text={myRegion ? `${myRegion} Region Program Office` : "Program Management Office"} />
          <h1 className="text-lg font-bold text-black dark:text-white m-0">
            {myRegion ? `${myRegion} Region Overview` : "Strategic Overview"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 m-0">
            Welcome back, <span className="font-semibold text-[var(--brand-600)]">{user?.name}</span> — here's your {myRegion ? `${myRegion} Region` : 'national'} program pulse.
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
        <KPICard label="Active Districts" value={activeDistrictsCount} sub={`of ${districts.length} in region`} icon={<MapPin size={18} />} color="var(--brand)" />
        <KPICard label="Students Reached" value={totalStudents.toLocaleString()} sub="across your region" icon={<Users size={18} />} color="#0e7490" />
        <KPICard label="Certified TOTs" value={totalTOTs} sub="in your region" icon={<Award size={18} />} color="#6d28d9" />
        <KPICard label="School Coverage" value={`${avgCoveragePct}%`} sub={`avg. across ${districts.length} districts`} icon={<Target size={18} />} color="#065f46" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label="Teachers Trained" value={totalTeachers.toLocaleString()} icon={<BookOpen size={18} />} color="#92400e" />
        <KPICard label="Reports Submitted" value={regionReports.length} sub={`${pending} pending review`} icon={<FileText size={18} />} color="#c44d00" />
        <KPICard label="Approved Sessions" value={approved} sub={regionReports.length > 0 ? `${Math.round((approved / regionReports.length) * 100)}% approval rate` : 'No reports yet'} icon={<CheckCircle size={18} />} color="#059669" />
        <KPICard label="Total Schools" value={totalSchools} sub="in your region" icon={<Globe size={18} />} color="#3730a3" />
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
          {/* Coverage by district (within the manager's own region) */}
          <Card>
            <h3 className="text-sm font-bold text-black dark:text-white mb-4">Coverage by District</h3>
            <div className="space-y-4">
              {districts.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No districts found for your region.</p>
              ) : (
                districts.map(d => (
                  <div key={d.name}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-black dark:text-white">{d.name}</span>
                      <span className="text-slate-500">{d.status} · {Math.round(Number(d.coverage) || 0)}%</span>
                    </div>
                    <ProgBar pct={Math.round(Number(d.coverage) || 0)} />
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Curriculum split */}
          <Card>
            <h3 className="text-sm font-bold text-black dark:text-white mb-4">Curriculum Delivery Split</h3>
            <div className="space-y-3">
              {[
                { label: 'HIM — Hero In Me (Boys)', count: regionReports.filter(r => r.curriculum === 'HIM').length, color: '#3b82f6' },
                { label: 'GESD — Girls Empowerment', count: regionReports.filter(r => r.curriculum === 'GESD').length, color: '#a855f7' },
                { label: 'Combined Sessions', count: regionReports.filter(r => r.curriculum === 'Combined').length, color: '#f59e0b' },
              ].map(item => {
                const pct = regionReports.length > 0 ? Math.round((item.count / regionReports.length) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium text-black dark:text-white">{item.label}</span>
                      <span className="text-slate-500">{item.count} reports ({pct}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: item.color }}/>
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
                { label: 'Approved', count: regionReports.filter(r => r.status === 'approved').length, color: '#059669', bg: '#d1fae5' },
                { label: 'Pending', count: regionReports.filter(r => r.status === 'pending').length, color: '#d97706', bg: '#fef3c7' },
                { label: 'Rejected', count: regionReports.filter(r => r.status === 'rejected').length, color: '#dc2626', bg: '#fee2e2' },
                { label: 'Forwarded', count: regionReports.filter(r => r.status === 'forwarded').length, color: '#6d28d9', bg: '#ede9fe' },
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
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-neutral-200 dark:border-slate-800 hover:border-[var(--brand-400)] bg-white dark:bg-[#0f1623] transition-colors text-left"
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
                  <tr key={d.name} className="border-b border-slate-50 dark:border-slate-800/40 hover:bg-[var(--brand-50)]/30 dark:hover:bg-slate-800/30">
                    <td className="p-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-500 flex items-center justify-center">{i + 1}</span>
                        <span className="font-semibold text-black dark:text-white">{d.name}</span>
                      </div>
                    </td>
                    <td className="p-2.5 text-slate-500">{d.region}</td>
                    <td className="p-2.5 font-semibold text-black dark:text-white">{d.tots}</td>
                    <td className="p-2.5 font-semibold text-black dark:text-white">{d.teachers_trained}</td>
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
          {regionReports.length === 0 ? (
            <Card><p className="text-center text-slate-400 text-sm py-8">No reports in the system yet.</p></Card>
          ) : (
            regionReports.slice(0, 15).map(r => (
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
