import React, { useState, useEffect } from 'react';
import { qaReportsApi, districtsApi } from '../api';
import { User } from '../types';
import { Kicker, FInput, FSelect, FArea, Btn } from './SubComponents';
import { CheckCircle2 } from 'lucide-react';

interface SubmitQAReportProps {
  user: User | null;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const SubmitQAReport: React.FC<SubmitQAReportProps> = ({ user, showToast }) => {
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    district: user?.district || '',
    school: '',
    visitDate: new Date().toISOString().slice(0, 10),
    gpsCaptured: false,
    attachmentsPresent: false,
    registerComplete: false,
    beneficiaryNumbersCorrect: true,
    notes: '',
  });

  useEffect(() => {
    const country = (user as any)?.country || 'Malawi';
    districtsApi.getAll(country).then((res: any) => {
      setDistrictOptions(Array.isArray(res) ? res.map((d: any) => d.name).sort() : []);
    });
  }, [user]);

  const sc = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }));
  const toggle = (k: string) => setForm(p => ({ ...p, [k]: !(p as any)[k] }));

  const submit = async () => {
    if (!form.district) {
      showToast('District is required', 'warning');
      return;
    }
    try {
      const data = await qaReportsApi.submit(form);
      if (data.error) { showToast(data.error, 'error'); return; }
      setDone(true);
      showToast('QA report submitted', 'success');
    } catch {
      showToast('Failed to submit QA report', 'error');
    }
  };

  if (done) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
          <CheckCircle2 size={28} className="text-emerald-500" />
        </div>
        <h2 className="text-lg font-bold text-black dark:text-white">QA Report Submitted</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Your report has been sent to the Quality Assurance Officer for review.
        </p>
        <Btn onClick={() => {
          setDone(false);
          setForm({ district: user?.district || '', school: '', visitDate: new Date().toISOString().slice(0, 10), gpsCaptured: false, attachmentsPresent: false, registerComplete: false, beneficiaryNumbersCorrect: true, notes: '' });
        }}>
          Submit Another
        </Btn>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in-up">
      <div>
        <Kicker text="Quality Assurance" />
        <h1 className="text-base font-bold text-black dark:text-white m-0">Submit QA Report</h1>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FSelect label="District *" value={form.district} onChange={sc('district')}>
            <option value="">Select district...</option>
            {districtOptions.map(d => <option key={d}>{d}</option>)}
          </FSelect>
          <FInput label="School (optional)" placeholder="e.g. Kawale Primary" value={form.school} onChange={sc('school')} />
        </div>
        <FInput label="Date of Visit" type="date" value={form.visitDate} onChange={sc('visitDate')} />

        <div className="pt-2 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Data Quality Checklist</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            ['gpsCaptured', 'GPS location captured'],
            ['attachmentsPresent', 'Attachments / photos present'],
            ['registerComplete', 'Attendance register complete'],
            ['beneficiaryNumbersCorrect', 'Beneficiary numbers correct'],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 p-2.5 rounded-lg border border-neutral-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={(form as any)[key]}
                onChange={() => toggle(key)}
                className="accent-[var(--brand)]"
              />
              {label}
            </label>
          ))}
        </div>

        <FArea label="Notes (optional)" placeholder="Any additional context for the QA Officer..." value={form.notes} onChange={sc('notes')} rows={3} />

        <div className="flex justify-end pt-2">
          <Btn onClick={submit}>Submit QA Report</Btn>
        </div>
      </div>
    </div>
  );
};
