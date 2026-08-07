import React, { useState, useEffect } from 'react';
import { weeklyPlanningApi } from '../api';
import { User } from '../types';
import { Card, PageHeader, Btn, FSelect, FInput, FArea, Modal } from './SubComponents';
import { ChevronDown, ChevronRight, RefreshCw, FileText, Trash2, MapPin, Edit2 } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PlanningOfficerWeeklyViewProps {
  user: User | null;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

const STATUS_OPTIONS = ['Not Submitted', 'Tentative', 'Fixed', 'No Activity'];
const REMARK_OPTIONS = ['', 'Done', 'Postponed', 'Cancelled'];
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
const STATUS_PIE_COLORS: Record<string, string> = {
  'Fixed': '#059669',
  'Tentative': '#3b82f6',
  'No Activity': '#94a3b8',
  'Not Submitted': '#e2e8f0',
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Planning Officer's monitoring + editing view -- every district's biweek,
// live analytics on top, and the ability to edit or delete any activity via
// a clean modal form, matching the Field Officer's own page instead of
// cramming everything into inline inputs on the card itself.
export const PlanningOfficerWeeklyView: React.FC<PlanningOfficerWeeklyViewProps> = ({ user, showToast }) => {
  const [districts, setDistricts] = useState<Record<string, any[]>>({});
  const [stats, setStats] = useState<any>(null);
  const [biweekStart, setBiweekStart] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ activity: '', description: '', venue: '', status: 'Tentative', remark: '', comment: '' });

  const load = () => {
    setLoading(true);
    Promise.all([weeklyPlanningApi.getTable(), weeklyPlanningApi.getStats()]).then(([table, statsData]: any) => {
      if (table?.error) { showToast(table.error, 'warning'); }
      setBiweekStart(table.biweekStart || '');
      setDistricts(table.districts || {});
      setStats(statsData?.error ? null : statsData);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleDistrict = (name: string) => setExpanded(prev => ({ ...prev, [name]: !prev[name] }));

  const openEdit = (a: any) => {
    setForm({
      activity: a.activity || '', description: a.description || '', venue: a.venue || '',
      status: a.status || 'Tentative', remark: a.remark || '', comment: a.po_comment || '',
    });
    setEditing(a);
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      const data = await weeklyPlanningApi.updateActivity(editing.id, {
        activity: form.activity, description: form.description, venue: form.venue,
        status: form.status, remark: form.remark, poComment: form.comment,
      });
      if (data.error) { showToast(data.error, 'warning'); return; }
      showToast('Activity updated', 'success');
      setEditing(null);
      load();
    } catch {
      showToast('Failed to update', 'error');
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm('Delete this activity?')) return;
    try {
      await weeklyPlanningApi.deleteActivity(id);
      showToast('Deleted', 'success');
      load();
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const data = await weeklyPlanningApi.generateReport(biweekStart);
      if (data.error) { showToast(data.error, 'warning'); return; }
      showToast(`Report sent to ${data.notified} Admin(s)`, 'success');
    } catch {
      showToast('Failed to generate report', 'error');
    } finally {
      setGenerating(false);
    }
  };

  if (!user || !['planning_officer', 'admin', 'program_manager'].includes(user.role)) {
    return <Card className="p-8 text-center text-sm text-black/50 dark:text-white/50">You don't have access to this page.</Card>;
  }

  const canEdit = user.role === 'planning_officer';
  const districtNames = Object.keys(districts).sort();
  const statusPieData = stats ? stats.byStatus.map((s: any) => ({ name: s.status, value: Number(s.count) })) : [];
  const districtBarData = stats ? stats.byDistrict.map((d: any) => ({ name: d.district, count: Number(d.count) })) : [];

  return (
    <div className="space-y-4 animate-fade-in-up">
      <PageHeader
        title="Planning & Scheduling"
        subtitle={`Live view of every district's biweek starting ${biweekStart ? formatDate(biweekStart) : '...'}.`}
        actions={
          <div className="flex gap-2">
            <Btn size="sm" variant="secondary" onClick={load}><RefreshCw size={13} /> Refresh</Btn>
            {user.role === 'planning_officer' && (
              <Btn size="sm" variant="primary" onClick={generateReport} disabled={generating}>
                <FileText size={13} /> {generating ? 'Generating…' : 'Generate Biweekly Report'}
              </Btn>
            )}
          </div>
        }
      />

      {stats && (stats.byStatus.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card className="p-4">
            <h3 className="text-xs font-bold text-black dark:text-white mb-2">Activities by Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {statusPieData.map((entry: any, i: number) => (
                    <Cell key={i} fill={STATUS_PIE_COLORS[entry.name] || '#cbd5e1'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-4">
            <h3 className="text-xs font-bold text-black dark:text-white mb-2">Activities by District</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={districtBarData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--brand-500, #f97316)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-sm text-black/40 dark:text-white/40">Loading…</div>
      ) : districtNames.length === 0 ? (
        <Card className="p-8 text-center text-sm text-black/40 dark:text-white/40">No districts found.</Card>
      ) : (
        <Card className="p-0 overflow-hidden divide-y divide-neutral-100 dark:divide-slate-800">
          {districtNames.map(name => {
            const dayCount = districts[name].reduce((sum, d) => sum + d.activities.length, 0);
            return (
              <div key={name}>
                <button
                  onClick={() => toggleDistrict(name)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-900/40"
                >
                  <span className="text-sm font-bold text-black dark:text-white">{name}</span>
                  <span className="flex items-center gap-2 text-[11px] text-slate-400">
                    {dayCount} activit{dayCount === 1 ? 'y' : 'ies'}
                    {expanded[name] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                </button>
                {expanded[name] && (
                  <div className="px-4 pb-4 space-y-3">
                    {districts[name].map((d: any) => d.activities.length > 0 && (
                      <div key={d.dayDate}>
                        <div className="text-[11px] font-bold text-slate-500 mb-1">{d.dayName} — {formatDate(d.dayDate)}</div>
                        <div className="space-y-2">
                          {d.activities.map((a: any, aidx: number) => (
                            <div key={a.id} className="rounded-xl border border-neutral-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-900/40">
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <div className="text-sm font-bold text-black dark:text-white">
                                  {aidx + 1}. {a.activity || <span className="italic text-slate-400 font-normal">Untitled activity</span>}
                                </div>
                                {canEdit && (
                                  <div className="flex gap-1 shrink-0">
                                    <button onClick={() => openEdit(a)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-black dark:hover:text-white">
                                      <Edit2 size={13} />
                                    </button>
                                    <button onClick={() => remove(a.id)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-600">
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                )}
                              </div>
                              {a.description && <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{a.description}</p>}
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                                  <MapPin size={12} className="text-slate-400" />
                                  {a.venue || '—'}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLOR[a.status] || STATUS_COLOR['Not Submitted']}`}>Status: {a.status}</span>
                                  {a.remark && <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${REMARK_COLOR[a.remark] || ''}`}>Remark: {a.remark}</span>}
                                </div>
                              </div>
                              {a.po_comment && <p className="mt-2 text-[11px] italic text-amber-700 dark:text-amber-400">Comment: {a.po_comment}</p>}
                              {a.updated_by && <div className="mt-1 text-[9px] text-amber-600">Edited by Planning Officer</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </Card>
      )}

      {editing && (
        <Modal title="Edit Activity" onClose={() => setEditing(null)} width={480}>
          <div className="space-y-3">
            <FInput label="Activity Name" value={form.activity} onChange={(e: any) => setForm(p => ({ ...p, activity: e.target.value }))} />
            <FArea label="Description" value={form.description} onChange={(e: any) => setForm(p => ({ ...p, description: e.target.value }))} rows={3} />
            <FInput label="Venue" value={form.venue} onChange={(e: any) => setForm(p => ({ ...p, venue: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <FSelect label="Status" value={form.status} onChange={(e: any) => setForm(p => ({ ...p, status: e.target.value }))}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </FSelect>
              <FSelect label="Remark" value={form.remark} onChange={(e: any) => setForm(p => ({ ...p, remark: e.target.value }))}>
                {REMARK_OPTIONS.map(s => <option key={s} value={s}>{s || '—'}</option>)}
              </FSelect>
            </div>
            <FArea label="Comment (Planning Officer)" value={form.comment} onChange={(e: any) => setForm(p => ({ ...p, comment: e.target.value }))} rows={2} placeholder="Your own note on this activity..." />
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Btn variant="secondary" onClick={() => setEditing(null)}>Cancel</Btn>
              <Btn onClick={saveEdit}>Save Changes</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
