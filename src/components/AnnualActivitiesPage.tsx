import React, { useState, useEffect, useRef } from 'react';
import { annualActivitiesApi } from '../api';
import { useCountry } from '../context/CountryContext';
import { User } from '../types';
import { Card, PageHeader, Badge, FSelect, Btn, Modal, FInput, FArea } from './SubComponents';
import { Edit2, Plus } from 'lucide-react';
import { DISTRICT_LIST } from '../data';

interface AnnualActivitiesPageProps {
  user: User | null;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const AnnualActivitiesPage: React.FC<AnnualActivitiesPageProps> = ({ user }) => {
  const { activeCountry } = useCountry();
  const [summary, setSummary] = useState<{ byQuarter: any[]; byDistrict: any[]; byRegion: any[] }>({ byQuarter: [], byDistrict: [], byRegion: [] });
  const [activities, setActivities] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState<any>({ district: '' });
  const [quarterFilter, setQuarterFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    annualActivitiesApi.getSummary(activeCountry).then((res: any) => setSummary(res || { byQuarter: [], byDistrict: [], byRegion: [] })).catch(() => {});
  }, [activeCountry]);

  useEffect(() => {
    const t = setTimeout(() => {
      annualActivitiesApi.getAll(activeCountry, {
        quarter: quarterFilter, district: districtFilter, region: regionFilter,
        completionStatus: statusFilter, search,
      }).then(setActivities).catch(() => {});
    }, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [activeCountry, quarterFilter, districtFilter, regionFilter, statusFilter, search]);

  const openEdit = (a: any) => {
    setEditForm({
      quarter: a.quarter || '', goal: a.goal || '', weekLabel: a.week_label || '',
      weekStartDate: a.week_start_date ? a.week_start_date.slice(0, 10) : '',
      weekEndDate: a.week_end_date ? a.week_end_date.slice(0, 10) : '',
      holidays: a.holidays || '', weeklyActivityDescription: a.weekly_activity_description || '',
      target: a.target || '', estimatedCost: a.estimated_cost != null ? String(a.estimated_cost) : '',
      leadPerson: a.lead_person || '', status: a.status || '', risksIssues: a.risks_issues || '', comments: a.comments || '',
    });
    setEditing(a);
  };

  const submitEdit = async () => {
    if (!editing) return;
    try {
      await annualActivitiesApi.update(editing.id, editForm);
      setActivities(prev => prev.map(a => a.id === editing.id ? { ...a, ...editForm } : a));
      setEditing(null);
      annualActivitiesApi.getAll(activeCountry, { quarter: quarterFilter, district: districtFilter, region: regionFilter, completionStatus: statusFilter, search }).then(setActivities).catch(() => {});
    } catch { /* no-op, form stays open on failure */ }
  };

  const openCreate = () => {
    setCreateForm({
      district: districtFilter || '', region: '', quarter: quarterFilter || '', goal: '', weekLabel: '',
      weekStartDate: '', weekEndDate: '', holidays: '', weeklyActivityDescription: '',
      target: '', estimatedCost: '', leadPerson: '', status: '', risksIssues: '', comments: '',
    });
    setCreating(true);
  };

  const submitCreate = async () => {
    if (!createForm.district || !createForm.weeklyActivityDescription?.trim()) {
      return;
    }
    try {
      await annualActivitiesApi.create(createForm);
      setCreating(false);
      annualActivitiesApi.getAll(activeCountry, { quarter: quarterFilter, district: districtFilter, region: regionFilter, completionStatus: statusFilter, search }).then(setActivities).catch(() => {});
      annualActivitiesApi.getSummary(activeCountry).then((res: any) => setSummary(res || { byQuarter: [], byDistrict: [], byRegion: [] })).catch(() => {});
    } catch { /* no-op, form stays open on failure */ }
  };

  useEffect(() => {
    const Chart = (window as any).Chart;
    if (!Chart || !chartRef.current || summary.byDistrict.length === 0) return;
    if (chartInstance.current) chartInstance.current.destroy();
    chartInstance.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: summary.byDistrict.map(d => d.district),
        datasets: [
          { label: 'Done', data: summary.byDistrict.map(d => Number(d.done) || 0), backgroundColor: '#059669', borderRadius: 4 },
          { label: 'Not Done', data: summary.byDistrict.map(d => Number(d.not_done) || 0), backgroundColor: '#dc2626', borderRadius: 4 },
          { label: 'Total Planned', data: summary.byDistrict.map(d => Number(d.total) || 0), backgroundColor: '#94a3b8', borderRadius: 4 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
      },
    });
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [summary]);

  const statusBadge = (s: string) => {
    if (s === 'done') return <Badge text="Done" color="#065f46" bg="#dcfce7" />;
    if (s === 'not_done') return <Badge text="Not Done" color="#991b1b" bg="#fee2e2" />;
    return <Badge text="Pending" color="#92400e" bg="#fef3c7" />;
  };

  const CURRENCY_BY_COUNTRY: Record<string, string> = { Malawi: 'MK', Kenya: 'KES', Somaliland: 'SOS' };
  const currency = CURRENCY_BY_COUNTRY[activeCountry] || 'MK';
  const fmtCost = (v: any) => v != null ? `${currency} ${Number(v).toLocaleString()}` : `${currency} 0`;

  const totalActivities = summary.byQuarter.reduce((acc, q) => acc + (Number(q.total) || 0), 0);
  const totalDone = summary.byQuarter.reduce((acc, q) => acc + (Number(q.done) || 0), 0);
  const totalCost = summary.byQuarter.reduce((acc, q) => acc + (Number(q.total_estimated_cost) || 0), 0);

  return (
    <div>
      <PageHeader title="Annual Activity Plan" subtitle="The full year's activities, set at the annual planning meeting" actions={<Btn size="sm" onClick={openCreate}><Plus size={14} /> Add Activity</Btn>} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="p-3 rounded-lg" style={{ background: 'linear-gradient(135deg,var(--brand),#c44d00)' }}>
          <div className="text-white/80 text-[10px] font-semibold uppercase tracking-wide mb-1">Total Activities</div>
          <div className="text-xl font-black text-white">{totalActivities}</div>
        </div>
        <div className="p-3 rounded-lg bg-emerald-600">
          <div className="text-white/80 text-[10px] font-semibold uppercase tracking-wide mb-1">Completed</div>
          <div className="text-xl font-black text-white">{totalDone}</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-600">
          <div className="text-white/80 text-[10px] font-semibold uppercase tracking-wide mb-1">Districts</div>
          <div className="text-xl font-black text-white">{summary.byDistrict.length}</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-800">
          <div className="text-white/80 text-[10px] font-semibold uppercase tracking-wide mb-1">Est. Total Cost</div>
          <div className="text-xl font-black text-white">{currency} {totalCost.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <Card className="p-3">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Activities by District</div>
          <div className="h-56"><canvas ref={chartRef} /></div>
        </Card>
        <Card className="p-3">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">By Quarter</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead><tr>
                <th className="px-2 py-1.5 font-bold text-slate-500">Quarter</th>
                <th className="px-2 py-1.5 font-bold text-slate-500">Total</th>
                <th className="px-2 py-1.5 font-bold text-slate-500">Done</th>
                <th className="px-2 py-1.5 font-bold text-slate-500">Not Done</th>
                <th className="px-2 py-1.5 font-bold text-slate-500">Pending</th>
                <th className="px-2 py-1.5 font-bold text-slate-500">Est. Cost</th>
              </tr></thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-slate-800">
                {summary.byQuarter.map((q, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1.5 font-bold text-black dark:text-white">{q.quarter || '—'}</td>
                    <td className="px-2 py-1.5">{q.total}</td>
                    <td className="px-2 py-1.5 text-emerald-600 font-semibold">{q.done}</td>
                    <td className="px-2 py-1.5 text-red-600 font-semibold">{q.not_done}</td>
                    <td className="px-2 py-1.5 text-amber-600 font-semibold">{q.pending}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap">{fmtCost(q.total_estimated_cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <Card className="p-3">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Estimated Cost by Region</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead><tr>
                <th className="px-2 py-1.5 font-bold text-slate-500">Region</th>
                <th className="px-2 py-1.5 font-bold text-slate-500">Activities</th>
                <th className="px-2 py-1.5 font-bold text-slate-500">Done</th>
                <th className="px-2 py-1.5 font-bold text-slate-500">Not Done</th>
                <th className="px-2 py-1.5 font-bold text-slate-500">Est. Cost</th>
              </tr></thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-slate-800">
                {summary.byRegion.map((r, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1.5 font-bold text-black dark:text-white">{r.region || '—'}</td>
                    <td className="px-2 py-1.5">{r.total}</td>
                    <td className="px-2 py-1.5 text-emerald-600 font-semibold">{r.done}</td>
                    <td className="px-2 py-1.5 text-red-600 font-semibold">{r.not_done}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap">{fmtCost(r.total_estimated_cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Estimated Cost by District</div>
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-white dark:bg-[#0f1623]"><tr>
                <th className="px-2 py-1.5 font-bold text-slate-500">District</th>
                <th className="px-2 py-1.5 font-bold text-slate-500">Activities</th>
                <th className="px-2 py-1.5 font-bold text-slate-500">Done</th>
                <th className="px-2 py-1.5 font-bold text-slate-500">Not Done</th>
                <th className="px-2 py-1.5 font-bold text-slate-500">Est. Cost</th>
              </tr></thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-slate-800">
                {summary.byDistrict.map((d, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1.5 font-bold text-black dark:text-white">{d.district}</td>
                    <td className="px-2 py-1.5">{d.total}</td>
                    <td className="px-2 py-1.5 text-emerald-600 font-semibold">{d.done}</td>
                    <td className="px-2 py-1.5 text-red-600 font-semibold">{d.not_done}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap">{fmtCost(d.total_estimated_cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="flex gap-3 mb-3 flex-wrap">
        <FSelect label="" value={quarterFilter} onChange={(e: any) => setQuarterFilter(e.target.value)}>
          <option value="">All Quarters</option>
          <option value="Q1">Q1</option>
          <option value="Q2">Q2</option>
          <option value="Q3">Q3</option>
          <option value="Q4">Q4</option>
        </FSelect>
        <FSelect label="" value={districtFilter} onChange={(e: any) => setDistrictFilter(e.target.value)}>
          <option value="">All Districts</option>
          {summary.byDistrict.map((d, i) => <option key={i} value={d.district}>{d.district}</option>)}
        </FSelect>
        <FSelect label="" value={regionFilter} onChange={(e: any) => setRegionFilter(e.target.value)}>
          <option value="">All Regions</option>
          <option value="South">South</option>
          <option value="Central">Central</option>
          <option value="North">North</option>
        </FSelect>
        <FSelect label="" value={statusFilter} onChange={(e: any) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="done">Done</option>
          <option value="not_done">Not Done</option>
        </FSelect>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search activity or lead person..."
          className="flex-1 min-w-[200px] px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
        />
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/40 sticky top-0">
              <tr>
                <th className="px-3 py-2 font-bold text-slate-500">District</th>
                <th className="px-3 py-2 font-bold text-slate-500">Quarter</th>
                <th className="px-3 py-2 font-bold text-slate-500">Week</th>
                <th className="px-3 py-2 font-bold text-slate-500">Activity</th>
                <th className="px-3 py-2 font-bold text-slate-500">Lead</th>
                <th className="px-3 py-2 font-bold text-slate-500">Est. Cost</th>
                <th className="px-3 py-2 font-bold text-slate-500">Status</th>
                <th className="px-3 py-2 font-bold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-slate-800">
              {activities.length === 0 ? (
                <tr><td colSpan={8} className="px-3 py-6 text-center text-slate-400">No activities found.</td></tr>
              ) : (
                activities.map((a: any) => (
                  <tr key={a.id}>
                    <td className="px-3 py-2 font-bold text-black dark:text-white">{a.district}</td>
                    <td className="px-3 py-2">{a.quarter}</td>
                    <td className="px-3 py-2">{a.week_label}</td>
                    <td className="px-3 py-2 max-w-xs truncate">{a.weekly_activity_description}</td>
                    <td className="px-3 py-2">{a.lead_person}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{a.estimated_cost != null ? fmtCost(a.estimated_cost) : '—'}</td>
                    <td className="px-3 py-2">{statusBadge(a.completion_status)}</td>
                    <td className="px-3 py-2">
                      <Btn size="sm" variant="secondary" onClick={() => openEdit(a)}><Edit2 size={12} /></Btn>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {editing && (
        <Modal title={`Edit Activity — ${editing.district}`} onClose={() => setEditing(null)} width={560}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Quarter" value={editForm.quarter} onChange={(e: any) => setEditForm((p: any) => ({ ...p, quarter: e.target.value }))} />
              <FInput label="Goal" value={editForm.goal} onChange={(e: any) => setEditForm((p: any) => ({ ...p, goal: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Week Start Date" type="date" value={editForm.weekStartDate} onChange={(e: any) => setEditForm((p: any) => ({ ...p, weekStartDate: e.target.value }))} />
              <FInput label="Week End Date" type="date" value={editForm.weekEndDate} onChange={(e: any) => setEditForm((p: any) => ({ ...p, weekEndDate: e.target.value }))} />
            </div>
            <FInput label="Week Label (display text)" value={editForm.weekLabel} onChange={(e: any) => setEditForm((p: any) => ({ ...p, weekLabel: e.target.value }))} />
            <FInput label="Holidays" value={editForm.holidays} onChange={(e: any) => setEditForm((p: any) => ({ ...p, holidays: e.target.value }))} />
            <FArea label="Weekly Activity Description" value={editForm.weeklyActivityDescription} onChange={(e: any) => setEditForm((p: any) => ({ ...p, weeklyActivityDescription: e.target.value }))} rows={3} />
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Target" value={editForm.target} onChange={(e: any) => setEditForm((p: any) => ({ ...p, target: e.target.value }))} />
              <FInput label={`Estimated Cost (${currency})`} type="number" value={editForm.estimatedCost} onChange={(e: any) => setEditForm((p: any) => ({ ...p, estimatedCost: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Lead Person" value={editForm.leadPerson} onChange={(e: any) => setEditForm((p: any) => ({ ...p, leadPerson: e.target.value }))} />
              <FInput label="Status" value={editForm.status} onChange={(e: any) => setEditForm((p: any) => ({ ...p, status: e.target.value }))} />
            </div>
            <FArea label="Risks / Issues" value={editForm.risksIssues} onChange={(e: any) => setEditForm((p: any) => ({ ...p, risksIssues: e.target.value }))} rows={2} />
            <FArea label="Comments" value={editForm.comments} onChange={(e: any) => setEditForm((p: any) => ({ ...p, comments: e.target.value }))} rows={2} />
            <div className="flex justify-end gap-2 pt-2">
              <Btn size="sm" variant="secondary" onClick={() => setEditing(null)}>Cancel</Btn>
              <Btn size="sm" onClick={submitEdit}>Save Changes</Btn>
            </div>
          </div>
        </Modal>
      )}

      {creating && (
        <Modal title="Add New Activity" onClose={() => setCreating(false)} width={560}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FSelect label="District *" value={createForm.district} onChange={(e: any) => setCreateForm((p: any) => ({ ...p, district: e.target.value }))}>
                <option value="">Select district...</option>
                {DISTRICT_LIST.map((d: string) => <option key={d} value={d}>{d}</option>)}
              </FSelect>
              <FInput label="Region" value={createForm.region} onChange={(e: any) => setCreateForm((p: any) => ({ ...p, region: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Quarter" value={createForm.quarter} onChange={(e: any) => setCreateForm((p: any) => ({ ...p, quarter: e.target.value }))} placeholder="e.g. Q1" />
              <FInput label="Goal" value={createForm.goal} onChange={(e: any) => setCreateForm((p: any) => ({ ...p, goal: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Week Start Date" type="date" value={createForm.weekStartDate} onChange={(e: any) => setCreateForm((p: any) => ({ ...p, weekStartDate: e.target.value }))} />
              <FInput label="Week End Date" type="date" value={createForm.weekEndDate} onChange={(e: any) => setCreateForm((p: any) => ({ ...p, weekEndDate: e.target.value }))} />
            </div>
            <FInput label="Week Label (display text)" value={createForm.weekLabel} onChange={(e: any) => setCreateForm((p: any) => ({ ...p, weekLabel: e.target.value }))} placeholder="e.g. 5 Jan - 26 Jan" />
            <FInput label="Holidays" value={createForm.holidays} onChange={(e: any) => setCreateForm((p: any) => ({ ...p, holidays: e.target.value }))} />
            <FArea label="Weekly Activity Description *" value={createForm.weeklyActivityDescription} onChange={(e: any) => setCreateForm((p: any) => ({ ...p, weeklyActivityDescription: e.target.value }))} rows={3} />
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Target" value={createForm.target} onChange={(e: any) => setCreateForm((p: any) => ({ ...p, target: e.target.value }))} />
              <FInput label={`Estimated Cost (${currency})`} type="number" value={createForm.estimatedCost} onChange={(e: any) => setCreateForm((p: any) => ({ ...p, estimatedCost: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Lead Person" value={createForm.leadPerson} onChange={(e: any) => setCreateForm((p: any) => ({ ...p, leadPerson: e.target.value }))} />
              <FInput label="Status" value={createForm.status} onChange={(e: any) => setCreateForm((p: any) => ({ ...p, status: e.target.value }))} />
            </div>
            <FArea label="Risks / Issues" value={createForm.risksIssues} onChange={(e: any) => setCreateForm((p: any) => ({ ...p, risksIssues: e.target.value }))} rows={2} />
            <FArea label="Comments" value={createForm.comments} onChange={(e: any) => setCreateForm((p: any) => ({ ...p, comments: e.target.value }))} rows={2} />
            <div className="flex justify-end gap-2 pt-2">
              <Btn size="sm" variant="secondary" onClick={() => setCreating(false)}>Cancel</Btn>
              <Btn size="sm" onClick={submitCreate}>Add Activity</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
