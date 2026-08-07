import React, { useState, useEffect } from 'react';
import { gbvCasesApi } from '../api';
import { User } from '../types';
import { Card, PageHeader, Badge } from './SubComponents';
import { Lock, GripVertical, Calendar, MapPin } from 'lucide-react';

interface CaseKanbanBoardProps {
  user: User | null;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

const STAGES = [
  { id: 'reported', label: 'Reported', color: '#64748b' },
  { id: 'under_review', label: 'Under Review', color: '#2563eb' },
  { id: 'referred', label: 'Referred to Police/Health', color: '#c2410c' },
  { id: 'closed', label: 'Closed', color: '#059669' },
];

const formatDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: 'short' });

// Drag-and-drop Kanban board for GBV case management. Each card shows only
// what its viewer is allowed to see -- the backend already strips personal
// details (name, contact, village) for anyone who isn't the assigned case
// worker or an Admin, so this component just reflects whatever it's given.
export const CaseKanbanBoard: React.FC<CaseKanbanBoardProps> = ({ user, showToast }) => {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragCaseId, setDragCaseId] = useState<number | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    gbvCasesApi.getKanban().then((data: any) => {
      setCases(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const moveCase = async (id: number, stage: string) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, kanban_stage: stage } : c));
    try {
      const data = await gbvCasesApi.moveStage(id, stage);
      if (data.error) { showToast(data.error, 'warning'); load(); return; }
    } catch {
      showToast('Failed to move case', 'error');
      load();
    }
  };

  const onDrop = (stageId: string) => {
    if (dragCaseId == null) return;
    const c = cases.find(x => x.id === dragCaseId);
    if (c && c.kanban_stage !== stageId) {
      if (!c.canSeePII) { showToast("You can only move cases assigned to you", 'warning'); }
      else moveCase(dragCaseId, stageId);
    }
    setDragCaseId(null);
    setDragOverStage(null);
  };

  if (!user || !['sasa_officer', 'admin', 'program_manager'].includes(user.role)) {
    return <Card className="p-8 text-center text-sm text-black/50 dark:text-white/50">You don't have access to this page.</Card>;
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <PageHeader
        title="Case Management Board"
        subtitle="Drag a case card between stages to update its progress. Cases not assigned to you show limited detail to protect survivor privacy."
      />

      {loading ? (
        <div className="text-center py-12 text-sm text-black/40 dark:text-white/40">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STAGES.map(stage => {
            const stageCases = cases.filter(c => c.kanban_stage === stage.id);
            return (
              <div
                key={stage.id}
                onDragOver={e => { e.preventDefault(); setDragOverStage(stage.id); }}
                onDragLeave={() => setDragOverStage(null)}
                onDrop={() => onDrop(stage.id)}
                className={`rounded-xl border-2 transition-all ${dragOverStage === stage.id ? 'border-[var(--brand-500)] bg-[var(--brand-50)] dark:bg-[var(--brand-950)]/20' : 'border-transparent'}`}
              >
                <div className="flex items-center justify-between px-2 py-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
                    <span className="text-xs font-bold text-black dark:text-white">{stage.label}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{stageCases.length}</span>
                </div>
                <div className="space-y-2 min-h-[80px] px-1">
                  {stageCases.map(c => (
                    <div
                      key={c.id}
                      draggable={c.canSeePII}
                      onDragStart={() => setDragCaseId(c.id)}
                      onDragEnd={() => { setDragCaseId(null); setDragOverStage(null); }}
                      className={`rounded-lg border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 shadow-sm ${c.canSeePII ? 'cursor-grab' : 'cursor-not-allowed opacity-80'}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-xs font-bold text-black dark:text-white">{c.gbv_type}</span>
                        {c.canSeePII ? <GripVertical size={13} className="text-slate-300 shrink-0" /> : <Lock size={13} className="text-slate-400 shrink-0" />}
                      </div>
                      {c.canSeePII ? (
                        <div className="text-[11px] text-slate-600 dark:text-slate-300 mb-1">{c.full_name || 'Anonymous'}</div>
                      ) : (
                        <div className="text-[11px] italic text-slate-400 mb-1">Restricted -- assigned worker only</div>
                      )}
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                        <MapPin size={10} /> {c.district || '—'}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1"><Calendar size={10} /> {c.submitted_at ? formatDate(c.submitted_at) : '—'}</span>
                        {c.assigned_to_name && <Badge text={c.assigned_to_name} />}
                      </div>
                    </div>
                  ))}
                  {stageCases.length === 0 && (
                    <div className="text-[11px] text-slate-400 text-center py-4">No cases here</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
