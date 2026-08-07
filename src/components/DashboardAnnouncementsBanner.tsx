import React, { useState, useEffect } from 'react';
import { announcementsApi } from '../api';
import { Megaphone, X } from 'lucide-react';

export const DashboardAnnouncementsBanner: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [dismissed, setDismissed] = useState<number[]>([]);

  useEffect(() => {
    // Intentionally NOT filtered by country -- dashboard announcements are global.
    announcementsApi.getDashboardVisible().then((res: any) => setItems(Array.isArray(res) ? res : [])).catch(() => {});
  }, []);

  const visible = items.filter(a => !dismissed.includes(a.id));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2 mb-2">
      {visible.map(a => (
        <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg border border-[var(--brand-200)] dark:border-[var(--brand-900)]/40 bg-[var(--brand-50)] dark:bg-[var(--brand-950)]/20">
          <Megaphone size={16} className="text-[var(--brand-600)] shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-black dark:text-white">{a.title}</div>
            {a.body && <div className="text-xs text-black/70 dark:text-white/70 mt-0.5 whitespace-pre-line">{a.body}</div>}
          </div>
          <button
            type="button"
            onClick={() => setDismissed(prev => [...prev, a.id])}
            className="text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white shrink-0"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
