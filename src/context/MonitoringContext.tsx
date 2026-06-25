import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { monitoringApi } from '../api';

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
}

const MonitoringContext = createContext<MonitoringContextValue | undefined>(undefined);

export const MonitoringProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<MonitoringActivity[]>([]);
  const [issues, setIssues] = useState<PrevailingIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    // Don't fetch if not logged in — monitoring routes require auth
    const token = localStorage.getItem('token');
    if (!token) {
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
      setActivities(Array.isArray(activitiesData) ? activitiesData : []);
      setIssues(Array.isArray(issuesData) ? issuesData : []);
    } catch (err: any) {
      console.error('MonitoringContext: failed to load monitoring data', err);
      setError(err.message || 'Failed to load monitoring data');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

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

  return (
    <MonitoringContext.Provider value={{ activities, issues, loading, error, refresh, addActivity, addIssue }}>
      {children}
    </MonitoringContext.Provider>
  );
};

export const useMonitoring = (): MonitoringContextValue => {
  const ctx = useContext(MonitoringContext);
  if (!ctx) {
    throw new Error('useMonitoring must be used within a MonitoringProvider');
  }
  return ctx;
};
