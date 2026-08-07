import React, { useState, useEffect } from 'react';
import { clusterFollowupsApi } from '../api';
import { useCountry } from '../context/CountryContext';
import { User } from '../types';
import { Card, PageHeader, Btn, Badge, Modal, FInput, FSelect } from './SubComponents';
import { Plus, Trash2, CheckCircle2, Clock, Users } from 'lucide-react';

interface MyClustersPageProps {
  user: User | null;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  setPage?: (p: string) => void;
}

const MAX_CLUSTERS = 10;

// District Coordinators no longer self-assign -- they assign clusters to
// their own Field Officers and TOTs instead. Everyone else just sees a
// read-only list of whatever's been assigned to them.
const DistrictAssignmentPanel: React.FC<{ showToast: MyClustersPageProps['showToast'] }> = ({ showToast }) => {
  const [staff, setStaff] = useState<any[]>([]);
  const [clusters, setClusters] = useState<any[]>([]);
  const [assigning, setAssigning] = useState<any | null>(null);
  const [pickClusterId, setPickClusterId] = useState('');

  const load = () => {
    clusterFollowupsApi.getDistrictStaff().then(setStaff).catch(() => {});
    clusterFollowupsApi.getDistrictClusters().then(setClusters).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const clustersFor = (userId: string) => clusters.filter(c => c.assignees.some((a: any) => a.userId === userId));
  const availableFor = (userId: string) => clusters.filter(c => !c.assignees.some((a: any) => a.userId === userId));

  const assign = async () => {
    if (!assigning || !pickClusterId) { showToast('Select a cluster first', 'warning'); return; }
    try {
      const data = await clusterFollowupsApi.assignToStaff(assigning.id, parseInt(pickClusterId));
      if (data.error) { showToast(data.error, 'error'); return; }
      showToast(`Cluster assigned to ${assigning.name}`, 'success');
      setAssigning(null);
      setPickClusterId('');
      load();
    } catch {
      showToast('Failed to assign cluster', 'error');
    }
  };

  const unassign = async (userId: string, clusterId: number, name: string) => {
    if (!window.confirm(`Remove this cluster from ${name}?`)) return;
    try {
      await clusterFollowupsApi.unassignFromStaff(userId, clusterId);
      showToast('Cluster unassigned', 'success');
      load();
    } catch {
      showToast('Failed to unassign cluster', 'error');
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Users size={15} className="text-[var(--brand-600)]" />
        <h2 className="text-sm font-bold text-black dark:text-white m-0">Assign Clusters to Your Staff</h2>
      </div>
      {staff.length === 0 ? (
        <p className="text-xs text-slate-400 italic py-2">No active Field Officers or TOTs found in your district yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {staff.map(s => {
            const assigned = clustersFor(s.id);
            return (
              <Card key={s.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-bold text-sm text-black dark:text-white">{s.name}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{s.role.replace('_', ' ')}</div>
                  </div>
                  <Btn size="sm" variant="secondary" onClick={() => setAssigning(s)}><Plus size={12} /></Btn>
                </div>
                {assigned.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No clusters assigned yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {assigned.map(c => (
                      <div key={c.id} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800 rounded-lg px-2.5 py-1.5">
                        <span className="text-black dark:text-white">{c.name}</span>
                        <button onClick={() => unassign(s.id, c.id, s.name)} className="text-slate-400 hover:text-red-500">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {assigning && (
        <Modal title={`Assign a Cluster to ${assigning.name}`} onClose={() => setAssigning(null)} width={420}>
          <div className="space-y-3">
            <FSelect label="Select Cluster" value={pickClusterId} onChange={(e: any) => setPickClusterId(e.target.value)}>
              <option value="">— Select —</option>
              {availableFor(assigning.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </FSelect>
            <div className="flex justify-end gap-2 pt-2">
              <Btn size="sm" variant="secondary" onClick={() => setAssigning(null)}>Cancel</Btn>
              <Btn size="sm" onClick={assign}>Assign</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export const MyClustersPage: React.FC<MyClustersPageProps> = ({ user, showToast, setPage }) => {
  const [myClusters, setMyClusters] = useState<any[]>([]);
  const [weekData, setWeekData] = useState<{ weekStart: string; clusters: any[] }>({ weekStart: '', clusters: [] });
  const [logging, setLogging] = useState<any | null>(null);
  const [form, setForm] = useState({
    cohort: '',
    himSessions: '', himEnrollment: '', himChallenges: '',
    gesdSessions: '', gesdEnrollment: '', gesdChallenges: '',
  });

  const { activeCountry } = useCountry();
  const isDC = user?.role === 'district_coordinator';

  const load = () => {
    clusterFollowupsApi.getMyClusters(activeCountry).then(setMyClusters).catch(() => {});
    clusterFollowupsApi.getThisWeek(activeCountry).then(setWeekData).catch(() => {});
  };

  useEffect(() => {
    if (user) load();
  }, [user, activeCountry]);

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
        subtitle={isDC
          ? "Assign clusters to your Field Officers and TOTs"
          : "Clusters assigned to you and your weekly follow-up"}
      />

      {isDC && <DistrictAssignmentPanel showToast={showToast} />}

      {weekData.weekStart && (
        <div className="mb-4 text-[11px] text-slate-500 font-semibold">
          Week of {new Date(weekData.weekStart).toLocaleDateString()} — {weekData.clusters.filter(c => c.followup_id).length} of {weekData.clusters.length} clusters followed up
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {weekData.clusters.length === 0 ? (
          <div className="col-span-full text-center py-12 text-sm text-black/40 dark:text-white/40">
            No clusters assigned yet. Your District Coordinator will assign you one.
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
              <Btn
                size="sm"
                variant={c.followup_id ? 'secondary' : 'primary'}
                onClick={() => {
                  if (c.followup_id) {
                    openLog(c);
                  } else if (setPage) {
                    // Weekly reporting now happens through Cluster Anchors --
                    // stash which cluster to preselect, since you're reporting
                    // specifically about this one.
                    sessionStorage.setItem('cluster_anchors_preselect_cluster', String(c.id));
                    setPage('teacher_programmes');
                  } else {
                    openLog(c);
                  }
                }}
              >
                {c.followup_id ? 'Update' : 'Log This Week'}
              </Btn>
            </Card>
          ))
        )}
      </div>

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
