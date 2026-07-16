import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, MapPin, Users, School, FileText, GraduationCap, Heart, ClipboardList, AlertOctagon } from 'lucide-react';
import { Card, Kicker, PageHeader } from './SubComponents';
import { dataCompletenessApi } from '../api';

interface CountryCompleteness {
  country: string;
  districts: number;
  clusters: number;
  schools: number;
  reports: number;
  trainings: number;
  stories: number;
  monitoringActivities: number;
  monitoringIssues: number;
}

const METRICS: { key: keyof CountryCompleteness; label: string; icon: React.ReactNode }[] = [
  { key: 'clusters', label: 'Clusters', icon: <MapPin size={14} /> },
  { key: 'schools', label: 'Schools', icon: <School size={14} /> },
  { key: 'reports', label: 'Reports', icon: <FileText size={14} /> },
  { key: 'trainings', label: 'Trainings', icon: <GraduationCap size={14} /> },
  { key: 'stories', label: 'Success Stories', icon: <Heart size={14} /> },
  { key: 'monitoringActivities', label: 'Monitoring Activities', icon: <ClipboardList size={14} /> },
  { key: 'monitoringIssues', label: 'Monitoring Issues', icon: <AlertOctagon size={14} /> },
];

export const DataCompletenessPage: React.FC = () => {
  const [data, setData] = useState<CountryCompleteness[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataCompletenessApi.get().then((res: any) => {
      setData(Array.isArray(res) ? res : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5 animate-fade-in-up max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Data Completeness"
        subtitle="See at a glance what's missing per country, instead of discovering it page by page."
      />

      {loading ? (
        <div className="text-center py-12 text-sm text-slate-400">Loading…</div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 text-sm text-slate-400">No countries found.</div>
      ) : (
        <div className="space-y-4">
          {data.map(c => {
            const zeroCount = METRICS.filter(m => (c[m.key] as number) === 0).length;
            const allZero = zeroCount === METRICS.length;
            const noneZero = zeroCount === 0;

            return (
              <Card key={c.country} className="p-0 overflow-hidden">
                <div className="px-5 py-3.5 flex items-center justify-between border-b border-neutral-100 dark:border-slate-800 bg-neutral-50 dark:bg-slate-900/40">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-black dark:text-white m-0">{c.country}</h3>
                    <span className="text-[11px] text-slate-400">{c.districts} districts registered</span>
                  </div>
                  {allZero ? (
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-red-500 bg-red-50 dark:bg-red-950/20 px-2.5 py-1 rounded-full">
                      <AlertTriangle size={12} /> No program data entered yet
                    </span>
                  ) : noneZero ? (
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-full">
                      <CheckCircle2 size={12} /> Fully populated
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2.5 py-1 rounded-full">
                      <AlertTriangle size={12} /> {zeroCount} of {METRICS.length} areas empty
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
                  {METRICS.map(m => {
                    const value = c[m.key] as number;
                    const isZero = value === 0;
                    return (
                      <div
                        key={m.key}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border ${
                          isZero
                            ? 'border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/10'
                            : 'border-neutral-200 dark:border-slate-700 bg-white dark:bg-[#0f1623]'
                        }`}
                      >
                        <span className={isZero ? 'text-red-400' : 'text-[var(--brand-500)]'}>{m.icon}</span>
                        <div>
                          <div className={`text-base font-black ${isZero ? 'text-red-500' : 'text-black dark:text-white'}`}>{value}</div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">{m.label}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
