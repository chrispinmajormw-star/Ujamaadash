import React, { useState, useEffect, useRef } from 'react';
import { planningSchedulesApi } from '../api';
import { useCountry } from '../context/CountryContext';

export const BiweeklyReachChart: React.FC = () => {
  const { activeCountry } = useCountry();
  const [districts, setDistricts] = useState<any[]>([]);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    planningSchedulesApi.getSummary(activeCountry).then((res: any) => setDistricts(Array.isArray(res?.districts) ? res.districts : [])).catch(() => {});
  }, [activeCountry]);

  useEffect(() => {
    const Chart = (window as any).Chart;
    if (!Chart || !chartRef.current || districts.length === 0) return;
    if (chartInstance.current) chartInstance.current.destroy();
    const brand = getComputedStyle(document.documentElement).getPropertyValue('--brand').trim() || '#e85d04';
    chartInstance.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: districts.map(d => d.district),
        datasets: [
          { label: 'Teachers Trained', data: districts.map(d => Number(d.total_teachers_trained) || 0), backgroundColor: brand, borderRadius: 4 },
          { label: 'Students Reached', data: districts.map(d => Number(d.total_students_reached) || 0), backgroundColor: '#94a3b8', borderRadius: 4 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
      },
    });
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [districts]);

  if (districts.length === 0) return null;
  return <canvas ref={chartRef} />;
};
