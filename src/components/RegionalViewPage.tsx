import React, { useState, useEffect, useRef } from 'react';
import { sessionMonitoringApi } from '../api';
import { useCountry } from '../context/CountryContext';
import { User } from '../types';
import { Card, PageHeader, Badge } from './SubComponents';
import { ClusterSessionSummaryChart } from './ClusterSessionSummaryChart';
import { RegionalPerformanceCharts } from './RegionalPerformanceCharts';
import { MapPin, Users, BarChart3 } from 'lucide-react';

interface RegionalViewPageProps {
  user: User | null;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

const statusFor = (overall: number) => {
  if (overall >= 80) return 'On Track';
  if (overall >= 60) return 'Monitor';
  return 'At Risk';
};

const STATUS_CFG: Record<string, { color: string; bg: string }> = {
  'On Track': { color: '#065f46', bg: '#dcfce7' },
  Monitor: { color: '#92400e', bg: '#fef9c3' },
  'At Risk': { color: '#991b1b', bg: '#fee2e2' },
};

export const RegionalViewPage: React.FC<RegionalViewPageProps> = ({ user }) => {
  const [rows, setRows] = useState<any[]>([]);
  const barRef = useRef<HTMLCanvasElement>(null);
  const doughnutRef = useRef<HTMLCanvasElement>(null);
  const programmeRef = useRef<HTMLCanvasElement>(null);
  const chartInstances = useRef<any[]>([]);

  const { activeCountry } = useCountry();
  const canAccess = user && ['qa_officer', 'program_manager', 'admin'].includes(user.role);

  useEffect(() => {
    if (canAccess) sessionMonitoringApi.getRegionalView(activeCountry).then(setRows).catch(() => {});
  }, [user, activeCountry]);

  useEffect(() => {
    const Chart = (window as any).Chart;
    if (!Chart || rows.length === 0) return;

    chartInstances.current.forEach(c => c.destroy());
    chartInstances.current = [];

    const brand = getComputedStyle(document.documentElement).getPropertyValue('--brand').trim() || '#e85d04';

    // Sessions monitored by district
    if (barRef.current) {
      const chart = new Chart(barRef.current, {
        type: 'bar',
        data: {
          labels: rows.map(r => r.district),
          datasets: [{ label: 'Sessions Monitored', data: rows.map(r => Number(r.sessions_monitored)), backgroundColor: brand, borderRadius: 5 }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
        },
      });
      chartInstances.current.push(chart);
    }

    // QA status distribution
    if (doughnutRef.current) {
      const statusCounts = { 'On Track': 0, Monitor: 0, 'At Risk': 0 };
      rows.forEach(r => { statusCounts[statusFor(Number(r.overall_score))]++; });
      const chart = new Chart(doughnutRef.current, {
        type: 'doughnut',
        data: {
          labels: Object.keys(statusCounts),
          datasets: [{ data: Object.values(statusCounts), backgroundColor: ['#22c55e', '#eab308', '#ef4444'] }],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } } },
      });
      chartInstances.current.push(chart);
    }

    // HIM vs GESD average score by district
    if (programmeRef.current) {
      const chart = new Chart(programmeRef.current, {
        type: 'bar',
        data: {
          labels: rows.map(r => r.district),
          datasets: [
            { label: 'HIM', data: rows.map(r => Math.round(Number(r.him_score) * 10) / 10), backgroundColor: brand },
            { label: 'GESD', data: rows.map(r => Math.round(Number(r.gesd_score) * 10) / 10), backgroundColor: '#94a3b8' },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } },
          scales: { y: { beginAtZero: true, max: 100 } },
        },
      });
      chartInstances.current.push(chart);
    }

    return () => { chartInstances.current.forEach(c => c.destroy()); chartInstances.current = []; };
  }, [rows]);

  if (!canAccess) {
    return (
      <div className="p-12 text-center text-black/40 dark:text-white/40 font-semibold italic">
        This workspace is restricted to Quality Assurance Officers.
      </div>
    );
  }

  const totalSessions = rows.reduce((acc, r) => acc + Number(r.sessions_monitored), 0);
  const avgCoverage = rows.length ? Math.round(rows.reduce((acc, r) => acc + Number(r.avg_coverage), 0) / rows.length) : 0;

  return (
    <div>
      <PageHeader
        title="Regional Performance Dashboard"
        subtitle="Live rollup of session monitoring data across every district"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <div className="p-3 rounded-lg" style={{ background: 'linear-gradient(135deg,var(--brand),#c44d00)' }}>
          <div className="flex items-center gap-1.5 mb-1 text-white/80 text-[10px] font-semibold uppercase tracking-wide"><MapPin size={14} /> Districts Tracked</div>
          <div className="text-xl font-black text-white">{rows.length}</div>
        </div>
        <div className="p-3 rounded-lg" style={{ background: 'linear-gradient(135deg,var(--brand),#c44d00)' }}>
          <div className="flex items-center gap-1.5 mb-1 text-white/80 text-[10px] font-semibold uppercase tracking-wide"><BarChart3 size={14} /> Sessions Monitored</div>
          <div className="text-xl font-black text-white">{totalSessions}</div>
        </div>
        <div className="p-3 rounded-lg" style={{ background: 'linear-gradient(135deg,var(--brand),#c44d00)' }}>
          <div className="flex items-center gap-1.5 mb-1 text-white/80 text-[10px] font-semibold uppercase tracking-wide"><Users size={14} /> Avg Monitoring Coverage</div>
          <div className="text-xl font-black text-white">{avgCoverage}%</div>
        </div>
      </div>

      <RegionalPerformanceCharts />

      <ClusterSessionSummaryChart />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 mt-5">
        <Card className="p-3">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Sessions by District</div>
          <div className="h-48"><canvas ref={barRef} /></div>
        </Card>
        <Card className="p-3">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">QA Status Distribution</div>
          <div className="h-48"><canvas ref={doughnutRef} /></div>
        </Card>
        <Card className="p-3">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">HIM vs GESD Score</div>
          <div className="h-48"><canvas ref={programmeRef} /></div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/40">
              <tr>
                <th className="px-3 py-2 font-bold text-slate-500">Region</th>
                <th className="px-3 py-2 font-bold text-slate-500">District</th>
                <th className="px-3 py-2 font-bold text-slate-500">Assigned Staff</th>
                <th className="px-3 py-2 font-bold text-slate-500">HIM Score</th>
                <th className="px-3 py-2 font-bold text-slate-500">GESD Score</th>
                <th className="px-3 py-2 font-bold text-slate-500">Overall %</th>
                <th className="px-3 py-2 font-bold text-slate-500">Sessions</th>
                <th className="px-3 py-2 font-bold text-slate-500">QA Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-slate-800">
              {rows.length === 0 ? (
                <tr><td colSpan={8} className="px-3 py-6 text-center text-slate-400">No session monitoring data submitted yet.</td></tr>
              ) : (
                rows.map((r, i) => {
                  const status = statusFor(Number(r.overall_score));
                  return (
                    <tr key={i}>
                      <td className="px-3 py-2 text-slate-500">{r.region || '—'}</td>
                      <td className="px-3 py-2 font-bold text-black dark:text-white">{r.district}</td>
                      <td className="px-3 py-2 text-slate-600 dark:text-slate-300 truncate max-w-[200px]">{r.assigned_staff}</td>
                      <td className="px-3 py-2">{Math.round(Number(r.him_score) * 10) / 10 || '—'}</td>
                      <td className="px-3 py-2">{Math.round(Number(r.gesd_score) * 10) / 10 || '—'}</td>
                      <td className="px-3 py-2 font-bold">{Math.round(Number(r.overall_score) * 10) / 10}%</td>
                      <td className="px-3 py-2">{r.sessions_monitored}</td>
                      <td className="px-3 py-2"><Badge text={status} color={STATUS_CFG[status].color} bg={STATUS_CFG[status].bg} /></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
