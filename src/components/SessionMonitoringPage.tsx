import React, { useState, useEffect } from 'react';
import { sessionMonitoringApi, districtsApi } from '../api';
import { User } from '../types';
import { Card, PageHeader, Btn, Badge, Modal, FInput, FSelect } from './SubComponents';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface SessionMonitoringPageProps {
  user: User | null;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  recordType: 'stot_orientation' | 'stot_tracker' | 'tot_training' | 'cluster_anchors';
  title: string;
  subtitle: string;
  plannedLabel: string;
  conductedLabel: string;
}

const STATUS_CFG: Record<string, { color: string; bg: string }> = {
  'On Track': { color: '#065f46', bg: '#dcfce7' },
  Monitor: { color: '#92400e', bg: '#fef9c3' },
  'At Risk': { color: '#991b1b', bg: '#fee2e2' },
};

const BLANK_FORM = {
  staffName: '', district: '', region: '', programme: 'HIM',
  planned: '', conducted: '', monitoringScore: '',
  deliveryQuality: 'Proficient', curriculumPrep: 'Good', monitoringCoveragePct: '',
  kpi4Met: 'Not sure', overallStatus: 'Monitor',
};

export const SessionMonitoringPage: React.FC<SessionMonitoringPageProps> = ({
  user, showToast, recordType, title, subtitle, plannedLabel, conductedLabel,
}) => {
  const [records, setRecords] = useState<any[]>([]);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ ...BLANK_FORM });

  const canSubmit = user?.role === 'field_officer' || user?.role === 'district_coordinator';
  const canAccess = user && (canSubmit || ['qa_officer', 'program_manager', 'admin'].includes(user.role));

  const load = () => sessionMonitoringApi.getAll(recordType).then(setRecords).catch(() => {});

  useEffect(() => {
    if (canAccess) load();
    const country = (user as any)?.country || 'Malawi';
    districtsApi.getAll(country).then((res: any) => {
      const list = Array.isArray(res) ? res : [];
      setDistrictOptions(list.map((d: any) => d.name).sort());
      setRegionOptions(Array.from(new Set(list.map((d: any) => d.region).filter(Boolean))).sort());
    });
  }, [user, recordType]);

  if (!canAccess) {
    return (
      <div className="p-12 text-center text-black/40 dark:text-white/40 font-semibold italic">
        You don't have access to this page.
      </div>
    );
  }

  const sc = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }));

  const completionPct = () => {
    const p = parseFloat(form.planned) || 0;
    const c = parseFloat(form.conducted) || 0;
    if (!form.planned) return null;
    return p > 0 ? Math.round((c / p) * 1000) / 10 : 0;
  };

  const openNew = () => { setForm({ ...BLANK_FORM, district: (user as any)?.district || '' }); setEditing({ isNew: true }); };
  const openEdit = (r: any) => {
    setForm({
      staffName: r.staff_name || '', district: r.district || '', region: r.region || '', programme: r.programme || 'HIM',
      planned: r.planned ?? '', conducted: r.conducted ?? '', monitoringScore: r.monitoring_score ?? '',
      deliveryQuality: r.delivery_quality || 'Proficient', curriculumPrep: r.curriculum_prep || 'Good',
      monitoringCoveragePct: r.monitoring_coverage_pct ?? '', kpi4Met: r.kpi4_met || 'Not sure',
      overallStatus: r.overall_status || 'Monitor',
    });
    setEditing(r);
  };

  const submit = async () => {
    if (!form.staffName.trim()) { showToast('Staff name is required', 'warning'); return; }
    try {
      if (editing?.isNew) {
        const data = await sessionMonitoringApi.submit({ ...form, recordType });
        if (data.error) { showToast(data.error, 'error'); return; }
        showToast('Record saved', 'success');
      } else {
        const data = await sessionMonitoringApi.update(editing.id, form);
        if (data.error) { showToast(data.error, 'error'); return; }
        showToast('Record updated', 'success');
      }
      setEditing(null);
      load();
    } catch {
      showToast('Failed to save record', 'error');
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm('Delete this monitoring record?')) return;
    try {
      await sessionMonitoringApi.delete(id);
      setRecords(prev => prev.filter(r => r.id !== id));
      showToast('Record deleted', 'success');
    } catch {
      showToast('Failed to delete record', 'error');
    }
  };

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={canSubmit && (
          <Btn size="sm" variant="primary" onClick={openNew}>
            <Plus size={14} /> New Record
          </Btn>
        )}
      />

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/40">
              <tr>
                <th className="px-3 py-2 font-bold text-slate-500">Name</th>
                <th className="px-3 py-2 font-bold text-slate-500">District</th>
                <th className="px-3 py-2 font-bold text-slate-500">Programme</th>
                <th className="px-3 py-2 font-bold text-slate-500">{plannedLabel}</th>
                <th className="px-3 py-2 font-bold text-slate-500">{conductedLabel}</th>
                <th className="px-3 py-2 font-bold text-slate-500">Score</th>
                <th className="px-3 py-2 font-bold text-slate-500">Status</th>
                {canSubmit && <th className="px-3 py-2 font-bold text-slate-500">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-slate-800">
              {records.length === 0 ? (
                <tr><td colSpan={8} className="px-3 py-6 text-center text-slate-400">No records yet.</td></tr>
              ) : (
                records.map(r => (
                  <tr key={r.id}>
                    <td className="px-3 py-2 font-bold text-black dark:text-white">{r.staff_name}</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{r.district} <span className="text-slate-400">({r.region})</span></td>
                    <td className="px-3 py-2">{r.programme}</td>
                    <td className="px-3 py-2">{r.planned ?? '—'}</td>
                    <td className="px-3 py-2">{r.conducted ?? '—'}</td>
                    <td className="px-3 py-2">{r.monitoring_score ?? '—'}</td>
                    <td className="px-3 py-2">
                      {r.overall_status && <Badge text={r.overall_status} color={STATUS_CFG[r.overall_status]?.color} bg={STATUS_CFG[r.overall_status]?.bg} />}
                    </td>
                    {canSubmit && (
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          <Btn size="sm" variant="secondary" onClick={() => openEdit(r)}><Edit2 size={12} /></Btn>
                          <Btn size="sm" variant="danger" onClick={() => remove(r.id)}><Trash2 size={12} /></Btn>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {editing && (
        <Modal title={editing.isNew ? 'New Record' : 'Edit Record'} onClose={() => setEditing(null)} width={560}>
          <div className="space-y-3">
            <FInput label="Staff Name *" value={form.staffName} onChange={sc('staffName')} />
            <div className="grid grid-cols-2 gap-3">
              <FSelect label="Region" value={form.region} onChange={sc('region')}>
                <option value="">Select region...</option>
                {regionOptions.map(r => <option key={r}>{r}</option>)}
              </FSelect>
              <FSelect label="District" value={form.district} onChange={sc('district')}>
                <option value="">Select district...</option>
                {districtOptions.map(d => <option key={d}>{d}</option>)}
              </FSelect>
            </div>
            <FSelect label="Programme" value={form.programme} onChange={sc('programme')}>
              <option value="HIM">HIM — Hero In Me</option>
              <option value="GESD">GESD</option>
            </FSelect>
            <div className="grid grid-cols-2 gap-3">
              <FInput label={plannedLabel} type="number" value={form.planned} onChange={sc('planned')} />
              <FInput label={conductedLabel} type="number" value={form.conducted} onChange={sc('conducted')} />
            </div>
            {completionPct() !== null && (
              <div className="text-xs text-slate-500">Completion: <b className="text-black dark:text-white">{completionPct()}%</b></div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Monitoring Score /100" type="number" value={form.monitoringScore} onChange={sc('monitoringScore')} />
              <FInput label="Monitoring Coverage %" type="number" value={form.monitoringCoveragePct} onChange={sc('monitoringCoveragePct')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FSelect label="Delivery Quality" value={form.deliveryQuality} onChange={sc('deliveryQuality')}>
                <option>Excellent</option><option>Proficient</option><option>Developing</option><option>Needs Support</option>
              </FSelect>
              <FSelect label="Curriculum Prep" value={form.curriculumPrep} onChange={sc('curriculumPrep')}>
                <option>Excellent</option><option>Good</option><option>Adequate</option><option>Needs Support</option>
              </FSelect>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FSelect label="KPI 4 Met?" value={form.kpi4Met} onChange={sc('kpi4Met')}>
                <option>Yes</option><option>No</option><option>Not sure</option>
              </FSelect>
              <FSelect label="Overall Status" value={form.overallStatus} onChange={sc('overallStatus')}>
                <option>On Track</option><option>Monitor</option><option>At Risk</option>
              </FSelect>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Btn size="sm" variant="secondary" onClick={() => setEditing(null)}>Cancel</Btn>
              <Btn size="sm" onClick={submit}>{editing.isNew ? 'Save Record' : 'Update Record'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
