import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin, Sliders, Info, RefreshCw,
  ChevronRight, Clock,
  AlertCircle, CheckCircle, Eye, EyeOff, Layers, Edit2,
} from 'lucide-react';
import { Btn, Modal } from './SubComponents';
import { mapClustersApi, mapSchoolsApi } from '../api';

interface MapSchool {
  id: number; cluster_id: number; name: string; district: string; region: string;
  zone_name?: string; lat: number; lng: number; headteacher?: string; headteacher_phone?: string;
  him_running: boolean; gesd_running: boolean; boys_enrolled: number; girls_enrolled: number;
  total_learners: number; trained_teachers: number; tots: number; stots: number; teachbacks: number;
  sessions_completed: number; sessions_planned: number; last_session_date?: string;
  ett_trained: boolean; verified: boolean; status: 'active'|'inactive'|'planned';
  notes?: string; visit_logs?: VisitLog[];
}
interface MapCluster {
  id: number; name: string; district: string; region: string; zone_name?: string; pea_officer?: string;
  lat: number; lng: number; lead?: string; lead_phone?: string; lead_email?: string;
  students: number; boys: number; girls: number; trained: number; tots: number; stots: number;
  teachbacks: number; progress: number; verified: boolean; school_count: number; schools: MapSchool[];
}
interface VisitLog { id: number; visit_date: string; purpose: string; findings?: string; visitor_name?: string; }

type LayerKey = 'clusters'|'trainedSchools'|'untrainedSchools'|'connectors'|'heatmap'|'unassigned';
const LAYERS: {key:LayerKey;label:string;activeClass:string}[] = [
  {key:'clusters',         label:'Cluster Centres',   activeClass:'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'},
  {key:'trainedSchools',   label:'Trained Schools',   activeClass:'bg-emerald-600 text-white'},
  {key:'untrainedSchools', label:'Untrained Schools', activeClass:'bg-amber-500 text-white'},
  {key:'unassigned',       label:'Unassigned Schools',activeClass:'bg-blue-600 text-white'},
  {key:'connectors',       label:'Connectors',         activeClass:'bg-orange-500 text-white'},
  {key:'heatmap',          label:'Heat Map',        activeClass:'bg-red-600 text-white'},
];

const StatTile = ({label,value,sub}:{label:string;value:string|number;sub?:string}) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-3">
    <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">{label}</div>
    <div className="text-lg font-black text-slate-900 dark:text-slate-50 leading-none">{value}</div>
    {sub && <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>}
  </div>
);
const MiniBar = ({value}:{value:number}) => (
  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
    <div className="h-full rounded-full" style={{width:`${Math.min(value,100)}%`,background:'#e85d04'}}/>
  </div>
);
const CurrPill = ({label,active}:{label:string;active:boolean}) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${active?'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800':'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-600 line-through opacity-60'}`}>
    {active?'✓':'✗'} {label}
  </span>
);

interface MapsPageProps { setPage:(p:string)=>void; user:any; darkMode:boolean; }

export const MapsPage: React.FC<MapsPageProps> = ({ setPage, user, darkMode }) => {
  const isCartographer = user?.role === 'cartographer';
  const [clusters, setClusters]               = useState<MapCluster[]>([]);
  const [plannedSchools, setPlannedSchools]   = useState<MapSchool[]>([]);
  const [unassignedSchools, setUnassignedSchools] = useState<MapSchool[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState<string|null>(null);
  const [selectedRegion, setSelectedRegion]   = useState('All');
  const [activeClusterId, setActiveClusterId] = useState<number|null>(null);
  const [searchQuery, setSearchQuery]         = useState('');
  const [layers, setLayers] = useState<Record<LayerKey,boolean>>({clusters:true,trainedSchools:true,untrainedSchools:true,connectors:true,heatmap:false,unassigned:true});
  const toggleLayer = (key:LayerKey) => setLayers(prev=>({...prev,[key]:!prev[key]}));
  const [selectedCluster, setSelectedCluster] = useState<MapCluster|null>(null);
  const [selectedSchool,  setSelectedSchool]  = useState<MapSchool|null>(null);
  const [schoolDetail,    setSchoolDetail]    = useState<MapSchool|null>(null);
  const [loadingSchool,   setLoadingSchool]   = useState(false);
  const mapRef = useRef<any>(null);

  const fetchClusters = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params:any = {};
      if (selectedRegion !== 'All') params.region = selectedRegion;
      const [clusterData, plannedData, unassignedData] = await Promise.all([
        mapClustersApi.getAll(params),
        mapSchoolsApi.getAll({ status: 'planned' }),
        mapSchoolsApi.getAll(selectedRegion !== 'All' ? { region: selectedRegion } : {}),
      ]);
      if (Array.isArray(clusterData)) setClusters(clusterData);
      else setError('Unexpected response from server.');
      if (Array.isArray(plannedData))
        setPlannedSchools(plannedData.filter((s:MapSchool) => !s.cluster_id));
      if (Array.isArray(unassignedData))
        setUnassignedSchools(unassignedData.filter((s:MapSchool) => !s.cluster_id && s.status !== 'planned' && s.lat && s.lng));
    } catch { setError('Could not load map data.'); }
    finally { setLoading(false); }
  }, [selectedRegion]);

  useEffect(() => { fetchClusters(); }, [fetchClusters]);

  const openSchool = async (school:MapSchool) => {
    setSelectedSchool(school); setLoadingSchool(true);
    try { const d = await mapSchoolsApi.getById(school.id); setSchoolDetail(d); }
    catch { setSchoolDetail(school); }
    finally { setLoadingSchool(false); }
  };

  const filteredClusters = clusters.filter(c => {
    const q = searchQuery.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.district.toLowerCase().includes(q);
  });

  const flyToCluster = useCallback((cluster:MapCluster) => {
    const L = (window as any).L;
    if (!mapRef.current || !L) return;
    setActiveClusterId(cluster.id);
    const pts:[number,number][] = [[cluster.lat,cluster.lng],...cluster.schools.map(s=>[s.lat,s.lng] as [number,number])];
    if (pts.length > 1) mapRef.current.flyToBounds(pts,{padding:[60,60],maxZoom:13,duration:1.1});
    else mapRef.current.flyTo([cluster.lat,cluster.lng],12,{duration:1.1});
  }, []);

  // ── Build Leaflet map ────────────────────────────────────────────────────
  useEffect(() => {
    const L = (window as any).L;
    if (!L || loading || error) return;
    if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }

    // Full-screen map, no auto-zoom-on-resize
    const map = L.map('ett-map', {
      zoomControl: true,
      scrollWheelZoom: true,
      zoomSnap: 0.5,
    }).setView([-13.2, 34.0], 7);
    L.control.zoom({ position: 'bottomleft'}).addTo(map);
    mapRef.current = map;

    // Lock zoom when user has manually zoomed/panned
    map.on('zoomend moveend', () => { /* intentionally no-op — keeps map where user left it */ });

    L.tileLayer(
      darkMode
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      { attribution: '&copy; OpenStreetMap &copy; CARTO', maxZoom: 19 }
    ).addTo(map);
    L.control.scale({ imperial: false }).addTo(map);

    // Heat rings
    if (layers.heatmap) {
      filteredClusters.forEach(c => {
        L.circle([c.lat,c.lng],{
          radius: 18000 * Math.max(c.school_count/8, 0.5),
          fillColor: `rgba(232,93,4,${Math.min(c.students/500,0.7)})`,
          color:'#e85d04', weight:1, fillOpacity:0.4,
        }).addTo(map);
      });
    }

    filteredClusters.forEach(cluster => {
      // Connectors
      if (layers.connectors) {
        cluster.schools.forEach(s => {
          const vis = s.ett_trained ? layers.trainedSchools : layers.untrainedSchools;
          if (!vis) return;
          L.polyline([[cluster.lat,cluster.lng],[s.lat,s.lng]],{
            color:'#e85d04', weight:1.5, opacity:0.4, dashArray:'5 5',
          }).addTo(map);
        });
      }

      // School markers — labelled icons
      cluster.schools.forEach(school => {
        const trained = school.ett_trained;
        if (trained && !layers.trainedSchools)    return;
        if (!trained && !layers.untrainedSchools) return;

        const bg    = trained ? '#16a34a' : '#d97706';
        const border= trained ? '#064e3b' : '#78350f';
        // Icon: school building SVG + name label below
        const iconHtml = `
          <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
            <div style="
              width:14px;height:14px;border-radius:3px;
              background:${bg};border:1.5px solid ${border};
              box-shadow:0 1px 3px rgba(0,0,0,.3);
              display:flex;align-items:center;justify-content:center;
            ">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div style="
              margin-top:2px;
              background:${darkMode?'rgba(15,22,35,0.88)':'rgba(255,255,255,0.88)'};
              color:${darkMode?'#f1f5f9':'#1e293b'};
              font-size:7px;font-weight:700;
              padding:1px 3px;border-radius:3px;
              white-space:nowrap;max-width:60px;overflow:hidden;text-overflow:ellipsis;
              border:1px solid ${darkMode?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.06)'};
              box-shadow:0 1px 2px rgba(0,0,0,.1);
              pointer-events:none;
            ">${school.name.length > 12 ? school.name.slice(0,12)+'…' : school.name}</div>
          </div>`;

        const icon = L.divIcon({ className:'', html:iconHtml, iconAnchor:[7,7] });
        const curricula = [school.him_running&&'HIM', school.gesd_running&&'GESD'].filter(Boolean).join('+') || 'None';
        const totalL = (school.boys_enrolled||0)+(school.girls_enrolled||0);

        L.marker([school.lat,school.lng],{icon,zIndexOffset:200})
          .addTo(map)
          .bindPopup(`
            <div style="font-family:'Plus Jakarta Sans',sans-serif;min-width:210px;color:${darkMode?'#f3f4f6':'#111827'}">
              <div style="font-weight:900;font-size:13px;margin-bottom:2px">${school.name}</div>
              <div style="font-size:10px;font-weight:700;margin-bottom:6px;color:${trained?'#d53d01':'#d97706'}">
                ${trained?'✓ ETT Trained':'○ Not Yet Trained'}
              </div>
              <div style="font-size:10px;color:#e85d04;font-weight:700;margin-bottom:6px">${school.district}</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:6px;font-size:10.5px">
                <div><span style="color:#9ca3af">Learners</span><br><b>${totalL.toLocaleString()}</b></div>
                <div><span style="color:#9ca3af">Trained</span><br><b>${school.trained_teachers}</b></div>
                <div><span style="color:#9ca3af">TOTs</span><br><b>${school.tots}</b></div>
                <div><span style="color:#9ca3af">STOTs</span><br><b>${school.stots}</b></div>
                <div><span style="color:#9ca3af">Teachbacks</span><br><b>${school.teachbacks}</b></div>
                <div><span style="color:#9ca3af">Curriculum</span><br><b style="font-size:9.5px">${curricula}</b></div>
              </div>
              ${school.headteacher?`<div style="font-size:10px;color:#6b7280">HT: <b>${school.headteacher}</b></div>`:''}
              <div style="margin-top:8px;font-size:9px;color:#9ca3af;font-style:italic">Click marker to open full details →</div>
            </div>`,{maxWidth:270})
          .on('click',()=>openSchool(school));
      });

      // Cluster centre — larger pin with name label
      if (!layers.clusters) return;

      const clusterHtml = `
        <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
          <div style="
            width:18px;height:18px;border-radius:50%;
            background:${darkMode?'#1e293b':'#0f1623'};
            border:2px solid #e85d04;
            box-shadow:0 2px 6px rgba(0,0,0,.4);
            display:flex;align-items:center;justify-content:center;
          ">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#e85d04" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
            </svg>
          </div>
          <div style="
            margin-top:2px;
            background:#e85d04;color:white;
            font-size:7px;font-weight:800;
            padding:1px 4px;border-radius:3px;
            white-space:nowrap;max-width:70px;overflow:hidden;text-overflow:ellipsis;
            box-shadow:0 1px 3px rgba(232,93,4,.35);
            pointer-events:none;
          ">${cluster.name.length>14?cluster.name.slice(0,14)+'…':cluster.name}</div>
        </div>`;

      const centerIcon = L.divIcon({className:'',html:clusterHtml,iconAnchor:[9,9]});
      const marker = L.marker([cluster.lat,cluster.lng],{icon:centerIcon,zIndexOffset:500}).addTo(map);

      marker.bindPopup(`
        <div style="font-family:'Plus Jakarta Sans',sans-serif;min-width:240px;color:${darkMode?'#f8fafc':'#0f1623'}">
          <div style="font-weight:900;font-size:14px;margin-bottom:2px">${cluster.name}</div>
          <div style="font-size:10px;color:#e85d04;font-weight:700;margin-bottom:8px">${cluster.district} · ${cluster.region}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:8px;font-size:10.5px">
            <div><span style="color:#9ca3af">Learners</span><br><b>${cluster.students.toLocaleString()}</b></div>
            <div><span style="color:#9ca3af">Schools</span><br><b>${cluster.school_count}</b></div>
            <div><span style="color:#9ca3af">TOTs</span><br><b>${cluster.tots}</b></div>
            <div><span style="color:#9ca3af">STOTs</span><br><b>${cluster.stots}</b></div>
            <div><span style="color:#9ca3af">Teachbacks</span><br><b>${cluster.teachbacks}</b></div>
            <div><span style="color:#9ca3af">Trained</span><br><b>${cluster.trained}</b></div>
          </div>
          ${cluster.lead?`<div style="font-size:10px;color:#6b7280;margin-bottom:6px">Lead: <b>${cluster.lead}</b></div>`:''}
          <div style="background:#f1f5f9;border-radius:4px;height:6px;overflow:hidden">
            <div style="width:${cluster.progress}%;height:100%;background:#e85d04;border-radius:4px"></div>
          </div>
          <div style="font-size:9px;color:#9ca3af;text-align:right;margin-top:2px">${cluster.progress}% progress</div>
          <div style="margin-top:8px;font-size:9px;color:#9ca3af;font-style:italic">Click to open cluster panel →</div>
        </div>`,{maxWidth:290});
      marker.on('click',()=>{setActiveClusterId(cluster.id);setSelectedCluster(cluster);});
    });

    // Planned schools — hollow purple diamond markers (no cluster)
    plannedSchools.forEach(school => {
      const html = `
        <div style="display:flex;flex-direction:column;align-items:center;">
          <div style="
            width:12px;height:12px;
            transform:rotate(45deg);
            background:transparent;
            border:2px dashed #7c3aed;
            box-shadow:0 1px 3px rgba(0,0,0,.2);
          "></div>
          <div style="
            margin-top:3px;
            background:rgba(124,58,237,0.9);color:white;
            font-size:7px;font-weight:700;
            padding:1px 3px;border-radius:3px;
            white-space:nowrap;max-width:60px;overflow:hidden;text-overflow:ellipsis;
            pointer-events:none;
          ">${school.name.length>12?school.name.slice(0,12)+'…':school.name}</div>
        </div>`;
      const icon = L.divIcon({className:'',html,iconAnchor:[6,6]});
      L.marker([school.lat,school.lng],{icon,zIndexOffset:150})
        .addTo(map)
        .bindPopup(`
          <div style="font-family:'Plus Jakarta Sans',sans-serif;min-width:180px;color:${darkMode?'#f3f4f6':'#111827'}">
            <div style="font-weight:900;font-size:12px;margin-bottom:2px">${school.name}</div>
            <div style="font-size:10px;font-weight:700;color:#7c3aed;margin-bottom:4px">📋 Planned School</div>
            <div style="font-size:10px;color:#e85d04;font-weight:700">${school.district}</div>
            ${school.headteacher?`<div style="font-size:10px;color:#6b7280;margin-top:3px">HT: <b>${school.headteacher}</b></div>`:''}
            <div style="font-size:9px;color:#9ca3af;margin-top:4px;font-style:italic">Not yet assigned to a cluster</div>
          </div>`,{maxWidth:220})
        .on('click',()=>openSchool(school));
    });

    // Unassigned schools — blue dot markers, shown so cartographer can group them
    if (layers.unassigned) {
      unassignedSchools.forEach(school => {
        const trained = school.ett_trained;
        const dotColor = trained ? '#16a34a' : '#2563eb'; // green if trained, blue if not yet assigned
        const html = `
          <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
            <div style="
              width:10px;height:10px;border-radius:50%;
              background:${dotColor};
              border:1.5px solid white;
              box-shadow:0 1px 3px rgba(0,0,0,.3);
            "></div>
          </div>`;
        const icon = L.divIcon({className:'',html,iconAnchor:[5,5]});
        L.marker([school.lat, school.lng],{icon,zIndexOffset:100})
          .addTo(map)
          .bindPopup(`
            <div style="font-family:'Plus Jakarta Sans',sans-serif;min-width:180px;color:${darkMode?'#f3f4f6':'#111827'}">
              <div style="font-weight:900;font-size:12px;margin-bottom:2px">${school.name}</div>
              <div style="font-size:10px;font-weight:700;color:#2563eb;margin-bottom:4px">📍 Unassigned School</div>
              <div style="font-size:10px;color:#e85d04;font-weight:700">${school.district}${school.region ? ' · ' + school.region : ''}</div>
              ${school.boys_enrolled||school.girls_enrolled ? `<div style="font-size:10px;color:#6b7280;margin-top:3px">👦 ${school.boys_enrolled||0} boys · 👧 ${school.girls_enrolled||0} girls</div>` : ''}
              ${school.ett_trained ? '<div style="font-size:10px;color:#16a34a;margin-top:3px;font-weight:700">✅ ETT Trained</div>' : '<div style="font-size:10px;color:#d97706;margin-top:3px;">⏳ Not yet trained</div>'}
              <div style="font-size:9px;color:#9ca3af;margin-top:4px;font-style:italic">Awaiting cluster assignment</div>
            </div>`,{maxWidth:220})
          .on('click',()=>openSchool(school));
      });
    }

    return () => { map.remove(); mapRef.current = null; };
  }, [filteredClusters, plannedSchools, unassignedSchools, darkMode, layers, loading, error]);

  const allSchools      = clusters.flatMap(c=>c.schools);
  const totalLearners   = clusters.reduce((a,c)=>a+c.students,0);
  const trainedCount    = allSchools.filter(s=>s.ett_trained).length;
  const untrainedCount  = allSchools.length - trainedCount;
  const totalTeachbacks = clusters.reduce((a,c)=>a+c.teachbacks,0);

  const coveragePct = allSchools.length > 0 ? Math.round((trainedCount / allSchools.length) * 100) : 0;
  const [panelOpen,   setPanelOpen]   = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline,    setIsOnline]    = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  useEffect(() => {
    const on = () => setIsOnline(true); const off = () => setIsOnline(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  return (
    <div className="relative animate-fade-in-up -mx-4 sm:-mx-6 -mt-4" style={{ height: 'calc(100vh - 56px)' }}>

      {/* ── FULL-PAGE MAP (z-0) ─────────────────────────────────────── */}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 dark:bg-slate-950/70">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
            <RefreshCw size={16} className="animate-spin"/> Loading map…
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-950">
          <AlertCircle size={28} className="text-red-500"/>
          <p className="text-sm text-slate-600 dark:text-slate-400">{error}</p>
          <Btn size="sm" onClick={fetchClusters}>Retry</Btn>
        </div>
      )}
      <div id="ett-map" className="absolute inset-0 z-0"/>

      {/* ── TOP BAR — floating over map ────────────────────────────── */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center gap-2">
        {/* Title pill */}
        <div className="flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-lg shrink-0">
          <MapPin size={13} className="text-orange-500 shrink-0"/>
          <div>
            <div className="text-xs font-black text-slate-900 dark:text-white leading-none">Cluster Map</div>
            <div className={`text-[9px] leading-none mt-0.5 font-semibold flex items-center gap-1 ${isOnline ? 'text-emerald-500' : 'text-amber-500'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`}/>
              {isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>

        <div className="flex-1"/>

        {/* Stats toggle */}
        <button onClick={() => setPanelOpen(o => !o)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold shadow-lg border backdrop-blur-sm transition-all min-h-[36px] ${panelOpen ? 'bg-orange-500 text-white border-orange-500' : 'bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}>
          <Sliders size={13}/><span className="hidden sm:inline">Stats</span>
        </button>

        {/* Clusters/sidebar toggle */}
        <button onClick={() => setSidebarOpen(o => !o)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold shadow-lg border backdrop-blur-sm transition-all min-h-[36px] ${sidebarOpen ? 'bg-orange-500 text-white border-orange-500' : 'bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}>
          <Layers size={13}/><span className="hidden sm:inline">Clusters</span>
        </button>

        {isCartographer && (
          <button onClick={() => setPage('cartographer_home')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold shadow-lg border backdrop-blur-sm bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 min-h-[36px]">
            <Edit2 size={13}/>
          </button>
        )}

        <button onClick={fetchClusters}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold shadow-lg border backdrop-blur-sm bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 min-h-[36px]">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''}/>
        </button>
      </div>

      {/* ── STATS PANEL — floating, toggled ────────────────────────── */}
      {panelOpen && (
        <div className="absolute top-16 left-3 right-3 sm:right-auto sm:w-[500px] z-20 bg-white/97 dark:bg-slate-900/97 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-3 animate-fade-in-up">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            <StatTile label="Total Learners"  value={totalLearners.toLocaleString()} sub="all clusters"/>
            <StatTile label="ETT Trained"     value={trainedCount}   sub={`${coveragePct}% coverage`}/>
            <StatTile label="Not Yet Trained" value={untrainedCount} sub="schools pending"/>
            <StatTile label="Teachbacks"      value={totalTeachbacks} sub="cumulative"/>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5 space-y-2">
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-600 shrink-0"/> Trained</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-500 shrink-0"/> Untrained</span>
              <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full border-2 border-orange-500 bg-slate-900 shrink-0"/> Cluster</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 border-2 border-dashed border-violet-500 shrink-0" style={{transform:'rotate(45deg)'}}/> Planned ({plannedSchools.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1 mr-1">
                <Layers size={11}/> Layers:
              </span>
              {LAYERS.map(layer => (
                <button key={layer.key} onClick={() => toggleLayer(layer.key)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all border ${layers[layer.key] ? `${layer.activeClass} border-transparent shadow-sm` : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 opacity-50'}`}>
                  {layers[layer.key] ? <Eye size={10}/> : <EyeOff size={10}/>} {layer.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SIDEBAR PANEL — floating left, toggled ─────────────────── */}
      {sidebarOpen && (
        <div className="absolute top-16 bottom-4 left-3 z-20 w-64 bg-white/97 dark:bg-slate-900/97 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl flex flex-col overflow-hidden animate-fade-in-up">
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 shrink-0 space-y-2.5">
            <div>
              <div className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <Sliders size={11}/> Region
              </div>
              <div className="flex flex-wrap gap-1">
                {['All','Northern','Central','Southern'].map(r => (
                  <button key={r} onClick={() => setSelectedRegion(r)}
                    className={`px-2 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${selectedRegion===r?'bg-slate-900 text-white dark:bg-orange-600':'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <MapPin size={11}/> Search
              </div>
              <input type="text" placeholder="Cluster or district…" value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-2 py-1.5 text-[11px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-slate-200"/>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {loading ? (
              <div className="flex items-center justify-center h-16 text-xs text-slate-400 gap-2">
                <RefreshCw size={12} className="animate-spin"/> Loading…
              </div>
            ) : filteredClusters.length === 0 ? (
              <div className="p-3 text-xs text-slate-400 text-center">No clusters found.</div>
            ) : (
              <>
                <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider px-1 py-1">
                  Clusters ({filteredClusters.length})
                </div>
                {filteredClusters.map(c => {
                  const cTrained   = c.schools.filter(s => s.ett_trained).length;
                  const cUntrained = c.schools.length - cTrained;
                  const livePct    = c.schools.length > 0 ? Math.round((cTrained / c.schools.length) * 100) : 0;
                  return (
                    <button key={c.id} onClick={() => { flyToCluster(c); setSelectedCluster(c); }}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all ${activeClusterId===c.id?'border-orange-500 bg-orange-50/30 dark:bg-orange-950/20':'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-orange-200'}`}>
                      <div className="font-bold text-[11px] text-slate-900 dark:text-slate-100 truncate">{c.name}</div>
                      <div className="text-[9.5px] text-slate-400 mt-0.5">📍 {c.district}</div>
                      <div className="flex gap-2 mt-1 text-[9px] font-bold">
                        <span className="text-emerald-600">{cTrained} trained</span>
                        {cUntrained > 0 && <span className="text-amber-500">{cUntrained} untrained</span>}
                        <span className="text-slate-400 ml-auto">{livePct}%</span>
                      </div>
                      <div className="mt-1.5"><MiniBar value={livePct}/></div>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── BOTTOM HINT ─────────────────────────────────────────────── */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 font-mono pointer-events-none">
        <Info size={10}/> Click any marker for details
      </div>

      {/* CLUSTER MODAL */}
      {selectedCluster&&(
        <Modal title={selectedCluster.name} onClose={()=>setSelectedCluster(null)} width={520}>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 text-[10px] font-bold">
              <span className="px-2 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900">📍 {selectedCluster.district}</span>
              <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">{selectedCluster.region}</span>
              {selectedCluster.zone_name&&<span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-400">{selectedCluster.zone_name}</span>}
              {selectedCluster.verified&&<span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400">✓ GIS Verified</span>}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <StatTile label="Learners"   value={selectedCluster.students.toLocaleString()}/>
              <StatTile label="Schools"    value={selectedCluster.school_count}/>
              <StatTile label="Trained"    value={selectedCluster.trained} sub="teachers"/>
              <StatTile label="TOTs"       value={selectedCluster.tots}/>
              <StatTile label="STOTs"      value={selectedCluster.stots}/>
              <StatTile label="Teachbacks" value={selectedCluster.teachbacks}/>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                <span>Programme Progress</span>
                <span className="text-orange-600">{selectedCluster.progress}%</span>
              </div>
              <MiniBar value={selectedCluster.progress}/>
            </div>
            {selectedCluster.lead&&(
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">Cluster Coordinator</div>
                <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{selectedCluster.lead}</div>
                {selectedCluster.lead_phone&&<div className="text-xs text-slate-500 mt-0.5">📞 {selectedCluster.lead_phone}</div>}
                {selectedCluster.lead_email&&<div className="text-xs text-slate-500 mt-0.5">✉️ {selectedCluster.lead_email}</div>}
              </div>
            )}
            {selectedCluster.schools.length>0&&(
              <div>
                <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Schools ({selectedCluster.schools.length})</div>
                <div className="flex gap-4 mb-2 text-[10px] font-bold">
                  <span className="text-emerald-600">● {selectedCluster.schools.filter(s=>s.ett_trained).length} ETT Trained</span>
                  <span className="text-amber-500">○ {selectedCluster.schools.filter(s=>!s.ett_trained).length} Not Yet Trained</span>
                </div>
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {selectedCluster.schools.map(s=>(
                    <button key={s.id} onClick={()=>{setSelectedCluster(null);openSchool(s);}}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border group transition text-left ${s.ett_trained?'border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-300':'border-amber-100 dark:border-amber-900/20 hover:border-amber-300'}`}>
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.ett_trained?'bg-emerald-500':'border-2 border-dashed border-amber-500 bg-transparent'}`}/>
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{s.name}</div>
                          <div className="text-[9.5px] text-slate-400">{((s.boys_enrolled||0)+(s.girls_enrolled||0)).toLocaleString()} learners · {s.ett_trained?'ETT trained':'Untrained'}</div>
                        </div>
                      </div>
                      <ChevronRight size={12} className="text-slate-300 group-hover:text-orange-500 transition"/>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {isCartographer&&(
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <Btn size="sm" onClick={()=>{setSelectedCluster(null);setPage('cartographer_home');}}>
                  <Edit2 size={11} className="inline mr-1"/> Edit in Cartographer Console
                </Btn>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* SCHOOL MODAL */}
      {selectedSchool&&(
        <Modal title={loadingSchool?'Loading…':(schoolDetail?.name??selectedSchool.name)} onClose={()=>{setSelectedSchool(null);setSchoolDetail(null);}} width={500}>
          {loadingSchool?(
            <div className="flex items-center justify-center h-28 text-sm text-slate-400 gap-2">
              <RefreshCw size={16} className="animate-spin"/> Fetching school record…
            </div>
          ):((()=>{
            const s=schoolDetail??selectedSchool;
            const total=(s.boys_enrolled||0)+(s.girls_enrolled||0);
            return (
              <div className="space-y-4">
                <div className={`flex items-center gap-3 p-3 rounded-xl border ${s.ett_trained?'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/40':'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/40'}`}>
                  {s.ett_trained?<CheckCircle size={18} className="text-emerald-600 shrink-0"/>:<AlertCircle size={18} className="text-amber-600 shrink-0"/>}
                  <div>
                    <div className={`text-xs font-extrabold ${s.ett_trained?'text-emerald-700 dark:text-emerald-400':'text-amber-700 dark:text-amber-400'}`}>
                      {s.ett_trained?'ETT Trained School':'Not Yet ETT Trained'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {s.ett_trained?'Actively running ETT sessions with trained teachers.':'Yet to receive ETT training from a certified TOT.'}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                  <span className="px-2 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900">📍 {s.district}</span>
                  {s.zone_name&&<span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-400">{s.zone_name}</span>}
                  {s.verified&&<span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-400">✓ GIS Verified</span>}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <CurrPill label="HIM (Boys)"   active={s.him_running}/>
                  <CurrPill label="GESD (Girls)" active={s.gesd_running}/>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <StatTile label="Boys"    value={s.boys_enrolled||0}  sub="enrolled"/>
                  <StatTile label="Girls"   value={s.girls_enrolled||0} sub="enrolled"/>
                  <StatTile label="Total"   value={total}               sub="learners"/>
                  <StatTile label="Trained" value={s.trained_teachers}  sub="teachers"/>
                  <StatTile label="TOTs"    value={s.tots}/>
                  <StatTile label="STOTs"   value={s.stots}/>
                  <StatTile label="Teachbacks"       value={s.teachbacks}/>
                  <StatTile label="Sessions Done"    value={s.sessions_completed}/>
                  <StatTile label="Sessions Planned" value={s.sessions_planned}/>
                </div>
                {s.sessions_planned>0&&(
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                      <span>Session Completion</span>
                      <span className="text-orange-600">{Math.round((s.sessions_completed/s.sessions_planned)*100)}%</span>
                    </div>
                    <MiniBar value={(s.sessions_completed/s.sessions_planned)*100}/>
                  </div>
                )}
                {s.last_session_date&&(
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Clock size={11}/> Last session: <b>{new Date(s.last_session_date).toLocaleDateString()}</b>
                  </div>
                )}
                {s.headteacher&&(
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                    <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">Headteacher</div>
                    <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{s.headteacher}</div>
                    {s.headteacher_phone&&<div className="text-xs text-slate-500 mt-0.5">📞 {s.headteacher_phone}</div>}
                  </div>
                )}
                <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                  <MapPin size={10}/> {Number(s.lat).toFixed(5)}, {Number(s.lng).toFixed(5)}
                </div>
                {schoolDetail?.visit_logs&&schoolDetail.visit_logs.length>0&&(
                  <div>
                    <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Recent Field Visits</div>
                    <div className="space-y-1.5">
                      {schoolDetail.visit_logs.map(v=>(
                        <div key={v.id} className="flex gap-2.5 text-[10.5px] p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                          <CheckCircle size={12} className="text-emerald-500 mt-0.5 shrink-0"/>
                          <div>
                            <div className="font-bold text-slate-700 dark:text-slate-300">{v.visitor_name??'Field Officer'} · <span className="capitalize">{v.purpose}</span></div>
                            <div className="text-slate-400">{new Date(v.visit_date).toLocaleDateString()}</div>
                            {v.findings&&<div className="text-slate-500 mt-0.5 italic">{v.findings}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {s.notes&&<div className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800"><Info size={10} className="inline mr-1"/>{s.notes}</div>}
                {isCartographer&&(
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Btn size="sm" onClick={()=>{setSelectedSchool(null);setSchoolDetail(null);setPage('cartographer_home');}}>
                      <Edit2 size={11} className="inline mr-1"/> Edit in Cartographer Console
                    </Btn>
                  </div>
                )}
              </div>
            );
          })())}
        </Modal>
      )}
    </div>
  );
};