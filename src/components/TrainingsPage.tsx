import React, { useState, useEffect } from 'react';
import { Play, Calendar, Check, RefreshCw } from 'lucide-react';
import { trainingsApi } from '../api';
import { Kicker, StatCard, FilterBar, Card, Badge, ProgBar } from './SubComponents';

interface Training {
  id: number;
  name: string;
  district?: string;
  venue?: string;
  training_lead_name?: string;
  cohort?: string;
  participants?: number;
  start_date?: string;
  end_date?: string;
  status?: string;
  computed_status?: string;
  progress_percentage?: number;
}

const TODAY = new Date().toISOString().split('T')[0];
const CURRENT_YEAR = new Date().getFullYear();

const getStatus = (t: Training): 'active' | 'upcoming' | 'completed' => {
  // Use backend computed_status if available
  if (t.computed_status) return t.computed_status as any;
  if (t.status && ['active', 'upcoming', 'completed'].includes(t.status)) return t.status as any;
  if (!t.start_date) return 'upcoming';
  const start = t.start_date.split('T')[0];
  // Auto-calculate end date as 6 days after start if not provided
  const end = t.end_date ? t.end_date.split('T')[0] : new Date(new Date(start).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  if (TODAY < start) return 'upcoming';
  if (TODAY > end) return 'completed';
  return 'active';
};

const getProgressPct = (t: Training): number => {
  if (t.progress_percentage !== undefined && t.progress_percentage !== null) {
    return Math.round(Number(t.progress_percentage));
  }
  const status = getStatus(t);
  if (status === 'completed') return 100;
  if (status === 'upcoming') return 0;
  if (!t.start_date) return 0;
  const start = new Date(t.start_date);
  const days = Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.min(Math.round((days / 6) * 100), 99);
};

const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const TrainingsPage: React.FC = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [filt, setFilt]           = useState<string>('all');
  const [yearFilt, setYearFilt]   = useState<string>(String(CURRENT_YEAR));

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await trainingsApi.getAll();
      if (Array.isArray(data)) {
        setTrainings(data);
      } else {
        setError('Failed to load trainings');
      }
    } catch {
      setError('Could not connect to server. Please check your internet connection and try again.');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Filter by year first, then by status
  const trainingsInYear = trainings.filter(t => {
    if (!t.start_date) return false;
    const trainingYear = new Date(t.start_date).getFullYear();
    return yearFilt === 'all' || trainingYear === parseInt(yearFilt);
  });

  const visible = trainingsInYear.filter(t => {
    if (filt === 'all') return true;
    return getStatus(t) === filt;
  });

  const counts = {
    active:    trainingsInYear.filter(t => getStatus(t) === 'active').length,
    upcoming:  trainingsInYear.filter(t => getStatus(t) === 'upcoming').length,
    completed: trainingsInYear.filter(t => getStatus(t) === 'completed').length,
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex justify-between items-end">
        <div>
          <Kicker text="Capacity Engineering" />
          <h1 className="text-base font-bold text-black dark:text-white m-0">ETT Certified Trainings</h1>
          <p className="text-xs text-black dark:text-white opacity-80 mt-1 m-0">
            Certify and track teachers, community leaders, and safety champions.
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-orange-600 transition-colors"
          title="Refresh trainings"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={<Play size={18} className="text-blue-500" />}    label="Active Cohorts"     value={counts.active} />
        <StatCard icon={<Calendar size={18} className="text-amber-500" />} label="Upcoming Projects" value={counts.upcoming}  color="#d97706" />
        <StatCard icon={<Check size={18} className="text-emerald-500" />}  label="Completed Cycles"  value={counts.completed} color="#059669" />
      </div>

      <div className="flex gap-2 flex-wrap">
        <FilterBar
          options={['all', 'active', 'upcoming', 'completed'].map(x => ({ v: x, l: x.toUpperCase() }))}
          active={filt}
          onChange={setFilt}
        />
        <FilterBar
          options={[
            { v: String(CURRENT_YEAR), l: String(CURRENT_YEAR) },
            { v: 'all', l: 'All Years' },
          ]}
          active={yearFilt}
          onChange={setYearFilt}
        />
      </div>

      {loading && (
        <div className="text-center py-12 text-slate-400 text-sm">Loading trainings...</div>
      )}

      {!loading && error && (
        <div className="text-center py-12 text-red-500 text-sm">
          {error} — <button onClick={load} className="underline hover:text-red-700">Try again</button>
        </div>
      )}

      {!loading && !error && visible.length === 0 && (
        <div className="text-center py-12 text-slate-400 text-sm italic">
          No {filt !== 'all' ? filt : ''} trainings found.
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visible.map((t) => {
            const status = getStatus(t);
            const pct    = getProgressPct(t);
            const dayNum = t.start_date
              ? Math.min(Math.floor((Date.now() - new Date(t.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1, 6)
              : null;

            return (
              <Card key={t.id} className="flex flex-col justify-between">
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-sm font-bold text-black dark:text-white m-0">{t.name}</h3>
                    <Badge text={status} className="uppercase shrink-0 text-[10px]" />
                  </div>
                  <p className="text-xs text-slate-400 m-0">
                    📅 {formatDate(t.start_date)} → {formatDate(t.end_date)}
                    {t.participants ? ` · 👥 ${t.participants} teachers` : ''}
                  </p>
                  {t.venue && (
                    <p className="text-xs text-slate-500 m-0">🏫 {t.venue}</p>
                  )}
                  {t.training_lead_name && (
                    <p className="text-xs text-slate-500 m-0">👤 Lead: {t.training_lead_name}</p>
                  )}
                  {t.district && (
                    <p className="text-xs text-slate-500 m-0">📍 {t.district}</p>
                  )}
                </div>

                {status !== 'upcoming' && (
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>
                        {status === 'completed'
                          ? 'Certified Cycle'
                          : `Active Day ${dayNum ?? '?'} of 6`}
                      </span>
                      <span>{pct}% Completed</span>
                    </div>
                    <ProgBar pct={pct} />
                    <div className="flex gap-1 pt-1">
                      {Array.from({ length: 6 }).map((_, i) => {
                        const n = i + 1;
                        const done = status === 'completed' || n < (dayNum ?? 0);
                        const isToday = status === 'active' && n === dayNum;
                        return (
                          <span
                            key={n}
                            className={`w-6 h-6 text-[10px] rounded-full flex items-center justify-center font-bold ${
                              done
                                ? 'bg-orange-500 text-white'
                                : isToday
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}
                          >
                            {n}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
