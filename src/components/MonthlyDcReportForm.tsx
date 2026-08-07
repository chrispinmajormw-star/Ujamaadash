import React, { useState } from 'react';
import { monthlyDcReportsApi } from '../api';
import { User } from '../types';
import { Card, PageHeader, Btn, FInput, FSelect, FArea } from './SubComponents';
import { Plus, Trash2, Upload } from 'lucide-react';

interface MonthlyDcReportFormProps {
  user: User | null;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

const blankRow = (fields: string[]) => Object.fromEntries(fields.map(f => [f, '']));

// Generic repeatable-row table editor, shared by all 5 tabular sections of the report
function RowTable({
  title, columns, rows, setRows,
}: {
  title: string;
  columns: { key: string; label: string; type?: string }[];
  rows: any[];
  setRows: (rows: any[]) => void;
}) {
  const addRow = () => setRows([...rows, blankRow(columns.map(c => c.key))]);
  const removeRow = (i: number) => setRows(rows.filter((_, idx) => idx !== i));
  const updateCell = (i: number, key: string, val: string) => {
    const next = [...rows];
    next[i] = { ...next[i], [key]: val };
    setRows(next);
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-black dark:text-white m-0">{title}</h4>
        <Btn size="sm" variant="secondary" onClick={addRow}><Plus size={13} /> Add Row</Btn>
      </div>
      {rows.length === 0 ? (
        <div className="text-xs text-slate-400 italic py-3 text-center">No rows yet — click "Add Row" to start.</div>
      ) : (
        <div className="space-y-3">
          {rows.map((row, i) => (
            <div key={i} className="p-3 rounded-lg border border-neutral-200 dark:border-slate-700 relative">
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
              >
                <Trash2 size={13} />
              </button>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pr-6">
                {columns.map(col => (
                  <FInput
                    key={col.key}
                    label={col.label}
                    type={col.type || 'text'}
                    value={row[col.key] || ''}
                    onChange={(e: any) => updateCell(i, col.key, e.target.value)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export const MonthlyDcReportForm: React.FC<MonthlyDcReportFormProps> = ({ user, showToast }) => {
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [caseManagementNotes, setCaseManagementNotes] = useState('');

  const [details, setDetails] = useState({
    projectTitle: '', reportingPeriod: '', reportMonth: new Date().toISOString().slice(0, 7) + '-01',
    reportedBy: user?.name || '', overallStatus: 'On track', dateSubmitted: new Date().toISOString().slice(0, 10),
  });

  const [scheduling, setScheduling] = useState<any[]>([]);
  const [logistics, setLogistics] = useState<any[]>([]);
  const [targets, setTargets] = useState<any[]>([]);
  const [stakeholders, setStakeholders] = useState<any[]>([]);
  const [activitySummary, setActivitySummary] = useState<any[]>([]);

  const [narrative, setNarrative] = useState({
    keyAchievements: '', challengesRecommendations: '', lessonsLearnt: '',
    risksIssues: '', plansNextMonth: '', conclusion: '',
  });

  const dc = (k: string) => (e: any) => setDetails(p => ({ ...p, [k]: e.target.value }));
  const nc = (k: string) => (e: any) => setNarrative(p => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    if (!details.reportMonth) { showToast('Reporting month is required', 'warning'); return; }
    if (!file) { showToast('Please attach the original document before submitting', 'warning'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(details).forEach(([k, v]) => fd.append(k, v as string));
      Object.entries(narrative).forEach(([k, v]) => fd.append(k, v as string));
      fd.append('scheduling', JSON.stringify(scheduling));
      fd.append('logistics', JSON.stringify(logistics));
      fd.append('targets', JSON.stringify(targets));
      fd.append('stakeholders', JSON.stringify(stakeholders));
      fd.append('activitySummary', JSON.stringify(activitySummary));
      fd.append('caseManagementNotes', caseManagementNotes);
      if (file) fd.append('attachment', file);

      const data = await monthlyDcReportsApi.submit(fd);
      if (data.error) { showToast(data.error, 'error'); return; }
      showToast('Monthly report submitted', 'success');
    } catch { showToast('Failed to submit report', 'error'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <PageHeader title="Monthly District Report" subtitle="One structured submission per month — the Regional/Program Manager gets an automatic summary, plus your attached original document" />

      <Card className="p-4 space-y-3">
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">1. Report Details</div>
        <div className="grid grid-cols-2 gap-3">
          <FInput label="Project Title" value={details.projectTitle} onChange={dc('projectTitle')} />
          <FInput label="Reporting Period (e.g. Quarter 3)" value={details.reportingPeriod} onChange={dc('reportingPeriod')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FInput label="Report Month" type="month" value={details.reportMonth.slice(0, 7)} onChange={(e: any) => setDetails(p => ({ ...p, reportMonth: e.target.value + '-01' }))} />
          <FInput label="Reported By" value={details.reportedBy} onChange={dc('reportedBy')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FSelect label="Overall Status" value={details.overallStatus} onChange={dc('overallStatus')}>
            <option>On track</option>
            <option>Behind schedule</option>
            <option>Off track</option>
          </FSelect>
          <FInput label="Date Submitted" type="date" value={details.dateSubmitted} onChange={dc('dateSubmitted')} />
        </div>
      </Card>

      <RowTable
        title="2. Scheduling"
        columns={[
          { key: 'activity', label: 'Activity' },
          { key: 'objective', label: 'Objective' },
          { key: 'plannedStart', label: 'Planned Start', type: 'date' },
          { key: 'plannedEnd', label: 'Planned End', type: 'date' },
          { key: 'actualStart', label: 'Actual Start', type: 'date' },
          { key: 'actualEnd', label: 'Actual End', type: 'date' },
          { key: 'responsible', label: 'Responsible' },
          { key: 'status', label: 'Status (G/Y/R)' },
        ]}
        rows={scheduling}
        setRows={setScheduling}
      />

      <RowTable
        title="3. Logistics & Financial Tracking"
        columns={[
          { key: 'date', label: 'Date', type: 'date' },
          { key: 'activity', label: 'Activity' },
          { key: 'project', label: 'Project' },
          { key: 'budgetedCost', label: 'Budgeted Cost', type: 'number' },
          { key: 'actualCost', label: 'Actual Cost', type: 'number' },
          { key: 'remarks', label: 'Remarks' },
        ]}
        rows={logistics}
        setRows={setLogistics}
      />

      <RowTable
        title="4. Targets & Achievements"
        columns={[
          { key: 'activity', label: 'Activity' },
          { key: 'target', label: 'Target' },
          { key: 'numberReached', label: 'Number Reached' },
          { key: 'cumulative', label: 'Cumulative' },
          { key: 'male', label: 'Male' },
          { key: 'female', label: 'Female' },
        ]}
        rows={targets}
        setRows={setTargets}
      />

      <Card className="p-4 space-y-2">
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">5. Case Management</div>
        <div className="text-xs text-slate-500 italic">
          Leave this blank and the report will automatically pull case numbers from the GBV case system for your district and reporting month. If you'd rather write your own summary instead, type it below and it will be used in place of the automatic pull.
        </div>
        <FArea
          label="Case Management Notes (optional)"
          value={caseManagementNotes}
          onChange={(e: any) => setCaseManagementNotes(e.target.value)}
          rows={3}
          placeholder="Leave blank to use the automatic GBV case summary, or type your own notes here..."
        />
      </Card>

      <RowTable
        title="6. Stakeholder Engagement"
        columns={[
          { key: 'stakeholder', label: 'Stakeholder' },
          { key: 'organization', label: 'Organization' },
          { key: 'activity', label: 'Activity' },
          { key: 'date', label: 'Date', type: 'date' },
          { key: 'contributionOutcome', label: 'Contribution/Outcome' },
        ]}
        rows={stakeholders}
        setRows={setStakeholders}
      />

      <RowTable
        title="7. Activity Summary"
        columns={[
          { key: 'activity', label: 'Activity' },
          { key: 'description', label: 'Description/Summary' },
        ]}
        rows={activitySummary}
        setRows={setActivitySummary}
      />

      <Card className="p-4 space-y-3">
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Narrative Sections</div>
        <FArea label="8. Key Achievements" value={narrative.keyAchievements} onChange={nc('keyAchievements')} rows={3} />
        <FArea label="9. Challenges & Recommendations" value={narrative.challengesRecommendations} onChange={nc('challengesRecommendations')} rows={3} />
        <FArea label="10. Lessons Learnt" value={narrative.lessonsLearnt} onChange={nc('lessonsLearnt')} rows={3} />
        <FArea label="11. Risks / Issues (if any)" value={narrative.risksIssues} onChange={nc('risksIssues')} rows={2} />
        <FArea label="12. Plans for Next Month" value={narrative.plansNextMonth} onChange={nc('plansNextMonth')} rows={3} />
        <FArea label="13. Conclusion" value={narrative.conclusion} onChange={nc('conclusion')} rows={3} />
      </Card>

      <Card className="p-4">
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Attach Original Report</div>
        <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-neutral-300 dark:border-slate-700 text-xs text-slate-500 cursor-pointer hover:border-[var(--brand-400)]">
          <Upload size={14} />
          {file ? file.name : 'Choose a PDF or Word document to attach (required)'}
          <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>
      </Card>

      <div className="flex justify-end pt-2">
        <Btn onClick={submit} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Monthly Report'}</Btn>
      </div>
    </div>
  );
};
