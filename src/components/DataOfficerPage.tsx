import React, { useState, useEffect } from 'react';
import {
  ClipboardList, MapPin, AlertTriangle, Plus, Save, CheckCircle,
  ChevronDown, ChevronUp, Calendar, BarChart2, Trash2
} from 'lucide-react';
import { User } from '../types';
import { monitoringApi } from '../api';
import { Card, Kicker, PageHeader, Btn, FInput, FSelect, StatCard, Badge } from './SubComponents';

interface DataOfficerPageProps {
  user: User;
  showToast: (msg: string) => void;
}

type TabId = 'activities' | 'issues' | 'history';

// ─── Seed data matching analytics charts ─────────────────────────────────────
const SEED_ACTIVITIES = [
  { id: 1, district: 'Lilongwe', month: 'Jan 2026', teachbacks: 8, pea_monitoring: 5, cluster_meetings: 4, issue_based: 3, routine: 6, submitted_by: 'Data Officer', created_at: '2026-01-31' },
  { id: 2, district: 'Blantyre', month: 'Jan 2026', teachbacks: 6, pea_monitoring: 4, cluster_meetings: 3, issue_based: 2, routine: 5, submitted_by: 'Data Officer', created_at: '2026-01-31' },
  { id: 3, district: 'Mzimba',   month: 'Feb 2026', teachbacks: 5, pea_monitoring: 3, cluster_meetings: 5, issue_based: 1, routine: 4, submitted_by: 'Data Officer', created_at: '2026-02-28' },
  { id: 4, district: 'Mangochi', month: 'Feb 2026', teachbacks: 7, pea_monitoring: 4, cluster_meetings: 2, issue_based: 4, routine: 3, submitted_by: 'Data Officer', created_at: '2026-02-28' },
  { id: 5, district: 'Zomba',    month: 'Mar 2026', teachbacks: 4, pea_monitoring: 6, cluster_meetings: 3, issue_based: 2, routine: 5, submitted_by: 'Data Officer', created_at: '2026-03-31' },
  { id: 6, district: 'Kasungu',  month: 'Mar 2026', teachbacks: 9, pea_monitoring: 3, cluster_meetings: 6, issue_based: 1, routine: 4, submitted_by: 'Data Officer', created_at: '2026-03-31' },
  { id: 7, district: 'Lilongwe', month: 'Apr 2026', teachbacks: 10, pea_monitoring: 7, cluster_meetings: 5, issue_based: 3, routine: 7, submitted_by: 'Data Officer', created_at: '2026-04-30' },
  { id: 8, district: 'Blantyre', month: 'Apr 2026', teachbacks: 7, pea_monitoring: 5, cluster_meetings: 4, issue_based: 2, routine: 6, submitted_by: 'Data Officer', created_at: '2026-04-30' },
];

const SEED_ISSUES = [
  { id: 1, district: 'Lilongwe', month: 'Jan 2026', teacher_transfers: 3, lack_of_interest: 5, other_issues: 2, lack_of_admin_support: 1, learner_behaviour: 4, submitted_by: 'Data Officer', created_at: '2026-01-31' },
  { id: 2, district: 'Blantyre', month: 'Jan 2026', teacher_transfers: 2, lack_of_interest: 3, other_issues: 1, lack_of_admin_support: 2, learner_behaviour: 2, submitted_by: 'Data Officer', created_at: '2026-01-31' },
  { id: 3, district: 'Mzimba',   month: 'Feb 2026', teacher_transfers: 4, lack_of_interest: 2, other_issues: 3, lack_of_admin_support: 0, learner_behaviour: 3, submitted_by: 'Data Officer', created_at: '2026-02-28' },
  { id: 4, district: 'Mangochi', month: 'Feb 2026', teacher_transfers: 1, lack_of_interest: 6, other_issues: 2, lack_of_admin_support: 3, learner_behaviour: 5, submitted_by: 'Data Officer', created_at: '2026-02-28' },
  { id: 5, district: 'Zomba',    month: 'Mar 2026', teacher_transfers: 2, lack_of_interest: 4, other_issues: 1, lack_of_admin_support: 2, learner_behaviour: 3, submitted_by: 'Data Officer', created_at: '2026-03-31' },
  { id: 6, district: 'Kasungu',  month: 'Mar 2026', teacher_transfers: 5, lack_of_interest: 3, other_issues: 4, lack_of_admin_support: 1, learner_behaviour: 2, submitted_by: 'Data Officer', created_at: '2026-03-31' },
  { id: 7, district: 'Lilongwe', month: 'Apr 2026', teacher_transfers: 2, lack_of_interest: 4, other_issues: 2, lack_of_admin_support: 2, learner_behaviour: 3, submitted_by: 'Data Officer', created_at: '2026-04-30' },
  { id: 8, district: 'Blantyre', month: 'Apr 2026', teacher_transfers: 3, lack_of_interest: 2, other_issues: 1, lack_of_admin_support: 1, learner_behaviour: 4, submitted_by: 'Data Officer', created_at: '2026-04-30' },
];

const DISTRICTS = ['Lilongwe','Blantyre','Mzimba','Mangochi','Zomba','Kasungu','Karonga','Dedza','Dowa','Ntcheu','Salima','Chiradzulu','Thyolo','Mulanje','Phalombe','Balaka','Machinga','Chiradzulu','Nsanje','Chikwawa'];
const MONTHS = ['Jan 2026','Feb 2026','Mar 2026','Apr 2026','May 2026','Jun 2026','Jul 2026','Aug 2026','Sep 2026','Oct 2026','Nov 2026','Dec 2026'];

const BLANK_ACTIVITY = { district: '', month: '', teachbacks: '', pea_monitoring: '', cluster_meetings: '', issue_based: '', routine: '' };
const BLANK_ISSUE = { district: '', month: '', teacher_transfers: '', lack_of_interest: '', other_issues: '', lack_of_admin_support: '', learner_behaviour: '' };

export const DataOfficerPage: React.FC<DataOfficerPageProps> = ({ user, showToast }) => {
  const [tab, setTab] = useState<TabId>('activities');
  const [activities, setActivities] = useState(SEED_ACTIVITIES);
  const [issues, setIssues] = useState(SEED_ISSUES);
  const [actForm, setActForm] = useState({ ...BLANK_ACTIVITY });
  const [issueForm, setIssueForm] = useState({ ...BLANK_ISSUE });
  const [saving, setSaving] = useState(false);
  const [expandedHistory, setExpandedHistory] = useState<number | null>(null);

  // Load from API on mount
  useEffect(() => {
    monitoringApi.getActivities().then(data => {
      if (Array.isArray(data) && data.length > 0) setActivities(data);
    });
    monitoringApi.getIssues().then(data => {
      if (Array.isArray(data) && data.length > 0) setIssues(data);
    });
  }, []);

  const submitActivity = async () => {
    if (!actForm.district || !actForm.month) { showToast('⚠️ District and month are required'); return; }
    setSaving(true);
    const payload = {
      district: actForm.district, month: actForm.month,
      teachbacks: parseInt(actForm.teachbacks) || 0,
      pea_monitoring: parseInt(actForm.pea_monitoring) || 0,
      cluster_meetings: parseInt(actForm.cluster_meetings) || 0,
      issue_based: parseInt(actForm.issue_based) || 0,
      routine: parseInt(actForm.routine) || 0,
      submitted_by: user.name,
    };
    try {
      const data = await monitoringApi.submitActivity(payload);
      const newRecord = data.id ? data : { ...payload, id: Date.now(), created_at: new Date().toISOString().split('T')[0] };
      setActivities(p => [newRecord, ...p]);
      setActForm({ ...BLANK_ACTIVITY });
      showToast('✅ Monitoring activities saved');
    } catch {
      // Optimistic fallback
      setActivities(p => [{ ...payload, id: Date.now(), created_at: new Date().toISOString().split('T')[0] }, ...p]);
      setActForm({ ...BLANK_ACTIVITY });
      showToast('✅ Activities saved locally');
    }
    setSaving(false);
  };

  const submitIssue = async () => {
    if (!issueForm.district || !issueForm.month) { showToast('⚠️ District and month are required'); return; }
    setSaving(true);
    const payload = {
      district: issueForm.district, month: issueForm.month,
      teacher_transfers: parseInt(issueForm.teacher_transfers) || 0,
      lack_of_interest: parseInt(issueForm.lack_of_interest) || 0,
      other_issues: parseInt(issueForm.other_issues) || 0,
      lack_of_admin_support: parseInt(issueForm.lack_of_admin_support) || 0,
      learner_behaviour: parseInt(issueForm.learner_behaviour) || 0,
      submitted_by: user.name,
    };
    try {
      const data = await monitoringApi.submitIssue(payload);
      const newRecord = data.id ? data : { ...payload, id: Date.now(), created_at: new Date().toISOString().split('T')[0] };
      setIssues(p => [newRecord, ...p]);
      setIssueForm({ ...BLANK_ISSUE });
      showToast('✅ Prevailing issues saved');
    } catch {
      setIssues(p => [{ ...payload, id: Date.now(), created_at: new Date().toISOString().split('T')[0] }, ...p]);
      setIssueForm({ ...BLANK_ISSUE });
      showToast('✅ Issues saved locally');
    }
    setSaving(false);
  };

  // Summary totals for stat cards
  const totalTeachbacks     = activities.reduce((a, r) => a + (r.teachbacks || 0), 0);
  const totalClusterMtgs    = activities.reduce((a, r) => a + (r.cluster_meetings || 0), 0);
  const totalRoutine        = activities.reduce((a, r) => a + (r.routine || 0), 0);
  const totalTransfers      = issues.reduce((a, r) => a + (r.teacher_transfers || 0), 0);
  const totalInterest       = issues.reduce((a, r) => a + (r.lack_of_interest || 0), 0);

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'activities', label: 'Monitoring Activities', icon: <ClipboardList size={13} /> },
    { id: 'issues',     label: 'Prevailing Issues',    icon: <AlertTriangle size={13} /> },
    { id: 'history',    label: 'Submission History',   icon: <Calendar size={13} /> },
  ];

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader
        title="Data Officer Workspace"
        subtitle={`Monitoring data entry · ${user.district || 'National'}`}
        actions={
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
            📝 {user.name}
          </span>
        }
      />

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard icon={<ClipboardList size={16} className="text-orange-500" />} label="Teachbacks"      value={totalTeachbacks}  color="#e85d04" />
        <StatCard icon={<BarChart2   size={16} className="text-blue-500"   />} label="Cluster Meetings" value={totalClusterMtgs} color="#185fa5" />
        <StatCard icon={<CheckCircle size={16} className="text-green-500"  />} label="Routine Checks"   value={totalRoutine}     color="#059669" />
        <StatCard icon={<AlertTriangle size={16} className="text-amber-500"/>} label="Transfers Logged" value={totalTransfers}   color="#d97706" />
        <StatCard icon={<AlertTriangle size={16} className="text-red-500"  />} label="Interest Issues"  value={totalInterest}    color="#dc2626" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-100 dark:bg-slate-800/50 p-1 rounded-xl w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === t.id ? 'bg-white dark:bg-[#0f1623] text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ── MONITORING ACTIVITIES TAB ────────────────────────────────────── */}
      {tab === 'activities' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Form */}
          <Card className="space-y-4">
            <div>
              <Kicker text="Data Entry" />
              <h2 className="font-bold text-sm text-black dark:text-white">Monitoring Activities Conducted</h2>
              <p className="text-xs text-slate-500 mt-0.5">Enter the number of each monitoring activity for a given district and month.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FSelect label="District *" value={actForm.district} onChange={e => setActForm(p => ({ ...p, district: e.target.value }))}>
                <option value="">Select district...</option>
                {DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </FSelect>
              <FSelect label="Month *" value={actForm.month} onChange={e => setActForm(p => ({ ...p, month: e.target.value }))}>
                <option value="">Select month...</option>
                {MONTHS.map(m => <option key={m}>{m}</option>)}
              </FSelect>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-2">Activity Frequencies</div>
              {[
                { key: 'teachbacks',       label: 'Teachbacks / Mentorship' },
                { key: 'pea_monitoring',   label: 'PEA Monitoring' },
                { key: 'cluster_meetings', label: 'Cluster Meetings' },
                { key: 'issue_based',      label: 'Issue Based Monitoring' },
                { key: 'routine',          label: 'Routine Monitoring' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <label className="text-xs text-slate-700 dark:text-slate-300 w-52 shrink-0">{label}</label>
                  <input type="number" min="0"
                    value={(actForm as any)[key]}
                    onChange={e => setActForm(p => ({ ...p, [key]: e.target.value }))}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-slate-700 bg-white dark:bg-[#0f1623] text-black dark:text-white text-sm focus:outline-none focus:border-orange-400"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>

            <Btn onClick={submitActivity} disabled={saving} className="w-full">
              <Save size={13} className="mr-1" />{saving ? 'Saving...' : 'Save Activities'}
            </Btn>
          </Card>

          {/* Recent entries */}
          <Card className="space-y-3">
            <Kicker text="Recent Submissions" />
            <h2 className="font-bold text-sm text-black dark:text-white">Latest Activity Entries</h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {activities.slice(0, 10).map(a => (
                <div key={a.id} className="p-3 rounded-xl border border-neutral-100 dark:border-slate-800 bg-neutral-50/50 dark:bg-slate-900/20">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-xs text-black dark:text-white">{a.district}</span>
                      <span className="ml-2 text-[10px] text-slate-400">{a.month}</span>
                    </div>
                    <Badge text={a.submitted_by} color="#e85d04" bg="#fff4ec" />
                  </div>
                  <div className="grid grid-cols-5 gap-1 text-center">
                    {[
                      ['TB', a.teachbacks,       '#e85d04'],
                      ['PEA', a.pea_monitoring,  '#185fa5'],
                      ['CM', a.cluster_meetings, '#059669'],
                      ['IB', a.issue_based,      '#7c3aed'],
                      ['RT', a.routine,          '#d97706'],
                    ].map(([abbr, val, color]) => (
                      <div key={String(abbr)} className="rounded-lg py-1.5" style={{ backgroundColor: String(color) + '15' }}>
                        <div className="text-[9px] font-bold uppercase" style={{ color: String(color) }}>{abbr}</div>
                        <div className="text-sm font-black" style={{ color: String(color) }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {activities.length === 0 && (
                <div className="text-center py-8 text-slate-400 italic text-sm">No activity records yet.</div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ── PREVAILING ISSUES TAB ─────────────────────────────────────────── */}
      {tab === 'issues' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Form */}
          <Card className="space-y-4">
            <div>
              <Kicker text="Data Entry" />
              <h2 className="font-bold text-sm text-black dark:text-white">Prevailing Issues</h2>
              <p className="text-xs text-slate-500 mt-0.5">Record the number of each type of issue encountered in the district.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FSelect label="District *" value={issueForm.district} onChange={e => setIssueForm(p => ({ ...p, district: e.target.value }))}>
                <option value="">Select district...</option>
                {DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </FSelect>
              <FSelect label="Month *" value={issueForm.month} onChange={e => setIssueForm(p => ({ ...p, month: e.target.value }))}>
                <option value="">Select month...</option>
                {MONTHS.map(m => <option key={m}>{m}</option>)}
              </FSelect>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-2">Issue Counts</div>
              {[
                { key: 'teacher_transfers',    label: 'Teacher Transfers' },
                { key: 'lack_of_interest',     label: 'Lack of Interest' },
                { key: 'other_issues',         label: 'Other Issues' },
                { key: 'lack_of_admin_support',label: 'Lack of Administration Support' },
                { key: 'learner_behaviour',    label: 'Learner Behaviour Concerns' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <label className="text-xs text-slate-700 dark:text-slate-300 w-52 shrink-0">{label}</label>
                  <input type="number" min="0"
                    value={(issueForm as any)[key]}
                    onChange={e => setIssueForm(p => ({ ...p, [key]: e.target.value }))}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-slate-700 bg-white dark:bg-[#0f1623] text-black dark:text-white text-sm focus:outline-none focus:border-orange-400"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>

            <Btn onClick={submitIssue} disabled={saving} className="w-full">
              <Save size={13} className="mr-1" />{saving ? 'Saving...' : 'Save Issues'}
            </Btn>
          </Card>

          {/* Recent issue entries */}
          <Card className="space-y-3">
            <Kicker text="Recent Submissions" />
            <h2 className="font-bold text-sm text-black dark:text-white">Latest Issue Entries</h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {issues.slice(0, 10).map(r => (
                <div key={r.id} className="p-3 rounded-xl border border-neutral-100 dark:border-slate-800 bg-neutral-50/50 dark:bg-slate-900/20">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-xs text-black dark:text-white">{r.district}</span>
                      <span className="ml-2 text-[10px] text-slate-400">{r.month}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-1 text-center">
                    {[
                      ['TT', r.teacher_transfers,    '#dc2626'],
                      ['LI', r.lack_of_interest,     '#f59e0b'],
                      ['OI', r.other_issues,         '#6b7280'],
                      ['AS', r.lack_of_admin_support,'#7c3aed'],
                      ['LB', r.learner_behaviour,    '#0891b2'],
                    ].map(([abbr, val, color]) => (
                      <div key={String(abbr)} className="rounded-lg py-1.5" style={{ backgroundColor: String(color) + '15' }}>
                        <div className="text-[9px] font-bold uppercase" style={{ color: String(color) }}>{abbr}</div>
                        <div className="text-sm font-black" style={{ color: String(color) }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {issues.length === 0 && (
                <div className="text-center py-8 text-slate-400 italic text-sm">No issue records yet.</div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ── HISTORY TAB ──────────────────────────────────────────────────── */}
      {tab === 'history' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Activities history */}
            <Card>
              <Kicker text="Monitoring Activities" />
              <h2 className="font-bold text-sm text-black dark:text-white mb-3">All Activity Records ({activities.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-100 dark:border-slate-800">
                      {['District','Month','TB','PEA','CM','IB','RT'].map(h => (
                        <th key={h} className="py-2 px-2 text-left font-bold text-slate-500 uppercase text-[10px]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map(a => (
                      <tr key={a.id} className="border-b border-neutral-50 dark:border-slate-800/40 hover:bg-neutral-50 dark:hover:bg-slate-800/20">
                        <td className="py-2 px-2 font-semibold text-black dark:text-white">{a.district}</td>
                        <td className="py-2 px-2 text-slate-500">{a.month}</td>
                        <td className="py-2 px-2 font-bold text-orange-600">{a.teachbacks}</td>
                        <td className="py-2 px-2 font-bold text-blue-600">{a.pea_monitoring}</td>
                        <td className="py-2 px-2 font-bold text-green-600">{a.cluster_meetings}</td>
                        <td className="py-2 px-2 font-bold text-purple-600">{a.issue_based}</td>
                        <td className="py-2 px-2 font-bold text-amber-600">{a.routine}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Issues history */}
            <Card>
              <Kicker text="Prevailing Issues" />
              <h2 className="font-bold text-sm text-black dark:text-white mb-3">All Issue Records ({issues.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-100 dark:border-slate-800">
                      {['District','Month','TT','LI','OI','AS','LB'].map(h => (
                        <th key={h} className="py-2 px-2 text-left font-bold text-slate-500 uppercase text-[10px]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map(r => (
                      <tr key={r.id} className="border-b border-neutral-50 dark:border-slate-800/40 hover:bg-neutral-50 dark:hover:bg-slate-800/20">
                        <td className="py-2 px-2 font-semibold text-black dark:text-white">{r.district}</td>
                        <td className="py-2 px-2 text-slate-500">{r.month}</td>
                        <td className="py-2 px-2 font-bold text-red-600">{r.teacher_transfers}</td>
                        <td className="py-2 px-2 font-bold text-amber-600">{r.lack_of_interest}</td>
                        <td className="py-2 px-2 font-bold text-slate-500">{r.other_issues}</td>
                        <td className="py-2 px-2 font-bold text-purple-600">{r.lack_of_admin_support}</td>
                        <td className="py-2 px-2 font-bold text-sky-600">{r.learner_behaviour}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Legend */}
          <Card className="bg-slate-50 dark:bg-slate-900/30">
            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-3">Column Key</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                ['TB','Teachbacks / Mentorship','#e85d04'],
                ['PEA','PEA Monitoring','#185fa5'],
                ['CM','Cluster Meetings','#059669'],
                ['IB','Issue Based Monitoring','#7c3aed'],
                ['RT','Routine Monitoring','#d97706'],
                ['TT','Teacher Transfers','#dc2626'],
                ['LI','Lack of Interest','#f59e0b'],
                ['OI','Other Issues','#6b7280'],
                ['AS','Lack of Admin Support','#7c3aed'],
                ['LB','Learner Behaviour Concerns','#0891b2'],
              ].map(([abbr, label, color]) => (
                <div key={String(abbr)} className="flex items-center gap-2">
                  <span className="font-black text-xs w-7 shrink-0" style={{ color: String(color) }}>{abbr}</span>
                  <span className="text-slate-500">{label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
