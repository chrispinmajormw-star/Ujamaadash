import React, { useState } from 'react';
import { User } from '../types';
import { MyClustersPage } from './MyClustersPage';
import { TeacherChampionPage } from './TeacherChampionPage';
import { ClipboardCheck, BookOpen } from 'lucide-react';

interface TOTConsolePageProps {
  user: User | null;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const TOTConsolePage: React.FC<TOTConsolePageProps> = ({ user, showToast }) => {
  const [activeTab, setActiveTab] = useState<'clusters' | 'resources'>('clusters');

  const tabs = [
    { id: 'clusters', label: 'My Clusters', icon: ClipboardCheck },
    { id: 'resources', label: 'Teacher Resources', icon: BookOpen },
  ] as const;

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-base font-bold text-black dark:text-white m-0 mb-3">TOT Console</h1>
        <div className="flex gap-1 border-b border-neutral-200 dark:border-slate-800 pb-0 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t-lg border-b-2 transition-all -mb-px shrink-0 ${
                activeTab === t.id
                  ? 'border-[var(--brand-500)] text-[var(--brand-600)] dark:text-[var(--brand-400)] bg-[var(--brand-50)] dark:bg-[var(--brand-950)]/20'
                  : 'border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'
              }`}
            >
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'clusters' && <MyClustersPage user={user} showToast={showToast} />}
      {activeTab === 'resources' && <TeacherChampionPage user={user} />}
    </div>
  );
};
