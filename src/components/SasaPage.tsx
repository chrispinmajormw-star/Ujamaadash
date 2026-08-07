import React, { useState, useEffect } from 'react';
import { gbvCasesApi, caseReferralsApi, sasaReportsApi, monthlyCaseReportsApi } from '../api';
import { User, Report, CaseReferral, SasaMonthlyReport } from '../types';
import {
  REFERRAL_AGENCIES, REFERRAL_STATUS_CFG,
} from '../data';
import {
  Card, PageHeader, Btn, Pill, FilterBar, Badge,
  FInput, FArea, FSelect, Modal,
} from './SubComponents';
import { Inbox, ArrowRightCircle, FileBarChart, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { SasaCaseAnalytics } from './SasaCaseAnalytics';

interface SasaPageProps {
  user: User | null;
  reports: Report[];
  showToast: (msg: string) => void;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

const MONTH_NAMES_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const TODAY = new Date().toISOString().split('T')[0];
const CURRENT_MONTH = TODAY.slice(0, 7);

const formatMonth = (m: string) => {
  const [y, mo] = m.split('-');
  return new Date(Number(y), Number(mo) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
};

// Map snake_case API rows → camelCase frontend shapes
const mapReferral = (r: any): CaseReferral => ({
  id: r.id,
  caseId: r.case_id,
  caseSchool: r.case_school,
  caseDistrict: r.case_district,
  agency: r.agency,
  agencyLabel: r.agency_label,
  referredBy: r.referred_by_name || 'SASA Officer',
  referredAt: r.referred_at ? String(r.referred_at).split('T')[0] : TODAY,
  status: r.status,
  outcome: r.outcome || undefined,
  notes: r.notes || undefined,
});

const mapSasaReport = (r: any): SasaMonthlyReport => ({
  id: r.id,
  month: r.month,
  submittedBy: r.submitted_by_name || 'SASA Officer',
  submittedAt: r.submitted_at ? String(r.submitted_at).split('T')[0] : TODAY,
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

const StatusDot: React.FC<{ status: CaseReferral['status'] }> = ({ status }) => {
  const cfg = REFERRAL_STATUS_CFG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      {cfg.label}
    </span>
  );
};

// ─── TAB 1 — CASE INBOX ──────────────────────────────────────────────────────

const CaseInbox: React.FC<{
  reports: Report[];
  gbvCases: any[];
  setGbvCases: React.Dispatch<React.SetStateAction<any[]>>;
  referrals: CaseReferral[];
  onRefer: (item: any) => void;
  showToast: (msg: string) => void;
}> = ({ reports, gbvCases, setGbvCases, referrals, onRefer, showToast }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Report | null>(null);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);

  const referredIds = new Set(referrals.map(r => r.caseId));

  const filtered = reports.filter(r => {
    if (filter === 'pending' && r.status !== 'pending') return false;
    if (filter === 'public' && r.submitted_role !== 'public') return false;
    if (filter === 'referred' && !referredIds.has(r.id)) return false;
    const q = search.toLowerCase();
    if (q && !r.school.toLowerCase().includes(q) && !r.district.toLowerCase().includes(q)) return false;
    return true;
  });

  const totalPublic = reports.filter(r => r.submitted_role === 'public').length;

  return (
    <div>
      {/* summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Total Cases', value: gbvCases.length, icon: <Inbox size={15} /> },
          { label: 'New', value: gbvCases.filter(c => c.status === 'new').length, icon: <Clock size={15} /> },
          { label: 'In Progress', value: gbvCases.filter(c => c.status === 'in_progress').length, icon: <AlertCircle size={15} /> },
          { label: 'Resolved', value: gbvCases.filter(c => c.status === 'resolved').length, icon: <ArrowRightCircle size={15} /> },
        ].map((s, i) => (
          <div
            key={i}
            className="p-3 rounded-lg"
            style={{ background: 'linear-gradient(135deg,var(--brand),#c44d00)', boxShadow: '0 4px 14px rgba(232,93,4,0.22)' }}
          >
            <div className="flex items-center gap-1.5 mb-1 text-white/80 text-[10px] font-semibold uppercase tracking-wide">
              {s.icon}{s.label}
            </div>
            <div className="text-xl font-black text-white">{s.value}</div>
          </div>
        ))}
      </div>

      
      {/* GBV Cases from database */}
{gbvCases.length > 0 && (
  <div className="mt-4">
    <div className="text-[10px] font-bold uppercase tracking-wide text-red-600 mb-2">
      GBV Cases Assigned to You ({gbvCases.length})
    </div>
    <div className="space-y-2">
      {gbvCases.map(c => (
        <Card key={c.id} className="p-3">
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-bold text-sm text-black dark:text-white">{c.gbv_type}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                  c.status === 'new' ? 'bg-red-100 text-red-700' :
                  c.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {c.status.replace('_', ' ')}
                </span>
              </div>
              <div className="text-[11px] text-black/60 dark:text-white/60 mb-1">
                {c.district} {c.village ? `· ${c.village}` : ''} · {new Date(c.created_at).toLocaleDateString()}
              </div>
              <p className="text-xs text-black/70 dark:text-white/70 line-clamp-2">{c.description}</p>
              {c.contact_method && (
                <div className="text-[11px] text-[var(--brand-600)] mt-1">
                  Contact: {c.contact_method} {c.contact_details ? `— ${c.contact_details}` : '(not provided)'}
                </div>
              )}
            </div>
            <div className="flex gap-1 shrink-0 flex-wrap">
              {c.status === 'new' && (
                <Btn size="sm" variant="primary" onClick={async () => {
                  const data = await gbvCasesApi.updateStatus(c.id, 'in_progress');
                  if (data.error) { showToast(data.error, 'error'); return; }
                  setGbvCases(prev => prev.map(x => x.id === c.id ? { ...x, status: 'in_progress' } : x));
                  showToast('Case marked as in progress', 'success');
                }}>
                  Start Case
                </Btn>
              )}
              {c.status === 'in_progress' && (
                <Btn size="sm" variant="success" onClick={async () => {
                  const data = await gbvCasesApi.updateStatus(c.id, 'resolved');
                  if (data.error) { showToast(data.error, 'error'); return; }
                  setGbvCases(prev => prev.map(x => x.id === c.id ? { ...x, status: 'resolved' } : x));
                  showToast('Case marked as resolved', 'success');
                }}>
                  Resolve
                </Btn>
              )}
              {referredIds.has(c.id) ? (
                <Badge text="Referred" color="#6d28d9" bg="#ede9fe" />
              ) : (
                <Btn size="sm" variant="orange_ghost" onClick={() => onRefer(c)}>
                  Refer
                </Btn>
              )}
              <Btn size="sm" variant="secondary" onClick={() => setSelectedCase(c)}>
                View
              </Btn>
              <Btn size="sm" variant="danger" onClick={async () => {
                if (!window.confirm('Delete this case permanently? This cannot be undone.')) return;
                try {
                  await gbvCasesApi.delete(c.id);
                  setGbvCases(prev => prev.filter(x => x.id !== c.id));
                  showToast('Case deleted', 'success');
                } catch {
                  showToast('Failed to delete case', 'error');
                }
              }}>
                Delete
              </Btn>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
)}
      {selectedCase && (
        <Modal title={`Case — ${selectedCase.gbv_type}`} onClose={() => setSelectedCase(null)} width={520}>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-black/50 dark:text-white/50">Status:</span> <b className="capitalize">{selectedCase.status.replace('_', ' ')}</b></div>
              <div><span className="text-black/50 dark:text-white/50">District:</span> <b>{selectedCase.district || '—'}</b></div>
              <div><span className="text-black/50 dark:text-white/50">Village:</span> <b>{selectedCase.village || '—'}</b></div>
              <div><span className="text-black/50 dark:text-white/50">Country:</span> <b>{selectedCase.country || '—'}</b></div>
              <div><span className="text-black/50 dark:text-white/50">Reported by:</span> <b>{selectedCase.reported_by_type || '—'}</b></div>
              <div><span className="text-black/50 dark:text-white/50">Survivor safe:</span> <b>{selectedCase.survivor_safe || '—'}</b></div>
              <div><span className="text-black/50 dark:text-white/50">Age group:</span> <b>{selectedCase.survivor_age_group || '—'}</b></div>
              <div><span className="text-black/50 dark:text-white/50">Incident date:</span> <b>{selectedCase.incident_date ? new Date(selectedCase.incident_date).toLocaleDateString() : '—'}</b></div>
              <div><span className="text-black/50 dark:text-white/50">Submitted:</span> <b>{new Date(selectedCase.created_at).toLocaleDateString()}</b></div>
            </div>
            {selectedCase.immediate_needs && (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-black/40 dark:text-white/40 mb-1">Immediate Needs</div>
                <div className="text-xs">{selectedCase.immediate_needs}</div>
              </div>
            )}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-black/40 dark:text-white/40 mb-1">Description</div>
              <div className="text-xs bg-neutral-50 dark:bg-slate-900 p-3 rounded-lg border border-neutral-100 dark:border-slate-800">{selectedCase.description}</div>
            </div>
            {selectedCase.witness_statement && (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-black/40 dark:text-white/40 mb-1">Additional Information</div>
                <div className="text-xs bg-neutral-50 dark:bg-slate-900 p-3 rounded-lg border border-neutral-100 dark:border-slate-800">{selectedCase.witness_statement}</div>
              </div>
            )}
            {selectedCase.contact_method && (
              <div className="text-xs text-[var(--brand-600)]">
                Contact: {selectedCase.contact_method} {selectedCase.contact_details ? `— ${selectedCase.contact_details}` : '(not provided)'}
              </div>
            )}
            {selectedCase.full_name && (
              <div className="text-xs"><span className="text-black/50 dark:text-white/50">Full name:</span> <b>{selectedCase.full_name}</b></div>
            )}
          </div>
        </Modal>
      )}

      {selected && (
        <Modal title={`Case — ${selected.school}`} onClose={() => setSelected(null)} width={560}>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['District', selected.district],
                ['Zone', selected.zone],
                ['Curriculum', selected.curriculum],
                ['Session', selected.session],
                ['Boys', selected.boys],
                ['Girls', selected.girls],
                ['Submitted by', selected.submitted_by],
                ['Date', selected.submitted_at],
              ].map(([k, v]) => (
                <div key={String(k)}>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-black/50 dark:text-white/50 mb-0.5">{k}</div>
                  <div className="font-semibold text-black dark:text-white">{v}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-black/50 dark:text-white/50 mb-0.5">Challenges</div>
              <p className="text-black dark:text-white text-xs leading-relaxed">{selected.challenges || '—'}</p>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-black/50 dark:text-white/50 mb-0.5">Success</div>
              <p className="text-black dark:text-white text-xs leading-relaxed">{selected.success || '—'}</p>
            </div>
            <div className="flex gap-2 pt-2 justify-end">
              <Btn size="sm" variant="primary" onClick={() => { setSelected(null); onRefer(selected); }}>
                Refer this case
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── TAB 2 — REFERRALS ───────────────────────────────────────────────────────

const ReferralsTab: React.FC<{
  referrals: CaseReferral[];
  setReferrals: React.Dispatch<React.SetStateAction<CaseReferral[]>>;
  showToast: (m: string) => void;
  referTarget: any | null;
  clearReferTarget: () => void;
}> = ({ referrals, setReferrals, showToast, referTarget, clearReferTarget }) => {
  const [filter, setFilter] = useState('all');
  const [editId, setEditId] = useState<number | null>(null);
  const [outcome, setOutcome] = useState('');
  const [referModal, setReferModal] = useState<any | null>(referTarget);

  // keep modal in sync when parent sets a target
  React.useEffect(() => { if (referTarget) setReferModal(referTarget); }, [referTarget]);

  const [newRef, setNewRef] = useState({
    agency: REFERRAL_AGENCIES[0].id,
    notes: '',
  });

  const filtered = referrals.filter(r => {
    if (filter !== 'all' && r.status !== filter) return false;
    return true;
  });

  const submitReferral = async () => {
    if (!referModal) return;
    const agency = REFERRAL_AGENCIES.find(a => a.id === newRef.agency)!;
    try {
      const data = await caseReferralsApi.create({
        caseId: referModal.id,
        caseSchool: referModal.school || referModal.gbv_type || 'GBV Case',
        caseDistrict: referModal.district,
        agency: agency.id,
        agencyLabel: agency.label,
        notes: newRef.notes,
      });
      if (data.error) { showToast(`️ ${data.error}`, 'warning'); return; }
      setReferrals(prev => [mapReferral(data), ...prev]);
      showToast(`Case referred to ${agency.label}`);
      setReferModal(null);
      clearReferTarget();
      setNewRef({ agency: REFERRAL_AGENCIES[0].id, notes: '' });
    } catch {
      showToast('️ Failed to submit referral', 'warning');
    }
  };

  const updateStatus = async (id: number, status: CaseReferral['status']) => {
    const ref = referrals.find(r => r.id === id);
    if (!ref) return;
    try {
      const data = await caseReferralsApi.update(id, {
        agency: ref.agency,
        agencyLabel: ref.agencyLabel,
        status,
        outcome: status === 'resolved' ? outcome : ref.outcome,
        notes: ref.notes,
      });
      if (data.error) { showToast(`️ ${data.error}`, 'warning'); return; }
      setReferrals(prev => prev.map(r => r.id === id ? mapReferral(data) : r));
      setEditId(null);
      setOutcome('');
      showToast(`Referral marked as ${status}`);
    } catch {
      showToast('️ Failed to update referral', 'warning');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <FilterBar
          options={[
            { v: 'all', l: 'All' },
            { v: 'pending', l: 'Pending' },
            { v: 'in_progress', l: 'In Progress' },
            { v: 'resolved', l: 'Resolved' },
          ]}
          active={filter}
          onChange={setFilter}
        />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-black/40 dark:text-white/40">No referrals yet.</div>
        )}
        {filtered.map(ref => (
          <Card key={ref.id} className="p-4">
            <div className="flex flex-wrap items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-bold text-sm text-black dark:text-white">{ref.agencyLabel}</span>
                  <StatusDot status={ref.status} />
                </div>
                <div className="text-[11px] text-black/60 dark:text-white/60 mb-1">
                  {ref.caseSchool} · {ref.caseDistrict} · Referred {ref.referredAt}
                </div>
                {ref.notes && <div className="text-xs text-black/70 dark:text-white/70 italic">"{ref.notes}"</div>}
                {ref.outcome && (
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
                    Outcome: {ref.outcome}
                  </div>
                )}
              </div>
              <div className="flex gap-2 shrink-0 flex-wrap">
                {ref.status === 'pending' && (
                  <Btn size="sm" variant="secondary" onClick={() => updateStatus(ref.id, 'in_progress')}>
                    Mark In Progress
                  </Btn>
                )}
                {ref.status === 'in_progress' && (
                  <Btn size="sm" variant="success" onClick={() => { setEditId(ref.id); setOutcome(''); }}>
                    Resolve
                  </Btn>
                )}
              </div>
            </div>

            {/* inline resolve form */}
            {editId === ref.id && (
              <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-slate-800">
                <FInput
                  label="Outcome / resolution notes"
                  value={outcome}
                  onChange={e => setOutcome(e.target.value)}
                  placeholder="Describe what happened…"
                />
                <div className="flex gap-2 justify-end">
                  <Btn size="sm" variant="ghost" onClick={() => setEditId(null)}>Cancel</Btn>
                  <Btn size="sm" variant="success" onClick={() => updateStatus(ref.id, 'resolved')}>
                    <CheckCircle size={13} /> Confirm Resolved
                  </Btn>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* New referral modal */}
      {referModal && (
        <Modal title={`Refer — ${referModal.school}`} onClose={() => { setReferModal(null); clearReferTarget(); }} width={480}>
          <p className="text-xs text-black/60 dark:text-white/60 mb-4">
            Referring case from <strong>{referModal.district}</strong> — {referModal.session}
          </p>
          <FSelect
            label="Referring agency *"
            value={newRef.agency}
            onChange={e => setNewRef(p => ({ ...p, agency: e.target.value }))}
          >
            {REFERRAL_AGENCIES.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
          </FSelect>
          <FArea
            label="Notes (optional)"
            value={newRef.notes}
            onChange={e => setNewRef(p => ({ ...p, notes: e.target.value }))}
            placeholder="Any context for the receiving agency…"
            rows={3}
          />
          <div className="flex gap-2 justify-end mt-2">
            <Btn size="sm" variant="ghost" onClick={() => { setReferModal(null); clearReferTarget(); }}>Cancel</Btn>
            <Btn size="sm" variant="primary" onClick={submitReferral}>
              <ArrowRightCircle size={13} /> Submit Referral
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── TAB 3 — MONTHLY REPORTS ─────────────────────────────────────────────────

const MonthlyReports: React.FC<{
  sasaReports: SasaMonthlyReport[];
  setSasaReports: React.Dispatch<React.SetStateAction<SasaMonthlyReport[]>>;
  referrals: CaseReferral[];
  allCases: Report[];
  showToast: (m: string) => void;
  districtReports: any[];
}> = ({ sasaReports, setSasaReports, referrals, allCases, showToast, districtReports }) => {
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState<SasaMonthlyReport | null>(null);

  const [form, setForm] = useState({
    month: CURRENT_MONTH,
    highlights: '',
    challenges: '',
    recommendations: '',
  });
  const [attachment, setAttachment] = useState<File | null>(null);

  const sf = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async (asDraft: boolean) => {
    const monthCases = allCases.length;
    const publicCases = allCases.filter(r => r.submitted_role === 'public').length;
    const monthRefs = referrals.length;
    const resolved = referrals.filter(r => r.status === 'resolved').length;
    const status = asDraft ? 'draft' : 'submitted';

    try {
      const fd = new FormData();
      fd.append('month', form.month);
      fd.append('totalCases', String(monthCases));
      fd.append('publicCases', String(publicCases));
      fd.append('referrals', String(monthRefs));
      fd.append('resolvedReferrals', String(resolved));
      fd.append('highlights', form.highlights);
      fd.append('challenges', form.challenges);
      fd.append('recommendations', form.recommendations);
      fd.append('status', status);
      if (attachment) fd.append('attachment', attachment);
      const data = await sasaReportsApi.create(fd);
      if (data.error) { showToast(`️ ${data.error}`, 'warning'); return; }
      setSasaReports(prev => [mapSasaReport(data), ...prev]);
      setCreating(false);
      showToast(asDraft ? 'Report saved as draft' : 'Monthly report submitted');
      setForm({ month: CURRENT_MONTH, highlights: '', challenges: '', recommendations: '' });
      setAttachment(null);
    } catch {
      showToast('️ Failed to save report', 'warning');
    }
  };

  return (
    <div>
      {/* District Monthly Case Reports — submitted by TOTs, Field Officers, District Coordinators */}
      <div className="mt-8">
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">
          District Monthly Case Reports ({districtReports.length})
        </div>
        <div className="overflow-x-auto rounded-xl border border-neutral-100 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/40">
              <tr>
                <th className="px-3 py-2 font-bold text-slate-500">Month</th>
                <th className="px-3 py-2 font-bold text-slate-500">Submitted By</th>
                <th className="px-3 py-2 font-bold text-slate-500">District</th>
                <th className="px-3 py-2 font-bold text-slate-500">New Cases</th>
                <th className="px-3 py-2 font-bold text-slate-500">Referred</th>
                <th className="px-3 py-2 font-bold text-slate-500">Pending</th>
                <th className="px-3 py-2 font-bold text-slate-500">Submitted On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-slate-800">
              {districtReports.length === 0 ? (
                <tr><td colSpan={7} className="px-3 py-6 text-center text-slate-400">No district reports yet.</td></tr>
              ) : (
                districtReports.map((r: any) => (
                  <tr key={r.id}>
                    <td className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-200">{MONTH_NAMES_SHORT[r.month - 1]} {r.year}</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{r.submitted_by_name} <span className="text-slate-400">({r.submitted_by_role})</span></td>
                    <td className="px-3 py-2 text-slate-500">{r.district || '—'}</td>
                    <td className="px-3 py-2 font-bold">{r.new_cases_count ?? r.cases_count ?? 0}</td>
                    <td className="px-3 py-2">{r.referred_count ?? 0}</td>
                    <td className="px-3 py-2">{r.pending_count ?? 0}</td>
                    <td className="px-3 py-2 text-slate-400">{new Date(r.submitted_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create modal */}
      {creating && (
        <Modal title="New Monthly Report" onClose={() => setCreating(false)} width={560}>
          <p className="text-xs text-black/50 dark:text-white/50 mb-4">
            Case and referral counts are auto-calculated from live data.
          </p>
          <FSelect label="Reporting month *" value={form.month} onChange={sf('month')}>
            {Array.from({ length: 6 }, (_, i) => {
              const d = new Date();
              d.setMonth(d.getMonth() - i);
              const val = d.toISOString().slice(0, 7);
              return <option key={val} value={val}>{formatMonth(val)}</option>;
            })}
          </FSelect>
          <FArea label="Highlights *" value={form.highlights} onChange={sf('highlights')} rows={3} placeholder="Key achievements this month…" />
          <FArea label="Challenges" value={form.challenges} onChange={sf('challenges')} rows={2} placeholder="Issues encountered…" />
          <FArea label="Recommendations" value={form.recommendations} onChange={sf('recommendations')} rows={2} placeholder="Suggested improvements…" />
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5 block">Supporting Document (PDF or Word)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={e => setAttachment(e.target.files?.[0] || null)}
              className="w-full text-xs border border-neutral-200 dark:border-slate-700 rounded-lg px-2 py-2 bg-white dark:bg-slate-800 text-black dark:text-white"
            />
            {attachment && <p className="text-[10px] text-slate-500 mt-1">{attachment.name}</p>}
            <p className="text-[10px] text-slate-400 mt-1">Visible to your District Coordinator and to you.</p>
          </div>
          <div className="flex gap-2 justify-end mt-3">
            <Btn size="sm" variant="ghost" onClick={() => setCreating(false)}>Cancel</Btn>
            <Btn size="sm" variant="secondary" onClick={() => submit(true)}>Save Draft</Btn>
            <Btn size="sm" variant="primary" onClick={() => submit(false)}>Submit Report</Btn>
          </div>
        </Modal>
      )}

      {/* View modal */}
      {viewing && (
        <Modal title={`Report — ${formatMonth(viewing.month)}`} onClose={() => setViewing(null)} width={560}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Total Cases', value: viewing.totalCases },
              { label: 'Public Cases', value: viewing.publicCases },
              { label: 'Referrals', value: viewing.referrals },
              { label: 'Resolved', value: viewing.resolvedReferrals },
            ].map(s => (
              <div key={s.label} className="p-3 bg-[var(--brand-50)] dark:bg-[var(--brand-950)]/20 rounded-lg text-center">
                <div className="text-xl font-black text-[var(--brand-600)] dark:text-[var(--brand-400)]">{s.value}</div>
                <div className="text-[10px] font-semibold text-black/60 dark:text-white/60 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
          {viewing.hasAttachment && (
            <div className="mb-3">
              <div className="text-[10px] font-bold uppercase tracking-wide text-black/50 dark:text-white/50 mb-1">Supporting Document</div>
              <a
                href={sasaReportsApi.getAttachmentUrl(viewing.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--brand-600)] font-semibold hover:underline"
              >
                {viewing.attachmentFilename || 'Download document'}
              </a>
            </div>
          )}
          {[
            ['Highlights', viewing.highlights],
            ['Challenges', viewing.challenges],
            ['Recommendations', viewing.recommendations],
          ].map(([k, v]) => v && (
            <div key={String(k)} className="mb-3">
              <div className="text-[10px] font-bold uppercase tracking-wide text-black/50 dark:text-white/50 mb-1">{k}</div>
              <p className="text-sm text-black dark:text-white leading-relaxed">{v}</p>
            </div>
          ))}
          <div className="text-[10px] text-black/40 dark:text-white/40 mt-4">
            Submitted by {viewing.submittedBy} on {viewing.submittedAt}
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── MAIN SASA PAGE ──────────────────────────────────────────────────────────

export const SasaPage: React.FC<SasaPageProps> = ({ user, reports, showToast }) => {
  const [tab, setTab] = useState<'inbox' | 'analytics' | 'referrals' | 'monthly'>('inbox');
  const [referrals, setReferrals] = useState<CaseReferral[]>([]);
  const [sasaReports, setSasaReports] = useState<SasaMonthlyReport[]>([]);
  const [districtReports, setDistrictReports] = useState<any[]>([]);
  const [referTarget, setReferTarget] = useState<any | null>(null);

  const canAccess = user && (user.role === 'sasa_officer' || user.role === 'program_manager');
  const [gbvCases, setGbvCases] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role === 'sasa_officer' || user?.role === 'program_manager') {
      gbvCasesApi.getAll().then(setGbvCases);
      caseReferralsApi.getAll().then(data => setReferrals(data.map(mapReferral)));
      sasaReportsApi.getAll().then(data => setSasaReports(data.map(mapSasaReport)));
      monthlyCaseReportsApi.getAll().then(setDistrictReports).catch(() => {});
    }
  }, [user]);
  if (!canAccess) {
    return (
      <div className="p-12 text-center text-black/40 dark:text-white/40 font-semibold italic">
        This workspace is restricted to SASA Officers and Regional Managers.
      </div>
    );
  }

  const TABS = [
    { id: 'inbox', label: 'Case Inbox', icon: <Inbox size={14} /> },
    { id: 'analytics', label: 'Analytics', icon: <FileBarChart size={14} /> },
    { id: 'referrals', label: 'Referrals', icon: <ArrowRightCircle size={14} /> },
    { id: 'monthly', label: 'Monthly Reports', icon: <FileBarChart size={14} /> },
  ] as const;

  const handleRefer = (report: Report) => {
    setReferTarget(report);
    setTab('referrals');
  };

  return (
    <div>
      <PageHeader
        title="SASA Officer Workspace"
        subtitle="Case intake, referral tracking and monthly programme reports"
      />

      {/* tab bar */}
      <div className="flex gap-1 mb-5 border-b border-neutral-200 dark:border-slate-800 pb-0">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t-lg border-b-2 transition-all -mb-px ${
              tab === t.id
                ? 'border-[var(--brand-500)] text-[var(--brand-600)] dark:text-[var(--brand-400)] bg-[var(--brand-50)] dark:bg-[var(--brand-950)]/20'
                : 'border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'
            }`}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {tab === 'inbox' && (
  <CaseInbox reports={reports} gbvCases={gbvCases} setGbvCases={setGbvCases} referrals={referrals} onRefer={handleRefer} showToast={showToast} />
)}
      {tab === 'analytics' && (
        <SasaCaseAnalytics cases={gbvCases} />
      )}
      {tab === 'referrals' && (
        <ReferralsTab
          referrals={referrals}
          setReferrals={setReferrals}
          showToast={showToast}
          referTarget={referTarget}
          clearReferTarget={() => setReferTarget(null)}
        />
      )}
      {tab === 'monthly' && (
        <MonthlyReports
          sasaReports={sasaReports}
          districtReports={districtReports}
          setSasaReports={setSasaReports}
          referrals={referrals}
          allCases={reports}
          showToast={showToast}
        />
      )}
    </div>
  );
};