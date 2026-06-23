import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  MapPin, Sliders, Info, RefreshCw, ChevronRight, Clock, Navigation,
  AlertCircle, CheckCircle, Eye, EyeOff, Layers, Edit2, Wifi, WifiOff,
  ChevronLeft, ChevronDown, ChevronUp, Search, BarChart3, X
} from 'lucide-react';
import { Kicker, Btn, Modal } from './SubComponents';
import { mapClustersApi, mapSchoolsApi } from '../api';

// --- Types (Kept from previous version) ---
interface MapSchool { /* ... same as before ... */ }
interface MapCluster { /* ... same as before ... */ }
type LayerKey = 'clusters' | 'trainedSchools' | 'untrainedSchools' | 'connectors' | 'heatmap';

const LAYERS: { key: LayerKey; label: string; activeClass: string }[] = [
  { key: 'clusters', label: 'Cluster Centres', activeClass: 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' },
  { key: 'trainedSchools', label: 'Trained Schools', activeClass: 'bg-emerald-600 text-white' },
  { key: 'untrainedSchools', label: 'Untrained Schools', activeClass: 'bg-amber-500 text-white' },
  { key: 'connectors', label: 'Connectors', activeClass: 'bg-orange-500 text-white' },
  { key: 'heatmap', label: 'Heat Map', activeClass: 'bg-red-600 text-white' },
];

export const MapsPage: React.FC<any> = ({ setPage, user, darkMode }) => {
  const isCartographer = user?.role === 'cartographer';
  
  // Data & UI State
  const [clusters, setClusters] = useState<any[]>([]);
  const [plannedSchools, setPlannedSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Floating Panel Visibility States
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [statsOpen, setStatsOpen] = useState(false);
  
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeClusterId, setActiveClusterId] = useState<number | null>(null);
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    clusters: true, trainedSchools: true, untrainedSchools: true, connectors: true, heatmap: false
  });

  const [selectedCluster, setSelectedCluster] = useState<any | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<any | null>(null);
  const [schoolDetail, setSchoolDetail] = useState<any | null>(null);
  const [loadingSchool, setLoadingSchool] = useState(false);

  const mapRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  // --- Core Map Logic (Same as previous optimization) ---
  const fetchClusters = useCallback(async () => {
    setLoading(true);
    try {
      const [c, p] = await Promise.all([
        mapClustersApi.getAll(selectedRegion !== 'All' ? { region: selectedRegion } : {}),
        mapSchoolsApi.getAll({ status: 'planned' }),
      ]);
      setClusters(Array.isArray(c) ? c : []);
      setPlannedSchools(Array.isArray(p) ? p.filter((s: any) => !s.cluster_id) : []);
    } catch { setError('Load failed'); }
    finally { setLoading(false); }
  }, [selectedRegion]);

  useEffect(() => { fetchClusters(); }, [fetchClusters]);

  const filteredClusters = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return clusters.filter(c => !q || c.name.toLowerCase().includes(q) || c.district.toLowerCase().includes(q));
  }, [clusters, searchQuery]);

  const stats = useMemo(() => {
    const all = clusters.flatMap(c => c.schools);
    const trained = all.filter(s => s.ett_trained).length;
    return {
      total: clusters.reduce((a, c) => a + c.students, 0),
      trained,
      coverage: all.length > 0 ? Math.round((trained / all.length) * 100) : 0,
      count: all.length
    };
  }, [clusters]);

  // Leaflet Sync Effect
  useEffect(() => {
    const L = (window as any).L;
    if (!L || loading || error) return;
    if (!mapRef.current) {
      mapRef.current = L.map('ett-map', { zoomControl: false }).setView([-13.2, 34.0], 7);
      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
      layerGroupRef.current = L.layerGroup().addTo(mapRef.current);
    }
    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    L.tileLayer(darkMode ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(layerGroup);
    
    // ... Rendering logic for markers/polylines same as previous version ...
    // Note: Use createSchoolIconHtml, createClusterPopup, etc. from previous refactor.

  }, [filteredClusters, layers, darkMode, loading, error]);

  const flyToCluster = (c: any) => {
    const L = (window as any).L;
    if (!mapRef.current) return;
    setActiveClusterId(c.id);
    const pts: [number, number][] = [[c.lat, c.lng], ...c.schools.map((s: any) => [s.lat, s.lng])];
    mapRef.current.flyToBounds(pts, { padding: [100, 100], duration: 1.5 });
  };

  return (
    <div className="relative h-screen w-full bg-slate-100 overflow-hidden font-sans">
      
      {/* 1. BACKGROUND MAP */}
      <div id="ett-map" className="absolute inset-0 z-0" />

      {/* 2. FLOATING HEADER OVERLAY */}
      <div className="absolute top-4 left-4 right-4 md:right-auto z-10 flex flex-col md:flex-row items-start md:items-center gap-4 pointer-events-none">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 dark:border-slate-800 shadow-xl rounded-2xl p-4 pointer-events-auto flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-600 dark:text-slate-300"
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <Sliders size={20} />}
          </button>
          <div>
            <Kicker text="Malawi Interactive Map" />
            <h1 className="text-xl font-black text-slate-900 dark:text-white leading-none tracking-tight">Coverage Explorer</h1>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden md:block" />
          <div className="hidden md:flex items-center gap-3">
            <OnlineBadge isOnline={navigator.onLine} />
            <button onClick={fetchClusters} className="p-2 hover:text-orange-500 text-slate-400 transition-colors">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Floating Quick Stats Trigger (Mobile/Compact) */}
        {!statsOpen && (
          <button 
            onClick={() => setStatsOpen(true)}
            className="bg-orange-600 text-white shadow-lg shadow-orange-500/30 rounded-2xl px-4 py-3 flex items-center gap-2 pointer-events-auto hover:bg-orange-700 transition-all active:scale-95"
          >
            <BarChart3 size={18} />
            <span className="text-sm font-bold">{stats.coverage}% Coverage</span>
          </button>
        )}
      </div>

      {/* 3. FLOATING SIDEBAR (Left) */}
      <div className={`absolute top-24 left-4 bottom-24 z-10 w-80 flex flex-col transition-all duration-500 ease-in-out transform ${sidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-[calc(100%+2rem)] opacity-0'}`}>
        <div className="flex-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-800 shadow-2xl rounded-3xl overflow-hidden flex flex-col">
          
          {/* SEARCH & FILTERS */}
          <div className="p-4 space-y-4 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" placeholder="Search clusters..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-orange-500 dark:text-white"
              />
            </div>
            
            <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
              {['All', 'Northern', 'Central', 'Southern'].map(r => (
                <button 
                  key={r} onClick={() => setSelectedRegion(r)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${selectedRegion === r ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* LAYER TOGGLES (Integrated into Sidebar) */}
          <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1">
              <Layers size={12} /> Map Layers
            </div>
            <div className="flex flex-wrap gap-1.5">
              {LAYERS.map(l => (
                <button 
                  key={l.key} onClick={() => setLayers(p => ({ ...p, [l.key]: !p[l.key] }))}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${layers[l.key] ? 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 shadow-sm' : 'opacity-40 border-transparent grayscale'}`}
                >
                  {layers[l.key] ? <Eye size={12} className="text-orange-500" /> : <EyeOff size={12} />}
                  <span className="dark:text-slate-300">{l.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* LIST */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            <ClusterList 
              clusters={filteredClusters} 
              activeId={activeClusterId}
              onSelect={(c: any) => { flyToCluster(c); setSelectedCluster(c); }}
            />
          </div>

          {/* FOOTER ACTION */}
          {isCartographer && (
            <div className="p-4 bg-slate-50/80 dark:bg-slate-800/80">
              <button onClick={() => setPage('cartographer_home')} className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-xs font-bold hover:scale-[1.02] transition-transform">
                <Edit2 size={14} /> Open Editor
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. FLOATING STATS PANEL (Top Right) */}
      <div className={`absolute top-4 right-4 z-10 w-72 transition-all duration-500 transform ${statsOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}`}>
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-800 shadow-2xl rounded-3xl overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-xs text-slate-900 dark:text-white uppercase tracking-tighter">
              <BarChart3 size={16} className="text-orange-500" /> Live Statistics
            </div>
            <button onClick={() => setStatsOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <X size={16} className="text-slate-400" />
            </button>
          </div>
          <div className="p-4 grid grid-cols-1 gap-3">
            <StatRow label="Learners" value={stats.total.toLocaleString()} icon={<MapPin size={12}/>} />
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-end">
                <div className="text-[10px] font-bold text-slate-400 uppercase">ETT Coverage</div>
                <div className="text-lg font-black text-orange-500 leading-none">{stats.coverage}%</div>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${stats.coverage}%` }} />
              </div>
              <div className="text-[10px] text-slate-400 font-medium text-center">
                {stats.trained} of {stats.count} schools trained
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. MAP LEGEND (Bottom Center) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden md:flex items-center gap-6 px-6 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-white/20 dark:border-slate-800 rounded-2xl shadow-lg pointer-events-none">
        <LegendItem color="bg-emerald-500" label="Trained" />
        <LegendItem color="bg-amber-500" label="Pending" />
        <LegendItem color="border-2 border-orange-500 rounded-full" label="Hub" />
        <LegendItem color="border-2 border-dashed border-violet-500 rotate-45" label="Planned" />
      </div>

      {/* MODALS (Kept from previous version) */}
      {selectedCluster && <ClusterModal cluster={selectedCluster} onClose={() => setSelectedCluster(null)} onSchoolClick={(s: any) => { setSchoolDetail(null); setSelectedSchool(s); }} />}
      {selectedSchool && <SchoolModal school={schoolDetail ?? selectedSchool} onClose={() => setSelectedSchool(null)} />}
      
    </div>
  );
};

// --- Helper Components for the Overlay Layout ---

const StatRow = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
    <div className="flex items-center gap-2">
      <div className="text-slate-400">{icon}</div>
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</div>
    </div>
    <div className="text-sm font-black text-slate-900 dark:text-white">{value}</div>
  </div>
);

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 shrink-0 ${color}`} />
    <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{label}</span>
  </div>
);