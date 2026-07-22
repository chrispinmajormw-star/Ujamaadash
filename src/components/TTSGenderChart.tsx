import React, { useState, useEffect, useRef } from 'react';
import { ttsRecordsApi } from '../api';
import { useCountry } from '../context/CountryContext';

export const TTSGenderChart: React.FC = () => {
  const { activeCountry } = useCountry();
  const [rows, setRows] = useState<any[]>([]);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    ttsRecordsApi.getSummary(activeCountry).then((res: any) => setRows(Array.isArray(res) ? res : [])).catch(() => {});
  }, [activeCountry]);

  useEffect(() => {
    const Chart = (window as any).Chart;
    if (!Chart || !chartRef.current || rows.length === 0) return;
    if (chartInstance.current) chartInstance.current.destroy();
    chartInstance.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: rows.map(r => r.district),
        datasets: [
          { label: 'Girls Trained', data: rows.map(r => Number(r.total_girls) || 0), backgroundColor: '#ec4899', borderRadius: 4 },
          { label: 'Boys Trained', data: rows.map(r => Number(r.total_boys) || 0), backgroundColor: '#3b82f6', borderRadius: 4 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
      },
    });
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [rows]);

  if (rows.length === 0) return null;
  return <canvas ref={chartRef} />;
};
