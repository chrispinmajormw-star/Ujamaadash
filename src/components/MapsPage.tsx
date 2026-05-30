import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Navigation, Map as MapIcon, Sliders, Info, HelpCircle } from 'lucide-react';
import { Card, Kicker, Btn, Modal } from './SubComponents';
import { DISTRICTS, DISTRICT_INFO, MAP_CLUSTERS, MapCluster } from '../data';

// Active districts lookup
const ACTIVE_DISTRICTS = new Set([
  "Mzimba", "Mzunzu", "Lilongwe", "Dowa", "Kasungu", "Dedza", "Ntcheu", "Ntchisi", "Nkhotakota", "Salima",
  "Blantyre", "Zomba", "Mangochi", "Machinga", "Balaka"
]);

interface MapsPageProps {
  setPage: (p: string) => void;
  user: any;
  darkMode: boolean;
}

export const MapsPage: React.FC<MapsPageProps> = ({ setPage, user, darkMode }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [activeClusterId, setActiveClusterId] = useState<number | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<MapCluster | null>(null);
  const mapRef = useRef<any>(null);
  const regions = ["All", "Northern", "Central", "Southern"];

  const clustersWithRegion = MAP_CLUSTERS.map(c => {
    const d = DISTRICTS.find(x => x.name === c.district);
    return { ...c, region: d?.r || "Central" };
  });

  const filteredClusters = selectedRegion === "All"
    ? clustersWithRegion
    : clustersWithRegion.filter(c => c.region === selectedRegion);

  const flyToCluster = useCallback((cluster: MapCluster) => {
    const L = (window as any).L;
    if (!mapRef.current || !L) return;
    setActiveClusterId(cluster.id);
    const pts = [[cluster.lat, cluster.lng], ...cluster.schools.map(s => [s.lat, s.lng])];
    mapRef.current.flyToBounds(pts, { padding: [55, 55], maxZoom: 13, duration: 1.2 });
  }, []);

  useEffect(() => {
    const L = (window as any).L;
    if (!L) return;

    const map = L.map("ett-map", { zoomControl: true }).setView([-13.2, 34.0], 7);
    mapRef.current = map;

    // Load CARTO dark tiles in dark mode, light tiles in light mode
    const tileUrl = darkMode
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

    L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 18
    }).addTo(map);

    L.control.scale({ imperial: false }).addTo(map);

    // Render district overlays
    DISTRICTS.forEach(district => {
      const coords = DISTRICT_INFO[district.name];
      if (!coords) return;
      const isActive = ACTIVE_DISTRICTS.has(district.name);
      
      const fillColor = isActive ? "#16a34a" : (darkMode ? "#4b5563" : "#9ca3af");
      const radius = isActive ? 7 : 5;

      L.circleMarker([coords.lat, coords.lng], {
        radius,
        fillColor,
        color: darkMode ? "#111827" : "#fff",
        weight: 1.8,
        fillOpacity: isActive ? 0.85 : 0.5
      }).addTo(map).bindTooltip(district.name, {
        permanent: false,
        direction: "top",
        offset: [0, -6]
      });
    });

    // Render clusters and schools connectives
    filteredClusters.forEach(cluster => {
      // Connect schools with lines to cluster center
      cluster.schools.forEach(school => {
        L.polyline([[cluster.lat, cluster.lng], [school.lat, school.lng]], {
          color: "#e85d04",
          weight: 1.8,
          opacity: 0.65,
          dashArray: "5 5"
        }).addTo(map);
      });

      // Render schools
      cluster.schools.forEach(school => {
        const schoolIcon = L.divIcon({
          className: "custom-leaflet-school-marker",
          html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer">
            <div style="width:10px;height:10px;border-radius:50%;background:#e85d04;border:2px solid ${darkMode ? '#0f1623' : '#fff'};box-shadow:0 1px 4px rgba(0,0,0,.35);flex-shrink:0"></div>
          </div>`,
          iconAnchor: [5, 5]
        });

        L.marker([school.lat, school.lng], { icon: schoolIcon, zIndexOffset: 200 })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:'Plus Jakarta Sans',sans-serif;min-width:180px;padding:2px 0;color:${darkMode ? '#f3f4f6' : '#111827'}">
              <div style="font-weight:800;font-size:12.5px;margin-bottom:3px;color:${darkMode ? '#f8fafc' : '#111827'}">${school.name}</div>
              <div style="font-size:11px;color:${darkMode ? '#94a3b8' : '#6b7280'};margin-bottom:4px">
                <span style="color:#e85d04">●</span> ${cluster.district} · Lead: <b>${cluster.lead}</b>
              </div>
              <span style="display:inline-block;padding:1px 7px;border-radius:20px;font-size:10px;font-weight:700;background:${darkMode ? '#2c1e13' : '#fff1e6'};color:${darkMode ? '#ff9a44' : '#c44d00'} font-sans">✅ ETT Trained</span>
            </div>`
          );
      });

      // Render center
      const centerIcon = L.divIcon({
        className: "custom-leaflet-center-marker",
        html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer">
          <div style="width:14px;height:14px;border-radius:50%;background:${darkMode ? '#1e293b' : '#0f1623'};border:3px solid #e85d04;box-shadow:0 2px 6px rgba(0,0,0,.4);flex-shrink:0"></div>
        </div>`,
        iconAnchor: [7, 7]
      });

      const centerMarker = L.marker([cluster.lat, cluster.lng], { icon: centerIcon, zIndexOffset: 500 }).addTo(map);
      
      const schoolListHTML = cluster.schools.map(s =>
        `<div style="display:flex;align-items:center;gap:6px;padding:3px 0;border-bottom:1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : '#f3f4f6'}">
          <span style="width:6px;height:6px;border-radius:50%;background:#e85d04;flex-shrink:0;display:inline-block"></span>
          <span style="font-size:11px;color:${darkMode ? '#cbd5e1' : '#374151'}">${s.name}</span>
        </div>`
      ).join("");

      centerMarker.bindPopup(
        `<div style="font-family:'Plus Jakarta Sans',sans-serif;min-width:220px;padding:2px 0;color:${darkMode ? '#f8fafc' : '#0f1623'}">
          <div style="font-weight:800;font-size:14px;margin-bottom:4px;color:${darkMode ? '#f8fafc' : '#0f1623'}">${cluster.name}</div>
          <div style="font-size:11px;color:${darkMode ? '#94a3b8' : '#4b5563'};margin-bottom:4px">📍 District: <b>${cluster.district}</b> · Lead: <b>${cluster.lead}</b></div>
          <div style="font-size:11px;color:${darkMode ? '#94a3b8' : '#4b5563'};margin-bottom:8px">👥 Learners: <b>${cluster.students}</b> · Trained: <b>${cluster.trained}/${cluster.schools.length}</b></div>
          <div style="font-size:9.5px;font-weight:700;text-transform:uppercase;color:${darkMode ? '#64748b' : '#9ca3af'};margin-bottom:4px">Schools connected</div>
          ${schoolListHTML}
        </div>`
      );

      centerMarker.on("click", () => {
        setActiveClusterId(cluster.id);
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [selectedRegion, darkMode]);

  return (
    <div className="space-y-4 flex flex-col h-full animate-fade-in-up">
      <div>
        <Kicker text="Malawi Interactive coverage map" />
        <h1 className="text-2xl font-black text-gray-900 leading-tight">
          School Clusters & Hubs
        </h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-t-2xl p-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-600">
        {[
          { color: "bg-emerald-600", label: "Active District" },
          { color: "bg-slate-400 dark:bg-slate-600", label: "Planned Expansion" },
          { color: "bg-orange-500", label: "Trained School" },
          { color: "bg-white dark:bg-slate-700 border-2 border-orange-500", label: "Cluster Centre" }
        ].map(item => (
          <span key={item.label} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${item.color} shadow-sm`} />
            <span>{item.label}</span>
          </span>
        ))}
        <span className="ml-auto text-[11px] text-[#A4A4A9] font-medium">
          Click any centre marker to view active statistics
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 border border-gray-200 rounded-b-2xl overflow-hidden h-[60vh] sm:h-[65vh]">
        {/* Navigation Rail */}
        <div className="bg-white border-r border-gray-200 flex flex-col overflow-hidden max-h-[160px] md:max-h-none md:col-span-1">
          <div className="p-3 border-b border-gray-100 shrink-0">
            <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <Sliders size={12} /> Region scope
            </div>
            <div className="flex flex-wrap gap-1">
              {regions.map(r => (
                <button
                  key={r}
                  onClick={() => setSelectedRegion(r)}
                  className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold cursor-pointer transition-all ${
                    selectedRegion === r
                      ? "bg-white text-white dark:bg-orange-600"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            <div className="text-[9.5px] font-extrabold text-gray-400 uppercase tracking-wider px-2 py-1 select-none">
              Clusters ({filteredClusters.length})
            </div>
            {filteredClusters.map(c => {
              const isActive = activeClusterId === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => { flyToCluster(c); setSelectedCluster(c); }}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                    isActive
                      ? "border-orange-500 bg-orange-50/20 dark:bg-orange-950/15"
                      : "border-gray-100 bg-white hover:border-orange-200"
                  }`}
                >
                  <div className="font-bold text-xs text-gray-900 truncate">{c.name}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    📍 {c.district} · {c.schools.length} schools
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Map Panel */}
        <div className="md:col-span-3 relative h-full w-full">
          <div id="ett-map" className="h-full w-full z-0 font-sans" />
        </div>
      </div>

      {selectedCluster && (
        <Modal title={selectedCluster.name} onClose={() => setSelectedCluster(null)} width={460}>
          <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
            {[
              ["District alignment", selectedCluster.district],
              ["Geographical Region", DISTRICTS.find(d => d.name === selectedCluster.district)?.r || "—"],
              ["Unified Schools count", selectedCluster.schools.length],
              ["Learners Registered", selectedCluster.students.toLocaleString()],
              ["Trained Teachers", selectedCluster.trained],
              ["Cluster Coordinator", selectedCluster.lead],
            ].map(([l, v]) => (
              <div key={l} className="bg-orange-50 p-2.5 rounded-xl border border-orange-100">
                <div className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">{l}</div>
                <div className="font-bold text-gray-800">{v}</div>
              </div>
            ))}
          </div>

          <div>
            <div className="text-[10px] font-extrabold text-[#A4A4A9] uppercase tracking-widest mb-2">
              Affiliated Schools
            </div>
            <div className="space-y-1">
              {selectedCluster.schools.map((s, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5 border-b border-gray-50 text-xs text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  <span>{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
