import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
    if (!tbForm.clusterName.trim()) { showToast(t('program_trackers.cluster_name_required'), 'warning'); return; }
    try {
      if (editingTb.isNew) { await clusterTeachbacksApi.create(tbForm); showToast(t('program_trackers.record_added'), 'success'); }
      else { await clusterTeachbacksApi.update(editingTb.id, tbForm); showToast(t('program_trackers.record_updated'), 'success'); }
      setEditingTb(null); loadTeachbacks();
    } catch { showToast(t('program_trackers.failed_to_save_record'), 'error'); }
  };
  const removeTb = async (id: number) => {
    if (!window.confirm(t('program_trackers.delete_this_record'))) return;
    try { await clusterTeachbacksApi.delete(id); loadTeachbacks(); showToast(t('program_trackers.deleted'), 'success'); }
    catch { showToast(t('program_trackers.failed_to_delete'), 'error'); }
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
    if (!ttsForm.schoolName.trim()) { showToast(t('program_trackers.school_name_required'), 'warning'); return; }
    try {
      if (editingTts.isNew) { await ttsRecordsApi.create(ttsForm); showToast(t('program_trackers.record_added'), 'success'); }
      else { await ttsRecordsApi.update(editingTts.id, ttsForm); showToast(t('program_trackers.record_updated'), 'success'); }
      setEditingTts(null); loadTts();
    } catch { showToast(t('program_trackers.failed_to_save_record'), 'error'); }
  };
  const removeTts = async (id: number) => {
    if (!window.confirm(t('program_trackers.delete_this_record'))) return;
    try { await ttsRecordsApi.delete(id); loadTts(); showToast(t('program_trackers.deleted'), 'success'); }
    catch { showToast(t('program_trackers.failed_to_delete'), 'error'); }
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
    if (!trocaireForm.schoolName.trim()) { showToast(t('program_trackers.school_name_required'), 'warning'); return; }
    try {
      if (editingTrocaire.isNew) { await trocaireRecordsApi.create(trocaireForm); showToast(t('program_trackers.record_added'), 'success'); }
      else { await trocaireRecordsApi.update(editingTrocaire.id, trocaireForm); showToast(t('program_trackers.record_updated'), 'success'); }
      setEditingTrocaire(null); loadTrocaire();
    } catch { showToast(t('program_trackers.failed_to_save_record'), 'error'); }
  };
  const removeTrocaire = async (id: number) => {
    if (!window.confirm(t('program_trackers.delete_this_record'))) return;
    try { await trocaireRecordsApi.delete(id); loadTrocaire(); showToast(t('program_trackers.deleted'), 'success'); }
    catch { showToast(t('program_trackers.failed_to_delete'), 'error'); }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-base font-bold text-black dark:text-white m-0 mb-3">{t('program_trackers.program_trackers')}</h1>
        <div className="flex gap-1 border-b border-neutral-200 dark:border-slate-800 pb-0 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-lg border-b-2 transition-all -mb-px shrink-0 ${
                activeTab === tab.id
                  ? 'border-[var(--brand-500)] text-[var(--brand-600)] dark:text-[var(--brand-400)] bg-[var(--brand-50)] dark:bg-[var(--brand-950)]/20'
                  : 'border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'
              }`}
            >
              {t(`program_trackers.${{teachbacks: 'cluster_teachbacks', tts: 'tts_numbers', trocaire: 'trocaire_icsp'}[tab.id]}`)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'teachbacks' && (
        <div>
          <PageHeader title={t('program_trackers.cluster_teachbacks')} subtitle="TOT counts and up to 3 teachback meetings per cluster"
            actions={<Btn size="sm" onClick={openNewTb}><Plus size={14} /> {t('program_trackers.new_record')}</Btn>} />
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/40">
                  <tr>
                    <th className="px-3 py-2 font-bold text-slate-500">{t('program_trackers.cluster')}</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Training Date</th>
                    <th className="px-3 py-2 font-bold text-slate-500">TOT (M/F)</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Meetings Held</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-slate-800">
                  {teachbacks.length === 0 ? (
                    <tr><td colSpan={5} className="px-3 py-6 text-center text-slate-400">{t('program_trackers.no_records_yet')}</td></tr>
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
          <PageHeader title={t('program_trackers.tts_numbers')} subtitle="Teacher training sessions and students reached, per school"
            actions={<Btn size="sm" onClick={openNewTts}><Plus size={14} /> {t('program_trackers.new_record')}</Btn>} />
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
          <PageHeader title={t('program_trackers.trocaire_icsp')} subtitle="Per-school training log with GBV case tracking"
            actions={<Btn size="sm" onClick={openNewTrocaire}><Plus size={14} /> {t('program_trackers.new_record')}</Btn>} />
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
        <Modal title={editingTb.isNew ? t('program_trackers.new_teachback_record') : t('program_trackers.edit_record')} onClose={() => setEditingTb(null)} width={560}>
          <div className="space-y-3">
            <FInput label={t('program_trackers.cluster_name_req')} value={tbForm.clusterName} onChange={(e: any) => setTbForm(p => ({ ...p, clusterName: e.target.value }))} />
            <FInput label={t('program_trackers.training_date')} type="date" value={tbForm.trainingDate} onChange={(e: any) => setTbForm(p => ({ ...p, trainingDate: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <FInput label={t('program_trackers.tot_male')} type="number" value={tbForm.totMale} onChange={(e: any) => setTbForm(p => ({ ...p, totMale: e.target.value }))} />
              <FInput label={t('program_trackers.tot_female')} type="number" value={tbForm.totFemale} onChange={(e: any) => setTbForm(p => ({ ...p, totFemale: e.target.value }))} />
            </div>
            {[1, 2, 3].map(n => (
              <div key={n} className="p-3 rounded-lg border border-neutral-200 dark:border-slate-700 space-y-2">
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">{t('program_trackers.meeting_n', { n })}</div>
                <div className="grid grid-cols-2 gap-3">
                  <FInput label={t('program_trackers.date')} type="date" value={(tbForm as any)[`meeting${n}Date`]} onChange={(e: any) => setTbForm(p => ({ ...p, [`meeting${n}Date`]: e.target.value }))} />
                  <FInput label={t('program_trackers.number_of_teachers')} type="number" value={(tbForm as any)[`meeting${n}Teachers`]} onChange={(e: any) => setTbForm(p => ({ ...p, [`meeting${n}Teachers`]: e.target.value }))} />
                </div>
                <FInput label={t('program_trackers.activities')} value={(tbForm as any)[`meeting${n}Activities`]} onChange={(e: any) => setTbForm(p => ({ ...p, [`meeting${n}Activities`]: e.target.value }))} placeholder="e.g. Teachbacks" />
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <Btn size="sm" variant="secondary" onClick={() => setEditingTb(null)}>{t('program_trackers.cancel')}</Btn>
              <Btn size="sm" onClick={submitTb}>{editingTb.isNew ? t('program_trackers.save') : t('program_trackers.update')}</Btn>
            </div>
          </div>
        </Modal>
      )}

      {editingTts && (
        <Modal title={editingTts.isNew ? t('program_trackers.new_tts_record') : t('program_trackers.edit_record')} onClose={() => setEditingTts(null)} width={560}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FInput label={t('program_trackers.project')} value={ttsForm.project} onChange={(e: any) => setTtsForm(p => ({ ...p, project: e.target.value }))} />
              <FInput label={t('program_trackers.school_name_req')} value={ttsForm.schoolName} onChange={(e: any) => setTtsForm(p => ({ ...p, schoolName: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label={t('program_trackers.teachers_female')} type="number" value={ttsForm.teachersFemale} onChange={(e: any) => setTtsForm(p => ({ ...p, teachersFemale: e.target.value }))} />
              <FInput label={t('program_trackers.teachers_male')} type="number" value={ttsForm.teachersMale} onChange={(e: any) => setTtsForm(p => ({ ...p, teachersMale: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label={t('program_trackers.teachers_names_female')} value={ttsForm.teachersNamesFemale} onChange={(e: any) => setTtsForm(p => ({ ...p, teachersNamesFemale: e.target.value }))} />
              <FInput label={t('program_trackers.teachers_names_male')} value={ttsForm.teachersNamesMale} onChange={(e: any) => setTtsForm(p => ({ ...p, teachersNamesMale: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label={t('program_trackers.ta_label')} value={ttsForm.ta} onChange={(e: any) => setTtsForm(p => ({ ...p, ta: e.target.value }))} />
              <FInput label={t('program_trackers.zone')} value={ttsForm.zone} onChange={(e: any) => setTtsForm(p => ({ ...p, zone: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label={t('program_trackers.cohort')} value={ttsForm.cohort} onChange={(e: any) => setTtsForm(p => ({ ...p, cohort: e.target.value }))} />
              <FInput label={t('program_trackers.training_date')} type="date" value={ttsForm.trainingDate} onChange={(e: any) => setTtsForm(p => ({ ...p, trainingDate: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label={t('program_trackers.students_trained_girls')} type="number" value={ttsForm.studentsGirls} onChange={(e: any) => setTtsForm(p => ({ ...p, studentsGirls: e.target.value }))} />
              <FInput label={t('program_trackers.students_trained_boys')} type="number" value={ttsForm.studentsBoys} onChange={(e: any) => setTtsForm(p => ({ ...p, studentsBoys: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Btn size="sm" variant="secondary" onClick={() => setEditingTts(null)}>{t('program_trackers.cancel')}</Btn>
              <Btn size="sm" onClick={submitTts}>{editingTts.isNew ? t('program_trackers.save') : t('program_trackers.update')}</Btn>
            </div>
          </div>
        </Modal>
      )}

      {editingTrocaire && (
        <Modal title={editingTrocaire.isNew ? t('program_trackers.new_trocaire_record') : t('program_trackers.edit_record')} onClose={() => setEditingTrocaire(null)} width={560}>
          <div className="space-y-3">
            <FInput label={t('program_trackers.school_name_req')} value={trocaireForm.schoolName} onChange={(e: any) => setTrocaireForm(p => ({ ...p, schoolName: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <FInput label={t('program_trackers.teachers_names_female')} value={trocaireForm.teachersNamesFemale} onChange={(e: any) => setTrocaireForm(p => ({ ...p, teachersNamesFemale: e.target.value }))} />
              <FInput label={t('program_trackers.teachers_names_male')} value={trocaireForm.teachersNamesMale} onChange={(e: any) => setTrocaireForm(p => ({ ...p, teachersNamesMale: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label={t('program_trackers.ta_label')} value={trocaireForm.ta} onChange={(e: any) => setTrocaireForm(p => ({ ...p, ta: e.target.value }))} />
              <FInput label={t('program_trackers.zone')} value={trocaireForm.zone} onChange={(e: any) => setTrocaireForm(p => ({ ...p, zone: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label={t('program_trackers.cohort')} value={trocaireForm.cohort} onChange={(e: any) => setTrocaireForm(p => ({ ...p, cohort: e.target.value }))} />
              <FInput label={t('program_trackers.training_date')} type="date" value={trocaireForm.trainingDate} onChange={(e: any) => setTrocaireForm(p => ({ ...p, trainingDate: e.target.value }))} />
            </div>
            <FInput label={t('program_trackers.class_form')} value={trocaireForm.classForm} onChange={(e: any) => setTrocaireForm(p => ({ ...p, classForm: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <FInput label={t('program_trackers.students_trained_girls')} type="number" value={trocaireForm.studentsGirls} onChange={(e: any) => setTrocaireForm(p => ({ ...p, studentsGirls: e.target.value }))} />
              <FInput label={t('program_trackers.students_trained_boys')} type="number" value={trocaireForm.studentsBoys} onChange={(e: any) => setTrocaireForm(p => ({ ...p, studentsBoys: e.target.value }))} />
            </div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 pt-1">{t('program_trackers.safeguarding_sgbv_cases')}</div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label={t('program_trackers.sgbv_cases_girls')} type="number" value={trocaireForm.sgbvGirls} onChange={(e: any) => setTrocaireForm(p => ({ ...p, sgbvGirls: e.target.value }))} />
              <FInput label={t('program_trackers.sgbv_cases_boys')} type="number" value={trocaireForm.sgbvBoys} onChange={(e: any) => setTrocaireForm(p => ({ ...p, sgbvBoys: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label={t('program_trackers.other_gbv_girls')} type="number" value={trocaireForm.otherGbvGirls} onChange={(e: any) => setTrocaireForm(p => ({ ...p, otherGbvGirls: e.target.value }))} />
              <FInput label={t('program_trackers.other_gbv_boys')} type="number" value={trocaireForm.otherGbvBoys} onChange={(e: any) => setTrocaireForm(p => ({ ...p, otherGbvBoys: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Btn size="sm" variant="secondary" onClick={() => setEditingTrocaire(null)}>{t('program_trackers.cancel')}</Btn>
              <Btn size="sm" onClick={submitTrocaire}>{editingTrocaire.isNew ? t('program_trackers.save') : t('program_trackers.update')}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
