import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardList } from 'lucide-react';
import { Btn, FSelect, FArea, Modal, FInput } from './SubComponents';
import { monthlyCaseReportsApi } from '../api';
import { useCountry } from '../context/CountryContext';
import { User } from '../types';

const EXEMPT_ROLES = ['admin', 'sasa_officer', 'program_manager'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const MonthlyCaseReportBanner: React.FC<{ user: User | null; showToast: (msg: string, type?: 'success'|'warning'|'error'|'info') => void }> = ({ user, showToast }) => {
  const { activeCountry } = useCountry();
  const [status, setStatus] = useState<{ required: boolean; submitted?: boolean; month?: number; year?: number } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Section B: Case Summary
  const [newCasesCount, setNewCasesCount] = useState('0');
  const [referredCount, setReferredCount] = useState('0');
  const [followedUpCount, setFollowedUpCount] = useState('0');
  const [concludedCount, setConcludedCount] = useState('0');
  const [pendingCount, setPendingCount] = useState('0');

  // Section C: Activities
  const [breakingSilenceSessions, setBreakingSilenceSessions] = useState('0');
  const [peerCounsellingSessions, setPeerCounsellingSessions] = useState('0');
  const [tipolePamodziEnrolled, setTipolePamodziEnrolled] = useState('0');
  const [otherActivities, setOtherActivities] = useState('');

  // Sections D, E, F
  const [keyAchievements, setKeyAchievements] = useState('');
  const [challenges, setChallenges] = useState('');
  const [recommendations, setRecommendations] = useState('');

  useEffect(() => {
    if (!user || EXEMPT_ROLES.includes(user.role)) {
      setStatus({ required: false });
      return;
    }
    monthlyCaseReportsApi.getStatus().then((res: any) => setStatus(res)).catch(() => setStatus(null));
  }, [user]);

  if (!user || !status || !status.required || status.submitted) return null;

  const monthLabel = status.month ? `${MONTH_NAMES[status.month - 1]} ${status.year}` : '';

  const submit = async () => {
    setSubmitting(true);
    try {
      const country = (user as any).country || (activeCountry !== 'all' ? activeCountry : 'Malawi');
      const newCases = parseInt(newCasesCount) || 0;
      await monthlyCaseReportsApi.submit({
        country,
        district: user.district,
        month: status.month,
        year: status.year,
        hasCases: newCases > 0,
        casesCount: newCases,
        newCasesCount: newCases,
        referredCount: parseInt(referredCount) || 0,
        followedUpCount: parseInt(followedUpCount) || 0,
        concludedCount: parseInt(concludedCount) || 0,
        pendingCount: parseInt(pendingCount) || 0,
        breakingSilenceSessions: parseInt(breakingSilenceSessions) || 0,
        peerCounsellingSessions: parseInt(peerCounsellingSessions) || 0,
        tipolePamodziEnrolled: parseInt(tipolePamodziEnrolled) || 0,
        otherActivities,
        keyAchievements,
        challenges,
        recommendations,
      });
      showToast('Monthly case report submitted', 'success');
      setShowForm(false);
      setStatus(prev => prev ? { ...prev, submitted: true } : prev);
    } catch {
      showToast('Failed to submit monthly report', 'error');
    }
    setSubmitting(false);
  };

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/20 mb-4">
        <AlertTriangle size={18} className="text-amber-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-amber-800 dark:text-amber-300">Monthly Case Report Due</div>
          <div className="text-[11px] text-amber-700 dark:text-amber-400">
            Please submit your {monthLabel} case report — required even if you have nothing to report.
          </div>
        </div>
        <Btn size="sm" onClick={() => setShowForm(true)}>
          <ClipboardList size={13} /> Submit Now
        </Btn>
      </div>

      {showForm && (
        <Modal title={`Monthly Case Report — ${monthLabel}`} onClose={() => setShowForm(false)} width={560}>
          <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">

            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Section A — Basic Information</div>
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase">Reporting Month</div>
                  <div className="font-bold text-slate-700 dark:text-slate-200">{monthLabel}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase">District</div>
                  <div className="font-bold text-slate-700 dark:text-slate-200">{user.district || '—'}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-[9px] font-bold text-slate-400 uppercase">Person Submitting</div>
                  <div className="font-bold text-slate-700 dark:text-slate-200">{user.name}</div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Section B — Case Summary</div>
              <div className="grid grid-cols-2 gap-3">
                <FInput label="New cases identified" type="number" value={newCasesCount} onChange={(e: any) => setNewCasesCount(e.target.value)} />
                <FInput label="Cases referred" type="number" value={referredCount} onChange={(e: any) => setReferredCount(e.target.value)} />
                <FInput label="Cases followed up" type="number" value={followedUpCount} onChange={(e: any) => setFollowedUpCount(e.target.value)} />
                <FInput label="Cases concluded" type="number" value={concludedCount} onChange={(e: any) => setConcludedCount(e.target.value)} />
                <FInput label="Cases pending" type="number" value={pendingCount} onChange={(e: any) => setPendingCount(e.target.value)} />
              </div>
            </div>

            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Section C — Activities Conducted</div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <FInput label="'Breaking the Silence' sessions" type="number" value={breakingSilenceSessions} onChange={(e: any) => setBreakingSilenceSessions(e.target.value)} />
                <FInput label="Peer Counselling sessions" type="number" value={peerCounsellingSessions} onChange={(e: any) => setPeerCounsellingSessions(e.target.value)} />
                <FInput label="Learners enrolled — Tipole Pamodzi" type="number" value={tipolePamodziEnrolled} onChange={(e: any) => setTipolePamodziEnrolled(e.target.value)} />
              </div>
              <FArea label="Other activities (please specify)" value={otherActivities} onChange={(e: any) => setOtherActivities(e.target.value)} rows={2} />
            </div>

            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Section D — Key Achievements</div>
              <FArea label="" value={keyAchievements} onChange={(e: any) => setKeyAchievements(e.target.value)} rows={3} placeholder="What went well this month?" />
            </div>

            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Section E — Challenges</div>
              <FArea label="" value={challenges} onChange={(e: any) => setChallenges(e.target.value)} rows={3} placeholder="What obstacles did you face?" />
            </div>

            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Section F — Recommendations</div>
              <FArea label="" value={recommendations} onChange={(e: any) => setRecommendations(e.target.value)} rows={3} placeholder="What would help going forward?" />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Btn variant="secondary" onClick={() => setShowForm(false)}>Cancel</Btn>
              <Btn onClick={submit} disabled={submitting}>
                {submitting ? 'Submitting…' : <><CheckCircle2 size={13} /> Submit Report</>}
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
