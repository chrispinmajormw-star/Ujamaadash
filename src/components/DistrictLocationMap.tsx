import React, { useEffect, useRef } from 'react';
import { Card } from './SubComponents';
import { MapPin } from 'lucide-react';

interface DistrictLocationMapProps {
  districts: any[];
  selected: any | null;
}

// Small reference map showing every district's location -- clicking a
// district card elsewhere on the page flies this map to that district and
// highlights its marker, without needing the full Clusters Map page.
export const DistrictLocationMap: React.FC<DistrictLocationMapProps> = ({ districts, selected }) => {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<Record<string, any>>({});

  const withCoords = districts.filter(d => d.lat != null && d.lng != null);

  // Build the map once.
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: true, attributionControl: false }).setView([-13.5, 34.3], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // (Re)draw markers whenever the district list changes.
  useEffect(() => {
    const L = (window as any).L;
    const map = mapRef.current;
    if (!L || !map) return;
    Object.values(markersRef.current).forEach((m: any) => map.removeLayer(m));
    markersRef.current = {};
    withCoords.forEach(d => {
      const isSelected = selected && selected.id === d.id;
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:${isSelected ? 16 : 10}px;height:${isSelected ? 16 : 10}px;border-radius:50%;
          background:${d.is_active ? '#16a34a' : '#94a3b8'};
          border:2px solid ${isSelected ? '#ea580c' : '#fff'};
          box-shadow:0 1px 3px rgba(0,0,0,.4);
        "></div>`,
        iconSize: [isSelected ? 16 : 10, isSelected ? 16 : 10],
        iconAnchor: [isSelected ? 8 : 5, isSelected ? 8 : 5],
      });
      const marker = L.marker([Number(d.lat), Number(d.lng)], { icon }).addTo(map).bindTooltip(d.name);
      markersRef.current[d.id] = marker;
    });
  }, [withCoords.map(d => d.id).join(','), selected?.id]);

  // Fly to the selected district.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selected || selected.lat == null || selected.lng == null) return;
    map.flyTo([Number(selected.lat), Number(selected.lng)], 9, { duration: 0.8 });
  }, [selected?.id]);

  return (
    <Card className="p-0 overflow-hidden h-full flex flex-col">
      <div className="px-4 py-3 border-b border-neutral-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
        <MapPin size={14} className="text-[var(--brand-500)]" />
        <h3 className="text-xs font-bold text-black dark:text-white m-0">
          {selected ? selected.name : 'District Locations'}
        </h3>
      </div>
      <div ref={containerRef} style={{ width: '100%', flex: 1, minHeight: 0 }} />
      {withCoords.length === 0 && (
        <div className="p-4 text-center text-[11px] text-slate-400">No location data available for these districts yet.</div>
      )}
    </Card>
  );
};
