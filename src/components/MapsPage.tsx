import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  MapPin, Sliders, Info, RefreshCw, ChevronRight, Clock, Navigation,
  AlertCircle, CheckCircle, Eye, EyeOff, Layers, Edit2, Wifi, WifiOff,
  ChevronLeft, ChevronRight as ChevronRightIcon, Search, BarChart3, X, Map as MapIcon
} from 'lucide-react';
import { Kicker, Btn, Modal } from './SubComponents';
import { mapClustersApi, mapSchoolsApi } from '../api';

// --- Types & Interfaces (Preserved) ---
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
  
  // New Layout States
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [statsCollapsed, setStatsCollapsed] = useState(false);
  
  const mapRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

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

  const flyToCluster = useCallback((cluster: MapCluster) => {
    const L = (window as any).L;
    if (!mapRef.current || !L) return;
    setActiveClusterId(cluster.id);
    const pts: [number, number][] = [[cluster.lat, cluster.lng], ...cluster.schools.map(s => [s.lat, s.lng] as [number, number])];
    if (pts.length > 1) mapRef.current.flyToBounds(pts, { padding: [100, 100], duration: 1.2 });
    else mapRef.current.flyTo([cluster.lat, cluster.lng], 14, { duration: 1.2 });
  }, []);

  useEffect(() => {
    const L = (window as any).L;
    if (!L || loading || error) return;
    if (!mapRef.current) {
      const map = L.map('ett-map', { zoomControl: false }).setView([-13.2, 34.0], 7);
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
    }
    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();
    L.tileLayer(darkMode ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(layerGroup);

    if (layers.heatmap) {
      filteredClusters.forEach(c => {
        L.circle([c.lat, c.lng], { radius: 18000 * Math.max(c.school_count / 8, 0.5), fillColor: '#e85d04', color: '#e85d04', weight: 1, fillOpacity: 0.3 }).addTo(layerGroup);
      });
    }

    filteredClusters.forEach(cluster => {
      if (layers.connectors) {
        cluster.schools.forEach(s => {
          if ((s.ett_trained && !layers.trainedSchools) || (!s.ett_trained && !layers.untrainedSchools)) return;
          L.polyline([[cluster.lat, cluster.lng], [s.lat, s.lng]], { color: '#e85d04', weight: 1, opacity: 0.2, dashArray: '4 4' }).addTo(layerGroup);
        });
      }
      cluster.schools.forEach(school => {
        if ((school.ett_trained && !layers.trainedSchools) || (!school.ett_trained && !layers.untrainedSchools)) return;
        const icon = L.divIcon({ className: '', html: createSchoolIconHtml(school, darkMode), iconAnchor: [22, 22] });
        L.marker([school.lat, school.lng], { icon, zIndexOffset: 200 }).addTo(layerGroup).bindPopup(createSchoolPopup(school, darkMode), { maxWidth: 270 }).on('click', () => openSchool(school));
      });
      if (layers.clusters) {
        const icon = L.divIcon({ className: '', html: createClusterIconHtml(cluster, darkMode), iconAnchor: [22, 22] });
        L.marker([cluster.lat, cluster.lng], { icon, zIndexOffset: 500 }).addTo(layerGroup).bindPopup(createClusterPopup(cluster, darkMode), { maxWidth: 290 }).on('click', () => { setActiveClusterId(cluster.id); setSelectedCluster(cluster); });
      }
    });

    plannedSchools.forEach(school => {
      const icon = L.divIcon({ className: '', html: createPlannedIconHtml(school), iconAnchor: [6, 6] });
      L.marker([school.lat, school.lng], { icon, zIndexOffset: 150 }).addTo(layerGroup).bindPopup(createPlannedPopup(school, darkMode), { maxWidth: 220 }).on('click', () => openSchool(school));
    });
  }, [filteredClusters, plannedSchools, darkMode, layers, loading, error]);

  return (
    <div className="relative h-screen w-full bg-slate-900 overflow-hidden">
      
      {/* 1. FULL SCREEN MAP BACKGROUND */}
      <div id="ett-map" className="absolute inset-0 z-0" />

      {/* 2. FLOATING HEADER OVERLAY */}
      <div className="absolute top-5 left-5 right-5 md:right-auto z-20 flex flex-col md:flex-row items-start md:items-center gap-4 pointer-events-none">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 shadow-2xl rounded-3xl p-4 pointer-events-auto flex items-center gap-5">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-orange-500 hover:text-white rounded-2xl transition-all shadow-sm"
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <Sliders size={20} />}
          </button>
          <div className="pr-4 border-r border-slate-200 dark:border-slate-700">
            <Kicker text="Malawi Coverage Map" />
            <h1 className="text-xl font-black text-slate-900 dark:text-white leading-none tracking-tight">Clusters & Hubs</h1>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <OnlineBadge isOnline={isOnline} />
            <button onClick={fetchClusters} className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-orange-500 transition-colors">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* 3. FLOATING STATS PANEL (Right Side, Collapsible) */}
      <div className={`absolute top-5 right-5 z-20 w-80 transition-all duration-500 ease-out ${statsCollapsed ? 'translate-y-[-10px] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 shadow-2xl rounded-[32px] overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              <BarChart3 size={16} className="text-orange-500" /> Live Analytics
            </div>
            <button onClick={() => setStatsCollapsed(true)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <ChevronUp size={16} className="text-slate-400" />
            </button>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Learners" value={stats.totalLearners.toLocaleString()} />
              <StatCard label="Trained" value={stats.trainedCount} />
            </div>
            <div className="bg-slate-50/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase">ETT Coverage</span>
                <span className="text-lg font-black text-orange-600">{stats.coveragePct}%</span>
              </div>
              <MiniBar value={stats.coveragePct} />
              <div className="mt-2 text-[10px] text-slate-400 font-bold text-center">
                {stats.trainedCount} of {stats.allSchoolsCount} schools certified
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Expand Trigger */}
      {statsCollapsed && (
        <button 
          onClick={() => setStatsCollapsed(false)}
          className="absolute top-5 right-5 z-20 bg-orange-600 text-white shadow-xl shadow-orange-600/20 rounded-2xl px-4 py-3 font-bold text-xs flex items-center gap-2 hover:bg-orange-700 transition-all active:scale-95"
        >
          <BarChart3 size={16} /> Show Stats
        </button>
      )}

      {/* 4. FLOATING SIDEBAR (Left Side, Floating & Collapsible) */}
      <div className={`absolute top-24 left-5 bottom-8 z-20 w-85 transition-all duration-500 ease-in-out transform ${sidebarOpen ? 'translate-x-0 opacity-100' : 'translate-x-[-120%] opacity-0'}`}>
        <div className="h-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/20 dark:border-slate-800 shadow-2xl rounded-[40px] flex flex-col overflow-hidden">
          
          {/* SEARCH & REGION */}
          <div className="p-6 space-y-5 border-b border-slate-100 dark:border-slate-800">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={16} />
              <input 
                type="text" placeholder="Search clusters..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-orange-500 dark:text-white transition-all"
              />
            </div>
            <RegionFilter selected={selectedRegion} onSelect={setSelectedRegion} />
          </div>

          {/* LAYERS (Moved into Sidebar) */}
          <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
              <Layers size={12} className="text-orange-500" /> Active Map Layers
            </div>
            <div className="flex flex-wrap gap-2">
              {LAYERS.map(l => (
                <button 
                  key={l.key} onClick={() => setLayers(p => ({ ...p, [l.key]: !p[l.key] }))}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${layers[l.key] ? 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 shadow-sm' : 'opacity-40 border-transparent grayscale'}`}
                >
                  {layers[l.key] ? <Eye size={12} className="text-orange-500" /> : <EyeOff size={12} />}
                  <span className="dark:text-slate-300">{l.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* CLUSTER LIST */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            <ClusterList 
              loading={loading} error={error} 
              clusters={filteredClusters} 
              activeId={activeClusterId}
              onSelect={(c: any) => { flyToCluster(c); setSelectedCluster(c); }}
            />
          </div>

          {/* CARTOGRAPHER ACTION */}
          {isCartographer && (
            <div className="p-6 bg-slate-50/80 dark:bg-slate-800/80">
              <button 
                onClick={() => setPage('cartographer_home')}
                className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[24px] text-xs font-black shadow-lg hover:scale-[1.02] transition-transform"
              >
                <Edit2 size={14} /> Cartographer Console
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. LEGEND OVERLAY (Bottom Center) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 hidden md:flex items-center gap-8 px-8 py-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 dark:border-slate-800 rounded-full shadow-xl pointer-events-none">
        <LegendItem color="bg-emerald-500" label="Trained" />
        <LegendItem color="bg-amber-500" label="Untrained" />
        <LegendItem color="bg-slate-900 border-2 border-orange-500 rounded-full" label="Hub Centre" />
        <LegendItem color="border-2 border-dashed border-violet-500 rotate-45" label="Planned" />
      </div>

      {/* MODALS */}
      {selectedCluster && <ClusterModal cluster={selectedCluster} isCartographer={isCartographer} onSetPage={setPage} onClose={() => setSelectedCluster(null)} onSchoolClick={openSchool} />}
      {selectedSchool && <SchoolModal school={schoolDetail ?? selectedSchool} loading={loadingSchool} isCartographer={isCartographer} onSetPage={setPage} onClose={() => { setSelectedSchool(null); setSchoolDetail(null); }} />}
    </div>
  );
};

// --- Specialized Helper Components ---

const StatCard = ({ label, value }: { label: string; value: string | number }) => (
  <div className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-2xl border border-white/20 dark:border-slate-700">
    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</div>
    <div className="text-base font-black text-slate-900 dark:text-white">{value}</div>
  </div>
);

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-2.5">
    <div className={`w-3.5 h-3.5 shrink-0 shadow-sm ${color}`} />
    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{label}</span>
  </div>
);

// --- Reuse logic for Icons & Popups from previous context ---
const createSchoolIconHtml = (school: MapSchool, darkMode: boolean) => {
  const bg = school.ett_trained ? '#16a34a' : '#d97706';
  const border = school.ett_trained ? '#064e3b' : '#78350f';
  return `<div style="display:flex;flex-direction:column;align-items:center;"><div style="width:28px;height:28px;border-radius:6px;background:${bg};border:2px solid ${border};display:flex;align-items:center;justify-content:center;box-shadow:0 3px 6px rgba(0,0,0,0.3);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div><div style="margin-top:-2px;background:${darkMode ? 'rgba(15,22,35,0.95)' : 'rgba(255,255,255,0.95)'};color:${darkMode ? '#f1f5f9' : '#1e293b'};font-size:9px;font-weight:800;padding:1px 5px;border-radius:4px;border:1px solid rgba(0,0,0,0.1);white-space:nowrap;max-width:75px;overflow:hidden;text-overflow:ellipsis;box-shadow:0 2px 4px rgba(0,0,0,0.1);">${school.name}</div></div>`;
};

const createClusterIconHtml = (c: MapCluster, d: boolean) => `<div style="display:flex;flex-direction:column;align-items:center;"><div style="width:32px;height:32px;border-radius:50%;background:${d ? '#1e293b' : '#0f1623'};border:2.5px solid #e85d04;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.4);"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e85d04" stroke-width="3"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg></div><div style="margin-top:-2px;background:#e85d04;color:white;font-size:10px;font-weight:900;padding:2px 6px;border-radius:5px;box-shadow:0 2px 8px rgba(232,93,4,0.4);">${c.name}</div></div>`;

const createPlannedIconHtml = (s: MapSchool) => `<div style="display:flex;flex-direction:column;align-items:center;"><div style="width:12px;height:12px;transform:rotate(45deg);border:2.5px dashed #7c3aed;"></div><div style="margin-top:4px;background:#7c3aed;color:white;font-size:7px;font-weight:800;padding:1px 4px;border-radius:3px;">${s.name}</div></div>`;

const createSchoolPopup = (s: MapSchool, d: boolean) => `<div style="padding:4px;font-family:sans-serif;color:${d ? '#fff' : '#000'}"><div style="font-weight:900;font-size:14px;margin-bottom:2px">${s.name}</div><div style="font-size:10px;color:#e85d04;font-weight:800">${s.district}</div></div>`;
const createClusterPopup = (c: MapCluster, d: boolean) => `<div style="padding:4px;font-family:sans-serif;color:${d ? '#fff' : '#000'}"><div style="font-weight:900;font-size:15px;margin-bottom:2px">${c.name}</div><div style="font-size:10px;color:#e85d04;font-weight:800">${c.district} Hub</div></div>`;
const createPlannedPopup = (s: MapSchool, d: boolean) => `<div style="padding:4px;font-family:sans-serif;color:${d ? '#fff' : '#000'}"><div style="font-weight:900;font-size:13px">${s.name}</div><div style="font-size:10px;color:#7c3aed;font-weight:800 uppercase tracking-widest">Planned Site</div></div>`;

// --- Reuse Sub-components (MiniBar, OnlineBadge, StatTile, CurrPill, etc. same as provided) ---
const MiniBar = ({ value }: { value: number }) => (
  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(value, 100)}%`, background: '#e85d04' }} />
  </div>
);
// ... others preserved ...