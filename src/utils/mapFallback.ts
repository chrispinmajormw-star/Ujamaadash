import { MAP_CLUSTERS, DISTRICTS } from '../data';

/** Normalize API payloads that may be a raw array or wrapped object. */
export function unwrapList<T = unknown>(
  payload: unknown,
  keys: string[] = ['data', 'clusters', 'schools', 'items', 'results', 'rows', 'zones', 'trainings', 'districts', 'reports', 'users', 'activities', 'issues']
): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object') {
    for (const key of keys) {
      const value = (payload as Record<string, unknown>)[key];
      if (Array.isArray(value)) return value as T[];
    }
  }
  return [];
}

const regionForDistrict = (district: string) =>
  DISTRICTS.find(d => d.name === district)?.r ?? 'Central';

/** Offline/demo fallback when the map API is unavailable. */
export function getStaticMapClusters(region?: string) {
  const clusters = MAP_CLUSTERS.map(c => {
    const regionName = regionForDistrict(c.district);
    const schools = c.schools.map((s, i) => ({
      id: c.id * 100 + i,
      cluster_id: c.id,
      name: s.name,
      district: c.district,
      region: regionName,
      lat: s.lat,
      lng: s.lng,
      him_running: true,
      gesd_running: true,
      boys_enrolled: 120,
      girls_enrolled: 130,
      total_learners: 250,
      trained_teachers: 1,
      tots: 1,
      stots: 0,
      teachbacks: 0,
      sessions_completed: 3,
      sessions_planned: 6,
      ett_trained: i < c.trained,
      verified: true,
      status: 'active' as const,
    }));

    return {
      id: c.id,
      name: c.name,
      district: c.district,
      region: regionName,
      lat: c.lat,
      lng: c.lng,
      lead: c.lead,
      lead_phone: c.leadPhone,
      students: c.students,
      boys: Math.round(c.students * 0.48),
      girls: Math.round(c.students * 0.52),
      trained: c.trained,
      tots: 2,
      stots: 1,
      teachbacks: 1,
      progress: c.schools.length > 0 ? Math.min(Math.round((c.trained / c.schools.length) * 100), 100) : 0,
      verified: true,
      school_count: c.schools.length,
      schools,
    };
  });

  if (region && region !== 'All') {
    return clusters.filter(c => c.region === region);
  }
  return clusters;
}
