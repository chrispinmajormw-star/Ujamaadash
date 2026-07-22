import React, { useState, useEffect } from 'react';
import { clusterFollowupsApi } from '../api';
import { useCountry } from '../context/CountryContext';
import { User } from '../types';
import { Card, PageHeader, Btn, Badge, Modal, FInput, FSelect } from './SubComponents';
import { Plus, Trash2, CheckCircle2, Clock } from 'lucide-react';

interface MyClustersPageProps {
  user: User | null;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

const MAX_CLUSTERS = 10;

export const MyClustersPage: React.FC<MyClustersPageProps> = ({ user, showToast }) => {
  const [myClusters, setMyClusters] = useState<any[]>([]);
  const [available, setAvailable] = useState<any[]>([]);
  const [weekData, setWeekData] = useState<{ weekStart: string; clusters: any[] }>({ weekStart: '', clusters: [] });
  const [adding, setAdding] = useState(false);
  const [pickClusterId, setPickClusterId] = useState('');
  const [logging, setLogging] = useState<any | null>(null);
  const [form, setForm] = useState({
    cohort: '',
    himSessions: '', himEnrollment: '', himChallenges: '',
    gesdSessions: '', gesdEnrollment: '', gesdChallenges: '',
  });

  const { activeCountry } = useCountry();

  const load = () => {
    clusterFollowupsApi.getMyClusters(activeCountry).then(setMyClusters).catch(() => {});
    clusterFollowupsApi.getThisWeek(activeCountry).then(setWeekData).catch(() => {});
  };

  useEffect(() => {
    if (user) {
      load();
      clusterFollowupsApi.getAvailableClusters(activeCountry).then(setAvailable).catch(() => {});
    }
  }, [user, activeCountry]);

  const assignedIds = new Set(myClusters.map(c => c.id));
  const pickable = available.filter(c => !assignedIds.has(c.id));

  const addCluster = async () => {
    if (!pickClusterId) { showToast('Select a cluster first', 'warning'); return; }
    try {
      const data = await clusterFollowupsApi.assignCluster(parseInt(pickClusterId));
      if (data.error) { showToast(data.error, 'error'); return; }
      showToast('Cluster added', 'success');
      setAdding(false);
      setPickClusterId('');
      load();
    } catch {
      showToast('Failed to add cluster', 'error');
    }
  };

  const removeCluster = async (clusterId: number) => {
    if (!window.confirm('Stop managing this cluster?')) return;
    try {
      await clusterFollowupsApi.unassignCluster(clusterId);
      showToast('Cluster removed', 'success');
      load();
    } catch {
      showToast('Failed to remove cluster', 'error');
    }
  };

  const openLog = (c: any) => {
    setForm({
      cohort: c.cohort || '',
      himSessions: c.him_sessions ?? '', himEnrollment: c.him_enrollment ?? '', himChallenges: c.him_challenges || '',
      gesdSessions: c.gesd_sessions ?? '', gesdEnrollment: c.gesd_enrollment ?? '', gesdChallenges: c.gesd_challenges || '',
    });
    setLogging(c);
  };

  const submitFollowup = async () => {
    if (!logging) return;
    try {
      const data = await clusterFollowupsApi.submitFollowup({
        clusterId: logging.id,
        cohort: form.cohort,
        himSessions: form.himSessions, himEnrollment: form.himEnrollment, himChallenges: form.himChallenges,
        gesdSessions: form.gesdSessions, gesdEnrollment: form.gesdEnrollment, gesdChallenges: form.gesdChallenges,
      });
      if (data.error) { showToast(data.error, 'error'); return; }
      showToast('Weekly follow-up saved', 'success');
      setLogging(null);
      load();
    } catch {
      showToast('Failed to save follow-up', 'error');
    }
  };

  return (
    <div>
      <PageHeader
        title="My Clusters"
        subtitle={`Manage up to ${MAX_CLUSTERS} clusters and log your weekly follow-up`}
        actions={myClusters.length < MAX_CLUSTERS && (
          <Btn size="sm" variant="primary" onClick={() => setAdding(true)}>
            <Plus size={14} /> Add Cluster
          </Btn>
        )}
      />

      {weekData.weekStart && (
        <div className="mb-4 text-[11px] text-slate-500 font-semibold">
          Week of {new Date(weekData.weekStart).toLocaleDateString()} — {weekData.clusters.filter(c => c.followup_id).length} of {weekData.clusters.length} clusters followed up
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {weekData.clusters.length === 0 ? (
          <div className="col-span-full text-center py-12 text-sm text-black/40 dark:text-white/40">
            No clusters assigned yet. Click "Add Cluster" to get started.
          </div>
        ) : (
          weekData.clusters.map(c => (
            <Card key={c.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-bold text-sm text-black dark:text-white">{c.name}</div>
                  <div className="text-[10px] text-slate-400">{c.district}</div>
                </div>
                {c.followup_id ? (
                  <Badge text="Logged" color="#065f46" bg="#dcfce7" />
                ) : (
                  <Badge text="Pending" color="#92400e" bg="#fef9c3" />
                )}
              </div>
              {c.followup_id ? (
                <div className="text-xs text-slate-500 mb-3 space-y-0.5">
                  <div className="flex items-center gap-1"><CheckCircle2 size={11} className="text-emerald-500" /> {c.cohort || 'No cohort noted'}</div>
                  <div className="flex items-center gap-1"><Clock size={11} /> HIM: {c.him_sessions ?? 0} sessions, {c.him_enrollment ?? 0} enrolled</div>
                  <div className="flex items-center gap-1"><Clock size={11} /> GESD: {c.gesd_sessions ?? 0} sessions, {c.gesd_enrollment ?? 0} enrolled</div>
                </div>
              ) : (
                <div className="text-xs text-amber-600 mb-3">This week's follow-up not logged yet.</div>
              )}
              <div className="flex gap-2">
                <Btn size="sm" variant={c.followup_id ? 'secondary' : 'primary'} onClick={() => openLog(c)}>
                  {c.followup_id ? 'Update' : 'Log This Week'}
                </Btn>
                <Btn size="sm" variant="danger" onClick={() => removeCluster(c.id)}><Trash2 size={12} /></Btn>
              </div>
            </Card>
          ))
        )}
      </div>

      {adding && (
        <Modal title="Add a Cluster to Manage" onClose={() => setAdding(false)} width={420}>
          <div className="space-y-3">
            <FSelect label="Select Cluster" value={pickClusterId} onChange={(e: any) => setPickClusterId(e.target.value)}>
              <option value="">— Select —</option>
              {pickable.map(c => <option key={c.id} value={c.id}>{c.name} ({c.district})</option>)}
            </FSelect>
            <p className="text-[11px] text-slate-400">{myClusters.length}/{MAX_CLUSTERS} clusters assigned</p>
            <div className="flex justify-end gap-2 pt-2">
              <Btn size="sm" variant="secondary" onClick={() => setAdding(false)}>Cancel</Btn>
              <Btn size="sm" onClick={addCluster}>Add</Btn>
            </div>
          </div>
        </Modal>
      )}

      {logging && (
        <Modal title={`Log Follow-up — ${logging.name}`} onClose={() => setLogging(null)} width={460}>
          <div className="space-y-3">
            <FInput label="Cohort" placeholder="e.g. Cohort A" value={form.cohort} onChange={(e: any) => setForm(p => ({ ...p, cohort: e.target.value }))} />

            <div className="pt-1 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Hero In Me (HIM)</div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label="HIM Sessions This Week" type="number" value={form.himSessions} onChange={(e: any) => setForm(p => ({ ...p, himSessions: e.target.value }))} />
              <FInput label="HIM Enrollment" type="number" value={form.himEnrollment} onChange={(e: any) => setForm(p => ({ ...p, himEnrollment: e.target.value }))} />
            </div>
            <FInput label="HIM Challenges (optional)" placeholder="Any issues faced this week" value={form.himChallenges} onChange={(e: any) => setForm(p => ({ ...p, himChallenges: e.target.value }))} />

            <div className="pt-1 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">GESD</div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label="GESD Sessions This Week" type="number" value={form.gesdSessions} onChange={(e: any) => setForm(p => ({ ...p, gesdSessions: e.target.value }))} />
              <FInput label="GESD Enrollment" type="number" value={form.gesdEnrollment} onChange={(e: any) => setForm(p => ({ ...p, gesdEnrollment: e.target.value }))} />
            </div>
            <FInput label="GESD Challenges (optional)" placeholder="Any issues faced this week" value={form.gesdChallenges} onChange={(e: any) => setForm(p => ({ ...p, gesdChallenges: e.target.value }))} />

            <div className="flex justify-end gap-2 pt-2">
              <Btn size="sm" variant="secondary" onClick={() => setLogging(null)}>Cancel</Btn>
              <Btn size="sm" onClick={submitFollowup}>Save Follow-up</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
