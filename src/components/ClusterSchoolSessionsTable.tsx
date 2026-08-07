import React, { useState, useEffect } from 'react';
import { clusterSchoolSessionsApi } from '../api';
import { User } from '../types';
import { Card, Badge } from './SubComponents';
import { useCountry } from '../context/CountryContext';

interface ClusterSchoolSessionsTableProps {
  user: User | null;
}

// Read-only oversight table for QA Officer / Planning Officer / Admin / Program
// Manager -- shows exactly what each Field Officer/TOT/DC has actually entered
// for each school, since the graphs alone don't show the underlying rows.
export const ClusterSchoolSessionsTable: React.FC<ClusterSchoolSessionsTableProps> = ({ user }) => {
  const { activeCountry } = useCountry();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    clusterSchoolSessionsApi.getAll(activeCountry).then((res: any) => {
      setRecords(Array.isArray(res) ? res : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [activeCountry]);

  const weekBadge = (val: any) => val ? (
    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title={String(val)} />
  ) : (
    <span className="inline-block w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" title="Not reported" />
  );

  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-neutral-200 dark:border-slate-800">
        <h3 className="text-sm font-bold text-black dark:text-white m-0">Submitted Session Records</h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          What Field Officers, TOTs, and DCs have actually entered, per school. Dots show whether GESD/HIM week 1–4 was reported.
        </p>
      </div>
      {loading ? (
        <div className="p-6 text-center text-xs text-slate-400">Loading…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/40">
              <tr>
                <th className="px-3 py-2 font-bold text-slate-500">School</th>
                <th className="px-3 py-2 font-bold text-slate-500">Cluster</th>
                <th className="px-3 py-2 font-bold text-slate-500">Month</th>
                <th className="px-3 py-2 font-bold text-slate-500">Submitted By</th>
                <th className="px-3 py-2 font-bold text-slate-500">GESD W1-4</th>
                <th className="px-3 py-2 font-bold text-slate-500">HIM W1-4</th>
                <th className="px-3 py-2 font-bold text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-slate-800">
              {records.length === 0 ? (
                <tr><td colSpan={7} className="px-3 py-8 text-center text-slate-400">No session records submitted yet.</td></tr>
              ) : records.map((r: any) => (
                <tr key={r.id}>
                  <td className="px-3 py-2 font-bold text-black dark:text-white">{r.school_name}</td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{r.cluster_name}</td>
                  <td className="px-3 py-2 opacity-70">{r.reporting_month ? new Date(r.reporting_month).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : '—'}</td>
                  <td className="px-3 py-2">{r.submitted_by_name || '—'}</td>
                  <td className="px-3 py-2"><div className="flex gap-1">{weekBadge(r.gesd_week1)}{weekBadge(r.gesd_week2)}{weekBadge(r.gesd_week3)}{weekBadge(r.gesd_week4)}</div></td>
                  <td className="px-3 py-2"><div className="flex gap-1">{weekBadge(r.him_week1)}{weekBadge(r.him_week2)}{weekBadge(r.him_week3)}{weekBadge(r.him_week4)}</div></td>
                  <td className="px-3 py-2">
                    {r.session_implementation_status && <Badge text={r.session_implementation_status} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};
