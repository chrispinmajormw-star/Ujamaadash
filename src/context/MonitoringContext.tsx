import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { monitoringApi } from '../api';

// ─── Types ─────────────────────────────────────────────────────────────────
export interface MonitoringActivity {
  id: number;
  district: string;
  month: string;
  teachbacks: number;
  pea_monitoring: number;
  cluster_meetings: number;
  issue_based: number;
  routine: number;
  submitted_by?: string;
  submitted_by_name?: string;
  created_at?: string;
}

export interface PrevailingIssue {
  id: number;
  district: string;
  month: string;
  teacher_transfers: number;
  lack_of_interest: number;
  other_issues: number;
  lack_of_admin_support: number;
  learner_behaviour: number;
  submitted_by?: string;
  submitted_by_name?: string;
  created_at?: string;
}

interface MonitoringContextValue {
  activities: MonitoringActivity[];
  issues: PrevailingIssue[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addActivity: (payload: Omit<MonitoringActivity, 'id' | 'created_at'>) => Promise<MonitoringActivity>;
  addIssue: (payload: Omit<PrevailingIssue, 'id' | 'created_at'>) => Promise<PrevailingIssue>;
  updateActivity: (id: number, payload: Partial<MonitoringActivity>) => Promise<MonitoringActivity>;
  deleteActivity: (id: number) => Promise<void>;
  updateIssue: (id: number, payload: Partial<PrevailingIssue>) => Promise<PrevailingIssue>;
  deleteIssue: (id: number) => Promise<void>;
}

const MonitoringContext = createContext<MonitoringContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────
export const MonitoringProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<MonitoringActivity[]>([]);
  const [issues, setIssues] = useState<PrevailingIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    // Don't hit authenticated endpoints if we have no token yet
    // (e.g. app just loaded and the user hasn't logged in).
    if (!localStorage.getItem('token')) {
      setActivities([]);
      setIssues([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [activitiesData, issuesData] = await Promise.all([
        monitoringApi.getActivities(),
        monitoringApi.getIssues(),
      ]);
      setActivities(activitiesData);
      setIssues(issuesData);
    } catch (err: any) {
      console.error('MonitoringContext: failed to load monitoring data', err);
      setError(err.message || 'Failed to load monitoring data');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Saves to the database FIRST. Only updates local state with what the
  // server actually returns. No optimistic local-only fallback — if the
  // save fails, the caller's try/catch sees the error and the UI does not
  // pretend it was saved.
  const addActivity = useCallback(async (payload: Omit<MonitoringActivity, 'id' | 'created_at'>) => {
    const saved = await monitoringApi.postActivity(payload);
    if (!saved || saved.error) {
      throw new Error(saved?.error || 'Failed to save monitoring activity');
    }
    setActivities(prev => [saved, ...prev]);
    return saved;
  }, []);

  const addIssue = useCallback(async (payload: Omit<PrevailingIssue, 'id' | 'created_at'>) => {
    const saved = await monitoringApi.postIssue(payload);
    if (!saved || saved.error) {
      throw new Error(saved?.error || 'Failed to save prevailing issue');
    }
    setIssues(prev => [saved, ...prev]);
    return saved;
  }, []);

  const updateActivity = useCallback(async (id: number, payload: Partial<MonitoringActivity>) => {
    const saved = await monitoringApi.updateActivity(id, payload);
    if (!saved || saved.error) {
      throw new Error(saved?.error || 'Failed to update monitoring activity');
    }
    setActivities(prev => prev.map(a => (a.id === id ? saved : a)));
    return saved;
  }, []);

  const deleteActivity = useCallback(async (id: number) => {
    const result = await monitoringApi.deleteActivity(id);
    if (result?.error) {
      throw new Error(result.error);
    }
    setActivities(prev => prev.filter(a => a.id !== id));
  }, []);

  const updateIssue = useCallback(async (id: number, payload: Partial<PrevailingIssue>) => {
    const saved = await monitoringApi.updateIssue(id, payload);
    if (!saved || saved.error) {
      throw new Error(saved?.error || 'Failed to update prevailing issue');
    }
    setIssues(prev => prev.map(i => (i.id === id ? saved : i)));
    return saved;
  }, []);

  const deleteIssue = useCallback(async (id: number) => {
    const result = await monitoringApi.deleteIssue(id);
    if (result?.error) {
      throw new Error(result.error);
    }
    setIssues(prev => prev.filter(i => i.id !== id));
  }, []);

  return (
    <MonitoringContext.Provider value={{
      activities, issues, loading, error, refresh,
      addActivity, addIssue, updateActivity, deleteActivity, updateIssue, deleteIssue,
    }}>
      {children}
    </MonitoringContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────
export const useMonitoring = (): MonitoringContextValue => {
  const ctx = useContext(MonitoringContext);
  if (!ctx) {
    throw new Error('useMonitoring must be used within a MonitoringProvider');
  }
  return ctx;
};
