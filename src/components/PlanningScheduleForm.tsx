import React, { useState, useEffect } from 'react';
import { planningSchedulesApi } from '../api';
import { User } from '../types';
import { Card, PageHeader, Btn, Badge, FArea, FInput } from './SubComponents';
import { CheckCircle2 } from 'lucide-react';

interface PlanningScheduleFormProps {
  user: User | null;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const PlanningScheduleForm: React.FC<PlanningScheduleFormProps> = ({ user, showToast }) => {
  const [biweekStart, setBiweekStart] = useState('');
  const [district, setDistrict] = useState('');
  const [existingPlan, setExistingPlan] = useState<any>(null);
  const [form, setForm] = useState({
    activitiesPlanned: '', teachersTrained: '', studentsReached: '',
    activitiesAchieved: false, activitiesNotAchieved: '',
  });

  const load = () => {
    planningSchedulesApi.getMyThisBiweek().then((res: any) => {
      setBiweekStart(res.biweekStart);
      setDistrict(res.district);
      setExistingPlan(res.plan);
      if (res.plan) {
        setForm({
          activitiesPlanned: res.plan.activities_planned || '',
          teachersTrained: String(res.plan.teachers_trained ?? ''),
          studentsReached: String(res.plan.students_reached ?? ''),
          activitiesAchieved: !!res.plan.activities_achieved,
          activitiesNotAchieved: res.plan.activities_not_achieved || '',
        });
      }
    }).catch(() => {});
  };

  useEffect(() => { load(); }, [user]);

  const submit = async () => {
    if (!form.activitiesPlanned.trim()) { showToast('Activities Planned is required', 'warning'); return; }
    try {
      const data = await planningSchedulesApi.submit({
        activitiesPlanned: form.activitiesPlanned,
        teachersTrained: parseInt(form.teachersTrained) || 0,
        studentsReached: parseInt(form.studentsReached) || 0,
        activitiesAchieved: form.activitiesAchieved,
        activitiesNotAchieved: form.activitiesNotAchieved,
      });
      if (data.error) { showToast(data.error, 'error'); return; }
      showToast(existingPlan ? 'Plan updated' : 'Plan submitted', 'success');
      load();
    } catch { showToast('Failed to save plan', 'error'); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in-up">
      <PageHeader
        title="Planning & Scheduling"
        subtitle={`District: ${district || '—'} · Biweek starting ${biweekStart ? new Date(biweekStart).toLocaleDateString() : '—'}`}
      />

      {existingPlan && (
        <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
          <CheckCircle2 size={14} /> Already submitted for this biweek — editing will update it.
        </div>
      )}

      <Card className="p-4 space-y-4">
        <FArea label="Activities Planned *" value={form.activitiesPlanned} onChange={(e: any) => setForm(p => ({ ...p, activitiesPlanned: e.target.value }))} rows={4} placeholder="Describe the activities planned for this biweek..." />
        <div className="grid grid-cols-2 gap-3">
          <FInput label="Number of Teachers Trained" type="number" value={form.teachersTrained} onChange={(e: any) => setForm(p => ({ ...p, teachersTrained: e.target.value }))} />
          <FInput label="Number of Students Reached" type="number" value={form.studentsReached} onChange={(e: any) => setForm(p => ({ ...p, studentsReached: e.target.value }))} />
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 p-2.5 rounded-lg border border-neutral-200 dark:border-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={form.activitiesAchieved}
            onChange={() => setForm(p => ({ ...p, activitiesAchieved: !p.activitiesAchieved }))}
            className="accent-[var(--brand)]"
          />
          Activities Achieved
        </label>
        <FArea label="Activities Not Achieved (if any)" value={form.activitiesNotAchieved} onChange={(e: any) => setForm(p => ({ ...p, activitiesNotAchieved: e.target.value }))} rows={2} placeholder="Note anything planned but not achieved this biweek..." />

        <div className="flex justify-end pt-2">
          <Btn onClick={submit}>{existingPlan ? 'Update Plan' : 'Submit Plan'}</Btn>
        </div>
      </Card>
    </div>
  );
};
