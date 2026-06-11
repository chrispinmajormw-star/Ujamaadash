import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { monitoringApi } from '../api';

interface MonitoringData {
  activities: any[];
  issues: any[];
  loading: boolean;
  refresh: () => Promise<void>;
  addActivity: (activity: any) => void;
  addIssue: (issue: any) => void;
}

const MonitoringContext = createContext<MonitoringData | undefined>(undefined);

export const MonitoringProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [actData, issData] = await Promise.all([
        monitoringApi.getActivities(),
        monitoringApi.getIssues()
      ]);
      if (Array.isArray(actData)) setActivities(actData);
      if (Array.isArray(issData)) setIssues(issData);
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addActivity = (activity: any) => {
    setActivities(prev => [activity, ...prev]);
  };

  const addIssue = (issue: any) => {
    setIssues(prev => [issue, ...prev]);
  };

  return (
    <MonitoringContext.Provider value={{
      activities,
      issues,
      loading,
      refresh: fetchData,
      addActivity,
      addIssue
    }}>
      {children}
    </MonitoringContext.Provider>
  );
};

export const useMonitoring = () => {
  const context = useContext(MonitoringContext);
  if (!context) {
    throw new Error('useMonitoring must be used within a MonitoringProvider');
  }
  return context;
};