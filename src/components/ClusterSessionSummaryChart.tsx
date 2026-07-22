import React, { useState, useEffect, useRef } from 'react';
import { clusterSchoolSessionsApi } from '../api';
import { useCountry } from '../context/CountryContext';
import { Card, Badge } from './SubComponents';

export const ClusterSessionSummaryChart: React.FC = () => {
  const { activeCountry } = useCountry();
  const [rows, setRows] = useState<any[]>([]);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    clusterSchoolSessionsApi.getConsistency(activeCountry).then((res: any) => setRows(Array.isArray(res) ? res : [])).catch(() => {});
  }, [activeCountry]);

  useEffect(() => {
    const Chart = (window as any).Chart;
    if (!Chart || !chartRef.current || rows.length === 0) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const labels = rows.map(r => `${r.school_name}`);
    const values = rows.map(r => Number(r.weeks_reported) || 0);
    const barColors = values.map(v => v >= 4 ? '#059669' : '#dc2626');

    chartInstance.current = new Chart(chartRef.current, {
      data: {
        labels,
        datasets: [
          {
            type: 'bar',
            label: 'Weeks Reported',
            data: values,
            backgroundColor: barColors,
            borderRadius: 5,
            order: 2,
          },
          {
            type: 'line',
            label: 'Target (4 weeks)',
            data: labels.map(() => 4),
            borderColor: '#0f1623',
            backgroundColor: 'rgba(15, 22, 35, 0.04)',
            borderDash: [5, 4],
            pointRadius: 0,
            fill: false,
            tension: 0,
            order: 1,
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } },
        scales: { y: { beginAtZero: true, max: 4, ticks: { stepSize: 1 } } },
      },
    });
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [rows]);

  if (rows.length === 0) return null;

  const notConsistent = rows.filter(r => Number(r.weeks_reported) < 4);

  return (
    <Card className="p-3">
      <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
        Cluster Anchors — Weekly Reporting Consistency This Month (Target: 4/4 Weeks)
      </div>
      <div className="h-56"><canvas ref={chartRef} /></div>

      {notConsistent.length > 0 && (
        <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-slate-800">
          <div className="text-[10px] font-extrabold text-red-500 uppercase tracking-widest mb-2">
            Not Reporting Consistently ({notConsistent.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {notConsistent.map((r, i) => (
              <Badge key={i} text={`${r.school_name} (${r.weeks_reported}/4)`} color="#991b1b" bg="#fee2e2" />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
