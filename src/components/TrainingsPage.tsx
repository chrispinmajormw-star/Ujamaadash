import React, { useState } from 'react';
import { Play, Calendar, Check } from 'lucide-react';
import { Training } from '../types';
import { Kicker, StatCard, FilterBar, Card, Badge, ProgBar } from './SubComponents';

const TRAININGS: Training[] = [
  { name: "ETT Cohort 12 — Lilongwe Urban", loc: "Lilongwe", venue: "Lilongwe Teachers College", trainers: "Grace Kamwendo, Peter Banda", dates: "28 Apr — 3 May 2026", pax: 32, day: 4, s: 'active' },
  { name: "ETT Cohort 13 — Blantyre South", loc: "Blantyre", venue: "Soche Community Centre", trainers: "Mary Chirwa, James Phiri", dates: "29 Apr — 4 May 2026", pax: 28, day: 3, s: 'active' },
  { name: "ETT Cohort 14 — Mzimba North", loc: "Mzimba", venue: "Mzimba District Education Office", trainers: "Agnes Nyirenda, Joseph Mhango", dates: "5 May — 10 May 2026", pax: 25, day: null, s: 'upcoming' },
  { name: "ETT Cohort 15 — Zomba Rural", loc: "Zomba", venue: "Zomba Rural District Hall", trainers: "Esther Mzumara, David Mkandawire", dates: "12 May — 17 May 2026", pax: 30, day: null, s: 'upcoming' },
  { name: "ETT Cohort 11 — Karonga CDSS", loc: "Karonga", venue: "Karonga Teachers Hub", trainers: "Grace Kamwendo, Fatsani Ngoma", dates: "14 Apr — 19 Apr 2026", pax: 26, day: 6, s: 'completed' },
  { name: "ETT Cohort 10 — Mangochi CDSS", loc: "Mangochi", venue: "Mangochi Centre", trainers: "Mary Chirwa, Peter Banda", dates: "7 Apr — 12 Apr 2026", pax: 34, day: 6, s: 'completed' },
];

export const TrainingsPage: React.FC = () => {
  const [filt, setFilt] = useState<string>("all");
  const visible = filt === "all" ? TRAININGS : TRAININGS.filter(t => t.s === filt);
  return (
    <div className="space-y-5 animate-fade-in-up">
      <div>
        <Kicker text="Capacity Engineering" />
        <h1 className="text-base font-bold text-black dark:text-white m-0">ETT Certified Trainings</h1>
        <p className="text-xs text-black dark:text-white opacity-80 mt-1 m-0">Certify and track teachers, community leaders, and safety champions.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={<Play size={18} className="text-blue-500" />} label="Active Cohorts" value={2} />
        <StatCard icon={<Calendar size={18} className="text-amber-500" />} label="Upcoming Projects" value={2} color="#d97706" />
        <StatCard icon={<Check size={18} className="text-emerald-500" />} label="Completed Cycles" value={2} color="#059669" />
      </div>

      <FilterBar options={["all", "active", "upcoming", "completed"].map(x => ({ v: x, l: x.toUpperCase() }))} active={filt} onChange={setFilt} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visible.map((t, idx) => {
          const pct = t.s === "completed" ? 100 : t.s === "upcoming" ? 0 : Math.round(((t.day || 1) / 6)*100);
          return (
            <Card key={idx} className="flex flex-col justify-between">
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-sm font-bold text-black dark:text-white m-0">{t.name}</h3>
                  <Badge text={t.s} className="uppercase shrink-0 text-[10px]" />
                </div>
                <p className="text-xs text-slate-400">📅 {t.dates} · pax: {t.pax} teachers</p>
                <p className="text-xs text-slate-500 m-0">🏫 Venue: {t.venue} · Lead: {t.trainers}</p>
              </div>

              {t.s !== "upcoming" && (
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{t.s === "completed" ? "Certified Cycle" : `Active Day ${t.day} of 6`}</span>
                    <span>{pct}% Completed</span>
                  </div>
                  <ProgBar pct={pct} />
                  <div className="flex gap-1 pt-1">
                    {Array.from({ length: 6 }).map((_, i) => {
                      const n = i + 1;
                      const done = t.s === "completed" || n < (t.day || 1);
                      const isToday = t.s === "active" && n === t.day;
                      return (
                        <span
                          key={n}
                          className={`w-6 h-6 text-[10px] rounded-full flex items-center justify-center font-bold ${
                            done ? 'bg-orange-500 text-white' : isToday ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
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
    </div>
  );
};
