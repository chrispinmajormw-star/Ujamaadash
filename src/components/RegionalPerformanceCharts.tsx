import React, { useState, useEffect, useRef } from 'react';
import { sessionMonitoringApi } from '../api';
import { useCountry } from '../context/CountryContext';
import { Card } from './SubComponents';

export const RegionalPerformanceCharts: React.FC = () => {
  const { activeCountry } = useCountry();
  const [rows, setRows] = useState<any[]>([]);
  const scoreRef = useRef<HTMLCanvasElement>(null);
  const consistencyRef = useRef<HTMLCanvasElement>(null);
  const chartInstances = useRef<any[]>([]);

  useEffect(() => {
    sessionMonitoringApi.getRegionalPerformance(activeCountry).then(setRows).catch(() => {});
  }, [activeCountry]);

  useEffect(() => {
    const Chart = (window as any).Chart;
    if (!Chart || rows.length === 0) return;

    chartInstances.current.forEach(c => c.destroy());
    chartInstances.current = [];

    const brand = getComputedStyle(document.documentElement).getPropertyValue('--brand').trim() || '#e85d04';

    if (scoreRef.current) {
      const chart = new Chart(scoreRef.current, {
        type: 'bar',
        data: {
          labels: rows.map(r => r.region),
          datasets: [{ label: 'Avg Monitoring Score', data: rows.map(r => r.avgScore), backgroundColor: brand, borderRadius: 5 }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, max: 100 } },
        },
      });
      chartInstances.current.push(chart);
    }

    if (consistencyRef.current) {
      const withData = rows.filter(r => r.consistencyPct !== null);
      const chart = new Chart(consistencyRef.current, {
        type: 'bar',
        data: {
          labels: withData.map(r => r.region),
          datasets: [{ label: 'Officers Consistent (%)', data: withData.map(r => r.consistencyPct), backgroundColor: '#22c55e', borderRadius: 5 }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, max: 100 } },
        },
      });
      chartInstances.current.push(chart);
    }

    return () => { chartInstances.current.forEach(c => c.destroy()); chartInstances.current = []; };
  }, [rows]);

  if (rows.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Card className="p-3">
        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Regional Monitoring Score</div>
        <div className="h-52"><canvas ref={scoreRef} /></div>
      </Card>
      <Card className="p-3">
        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Regional Reporting Consistency</div>
        <div className="h-52"><canvas ref={consistencyRef} /></div>
      </Card>
    </div>
  );
};
