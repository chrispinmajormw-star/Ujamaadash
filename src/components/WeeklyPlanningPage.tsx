import React, { useState, useEffect } from 'react';
import { weeklyPlanningApi } from '../api';
import { User } from '../types';
import { Card, PageHeader, Btn, FSelect, FInput, FArea, Modal } from './SubComponents';
import { Send, RefreshCw, Plus, Trash2, Edit2, MapPin } from 'lucide-react';

interface WeeklyPlanningPageProps {
  user: User | null;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

const STATUS_OPTIONS = ['Not Submitted', 'Tentative', 'Fixed', 'No Activity'];
const REMARK_OPTIONS = ['', 'Done', 'Postponed', 'Cancelled'];
let localIdCounter = -1;

const STATUS_COLOR: Record<string, string> = {
  'Fixed': 'bg-emerald-600 text-white',
  'Tentative': 'bg-blue-500 text-white',
  'No Activity': 'bg-slate-300 text-slate-700',
  'Not Submitted': 'bg-slate-100 text-slate-400',
};
const REMARK_COLOR: Record<string, string> = {
  'Done': 'bg-blue-600 text-white',
  'Postponed': 'bg-emerald-600 text-white',
  'Cancelled': 'bg-red-500 text-white',
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const blankForm = () => ({ activity: '', description: '', venue: '', status: 'Tentative', remark: '' });

// Field Officer's data-entry view -- two separate Mon-Fri weeks. Adding or
// editing an activity opens a proper form instead of an inline row, since
// cramming Activity/Description/Venue/Status/Remark into one line was hard
// to read and made it unclear which dropdown was which.
export const WeeklyPlanningPage: React.FC<WeeklyPlanningPageProps> = ({ user, showToast }) => {
  const [days, setDays] = useState<any[]>([]);
  const [biweekStart, setBiweekStart] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<{ dayDate: string; idx: number | null } | null>(null);
  const [form, setForm] = useState(blankForm());

  const load = () => {
    setLoading(true);
    weeklyPlanningApi.getTable().then((data: any) => {
      if (data?.error) { showToast(data.error, 'warning'); setLoading(false); return; }
      setBiweekStart(data.biweekStart);
      setDays((data.days || []).map((d: any) => ({ ...d, activities: d.activities || [] })));
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = (dayDate: string) => { setForm(blankForm()); setEditing({ dayDate, idx: null }); };
  const openEdit = (dayDate: string, idx: number, a: any) => {
    setForm({ activity: a.activity || '', description: a.description || '', venue: a.venue || '', status: a.status || 'Tentative', remark: a.remark || '' });
    setEditing({ dayDate, idx });
  };

  // Sends the current biweek's activities to the server right away -- used
  // after every add/edit/delete so refreshing never loses anything, instead
  // of only saving when someone remembers to click "Submit Biweek".
  const persist = async (updatedDays: any[]) => {
    setSaving(true);
    try {
      const activities = updatedDays.flatMap(d => d.activities
        .filter((a: any) => a.venue && a.venue.trim())
        .map((a: any) => ({ dayDate: d.dayDate, activity: a.activity, description: a.description || null, venue: a.venue, status: a.status, remark: a.remark || null })));
      const data = await weeklyPlanningApi.submit(activities, biweekStart);
      if (data.error) { showToast(data.error, 'warning'); return; }
      load();
    } catch {
      showToast('Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveForm = () => {
    if (!form.venue.trim()) { showToast('Venue is required', 'warning'); return; }
    if (!editing) return;
    const updatedDays = days.map(d => {
      if (d.dayDate !== editing.dayDate) return d;
      const entry = { ...form, id: undefined as any, _localId: localIdCounter-- };
      if (editing.idx === null) return { ...d, activities: [...d.activities, entry] };
      return { ...d, activities: d.activities.map((a: any, i: number) => i === editing.idx ? { ...a, ...form } : a) };
    });
    setDays(updatedDays);
    setEditing(null);
    showToast(editing.idx === null ? 'Activity added' : 'Activity updated', 'success');
    persist(updatedDays);
  };

  const removeActivity = (dayDate: string, idx: number) => {
    const updatedDays = days.map(d => d.dayDate !== dayDate ? d : { ...d, activities: d.activities.filter((_: any, i: number) => i !== idx) });
    setDays(updatedDays);
    showToast('Activity removed', 'success');
    persist(updatedDays);
  };

  const saveAll = () => persist(days);

  if (!user || !['field_officer', 'district_coordinator'].includes(user.role)) {
    return <Card className="p-8 text-center text-sm text-black/50 dark:text-white/50">You don't have access to this page.</Card>;
  }

  const week1 = days.filter(d => d.week === 1);
  const week2 = days.filter(d => d.week === 2);

  const renderWeek = (weekDays: any[], label: string) => (
    <Card className="p-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-neutral-200 dark:border-slate-800">
        <h3 className="text-sm font-bold text-black dark:text-white m-0">{label}</h3>
      </div>
      <div className="divide-y divide-neutral-100 dark:divide-slate-800">
        {weekDays.map(d => (
          <div key={d.dayDate} className="p-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <span className="text-xs font-bold text-black dark:text-white">{d.dayName}</span>
                <span className="text-[11px] text-slate-400 ml-2">{formatDate(d.dayDate)}</span>
              </div>
              <button
                onClick={() => openAdd(d.dayDate)}
                className="flex items-center gap-1 text-[11px] font-bold text-[var(--brand-600)] hover:underline"
              >
                <Plus size={12} /> Add Activity
              </button>
            </div>
            {d.activities.length === 0 ? (
              <div className="text-[11px] text-slate-400 italic">No activities added yet.</div>
            ) : (
              <div className="space-y-2.5">
                {d.activities.map((a: any, idx: number) => (
                  <div key={a.id || a._localId} className="rounded-xl border border-neutral-200 dark:border-slate-700 p-3">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="text-sm font-bold text-black dark:text-white">
                        {idx + 1}. {a.activity || <span className="italic text-slate-400 font-normal">Untitled activity</span>}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => openEdit(d.dayDate, idx, a)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-black dark:hover:text-white">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => removeActivity(d.dayDate, idx)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-600">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    {a.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">{a.description}</p>
                    )}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <MapPin size={12} className="text-slate-400" />
                        {a.venue || <span className="italic text-red-400">Venue required</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLOR[a.status] || STATUS_COLOR['Tentative']}`}>
                          Status: {a.status}
                        </span>
                        {a.remark && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${REMARK_COLOR[a.remark] || ''}`}>
                            Remark: {a.remark}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );

  return (
    <div className="space-y-4 animate-fade-in-up">
      <PageHeader
        title="Planning & Scheduling"
        subtitle={`Biweek starting ${biweekStart ? formatDate(biweekStart) : '...'} -- each activity saves automatically as you add, edit, or remove it.`}
        actions={
          <div className="flex gap-2">
            <Btn size="sm" variant="secondary" onClick={load}><RefreshCw size={13} /> Refresh</Btn>
            <Btn size="sm" variant="secondary" onClick={saveAll} disabled={saving}>
              <Send size={13} /> {saving ? 'Saving…' : 'Save All'}
            </Btn>
          </div>
        }
      />
      {loading ? (
        <div className="text-center py-12 text-sm text-black/40 dark:text-white/40">Loading…</div>
      ) : days.length === 0 ? (
        <Card className="p-8 text-center text-sm text-black/40 dark:text-white/40">You are not assigned to a district yet.</Card>
      ) : (
        <>
          {renderWeek(week1, 'Week 1')}
          {renderWeek(week2, 'Week 2')}
        </>
      )}

      {editing && (
        <Modal title={editing.idx === null ? 'Add Activity' : 'Edit Activity'} onClose={() => setEditing(null)} width={480}>
          <div className="space-y-3">
            <FInput label="Activity Name" value={form.activity} onChange={(e: any) => setForm(p => ({ ...p, activity: e.target.value }))} placeholder="e.g. School Visit" />
            <FArea label="Description" value={form.description} onChange={(e: any) => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="What does this activity involve?" />
            <FInput label="Venue *" value={form.venue} onChange={(e: any) => setForm(p => ({ ...p, venue: e.target.value }))} placeholder="Where will this happen?" />
            <div className="grid grid-cols-2 gap-3">
              <FSelect label="Status" value={form.status} onChange={(e: any) => setForm(p => ({ ...p, status: e.target.value }))}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </FSelect>
              <FSelect label="Remark" value={form.remark} onChange={(e: any) => setForm(p => ({ ...p, remark: e.target.value }))}>
                {REMARK_OPTIONS.map(s => <option key={s} value={s}>{s || '—'}</option>)}
              </FSelect>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Btn variant="secondary" onClick={() => setEditing(null)}>Cancel</Btn>
              <Btn onClick={saveForm}>{editing.idx === null ? 'Add Activity' : 'Save Changes'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
