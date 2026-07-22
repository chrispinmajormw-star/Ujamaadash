import React, { useState, useEffect } from 'react';
import { clusterTeachbacksApi, ttsRecordsApi, trocaireRecordsApi } from '../api';
import { User } from '../types';
import { Card, PageHeader, Btn, Modal, FInput } from './SubComponents';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface ProgramTrackersFormProps {
  user: User | null;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

const TABS = [
  { id: 'teachbacks', label: 'Cluster Teachbacks' },
  { id: 'tts', label: 'TTS Numbers' },
  { id: 'trocaire', label: 'Trocaire ICSP' },
] as const;

const TEACHBACK_BLANK = {
  clusterName: '', trainingDate: '', totMale: '', totFemale: '',
  meeting1Date: '', meeting1Teachers: '', meeting1Activities: '',
  meeting2Date: '', meeting2Teachers: '', meeting2Activities: '',
  meeting3Date: '', meeting3Teachers: '', meeting3Activities: '',
};

const TTS_BLANK = {
  project: '', schoolName: '', teachersFemale: '', teachersMale: '',
  teachersNamesFemale: '', teachersNamesMale: '', ta: '', zone: '', cohort: '',
  trainingDate: '', studentsGirls: '', studentsBoys: '',
};

const TROCAIRE_BLANK = {
  schoolName: '', teachersNamesFemale: '', teachersNamesMale: '', ta: '', zone: '', cohort: '',
  trainingDate: '', classForm: '', studentsGirls: '', studentsBoys: '',
  sgbvGirls: '', sgbvBoys: '', otherGbvGirls: '', otherGbvBoys: '',
};

export const ProgramTrackersForm: React.FC<ProgramTrackersFormProps> = ({ user, showToast }) => {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['id']>('teachbacks');

  // Teachbacks
  const [teachbacks, setTeachbacks] = useState<any[]>([]);
  const [editingTb, setEditingTb] = useState<any | null>(null);
  const [tbForm, setTbForm] = useState({ ...TEACHBACK_BLANK });

  // TTS
  const [ttsRecords, setTtsRecords] = useState<any[]>([]);
  const [editingTts, setEditingTts] = useState<any | null>(null);
  const [ttsForm, setTtsForm] = useState({ ...TTS_BLANK });

  // Trocaire
  const [trocaireRecords, setTrocaireRecords] = useState<any[]>([]);
  const [editingTrocaire, setEditingTrocaire] = useState<any | null>(null);
  const [trocaireForm, setTrocaireForm] = useState({ ...TROCAIRE_BLANK });

  const loadTeachbacks = () => clusterTeachbacksApi.getAll().then(setTeachbacks).catch(() => {});
  const loadTts = () => ttsRecordsApi.getAll().then(setTtsRecords).catch(() => {});
  const loadTrocaire = () => trocaireRecordsApi.getAll().then(setTrocaireRecords).catch(() => {});

  useEffect(() => {
    if (activeTab === 'teachbacks') loadTeachbacks();
    if (activeTab === 'tts') loadTts();
    if (activeTab === 'trocaire') loadTrocaire();
  }, [activeTab, user]);

  const openNewTb = () => { setTbForm({ ...TEACHBACK_BLANK }); setEditingTb({ isNew: true }); };
  const openEditTb = (t: any) => {
    setTbForm({
      clusterName: t.cluster_name || '', trainingDate: t.training_date || '',
      totMale: String(t.tot_male ?? ''), totFemale: String(t.tot_female ?? ''),
      meeting1Date: t.meeting1_date || '', meeting1Teachers: String(t.meeting1_teachers ?? ''), meeting1Activities: t.meeting1_activities || '',
      meeting2Date: t.meeting2_date || '', meeting2Teachers: String(t.meeting2_teachers ?? ''), meeting2Activities: t.meeting2_activities || '',
      meeting3Date: t.meeting3_date || '', meeting3Teachers: String(t.meeting3_teachers ?? ''), meeting3Activities: t.meeting3_activities || '',
    });
    setEditingTb(t);
  };
  const submitTb = async () => {
    if (!tbForm.clusterName.trim()) { showToast('Cluster name is required', 'warning'); return; }
    try {
      if (editingTb.isNew) { await clusterTeachbacksApi.create(tbForm); showToast('Record added', 'success'); }
      else { await clusterTeachbacksApi.update(editingTb.id, tbForm); showToast('Record updated', 'success'); }
      setEditingTb(null); loadTeachbacks();
    } catch { showToast('Failed to save record', 'error'); }
  };
  const removeTb = async (id: number) => {
    if (!window.confirm('Delete this record?')) return;
    try { await clusterTeachbacksApi.delete(id); loadTeachbacks(); showToast('Deleted', 'success'); }
    catch { showToast('Failed to delete', 'error'); }
  };

  const openNewTts = () => { setTtsForm({ ...TTS_BLANK }); setEditingTts({ isNew: true }); };
  const openEditTts = (t: any) => {
    setTtsForm({
      project: t.project || '', schoolName: t.school_name || '',
      teachersFemale: String(t.teachers_female ?? ''), teachersMale: String(t.teachers_male ?? ''),
      teachersNamesFemale: t.teachers_names_female || '', teachersNamesMale: t.teachers_names_male || '',
      ta: t.ta || '', zone: t.zone || '', cohort: t.cohort || '',
      trainingDate: t.training_date || '', studentsGirls: String(t.students_girls ?? ''), studentsBoys: String(t.students_boys ?? ''),
    });
    setEditingTts(t);
  };
  const submitTts = async () => {
    if (!ttsForm.schoolName.trim()) { showToast('School name is required', 'warning'); return; }
    try {
      if (editingTts.isNew) { await ttsRecordsApi.create(ttsForm); showToast('Record added', 'success'); }
      else { await ttsRecordsApi.update(editingTts.id, ttsForm); showToast('Record updated', 'success'); }
      setEditingTts(null); loadTts();
    } catch { showToast('Failed to save record', 'error'); }
  };
  const removeTts = async (id: number) => {
    if (!window.confirm('Delete this record?')) return;
    try { await ttsRecordsApi.delete(id); loadTts(); showToast('Deleted', 'success'); }
    catch { showToast('Failed to delete', 'error'); }
  };

  const openNewTrocaire = () => { setTrocaireForm({ ...TROCAIRE_BLANK }); setEditingTrocaire({ isNew: true }); };
  const openEditTrocaire = (t: any) => {
    setTrocaireForm({
      schoolName: t.school_name || '', teachersNamesFemale: t.teachers_names_female || '', teachersNamesMale: t.teachers_names_male || '',
      ta: t.ta || '', zone: t.zone || '', cohort: t.cohort || '', trainingDate: t.training_date || '', classForm: t.class_form || '',
      studentsGirls: String(t.students_girls ?? ''), studentsBoys: String(t.students_boys ?? ''),
      sgbvGirls: String(t.sgbv_girls ?? ''), sgbvBoys: String(t.sgbv_boys ?? ''),
      otherGbvGirls: String(t.other_gbv_girls ?? ''), otherGbvBoys: String(t.other_gbv_boys ?? ''),
    });
    setEditingTrocaire(t);
  };
  const submitTrocaire = async () => {
    if (!trocaireForm.schoolName.trim()) { showToast('School name is required', 'warning'); return; }
    try {
      if (editingTrocaire.isNew) { await trocaireRecordsApi.create(trocaireForm); showToast('Record added', 'success'); }
      else { await trocaireRecordsApi.update(editingTrocaire.id, trocaireForm); showToast('Record updated', 'success'); }
      setEditingTrocaire(null); loadTrocaire();
    } catch { showToast('Failed to save record', 'error'); }
  };
  const removeTrocaire = async (id: number) => {
    if (!window.confirm('Delete this record?')) return;
    try { await trocaireRecordsApi.delete(id); loadTrocaire(); showToast('Deleted', 'success'); }
    catch { showToast('Failed to delete', 'error'); }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-base font-bold text-black dark:text-white m-0 mb-3">Program Trackers</h1>
        <div className="flex gap-1 border-b border-neutral-200 dark:border-slate-800 pb-0 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-lg border-b-2 transition-all -mb-px shrink-0 ${
                activeTab === t.id
                  ? 'border-[var(--brand-500)] text-[var(--brand-600)] dark:text-[var(--brand-400)] bg-[var(--brand-50)] dark:bg-[var(--brand-950)]/20'
                  : 'border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'teachbacks' && (
        <div>
          <PageHeader title="Cluster Teachbacks" subtitle="TOT counts and up to 3 teachback meetings per cluster"
            actions={<Btn size="sm" onClick={openNewTb}><Plus size={14} /> New Record</Btn>} />
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/40">
                  <tr>
                    <th className="px-3 py-2 font-bold text-slate-500">Cluster</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Training Date</th>
                    <th className="px-3 py-2 font-bold text-slate-500">TOT (M/F)</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Meetings Held</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-slate-800">
                  {teachbacks.length === 0 ? (
                    <tr><td colSpan={5} className="px-3 py-6 text-center text-slate-400">No records yet.</td></tr>
                  ) : (
                    teachbacks.map((t: any) => {
                      const held = [t.meeting1_date, t.meeting2_date, t.meeting3_date].filter(Boolean).length;
                      return (
                        <tr key={t.id}>
                          <td className="px-3 py-2 font-bold text-black dark:text-white">{t.cluster_name}</td>
                          <td className="px-3 py-2">{t.training_date ? new Date(t.training_date).toLocaleDateString() : '—'}</td>
                          <td className="px-3 py-2">{t.tot_male ?? 0} / {t.tot_female ?? 0}</td>
                          <td className="px-3 py-2">{held} / 3</td>
                          <td className="px-3 py-2">
                            <div className="flex gap-1">
                              <Btn size="sm" variant="secondary" onClick={() => openEditTb(t)}><Edit2 size={12} /></Btn>
                              <Btn size="sm" variant="danger" onClick={() => removeTb(t.id)}><Trash2 size={12} /></Btn>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'tts' && (
        <div>
          <PageHeader title="TTS Numbers" subtitle="Teacher training sessions and students reached, per school"
            actions={<Btn size="sm" onClick={openNewTts}><Plus size={14} /> New Record</Btn>} />
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/40">
                  <tr>
                    <th className="px-3 py-2 font-bold text-slate-500">School</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Cohort</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Teachers (F/M)</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Students (G/B)</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Training Date</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-slate-800">
                  {ttsRecords.length === 0 ? (
                    <tr><td colSpan={6} className="px-3 py-6 text-center text-slate-400">No records yet.</td></tr>
                  ) : (
                    ttsRecords.map((t: any) => (
                      <tr key={t.id}>
                        <td className="px-3 py-2 font-bold text-black dark:text-white">{t.school_name}</td>
                        <td className="px-3 py-2">{t.cohort || '—'}</td>
                        <td className="px-3 py-2">{t.teachers_female ?? 0} / {t.teachers_male ?? 0}</td>
                        <td className="px-3 py-2">{t.students_girls ?? 0} / {t.students_boys ?? 0}</td>
                        <td className="px-3 py-2">{t.training_date ? new Date(t.training_date).toLocaleDateString() : '—'}</td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1">
                            <Btn size="sm" variant="secondary" onClick={() => openEditTts(t)}><Edit2 size={12} /></Btn>
                            <Btn size="sm" variant="danger" onClick={() => removeTts(t.id)}><Trash2 size={12} /></Btn>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'trocaire' && (
        <div>
          <PageHeader title="Trocaire ICSP" subtitle="Per-school training log with GBV case tracking"
            actions={<Btn size="sm" onClick={openNewTrocaire}><Plus size={14} /> New Record</Btn>} />
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/40">
                  <tr>
                    <th className="px-3 py-2 font-bold text-slate-500">School</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Cohort</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Students (G/B)</th>
                    <th className="px-3 py-2 font-bold text-slate-500">SGBV Cases (G/B)</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Other GBV (G/B)</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-slate-800">
                  {trocaireRecords.length === 0 ? (
                    <tr><td colSpan={6} className="px-3 py-6 text-center text-slate-400">No records yet.</td></tr>
                  ) : (
                    trocaireRecords.map((t: any) => (
                      <tr key={t.id}>
                        <td className="px-3 py-2 font-bold text-black dark:text-white">{t.school_name}</td>
                        <td className="px-3 py-2">{t.cohort || '—'}</td>
                        <td className="px-3 py-2">{t.students_girls ?? 0} / {t.students_boys ?? 0}</td>
                        <td className="px-3 py-2">{t.sgbv_girls ?? 0} / {t.sgbv_boys ?? 0}</td>
                        <td className="px-3 py-2">{t.other_gbv_girls ?? 0} / {t.other_gbv_boys ?? 0}</td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1">
                            <Btn size="sm" variant="secondary" onClick={() => openEditTrocaire(t)}><Edit2 size={12} /></Btn>
                            <Btn size="sm" variant="danger" onClick={() => removeTrocaire(t.id)}><Trash2 size={12} /></Btn>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {editingTb && (
        <Modal title={editingTb.isNew ? 'New Teachback Record' : 'Edit Record'} onClose={() => setEditingTb(null)} width={560}>
          <div className="space-y-3">
            <FInput label="Cluster Name *" value={tbForm.clusterName} onChange={(e: any) => setTbForm(p => ({ ...p, clusterName: e.target.value }))} />
            <FInput label="Training Date" type="date" value={tbForm.trainingDate} onChange={(e: any) => setTbForm(p => ({ ...p, trainingDate: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <FInput label="TOT Male" type="number" value={tbForm.totMale} onChange={(e: any) => setTbForm(p => ({ ...p, totMale: e.target.value }))} />
              <FInput label="TOT Female" type="number" value={tbForm.totFemale} onChange={(e: any) => setTbForm(p => ({ ...p, totFemale: e.target.value }))} />
            </div>
            {[1, 2, 3].map(n => (
              <div key={n} className="p-3 rounded-lg border border-neutral-200 dark:border-slate-700 space-y-2">
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Meeting {n}</div>
                <div className="grid grid-cols-2 gap-3">
                  <FInput label="Date" type="date" value={(tbForm as any)[`meeting${n}Date`]} onChange={(e: any) => setTbForm(p => ({ ...p, [`meeting${n}Date`]: e.target.value }))} />
                  <FInput label="Number of Teachers" type="number" value={(tbForm as any)[`meeting${n}Teachers`]} onChange={(e: any) => setTbForm(p => ({ ...p, [`meeting${n}Teachers`]: e.target.value }))} />
                </div>
                <FInput label="Activities" value={(tbForm as any)[`meeting${n}Activities`]} onChange={(e: any) => setTbForm(p => ({ ...p, [`meeting${n}Activities`]: e.target.value }))} placeholder="e.g. Teachbacks" />
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <Btn size="sm" variant="secondary" onClick={() => setEditingTb(null)}>Cancel</Btn>
              <Btn size="sm" onClick={submitTb}>{editingTb.isNew ? 'Save' : 'Update'}</Btn>
            </div>
          </div>
        </Modal>
      )}

      {editingTts && (
        <Modal title={editingTts.isNew ? 'New TTS Record' : 'Edit Record'} onClose={() => setEditingTts(null)} width={560}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Project" value={ttsForm.project} onChange={(e: any) => setTtsForm(p => ({ ...p, project: e.target.value }))} />
              <FInput label="School Name *" value={ttsForm.schoolName} onChange={(e: any) => setTtsForm(p => ({ ...p, schoolName: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Teachers Female" type="number" value={ttsForm.teachersFemale} onChange={(e: any) => setTtsForm(p => ({ ...p, teachersFemale: e.target.value }))} />
              <FInput label="Teachers Male" type="number" value={ttsForm.teachersMale} onChange={(e: any) => setTtsForm(p => ({ ...p, teachersMale: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Teachers Names (Female)" value={ttsForm.teachersNamesFemale} onChange={(e: any) => setTtsForm(p => ({ ...p, teachersNamesFemale: e.target.value }))} />
              <FInput label="Teachers Names (Male)" value={ttsForm.teachersNamesMale} onChange={(e: any) => setTtsForm(p => ({ ...p, teachersNamesMale: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label="T/A" value={ttsForm.ta} onChange={(e: any) => setTtsForm(p => ({ ...p, ta: e.target.value }))} />
              <FInput label="Zone" value={ttsForm.zone} onChange={(e: any) => setTtsForm(p => ({ ...p, zone: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Cohort" value={ttsForm.cohort} onChange={(e: any) => setTtsForm(p => ({ ...p, cohort: e.target.value }))} />
              <FInput label="Training Date" type="date" value={ttsForm.trainingDate} onChange={(e: any) => setTtsForm(p => ({ ...p, trainingDate: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Students Trained — Girls" type="number" value={ttsForm.studentsGirls} onChange={(e: any) => setTtsForm(p => ({ ...p, studentsGirls: e.target.value }))} />
              <FInput label="Students Trained — Boys" type="number" value={ttsForm.studentsBoys} onChange={(e: any) => setTtsForm(p => ({ ...p, studentsBoys: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Btn size="sm" variant="secondary" onClick={() => setEditingTts(null)}>Cancel</Btn>
              <Btn size="sm" onClick={submitTts}>{editingTts.isNew ? 'Save' : 'Update'}</Btn>
            </div>
          </div>
        </Modal>
      )}

      {editingTrocaire && (
        <Modal title={editingTrocaire.isNew ? 'New Trocaire Record' : 'Edit Record'} onClose={() => setEditingTrocaire(null)} width={560}>
          <div className="space-y-3">
            <FInput label="School Name *" value={trocaireForm.schoolName} onChange={(e: any) => setTrocaireForm(p => ({ ...p, schoolName: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Teachers Names (Female)" value={trocaireForm.teachersNamesFemale} onChange={(e: any) => setTrocaireForm(p => ({ ...p, teachersNamesFemale: e.target.value }))} />
              <FInput label="Teachers Names (Male)" value={trocaireForm.teachersNamesMale} onChange={(e: any) => setTrocaireForm(p => ({ ...p, teachersNamesMale: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label="T/A" value={trocaireForm.ta} onChange={(e: any) => setTrocaireForm(p => ({ ...p, ta: e.target.value }))} />
              <FInput label="Zone" value={trocaireForm.zone} onChange={(e: any) => setTrocaireForm(p => ({ ...p, zone: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Cohort" value={trocaireForm.cohort} onChange={(e: any) => setTrocaireForm(p => ({ ...p, cohort: e.target.value }))} />
              <FInput label="Training Date" type="date" value={trocaireForm.trainingDate} onChange={(e: any) => setTrocaireForm(p => ({ ...p, trainingDate: e.target.value }))} />
            </div>
            <FInput label="Class / Form" value={trocaireForm.classForm} onChange={(e: any) => setTrocaireForm(p => ({ ...p, classForm: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Students Trained — Girls" type="number" value={trocaireForm.studentsGirls} onChange={(e: any) => setTrocaireForm(p => ({ ...p, studentsGirls: e.target.value }))} />
              <FInput label="Students Trained — Boys" type="number" value={trocaireForm.studentsBoys} onChange={(e: any) => setTrocaireForm(p => ({ ...p, studentsBoys: e.target.value }))} />
            </div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 pt-1">Safeguarding (SGBV) Cases</div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label="SGBV Cases — Girls" type="number" value={trocaireForm.sgbvGirls} onChange={(e: any) => setTrocaireForm(p => ({ ...p, sgbvGirls: e.target.value }))} />
              <FInput label="SGBV Cases — Boys" type="number" value={trocaireForm.sgbvBoys} onChange={(e: any) => setTrocaireForm(p => ({ ...p, sgbvBoys: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Other GBV — Girls" type="number" value={trocaireForm.otherGbvGirls} onChange={(e: any) => setTrocaireForm(p => ({ ...p, otherGbvGirls: e.target.value }))} />
              <FInput label="Other GBV — Boys" type="number" value={trocaireForm.otherGbvBoys} onChange={(e: any) => setTrocaireForm(p => ({ ...p, otherGbvBoys: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Btn size="sm" variant="secondary" onClick={() => setEditingTrocaire(null)}>Cancel</Btn>
              <Btn size="sm" onClick={submitTrocaire}>{editingTrocaire.isNew ? 'Save' : 'Update'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
