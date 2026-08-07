import React, { useState, useEffect } from 'react';
import { monthlyCaseReportsApi } from '../api';
import { User } from '../types';
import { Card, PageHeader, Btn } from './SubComponents';
import { CheckCircle2, Clock } from 'lucide-react';

interface MonthlyCaseReportReviewPageProps {
  user: User | null;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export const MonthlyCaseReportReviewPage: React.FC<MonthlyCaseReportReviewPageProps> = ({ user, showToast }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    monthlyCaseReportsApi.getPendingReview().then((data: any) => {
      setReports(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const approve = async (id: number) => {
    setApprovingId(id);
    try {
      const data = await monthlyCaseReportsApi.approve(id);
      if (data.error) { showToast(data.error, 'warning'); return; }
      showToast('Report approved and sent to the SASA Officer', 'success');
      setReports(prev => prev.filter(r => r.id !== id));
    } catch {
      showToast('Failed to approve report', 'error');
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <PageHeader
        title="Monthly Case Report Review"
        subtitle="Reports submitted by Field Officers in your district need your review before they're sent to the SASA Officer."
      />

      {loading ? (
        <div className="text-center py-12 text-sm text-black/40 dark:text-white/40">Loading…</div>
      ) : reports.length === 0 ? (
        <Card className="p-8 text-center">
          <CheckCircle2 size={28} className="mx-auto text-emerald-500 mb-2" />
          <p className="text-sm text-black dark:text-white font-semibold m-0">Nothing waiting for your review.</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Any new Field Officer submissions will show up here.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((r: any) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-amber-500" />
                    <h3 className="text-sm font-bold text-black dark:text-white m-0">
                      {MONTH_NAMES[r.month - 1]} {r.year} — {r.submitted_by_name}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Submitted {new Date(r.submitted_at).toLocaleDateString()} · {r.district}
                  </p>
                </div>
                <Btn size="sm" variant="primary" onClick={() => approve(r.id)} disabled={approvingId === r.id}>
                  <CheckCircle2 size={12} /> Approve & Send to SASA
                </Btn>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
                {[
                  { label: 'New Cases', value: r.new_cases_count },
                  { label: 'Referred', value: r.referred_count },
                  { label: 'Followed Up', value: r.followed_up_count },
                  { label: 'Concluded', value: r.concluded_count },
                  { label: 'Pending', value: r.pending_count },
                ].map(item => (
                  <div key={item.label} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/40 text-center">
                    <div className="text-base font-black text-black dark:text-white">{item.value ?? 0}</div>
                    <div className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">{item.label}</div>
                  </div>
                ))}
              </div>
              {r.key_achievements && (
                <div className="text-xs mb-2">
                  <span className="font-bold text-black dark:text-white">Key Achievements: </span>
                  <span className="text-slate-600 dark:text-slate-300">{r.key_achievements}</span>
                </div>
              )}
              {r.challenges && (
                <div className="text-xs mb-2">
                  <span className="font-bold text-black dark:text-white">Challenges: </span>
                  <span className="text-slate-600 dark:text-slate-300">{r.challenges}</span>
                </div>
              )}
              {r.notes && (
                <div className="text-xs">
                  <span className="font-bold text-black dark:text-white">Notes: </span>
                  <span className="text-slate-600 dark:text-slate-300">{r.notes}</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
