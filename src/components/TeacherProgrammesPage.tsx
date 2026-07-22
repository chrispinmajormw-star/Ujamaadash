import React, { useState } from 'react';
import { User } from '../types';
import { SessionMonitoringPage } from './SessionMonitoringPage';
import { ClusterSchoolSessionForm } from './ClusterSchoolSessionForm';
import { GraduationCap } from 'lucide-react';

interface TeacherProgrammesPageProps {
  user: User | null;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

const TABS = [
  {
    id: 'stot_orientation', label: 'STOT Orientation',
    title: 'STOT Orientation Training', subtitle: 'Senior TOT orientation and piloting sessions',
    plannedLabel: 'Sessions Planned', conductedLabel: 'Sessions Conducted',
  },
  {
    id: 'stot_tracker', label: 'STOT Sessions',
    title: 'ETT Sessions — STOT Tracker', subtitle: 'Senior TOT performance monitoring',
    plannedLabel: 'Sessions Planned', conductedLabel: 'Sessions Conducted',
  },
  {
    id: 'tot_training', label: 'TOT Training',
    title: 'TOT Training Sessions', subtitle: 'TOT performance monitoring across regions',
    plannedLabel: 'Sessions Planned', conductedLabel: 'Sessions Conducted',
  },
  {
    id: 'cluster_anchors', label: 'Cluster Anchors',
    title: 'Cluster Anchors (PEA) Sessions', subtitle: 'Cluster anchor allocation and engagement monitoring',
    plannedLabel: 'Clusters Allocated', conductedLabel: 'Clusters Engaged',
  },
] as const;

export const TeacherProgrammesPage: React.FC<TeacherProgrammesPageProps> = ({ user, showToast }) => {
  const [activeTab, setActiveTab] = useState<string>(TABS[0].id);
  const current = TABS.find(t => t.id === activeTab) || TABS[0];

  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap size={18} className="text-[var(--brand-600)]" />
          <h1 className="text-base font-bold text-black dark:text-white m-0">Teacher Programmes</h1>
        </div>
        <div className="flex gap-1 border-b border-neutral-200 dark:border-slate-800 pb-0 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-lg border-b-2 transition-all -mb-px shrink-0 ${
                activeTab === t.id
                  ? 'border-[var(--brand-500)] text-[var(--brand-600)] dark:text-[var(--brand-400)] bg-[var(--brand-50)] dark:bg-[var(--brand-950)]/20'
                  : 'border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'cluster_anchors' ? (
        <ClusterSchoolSessionForm user={user} showToast={showToast} />
      ) : (
        <SessionMonitoringPage
          key={current.id}
          user={user}
          showToast={showToast}
          recordType={current.id}
          title={current.title}
          subtitle={current.subtitle}
          plannedLabel={current.plannedLabel}
          conductedLabel={current.conductedLabel}
        />
      )}
    </div>
  );
};
