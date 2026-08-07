import React, { useState, useEffect } from 'react';
import { weeklyPlanningApi } from '../api';
import { User } from '../types';
import { Card, PageHeader } from './SubComponents';
import { FileText } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface WeeklyPlanningReportPageProps {
  user: User | null;
}

const STATUS_COLOR: Record<string, string> = {
  'Fixed': 'bg-emerald-600 text-white',
  'Tentative': 'bg-blue-500 text-white',
  'No Activity': 'bg-slate-300 text-slate-700',
  'Not Submitted': 'bg-slate-100 text-slate-400',
};
const REMARK_COLOR: Record<string, string> = {
  'Done': 'bg-blue-600 text-white',
  'Postponed': 'bg-emerald-600 text-white',
  'Cancelled': 'bg-red-500 text-white',
};
const STATUS_PIE_COLORS: Record<string, string> = {
  'Fixed': '#059669',
  'Tentative': '#3b82f6',
  'No Activity': '#94a3b8',
  'Not Submitted': '#e2e8f0',
};

const formatDate = (iso: string) => {
  const d = new Date(iso);  // handles both plain 'YYYY-MM-DD' and full ISO timestamps
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
};

// Opened from the "Biweekly Planning Report Ready" notification -- shows the
// exact snapshot the Planning Officer compiled, not a live re-query, so it
// stays accurate even if the table changes after the report was generated.
export const WeeklyPlanningReportPage: React.FC<WeeklyPlanningReportPageProps> = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) { setError('No report was specified.'); setLoading(false); return; }
    weeklyPlanningApi.getReport(id).then((data: any) => {
      if (data?.error) { setError(data.error); setLoading(false); return; }
      setReport(data);
      setLoading(false);
    }).catch(() => { setError('Failed to load the report.'); setLoading(false); });
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-sm text-black/40 dark:text-white/40">Loading…</div>;
  }
  if (error || !report) {
    return (
      <Card className="p-8 text-center">
        <FileText size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
        <p className="text-sm text-black dark:text-white font-semibold m-0">{error || 'Report not found.'}</p>
      </Card>
    );
  }

  const data = report.report_data;
  const districtNames = Object.keys(data.districts || {}).sort();
  const summary = data.summary || {};
  const statusPieData = Object.entries(summary.byStatus || {}).map(([name, value]) => ({ name, value: Number(value) }));
  const districtBarData = districtNames.map(name => ({ name, count: data.districts[name].length }));

  return (
    <div className="space-y-4 animate-fade-in-up">
      <PageHeader
        title="Biweekly Planning Report"
        subtitle={`${data.country} — Biweek starting ${formatDate(data.biweekStart)}, compiled ${new Date(report.created_at).toLocaleDateString()}.`}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Activities', value: summary.total ?? '—' },
          { label: 'Fixed', value: summary.byStatus?.['Fixed'] ?? 0 },
          { label: 'Tentative', value: summary.byStatus?.['Tentative'] ?? 0 },
          { label: 'Completion Rate', value: `${summary.completionRate ?? 0}%` },
        ].map(s => (
          <Card key={s.label} className="p-3 text-center">
            <div className="text-lg font-black text-black dark:text-white">{s.value}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-0.5">{s.label}</div>
          </Card>
        ))}
      </div>

      {statusPieData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card className="p-4">
            <h3 className="text-xs font-bold text-black dark:text-white mb-2">Activities by Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {statusPieData.map((entry, i) => (
                    <Cell key={i} fill={STATUS_PIE_COLORS[entry.name] || '#cbd5e1'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-4">
            <h3 className="text-xs font-bold text-black dark:text-white mb-2">Activities by District</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={districtBarData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {districtNames.length === 0 ? (
        <Card className="p-8 text-center text-sm text-black/40 dark:text-white/40">No data was recorded for this biweek.</Card>
      ) : districtNames.map(district => (
        <Card key={district} className="p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-black dark:text-white m-0">{district}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/40">
                <tr>
                  <th className="px-3 py-2 font-bold text-slate-500">Day</th>
                  <th className="px-3 py-2 font-bold text-slate-500">Date</th>
                  <th className="px-3 py-2 font-bold text-slate-500">Activity</th>
                  <th className="px-3 py-2 font-bold text-slate-500">Venue</th>
                  <th className="px-3 py-2 font-bold text-slate-500">Status</th>
                  <th className="px-3 py-2 font-bold text-slate-500">Remark</th>
                  <th className="px-3 py-2 font-bold text-slate-500">Comment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-slate-800">
                {data.districts[district].map((r: any, i: number) => (
                  <React.Fragment key={i}>
                  <tr>
                    <td className="px-3 py-2 font-bold text-black dark:text-white whitespace-nowrap">{r.day_name}</td>
                    <td className="px-3 py-2 whitespace-nowrap opacity-70">{formatDate(r.day_date)}</td>
                    <td className="px-3 py-2">{r.activity || '—'}</td>
                    <td className="px-3 py-2">{r.venue || '—'}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLOR[r.status] || STATUS_COLOR['Not Submitted']}`}>{r.status}</span>
                    </td>
                    <td className="px-3 py-2">
                      {r.remark && <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${REMARK_COLOR[r.remark] || ''}`}>{r.remark}</span>}
                    </td>
                    <td className="px-3 py-2 text-[11px] italic text-amber-700 dark:text-amber-400">{r.po_comment || '—'}</td>
                  </tr>
                  {r.description && (
                    <tr>
                      <td colSpan={7} className="px-3 pb-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-semibold">Description: </span>{r.description}
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ))}
    </div>
  );
};
