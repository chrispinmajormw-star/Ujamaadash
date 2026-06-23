import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  MapPin, Sliders, Info, RefreshCw, ChevronRight, Clock, Navigation,
  AlertCircle, CheckCircle, Eye, EyeOff, Layers, Edit2, Wifi, WifiOff,
} from 'lucide-react';
import { Kicker, Btn, Modal } from './SubComponents';
import { mapClustersApi, mapSchoolsApi } from '../api';

// --- Types & Interfaces ---
interface MapSchool {
  id: number; cluster_id: number; name: string; district: string; region: string;
  zone_name?: string; lat: number; lng: number; headteacher?: string; headteacher_phone?: string;
  him_running: boolean; gesd_running: boolean; boys_enrolled: number; girls_enrolled: number;
  total_learners: number; trained_teachers: number; tots: number; stots: number; teachbacks: number;
  sessions_completed: number; sessions_planned: number; last_session_date?: string;
  ett_trained: boolean; verified: boolean; status: 'active' | 'inactive' | 'planned';
  notes?: string; visit_logs?: VisitLog[];
}

interface MapCluster {
  id: number; name: string; district: string; region: string; zone_name?: string; pea_officer?: string;
  lat: number; lng: number; lead?: string; lead_phone?: string; lead_email?: string;
  students: number; boys: number; girls: number; trained: number; tots: number; stots: number;
  teachbacks: number; progress: number; verified: boolean; school_count: number; schools: MapSchool[];
}

interface VisitLog { id: number; visit_date: string; purpose: string; findings?: string; visitor_name?: string; }

type LayerKey = 'clusters' | 'trainedSchools' | 'untrainedSchools' | 'connectors' | 'heatmap';

const LAYERS: { key: LayerKey; label: string; activeClass: string }[] = [
  { key: 'clusters', label: 'Cluster Centres', activeClass: 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' },
  { key: 'trainedSchools', label: 'Trained Schools', activeClass: 'bg-emerald-600 text-white' },
  { key: 'untrainedSchools', label: 'Untrained Schools', activeClass: 'bg-amber-500 text-white' },
  { key: 'connectors', label: 'Connectors', activeClass: 'bg-orange-500 text-white' },
  { key: 'heatmap', label: 'Heat Map', activeClass: 'bg-red-600 text-white' },
];

// --- Sub-components ---

const StatTile = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-3 shadow-sm">
    <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">{label}</div>
    <div className="text-lg font-black text-slate-900 dark:text-slate-50 leading-none">{value}</div>
    {sub && <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>}
  </div>
);

const MiniBar = ({ value }: { value: number }) => (
  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(value, 100)}%`, background: '#e85d04' }} />
  </div>
);

const CurrPill = ({ label, active }: { label: string; active: boolean }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${active ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800' : 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-600 line-through opacity-60'}`}>
    {active ? '✓' : '✗'} {label}
  </span>
);

// --- Main Page Component ---

interface MapsPageProps { setPage: (p: string) => void; user: any; darkMode: boolean; }

export const MapsPage: React.FC<MapsPageProps> = ({ setPage, user, darkMode }) => {
  const isCartographer = user?.role === 'cartographer';
  
  // Data State
  const [clusters, setClusters] = useState<MapCluster[]>([]);
  const [plannedSchools, setPlannedSchools] = useState<MapSchool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [activeClusterId, setActiveClusterId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    clusters: true, trainedSchools: true, untrainedSchools: true, connectors: true, heatmap: false
  });
  const [selectedCluster, setSelectedCluster] = useState<MapCluster | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<MapSchool | null>(null);
  const [schoolDetail, setSchoolDetail] = useState<MapSchool | null>(null);
  const [loadingSchool, setLoadingSchool] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const mapRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  // Online status
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => { window.removeEventListener('online', handleStatus); window.removeEventListener('offline', handleStatus); };
  }, []);

  const fetchClusters = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params: any = {};
      if (selectedRegion !== 'All') params.region = selectedRegion;
      const [clusterData, plannedData] = await Promise.all([
        mapClustersApi.getAll(params),
        mapSchoolsApi.getAll({ status: 'planned' }),
      ]);
      setClusters(Array.isArray(clusterData) ? clusterData : []);
      if (Array.isArray(plannedData)) {
        setPlannedSchools(plannedData.filter((s: MapSchool) => !s.cluster_id || s.cluster_id === 0));
      }
    } catch { setError('Could not load map data.'); }
    finally { setLoading(false); }
  }, [selectedRegion]);

  useEffect(() => { fetchClusters(); }, [fetchClusters]);

  const openSchool = async (school: MapSchool) => {
    setSelectedSchool(school); setLoadingSchool(true);
    try { 
      const d = await mapSchoolsApi.getById(school.id); 
      setSchoolDetail(d); 
    } catch { 
      setSchoolDetail(school); 
    } finally { 
      setLoadingSchool(false); 
    }
  };

  // --- Memoized Derived State ---
  const filteredClusters = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return clusters.filter(c => !q || c.name.toLowerCase().includes(q) || c.district.toLowerCase().includes(q));
  }, [clusters, searchQuery]);

  const stats = useMemo(() => {
    const allSchools = clusters.flatMap(c => c.schools);
    const trained = allSchools.filter(s => s.ett_trained).length;
    return {
      totalLearners: clusters.reduce((a, c) => a + c.students, 0),
      trainedCount: trained,
      untrainedCount: allSchools.length - trained,
      totalTeachbacks: clusters.reduce((a, c) => a + c.teachbacks, 0),
      coveragePct: allSchools.length > 0 ? Math.round((trained / allSchools.length) * 100) : 0,
      allSchoolsCount: allSchools.length
    };
  }, [clusters]);

  // --- Map Utilities ---
  const flyToCluster = useCallback((cluster: MapCluster) => {
    const L = (window as any).L;
    if (!mapRef.current || !L) return;
    setActiveClusterId(cluster.id);
    const pts: [number, number][] = [[cluster.lat, cluster.lng], ...cluster.schools.map(s => [s.lat, s.lng] as [number, number])];
    if (pts.length > 1) mapRef.current.flyToBounds(pts, { padding: [80, 80], maxZoom: 15, duration: 1.1 });
    else mapRef.current.flyTo([cluster.lat, cluster.lng], 14, { duration: 1.1 });
  }, []);

  // --- Leaflet Initialization & Rendering ---
  useEffect(() => {
    const L = (window as any).L;
    if (!L || loading || error) return;

    if (!mapRef.current) {
      const map = L.map('ett-map', {
        zoomControl: true,
        scrollWheelZoom: true,
        zoomSnap: 0.5,
        tap: true,
        dragging: true,
        touchZoom: true,
      }).setView([-13.2, 34.0], 7);
      
      L.control.scale({ imperial: false }).addTo(map);
      mapRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    // Tile Layer
    L.tileLayer(
      darkMode
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      { attribution: '&copy; CARTO', maxZoom: 19 }
    ).addTo(layerGroup);

    // Heatmap
    if (layers.heatmap) {
      filteredClusters.forEach(c => {
        L.circle([c.lat, c.lng], {
          radius: 18000 * Math.max(c.school_count / 8, 0.5),
          fillColor: '#e85d04', color: '#e85d04', weight: 1, fillOpacity: 0.4,
        }).addTo(layerGroup);
      });
    }

    filteredClusters.forEach(cluster => {
      // Polylines (Connectors)
      if (layers.connectors) {
        cluster.schools.forEach(s => {
          if ((s.ett_trained && !layers.trainedSchools) || (!s.ett_trained && !layers.untrainedSchools)) return;
          L.polyline([[cluster.lat, cluster.lng], [s.lat, s.lng]], {
            color: '#e85d04', weight: 1, opacity: 0.3, dashArray: '5 5',
          }).addTo(layerGroup);
        });
      }

      // School Markers
      cluster.schools.forEach(school => {
        if ((school.ett_trained && !layers.trainedSchools) || (!school.ett_trained && !layers.untrainedSchools)) return;
        
        const iconHtml = createSchoolIconHtml(school, darkMode);
        const icon = L.divIcon({ className: '', html: iconHtml, iconAnchor: [22, 22] });
        
        L.marker([school.lat, school.lng], { icon, zIndexOffset: 200 })
          .addTo(layerGroup)
          .bindPopup(createSchoolPopup(school, darkMode), { maxWidth: 270 })
          .on('click', () => openSchool(school));
      });

      // Cluster Markers
      if (layers.clusters) {
        const clusterIcon = L.divIcon({ className: '', html: createClusterIconHtml(cluster, darkMode), iconAnchor: [22, 22] });
        L.marker([cluster.lat, cluster.lng], { icon: clusterIcon, zIndexOffset: 500 })
          .addTo(layerGroup)
          .bindPopup(createClusterPopup(cluster, darkMode), { maxWidth: 290 })
          .on('click', () => { setActiveClusterId(cluster.id); setSelectedCluster(cluster); });
      }
    });

    // Planned Schools
    plannedSchools.forEach(school => {
      const icon = L.divIcon({ className: '', html: createPlannedIconHtml(school), iconAnchor: [6, 6] });
      L.marker([school.lat, school.lng], { icon, zIndexOffset: 150 })
        .addTo(layerGroup)
        .bindPopup(createPlannedPopup(school, darkMode), { maxWidth: 220 })
        .on('click', () => openSchool(school));
    });

  }, [filteredClusters, plannedSchools, darkMode, layers, loading, error]);

  return (
    <div className="relative h-screen w-full flex flex-col bg-slate-50 dark:bg-slate-950 p-4">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-2 mb-3 shrink-0">
        <div>
          <Kicker text="Malawi Interactive Coverage Map" />
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50 leading-tight">School Clusters & Hubs</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <OnlineBadge isOnline={isOnline} />
          {isCartographer && (
            <Btn size="sm" onClick={() => setPage('cartographer_home')}>
              <Edit2 size={12} className="mr-1" /> Edit Map Data
            </Btn>
          )}
          <button onClick={fetchClusters} className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-orange-500">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </header>

      {/* STATS STRIP */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4 shrink-0">
        <StatTile label="Total Learners" value={stats.totalLearners.toLocaleString()} sub="across all clusters" />
        <StatTile label="ETT Trained" value={stats.trainedCount} sub={`${stats.coveragePct}% of schools`} />
        <StatTile label="Not Yet Trained" value={stats.untrainedCount} sub="schools pending" />
        <StatTile label="Teachbacks Done" value={stats.totalTeachbacks} sub="cumulative" />
        <StatTile label="Coverage" value={`${stats.coveragePct}%`} sub={`${stats.trainedCount} of ${stats.allSchoolsCount} schools`} />
      </section>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        
        {/* Layer Controls & Legend */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-2 shrink-0">
          <div className="flex flex-wrap gap-3 text-[10px] font-bold text-slate-400">
            <LegendItem color="bg-emerald-600" label="Trained School" />
            <LegendItem color="bg-amber-500" label="Untrained School" />
            <LegendItem color="bg-slate-900 border-2 border-orange-500 rounded-full" label="Cluster Centre" />
            <LegendItem color="border-2 border-dashed border-violet-500 rotate-45" label={`Planned (${plannedSchools.length})`} />
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mr-2 flex items-center gap-1">
              <Layers size={11} /> Layers
            </span>
            {LAYERS.map(l => (
              <LayerBtn key={l.key} active={layers[l.key]} layer={l} onClick={() => setLayers(prev => ({ ...prev, [l.key]: !prev[l.key] }))} />
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          {/* Mobile Sidebar Toggle */}
          <button className="md:hidden flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs font-bold" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span className="flex items-center gap-1.5"><Sliders size={12} /> Clusters & Filters</span>
            <span>{sidebarOpen ? '▲' : '▼'}</span>
          </button>

          {/* SIDEBAR */}
          <aside className={`w-full md:w-80 flex flex-col border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 transition-all ${sidebarOpen ? 'max-h-80' : 'max-h-0'} md:max-h-none overflow-hidden`}>
            <div className="p-3 space-y-3 shrink-0">
              <RegionFilter selected={selectedRegion} onSelect={setSelectedRegion} />
              <SearchBox value={searchQuery} onChange={setSearchQuery} />
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              <ClusterList 
                loading={loading} error={error} 
                clusters={filteredClusters} 
                activeId={activeClusterId}
                onSelect={(c) => { flyToCluster(c); setSelectedCluster(c); }}
              />
            </div>
          </aside>

          {/* MAP */}
          <div className="flex-1 relative">
            <div id="ett-map" className="absolute inset-0 z-0" />
            <div className="absolute bottom-3 left-3 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[9px] text-slate-500 font-bold flex items-center gap-1.5">
              <Info size={10} /> Click any marker for details
            </div>
          </div>
        </div>
      </main>

      {/* MODALS */}
      {selectedCluster && <ClusterModal cluster={selectedCluster} isCartographer={isCartographer} onSetPage={setPage} onClose={() => setSelectedCluster(null)} onSchoolClick={openSchool} />}
      {selectedSchool && <SchoolModal school={schoolDetail ?? selectedSchool} loading={loadingSchool} isCartographer={isCartographer} onSetPage={setPage} onClose={() => { setSelectedSchool(null); setSchoolDetail(null); }} />}
    </div>
  );
};

// --- Helper UI Components ---

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <span className="flex items-center gap-1.5"><span className={`w-3 h-3 shrink-0 ${color}`} /> {label}</span>
);

const LayerBtn = ({ active, layer, onClick }: { active: boolean; layer: any; onClick: () => void }) => (
  <button onClick={onClick} className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${active ? `${layer.activeClass} border-transparent shadow-sm` : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 opacity-50'}`}>
    {active ? <Eye size={10} /> : <EyeOff size={10} />} {layer.label}
  </button>
);

const OnlineBadge = ({ isOnline }: { isOnline: boolean }) => (
  <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${isOnline ? 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20' : 'text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/20'}`}>
    {isOnline ? <><Wifi size={10} /> Online</> : <><WifiOff size={10} /> Offline</>}
  </span>
);

const RegionFilter = ({ selected, onSelect }: { selected: string; onSelect: (r: string) => void }) => (
  <div>
    <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Region</div>
    <div className="flex flex-wrap gap-1">
      {['All', 'Northern', 'Central', 'Southern'].map(r => (
        <button key={r} onClick={() => onSelect(r)} className={`px-2 py-1 rounded-full text-[10px] font-bold transition-all ${selected === r ? 'bg-slate-900 text-white dark:bg-orange-600' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
          {r}
        </button>
      ))}
    </div>
  </div>
);

const SearchBox = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div>
    <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Search</div>
    <input type="text" placeholder="Cluster or district…" value={value} onChange={e => onChange(e.target.value)} className="w-full px-2 py-1.5 text-[11px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
  </div>
);

const ClusterList = ({ loading, error, clusters, activeId, onSelect }: any) => {
  if (loading) return <div className="text-center py-8 text-xs text-slate-400">Loading clusters...</div>;
  if (error) return <div className="p-2 text-xs text-red-500">{error}</div>;
  if (clusters.length === 0) return <div className="p-4 text-xs text-slate-400 text-center">No clusters found</div>;

  return (
    <>
      <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest px-1 pb-1">Clusters ({clusters.length})</div>
      {clusters.map((c: any) => {
        const trained = c.schools.filter((s: any) => s.ett_trained).length;
        const livePct = c.schools.length > 0 ? Math.round((trained / c.schools.length) * 100) : 0;
        return (
          <button key={c.id} onClick={() => onSelect(c)} className={`w-full text-left p-2.5 rounded-xl border transition-all ${activeId === c.id ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-orange-200'}`}>
            <div className="font-bold text-[11px] text-slate-900 dark:text-slate-100 truncate">{c.name}</div>
            <div className="text-[9.5px] text-slate-400 mt-0.5">📍 {c.district}</div>
            <div className="flex gap-2 mt-1 text-[9px] font-bold">
              <span className="text-emerald-600">{trained} trained</span>
              <span className="text-slate-400 ml-auto">{livePct}%</span>
            </div>
            <div className="mt-1.5"><MiniBar value={livePct} /></div>
          </button>
        );
      })}
    </>
  );
};

// --- Modal Content Components ---

const ClusterModal = ({ cluster, isCartographer, onSetPage, onClose, onSchoolClick }: any) => (
  <Modal title={cluster.name} onClose={onClose} width={520}>
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 text-[10px] font-bold">
        <span className="px-2 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">📍 {cluster.district}</span>
        <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">{cluster.region}</span>
        {cluster.verified && <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">✓ GIS Verified</span>}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <StatTile label="Learners" value={cluster.students.toLocaleString()} />
        <StatTile label="Schools" value={cluster.school_count} />
        <StatTile label="Trained" value={cluster.trained} sub="teachers" />
      </div>
      <div>
        <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
          <span>Programme Progress</span>
          <span className="text-orange-600">{cluster.progress}%</span>
        </div>
        <MiniBar value={cluster.progress} />
      </div>
      <div className="max-h-52 overflow-y-auto pr-1 space-y-1.5">
        <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Schools ({cluster.schools.length})</div>
        {cluster.schools.map((s: any) => (
          <button key={s.id} onClick={() => { onClose(); onSchoolClick(s); }} className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition ${s.ett_trained ? 'border-emerald-100 bg-emerald-50/20' : 'border-amber-100 bg-amber-50/10'}`}>
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${s.ett_trained ? 'bg-emerald-500' : 'border-2 border-dashed border-amber-500'}`} />
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{s.name}</div>
            </div>
            <ChevronRight size={12} className="text-slate-300" />
          </button>
        ))}
      </div>
      {isCartographer && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <Btn size="sm" onClick={() => { onClose(); onSetPage('cartographer_home'); }}>
            <Edit2 size={11} className="mr-1" /> Edit in Console
          </Btn>
        </div>
      )}
    </div>
  </Modal>
);

const SchoolModal = ({ school, loading, isCartographer, onSetPage, onClose }: any) => (
  <Modal title={loading ? 'Loading…' : school.name} onClose={onClose} width={500}>
    {loading ? (
      <div className="flex items-center justify-center h-28 text-sm text-slate-400 gap-2"><RefreshCw size={16} className="animate-spin" /> Fetching record…</div>
    ) : (
      <div className="space-y-4">
        <div className={`flex items-center gap-3 p-3 rounded-xl border ${school.ett_trained ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20' : 'bg-amber-50 border-amber-200 dark:bg-amber-950/20'}`}>
          {school.ett_trained ? <CheckCircle size={18} className="text-emerald-600" /> : <AlertCircle size={18} className="text-amber-600" />}
          <div>
            <div className="text-xs font-extrabold">{school.ett_trained ? 'ETT Trained School' : 'Not Yet ETT Trained'}</div>
            <div className="text-[10px] text-slate-500">Active ETT sessions with trained teachers.</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <StatTile label="Boys" value={school.boys_enrolled || 0} />
          <StatTile label="Girls" value={school.girls_enrolled || 0} />
          <StatTile label="Trained" value={school.trained_teachers} sub="teachers" />
        </div>
        <a href={`https://www.google.com/maps/dir/?api=1&destination=${school.lat},${school.lng}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white text-xs font-bold shadow-sm" style={{ background: '#e85d04' }}>
          <Navigation size={13} /> Navigate with Google Maps
        </a>
      </div>
    )}
  </Modal>
);

// --- Leaflet Content Generators (Static Helpers) ---

const createSchoolIconHtml = (school: MapSchool, darkMode: boolean) => {
  const bg = school.ett_trained ? '#16a34a' : '#d97706';
  const border = school.ett_trained ? '#064e3b' : '#78350f';
  return `
    <div style="display:flex;flex-direction:column;align-items:center;">
      <div style="width:28px;height:28px;border-radius:5px;background:${bg};border:2px solid ${border};display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.3);">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      </div>
      <div style="margin-top:-2px;background:${darkMode ? 'rgba(15,22,35,0.9)' : 'rgba(255,255,255,0.9)'};color:${darkMode ? '#f1f5f9' : '#1e293b'};font-size:9px;font-weight:700;padding:1px 4px;border-radius:4px;border:1px solid rgba(0,0,0,0.1);white-space:nowrap;max-width:70px;overflow:hidden;text-overflow:ellipsis;">${school.name}</div>
    </div>`;
};

const createClusterIconHtml = (cluster: MapCluster, darkMode: boolean) => `
  <div style="display:flex;flex-direction:column;align-items:center;">
    <div style="width:30px;height:30px;border-radius:50%;background:${darkMode ? '#1e293b' : '#0f1623'};border:2.5px solid #e85d04;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.4);">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e85d04" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
    </div>
    <div style="margin-top:-2px;background:#e85d04;color:white;font-size:10px;font-weight:800;padding:1px 5px;border-radius:4px;box-shadow:0 1px 4px rgba(232,93,4,.4);">${cluster.name}</div>
  </div>`;

const createPlannedIconHtml = (school: MapSchool) => `
  <div style="display:flex;flex-direction:column;align-items:center;">
    <div style="width:10px;height:10px;transform:rotate(45deg);border:2px dashed #7c3aed;"></div>
    <div style="margin-top:2px;background:#7c3aed;color:white;font-size:7px;font-weight:700;padding:1px 3px;border-radius:3px;">${school.name}</div>
  </div>`;

// --- Popup String Helpers ---
const createSchoolPopup = (s: MapSchool, darkMode: boolean) => `
  <div style="font-family:sans-serif;color:${darkMode ? '#f3f4f6' : '#111827'}">
    <div style="font-weight:900;font-size:13px">${s.name}</div>
    <div style="font-size:10px;color:#e85d04;font-weight:700">${s.district}</div>
    <div style="margin-top:6px;font-size:9px;color:#9ca3af">Click marker for full details →</div>
  </div>`;

const createClusterPopup = (c: MapCluster, darkMode: boolean) => `
  <div style="font-family:sans-serif;color:${darkMode ? '#f8fafc' : '#0f1623'}">
    <div style="font-weight:900;font-size:14px">${c.name}</div>
    <div style="font-size:10px;color:#e85d04;font-weight:700">${c.district}</div>
    <div style="margin-top:6px;font-size:9px;color:#9ca3af">Click to open panel →</div>
  </div>`;

const createPlannedPopup = (s: MapSchool, darkMode: boolean) => `
  <div style="font-family:sans-serif;color:${darkMode ? '#f3f4f6' : '#111827'}">
    <div style="font-weight:900;font-size:12px">${s.name}</div>
    <div style="font-size:10px;color:#7c3aed;font-weight:700">Planned School</div>
  </div>`;