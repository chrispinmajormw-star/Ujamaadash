import React, { useState } from 'react';
import { User } from '../types';
import { UsersPage } from './UsersPage';
import { RegionalViewPage } from './RegionalViewPage';
import { FollowupConsistencyPage } from './FollowupConsistencyPage';
import { CasesByDistrictChart } from './CasesByDistrictChart';
import { DataCompletenessPage } from './DataCompletenessPage';
import { Users, LayoutGrid } from 'lucide-react';

interface AdminConsolePageProps {
  user: User | null;
  users: any[];
  setUsers: (u: any[]) => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  refreshUsers: () => void;
}

const TOP_TABS = [
  { id: 'staff', label: 'Staff & Access', icon: Users },
  { id: 'oversight', label: 'Oversight', icon: LayoutGrid },
] as const;

export const AdminConsolePage: React.FC<AdminConsolePageProps> = ({ user, users, setUsers, showToast, refreshUsers }) => {
  const [activeTab, setActiveTab] = useState<typeof TOP_TABS[number]['id']>('staff');

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-base font-bold text-black dark:text-white m-0 mb-3">Admin Console</h1>
        <div className="flex gap-1 border-b border-neutral-200 dark:border-slate-800 pb-0 overflow-x-auto">
          {TOP_TABS.map(t => (
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

      {activeTab === 'staff' && (
        <UsersPage user={user} users={users} setUsers={setUsers} showToast={showToast} refreshUsers={refreshUsers} />
      )}

      {activeTab === 'oversight' && (
        <div className="space-y-6">
          <RegionalViewPage user={user} showToast={showToast} />
          <FollowupConsistencyPage user={user} showToast={showToast} />
          <CasesByDistrictChart />
          <DataCompletenessPage />
        </div>
      )}
    </div>
  );
};
