import React, { useState, useEffect, useCallback } from 'react';
import {
  Map, MapPin, Edit2, CheckCircle, AlertTriangle, Save,
  Plus, Search, Check, RefreshCw, Trash2, AlertCircle,
  Navigation, Award, Users, BookOpen, Phone, Mail,
  ChevronDown, ChevronUp, Eye, X
} from 'lucide-react';
import { Card, Kicker, Btn, FInput, FSelect, FArea, Modal, StatCard, ProgBar } from './SubComponents';
import { DISTRICT_LIST } from '../data';
import { mapClustersApi, mapSchoolsApi, mapZonesApi } from '../api';
import { User } from '../types';

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Zone { id: number; name: string; district: string; region: string; }

interface MapSchool {
  id: number;
  cluster_id: number;
  name: string;
  district: string;
  region: string;
  zone_id?: number;
  zone_name?: string;
  lat: number;
  lng: number;
  headteacher?: string;
  headteacher_phone?: string;
  him_running: boolean;
  gesd_running: boolean;
  boys_enrolled: number;
  girls_enrolled: number;
  trained_teachers: number;
  tots: number;
  stots: number;
  teachbacks: number;
  sessions_completed: number;
  sessions_planned: number;
  last_session_date?: string;
  ett_trained: boolean;
  verified: boolean;
  verification_notes?: string;
  status: 'active' | 'inactive' | 'planned';
  notes?: string;
}

interface MapCluster {
  id: number;
  name: string;
  district: string;
  region: string;
  zone_id?: number;
  zone_name?: string;
  lat: number;
  lng: number;
  lead?: string;
  lead_phone?: string;
  lead_email?: string;
  students: number;
  boys: number;
  girls: number;
  trained: number;
  tots: number;
  stots: number;
  teachbacks: number;
  progress: number;
  verified: boolean;
  ground_truth?: string;
  last_verified?: string;
  school_count: number;
  schools: MapSchool[];
}

const REGIONS = ['Northern', 'Central', 'Southern'];

// ─── BLANK TEMPLATES ──────────────────────────────────────────────────────────

const BLANK_CLUSTER: Omit<MapCluster, 'id' | 'school_count' | 'schools'> = {
  name: '', district: 'Lilongwe', region: 'Central',
  lat: -13.9, lng: 33.7,
  lead: '', lead_phone: '', lead_email: '',
  students: 0, boys: 0, girls: 0, trained: 0,
  tots: 0, stots: 0, teachbacks: 0, progress: 0,
  verified: false, ground_truth: '',
};

const BLANK_SCHOOL: Omit<MapSchool, 'id'> = {
  cluster_id: 0, district: 'Lilongwe', region: 'Central',
  name: '', lat: -13.9, lng: 33.7,
  headteacher: '', headteacher_phone: '',
  him_running: false, gesd_running: false,
  boys_enrolled: 0, girls_enrolled: 0,
  trained_teachers: 0, tots: 0, stots: 0, teachbacks: 0,
  sessions_completed: 0, sessions_planned: 0,
  ett_trained: false, verified: false, status: 'active', notes: '',
};

// ─── SMALL UI HELPERS ─────────────────────────────────────────────────────────

const FieldRow = ({ label, value }: { label: string; value: string | number | boolean }) => (
  <div>
    <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-0.5">{label}</div>
    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
      {typeof value === 'boolean' ? (value ? '✓ Yes' : '✗ No') : (value || '—')}
    </div>
  </div>
);

const SectionHead = ({ title }: { title: string }) => (
  <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 pb-1 border-b border-slate-100 dark:border-slate-800 mb-3">
    {title}
  </div>
);

// ─── CLUSTER FORM ─────────────────────────────────────────────────────────────

const ClusterForm = ({
  data, onChange
}: {
  data: Partial<MapCluster>;
  onChange: (updated: Partial<MapCluster>) => void;
}) => {
  const set = (k: keyof MapCluster, v: any) => onChange({ ...data, [k]: v });
  return (
    <div className="space-y-4">
      <SectionHead title="Identity" />
      <div className="grid grid-cols-2 gap-3">
        <FInput label="Cluster Name *"   value={data.name || ''}   onChange={e => set('name', e.target.value)} />
        <FInput label="Lead Coordinator" value={data.lead || ''}   onChange={e => set('lead', e.target.value)} />
        <FInput label="Lead Phone"       value={data.lead_phone || ''} onChange={e => set('lead_phone', e.target.value)} />
        <FInput label="Lead Email"       value={data.lead_email || ''} onChange={e => set('lead_email', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FSelect label="District *" value={data.district || ''} onChange={e => set('district', e.target.value)}>
          {DISTRICT_LIST.map(d => <option key={d}>{d}</option>)}
        </FSelect>
        <FSelect label="Region *" value={data.region || ''} onChange={e => set('region', e.target.value)}>
          {REGIONS.map(r => <option key={r}>{r}</option>)}
        </FSelect>
      </div>

      <SectionHead title="Coordinates" />
      <div className="grid grid-cols-2 gap-3">
        <FInput label="Latitude *"  type="number" value={data.lat || ''} onChange={e => set('lat', parseFloat(e.target.value) || 0)} />
        <FInput label="Longitude *" type="number" value={data.lng || ''} onChange={e => set('lng', parseFloat(e.target.value) || 0)} />
      </div>

      <SectionHead title="Programme Numbers" />
      <div className="grid grid-cols-3 gap-3">
        <FInput label="Total Students" type="number" value={data.students || 0} onChange={e => set('students', parseInt(e.target.value) || 0)} />
        <FInput label="Boys"           type="number" value={data.boys || 0}     onChange={e => set('boys',     parseInt(e.target.value) || 0)} />
        <FInput label="Girls"          type="number" value={data.girls || 0}    onChange={e => set('girls',    parseInt(e.target.value) || 0)} />
        <FInput label="Trained Teachers" type="number" value={data.trained || 0}   onChange={e => set('trained',    parseInt(e.target.value) || 0)} />
        <FInput label="TOTs"           type="number" value={data.tots || 0}     onChange={e => set('tots',     parseInt(e.target.value) || 0)} />
        <FInput label="STOTs"          type="number" value={data.stots || 0}    onChange={e => set('stots',    parseInt(e.target.value) || 0)} />
        <FInput label="Teachbacks"     type="number" value={data.teachbacks || 0} onChange={e => set('teachbacks', parseInt(e.target.value) || 0)} />
        <FInput label="Progress %"     type="number" value={data.progress || 0} onChange={e => set('progress',  Math.min(100, parseInt(e.target.value) || 0))} />
      </div>

      <SectionHead title="Verification" />
      <FArea
        label="Ground Truth Notes"
        value={data.ground_truth || ''}
        onChange={e => set('ground_truth', e.target.value)}
        placeholder="e.g. Visited 2026-05-10 — marker accurate within 20m"
      />
      <div className="flex items-center gap-2">
        <input
          type="checkbox" id="cluster-verified"
          checked={!!data.verified}
          onChange={e => set('verified', e.target.checked)}
          className="w-4 h-4 rounded accent-emerald-500"
        />
        <label htmlFor="cluster-verified" className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
          Mark as ground-verified
        </label>
      </div>
    </div>
  );
};

// ─── SCHOOL FORM ──────────────────────────────────────────────────────────────

const SchoolForm = ({
  data, clusters, onChange
}: {
  data: Partial<MapSchool>;
  clusters: MapCluster[];
  onChange: (updated: Partial<MapSchool>) => void;
}) => {
  const set = (k: keyof MapSchool, v: any) => onChange({ ...data, [k]: v });
  const isPlanned = data.status === 'planned';
  return (
    <div className="space-y-4">
      <SectionHead title="Identity" />
      <div className="grid grid-cols-2 gap-3">
        <FInput label="School Name *" value={data.name || ''} onChange={e => set('name', e.target.value)} />
        <FSelect label="Status" value={data.status || 'active'} onChange={e => {
          set('status', e.target.value);
          // Clear cluster when switching to planned
          if (e.target.value === 'planned') onChange({ ...data, status: 'planned', cluster_id: 0 });
        }}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="planned">Planned (no cluster yet)</option>
        </FSelect>

        {!isPlanned && (
          <FSelect label="Cluster *" value={data.cluster_id || ''} onChange={e => set('cluster_id', parseInt(e.target.value))}>
            <option value="">— Select cluster —</option>
            {clusters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </FSelect>
        )}
        {isPlanned && (
          <div className="col-span-1 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-2.5 text-xs text-purple-700 dark:text-purple-300">
            📋 This school will be saved as <strong>Planned</strong> — no cluster required. You can assign it to a cluster later by editing.
          </div>
        )}

        <FSelect label="District *" value={data.district || ''} onChange={e => set('district', e.target.value)}>
          {DISTRICT_LIST.map(d => <option key={d}>{d}</option>)}
        </FSelect>
        <FSelect label="Region *" value={data.region || ''} onChange={e => set('region', e.target.value)}>
          {REGIONS.map(r => <option key={r}>{r}</option>)}
        </FSelect>
      </div>

      <SectionHead title="Headteacher" />
      <div className="grid grid-cols-2 gap-3">
        <FInput label="Headteacher Name"  value={data.headteacher || ''}       onChange={e => set('headteacher',       e.target.value)} />
        <FInput label="Headteacher Phone" value={data.headteacher_phone || ''} onChange={e => set('headteacher_phone', e.target.value)} />
      </div>

      <SectionHead title="Coordinates" />
      <div className="grid grid-cols-2 gap-3">
        <FInput label="Latitude *"  type="number" value={data.lat || ''} onChange={e => set('lat', parseFloat(e.target.value) || 0)} />
        <FInput label="Longitude *" type="number" value={data.lng || ''} onChange={e => set('lng', parseFloat(e.target.value) || 0)} />
      </div>

      <SectionHead title="Curriculum" />
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
          <input type="checkbox" checked={!!data.him_running}  onChange={e => set('him_running',  e.target.checked)} className="w-4 h-4 rounded accent-orange-500" />
          HIM (Boys) Running
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
          <input type="checkbox" checked={!!data.gesd_running} onChange={e => set('gesd_running', e.target.checked)} className="w-4 h-4 rounded accent-orange-500" />
          GESD (Girls) Running
        </label>
      </div>

      <SectionHead title="Enrolment & Staffing" />
      <div className="grid grid-cols-3 gap-3">
        <FInput label="Boys Enrolled"   type="number" value={data.boys_enrolled || 0}   onChange={e => set('boys_enrolled',   parseInt(e.target.value) || 0)} />
        <FInput label="Girls Enrolled"  type="number" value={data.girls_enrolled || 0}  onChange={e => set('girls_enrolled',  parseInt(e.target.value) || 0)} />
        <FInput label="Trained Teachers" type="number" value={data.trained_teachers || 0} onChange={e => set('trained_teachers', parseInt(e.target.value) || 0)} />
        <FInput label="TOTs"            type="number" value={data.tots || 0}            onChange={e => set('tots',             parseInt(e.target.value) || 0)} />
        <FInput label="STOTs"           type="number" value={data.stots || 0}           onChange={e => set('stots',            parseInt(e.target.value) || 0)} />
        <FInput label="Teachbacks"      type="number" value={data.teachbacks || 0}      onChange={e => set('teachbacks',       parseInt(e.target.value) || 0)} />
        <FInput label="Sessions Done"   type="number" value={data.sessions_completed || 0} onChange={e => set('sessions_completed', parseInt(e.target.value) || 0)} />
        <FInput label="Sessions Planned" type="number" value={data.sessions_planned || 0} onChange={e => set('sessions_planned', parseInt(e.target.value) || 0)} />
        <FInput label="Last Session"    type="date"   value={data.last_session_date || ''} onChange={e => set('last_session_date', e.target.value)} />
      </div>

      <SectionHead title="Verification" />
      <div className="grid grid-cols-2 gap-3 mb-2">
        <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
          <input type="checkbox" checked={!!data.ett_trained} onChange={e => set('ett_trained', e.target.checked)} className="w-4 h-4 rounded accent-orange-500" />
          ETT Trained
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
          <input type="checkbox" checked={!!data.verified} onChange={e => set('verified', e.target.checked)} className="w-4 h-4 rounded accent-emerald-500" />
          GIS Verified
        </label>
      </div>
      <FArea
        label="Verification Notes"
        value={data.verification_notes || ''}
        onChange={e => set('verification_notes', e.target.value)}
        placeholder="e.g. Confirmed on field visit 2026-05-12, marker adjusted 30m west"
      />
      <FArea
        label="General Notes"
        value={data.notes || ''}
        onChange={e => set('notes', e.target.value)}
      />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface Props { user: User; showToast: (msg: string) => void; }

export const CartographerPage: React.FC<Props> = ({ user, showToast }) => {
  // ── Data state ────────────────────────────────────────────────────────────
  const [clusters, setClusters] = useState<MapCluster[]>([]);
  const [zones,    setZones]    = useState<Zone[]>([]);
  const [plannedSchools, setPlannedSchools] = useState<MapSchool[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [saving,   setSaving]   = useState(false);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [view, setView] = useState<'clusters' | 'schools' | 'planned' | 'queue'>('clusters');
  const [searchQ, setSearchQ]         = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [expandedId, setExpandedId]   = useState<number | null>(null);

  // ── Modal state ───────────────────────────────────────────────────────────
  const [editCluster,  setEditCluster]  = useState<Partial<MapCluster> | null>(null);
  const [isNewCluster, setIsNewCluster] = useState(false);
  const [editSchool,   setEditSchool]   = useState<Partial<MapSchool> | null>(null);
  const [isNewSchool,  setIsNewSchool]  = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'cluster' | 'school'; id: number; name: string } | null>(null);

  // ── Derived lists ─────────────────────────────────────────────────────────
  const allSchools = clusters.flatMap(c => c.schools);

  const filteredClusters = clusters.filter(c => {
    if (regionFilter !== 'All' && c.region !== regionFilter) return false;
    if (searchQ && !c.name.toLowerCase().includes(searchQ.toLowerCase()) &&
        !c.district.toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  });

  const filteredSchools = allSchools.filter(s =>
    !searchQ || s.name.toLowerCase().includes(searchQ.toLowerCase()) ||
    s.district.toLowerCase().includes(searchQ.toLowerCase())
  );

  const queueClusters = clusters.filter(c => !c.verified);
  const queueSchools  = allSchools.filter(s => !s.verified);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const verifiedClusters = clusters.filter(c => c.verified).length;
  const verifiedSchools  = allSchools.filter(s => s.verified).length;
  const trainedSchools   = allSchools.filter(s => s.ett_trained).length;

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [clusterData, zoneData, plannedData] = await Promise.all([
        mapClustersApi.getAll(),
        mapZonesApi.getAll(),
        mapSchoolsApi.getAll({ status: 'planned' }),
      ]);
      if (Array.isArray(clusterData)) setClusters(clusterData);
      if (Array.isArray(zoneData))    setZones(zoneData);
      // Planned schools = status 'planned' OR cluster_id is 0/null
      if (Array.isArray(plannedData)) setPlannedSchools(plannedData);
    } catch {
      setError('Could not load data from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  // ── Save cluster ──────────────────────────────────────────────────────────
  const saveCluster = async () => {
    if (!editCluster?.name || !editCluster.lat || !editCluster.lng) {
      showToast('❌ Name and coordinates are required'); return;
    }
    setSaving(true);
    try {
      if (isNewCluster) {
        const created = await mapClustersApi.create(editCluster);
        setClusters(prev => [{ ...created, schools: [] }, ...prev]);
        showToast('✅ Cluster created');
      } else {
        const updated = await mapClustersApi.update(editCluster.id!, editCluster);
        setClusters(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c));
        showToast('✅ Cluster updated');
      }
      setEditCluster(null);
    } catch {
      showToast('❌ Save failed — check console');
    } finally {
      setSaving(false);
    }
  };

  // ── Save school ───────────────────────────────────────────────────────────
  const saveSchool = async () => {
    const isPlanned = editSchool?.status === 'planned';
    if (!editSchool?.name || !editSchool.lat || !editSchool.lng) {
      showToast('❌ Name and coordinates are required'); return;
    }
    if (!isPlanned && !editSchool.cluster_id) {
      showToast('❌ Please select a cluster, or set status to Planned'); return;
    }
    setSaving(true);
    try {
      const payload = {
        ...editSchool,
        cluster_id: (editSchool.cluster_id && editSchool.cluster_id !== 0)
          ? editSchool.cluster_id
          : null,
      };
      if (isNewSchool) {
        const created = await mapSchoolsApi.create(payload);
        if (isPlanned || !created.cluster_id) {
          setPlannedSchools(prev => [created, ...prev]);
        } else {
          setClusters(prev => prev.map(c =>
            c.id === created.cluster_id
              ? { ...c, schools: [...c.schools, created], school_count: c.school_count + 1 }
              : c
          ));
        }
        showToast(isPlanned ? '✅ Planned school added' : '✅ School added to cluster');
      } else {
        const updated = await mapSchoolsApi.update(editSchool.id!, payload);
        // Update in planned list
        setPlannedSchools(prev => prev.map(s => s.id === updated.id ? { ...s, ...updated } : s));
        // Update in cluster list
        setClusters(prev => prev.map(c => ({
          ...c,
          schools: c.schools.map(s => s.id === updated.id ? { ...s, ...updated } : s)
        })));
        showToast('✅ School updated');
      }
      setEditSchool(null);
    } catch {
      showToast('❌ Save failed — check console');
    } finally {
      setSaving(false);
    }
  };

  // ── Quick verify ──────────────────────────────────────────────────────────
  const verifyCluster = async (cluster: MapCluster) => {
    try {
      const payload = {
        verified: true,
        ground_truth: cluster.ground_truth || 'Verified on ground',
        last_verified: new Date().toISOString().split('T')[0],
      };
      await mapClustersApi.update(cluster.id, payload);
      setClusters(prev => prev.map(c => c.id === cluster.id ? { ...c, ...payload } : c));
      showToast('✅ Cluster marked verified');
    } catch { showToast('❌ Update failed'); }
  };

  const verifySchool = async (school: MapSchool) => {
    try {
      const payload = { verified: true, last_verified: new Date().toISOString() };
      await mapSchoolsApi.update(school.id, payload);
      setClusters(prev => prev.map(c => ({
        ...c, schools: c.schools.map(s => s.id === school.id ? { ...s, ...payload } : s)
      })));
      showToast('✅ School location verified');
    } catch { showToast('❌ Update failed'); }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const doDelete = async () => {
    if (!confirmDelete) return;
    try {
      if (confirmDelete.type === 'cluster') {
        await mapClustersApi.delete(confirmDelete.id);
        setClusters(prev => prev.filter(c => c.id !== confirmDelete.id));
        showToast('🗑️ Cluster deleted');
      }
      // school delete not in API yet — just refresh
    } catch { showToast('❌ Delete failed'); }
    setConfirmDelete(null);
  };

  // ── Loading / error screens ───────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center h-48 text-sm text-slate-400 gap-2">
      <RefreshCw size={16} className="animate-spin" /> Loading GIS data…
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-48 gap-3">
      <AlertCircle size={28} className="text-red-500" />
      <p className="text-sm text-slate-500">{error}</p>
      <Btn size="sm" onClick={fetch}>Retry</Btn>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-5 animate-fade-in-up">

      {/* ── HEADER ── */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <Kicker text="Geospatial Data Management" />
          <h1 className="text-xl font-black text-slate-900 dark:text-white m-0 tracking-tight text-balance">
            GIS Cartographer Console
          </h1>
          <p className="text-xs text-slate-500 mt-1 m-0">
            Manage school coordinates, cluster groups, and field verification status.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={fetch}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-orange-500 transition"
          >
            <RefreshCw size={12} /> Refresh
          </button>
          {view === 'clusters' && (
            <Btn size="sm" onClick={() => { setEditCluster({ ...BLANK_CLUSTER }); setIsNewCluster(true); }}>
              <Plus size={12} className="inline mr-1" /> New Cluster
            </Btn>
          )}
          {view === 'schools' && (
            <Btn size="sm" onClick={() => { setEditSchool({ ...BLANK_SCHOOL }); setIsNewSchool(true); }}>
              <Plus size={12} className="inline mr-1" /> Add School
            </Btn>
          )}
          {view === 'planned' && (
            <Btn size="sm" onClick={() => {
              setEditSchool({ ...BLANK_SCHOOL, status: 'planned', cluster_id: 0 });
              setIsNewSchool(true);
            }}>
              <Plus size={12} className="inline mr-1" /> Add Planned School
            </Btn>
          )}
        </div>
      </div>

      {/* ── KPI STRIP ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<Map size={18} className="text-emerald-500" />}       label="Total Clusters"      value={clusters.length}    color="#059669" />
        <StatCard icon={<CheckCircle size={18} className="text-blue-500" />}   label="Verified Clusters"   value={verifiedClusters}   color="#3b82f6" />
        <StatCard icon={<MapPin size={18} className="text-orange-500" />}      label="Total Schools"       value={allSchools.length}  color="#e85d04" />
        <StatCard icon={<Award size={18} className="text-emerald-500" />}      label="ETT Trained Schools" value={trainedSchools}      color="#059669" />
      </div>

      {/* ── PROGRESS BARS ── */}
      <Card>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Verification Progress</h3>
        <div className="space-y-3">
          {[
            { label: 'Clusters Verified', done: verifiedClusters, total: clusters.length },
            { label: 'Schools Verified',  done: verifiedSchools,  total: allSchools.length },
            { label: 'Schools ETT Trained', done: trainedSchools, total: allSchools.length },
          ].map(({ label, done, total }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{label}</span>
                <span className="text-slate-400 font-mono">{done} / {total}</span>
              </div>
              <ProgBar pct={total > 0 ? Math.round((done / total) * 100) : 0} />
            </div>
          ))}
        </div>
      </Card>

      {/* ── TABS ── */}
      <div className="overflow-x-auto whitespace-nowrap flex gap-2 pb-1 -mx-1 px-1">
        {[
          { v: 'clusters', l: 'Clusters' },
          { v: 'schools',  l: 'Schools' },
          { v: 'planned',  l: `Planned${plannedSchools.length > 0 ? ` (${plannedSchools.length})` : ''}` },
          { v: 'queue',    l: `Verify Queue${queueClusters.length + queueSchools.length > 0 ? ` (${queueClusters.length + queueSchools.length})` : ''}` },
        ].map(tab => (
          <button
            key={tab.v}
            onClick={() => setView(tab.v as any)}
            className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 min-h-[36px] items-center ${
              view === tab.v
                ? tab.v === 'planned' ? 'bg-purple-600 text-white' : 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700'
            }`}
          >
            {tab.l}
          </button>
        ))}
      </div>

      {/* ── SEARCH + FILTER ── */}
      {view !== 'queue' && (
        <div className="flex flex-col gap-2 md:flex-row">
          <div className="relative flex-1 min-w-0">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder={view === 'clusters' ? 'Search clusters or districts…' : 'Search schools or districts…'}
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 min-h-[36px]"
            />
          </div>
          <select
            value={regionFilter}
            onChange={e => setRegionFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none min-h-[36px]"
          >
            {['All', ...REGIONS].map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          CLUSTERS VIEW
      ══════════════════════════════════════════════════════════════════ */}
      {view === 'clusters' && (
        <div className="space-y-3">
          {filteredClusters.length === 0 && (
            <div className="text-center py-10 text-xs text-slate-400">No clusters found.</div>
          )}
          {filteredClusters.map(cluster => {
            const isExpanded = expandedId === cluster.id;
            return (
              <div
                key={cluster.id}
                className={`rounded-2xl border overflow-hidden transition-all ${
                  cluster.verified
                    ? 'border-emerald-200 dark:border-emerald-900/40'
                    : 'border-amber-200 dark:border-amber-900/40'
                }`}
              >
                {/* Row header */}
                <div className={`flex flex-col gap-2 md:flex-row md:items-center md:justify-between p-4 cursor-pointer select-none ${
                  cluster.verified
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/10'
                    : 'bg-amber-50/40 dark:bg-amber-950/10'
                }`}
                  onClick={() => setExpandedId(isExpanded ? null : cluster.id)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {cluster.verified
                      ? <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                      : <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                    }
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{cluster.name}</div>
                      <div className="text-[10.5px] text-slate-500 text-pretty">
                        📍 {cluster.district} · {cluster.region} · {cluster.school_count} schools · Lead: {cluster.lead || '—'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    <Btn size="sm" onClick={e => { e.stopPropagation(); setEditCluster({ ...cluster }); setIsNewCluster(false); }}>
                      <Edit2 size={10} className="inline mr-0.5" /> Edit
                    </Btn>
                    {!cluster.verified && (
                      <Btn size="sm" variant="success" onClick={e => { e.stopPropagation(); verifyCluster(cluster); }}>
                        <Check size={10} className="inline mr-0.5" /> Verify
                      </Btn>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); setConfirmDelete({ type: 'cluster', id: cluster.id, name: cluster.name }); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                    >
                      <Trash2 size={12} />
                    </button>
                    {isExpanded ? <ChevronUp size={13} className="text-slate-400" /> : <ChevronDown size={13} className="text-slate-400" />}
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <FieldRow label="Coordinates"    value={`${Number(cluster.lat).toFixed(5)}, ${Number(cluster.lng).toFixed(5)}`} />
                      <FieldRow label="Students"       value={cluster.students} />
                      <FieldRow label="TOTs"           value={cluster.tots} />
                      <FieldRow label="STOTs"          value={cluster.stots} />
                      <FieldRow label="Teachbacks"     value={cluster.teachbacks} />
                      <FieldRow label="Progress"       value={`${cluster.progress}%`} />
                      <FieldRow label="Lead Phone"     value={cluster.lead_phone || '—'} />
                      <FieldRow label="Lead Email"     value={cluster.lead_email || '—'} />
                      {cluster.ground_truth && (
                        <div className="col-span-2 md:col-span-4">
                          <FieldRow label="Ground Truth Notes" value={cluster.ground_truth} />
                        </div>
                      )}
                    </div>

                    {/* Schools inside cluster */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                          Schools in Cluster ({cluster.schools.length})
                        </div>
                        <Btn size="sm" onClick={() => {
                          setEditSchool({ ...BLANK_SCHOOL, cluster_id: cluster.id, district: cluster.district, region: cluster.region });
                          setIsNewSchool(true);
                        }}>
                          <Plus size={10} className="inline mr-0.5" /> Add School
                        </Btn>
                      </div>
                      <div className="space-y-1.5">
                        {cluster.schools.length === 0 && (
                          <p className="text-xs text-slate-400 italic">No schools added yet.</p>
                        )}
                        {cluster.schools.map(s => (
                          <div key={s.id} className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs ${
                            s.verified
                              ? 'border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/20'
                              : s.ett_trained
                              ? 'border-orange-100 dark:border-orange-900/30 bg-orange-50/20'
                              : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'
                          }`}>
                            <div className="flex flex-col gap-0.5 shrink-0">
                              {s.ett_trained
                                ? <Award size={12} className="text-orange-500" />
                                : <MapPin size={12} className="text-slate-400" />
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{s.name}</div>
                              <div className="text-[10px] text-slate-400">
                                {Number(s.lat).toFixed(4)}, {Number(s.lng).toFixed(4)}
                                {' · '}
                                {[s.him_running && 'HIM', s.gesd_running && 'GESD'].filter(Boolean).join('+') || 'No curriculum'}
                                {' · '}👥 {(s.boys_enrolled + s.girls_enrolled).toLocaleString()} learners
                              </div>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              {s.ett_trained && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400">ETT</span>
                              )}
                              {s.verified && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">✓ Verified</span>
                              )}
                              <Btn size="sm" variant="secondary" onClick={() => { setEditSchool({ ...s }); setIsNewSchool(false); }}>
                                <Edit2 size={10} />
                              </Btn>
                              {!s.verified && (
                                <Btn size="sm" variant="success" onClick={() => verifySchool(s)}>
                                  <Check size={10} />
                                </Btn>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          SCHOOLS VIEW
      ══════════════════════════════════════════════════════════════════ */}
      {view === 'schools' && (
        <div className="space-y-2">
          {filteredSchools.length === 0 && (
            <div className="text-center py-10 text-xs text-slate-400">No schools found.</div>
          )}
          {filteredSchools.map(school => (
            <div key={school.id} className={`rounded-xl border p-3 flex items-center gap-3 ${
              school.verified  ? 'border-emerald-100 dark:border-emerald-900/30 bg-white dark:bg-slate-950'
              : school.ett_trained ? 'border-orange-100 dark:border-orange-900/30 bg-orange-50/20 dark:bg-orange-950/10'
              : 'border-amber-100 dark:border-amber-900/20 bg-amber-50/20 dark:bg-amber-950/10'
            }`}>
              {school.verified
                ? <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                : school.ett_trained
                ? <Award size={14} className="text-orange-500 shrink-0" />
                : <AlertTriangle size={14} className="text-amber-500 shrink-0" />
              }
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{school.name}</div>
                <div className="text-[10px] text-slate-500 mt-0.5 flex flex-wrap gap-x-2">
                  <span>📍 {school.district}</span>
                  <span>{Number(school.lat).toFixed(4)}, {Number(school.lng).toFixed(4)}</span>
                  <span>👥 {(school.boys_enrolled + school.girls_enrolled).toLocaleString()}</span>
                  {school.ett_trained && <span className="text-orange-500 font-bold">ETT ✓</span>}
                  {school.verified    && <span className="text-emerald-500 font-bold">GIS ✓</span>}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Btn size="sm" variant="secondary" onClick={() => { setEditSchool({ ...school }); setIsNewSchool(false); }}>
                  <Edit2 size={10} />
                </Btn>
                {!school.verified && (
                  <Btn size="sm" variant="success" onClick={() => verifySchool(school)}>
                    <Check size={10} /> Verify
                  </Btn>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          VERIFICATION QUEUE
      ══════════════════════════════════════════════════════════════════ */}
      {view === 'queue' && (
        <div className="space-y-4">
          {queueClusters.length === 0 && queueSchools.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle size={40} className="text-emerald-500 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">All records verified!</h3>
              <p className="text-xs text-slate-500 mt-1">Ground truth matches confirmed for all locations.</p>
            </div>
          ) : (
            <>
              {queueClusters.length > 0 && (
                <>
                  <div className="flex items-center gap-2 px-1">
                    <AlertTriangle size={14} className="text-amber-500" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Clusters needing verification ({queueClusters.length})
                    </span>
                  </div>
                  {queueClusters.map(c => (
                    <Card key={c.id} className="border-amber-200 dark:border-amber-900/40">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-white">{c.name}</div>
                          <div className="text-[10.5px] text-slate-500 mt-0.5">
                            {c.district} · {c.school_count} schools · {Number(c.lat).toFixed(4)}, {Number(c.lng).toFixed(4)}
                          </div>
                          <div className="mt-1.5 space-y-1">
                            {c.schools.map(s => (
                              <div key={s.id} className="flex items-center gap-2 text-[11px]">
                                {s.verified
                                  ? <CheckCircle size={11} className="text-emerald-500" />
                                  : <div className="w-2.5 h-2.5 rounded-full border-2 border-amber-400" />
                                }
                                <span className={s.verified ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}>
                                  {s.name} — {Number(s.lat).toFixed(4)}, {Number(s.lng).toFixed(4)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <Btn size="sm" onClick={() => { setEditCluster({ ...c }); setIsNewCluster(false); }}>
                            <Edit2 size={10} className="inline mr-0.5" /> Edit
                          </Btn>
                          <Btn size="sm" variant="success" onClick={() => verifyCluster(c)}>
                            <Check size={10} className="inline mr-0.5" /> Verify
                          </Btn>
                        </div>
                      </div>
                    </Card>
                  ))}
                </>
              )}

              {queueSchools.length > 0 && (
                <>
                  <div className="flex items-center gap-2 px-1 mt-4">
                    <AlertTriangle size={14} className="text-amber-500" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Schools needing verification ({queueSchools.length})
                    </span>
                  </div>
                  {queueSchools.map(s => (
                    <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl border border-amber-200 dark:border-amber-900/30 bg-amber-50/20 dark:bg-amber-950/10">
                      <AlertTriangle size={13} className="text-amber-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{s.name}</div>
                        <div className="text-[10px] text-slate-500">{s.district} · {Number(s.lat).toFixed(4)}, {Number(s.lng).toFixed(4)}</div>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <Btn size="sm" variant="secondary" onClick={() => { setEditSchool({ ...s }); setIsNewSchool(false); }}>
                          <Edit2 size={10} />
                        </Btn>
                        <Btn size="sm" variant="success" onClick={() => verifySchool(s)}>
                          <Check size={10} /> Verify
                        </Btn>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          PLANNED SCHOOLS VIEW
      ══════════════════════════════════════════════════════════════════ */}
      {view === 'planned' && (
        <div className="space-y-3">
          <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 rounded-xl p-3 text-xs text-purple-800 dark:text-purple-300">
            <strong>Planned Schools</strong> are schools identified for future ETT implementation but not yet assigned to a cluster. They appear on the map as grey markers.
          </div>
          {plannedSchools.length === 0 && (
            <div className="text-center py-12">
              <MapPin size={32} className="text-purple-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No planned schools yet</p>
              <p className="text-xs text-slate-500 mt-1">Click "Add Planned School" to register a school for future implementation.</p>
            </div>
          )}
          {plannedSchools.map(school => (
            <div key={school.id} className="rounded-xl border border-purple-200 dark:border-purple-900/40 bg-purple-50/30 dark:bg-purple-950/10 p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                <MapPin size={14} className="text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{school.name}</div>
                <div className="text-[10px] text-slate-500 mt-0.5 flex flex-wrap gap-x-2">
                  <span>📍 {school.district} · {school.region}</span>
                  <span>{Number(school.lat).toFixed(4)}, {Number(school.lng).toFixed(4)}</span>
                  <span className="text-purple-600 font-bold">Planned</span>
                </div>
                {school.notes && (
                  <div className="text-[10px] text-slate-400 mt-0.5 italic">{school.notes}</div>
                )}
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Btn size="sm" variant="secondary" onClick={() => { setEditSchool({ ...school }); setIsNewSchool(false); }}>
                  <Edit2 size={10} />
                </Btn>
                <Btn size="sm" onClick={() => {
                  // Promote to active — open edit with cluster selection
                  setEditSchool({ ...school, status: 'active' });
                  setIsNewSchool(false);
                  showToast('Assign a cluster to activate this school');
                }}>
                  Activate
                </Btn>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          EDIT CLUSTER MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {editCluster && (
        <Modal
          title={isNewCluster ? 'Add New Cluster' : `Edit Cluster: ${editCluster.name}`}
          onClose={() => setEditCluster(null)}
          width={580}
        >
          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <ClusterForm data={editCluster} onChange={setEditCluster} />
          </div>
          <div className="flex gap-2 justify-end pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
            <Btn variant="secondary" size="sm" onClick={() => setEditCluster(null)}>Cancel</Btn>
            <Btn size="sm" onClick={saveCluster} disabled={saving}>
              <Save size={11} className="inline mr-1" />
              {saving ? 'Saving…' : isNewCluster ? 'Create Cluster' : 'Save Changes'}
            </Btn>
          </div>
        </Modal>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          EDIT SCHOOL MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {editSchool && (
        <Modal
          title={isNewSchool ? 'Add New School' : `Edit School: ${editSchool.name}`}
          onClose={() => setEditSchool(null)}
          width={600}
        >
          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <SchoolForm data={editSchool} clusters={clusters} onChange={setEditSchool} />
          </div>
          <div className="flex gap-2 justify-end pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
            <Btn variant="secondary" size="sm" onClick={() => setEditSchool(null)}>Cancel</Btn>
            <Btn size="sm" onClick={saveSchool} disabled={saving}>
              <Save size={11} className="inline mr-1" />
              {saving ? 'Saving…' : isNewSchool ? 'Add School' : 'Save School'}
            </Btn>
          </div>
        </Modal>
      )}

      {/* ── DELETE CONFIRM ── */}
      {confirmDelete && (
        <Modal title="Confirm Delete" onClose={() => setConfirmDelete(null)} width={360}>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Are you sure you want to permanently delete <b>{confirmDelete.name}</b>?
            This will also remove all schools inside it.
          </p>
          <div className="flex gap-2 justify-end">
            <Btn variant="secondary" size="sm" onClick={() => setConfirmDelete(null)}>Cancel</Btn>
            <Btn size="sm" variant="danger" onClick={doDelete}>Delete</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};