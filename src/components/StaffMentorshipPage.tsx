import React, { useState, useEffect } from 'react';
import { staffMentorshipApi, districtsApi } from '../api';
import { useCountry } from '../context/CountryContext';
import { User } from '../types';
import { Card, PageHeader, Btn, Badge, Modal, FInput, FArea, FSelect } from './SubComponents';
import { GraduationCap, Plus, Edit2, Trash2 } from 'lucide-react';

interface StaffMentorshipPageProps {
  user: User | null;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

const RATING_CFG: Record<string, { color: string; bg: string }> = {
  Excellent: { color: '#065f46', bg: '#dcfce7' },
  Proficient: { color: '#1e40af', bg: '#dbeafe' },
  Developing: { color: '#92400e', bg: '#fef9c3' },
  'Needs Support': { color: '#991b1b', bg: '#fee2e2' },
};

const BLANK_FORM = {
  staffName: '', staffRole: '', region: '', district: '', programme: 'HIM',
  curriculumModule: '', session1Score: '', session2Score: '',
  kpi6Met: 'Not sure', rating: 'Developing', notes: '', nextAction: '',
};

export const StaffMentorshipPage: React.FC<StaffMentorshipPageProps> = ({ user, showToast }) => {
  const [records, setRecords] = useState<any[]>([]);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ ...BLANK_FORM });

  const isQA = user?.role === 'qa_officer';
  const canAccess = user && (isQA || user.role === 'admin' || user.role === 'program_manager');

  const { activeCountry } = useCountry();
  const load = () => staffMentorshipApi.getAll(activeCountry).then(setRecords).catch(() => {});

  useEffect(() => {
    if (canAccess) load();
    const country = (user as any)?.country || 'Malawi';
    districtsApi.getAll(country).then((res: any) => {
      const list = Array.isArray(res) ? res : [];
      setDistrictOptions(list.map((d: any) => d.name).sort());
      setRegionOptions(Array.from(new Set(list.map((d: any) => d.region).filter(Boolean))).sort());
    });
  }, [user, activeCountry]);

  if (!canAccess) {
    return (
      <div className="p-12 text-center text-black/40 dark:text-white/40 font-semibold italic">
        This workspace is restricted to Quality Assurance Officers.
      </div>
    );
  }

  const sc = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }));

  const avgScore = () => {
    const s1 = parseFloat(form.session1Score) || 0;
    const s2 = parseFloat(form.session2Score) || 0;
    if (!form.session1Score && !form.session2Score) return null;
    return Math.round(((s1 + s2) / (form.session1Score && form.session2Score ? 2 : 1)) * 10) / 10;
  };

  const openNew = () => { setForm({ ...BLANK_FORM }); setEditing({ isNew: true }); };
  const openEdit = (r: any) => {
    setForm({
      staffName: r.staff_name || '', staffRole: r.staff_role || '', region: r.region || '',
      district: r.district || '', programme: r.programme || 'HIM', curriculumModule: r.curriculum_module || '',
      session1Score: r.session1_score ?? '', session2Score: r.session2_score ?? '',
      kpi6Met: r.kpi6_met || 'Not sure', rating: r.rating || 'Developing',
      notes: r.notes || '', nextAction: r.next_action || '',
    });
    setEditing(r);
  };

  const submit = async () => {
    if (!form.staffName.trim()) { showToast('Staff name is required', 'warning'); return; }
    try {
      if (editing?.isNew) {
        const data = await staffMentorshipApi.submit(form);
        if (data.error) { showToast(data.error, 'error'); return; }
        showToast('Evaluation recorded', 'success');
      } else {
        const data = await staffMentorshipApi.update(editing.id, form);
        if (data.error) { showToast(data.error, 'error'); return; }
        showToast('Evaluation updated', 'success');
      }
      setEditing(null);
      load();
    } catch {
      showToast('Failed to save evaluation', 'error');
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm('Delete this evaluation record?')) return;
    try {
      await staffMentorshipApi.delete(id);
      setRecords(prev => prev.filter(r => r.id !== id));
      showToast('Record deleted', 'success');
    } catch {
      showToast('Failed to delete record', 'error');
    }
  };

  return (
    <div>
      <PageHeader
        title="Staff Mentorship & Evaluation"
        subtitle="HIM & GESD mentorship session scoring — Quality Assurance Officer only"
        actions={isQA && (
          <Btn size="sm" variant="primary" onClick={openNew}>
            <Plus size={14} /> New Evaluation
          </Btn>
        )}
      />

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/40">
              <tr>
                <th className="px-3 py-2 font-bold text-slate-500">Staff</th>
                <th className="px-3 py-2 font-bold text-slate-500">District</th>
                <th className="px-3 py-2 font-bold text-slate-500">Programme</th>
                <th className="px-3 py-2 font-bold text-slate-500">Session 1</th>
                <th className="px-3 py-2 font-bold text-slate-500">Session 2</th>
                <th className="px-3 py-2 font-bold text-slate-500">KPI 6 Met?</th>
                <th className="px-3 py-2 font-bold text-slate-500">Rating</th>
                {isQA && <th className="px-3 py-2 font-bold text-slate-500">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-slate-800">
              {records.length === 0 ? (
                <tr><td colSpan={8} className="px-3 py-6 text-center text-slate-400">No evaluations recorded yet.</td></tr>
              ) : (
                records.map(r => (
                  <tr key={r.id}>
                    <td className="px-3 py-2">
                      <div className="font-bold text-black dark:text-white">{r.staff_name}</div>
                      <div className="text-[10px] text-slate-400">{r.staff_role}</div>
                    </td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{r.district} <span className="text-slate-400">({r.region})</span></td>
                    <td className="px-3 py-2">{r.programme}</td>
                    <td className="px-3 py-2">{r.session1_score ?? '—'}</td>
                    <td className="px-3 py-2">{r.session2_score ?? '—'}</td>
                    <td className="px-3 py-2">{r.kpi6_met || '—'}</td>
                    <td className="px-3 py-2">
                      {r.rating && <Badge text={r.rating} color={RATING_CFG[r.rating]?.color} bg={RATING_CFG[r.rating]?.bg} />}
                    </td>
                    {isQA && (
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
        <Modal title={editing.isNew ? 'New Staff Evaluation' : 'Edit Evaluation'} onClose={() => setEditing(null)} width={560}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Staff Name *" value={form.staffName} onChange={sc('staffName')} />
              <FInput label="Role" placeholder="e.g. ETT Specialist" value={form.staffRole} onChange={sc('staffRole')} />
            </div>
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
            <div className="grid grid-cols-2 gap-3">
              <FSelect label="Programme" value={form.programme} onChange={sc('programme')}>
                <option value="HIM">HIM — Hero In Me</option>
                <option value="GESD">GESD</option>
              </FSelect>
              <FInput label="Curriculum Module (optional)" value={form.curriculumModule} onChange={sc('curriculumModule')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Session 1 Score /100" type="number" value={form.session1Score} onChange={sc('session1Score')} />
              <FInput label="Session 2 Score /100" type="number" value={form.session2Score} onChange={sc('session2Score')} />
            </div>
            {avgScore() !== null && (
              <div className="text-xs text-slate-500">Average score: <b className="text-black dark:text-white">{avgScore()}</b></div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <FSelect label="KPI 6 Met?" value={form.kpi6Met} onChange={sc('kpi6Met')}>
                <option>Yes</option>
                <option>No</option>
                <option>Not sure</option>
              </FSelect>
              <FSelect label="Rating" value={form.rating} onChange={sc('rating')}>
                <option>Excellent</option>
                <option>Proficient</option>
                <option>Developing</option>
                <option>Needs Support</option>
              </FSelect>
            </div>
            <FArea label="Notes / Observations" value={form.notes} onChange={sc('notes')} rows={2} />
            <FArea label="Next Action" value={form.nextAction} onChange={sc('nextAction')} rows={2} />
            <div className="flex justify-end gap-2 pt-2">
              <Btn size="sm" variant="secondary" onClick={() => setEditing(null)}>Cancel</Btn>
              <Btn size="sm" onClick={submit}>{editing.isNew ? 'Save Evaluation' : 'Update Evaluation'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
