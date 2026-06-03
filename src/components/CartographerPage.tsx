import React, { useState } from 'react';
import {
  Map, MapPin, Edit2, CheckCircle, AlertTriangle, Save,
  X, Plus, Layers, Navigation, Eye, Search, Info, Check
} from 'lucide-react';
import { Card, Kicker, Btn, Badge, FInput, FSelect, Modal, StatCard, ProgBar } from './SubComponents';
import { MAP_CLUSTERS, MapCluster, DISTRICTS, DISTRICT_LIST } from '../data';
import { User } from '../types';

interface Props {
  user: User;
  showToast: (msg: string) => void;
}

type EditableSchool = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  verified: boolean;
  notes: string;
};

type EditableCluster = MapCluster & {
  verified: boolean;
  groundTruth: string;
  lastVerified: string;
};

export const CartographerPage: React.FC<Props> = ({ user, showToast }) => {
  const [clusters, setClusters] = useState<EditableCluster[]>(
    MAP_CLUSTERS.map((c, i) => ({
      ...c,
      verified: i % 3 === 0,
      groundTruth: i % 3 === 0 ? 'Verified on ground' : 'Pending field verification',
      lastVerified: i % 3 === 0 ? '2026-05-15' : '—',
    }))
  );

  const [selectedCluster, setSelectedCluster] = useState<EditableCluster | null>(null);
  const [editingCluster, setEditingCluster] = useState<EditableCluster | null>(null);
  const [editingSchool, setEditingSchool] = useState<EditableSchool | null>(null);
  const [schools, setSchools] = useState<EditableSchool[]>(
    MAP_CLUSTERS.flatMap(c =>
      c.schools.map((s, i) => ({
        id: c.id * 100 + i,
        name: s.name,
        lat: s.lat,
        lng: s.lng,
        verified: i % 2 === 0,
        notes: '',
      }))
    )
  );
  const [searchQ, setSearchQ] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [view, setView] = useState<'clusters' | 'schools' | 'verification'>('clusters');

  const verifiedClusters = clusters.filter(c => c.verified).length;
  const verifiedSchools = schools.filter(s => s.verified).length;
  const totalSchools = schools.length;

  const filteredClusters = clusters.filter(c => {
    const d = DISTRICTS.find(d => d.name === c.district);
    if (regionFilter !== 'All' && d?.r !== regionFilter) return false;
    if (searchQ && !c.name.toLowerCase().includes(searchQ.toLowerCase()) && !c.district.toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  });

  const saveClusterEdit = () => {
    if (!editingCluster) return;
    setClusters(prev => prev.map(c => c.id === editingCluster.id ? editingCluster : c));
    showToast('✅ Cluster data updated');
    setEditingCluster(null);
  };

  const saveSchoolEdit = () => {
    if (!editingSchool) return;
    setSchools(prev => prev.map(s => s.id === editingSchool.id ? editingSchool : s));
    showToast('✅ School coordinates updated');
    setEditingSchool(null);
  };

  const verifyCluster = (id: number) => {
    setClusters(prev => prev.map(c => c.id === id ? {
      ...c, verified: true,
      groundTruth: 'Verified on ground',
      lastVerified: new Date().toISOString().split('T')[0]
    } : c));
    showToast('✅ Cluster marked as ground-verified');
  };

  const verifySchool = (id: number) => {
    setSchools(prev => prev.map(s => s.id === id ? { ...s, verified: true } : s));
    showToast('✅ School location verified');
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <Kicker text="Geospatial Verification" />
          <h1 className="text-base font-bold text-black dark:text-white m-0">GIS Cartographer Console</h1>
          <p className="text-xs text-slate-500 mt-1 m-0">
            Verify cluster locations and school coordinates against ground truth.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<Map size={18} className="text-emerald-500" />} label="Total Clusters" value={clusters.length} color="#059669" />
        <StatCard icon={<CheckCircle size={18} className="text-blue-500" />} label="Verified Clusters" value={verifiedClusters} />
        <StatCard icon={<MapPin size={18} className="text-orange-500" />} label="Total Schools" value={totalSchools} />
        <StatCard icon={<AlertTriangle size={18} className="text-amber-500" />} label="Needs Verification" value={totalSchools - verifiedSchools} color="#d97706" />
      </div>

      {/* Verification progress */}
      <Card>
        <h3 className="text-sm font-bold text-black dark:text-white mb-3">Verification Progress</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-black dark:text-white font-medium">Clusters Verified</span>
              <span className="text-slate-500">{verifiedClusters} / {clusters.length}</span>
            </div>
            <ProgBar pct={Math.round(verifiedClusters / clusters.length * 100)} />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-black dark:text-white font-medium">Schools Verified</span>
              <span className="text-slate-500">{verifiedSchools} / {totalSchools}</span>
            </div>
            <ProgBar pct={Math.round(verifiedSchools / totalSchools * 100)} />
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { v: 'clusters', l: 'Clusters' },
          { v: 'schools', l: 'Schools' },
          { v: 'verification', l: 'Verification Queue' },
        ].map(tab => (
          <button
            key={tab.v}
            onClick={() => setView(tab.v as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              view === tab.v
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700'
            }`}
          >
            {tab.l}
          </button>
        ))}
      </div>

      {/* Search & filter */}
      {view !== 'verification' && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Search clusters or districts..."
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-neutral-200 dark:border-slate-700 bg-white dark:bg-[#0f1623] text-xs text-black dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <select
            value={regionFilter}
            onChange={e => setRegionFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-slate-700 bg-white dark:bg-[#0f1623] text-xs text-black dark:text-white focus:outline-none"
          >
            {['All', 'Northern', 'Central', 'Southern'].map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
      )}

      {/* Clusters view */}
      {view === 'clusters' && (
        <div className="space-y-3">
          {filteredClusters.map(cluster => (
            <div
              key={cluster.id}
              className={`rounded-xl border p-4 ${
                cluster.verified
                  ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/10'
                  : 'border-amber-200 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/10'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {cluster.verified
                      ? <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                      : <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                    }
                    <h3 className="text-sm font-bold text-black dark:text-white">{cluster.name}</h3>
                  </div>
                  <div className="text-[11px] text-slate-500 ml-5">
                    📍 {cluster.district} · {cluster.schools.length} schools · Lead: {cluster.lead}
                  </div>
                  <div className="text-[10px] text-slate-400 ml-5 mt-0.5">
                    Coords: {cluster.lat.toFixed(4)}, {cluster.lng.toFixed(4)} · Last verified: {cluster.lastVerified}
                  </div>
                  <div className="text-[11px] ml-5 mt-1 italic" style={{ color: cluster.verified ? '#059669' : '#d97706' }}>
                    {cluster.groundTruth}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <Btn size="sm" onClick={() => setEditingCluster({ ...cluster })}>
                    <Edit2 size={11} className="inline mr-1" /> Edit
                  </Btn>
                  {!cluster.verified && (
                    <Btn size="sm" variant="success" onClick={() => verifyCluster(cluster.id)}>
                      <Check size={11} className="inline mr-1" /> Verify
                    </Btn>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schools view */}
      {view === 'schools' && (
        <div className="space-y-2">
          {schools
            .filter(s => !searchQ || s.name.toLowerCase().includes(searchQ.toLowerCase()))
            .map(school => (
              <div
                key={school.id}
                className={`rounded-xl border p-3 flex items-center gap-3 ${
                  school.verified
                    ? 'border-emerald-100 dark:border-emerald-900/30 bg-white dark:bg-[#0f1623]'
                    : 'border-amber-100 dark:border-amber-900/30 bg-amber-50/20 dark:bg-amber-950/10'
                }`}
              >
                {school.verified
                  ? <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                  : <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-black dark:text-white">{school.name}</div>
                  <div className="text-[10px] text-slate-500">
                    {school.lat.toFixed(5)}, {school.lng.toFixed(5)}
                    {school.notes && <span className="ml-2 text-slate-400">· {school.notes}</span>}
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Btn size="sm" variant="secondary" onClick={() => setEditingSchool({ ...school })}>
                    <Edit2 size={10} />
                  </Btn>
                  {!school.verified && (
                    <Btn size="sm" variant="success" onClick={() => verifySchool(school.id)}>
                      <Check size={10} />
                    </Btn>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Verification queue */}
      {view === 'verification' && (
        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-amber-600" />
              <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">Pending Verifications</h3>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              The following clusters have not yet been verified against ground truth data.
              Visit each location and confirm the cluster markers match physical school locations.
            </p>
          </div>

          <div className="space-y-3">
            {clusters.filter(c => !c.verified).map(cluster => (
              <Card key={cluster.id} className="border-amber-200 dark:border-amber-900/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle size={13} className="text-amber-500" />
                      <h4 className="text-sm font-bold text-black dark:text-white">{cluster.name}</h4>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {cluster.district} · {cluster.schools.length} schools to verify
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      GPS: {cluster.lat.toFixed(4)}, {cluster.lng.toFixed(4)}
                    </div>
                    <div className="mt-2 space-y-1">
                      {cluster.schools.map((s, i) => {
                        const schoolRecord = schools.find(sc => sc.name === s.name);
                        return (
                          <div key={i} className="flex items-center gap-2 text-[11px]">
                            {schoolRecord?.verified
                              ? <CheckCircle size={11} className="text-emerald-500" />
                              : <div className="w-2.5 h-2.5 rounded-full border-2 border-amber-400" />
                            }
                            <span className={schoolRecord?.verified ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}>
                              {s.name} — {s.lat.toFixed(4)}, {s.lng.toFixed(4)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <Btn size="sm" variant="success" onClick={() => verifyCluster(cluster.id)}>
                    <Check size={11} className="inline mr-1" /> Mark Verified
                  </Btn>
                </div>
              </Card>
            ))}

            {clusters.filter(c => !c.verified).length === 0 && (
              <div className="text-center py-12">
                <CheckCircle size={40} className="text-emerald-500 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-black dark:text-white">All Clusters Verified!</h3>
                <p className="text-xs text-slate-500 mt-1">Ground truth matches for all clusters confirmed.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Cluster Modal */}
      {editingCluster && (
        <Modal title={`Edit Cluster: ${editingCluster.name}`} onClose={() => setEditingCluster(null)}>
          <div className="space-y-3">
            <FInput
              label="Cluster Name"
              value={editingCluster.name}
              onChange={e => setEditingCluster({ ...editingCluster, name: e.target.value })}
            />
            <FInput
              label="Lead Name"
              value={editingCluster.lead}
              onChange={e => setEditingCluster({ ...editingCluster, lead: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <FInput
                label="Latitude"
                type="number"
                value={editingCluster.lat}
                onChange={e => setEditingCluster({ ...editingCluster, lat: parseFloat(e.target.value) || 0 })}
              />
              <FInput
                label="Longitude"
                type="number"
                value={editingCluster.lng}
                onChange={e => setEditingCluster({ ...editingCluster, lng: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <FSelect
              label="District"
              value={editingCluster.district}
              onChange={e => setEditingCluster({ ...editingCluster, district: e.target.value })}
            >
              {DISTRICT_LIST.map(d => <option key={d}>{d}</option>)}
            </FSelect>
            <FInput
              label="Ground Truth Notes"
              value={editingCluster.groundTruth}
              onChange={e => setEditingCluster({ ...editingCluster, groundTruth: e.target.value })}
            />
            <div className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                id="verified-cb"
                checked={editingCluster.verified}
                onChange={e => setEditingCluster({ ...editingCluster, verified: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500"
              />
              <label htmlFor="verified-cb" className="text-xs text-black dark:text-white">Mark as ground-verified</label>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Btn variant="secondary" size="sm" onClick={() => setEditingCluster(null)}>Cancel</Btn>
              <Btn size="sm" onClick={saveClusterEdit}>
                <Save size={11} className="inline mr-1" /> Save Changes
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit School Modal */}
      {editingSchool && (
        <Modal title={`Edit School: ${editingSchool.name}`} onClose={() => setEditingSchool(null)}>
          <div className="space-y-3">
            <FInput
              label="School Name"
              value={editingSchool.name}
              onChange={e => setEditingSchool({ ...editingSchool, name: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <FInput
                label="Latitude"
                type="number"
                value={editingSchool.lat}
                onChange={e => setEditingSchool({ ...editingSchool, lat: parseFloat(e.target.value) || 0 })}
              />
              <FInput
                label="Longitude"
                type="number"
                value={editingSchool.lng}
                onChange={e => setEditingSchool({ ...editingSchool, lng: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <FInput
              label="Field Notes"
              value={editingSchool.notes}
              onChange={e => setEditingSchool({ ...editingSchool, notes: e.target.value })}
              placeholder="e.g. Marker off by 50m, corrected"
            />
            <div className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                id="school-verified-cb"
                checked={editingSchool.verified}
                onChange={e => setEditingSchool({ ...editingSchool, verified: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500"
              />
              <label htmlFor="school-verified-cb" className="text-xs text-black dark:text-white">Mark as verified</label>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Btn variant="secondary" size="sm" onClick={() => setEditingSchool(null)}>Cancel</Btn>
              <Btn size="sm" onClick={saveSchoolEdit}>
                <Save size={11} className="inline mr-1" /> Save School
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
