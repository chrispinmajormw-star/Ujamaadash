import React, { useState, useEffect } from 'react';
import { mapClustersApi, mapSchoolsApi } from '../api';
import { User } from '../types';
import { Card, PageHeader, Btn, Modal, FInput, FSelect, FArea } from './SubComponents';
import { Edit2, MapPin, School } from 'lucide-react';

interface DistrictDataEditPageProps {
  user: User | null;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const DistrictDataEditPage: React.FC<DistrictDataEditPageProps> = ({ user, showToast }) => {
  const [clusters, setClusters] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCluster, setEditingCluster] = useState<any | null>(null);
  const [editingSchool, setEditingSchool] = useState<any | null>(null);
  const [clusterForm, setClusterForm] = useState<any>({});
  const [schoolForm, setSchoolForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const district = user?.district || '';

  const load = () => {
    setLoading(true);
    Promise.all([
      mapClustersApi.getAll({ district }).catch(() => []),
      mapSchoolsApi.getAll({ district }).catch(() => []),
    ]).then(([c, s]) => {
      setClusters(Array.isArray(c) ? c : []);
      setSchools(Array.isArray(s) ? s : []);
      setLoading(false);
    });
  };

  useEffect(() => { if (district) load(); }, [district]);

  const openEditCluster = (c: any) => {
    setClusterForm({
      name: c.name || '', lead: c.lead || '', lead_phone: c.lead_phone || '', lead_email: c.lead_email || '',
      students: c.students ?? 0, boys: c.boys ?? 0, girls: c.girls ?? 0, trained: c.trained ?? 0,
      tots: c.tots ?? 0, stots: c.stots ?? 0, teachbacks: c.teachbacks ?? 0, ground_truth: c.ground_truth || '',
    });
    setEditingCluster(c);
  };

  const openEditSchool = (s: any) => {
    setSchoolForm({
      name: s.name || '', status: s.status || 'active', cluster_id: s.cluster_id || '',
      headteacher: s.headteacher || '', headteacher_phone: s.headteacher_phone || '',
      him_running: !!s.him_running, gesd_running: !!s.gesd_running,
      boys_enrolled: s.boys_enrolled ?? 0, girls_enrolled: s.girls_enrolled ?? 0,
      trained_teachers: s.trained_teachers ?? 0, tots: s.tots ?? 0, stots: s.stots ?? 0, teachbacks: s.teachbacks ?? 0,
      sessions_completed: s.sessions_completed ?? 0, sessions_planned: s.sessions_planned ?? 0,
      last_session_date: s.last_session_date || '', ett_trained: !!s.ett_trained,
      verification_notes: s.verification_notes || '', notes: s.notes || '',
    });
    setEditingSchool(s);
  };

  const saveCluster = async () => {
    if (!editingCluster) return;
    setSaving(true);
    try {
      const data = await mapClustersApi.update(editingCluster.id, clusterForm);
      if (data.error) { showToast(data.error, 'warning'); return; }
      showToast('Cluster updated', 'success');
      setEditingCluster(null);
      load();
    } catch { showToast('Failed to update cluster', 'error'); }
    finally { setSaving(false); }
  };

  const saveSchool = async () => {
    if (!editingSchool) return;
    setSaving(true);
    try {
      // Empty strings are not valid values for the date/number columns
      // underneath (cluster_id, last_session_date) -- send null instead,
      // which the backend already knows how to handle.
      const payload = {
        ...schoolForm,
        cluster_id: schoolForm.cluster_id === '' ? null : schoolForm.cluster_id,
        last_session_date: schoolForm.last_session_date === '' ? null : schoolForm.last_session_date,
      };
      const data = await mapSchoolsApi.update(editingSchool.id, payload);
      if (data.error) { showToast(data.error, 'warning'); return; }
      showToast('School updated', 'success');
      setEditingSchool(null);
      load();
    } catch { showToast('Failed to update school', 'error'); }
    finally { setSaving(false); }
  };

  const cc = (k: string) => (e: any) => setClusterForm((p: any) => ({ ...p, [k]: e.target.value }));
  const sc = (k: string) => (e: any) => setSchoolForm((p: any) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4 animate-fade-in-up">
      <PageHeader
        title="Clusters & Schools"
        subtitle={`Edit contact, programme, and verification-notes info for clusters and schools in ${district || 'your district'}. Location coordinates and formal verification status are managed by Cartographers/Admins only.`}
      />

      {loading ? (
        <div className="text-center py-12 text-sm text-black/40 dark:text-white/40">Loading…</div>
      ) : (
        <>
          <Card className="p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-200 dark:border-slate-800 flex items-center gap-2">
              <MapPin size={14} className="text-[var(--brand-600)]" />
              <h3 className="text-sm font-bold text-black dark:text-white m-0">Clusters ({clusters.length})</h3>
            </div>
            <div className="divide-y divide-neutral-100 dark:divide-slate-800">
              {clusters.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">No clusters found in your district.</div>
              ) : clusters.map(c => (
                <div key={c.id} className="flex items-center justify-between px-4 py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-black dark:text-white truncate">{c.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Lead: {c.lead || '—'} · {c.students ?? 0} learners
                    </div>
                  </div>
                  <Btn size="sm" variant="secondary" onClick={() => openEditCluster(c)}>
                    <Edit2 size={12} /> Edit
                  </Btn>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-200 dark:border-slate-800 flex items-center gap-2">
              <School size={14} className="text-[var(--brand-600)]" />
              <h3 className="text-sm font-bold text-black dark:text-white m-0">Schools ({schools.length})</h3>
            </div>
            <div className="divide-y divide-neutral-100 dark:divide-slate-800">
              {schools.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">No schools found in your district.</div>
              ) : schools.map(s => (
                <div key={s.id} className="flex items-center justify-between px-4 py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-black dark:text-white truncate">{s.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {s.cluster_name || 'Cluster —'} · Head: {s.headteacher || '—'} · {s.status}
                    </div>
                  </div>
                  <Btn size="sm" variant="secondary" onClick={() => openEditSchool(s)}>
                    <Edit2 size={12} /> Edit
                  </Btn>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {editingCluster && (
        <Modal title={`Edit Cluster — ${editingCluster.name}`} onClose={() => setEditingCluster(null)} width={520}>
          <div className="space-y-3">
            <FInput label="Cluster Name" value={clusterForm.name} onChange={cc('name')} />
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Lead Coordinator" value={clusterForm.lead} onChange={cc('lead')} />
              <FInput label="Lead Phone" value={clusterForm.lead_phone} onChange={cc('lead_phone')} />
            </div>
            <FInput label="Lead Email" value={clusterForm.lead_email} onChange={cc('lead_email')} />
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 pt-1">Programme Numbers</div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Learners (Boys)" type="number" value={clusterForm.boys} onChange={cc('boys')} />
              <FInput label="Learners (Girls)" type="number" value={clusterForm.girls} onChange={cc('girls')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Total Students" type="number" value={clusterForm.students} onChange={cc('students')} />
              <FInput label="Teachers Trained" type="number" value={clusterForm.trained} onChange={cc('trained')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label="TOTs" type="number" value={clusterForm.tots} onChange={cc('tots')} />
              <FInput label="STOTs" type="number" value={clusterForm.stots} onChange={cc('stots')} />
            </div>
            <FInput label="Teachbacks" type="number" value={clusterForm.teachbacks} onChange={cc('teachbacks')} />
            <FArea label="Verification / Ground Truth Notes" value={clusterForm.ground_truth} onChange={cc('ground_truth')} rows={3}
              placeholder="Notes from your own knowledge of this cluster -- formal verification status is set by the Cartographer/Admin." />
            <div className="flex gap-2 justify-end pt-2">
              <Btn size="sm" variant="ghost" onClick={() => setEditingCluster(null)}>Cancel</Btn>
              <Btn size="sm" variant="primary" onClick={saveCluster} disabled={saving}>Save</Btn>
            </div>
          </div>
        </Modal>
      )}

      {editingSchool && (
        <Modal title={`Edit School — ${editingSchool.name}`} onClose={() => setEditingSchool(null)} width={560}>
          <div className="space-y-3">
            <FInput label="School Name" value={schoolForm.name} onChange={sc('name')} />
            <div className="grid grid-cols-2 gap-3">
              <FSelect label="Status" value={schoolForm.status} onChange={sc('status')}>
                {['active', 'inactive', 'planned'].map(o => <option key={o} value={o}>{o}</option>)}
              </FSelect>
              <FSelect label="Cluster" value={schoolForm.cluster_id} onChange={sc('cluster_id')}>
                <option value="">— Select Cluster —</option>
                {clusters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </FSelect>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Headteacher Name" value={schoolForm.headteacher} onChange={sc('headteacher')} />
              <FInput label="Headteacher Phone" value={schoolForm.headteacher_phone} onChange={sc('headteacher_phone')} />
            </div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 pt-1">Curriculum</div>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 p-2 rounded-lg border border-neutral-200 dark:border-slate-700 cursor-pointer">
                <input type="checkbox" checked={schoolForm.him_running} onChange={e => setSchoolForm((p: any) => ({ ...p, him_running: e.target.checked }))} className="accent-[var(--brand)]" />
                HIM Running
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 p-2 rounded-lg border border-neutral-200 dark:border-slate-700 cursor-pointer">
                <input type="checkbox" checked={schoolForm.gesd_running} onChange={e => setSchoolForm((p: any) => ({ ...p, gesd_running: e.target.checked }))} className="accent-[var(--brand)]" />
                GESD Running
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 p-2 rounded-lg border border-neutral-200 dark:border-slate-700 cursor-pointer">
                <input type="checkbox" checked={schoolForm.ett_trained} onChange={e => setSchoolForm((p: any) => ({ ...p, ett_trained: e.target.checked }))} className="accent-[var(--brand)]" />
                ETT Trained
              </label>
            </div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 pt-1">Enrollment & Staffing</div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Boys Enrolled" type="number" value={schoolForm.boys_enrolled} onChange={sc('boys_enrolled')} />
              <FInput label="Girls Enrolled" type="number" value={schoolForm.girls_enrolled} onChange={sc('girls_enrolled')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Trained Teachers" type="number" value={schoolForm.trained_teachers} onChange={sc('trained_teachers')} />
              <FInput label="Teachbacks" type="number" value={schoolForm.teachbacks} onChange={sc('teachbacks')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label="TOTs" type="number" value={schoolForm.tots} onChange={sc('tots')} />
              <FInput label="STOTs" type="number" value={schoolForm.stots} onChange={sc('stots')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Sessions Completed" type="number" value={schoolForm.sessions_completed} onChange={sc('sessions_completed')} />
              <FInput label="Sessions Planned" type="number" value={schoolForm.sessions_planned} onChange={sc('sessions_planned')} />
            </div>
            <FInput label="Last Session Date" type="date" value={schoolForm.last_session_date} onChange={sc('last_session_date')} />
            <FArea label="Verification Notes" value={schoolForm.verification_notes} onChange={sc('verification_notes')} rows={2}
              placeholder="Notes from your own knowledge -- formal verification status is set by the Cartographer/Admin/Field Officer." />
            <FArea label="General Notes" value={schoolForm.notes} onChange={sc('notes')} rows={2} />
            <div className="flex gap-2 justify-end pt-2">
              <Btn size="sm" variant="ghost" onClick={() => setEditingSchool(null)}>Cancel</Btn>
              <Btn size="sm" variant="primary" onClick={saveSchool} disabled={saving}>Save</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
