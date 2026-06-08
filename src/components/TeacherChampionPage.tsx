import React, { useState } from 'react';
import {
  Shield, Users, BookOpen, Heart, AlertTriangle, CheckCircle,
  ChevronDown, ChevronUp, ExternalLink, Phone, FileText
} from 'lucide-react';
import { Card, Kicker, PageHeader } from './SubComponents';

type TabId = 'role' | 'safe_space' | 'discipline' | 'mentorship' | 'guidance' | 'safeguarding' | 'assessment';

export const TeacherChampionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('role');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'role',         label: "Champion's Role",    icon: <Users size={13} />       },
    { id: 'safe_space',   label: 'Safe Space',         icon: <Heart size={13} />       },
    { id: 'discipline',   label: 'Positive Discipline',icon: <Shield size={13} />      },
    { id: 'mentorship',   label: 'Mentorship',         icon: <BookOpen size={13} />    },
    { id: 'guidance',     label: 'Guidance vs Counselling', icon: <CheckCircle size={13} /> },
    { id: 'safeguarding', label: 'Safeguarding',       icon: <AlertTriangle size={13} />},
    { id: 'assessment',   label: 'Assessment',         icon: <FileText size={13} />    },
  ];

  const toggle = (key: string) => setExpandedItem(p => p === key ? null : key);

  return (
    <div className="space-y-5 animate-fade-in-up max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Teacher Champion Resources"
        subtitle="Facilitation guidance, safe space protocols, positive discipline, mentorship, and safeguarding for ETT Teacher Champions"
      />

      {/* Safeguarding statement banner */}
      <div className="rounded-xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/20 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-1">Safeguarding Commitment</div>
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed italic">
              "Ujamaa Pamodzi Africa is committed to promoting the welfare and protection of children, adults and vulnerable groups in all our activities. We adhere to statutory responsibilities, Malawi government guidance, and international best practices to ensure the highest standards of safeguarding are maintained. Our staff and volunteers are trained in safeguarding and understand their responsibility to report any concerns or incidents of abuse or harm to our designated safeguarding officer, as we have zero tolerance for any form of abuse, neglect, exploitation, or harm."
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-neutral-100 dark:bg-slate-800/50 p-1 rounded-xl">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === t.id
                ? 'bg-white dark:bg-[#0f1623] text-orange-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ── CHAMPION'S ROLE ──────────────────────────────────────────────── */}
      {activeTab === 'role' && (
        <div className="space-y-4">
          <Card>
            <Kicker text="Community Mapping" />
            <h2 className="font-bold text-sm text-black dark:text-white mb-3">Map Available Referral Services</h2>
            <div className="space-y-2">
              {[
                ["Map all available referral services in the community", "Identify police, health centres, VSUs, NGOs, and child protection offices near your school."],
                ["Establish relationships with local service providers", "Visit key referral partners before an incident occurs so you have a working relationship."],
                ["Keep updated contact details of key stakeholders", "Maintain a written list of contacts updated at least once per term."],
                ["Coordinate closely with Ujamaa and other partners", "Attend coordination meetings and share updates on referrals made."],
              ].map(([title, desc], i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-slate-800/50">
                  <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0 text-[10px] font-bold text-orange-600">{i+1}</div>
                  <div>
                    <div className="text-xs font-bold text-black dark:text-white">{title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <Kicker text="First Responder" />
            <h2 className="font-bold text-sm text-black dark:text-white mb-3">Role in Disclosures</h2>
            <div className="bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800 rounded-xl p-4 text-xs text-sky-800 dark:text-sky-300 leading-relaxed">
              <strong>Teachers are not investigators.</strong> Your role is to act as a first responder and connector to professional services. When a student discloses abuse or violence:
            </div>
            <div className="mt-3 space-y-2">
              {[
                "Listen calmly and without judgment — thank the student for trusting you",
                "Do NOT press for details, ask leading questions, or promise secrecy",
                "Never promise that everything will be fine or that you will keep it secret",
                "Follow the school's referral procedure immediately",
                "Document the disclosure in writing as soon as possible",
                "Referrals should be timely, confidential, and appropriate",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle size={12} className="text-green-500 shrink-0 mt-0.5" />
                  {item}
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <Kicker text="Helplines" />
            <h2 className="font-bold text-sm text-black dark:text-white mb-3">National Emergency Contacts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Tithandizane Child Help Line', number: '116', note: 'Free · 24 hours · For children', color: '#dc2626' },
                { label: 'GBV Crisis Line', number: '5600 / 6600', note: 'Gender-Based Violence · Free', color: '#7c3aed' },
              ].map((h, i) => (
                <div key={i} className="p-3 rounded-xl border-2 text-center" style={{ borderColor: h.color + '50', backgroundColor: h.color + '0a' }}>
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Phone size={13} style={{ color: h.color }} />
                    <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: h.color }}>{h.label}</span>
                  </div>
                  <div className="text-2xl font-black" style={{ color: h.color }}>{h.number}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{h.note}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── SAFE SPACE ───────────────────────────────────────────────────── */}
      {activeTab === 'safe_space' && (
        <div className="space-y-4">
          <Card>
            <Kicker text="Ground Rules" />
            <h2 className="font-bold text-sm text-black dark:text-white mb-3">Creating a Safe Space</h2>
            <div className="space-y-3">
              {[
                { rule: 'Confidentiality', desc: 'Everything said in the room stays in the room. Participants must feel safe to share without fear of gossip.' },
                { rule: 'Respect opinions', desc: 'There are no right or wrong answers. All views are welcome. Challenge ideas, not people.' },
                { rule: 'Be thankful when someone shares', desc: 'When a student shares a personal story, acknowledge their courage and thank them for trusting the group.' },
                { rule: 'Active listening', desc: 'Listen to understand, not just to respond. Make eye contact and show you are engaged.' },
                { rule: 'Non-judgment', desc: 'Avoid judging or blaming anyone for past experiences or current views.' },
              ].map((item, i) => (
                <div key={i} className="border border-neutral-100 dark:border-slate-800 rounded-xl overflow-hidden">
                  <button onClick={() => toggle(`ss-${i}`)} className="w-full flex items-center justify-between p-3 text-left hover:bg-neutral-50 dark:hover:bg-slate-800/30 transition">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-[10px] font-bold text-orange-600">{i+1}</div>
                      <span className="text-xs font-bold text-black dark:text-white">{item.rule}</span>
                    </div>
                    {expandedItem === `ss-${i}` ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                  </button>
                  {expandedItem === `ss-${i}` && (
                    <div className="px-3 pb-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-neutral-100 dark:border-slate-800 pt-2">
                      {item.desc}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-l-4 border-pink-500 bg-pink-50/50 dark:bg-pink-950/10">
            <Kicker text="Trigger Warning" />
            <h2 className="font-bold text-sm text-black dark:text-white mb-2">Facilitator Script — Before GESD Content</h2>
            <div className="bg-white dark:bg-[#0f1623] rounded-xl p-4 border border-pink-200 dark:border-pink-900/30 text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic space-y-2">
              <p>"Before we begin, I want to let you know that parts of this GESD curriculum describe situations of violence or self-defense scenarios. These may bring up strong emotions or memories, especially for anyone who has personally experienced trauma."</p>
              <p>"We include this material because learning skills in empowerment and self-defense is important for building your safety, confidence, and resilience. At the same time, we understand that everyone's healing journey is different, and some of you may feel overwhelmed while engaging with these topics."</p>
              <p>"Please remember: you are in control of your own participation. If at any point you feel uncomfortable, you can choose to step outside, take a break, or simply not take part in that activity. There is no pressure."</p>
              <p>"This is a safe space. We respect one another, and what is shared here stays here. If at any time you would like extra support, I am here to talk, and we can also connect you to people and places that can help. Most importantly, you are not alone, and your well-being comes first."</p>
              <p className="font-bold not-italic text-orange-600">"Let's go through this together with care, respect, and courage."</p>
            </div>
          </Card>
        </div>
      )}

      {/* ── POSITIVE DISCIPLINE ──────────────────────────────────────────── */}
      {activeTab === 'discipline' && (
        <div className="space-y-4">
          <Card>
            <Kicker text="Non-Violent" />
            <h2 className="font-bold text-sm text-black dark:text-white mb-4">Positive Discipline Framework</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    {['Type', 'Description', 'Examples'].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-bold text-white text-[10px] uppercase tracking-wide bg-[#e85d04] first:rounded-tl-lg last:rounded-tr-lg">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Reflection',    'Encourages the student to think about their actions',   'Verbal warning, timeout, letter writing, apology'],
                    ['Penalty',       'Natural consequences that reinforce responsibility',    'Withdrawal of privileges, light work, detention, behaviour contract'],
                    ['Reparation',    'Making amends and restoring relationships',             'Public apology, replace or repair damage caused'],
                    ['Last Resort',   'Only when all other approaches have failed',            'Parent meetings, referral to counsellor, suspension'],
                  ].map(([type, desc, examples], i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-neutral-50 dark:bg-slate-800/20' : ''}>
                      <td className="px-3 py-2.5 font-bold text-orange-600 dark:text-orange-400 align-top">{type}</td>
                      <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300 align-top">{desc}</td>
                      <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400 align-top">{examples}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="bg-green-50/50 dark:bg-green-950/10 border-l-4 border-green-500">
            <div className="text-[10px] font-bold uppercase tracking-wide text-green-700 dark:text-green-400 mb-2">Key Principle</div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Positive discipline focuses on <strong>teaching</strong>, not punishing. The goal is to help students understand the impact of their actions and make better choices — not to humiliate, harm, or demotivate them. Always start with the gentlest approach and escalate only when necessary.
            </p>
          </Card>
        </div>
      )}

      {/* ── MENTORSHIP ───────────────────────────────────────────────────── */}
      {activeTab === 'mentorship' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <Kicker text="Definition" />
              <h2 className="font-bold text-sm text-black dark:text-white mb-2">Mentorship</h2>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                A relationship in which a <strong>more experienced person</strong> guides a <strong>less experienced person</strong>. The mentor shares knowledge, experience, and advice to help the mentee grow personally and professionally.
              </p>
              <div className="mt-3 space-y-1.5">
                {['One-to-one or small group relationship', 'Long-term, ongoing support', 'Based on trust, respect, and confidentiality', 'Mentee sets the agenda and goals'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />{item}
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <Kicker text="Definition" />
              <h2 className="font-bold text-sm text-black dark:text-white mb-2">Role Modelling</h2>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Learners learn new behaviors by <strong>observing others</strong>. Role models demonstrate the attitudes, values, and actions they want students to adopt — they do not just tell students what to do, they show them.
              </p>
              <div className="mt-3 space-y-1.5">
                {['Visible, consistent behavior', 'Modelling healthy masculinity and boundary-setting', 'Demonstrating active listening and empathy', 'Showing how to de-escalate and negotiate'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />{item}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card>
            <Kicker text="Practice" />
            <h2 className="font-bold text-sm text-black dark:text-white mb-3">What Good Mentorship Looks Like in ETT</h2>
            <div className="space-y-2">
              {[
                ['Check in regularly', 'Touch base with students individually — not just in group sessions. A 2-minute check-in can mean a lot.'],
                ['Be consistent', 'Show up every session. Reliability builds trust. Students who have experienced instability respond especially well to consistency.'],
                ['Listen more than you talk', 'Ask open questions. Let students lead the conversation. Your role is to guide, not lecture.'],
                ['Celebrate growth, not just results', 'Acknowledge effort and progress. "I noticed how you stood up for yourself today — that took courage."'],
                ['Maintain professional boundaries', 'Be warm and approachable, but maintain appropriate boundaries at all times. Never meet students in private or out of school hours.'],
              ].map(([title, desc], i) => (
                <div key={i} className="p-3 rounded-xl border border-neutral-100 dark:border-slate-800">
                  <div className="text-xs font-bold text-black dark:text-white mb-0.5">{title}</div>
                  <div className="text-[11px] text-slate-500">{desc}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── GUIDANCE vs COUNSELLING ──────────────────────────────────────── */}
      {activeTab === 'guidance' && (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse rounded-xl overflow-hidden">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-white bg-[#e85d04] text-[10px] uppercase tracking-wide">Dimension</th>
                  <th className="px-4 py-3 text-left font-bold text-white bg-blue-700 text-[10px] uppercase tracking-wide">Guidance</th>
                  <th className="px-4 py-3 text-left font-bold text-white bg-purple-700 text-[10px] uppercase tracking-wide">Counselling</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Purpose',    'Preventive and developmental',                         'Remedial and therapeutic'],
                  ['Focus',      'Intellectual and academic growth',                      'Emotional and personal problems'],
                  ['Who it serves', 'For ALL students in the school',                    'For students experiencing personal difficulties'],
                  ['Who provides it', 'Teachers, Teacher Champions, counsellors',        'Trained counsellors and mental health professionals'],
                  ['Nature',     'Informational — giving knowledge, options, direction',  'Relational — building a therapeutic relationship'],
                  ['Confidentiality', 'Less strict — can be shared in group settings',   'Strict — only shared when safety is at risk'],
                  ['Examples',   'Career advice, study skills, life skills sessions',     'Grief support, trauma counselling, crisis intervention'],
                ].map(([dim, guide, couns], i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-neutral-50 dark:bg-slate-800/20' : ''}>
                    <td className="px-4 py-2.5 font-bold text-orange-600 dark:text-orange-400 align-top">{dim}</td>
                    <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300 align-top">{guide}</td>
                    <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400 align-top">{couns}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Card className="border-l-4 border-blue-500 bg-blue-50/50 dark:bg-blue-950/10">
            <div className="text-[10px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-2">Key Distinction for Teacher Champions</div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Teacher Champions provide <strong>guidance</strong> — not counselling. If a student needs counselling (e.g. after trauma, abuse, or bereavement), refer them to a trained professional immediately. Attempting to provide counselling without training can cause harm.
            </p>
          </Card>
        </div>
      )}

      {/* ── SAFEGUARDING ─────────────────────────────────────────────────── */}
      {activeTab === 'safeguarding' && (
        <div className="space-y-4">
          <Card>
            <Kicker text="Policy" />
            <h2 className="font-bold text-sm text-black dark:text-white mb-3">Ujamaa Safeguarding Statement</h2>
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-xs text-amber-900 dark:text-amber-200 leading-relaxed italic">
              "Ujamaa Pamodzi Africa is committed to promoting the welfare and protection of children, adults and vulnerable groups in all our activities. We adhere to statutory responsibilities, Malawi government guidance, and international best practices to ensure the highest standards of safeguarding are maintained. Our staff and volunteers are trained in safeguarding and understand their responsibility to report any concerns or incidents of abuse or harm to our designated safeguarding officer, as we have zero tolerance for any form of abuse, neglect, exploitation, or harm."
            </div>
          </Card>

          <Card>
            <Kicker text="Principles" />
            <h2 className="font-bold text-sm text-black dark:text-white mb-3">Safeguarding in Practice</h2>
            <div className="space-y-2">
              {[
                ['Zero tolerance for abuse', 'No form of abuse, neglect, exploitation, or harm is acceptable. Report all concerns immediately.', '#dc2626'],
                ['Confidentiality with limits', 'Student disclosures are kept private except when a child\'s safety is at risk — then mandatory reporting applies.', '#d97706'],
                ['Child-centred approach', 'The best interests of the child are always the primary consideration in every decision made.', '#059669'],
                ['Mandatory reporting', 'All staff and volunteers must report concerns to the designated safeguarding officer without delay.', '#7c3aed'],
                ['Training requirement', 'All staff and volunteers must complete safeguarding training before working with children.', '#0369a1'],
              ].map(([title, desc, color], i) => (
                <div key={i} className="p-3 rounded-xl border flex items-start gap-3" style={{ borderColor: color + '30', backgroundColor: color + '08' }}>
                  <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: color }} />
                  <div>
                    <div className="text-xs font-bold text-black dark:text-white">{title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <Kicker text="Contacts" />
            <h2 className="font-bold text-sm text-black dark:text-white mb-3">Report a Concern</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label:'Tithandizane Child Help Line', number:'116', note:'Free · 24/7 · Children', color:'#dc2626' },
                { label:'GBV Crisis Line', number:'5600 / 6600', note:'Gender-Based Violence', color:'#7c3aed' },
              ].map((h, i) => (
                <div key={i} className="p-3 rounded-xl border-2 text-center" style={{ borderColor: h.color + '50', backgroundColor: h.color + '0a' }}>
                  <Phone size={14} className="mx-auto mb-1" style={{ color: h.color }} />
                  <div className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: h.color }}>{h.label}</div>
                  <div className="text-xl font-black" style={{ color: h.color }}>{h.number}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{h.note}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── ASSESSMENT ───────────────────────────────────────────────────── */}
      {activeTab === 'assessment' && (
        <div className="space-y-4">
          <Card>
            <Kicker text="Course Assessment" />
            <h2 className="font-bold text-sm text-black dark:text-white mb-4">Assessment Types</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    {['Assessment Type', 'Description', 'When'].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-bold text-white text-[10px] uppercase tracking-wide bg-[#e85d04]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Reflection Questions', 'Students reflect on key lesson concepts, how they apply to real life, and what they will do differently.', 'End of each module'],
                    ['Role-Play Submissions', 'Students demonstrate assertiveness, Step-Up strategies, or GESD verbal techniques through role-play scenarios.', 'During relevant lessons'],
                    ['Group Discussions', 'Open group discussions applying curriculum content to real-life situations in their community.', 'Throughout the course'],
                    ['Personal Pledge', 'Each student writes a personal commitment to healthy masculinity (HIM) or self-empowerment (GESD).', 'Final session'],
                    ['Online Quiz', '20 multiple-choice questions drawn from all modules. Students must score 80% or higher to pass.', 'After all lessons'],
                    ['Certificate', 'A personalised PDF certificate of completion issued to students who pass the quiz.', 'Upon passing the quiz'],
                  ].map(([type, desc, when], i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-neutral-50 dark:bg-slate-800/20' : ''}>
                      <td className="px-3 py-2.5 font-bold text-orange-600 dark:text-orange-400 align-top">{type}</td>
                      <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300 align-top">{desc}</td>
                      <td className="px-3 py-2.5 text-slate-500 align-top font-medium">{when}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <Kicker text="Beginner's Track" />
            <h2 className="font-bold text-sm text-black dark:text-white mb-3">GESD Beginner's Toolkit — Grades 3–4</h2>
            <p className="text-xs text-slate-500 mb-3">A condensed 4-session track (45 minutes each) for younger learners in Grades 3–4.</p>
            <div className="space-y-2">
              {[
                ['Session 1 (45 min)', 'Introduction and GESD', 'Intro to GESD teachers · Self-Defense definition and Safety Aim · Important points on self-defense · Closing with SMEVB (5 Bodily Weapons)'],
                ['Session 2 (45 min)', 'Attack Progression & SMEVB', 'Review questions · Attack Progression Scale (definition, forms, role of voice, role plays) · Closing with Five Fingers of Emergency'],
                ['Session 3 (45 min)', 'PPP, Ploys, Awareness & Gazelle', 'Review questions · Perpetrator Progression Pattern with ploys and role plays · Awareness · Closing with SMEVB'],
                ['Session 4 (45 min)', 'Verbal Toolbox & Breaking Silence', 'Review questions · Verbal safety toolbox (No, stance, yell, assertiveness, boundaries) · Breaking Silence + Referral Pathways · Closing with Stance and Yell'],
              ].map(([session, title, content], i) => (
                <div key={i} className="border border-neutral-100 dark:border-slate-800 rounded-xl overflow-hidden">
                  <button onClick={() => toggle(`beg-${i}`)} className="w-full flex items-center justify-between p-3 text-left hover:bg-neutral-50 dark:hover:bg-slate-800/30">
                    <div>
                      <div className="text-[10px] font-bold text-orange-500 uppercase tracking-wide">{session}</div>
                      <div className="text-xs font-bold text-black dark:text-white">{title}</div>
                    </div>
                    {expandedItem === `beg-${i}` ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                  </button>
                  {expandedItem === `beg-${i}` && (
                    <div className="px-3 pb-3 text-[11px] text-slate-500 border-t border-neutral-100 dark:border-slate-800 pt-2 leading-relaxed">
                      {content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
