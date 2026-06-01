import React, { useState } from 'react';
import { Star, Plus, Heart, Newspaper, ChevronDown, ChevronUp, MapPin, Calendar } from 'lucide-react';
import { Card, Kicker, Btn, Modal, FInput, FSelect, FArea } from './SubComponents';
import { DISTRICT_LIST } from '../data';

interface ImpactPageProps {
  reports: any[];
  showToast: (msg: string) => void;
  user: any;
}

const STORIES = [
  {
    id: 1,
    emoji: '👧',
    title: 'Breaking the Silence in Mzimba',
    quote: 'I learned that my voice is my power.',
    role: 'Student, GESD Graduate',
    district: 'Mzimba District',
    date: 'April 2026',
    curriculum: 'GESD',
    color: '#a82563',
    pale: '#fce7f3',
    full: 'A learner who had been silent about abuse for over a year completed the GESD program\'s Session 3 on Awareness. After learning to trust her inner voice, she reported to a trusted teacher. The school cluster intervened swiftly through the referral pathway, connecting her to VSU support and counselling. She is now back in class, thriving, and has become a peer mentor for younger girls in her cluster.'
  },
  {
    id: 2,
    emoji: '👦',
    title: 'A Hero Emerges in Lilongwe',
    quote: 'Being a hero means helping someone in need.',
    role: 'Student, HIM Graduate',
    district: 'Lilongwe Central Cluster',
    date: 'March 2026',
    curriculum: 'HIM',
    color: '#185fa5',
    pale: '#dbeafe',
    full: 'A learner witnessed a younger student being harassed on the school grounds. Using the Step-Up Strategies from HIM Topic 4 — the Direct, Distract, Delegate method — they calmly distracted the aggressor and walked the victim safely to a teacher.'
  },
  {
    id: 3,
    emoji: '👩‍🏫',
    title: 'Teacher Training Transforms a School',
    quote: 'Our school now has a referral pathway that actually works.',
    role: 'Head Teacher, Kawale Primary',
    district: 'Lilongwe District',
    date: 'February 2026',
    curriculum: 'ETT',
    color: '#059669',
    pale: '#d1fae5',
    full: 'After 12 teachers completed the 6-day ETT program, Kawale Primary formed a Child Protection Committee. Within three months, reporting of SGBV incidents increased by 70% — because students and teachers finally trusted the system enough to speak up.'
  },
  {
    id: 4,
    emoji: '🌟',
    title: 'Girls Lead the Way in Blantyre',
    quote: 'We are not victims — we are leaders.',
    role: 'GESD Graduate & Peer Mentor',
    district: 'Blantyre South Cluster',
    date: 'January 2026',
    curriculum: 'GESD',
    color: '#d97706',
    pale: '#fef3c7',
    full: 'After completing all six GESD sessions, a learner started a weekly girls\' safety club at her school. Within two months, 35 girls were meeting regularly. Three girls in the group have since accessed referral support through the school\'s cluster lead.'
  },
  {
    id: 5,
    emoji: '🤝',
    title: 'Boys & Girls Build a Safety Charter Together',
    quote: 'We signed it together — it belongs to all of us.',
    role: 'Combined Class, Karonga Primary',
    district: 'Karonga Lakeshore Cluster',
    date: 'March 2026',
    curriculum: 'Combined',
    color: '#7c3aed',
    pale: '#ede9fe',
    full: 'The combined Session 6 brought boys from the HIM program and girls from GESD together for the first time. Students co-wrote a School Safety Charter committing to respect, non-violence, and mutual support. The charter is now displayed at the school entrance.'
  },
  {
    id: 6,
    emoji: '📣',
    title: 'Community Father Changes His Stance',
    quote: 'I used to think this was not men\'s business. Now I know it is.',
    role: 'Community Father & Parent',
    district: 'Dedza Highland Cluster',
    date: 'February 2026',
    curriculum: 'Community',
    color: '#e85d04',
    pale: '#fff1e6',
    full: 'When the ETT cluster in Dedza held a community parent session, a community member attended reluctantly. By the end, he had signed up to be a community champion. He now attends cluster meetings and speaks openly with other fathers about supporting their daughters\' education and safety.'
  },
];

const MILESTONES = [
  { year: '2023', event: 'ETT Country wide ScaleUp introduction' },
  { year: '2024', event: 'Scaled Up in 4 more districts' },
  { year: '2025', event: '585,000 Learners trained in 12 districts' },
  { year: '2026', event: 'MOU Signed with Ministry of Education' },
];

const PRESS = [
  { outlet: 'Nation Online Malawi', headline: 'ScaleUp ETT Program recognised as model SGBV intervention', date: 'Mar 2026' },
  { outlet: 'UNICEF Malawi', headline: 'Community-led safety training making strides in schools', date: 'Jan 2026' },
  { outlet: 'Ministry of Education', headline: 'ETT clusters adopted in national school safety framework', date: 'Nov 2025' },
];

export const ImpactPage: React.FC<ImpactPageProps> = ({ reports, showToast, user }) => {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [storyForm, setStoryForm] = useState({ name: '', district: '', role: '', story: '' });
  const [submitted, setSubmitted] = useState(false);
  const [filterCurr, setFilterCurr] = useState('all');

  const submitStory = () => {
    if (!storyForm.name || !storyForm.story) { showToast('Please fill in your name and story'); return; }
    setSubmitted(true);
    showToast('✅ Thank you — your story has been received safely.');
  };

  const visible = filterCurr === 'all' ? STORIES : STORIES.filter(s => s.curriculum === filterCurr);

  return (
    <div className="space-y-5 max-w-5xl mx-auto animate-fade-in-up">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <Kicker text="Field Outcomes" />
          <h1 className="text-base font-bold text-black dark:text-white m-0">Impact Stories</h1>
          <p className="text-xs text-black dark:text-white opacity-60 mt-1 m-0">
            Real outcomes from active districts and clusters across Malawi.
          </p>
        </div>
        <Btn size="sm" onClick={() => setShowForm(true)}>
          <Plus size={13} /> Submit Story
        </Btn>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ['592,200+', 'Learners Reached'],
          ['1,134', 'TOTs Certified'],
          ['127', 'School Clusters'],
          ['22', 'Active Districts'],
        ].map(([v, l]) => (
          <Card key={l} className="p-3 text-center">
            <div className="text-base font-bold text-[#e85d04]">{v}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">{l}</div>
          </Card>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg w-fit border border-neutral-200 dark:border-slate-800 flex-wrap">
        {['all', 'GESD', 'HIM', 'Combined', 'ETT', 'Community'].map(c => (
          <button
            key={c}
            onClick={() => setFilterCurr(c)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              filterCurr === c
                ? 'bg-white dark:bg-[#0f1623] text-black dark:text-white shadow-sm border border-neutral-200 dark:border-slate-700'
                : 'text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white'
            }`}
          >
            {c === 'all' ? 'All Stories' : c}
          </button>
        ))}
      </div>

      {/* Stories grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map(s => {
          const isExp = expanded === s.id;
          return (
            <div
              key={s.id}
              className="bg-white dark:bg-[#0f1623] border border-neutral-200 dark:border-slate-800 rounded-lg flex flex-col overflow-hidden hover:border-[#e85d04] dark:hover:border-[#e85d04] transition-all"
            >
              {/* Colour top stripe */}
              <div className="h-1 shrink-0" style={{ backgroundColor: s.color }} />

              <div className="p-4 flex-1 flex flex-col">
                {/* Top row */}
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: s.pale }}
                  >
                    {s.emoji}
                  </div>
                  <span
                    className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ color: s.color, backgroundColor: s.pale }}
                  >
                    {s.curriculum}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xs font-bold text-black dark:text-white leading-snug mb-2">
                  {s.title}
                </h3>

                {/* Quote */}
                <div
                  className="border-l-2 pl-3 py-1 mb-3"
                  style={{ borderColor: s.color }}
                >
                  <p className="text-xs italic text-black dark:text-white opacity-80 leading-relaxed m-0">
                    "{s.quote}"
                  </p>
                </div>

                {/* Role — no name */}
                <div
                  className="text-[10px] font-semibold mb-3"
                  style={{ color: s.color }}
                >
                  — {s.role}
                </div>

                {/* Expanded content */}
                {isExp && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3 border-t border-neutral-100 dark:border-slate-800 pt-3">
                    {s.full}
                  </p>
                )}

                {/* Footer */}
                <div className="mt-auto pt-3 border-t border-neutral-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <MapPin size={10} />
                    <span className="truncate max-w-[110px]">{s.district}</span>
                    <Calendar size={10} className="ml-1" />
                    <span>{s.date}</span>
                  </div>
                  <button
                    onClick={() => setExpanded(isExp ? null : s.id)}
                    className="flex items-center gap-1 text-[10px] font-bold transition"
                    style={{ color: s.color }}
                  >
                    {isExp ? <><ChevronUp size={12} /> Less</> : <><ChevronDown size={12} /> Read more</>}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Milestones + Press */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Milestones */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center">
              <Star size={14} className="text-[#e85d04]" />
            </div>
            <h3 className="text-xs font-bold text-black dark:text-white m-0">ScaleUp Program Milestones</h3>
          </div>
          <div className="relative pl-5 space-y-4">
            <div className="absolute left-1.5 top-1 bottom-1 w-0.5 bg-orange-100 dark:bg-orange-950/40" />
            {MILESTONES.map((m, i) => {
              const isLast = i === MILESTONES.length - 1;
              return (
                <div key={i} className="relative flex items-start gap-3">
                  <div className={`absolute -left-[19px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-[#e85d04] ${isLast ? 'bg-[#e85d04]' : 'bg-white dark:bg-[#0f1623]'}`} />
                  <div className={`flex-1 p-2.5 rounded-lg border text-xs ${isLast ? 'border-orange-200 dark:border-orange-900/40 bg-orange-50/50 dark:bg-orange-950/10' : 'border-neutral-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-[#e85d04] text-[10px]">{m.year}</span>
                      <span className="text-black dark:text-white opacity-70 flex-1">{m.event}</span>
                      {isLast && <span className="text-[8px] font-bold uppercase bg-[#e85d04] text-white px-1.5 py-0.5 rounded shrink-0">Now</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Press */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center">
              <Newspaper size={14} className="text-[#e85d04]" />
            </div>
            <h3 className="text-xs font-bold text-black dark:text-white m-0">Recognition & Press</h3>
          </div>
          <div className="space-y-2.5">
            {PRESS.map((p, i) => (
              <div key={i} className="flex gap-3 items-center p-3 rounded-lg border border-neutral-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20">
                <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center shrink-0 text-base">
                  📰
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-black dark:text-white leading-snug truncate">{p.headline}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-medium">{p.outlet} · {p.date}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Submit story modal */}
      {showForm && (
        <Modal title="Submit Your Safe Impact Story" onClose={() => { setShowForm(false); setSubmitted(false); setStoryForm({ name: '', district: '', role: '', story: '' }); }}>
          {submitted ? (
            <div className="text-center py-6 space-y-3">
              <span className="text-4xl block">💖</span>
              <h3 className="text-sm font-bold text-black dark:text-white m-0">We Received Your Voice!</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                Your submission is handled with full confidentiality. Records are only published after district administrator authentication.
              </p>
              <Btn onClick={() => { setShowForm(false); setSubmitted(false); }} size="sm">Dismiss</Btn>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <p className="text-slate-400 m-0 leading-relaxed">
                Share any milestone or successful intervention. You may use an alias or remain anonymous.
              </p>
              <FInput label="First Name (or 'Anonymous') *" placeholder="e.g. Anonymous" value={storyForm.name} onChange={e => setStoryForm(p => ({ ...p, name: e.target.value }))} />
              <FSelect label="Your District" value={storyForm.district} onChange={e => setStoryForm(p => ({ ...p, district: e.target.value }))}>
                <option value="">Select district (optional)</option>
                {DISTRICT_LIST.map(d => <option key={d}>{d}</option>)}
              </FSelect>
              <FSelect label="I am writing as a *" value={storyForm.role} onChange={e => setStoryForm(p => ({ ...p, role: e.target.value }))}>
                <option value="">Choose role...</option>
                <option>Student / Lead Representative</option>
                <option>Teacher / TOT Champion</option>
                <option>Parent / Guardian Advocate</option>
                <option>District Overseer or Staff</option>
                <option>Interested Stakeholder</option>
              </FSelect>
              <FArea label="Your Story *" placeholder="Describe the change or transformation you witnessed." value={storyForm.story} onChange={e => setStoryForm(p => ({ ...p, story: e.target.value }))} />
              <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 p-2.5 rounded-lg text-[10px] border border-emerald-100 dark:border-emerald-900/30">
                🔒 Data security compliant. Learner names and identifiable details are redacted on export.
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Btn variant="secondary" size="sm" onClick={() => setShowForm(false)}>Cancel</Btn>
                <Btn size="sm" onClick={submitStory}>Submit Story</Btn>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
