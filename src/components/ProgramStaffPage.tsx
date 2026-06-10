import React, { useState } from 'react';
import {
  BookOpen, CheckCircle, Clock, Play, Star, ChevronRight,
  Users, Target, Award, FileText, Layers
} from 'lucide-react';
import { Card, Kicker, Btn, ProgBar, Badge, StatCard, FilterBar } from './SubComponents';
import { HIM_SESSIONS, GESD_SESSIONS, CLUSTERS } from '../data';
import { Report, User } from '../types';

interface Props {
  user: User;
  reports: Report[];
  setPage: (p: string) => void;
}

export const ProgramStaffPage: React.FC<Props> = ({ user, reports, setPage }) => {
  const [curriculum, setCurriculum] = useState<'HIM' | 'GESD'>('HIM');
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const sessions = curriculum === 'HIM' ? HIM_SESSIONS : GESD_SESSIONS;
  const myReports = reports.filter(r => r.district === user.district);
  const deliveredSessions = new Set(myReports.map(r => r.session));

  const districtClusters = CLUSTERS.filter(c => c.district === user.district);
  const totalStudents = districtClusters.reduce((a, c) => a + c.students, 0);

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <Kicker text="Curriculum & Delivery" />
          <h1 className="text-base font-bold text-black dark:text-white m-0">Program Staff Workspace</h1>
          <p className="text-xs text-slate-500 mt-1 m-0">
            {user.district} District — Track sessions, curricula, and delivery progress.
          </p>
        </div>
        <Btn onClick={() => setPage('submit')}>
          <FileText size={13} className="inline mr-1" /> Log Session
        </Btn>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<Users size={18} className="text-blue-500" />} label="Students Reached" value={totalStudents.toLocaleString()} />
        <StatCard icon={<CheckCircle size={18} className="text-emerald-500" />} label="Sessions Logged" value={myReports.length} color="#059669" />
        <StatCard icon={<Layers size={18} className="text-orange-500" />} label="Clusters" value={districtClusters.length} />
        <StatCard icon={<Award size={18} className="text-purple-500" />} label="Approved" value={myReports.filter(r => r.status === 'approved').length} color="#6d28d9" />
      </div>

      {/* Cluster progress */}
      {districtClusters.length > 0 && (
        <Card>
          <h3 className="text-sm font-bold text-black dark:text-white mb-3">Cluster Delivery Progress</h3>
          <div className="space-y-3">
            {districtClusters.map(c => (
              <div key={c.id}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-black dark:text-white">{c.name}</span>
                  <span className="text-slate-500">{c.schools} schools · {c.trained} trained</span>
                </div>
                <ProgBar pct={c.progress} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Curriculum selector */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-black dark:text-white">Curriculum Sessions</h3>
          <div className="flex gap-1">
            {(['HIM', 'GESD'] as const).map(c => (
              <button
                key={c}
                onClick={() => setCurriculum(c)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  curriculum === c
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {sessions.map((session, idx) => {
            const isDelivered = [...deliveredSessions].some((s: any) => (s as string).includes(session.num));
            const isExpanded = expandedSession === session.num;
            return (
              <div
                key={session.num}
                className={`rounded-xl border transition-all ${
                  isDelivered
                    ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20'
                    : 'border-neutral-200 dark:border-slate-800 bg-white dark:bg-[#0f1623]'
                }`}
              >
                <button
                  className="w-full flex items-center gap-3 p-3 text-left"
                  onClick={() => setExpandedSession(isExpanded ? null : session.num)}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isDelivered ? 'bg-emerald-500 text-white' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600'
                  }`}>
                    {isDelivered ? <CheckCircle size={14} /> : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-black dark:text-white">{session.num}: {session.title}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">⏱ {session.dur}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isDelivered && <Badge text="Delivered" color="#059669" bg="#d1fae5" />}
                    <ChevronRight size={14} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-3">{session.desc}</p>

                    {session.pledge && (
                      <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-3 border-l-4 border-orange-500">
                        <div className="text-[10px] font-bold text-orange-600 uppercase mb-1">Pledge / Chant</div>
                        <p className="text-xs text-orange-800 dark:text-orange-300 italic whitespace-pre-line leading-relaxed">{session.pledge}</p>
                      </div>
                    )}

                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Learning Objectives</div>
                      <ul className="space-y-1.5">
                        {session.objectives.map((obj, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-black dark:text-white">
                            <Star size={10} className="text-orange-500 shrink-0 mt-0.5" />
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {!isDelivered && (
                      <Btn size="sm" onClick={() => setPage('submit')}>
                        <Play size={11} className="inline mr-1" /> Log This Session
                      </Btn>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent district reports */}
      <Card>
        <h3 className="text-sm font-bold text-black dark:text-white mb-3">Recent District Reports</h3>
        {myReports.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No reports for {user.district} yet.</p>
        ) : (
          <div className="space-y-2">
            {myReports.slice(0, 5).map(r => (
              <div key={r.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-neutral-100 dark:border-slate-800">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-black dark:text-white truncate">{r.school}</div>
                  <div className="text-[10px] text-slate-500">{r.curriculum} · {r.session?.split(':')[0]} · {r.submitted_at}</div>
                </div>
                <div className="text-[10px] text-slate-500 shrink-0">👦{r.boys} 👧{r.girls}</div>
                <Badge
                  text={r.status}
                  color={r.status === 'approved' ? '#059669' : r.status === 'pending' ? '#d97706' : '#dc2626'}
                  bg={r.status === 'approved' ? '#d1fae5' : r.status === 'pending' ? '#fef3c7' : '#fee2e2'}
                />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
