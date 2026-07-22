import React, { useState, useEffect } from 'react';
import { clusterSchoolSessionsApi } from '../api';
import { User } from '../types';
import { Card, PageHeader, Btn, FInput, FSelect, FArea } from './SubComponents';
import { CheckCircle2 } from 'lucide-react';

interface ClusterSchoolSessionFormProps {
  user: User | null;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

const BLANK = {
  project: '', trainingPhase: '', clusterAnchor: '', clusterStatus: '', cohort: '',
  schoolsTrainedPerCluster: '', teachersImplementing: '', teachersTrainedPerCluster: '', clustersTeachbacks: '',
  gesdWeek1: '', gesdWeek2: '', gesdWeek3: '', gesdWeek4: '',
  himWeek1: '', himWeek2: '', himWeek3: '', himWeek4: '',
  sessionImplementationStatus: '', comments: '',
};

const currentMonthISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};

export const ClusterSchoolSessionForm: React.FC<ClusterSchoolSessionFormProps> = ({ user, showToast }) => {
  const [clusters, setClusters] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [clusterId, setClusterId] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [existing, setExisting] = useState(false);
  const [form, setForm] = useState({ ...BLANK });
  const reportingMonth = currentMonthISO();

  useEffect(() => {
    clusterSchoolSessionsApi.getMyClusters().then((res: any) => setClusters(Array.isArray(res) ? res : [])).catch(() => {});
  }, [user]);

  useEffect(() => {
    setSchoolId('');
    setSchools([]);
    setForm({ ...BLANK });
    setExisting(false);
    if (clusterId) {
      clusterSchoolSessionsApi.getSchools(Number(clusterId)).then((res: any) => setSchools(Array.isArray(res) ? res : [])).catch(() => {});
    }
  }, [clusterId]);

  useEffect(() => {
    if (!schoolId) return;
    clusterSchoolSessionsApi.getMine(Number(schoolId), reportingMonth).then((record: any) => {
      if (record) {
        setExisting(true);
        setForm({
          project: record.project || '', trainingPhase: record.training_phase || '', clusterAnchor: record.cluster_anchor || '',
          clusterStatus: record.cluster_status || '', cohort: record.cohort || '',
          schoolsTrainedPerCluster: String(record.schools_trained_per_cluster ?? ''),
          teachersImplementing: String(record.teachers_implementing ?? ''),
          teachersTrainedPerCluster: String(record.teachers_trained_per_cluster ?? ''),
          clustersTeachbacks: String(record.clusters_teachbacks ?? ''),
          gesdWeek1: record.gesd_week1 || '', gesdWeek2: record.gesd_week2 || '', gesdWeek3: record.gesd_week3 || '', gesdWeek4: record.gesd_week4 || '',
          himWeek1: record.him_week1 || '', himWeek2: record.him_week2 || '', himWeek3: record.him_week3 || '', himWeek4: record.him_week4 || '',
          sessionImplementationStatus: record.session_implementation_status || '', comments: record.comments || '',
        });
      } else {
        setExisting(false);
        setForm({ ...BLANK });
      }
    }).catch(() => {});
  }, [schoolId]);

  const sc = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    if (!clusterId || !schoolId) { showToast('Select a cluster and school first', 'warning'); return; }
    try {
      const data = await clusterSchoolSessionsApi.submit({
        clusterId: Number(clusterId), schoolId: Number(schoolId), reportingMonth, ...form,
      });
      if (data.error) { showToast(data.error, 'error'); return; }
      showToast(existing ? 'Record updated' : 'Record submitted', 'success');
      setExisting(true);
    } catch { showToast('Failed to save record', 'error'); }
  };

  const monthLabel = new Date(reportingMonth).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <PageHeader title="Cluster Anchors — Session Tracking" subtitle={`Reporting month: ${monthLabel}`} />

      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FSelect label="Cluster *" value={clusterId} onChange={(e: any) => setClusterId(e.target.value)}>
            <option value="">Select cluster...</option>
            {clusters.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </FSelect>
          <FSelect label="School *" value={schoolId} onChange={(e: any) => setSchoolId(e.target.value)} disabled={!clusterId}>
            <option value="">{clusterId ? 'Select school...' : 'Pick a cluster first'}</option>
            {schools.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </FSelect>
        </div>

        {clusters.length === 0 && (
          <div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
            You have no clusters assigned yet — go to "My Clusters" to pick which clusters you manage first.
          </div>
        )}

        {schoolId && (
          <>
            {existing && (
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 size={14} /> Already submitted for {monthLabel} — editing will update it.
              </div>
            )}

            <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 pt-1">Cluster / Programme Info</div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Project" value={form.project} onChange={sc('project')} />
              <FInput label="Training Phase" value={form.trainingPhase} onChange={sc('trainingPhase')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Cluster Anchor" value={form.clusterAnchor} onChange={sc('clusterAnchor')} />
              <FInput label="Cohort" value={form.cohort} onChange={sc('cohort')} />
            </div>
            <FInput label="Cluster Status" value={form.clusterStatus} onChange={sc('clusterStatus')} />

            <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 pt-1">Cluster Numbers</div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Schools Trained per Cluster" type="number" value={form.schoolsTrainedPerCluster} onChange={sc('schoolsTrainedPerCluster')} />
              <FInput label="No. Teachers Implementing" type="number" value={form.teachersImplementing} onChange={sc('teachersImplementing')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Teachers Trained per Cluster" type="number" value={form.teachersTrainedPerCluster} onChange={sc('teachersTrainedPerCluster')} />
              <FInput label="Number of Cluster Teachbacks" type="number" value={form.clustersTeachbacks} onChange={sc('clustersTeachbacks')} />
            </div>

            <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 pt-1">Current Session — GESD</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <FInput label="Week 1" value={form.gesdWeek1} onChange={sc('gesdWeek1')} placeholder="e.g. Session 3" />
              <FInput label="Week 2" value={form.gesdWeek2} onChange={sc('gesdWeek2')} placeholder="e.g. Session 3" />
              <FInput label="Week 3" value={form.gesdWeek3} onChange={sc('gesdWeek3')} placeholder="e.g. Session 4" />
              <FInput label="Week 4" value={form.gesdWeek4} onChange={sc('gesdWeek4')} placeholder="e.g. Session 4" />
            </div>

            <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 pt-1">Current Session — HIM</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <FInput label="Week 1" value={form.himWeek1} onChange={sc('himWeek1')} placeholder="e.g. Session 3" />
              <FInput label="Week 2" value={form.himWeek2} onChange={sc('himWeek2')} placeholder="e.g. Session 3" />
              <FInput label="Week 3" value={form.himWeek3} onChange={sc('himWeek3')} placeholder="e.g. Session 4" />
              <FInput label="Week 4" value={form.himWeek4} onChange={sc('himWeek4')} placeholder="e.g. Session 4" />
            </div>

            <FInput label="Session Implementation Status" value={form.sessionImplementationStatus} onChange={sc('sessionImplementationStatus')} />
            <FArea
              label="Comments"
              value={form.comments}
              onChange={sc('comments')}
              rows={3}
              placeholder="Report on implementation status across the cluster, identify issues, specify schools lagging behind, and note those that have completed implementation."
            />

            <div className="flex justify-end pt-2">
              <Btn onClick={submit}>{existing ? 'Update Record' : 'Submit Record'}</Btn>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
