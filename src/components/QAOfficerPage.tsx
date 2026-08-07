import React, { useState, useEffect } from 'react';
import { qaReportsApi } from '../api';
import { useCountry } from '../context/CountryContext';
import { User } from '../types';
import { Card, PageHeader, Btn, Badge, Modal, FArea, FSelect } from './SubComponents';
import { ClipboardCheck, Clock, CheckCircle2, RotateCcw, XCircle, MapPin, Paperclip, UserCog } from 'lucide-react';

interface QAOfficerPageProps {
  user: User | null;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: '#92400e', bg: '#fef9c3' },
  verified: { label: 'Verified', color: '#065f46', bg: '#dcfce7' },
  returned: { label: 'Returned', color: '#9a3412', bg: '#ffedd5' },
  rejected: { label: 'Rejected', color: '#991b1b', bg: '#fee2e2' },
};

export const QAOfficerPage: React.FC<QAOfficerPageProps> = ({ user, showToast }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, pending: 0, verified: 0, returned: 0, rejected: 0, complianceRate: 0 });
  const [compliance, setCompliance] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [reviewing, setReviewing] = useState<any | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reassigning, setReassigning] = useState<any | null>(null);
  const [qaOfficers, setQaOfficers] = useState<any[]>([]);
  const [reassignTo, setReassignTo] = useState('');

  const canAccess = user && (user.role === 'qa_officer' || user.role === 'admin' || user.role === 'program_manager');

  const { activeCountry } = useCountry();

  const load = () => {
    qaReportsApi.getAll(activeCountry).then(setReports).catch(() => {});
    qaReportsApi.getStats(activeCountry).then(setStats).catch(() => {});
    qaReportsApi.getCompliance(activeCountry).then(setCompliance).catch(() => {});
  };

  useEffect(() => { if (canAccess) load(); }, [user, activeCountry]);
  useEffect(() => {
    if (user?.role === 'admin') qaReportsApi.getOfficers().then(setQaOfficers).catch(() => {});
  }, [user]);

  if (!canAccess) {
    return (
      <div className="p-12 text-center text-black/40 dark:text-white/40 font-semibold italic">
        This workspace is restricted to Quality Assurance Officers.
      </div>
    );
  }

  const filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter);

  const submitReview = async (status: string) => {
    if (!reviewing) return;
    try {
      await qaReportsApi.review(reviewing.id, status, reviewNotes);
      showToast(`Report marked as ${status}`, 'success');
      setReviewing(null);
      setReviewNotes('');
      load();
    } catch {
      showToast('Failed to submit review', 'error');
    }
  };

  const submitReassign = async () => {
    if (!reassigning || !reassignTo) return;
    try {
      const data = await qaReportsApi.reassign(reassigning.id, reassignTo);
      if (data.error) { showToast(data.error, 'warning'); return; }
      showToast('Report reassigned', 'success');
      setReassigning(null);
      setReassignTo('');
      load();
    } catch {
      showToast('Failed to reassign', 'error');
    }
  };

  const KPIS = [
    { label: 'Total Reports', value: stats.total, icon: <ClipboardCheck size={15} /> },
    { label: 'Pending Review', value: stats.pending, icon: <Clock size={15} /> },
    { label: 'Verified', value: stats.verified, icon: <CheckCircle2 size={15} /> },
    { label: 'Returned', value: stats.returned, icon: <RotateCcw size={15} /> },
    { label: 'Compliance Rate', value: `${stats.complianceRate}%`, icon: <MapPin size={15} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Quality Assurance Workspace"
        subtitle="Review field data-quality reports and track district compliance"
      />

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        {KPIS.map((k, i) => (
          <div
            key={i}
            className="p-3 rounded-lg"
            style={{ background: 'linear-gradient(135deg,var(--brand),#c44d00)', boxShadow: '0 4px 14px rgba(232,93,4,0.22)' }}
          >
            <div className="flex items-center gap-1.5 mb-1 text-white/80 text-[10px] font-semibold uppercase tracking-wide">
              {k.icon}{k.label}
            </div>
            <div className="text-xl font-black text-white">{k.value}</div>
          </div>
        ))}
      </div>

      <Card className="p-0 overflow-hidden mb-5">
        <div className="px-4 py-3 border-b border-neutral-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs font-bold text-black dark:text-white">Review Queue</div>
          <div className="flex gap-1">
            {['all', 'pending', 'verified', 'returned', 'rejected'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                  filter === f
                    ? 'bg-[var(--brand-600)] text-white border-[var(--brand-600)]'
                    : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                }`}
              >
                {f === 'all' ? 'All' : STATUS_CFG[f]?.label}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-neutral-100 dark:divide-slate-800 max-h-[28rem] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No reports match this filter.</div>
          ) : (
            filtered.map(r => (
              <div key={r.id} className="px-4 py-3 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-black dark:text-white">
                    {r.district}{r.school ? ` — ${r.school}` : ''}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {r.submitted_by_name} ({r.submitted_by_role}) · {new Date(r.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 shrink-0">
                  <span>{r.gps_captured ? '✓ GPS' : '✗ GPS'}</span>
                  <span>{r.attachments_present ? '✓ Attachments' : '✗ Attachments'}</span>
                  <span>{r.register_complete ? '✓ Register' : '✗ Register'}</span>
                </div>
                {r.attachment_path && (
                  <button
                    onClick={() => window.open(qaReportsApi.getAttachmentUrl(r.id), '_blank')}
                    className="flex items-center gap-1 text-[10px] font-bold text-[var(--brand-600)] hover:underline shrink-0"
                  >
                    <Paperclip size={11} /> File
                  </button>
                )}
                <Badge text={STATUS_CFG[r.status]?.label || r.status} color={STATUS_CFG[r.status]?.color} bg={STATUS_CFG[r.status]?.bg} />
                {r.status === 'pending' && user?.role === 'qa_officer' && (
                  <Btn size="sm" variant="primary" onClick={() => { setReviewing(r); setReviewNotes(''); }}>
                    Review
                  </Btn>
                )}
                {user?.role === 'admin' && (
                  <Btn size="sm" variant="secondary" onClick={() => { setReassigning(r); setReassignTo(''); }}>
                    <UserCog size={12} /> Reassign
                  </Btn>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-100 dark:border-slate-800">
          <div className="text-xs font-bold text-black dark:text-white">District Compliance</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/40">
              <tr>
                <th className="px-4 py-2 font-bold text-slate-500">District</th>
                <th className="px-4 py-2 font-bold text-slate-500">Total Submitted</th>
                <th className="px-4 py-2 font-bold text-slate-500">Verified</th>
                <th className="px-4 py-2 font-bold text-slate-500">This Month</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-slate-800">
              {compliance.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">No district data yet.</td></tr>
              ) : (
                compliance.map((c: any) => (
                  <tr key={c.district}>
                    <td className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-200">{c.district}</td>
                    <td className="px-4 py-2">{c.submitted}</td>
                    <td className="px-4 py-2">{c.verified}</td>
                    <td className="px-4 py-2">
                      {Number(c.submitted_this_month) > 0 ? (
                        <Badge text={`${c.submitted_this_month} filed`} color="#065f46" bg="#dcfce7" />
                      ) : (
                        <Badge text="None yet" color="#991b1b" bg="#fee2e2" />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {reviewing && (
        <Modal title={`Review — ${reviewing.district}`} onClose={() => setReviewing(null)} width={480}>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
              <div>GPS captured: <b>{reviewing.gps_captured ? 'Yes' : 'No'}</b></div>
              <div>Attachments: <b>{reviewing.attachments_present ? 'Yes' : 'No'}</b></div>
              <div>Register complete: <b>{reviewing.register_complete ? 'Yes' : 'No'}</b></div>
              <div>Beneficiary #s correct: <b>{reviewing.beneficiary_numbers_correct ? 'Yes' : 'No'}</b></div>
            </div>
            {reviewing.attachment_path && (
              <button
                onClick={() => window.open(qaReportsApi.getAttachmentUrl(reviewing.id), '_blank')}
                className="flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-600)] hover:underline"
              >
                <Paperclip size={13} /> {reviewing.attachment_filename || 'View attached evidence'}
              </button>
            )}
            {reviewing.notes && (
              <div className="text-xs bg-neutral-50 dark:bg-slate-900 p-3 rounded-lg border border-neutral-100 dark:border-slate-800">
                {reviewing.notes}
              </div>
            )}
            <FArea label="Review Notes (optional)" value={reviewNotes} onChange={(e: any) => setReviewNotes(e.target.value)} rows={3} placeholder="Any feedback or required corrections..." />
            <div className="flex gap-2 justify-end pt-2">
              <Btn size="sm" variant="danger" onClick={() => submitReview('rejected')}>
                <XCircle size={13} /> Reject
              </Btn>
              <Btn size="sm" variant="secondary" onClick={() => submitReview('returned')}>
                <RotateCcw size={13} /> Return for Correction
              </Btn>
              <Btn size="sm" variant="success" onClick={() => submitReview('verified')}>
                <CheckCircle2 size={13} /> Verify
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {reassigning && (
        <Modal title={`Reassign — ${reassigning.district}`} onClose={() => setReassigning(null)} width={420}>
          <div className="space-y-3">
            <FSelect label="Assign to QA Officer" value={reassignTo} onChange={(e: any) => setReassignTo(e.target.value)}>
              <option value="">Select an officer...</option>
              {qaOfficers.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </FSelect>
            <div className="flex justify-end gap-2 pt-2">
              <Btn size="sm" variant="secondary" onClick={() => setReassigning(null)}>Cancel</Btn>
              <Btn size="sm" onClick={submitReassign} disabled={!reassignTo}>Reassign</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
