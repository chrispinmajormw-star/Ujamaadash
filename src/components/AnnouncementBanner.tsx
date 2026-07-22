import React, { useState, useEffect } from 'react';
import { announcementsApi } from '../api';
import { useCountry } from '../context/CountryContext';
import { Megaphone, X, Download, ChevronRight } from 'lucide-react';

export const AnnouncementBanner: React.FC<{ user: any }> = ({ user }) => {
  const [queue, setQueue] = useState<any[]>([]);
  const [index, setIndex] = useState(0);

  const { activeCountry } = useCountry();
  useEffect(() => {
    if (!user) return;
    announcementsApi.getActive(activeCountry).then(setQueue).catch(() => {});
  }, [user, activeCountry]);

  if (!user || queue.length === 0 || index >= queue.length) return null;

  const current = queue[index];

  const dismiss = async () => {
    try { await announcementsApi.dismiss(current.id); } catch {}
    setIndex(i => i + 1);
  };

  return (
    <div className="w-full bg-gradient-to-r from-[var(--brand-600)] to-[var(--brand-700)] text-white">
      <div className="max-w-full px-4 py-2.5 flex items-center gap-3">
        <Megaphone size={16} className="shrink-0" />
        <div className="flex-1 min-w-0 text-xs">
          <span className="font-bold">{current.title}</span>
          {current.body && (
            <span className="ml-2 opacity-90 hidden sm:inline">{current.body.slice(0, 120)}{current.body.length > 120 ? '…' : ''}</span>
          )}
        </div>
        {current.file_path && (
          <a
            href={announcementsApi.getDownloadUrl(current.file_path)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-bold bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-full shrink-0 transition-colors"
          >
            <Download size={12} /> {current.file_name || 'Attachment'}
          </a>
        )}
        {queue.length > 1 && (
          <span className="text-[10px] opacity-75 shrink-0">{index + 1}/{queue.length}</span>
        )}
        <button onClick={dismiss} className="shrink-0 p-1 rounded-full hover:bg-white/15 transition-colors" aria-label="Dismiss">
          <X size={15} />
        </button>
      </div>
    </div>
  );
};
