import React, { useState, useEffect } from 'react';
import { monthlyDcReportsApi } from '../api';
import { useCountry } from '../context/CountryContext';
import { Card, PageHeader, Btn, Badge, Modal } from './SubComponents';
import { Download, FileText } from 'lucide-react';

export const MonthlyDcReportsSummary: React.FC = () => {
  const { activeCountry } = useCountry();
  const [reports, setReports] = useState<any[]>([]);
  const [viewing, setViewing] = useState<any | null>(null);
  const [detail, setDetail] = useState<any | null>(null);

  useEffect(() => {
    monthlyDcReportsApi.getLatestSummary(activeCountry).then((res: any) => setReports(Array.isArray(res) ? res : [])).catch(() => {});
  }, [activeCountry]);

  const openView = async (r: any) => {
    setViewing(r);
    setDetail(null);
    try {
      const full = await monthlyDcReportsApi.getOne(r.id);
      setDetail(full);
    } catch { /* leave detail null, still shows the summary fields we already have */ }
  };

  const statusBadge = (s: string) => {
    if (s === 'On track') return <Badge text={s} color="#065f46" bg="#dcfce7" />;
    if (s === 'Behind schedule') return <Badge text={s} color="#92400e" bg="#fef3c7" />;
    if (s === 'Off track') return <Badge text={s} color="#991b1b" bg="#fee2e2" />;
    return <Badge text={s || 'Unknown'} color="#475569" bg="#f1f5f9" />;
  };

  return (
    <div>
      <PageHeader title="District Monthly Reports" subtitle="Latest submitted report per district — summary first, full detail on request" />

      {reports.length === 0 ? (
        <Card className="p-8 text-center text-slate-400 text-sm">No monthly reports submitted yet.</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((r: any) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-bold text-black dark:text-white text-sm">{r.district}</div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(r.report_month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} · {r.submitted_by_name}
                  </div>
                </div>
                {statusBadge(r.overall_status)}
              </div>
              {r.key_achievements && (
                <div className="text-xs text-slate-600 dark:text-slate-300 mb-1">
                  <span className="font-semibold">Key achievements:</span> {r.key_achievements.slice(0, 140)}{r.key_achievements.length > 140 ? '…' : ''}
                </div>
              )}
              {r.challenges_recommendations && (
                <div className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                  <span className="font-semibold">Challenges:</span> {r.challenges_recommendations.slice(0, 140)}{r.challenges_recommendations.length > 140 ? '…' : ''}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Btn size="sm" onClick={() => openView(r)}><FileText size={13} /> View Full Report</Btn>
                {r.attachment_filename && (
                  <Btn size="sm" variant="secondary" onClick={() => window.open(monthlyDcReportsApi.getDownloadUrl(r.id), '_blank')}>
                    <Download size={13} /> Original Document
                  </Btn>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {viewing && (
        <Modal title={`${viewing.district} — ${new Date(viewing.report_month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`} onClose={() => setViewing(null)} width={720}>
          {!detail ? (
            <div className="text-xs text-slate-400 text-center py-8">Loading full report…</div>
          ) : (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div>
                <div className="font-bold text-slate-500 uppercase text-[10px] mb-1">Report Details</div>
                <div>Project: {detail.project_title || '—'} · Period: {detail.reporting_period || '—'} · Status: {detail.overall_status}</div>
                <div>Reported by: {detail.reported_by} · Submitted: {detail.date_submitted ? new Date(detail.date_submitted).toLocaleDateString() : '—'}</div>
              </div>

              {[
                { title: 'Scheduling', rows: detail.scheduling, cols: ['activity', 'objective', 'planned_start', 'planned_end', 'actual_start', 'actual_end', 'responsible', 'status'] },
                { title: 'Logistics & Financial Tracking', rows: detail.logistics, cols: ['activity_date', 'activity', 'project', 'budgeted_cost', 'actual_cost', 'remarks'] },
                { title: 'Targets & Achievements', rows: detail.targets, cols: ['activity', 'target', 'number_reached', 'cumulative', 'male', 'female'] },
                { title: 'Stakeholder Engagement', rows: detail.stakeholders, cols: ['stakeholder', 'organization', 'activity', 'event_date', 'contribution_outcome'] },
                { title: 'Activity Summary', rows: detail.activitySummary, cols: ['activity', 'description'] },
              ].map(section => (
                section.rows && section.rows.length > 0 && (
                  <div key={section.title}>
                    <div className="font-bold text-slate-500 uppercase text-[10px] mb-1">{section.title}</div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead><tr>{section.cols.map(c => <th key={c} className="px-2 py-1 bg-slate-50 dark:bg-slate-900/40 font-semibold">{c.replace(/_/g, ' ')}</th>)}</tr></thead>
                        <tbody>
                          {section.rows.map((row: any, i: number) => (
                            <tr key={i} className="border-t border-neutral-100 dark:border-slate-800">
                              {section.cols.map(c => <td key={c} className="px-2 py-1">{row[c] ?? '—'}</td>)}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              ))}

              {detail.caseManagement && detail.caseManagement.length > 0 && (
                <div>
                  <div className="font-bold text-slate-500 uppercase text-[10px] mb-1">Case Management (live from GBV cases)</div>
                  <table className="w-full text-left border-collapse">
                    <thead><tr>
                      <th className="px-2 py-1 bg-slate-50 dark:bg-slate-900/40 font-semibold">Case Type</th>
                      <th className="px-2 py-1 bg-slate-50 dark:bg-slate-900/40 font-semibold">Reported M</th>
                      <th className="px-2 py-1 bg-slate-50 dark:bg-slate-900/40 font-semibold">Reported F</th>
                      <th className="px-2 py-1 bg-slate-50 dark:bg-slate-900/40 font-semibold">Concluded M</th>
                      <th className="px-2 py-1 bg-slate-50 dark:bg-slate-900/40 font-semibold">Concluded F</th>
                    </tr></thead>
                    <tbody>
                      {detail.caseManagement.map((c: any, i: number) => (
                        <tr key={i} className="border-t border-neutral-100 dark:border-slate-800">
                          <td className="px-2 py-1">{c.gbv_type}</td>
                          <td className="px-2 py-1">{c.reported_male}</td>
                          <td className="px-2 py-1">{c.reported_female}</td>
                          <td className="px-2 py-1">{c.concluded_male}</td>
                          <td className="px-2 py-1">{c.concluded_female}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {[
                ['Key Achievements', detail.key_achievements],
                ['Challenges & Recommendations', detail.challenges_recommendations],
                ['Lessons Learnt', detail.lessons_learnt],
                ['Risks / Issues', detail.risks_issues],
                ['Plans for Next Month', detail.plans_next_month],
                ['Conclusion', detail.conclusion],
              ].map(([label, text]) => text && (
                <div key={label as string}>
                  <div className="font-bold text-slate-500 uppercase text-[10px] mb-1">{label}</div>
                  <div className="whitespace-pre-line text-slate-700 dark:text-slate-300">{text as string}</div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
