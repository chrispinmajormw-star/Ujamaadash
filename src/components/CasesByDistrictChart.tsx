import React, { useState, useEffect, useRef } from 'react';
import { gbvCasesApi } from '../api';
import { useCountry } from '../context/CountryContext';
import { Card } from './SubComponents';

export const CasesByDistrictChart: React.FC = () => {
  const { activeCountry } = useCountry();
  const [rows, setRows] = useState<any[]>([]);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    gbvCasesApi.getCasesByDistrict(activeCountry).then(setRows).catch(() => {});
  }, [activeCountry]);

  useEffect(() => {
    const Chart = (window as any).Chart;
    if (!Chart || !chartRef.current) return;

    if (chartInstance.current) chartInstance.current.destroy();

    const brand = getComputedStyle(document.documentElement).getPropertyValue('--brand').trim() || '#e85d04';

    chartInstance.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: rows.map(r => r.district),
        datasets: [{ label: 'Cases Identified', data: rows.map(r => r.count), backgroundColor: brand, borderRadius: 5 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
      },
    });

    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [rows]);

  return (
    <Card className="p-4">
      <h4 className="text-xs font-bold text-black dark:text-white mb-4">Cases Identified by District</h4>
      {rows.length === 0 ? (
        <div className="h-56 flex items-center justify-center text-xs text-slate-400">No case data available yet.</div>
      ) : (
        <div className="h-56"><canvas ref={chartRef} /></div>
      )}
    </Card>
  );
};
