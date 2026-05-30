import React, { useState } from 'react';
import { Sparkles, Star, Plus, Check, Heart, HelpCircle, Newspaper } from 'lucide-react';
import { Card, Kicker, Btn, Modal, FInput, FSelect, FArea } from './SubComponents';
import { DISTRICT_LIST, REPORTS_INIT } from '../data';

interface ImpactPageProps {
  reports: any[];
  showToast: (msg: string) => void;
  user: any;
}

export const ImpactPage: React.FC<ImpactPageProps> = ({ reports, showToast, user }) => {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [storyForm, setStoryForm] = useState({ name: "", district: "", role: "", story: "" });
  const [submitted, setSubmitted] = useState(false);

  const STORIES = [
    {
      id: 1,
      emoji: "👧",
      color: "bg-pink-500/5 border-pink-100 dark:border-pink-900/30",
      accent: "text-pink-600 dark:text-pink-400",
      accentBg: "bg-pink-100/60 dark:bg-pink-950/40",
      title: "Breaking the Silence in Mzimba",
      quote: "I learned that my voice is my power.",
      who: "Chifundo, 14 — Student",
      district: "Mzimba District",
      date: "April 2026",
      curriculum: "GESD",
      full: "Chifundo had been silent about abuse for over a year. After completing the GESD program's Session 3 on Awareness and learning to trust her inner voice, she finally reported to a trusted teacher. The school cluster intervened swiftly through the referral pathway, connecting her to VSU support and counselling. She is now back in class, thriving, and has become a peer mentor for younger girls in her cluster."
    },
    {
      id: 2,
      emoji: "👦",
      color: "bg-blue-500/5 border-blue-100 dark:border-blue-900/30",
      accent: "text-blue-600 dark:text-blue-400",
      accentBg: "bg-blue-100/60 dark:bg-blue-950/40",
      title: "A Hero Emerges in Lilongwe",
      quote: "Being a hero means helping someone in need.",
      who: "John, 13 — Student",
      district: "Lilongwe Central Cluster",
      date: "March 2026",
      curriculum: "HIM",
      full: "John witnessed a younger student being harassed on the school grounds. Using the 'Step-Up Strategies' from HIM Topic 4 — the Direct, Distract, Delegate method — he calmly distracted the aggressor and walked the victim safely to a teacher."
    },
    {
      id: 3,
      emoji: "👩‍🏫",
      color: "bg-emerald-505 bg-emerald-500/5 border-emerald-100 dark:border-emerald-900/30",
      accent: "text-emerald-600 dark:text-emerald-400",
      accentBg: "bg-emerald-100/60 dark:bg-emerald-950/40",
      title: "Teacher Training Transforms a School",
      quote: "Our school now has a referral pathway that actually works.",
      who: "Mr. Mkandawire — Head Teacher, Kawale Primary",
      district: "Lilongwe District",
      date: "February 2026",
      curriculum: "ETT",
      full: "After 12 teachers completed the 6-day ETT program, Kawale Primary formed a Child Protection Committee. Within three months, reporting of SGBV incidents increased by 70% — because students and teachers finally trusted the system enough to speak up."
    },
    {
      id: 4,
      emoji: "🌟",
      color: "bg-amber-500/5 border-amber-100 dark:border-amber-900/30",
      accent: "text-amber-600 dark:text-amber-400",
      accentBg: "bg-amber-100/60 dark:bg-amber-955 dark:bg-amber-950/40",
      title: "Girls Lead the Way in Blantyre",
      quote: "We are not victims — we are leaders.",
      who: "Grace, 15 — GESD Graduate & Peer Mentor",
      district: "Blantyre South Cluster",
      date: "January 2026",
      curriculum: "GESD",
      full: "After completing all six GESD sessions, Grace started a weekly girls' safety club at her school. Within two months, 35 girls were meeting regularly. Three girls in the group have since accessed referral support through the school's cluster lead."
    },
    {
      id: 5,
      emoji: "🤝",
      color: "bg-violet-500/5 border-violet-100 dark:border-violet-900/30",
      accent: "text-violet-600 dark:text-violet-400",
      accentBg: "bg-violet-100/60 dark:bg-violet-950/40",
      title: "Boys & Girls Build a Safety Charter Together",
      quote: "We signed it together — it belongs to all of us.",
      who: "Combined Class — Karonga Primary",
      district: "Karonga Lakeshore Cluster",
      date: "March 2026",
      curriculum: "Combined",
      full: "The combined Session 6 brought boys from the HIM program and girls from GESD together for the first time. Students co-wrote a School Safety Charter committing to respect, non-violence, and mutual support. The charter is now displayed at the school entrance."
    },
    {
      id: 6,
      emoji: "📣",
      color: "bg-red-500/5 border-red-100 dark:border-red-900/30",
      accent: "text-red-600 dark:text-red-400",
      accentBg: "bg-red-100/60 dark:bg-red-950/40",
      title: "Community Father Changes His Stance",
      quote: "I used to think this was not men's business. Now I know it is.",
      who: "Samuel Phiri — Community Father & Parent",
      district: "Dedza Highland Cluster",
      date: "February 2026",
      curriculum: "Community",
      full: "When the ETT cluster in Dedza held a community parent session, Samuel attended reluctantly. By the end, he had signed up to be a community champion. He now attends cluster meetings and speaks openly with other fathers about supporting their daughters' education and safety."
    },
  ];

  const MILESTONES = [
    { year: "2023", event: "ETT Country wide ScaleUp introduction" },
    { year: "2024", event: "Scaled Up in 4 more districts" },
    { year: "2025", event: "585,000 Learners trained in 12 districts" },
    { year: "2026", event: "MOU Signed with Ministry of Education" },
  ];

  const PRESS = [
    { outlet: "Nation Online Malawi", headline: "ScaleUp ETT Program recognised as model SGBV intervention", date: "Mar 2026" },
    { outlet: "UNICEF Malawi", headline: "Community-led safety training making strides in schools", date: "Jan 2026" },
    { outlet: "Ministry of Education", headline: "ETT clusters adopted in national school safety framework", date: "Nov 2025" },
  ];

  const submitStory = () => {
    if (!storyForm.name || !storyForm.story) {
      showToast("Please fill in your name and story");
      return;
    }
    setSubmitted(true);
    showToast("✅ Thank you — your story has been received safely.");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="bg-[#0f1623] border border-gray-200 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl p-4">
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-orange-600/10" />
        <div className="relative space-y-4">
          <div>
            <span className="text-xs font-bold bg-orange-600/15 border border-orange-500/20 text-orange-500 rounded-full px-3 py-1 font-semibold spacing-wider uppercase">
              Real Impact · Empowering Lives
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-3">Malawi Field Impact</h1>
            <p className="text-sm text-[#A4A4A9] mt-1 max-w-xl">
              Every data point in our system represents an active young person. Read how communities are resisting GBV and building confidence.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/30 p-3 rounded-2xl border border-white/10 text-center">
            {[
              ["592,200+", "Learners Reached"],
              ["665+", "TOTs Trained"],
              ["396", "Clusters Engaged"],
              ["15", "Active Regions"]
            ].map(([v, l]) => (
              <div key={l} className="space-y-0.5">
                <div className="text-xl sm:text-2xl font-black text-orange-500">{v}</div>
                <div className="text-[9px] text-[#A4A4A9] font-bold uppercase tracking-wide">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mt-8">
        <div>
          <Kicker text="Voices From Active Zones" />
          <h2 className="text-xl font-bold text-gray-900 m-0">Stories of Transformation</h2>
        </div>
        <Btn onClick={() => setShowForm(true)} className="px-5">
          <Heart size={15} /> Link Your Story
        </Btn>
      </div>

      {/* Grid of Stories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {STORIES.map(s => {
          const isExp = expanded === s.id;
          return (
            <div
              key={s.id}
              className={`p-6 rounded-2xl border flex flex-col justify-between ${s.color} transition-all duration-200 hover:shadow-md hover:-translate-y-1`}
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm border border-gray-100">
                    {s.emoji}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${s.accentBg} ${s.accent}`}>
                    {s.curriculum}
                  </span>
                </div>
                
                <h3 className="text-base font-bold text-gray-900 leading-tight mb-2">
                  {s.title}
                </h3>
                
                <div className={`border-l-2 p-3 pl-3.5 mb-4 my-2 italic`} style={{ borderColor: 'currentColor' }}>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                    "{s.quote}"
                  </p>
                </div>

                <div className="text-[11px] text-gray-500 font-bold mb-3">— {s.who}</div>

                {isExp && (
                  <p className="text-xs text-gray-600 leading-relaxed mt-3 pt-3 border-t border-gray-200 mb-3 block">
                    {s.full}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#A4A4A9] mt-4">
                <span>📍 {s.district} · 📅 {s.date}</span>
                <button
                  onClick={() => setExpanded(isExp ? null : s.id)}
                  className={`px-2.5 py-1 rounded bg-white hover:bg-[#F6F6F6] border border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:bg-slate-900 text-xs font-bold cursor-pointer transition-colors ${s.accent}`}
                >
                  {isExp ? "Hide Info ▲" : "Read Full ▼"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Timeline Milestones */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <span className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400">
              <Star size={18} />
            </span>
            <h3 className="text-base font-bold text-gray-900 m-0">ScaleUp Program Milestones</h3>
          </div>

          <div className="relative pl-6 space-y-5">
            <div className="absolute left-1.5 top-0.5 bottom-1.5 w-0.5 bg-orange-100 dark:bg-orange-950/60" />
            {MILESTONES.map((m, i) => {
              const isLast = i === MILESTONES.length - 1;
              return (
                <div key={i} className="relative flex gap-4 items-start text-xs sm:text-sm">
                  <div className={`absolute -left-[23px] top-1 w-3 h-3 rounded-full border-2 border-orange-500 ${isLast ? 'bg-orange-500' : 'bg-white'}`} />
                  <div className={`p-3 rounded-xl border w-full flex items-center justify-between ${isLast ? 'border-orange-200 bg-orange-50' : 'border-gray-100 bg-gray-50/40'}`}>
                    <div className="flex gap-3">
                      <span className="font-extrabold text-orange-600 dark:text-orange-400 text-xs">{m.year}</span>
                      <span className="text-gray-700 text-xs leading-normal">{m.event}</span>
                    </div>
                    {isLast && <span className="bg-orange-600 text-white font-bold text-[9px] uppercase px-1.5 py-0.5 rounded scale-90">Current</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Media references */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <span className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400">
              <Newspaper size={18} />
            </span>
            <h3 className="text-base font-bold text-gray-900 m-0">State Recognition & Press</h3>
          </div>

          <div className="space-y-3.5">
            {PRESS.map((p, i) => (
              <div key={i} className="flex gap-3.5 items-center p-3 rounded-xl border border-gray-100 bg-gray-50/30">
                <div className="w-9 h-9 text-lg rounded-xl bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center shrink-0">
                  📰
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-gray-900 text-xs leading-snug truncate" title={p.headline}>
                    {p.headline}
                  </div>
                  <div className="text-[10px] text-[#A4A4A9] mt-1 font-semibold uppercase">{p.outlet} · {p.date}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {showForm && (
        <Modal title="Submit Your Safe Impact Story" onClose={() => { setShowForm(false); setSubmitted(false); setStoryForm({ name: "", district: "", role: "", story: "" }); }}>
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <span className="text-5xl block">💖</span>
              <h3 className="text-lg font-bold text-gray-900 m-0">We Received Your Voice!</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
                Thank you! Your submission is handled per high confidentiality protocols. We only publish records after explicit district administrator authentication.
              </p>
              <Btn onClick={() => { setShowForm(false); setSubmitted(false); }} className="px-5 mt-4">
                Dismiss Window
              </Btn>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <p className="text-gray-500 m-0 leading-relaxed text-xs">
                Share any milestone or successful intervention. You can choose to be anonymous or select an alternative alias.
              </p>
              <FInput label="First Name (or 'Anonymous') *" placeholder="e.g. Samuel or Anonymous" value={storyForm.name} onChange={e => setStoryForm(p => ({ ...p, name: e.target.value }))} />
              <FSelect label="Your District / Alignment" value={storyForm.district} onChange={e => setStoryForm(p => ({ ...p, district: e.target.value }))}>
                <option value="">Select district (optional)</option>
                {DISTRICT_LIST.map(d => <option key={d}>{d}</option>)}
              </FSelect>
              <FSelect label="I am writing as a *" value={storyForm.role} onChange={e => setStoryForm(p => ({ ...p, role: e.target.value }))}>
                <option value="">Choose role alignment...</option>
                <option>Student / Lead Representative</option>
                <option>Teacher / TOT Champion</option>
                <option>Parent / Guardian Advocate</option>
                <option>District Overseer or Staff</option>
                <option>Interested Stakeholder</option>
              </FSelect>
              <FArea label="Your Field Experience Summary / Story *" placeholder="Write details about the change pattern or class transformation." value={storyForm.story} onChange={e => setStoryForm(p => ({ ...p, story: e.target.value }))} />
              
              <div className="bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 p-3 rounded-xl text-[10.5px] border border-emerald-100 dark:border-emerald-900/30 leading-snug">
                🔒 Data security compliant. Case files containing coordinates of affected pupils are redacted on export.
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <Btn variant="secondary" size="sm" onClick={() => setShowForm(false)}>Cancel</Btn>
                <Btn onClick={submitStory} size="sm">Submit Report</Btn>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
