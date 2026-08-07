import React, { useState, useEffect } from 'react';
import { sasaReportsApi } from '../api';
import { User, SasaMonthlyReport } from '../types';
import { Card, PageHeader, Badge } from './SubComponents';
import { FileText, Download } from 'lucide-react';

interface SasaReportsDCViewProps {
  user: User | null;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

const mapSasaReport = (r: any): SasaMonthlyReport => ({
  id: r.id,
  month: r.month,
  submittedBy: r.submitted_by_name || 'SASA Officer',
  submittedAt: r.submitted_at ? String(r.submitted_at).split('T')[0] : '',
  totalCases: r.total_cases,
  publicCases: r.public_cases,
  referrals: r.referrals,
  resolvedReferrals: r.resolved_referrals,
  highlights: r.highlights || '',
  challenges: r.challenges || '',
  recommendations: r.recommendations || '',
  status: r.status,
  hasAttachment: !!r.attachment_filename,
  attachmentFilename: r.attachment_filename || undefined,
});

const formatMonth = (m: string) => {
  const d = new Date(m + (m.length === 7 ? '-01' : ''));
  return isNaN(d.getTime()) ? m : d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
};

// Read-only view for District Coordinators -- the SASA Officer's monthly
// reports (submitted only) and their supporting documents, nothing else
// from the full SASA case-management workspace.
export const SasaReportsDCView: React.FC<SasaReportsDCViewProps> = ({ user }) => {
  const [reports, setReports] = useState<SasaMonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sasaReportsApi.getAll({ status: 'submitted' }).then((data: any) => {
      setReports(Array.isArray(data) ? data.map(mapSasaReport) : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4 animate-fade-in-up">
      <PageHeader
        title="SASA Monthly Reports"
        subtitle="Submitted monthly reports from your country's SASA Officer, and any supporting documents attached."
      />

      {loading ? (
        <div className="text-center py-12 text-sm text-black/40 dark:text-white/40">Loading…</div>
      ) : reports.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-sm text-black dark:text-white font-semibold m-0">No submitted reports yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map(r => (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h3 className="text-sm font-bold text-black dark:text-white m-0">{formatMonth(r.month)}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Submitted by {r.submittedBy} on {r.submittedAt}
                  </p>
                </div>
                <Badge text={r.status} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {[
                  { label: 'Total Cases', value: r.totalCases },
                  { label: 'Public Cases', value: r.publicCases },
                  { label: 'Referrals', value: r.referrals },
                  { label: 'Resolved', value: r.resolvedReferrals },
                ].map(s => (
                  <div key={s.label} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/40 text-center">
                    <div className="text-base font-black text-black dark:text-white">{s.value}</div>
                    <div className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">{s.label}</div>
                  </div>
                ))}
              </div>
              {r.highlights && (
                <div className="text-xs mb-2">
                  <span className="font-bold text-black dark:text-white">Highlights: </span>
                  <span className="text-slate-600 dark:text-slate-300">{r.highlights}</span>
                </div>
              )}
              {r.hasAttachment && (
                <a
                  href={sasaReportsApi.getAttachmentUrl(r.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-600)] hover:underline mt-1"
                >
                  <Download size={12} /> {r.attachmentFilename || 'Download document'}
                </a>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
