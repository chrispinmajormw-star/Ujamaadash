import React, { useState, useEffect } from 'react';
import {
  FilePlus, MapPin, CheckCircle, Clock, AlertTriangle,
  Upload, Camera, Clipboard, TrendingUp, BookOpen, Users, CheckCircle2, User as UserIcon} from 'lucide-react';
import { Card, Kicker, Btn, ProgBar, Badge, FInput, FSelect, FArea, Modal, StatCard } from './SubComponents';
import { DISTRICTS, CLUSTERS, SESSION_LISTS } from '../data';
import { useCountry } from '../context/CountryContext';
import { districtsApi } from '../api';
import { Report, User } from '../types';

interface Props {
  user: User;
  reports: Report[];
  onSubmit: (r: any) => void;
  showToast: (msg: string) => void;
  setPage: (p: string) => void;
}

export const FieldOfficerPage: React.FC<Props> = ({ user, reports, onSubmit, showToast, setPage }) => {
  const { activeCountry } = useCountry();
  const [view, setView] = useState<'home' | 'submit' | 'history'>('home');
  const [f, setF] = useState({
    school: '', district: user.district || '', zone: '', boys: '', girls: '',
    curriculum: 'HIM', session: '', challenges: '', success: '',
    country: (user as any).country || 'Malawi'
  });
  const [submitted, setSubmitted] = useState(false);
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);

  useEffect(() => {
    if (activeCountry && activeCountry !== 'all') {
      setF(p => ({ ...p, country: activeCountry, district: '' }));
    }
  }, [activeCountry]);

  useEffect(() => {
    if (!f.country) return;
    districtsApi.getAll(f.country).then((data: any) => {
      setDistrictOptions(Array.isArray(data) ? data.map((d: any) => d.name).sort() : []);
    });
  }, [f.country]);
  const s = (k: string) => (e: any) => setF(p => ({ ...p, [k]: e.target.value }));

  const myReports = reports.filter(r =>
    r.district === user.district || r.submitted_by === user.name
  );
  const approved = myReports.filter(r => r.status === 'approved').length;
  const pending = myReports.filter(r => r.status === 'pending').length;
  const districtData = DISTRICTS.find(d => d.name === user.district);
  const districtClusters = CLUSTERS.filter(c => c.district === user.district);

  const handleSubmit = () => {
    if (!f.school || !f.district || !f.zone || !f.session) {
      showToast('️ Please fill all required fields', 'warning'); return;
    }
    onSubmit({
      ...f, boys: parseInt(f.boys) || 0, girls: parseInt(f.girls) || 0,
      status: 'pending', submitted_by: user.name,
      submitted_at: new Date().toISOString().split('T')[0]
    }); // country included via ...f spread
    setSubmitted(true);
    showToast('Field report submitted for review', 'success');
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-4 animate-fade-in-up">
        <div className="text-5xl flex justify-center"><CheckCircle2 size={48} className="text-emerald-500" /></div>
        <h2 className="text-xl font-bold text-black dark:text-white">Report Submitted!</h2>
        <p className="text-sm text-slate-500">Your field report has been sent to the District Coordinator for review.</p>
        <div className="flex gap-2 justify-center">
          <Btn onClick={() => { setF({ school: '', district: user.district || '', zone: '', boys: '', girls: '', curriculum: 'HIM', session: '', challenges: '', success: '', country: (user as any).country || 'Malawi' }); setSubmitted(false); }}>
            New Report
          </Btn>
          <Btn variant="secondary" onClick={() => setView('history')}>View History</Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <Kicker text="Field Operations" />
          <h1 className="text-base font-bold text-black dark:text-white m-0">Field Officer Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1 m-0">
            <MapPin size={11} className="inline mr-1" />
            {user.district || 'All Districts'} — {user.name}
          </p>
        </div>
        <Btn onClick={() => setView('submit')}>
          <FilePlus size={13} className="inline mr-1" /> Submit Report
        </Btn>
      </div>

      {/* Nav tabs */}
      <div className="flex gap-2">
        {[
          { v: 'home', l: 'My Dashboard' },
          { v: 'submit', l: 'Submit Report' },
          { v: 'history', l: 'My Reports' },
        ].map(tab => (
          <button
            key={tab.v}
            onClick={() => setView(tab.v as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              view === tab.v
                ? 'bg-[var(--brand-600)] text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[var(--brand-50)] dark:hover:bg-slate-700'
            }`}
          >
            {tab.l}
          </button>
        ))}
      </div>

      {view === 'home' && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={<CheckCircle size={18} className="text-emerald-500" />} label="Approved" value={approved} color="#059669" />
            <StatCard icon={<Clock size={18} className="text-amber-500" />} label="Pending" value={pending} color="#d97706" />
            <StatCard icon={<Users size={18} className="text-blue-500" />} label="Clusters" value={districtClusters.length} />
            <StatCard icon={<BookOpen size={18} className="text-[var(--brand-500)]" />} label="Total Reports" value={myReports.length} />
          </div>

          {/* District info */}
          {districtData && (
            <Card>
              <h3 className="text-sm font-bold text-black dark:text-white mb-3">
                {user.district} District Overview
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { l: 'TOTs Certified', v: districtData.tots },
                  { l: 'Teachers Trained', v: districtData.teachersTrained },
                  { l: 'Schools', v: districtData.schools },
                  { l: 'Covered', v: districtData.cov },
                ].map(item => (
                  <div key={item.l} className="bg-[var(--brand-50)]/50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
                    <div className="text-xl font-extrabold text-[var(--brand-600)]">{item.v}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.l}</div>
                  </div>
                ))}
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>School coverage</span>
                  <span>{districtData.cov}/{districtData.schools} ({Math.round(districtData.cov / districtData.schools * 100)}%)</span>
                </div>
                <ProgBar pct={Math.round(districtData.cov / districtData.schools * 100)} />
              </div>
            </Card>
          )}

          {/* Clusters */}
          {districtClusters.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-black dark:text-white mb-3">My Clusters</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {districtClusters.map(c => (
                  <Card key={c.id} className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-sm font-bold text-black dark:text-white">{c.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Lead: {c.lead}</div>
                      </div>
                      <Badge text={`${c.progress}%`} color="var(--brand)" bg="#fff4ec" />
                    </div>
                    <div className="text-[11px] text-slate-500 mb-2">
                      {c.schools} schools · {c.students.toLocaleString()} students · {c.trained} trained
                    </div>
                    <ProgBar pct={c.progress} />
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Quick tips */}
          <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30">
            <h3 className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-2">Field Officer Checklist</h3>
            <ul className="space-y-1.5">
              {[
                'Submit session reports within 24 hours of delivery',
                'Record accurate attendance (boys & girls separately)',
                'Note any SGBV disclosures and route via referral pathway',
                'Document challenges for the DC review',
                'Photograph key moments for the impact record',
              ].map(tip => (
                <li key={tip} className="flex items-start gap-2 text-[11px] text-blue-800 dark:text-blue-300">
                  <CheckCircle size={11} className="shrink-0 mt-0.5" />
                  {tip}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {view === 'submit' && (
        <Card>
          <div className="mb-4">
            <h2 className="text-sm font-bold text-black dark:text-white m-0">Submit Field Report</h2>
            <p className="text-xs text-slate-500 mt-1 m-0">Record a completed ETT session from the field.</p>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FInput label="School Name *" placeholder="e.g. Kawale Primary" value={f.school} onChange={s('school')} />
              <FSelect label="Country *" value={f.country} onChange={s('country')}>
                <option value="Malawi">Malawi</option>
                <option value="Kenya">Kenya</option>
                <option value="Somaliland">Somaliland</option>
              </FSelect>
              <FSelect label="District *" value={f.district} onChange={s('district')}>
                <option value="">Select District...</option>
                {districtOptions.map(d => <option key={d}>{d}</option>)}
              </FSelect>
            </div>
            <FInput label="Education Zone *" placeholder="e.g. Kawale Zone" value={f.zone} onChange={s('zone')} />
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Boys Present" type="number" value={f.boys} onChange={s('boys')} />
              <FInput label="Girls Present" type="number" value={f.girls} onChange={s('girls')} />
            </div>
            <FSelect label="Curriculum *" value={f.curriculum} onChange={s('curriculum')}>
              <option value="HIM">HIM — Hero In Me (Boys)</option>
              <option value="GESD">GESD — Girls Empowerment</option>
              <option value="Combined">Combined Session</option>
            </FSelect>
            <FSelect label="Session / Topic *" value={f.session} onChange={s('session')}>
              <option value="">Select session...</option>
              {(SESSION_LISTS[f.curriculum] || []).map(o => <option key={o}>{o}</option>)}
            </FSelect>
            <FArea label="Challenges Encountered" placeholder="Any obstacles or resource gaps?" value={f.challenges} onChange={s('challenges')} />
            <FArea label="Success Highlights" placeholder="Notable participant engagement or outcomes" value={f.success} onChange={s('success')} />
            <div className="flex gap-2 justify-end pt-2">
              <Btn variant="secondary" onClick={() => setView('home')}>Cancel</Btn>
              <Btn onClick={handleSubmit}>Submit Report</Btn>
            </div>
          </div>
        </Card>
      )}

      {view === 'history' && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-black dark:text-white">My Report History ({myReports.length})</h3>
          {myReports.length === 0 ? (
            <Card><p className="text-center text-slate-400 py-8 text-sm">No reports yet. Submit your first field report!</p></Card>
          ) : (
            myReports.map(r => (
              <div key={r.id} className="bg-white dark:bg-[#0f1623] rounded-xl border border-neutral-200 dark:border-slate-800 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-black dark:text-white">{r.school}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {r.district} · {r.zone} · {r.curriculum} · {r.submitted_at}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                      {r.boys} boys · {r.girls} girls · {r.session}
                    </div>
                  </div>
                  <Badge
                    text={r.status.toUpperCase()}
                    color={r.status === 'approved' ? '#059669' : r.status === 'pending' ? '#d97706' : '#dc2626'}
                    bg={r.status === 'approved' ? '#d1fae5' : r.status === 'pending' ? '#fef3c7' : '#fee2e2'}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
