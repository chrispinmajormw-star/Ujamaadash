import React, { useState, useEffect, useRef } from 'react';
import { planningSchedulesApi, clusterTeachbacksApi, ttsRecordsApi, trocaireRecordsApi } from '../api';
import { useCountry } from '../context/CountryContext';
import { User } from '../types';
import { Card, PageHeader, Btn, Badge } from './SubComponents';
import { Send, ClipboardList, Users, GraduationCap } from 'lucide-react';

interface PlanningOfficerConsoleProps {
  user: User | null;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

const TOP_TABS = [
  { id: 'biweekly', label: 'Biweekly Plans' },
  { id: 'teachbacks', label: 'Cluster Teachbacks' },
  { id: 'tts', label: 'TTS Numbers' },
  { id: 'trocaire', label: 'Trocaire ICSP' },
] as const;

export const PlanningOfficerConsole: React.FC<PlanningOfficerConsoleProps> = ({ user, showToast }) => {
  const { activeCountry } = useCountry();
  const [activeTab, setActiveTab] = useState<typeof TOP_TABS[number]['id']>('biweekly');

  // Biweekly plans (existing)
  const [schedules, setSchedules] = useState<any[]>([]);
  const [summary, setSummary] = useState<{ biweekStart: string; districts: any[] }>({ biweekStart: '', districts: [] });
  const [sending, setSending] = useState(false);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  // Cluster teachbacks
  const [tbSummary, setTbSummary] = useState<any[]>([]);
  const tbChartRef = useRef<HTMLCanvasElement>(null);
  const tbChartInstance = useRef<any>(null);

  // TTS numbers
  const [ttsSummary, setTtsSummary] = useState<any[]>([]);
  const ttsChartRef = useRef<HTMLCanvasElement>(null);
  const ttsChartInstance = useRef<any>(null);

  // Trocaire ICSP
  const [trocaireSummary, setTrocaireSummary] = useState<any[]>([]);
  const trocaireChartRef = useRef<HTMLCanvasElement>(null);
  const trocaireChartInstance = useRef<any>(null);

  const loadBiweekly = () => {
    planningSchedulesApi.getAll(activeCountry).then(setSchedules).catch(() => {});
    planningSchedulesApi.getSummary(activeCountry).then(setSummary).catch(() => {});
  };
  const loadTeachbacks = () => clusterTeachbacksApi.getSummary(activeCountry).then(setTbSummary).catch(() => {});
  const loadTts = () => ttsRecordsApi.getSummary(activeCountry).then(setTtsSummary).catch(() => {});
  const loadTrocaire = () => trocaireRecordsApi.getSummary(activeCountry).then(setTrocaireSummary).catch(() => {});

  useEffect(() => {
    if (activeTab === 'biweekly') loadBiweekly();
    if (activeTab === 'teachbacks') loadTeachbacks();
    if (activeTab === 'tts') loadTts();
    if (activeTab === 'trocaire') loadTrocaire();
  }, [activeTab, activeCountry]);

  useEffect(() => {
    const Chart = (window as any).Chart;
    if (!Chart || !chartRef.current || summary.districts.length === 0) return;
    if (chartInstance.current) chartInstance.current.destroy();
    const brand = getComputedStyle(document.documentElement).getPropertyValue('--brand').trim() || '#e85d04';
    chartInstance.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: summary.districts.map(d => d.district),
        datasets: [
          { label: 'Teachers Trained', data: summary.districts.map(d => Number(d.total_teachers_trained) || 0), backgroundColor: brand },
          { label: 'Students Reached', data: summary.districts.map(d => Number(d.total_students_reached) || 0), backgroundColor: '#94a3b8' },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } }, scales: { y: { beginAtZero: true } } },
    });
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [summary]);

  useEffect(() => {
    const Chart = (window as any).Chart;
    if (!Chart || !tbChartRef.current || tbSummary.length === 0) return;
    if (tbChartInstance.current) tbChartInstance.current.destroy();
    const brand = getComputedStyle(document.documentElement).getPropertyValue('--brand').trim() || '#e85d04';
    tbChartInstance.current = new Chart(tbChartRef.current, {
      type: 'bar',
      data: {
        labels: tbSummary.map(d => d.district),
        datasets: [
          { label: 'Clusters Tracked', data: tbSummary.map(d => Number(d.clusters_tracked) || 0), backgroundColor: brand },
          { label: 'Total TOTs', data: tbSummary.map(d => Number(d.total_tots) || 0), backgroundColor: '#94a3b8' },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } }, scales: { y: { beginAtZero: true } } },
    });
    return () => { if (tbChartInstance.current) tbChartInstance.current.destroy(); };
  }, [tbSummary]);

  useEffect(() => {
    const Chart = (window as any).Chart;
    if (!Chart || !ttsChartRef.current || ttsSummary.length === 0) return;
    if (ttsChartInstance.current) ttsChartInstance.current.destroy();
    ttsChartInstance.current = new Chart(ttsChartRef.current, {
      type: 'bar',
      data: {
        labels: ttsSummary.map(d => d.district),
        datasets: [
          { label: 'Girls Trained', data: ttsSummary.map(d => Number(d.total_girls) || 0), backgroundColor: '#ec4899' },
          { label: 'Boys Trained', data: ttsSummary.map(d => Number(d.total_boys) || 0), backgroundColor: '#3b82f6' },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } }, scales: { y: { beginAtZero: true } } },
    });
    return () => { if (ttsChartInstance.current) ttsChartInstance.current.destroy(); };
  }, [ttsSummary]);

  useEffect(() => {
    const Chart = (window as any).Chart;
    if (!Chart || !trocaireChartRef.current || trocaireSummary.length === 0) return;
    if (trocaireChartInstance.current) trocaireChartInstance.current.destroy();
    trocaireChartInstance.current = new Chart(trocaireChartRef.current, {
      type: 'bar',
      data: {
        labels: trocaireSummary.map(d => d.district),
        datasets: [
          { label: 'SGBV Cases', data: trocaireSummary.map(d => Number(d.total_sgbv_cases) || 0), backgroundColor: '#dc2626' },
          { label: 'Other GBV Cases', data: trocaireSummary.map(d => Number(d.total_other_gbv_cases) || 0), backgroundColor: '#f59e0b' },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } }, scales: { y: { beginAtZero: true } } },
    });
    return () => { if (trocaireChartInstance.current) trocaireChartInstance.current.destroy(); };
  }, [trocaireSummary]);

  const sendReport = async () => {
    setSending(true);
    try {
      const data = await planningSchedulesApi.sendReport();
      if (data.error) { showToast(data.error, 'error'); return; }
      showToast(data.message || 'Brief sent to Admin', 'success');
    } catch { showToast('Failed to send report', 'error'); }
    finally { setSending(false); }
  };

  const totalTeachers = summary.districts.reduce((acc, d) => acc + (Number(d.total_teachers_trained) || 0), 0);
  const totalStudents = summary.districts.reduce((acc, d) => acc + (Number(d.total_students_reached) || 0), 0);

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-base font-bold text-black dark:text-white m-0 mb-3">Planning & Scheduling Console</h1>
        <div className="flex gap-1 border-b border-neutral-200 dark:border-slate-800 pb-0 overflow-x-auto">
          {TOP_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-lg border-b-2 transition-all -mb-px shrink-0 ${
                activeTab === t.id
                  ? 'border-[var(--brand-500)] text-[var(--brand-600)] dark:text-[var(--brand-400)] bg-[var(--brand-50)] dark:bg-[var(--brand-950)]/20'
                  : 'border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'biweekly' && (
        <div>
          <PageHeader
            title="Biweekly Plans"
            subtitle={`Biweek starting ${summary.biweekStart ? new Date(summary.biweekStart).toLocaleDateString() : '—'}`}
            actions={<Btn size="sm" onClick={sendReport} disabled={sending}><Send size={14} /> {sending ? 'Sending...' : 'Send Biweekly Report to Admin'}</Btn>}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            <div className="p-3 rounded-lg" style={{ background: 'linear-gradient(135deg,var(--brand),#c44d00)' }}>
              <div className="flex items-center gap-1.5 mb-1 text-white/80 text-[10px] font-semibold uppercase tracking-wide"><ClipboardList size={14} /> Districts Reporting</div>
              <div className="text-xl font-black text-white">{summary.districts.length}</div>
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'linear-gradient(135deg,var(--brand),#c44d00)' }}>
              <div className="flex items-center gap-1.5 mb-1 text-white/80 text-[10px] font-semibold uppercase tracking-wide"><GraduationCap size={14} /> Teachers Trained</div>
              <div className="text-xl font-black text-white">{totalTeachers}</div>
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'linear-gradient(135deg,var(--brand),#c44d00)' }}>
              <div className="flex items-center gap-1.5 mb-1 text-white/80 text-[10px] font-semibold uppercase tracking-wide"><Users size={14} /> Students Reached</div>
              <div className="text-xl font-black text-white">{totalStudents}</div>
            </div>
          </div>
          <Card className="p-3 mb-5">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Teachers Trained vs Students Reached, by District</div>
            <div className="h-56"><canvas ref={chartRef} /></div>
          </Card>
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/40">
                  <tr>
                    <th className="px-3 py-2 font-bold text-slate-500">District</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Submitted By</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Activities Planned</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Teachers</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Students</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-slate-800">
                  {schedules.length === 0 ? (
                    <tr><td colSpan={6} className="px-3 py-6 text-center text-slate-400">No plans submitted yet.</td></tr>
                  ) : (
                    schedules.map((s: any) => (
                      <tr key={s.id}>
                        <td className="px-3 py-2 font-bold text-black dark:text-white">{s.district}</td>
                        <td className="px-3 py-2">{s.submitted_by_name}</td>
                        <td className="px-3 py-2 max-w-xs truncate">{s.activities_planned}</td>
                        <td className="px-3 py-2">{s.teachers_trained}</td>
                        <td className="px-3 py-2">{s.students_reached}</td>
                        <td className="px-3 py-2">
                          {s.activities_achieved
                            ? <Badge text="Achieved" color="#065f46" bg="#dcfce7" />
                            : <Badge text="Not Achieved" color="#991b1b" bg="#fee2e2" />}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'teachbacks' && (
        <div>
          <PageHeader title="Cluster Teachbacks" subtitle="TOT counts and teachback meeting completion, by district" />
          <Card className="p-3 mb-5">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Clusters Tracked & Total TOTs, by District</div>
            <div className="h-56"><canvas ref={tbChartRef} /></div>
          </Card>
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/40">
                  <tr>
                    <th className="px-3 py-2 font-bold text-slate-500">District</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Clusters Tracked</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Total TOTs</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Teacher Attendance</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Meeting 1</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Meeting 2</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Meeting 3</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-slate-800">
                  {tbSummary.length === 0 ? (
                    <tr><td colSpan={7} className="px-3 py-6 text-center text-slate-400">No data yet.</td></tr>
                  ) : (
                    tbSummary.map((d: any, i: number) => (
                      <tr key={i}>
                        <td className="px-3 py-2 font-bold text-black dark:text-white">{d.district}</td>
                        <td className="px-3 py-2">{d.clusters_tracked}</td>
                        <td className="px-3 py-2">{d.total_tots}</td>
                        <td className="px-3 py-2">{d.total_teacher_attendance}</td>
                        <td className="px-3 py-2">{d.meeting1_held}</td>
                        <td className="px-3 py-2">{d.meeting2_held}</td>
                        <td className="px-3 py-2">{d.meeting3_held}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'tts' && (
        <div>
          <PageHeader title="TTS Numbers" subtitle="Teacher training sessions and students reached, by district" />
          <Card className="p-3 mb-5">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Girls vs Boys Trained, by District</div>
            <div className="h-56"><canvas ref={ttsChartRef} /></div>
          </Card>
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/40">
                  <tr>
                    <th className="px-3 py-2 font-bold text-slate-500">District</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Sessions</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Total Teachers</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Girls Trained</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Boys Trained</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-slate-800">
                  {ttsSummary.length === 0 ? (
                    <tr><td colSpan={5} className="px-3 py-6 text-center text-slate-400">No data yet.</td></tr>
                  ) : (
                    ttsSummary.map((d: any, i: number) => (
                      <tr key={i}>
                        <td className="px-3 py-2 font-bold text-black dark:text-white">{d.district}</td>
                        <td className="px-3 py-2">{d.sessions}</td>
                        <td className="px-3 py-2">{d.total_teachers}</td>
                        <td className="px-3 py-2">{d.total_girls}</td>
                        <td className="px-3 py-2">{d.total_boys}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
      {activeTab === 'trocaire' && (
        <div>
          <PageHeader title="Trocaire ICSP" subtitle="Students trained and safeguarding cases, by district" />
          <Card className="p-3 mb-5">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">SGBV & Other GBV Cases, by District</div>
            <div className="h-56"><canvas ref={trocaireChartRef} /></div>
          </Card>
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/40">
                  <tr>
                    <th className="px-3 py-2 font-bold text-slate-500">District</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Sessions</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Girls Trained</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Boys Trained</th>
                    <th className="px-3 py-2 font-bold text-slate-500">SGBV Cases</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Other GBV Cases</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-slate-800">
                  {trocaireSummary.length === 0 ? (
                    <tr><td colSpan={6} className="px-3 py-6 text-center text-slate-400">No data yet.</td></tr>
                  ) : (
                    trocaireSummary.map((d: any, i: number) => (
                      <tr key={i}>
                        <td className="px-3 py-2 font-bold text-black dark:text-white">{d.district}</td>
                        <td className="px-3 py-2">{d.sessions}</td>
                        <td className="px-3 py-2">{d.total_girls}</td>
                        <td className="px-3 py-2">{d.total_boys}</td>
                        <td className="px-3 py-2">{d.total_sgbv_cases}</td>
                        <td className="px-3 py-2">{d.total_other_gbv_cases}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
