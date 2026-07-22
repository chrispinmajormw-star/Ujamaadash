import React, { useState, useEffect, useRef } from 'react';
import { clusterFollowupsApi } from '../api';
import { useCountry } from '../context/CountryContext';
import { User } from '../types';
import { Card, PageHeader, Badge } from './SubComponents';
import { Users, CheckCircle2, AlertTriangle } from 'lucide-react';

interface FollowupConsistencyPageProps {
  user: User | null;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

const STATUS_CFG: Record<string, { color: string; bg: string }> = {
  Consistent: { color: '#065f46', bg: '#dcfce7' },
  'Barely Consistent': { color: '#92400e', bg: '#fef9c3' },
  'Not Consistent': { color: '#991b1b', bg: '#fee2e2' },
};

export const FollowupConsistencyPage: React.FC<FollowupConsistencyPageProps> = ({ user }) => {
  const [data, setData] = useState<{ weeks: string[]; summary: any[] }>({ weeks: [], summary: [] });
  const barRef = useRef<HTMLCanvasElement>(null);
  const doughnutRef = useRef<HTMLCanvasElement>(null);
  const chartInstances = useRef<any[]>([]);

  const { activeCountry } = useCountry();
  const canAccess = user && ['qa_officer', 'program_manager', 'admin'].includes(user.role);

  useEffect(() => {
    if (canAccess) clusterFollowupsApi.getConsistency(activeCountry).then(setData).catch(() => {});
  }, [user, activeCountry]);

  useEffect(() => {
    const Chart = (window as any).Chart;
    if (!Chart || data.summary.length === 0) return;

    chartInstances.current.forEach(c => c.destroy());
    chartInstances.current = [];

    const brand = getComputedStyle(document.documentElement).getPropertyValue('--brand').trim() || '#e85d04';

    if (barRef.current) {
      const chart = new Chart(barRef.current, {
        type: 'bar',
        data: {
          labels: data.summary.map(s => s.name),
          datasets: [{ label: 'Weeks Complete (of 4)', data: data.summary.map(s => s.weeksComplete), backgroundColor: brand, borderRadius: 5 }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, max: 4, ticks: { stepSize: 1 } } },
        },
      });
      chartInstances.current.push(chart);
    }

    if (doughnutRef.current) {
      const counts = { Consistent: 0, 'Barely Consistent': 0, 'Not Consistent': 0 };
      data.summary.forEach(s => { counts[s.status as keyof typeof counts]++; });
      const chart = new Chart(doughnutRef.current, {
        type: 'doughnut',
        data: {
          labels: Object.keys(counts),
          datasets: [{ data: Object.values(counts), backgroundColor: ['#22c55e', '#eab308', '#ef4444'] }],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } } },
      });
      chartInstances.current.push(chart);
    }

    return () => { chartInstances.current.forEach(c => c.destroy()); chartInstances.current = []; };
  }, [data]);

  if (!canAccess) {
    return (
      <div className="p-12 text-center text-black/40 dark:text-white/40 font-semibold italic">
        This workspace is restricted to Quality Assurance Officers.
      </div>
    );
  }

  const consistentCount = data.summary.filter(s => s.status === 'Consistent').length;
  const notConsistentCount = data.summary.filter(s => s.status === 'Not Consistent').length;

  return (
    <div>
      <PageHeader
        title="Weekly Follow-up Consistency"
        subtitle="Are Field Officers, District Coordinators, and TOTs keeping up with their assigned clusters?"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <div className="p-3 rounded-lg" style={{ background: 'linear-gradient(135deg,var(--brand),#c44d00)' }}>
          <div className="flex items-center gap-1.5 mb-1 text-white/80 text-[10px] font-semibold uppercase tracking-wide"><Users size={14} /> Officers Tracked</div>
          <div className="text-xl font-black text-white">{data.summary.length}</div>
        </div>
        <div className="p-3 rounded-lg" style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)' }}>
          <div className="flex items-center gap-1.5 mb-1 text-white/80 text-[10px] font-semibold uppercase tracking-wide"><CheckCircle2 size={14} /> Consistent</div>
          <div className="text-xl font-black text-white">{consistentCount}</div>
        </div>
        <div className="p-3 rounded-lg" style={{ background: 'linear-gradient(135deg,#dc2626,#b91c1c)' }}>
          <div className="flex items-center gap-1.5 mb-1 text-white/80 text-[10px] font-semibold uppercase tracking-wide"><AlertTriangle size={14} /> Not Consistent</div>
          <div className="text-xl font-black text-white">{notConsistentCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <Card className="p-3">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Weeks Completed per Officer</div>
          <div className="h-52"><canvas ref={barRef} /></div>
        </Card>
        <Card className="p-3">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Consistency Distribution</div>
          <div className="h-52"><canvas ref={doughnutRef} /></div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/40">
              <tr>
                <th className="px-3 py-2 font-bold text-slate-500">Officer</th>
                <th className="px-3 py-2 font-bold text-slate-500">Role</th>
                <th className="px-3 py-2 font-bold text-slate-500">District</th>
                <th className="px-3 py-2 font-bold text-slate-500">Clusters Assigned</th>
                <th className="px-3 py-2 font-bold text-slate-500">Weeks Complete</th>
                <th className="px-3 py-2 font-bold text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-slate-800">
              {data.summary.length === 0 ? (
                <tr><td colSpan={6} className="px-3 py-6 text-center text-slate-400">No officers have assigned clusters yet.</td></tr>
              ) : (
                data.summary.map((s: any) => (
                  <tr key={s.userId}>
                    <td className="px-3 py-2 font-bold text-black dark:text-white">{s.name}</td>
                    <td className="px-3 py-2 capitalize text-slate-600 dark:text-slate-300">{s.role.replace('_', ' ')}</td>
                    <td className="px-3 py-2 text-slate-500">{s.district || '—'}</td>
                    <td className="px-3 py-2">{s.clustersAssigned}</td>
                    <td className="px-3 py-2">{s.weeksComplete} / 4</td>
                    <td className="px-3 py-2"><Badge text={s.status} color={STATUS_CFG[s.status].color} bg={STATUS_CFG[s.status].bg} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
