import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, FSelect, FInput, Btn } from './SubComponents';
import { BarChart3, PieChart, Users, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const STAFF_TYPES = ['TOT', 'PEA', 'Teacher', 'District Coordinator', 'Field Officer'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface Props {
  cases: any[];
}

export const SasaCaseAnalytics: React.FC<Props> = ({ cases }) => {
  const [filterType, setFilterType] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterStaff, setFilterStaff] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const typeChartRef = useRef<HTMLCanvasElement>(null);
  const monthChartRef = useRef<HTMLCanvasElement>(null);
  const staffChartRef = useRef<HTMLCanvasElement>(null);
  const chartInstances = useRef<any[]>([]);

  const isStaffCase = (c: any) => STAFF_TYPES.includes(c.reported_by_type);

  const caseTypes = useMemo(() => Array.from(new Set(cases.map(c => c.gbv_type).filter(Boolean))), [cases]);
  const caseMonths = useMemo(() => {
    const months = cases.map(c => (c.created_at || c.submitted_at || '').slice(0, 7)).filter(Boolean);
    return Array.from(new Set(months)).sort().reverse();
  }, [cases]);

  const filtered = useMemo(() => {
    return cases.filter(c => {
      if (filterType !== 'all' && c.gbv_type !== filterType) return false;
      if (filterMonth !== 'all') {
        const m = (c.created_at || c.submitted_at || '').slice(0, 7);
        if (m !== filterMonth) return false;
      }
      if (filterStaff !== 'all') {
        const staff = isStaffCase(c);
        if (filterStaff === 'staff' && !staff) return false;
        if (filterStaff === 'not_staff' && staff) return false;
      }
      if (filterDateFrom) {
        const d = (c.submitted_at || c.created_at || '').slice(0, 10);
        if (d < filterDateFrom) return false;
      }
      if (filterDateTo) {
        const d = (c.submitted_at || c.created_at || '').slice(0, 10);
        if (d > filterDateTo) return false;
      }
      return true;
    });
  }, [cases, filterType, filterMonth, filterStaff, filterDateFrom, filterDateTo]);

  const staffCount = filtered.filter(isStaffCase).length;
  const notStaffCount = filtered.length - staffCount;

  useEffect(() => {
    const Chart = (window as any).Chart;
    if (!Chart) return;

    chartInstances.current.forEach(c => c.destroy());
    chartInstances.current = [];

    const brand = getComputedStyle(document.documentElement).getPropertyValue('--brand').trim() || '#e85d04';

    // By case type
    if (typeChartRef.current) {
      const byType: Record<string, number> = {};
      filtered.forEach(c => { byType[c.gbv_type] = (byType[c.gbv_type] || 0) + 1; });
      const chart = new Chart(typeChartRef.current, {
        type: 'bar',
        data: {
          labels: Object.keys(byType),
          datasets: [{ label: 'Cases', data: Object.values(byType), backgroundColor: brand, borderRadius: 5 }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
        },
      });
      chartInstances.current.push(chart);
    }

    // By month
    if (monthChartRef.current) {
      const byMonth: Record<string, number> = {};
      filtered.forEach(c => {
        const m = (c.created_at || c.submitted_at || '').slice(0, 7);
        if (m) byMonth[m] = (byMonth[m] || 0) + 1;
      });
      const sortedMonths = Object.keys(byMonth).sort();
      const chart = new Chart(monthChartRef.current, {
        type: 'line',
        data: {
          labels: sortedMonths.map(m => {
            const [y, mo] = m.split('-');
            return `${MONTH_NAMES[parseInt(mo) - 1]?.slice(0, 3)} ${y}`;
          }),
          datasets: [{
            label: 'Cases', data: sortedMonths.map(m => byMonth[m]),
            borderColor: brand, backgroundColor: brand + '33', tension: 0.3, fill: true, pointBackgroundColor: brand,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
        },
      });
      chartInstances.current.push(chart);
    }

    // Staff vs not staff
    if (staffChartRef.current) {
      const chart = new Chart(staffChartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Staff-Reported', 'Not Staff (Survivor/Anonymous)'],
          datasets: [{ data: [staffCount, notStaffCount], backgroundColor: [brand, '#94a3b8'] }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } },
        },
      });
      chartInstances.current.push(chart);
    }

    return () => { chartInstances.current.forEach(c => c.destroy()); chartInstances.current = []; };
  }, [filtered]);

  const downloadPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('SASA Case Analytics Report', 14, 18);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()} — ${filtered.length} case(s)`, 14, 25);

    autoTable(doc, {
      startY: 32,
      head: [['Type', 'Reporter', 'District', 'Safety', 'Age Group', 'Status', 'Submitted']],
      body: filtered.map((c: any) => [
        c.gbv_type || '—',
        c.reported_by_type || '—',
        c.district || '—',
        c.survivor_safe || '—',
        c.survivor_age_group || '—',
        (c.status || '').replace('_', ' '),
        (c.submitted_at || c.created_at || '').slice(0, 10),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [232, 93, 4] },
    });

    doc.save(`SASA_Case_Analytics_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Btn size="sm" variant="secondary" onClick={downloadPdf}>
          <Download size={13} /> Download PDF
        </Btn>
      </div>
      <Card className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <FSelect label="Case Type" value={filterType} onChange={(e: any) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            {caseTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </FSelect>
          <FSelect label="Month Received" value={filterMonth} onChange={(e: any) => setFilterMonth(e.target.value)}>
            <option value="all">All Months</option>
            {caseMonths.map(m => {
              const [y, mo] = m.split('-');
              return <option key={m} value={m}>{MONTH_NAMES[parseInt(mo) - 1]} {y}</option>;
            })}
          </FSelect>
          <FSelect label="Staff / Not Staff" value={filterStaff} onChange={(e: any) => setFilterStaff(e.target.value)}>
            <option value="all">All</option>
            <option value="staff">Staff Case Report</option>
            <option value="not_staff">Not Staff Case</option>
          </FSelect>
          <FInput label="Submitted From" type="date" value={filterDateFrom} onChange={(e: any) => setFilterDateFrom(e.target.value)} />
          <FInput label="Submitted To" type="date" value={filterDateTo} onChange={(e: any) => setFilterDateTo(e.target.value)} />
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-3">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
            <BarChart3 size={12} /> Cases by Type
          </div>
          <div className="h-40"><canvas ref={typeChartRef} /></div>
        </Card>
        <Card className="p-3">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
            <BarChart3 size={12} /> Cases by Month
          </div>
          <div className="h-40"><canvas ref={monthChartRef} /></div>
        </Card>
        <Card className="p-3">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
            <PieChart size={12} /> Staff vs Not Staff
          </div>
          <div className="h-40"><canvas ref={staffChartRef} /></div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-100 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs font-bold text-black dark:text-white">All Case Data ({filtered.length})</div>
        </div>
        <div className="overflow-x-auto max-h-[32rem] overflow-y-auto">
          <table className="w-full text-left text-[11px] whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-900/40 sticky top-0">
              <tr>
                <th className="px-3 py-2 font-bold text-slate-500">Type</th>
                <th className="px-3 py-2 font-bold text-slate-500">Reporter</th>
                <th className="px-3 py-2 font-bold text-slate-500">District</th>
                <th className="px-3 py-2 font-bold text-slate-500">Village</th>
                <th className="px-3 py-2 font-bold text-slate-500">Safety</th>
                <th className="px-3 py-2 font-bold text-slate-500">Age Group</th>
                <th className="px-3 py-2 font-bold text-slate-500">Immediate Needs</th>
                <th className="px-3 py-2 font-bold text-slate-500">Status</th>
                <th className="px-3 py-2 font-bold text-slate-500">Incident Date</th>
                <th className="px-3 py-2 font-bold text-slate-500">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="px-3 py-6 text-center text-slate-400">No cases match the current filters.</td></tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id}>
                    <td className="px-3 py-2 font-bold text-black dark:text-white">{c.gbv_type}</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{c.reported_by_type || '—'}</td>
                    <td className="px-3 py-2 text-slate-500">{c.district || '—'}</td>
                    <td className="px-3 py-2 text-slate-500">{c.village || '—'}</td>
                    <td className="px-3 py-2 text-slate-500">{c.survivor_safe || '—'}</td>
                    <td className="px-3 py-2 text-slate-500">{c.survivor_age_group || '—'}</td>
                    <td className="px-3 py-2 text-slate-500">{c.immediate_needs || '—'}</td>
                    <td className="px-3 py-2 capitalize text-slate-600 dark:text-slate-300">{(c.status || '').replace('_', ' ')}</td>
                    <td className="px-3 py-2 text-slate-400">{c.incident_date ? new Date(c.incident_date).toLocaleDateString() : '—'}</td>
                    <td className="px-3 py-2 text-slate-400">{(c.submitted_at || c.created_at || '').slice(0, 10)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
