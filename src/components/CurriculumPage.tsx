import React, { useState, useEffect } from 'react';
import {
  BookOpen, ChevronRight, ChevronLeft, HelpCircle,
  FileText, ExternalLink, X, Maximize2, Layers,
  Shield, Users, Star, ArrowRight, Play, Award, Clock,
  CheckCircle2, AlertCircle, Zap
} from 'lucide-react';
import { Card, Kicker, Btn, FInput, FSelect } from './SubComponents';
import { Session } from '../types';
import { HIM_SESSIONS, GESD_SESSIONS } from '../data';
import { CourseLessonPage } from './CourseLessonPage';
import { CourseQuizComponent } from './CourseQuizComponent';
import { CertificateComponent } from './CertificateComponent';

// ─── GRADES ───────────────────────────────────────────────────────────────────
const GRADES = [
  'Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8',
  'Form 1','Form 2','Form 3','Form 4',
];

// ─── PDF VIEWER ───────────────────────────────────────────────────────────────
interface PdfViewerProps { url: string; title: string; subtitle: string; onClose: () => void; }
const PdfViewer: React.FC<PdfViewerProps> = ({ url, title, subtitle, onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[99999] bg-black/90 flex flex-col">
      <div className="shrink-0 h-11 flex items-center justify-between px-4 bg-[#0f1623] border-b border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-6 h-6 rounded bg-[#e85d04] flex items-center justify-center shrink-0"><FileText size={12} className="text-white" /></div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-white truncate block">{title}</span>
            <span className="text-[10px] text-slate-400 truncate block">{subtitle}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded border border-slate-700 text-slate-300 hover:bg-slate-800 transition">
            <ExternalLink size={11} /> Open tab
          </a>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded border border-slate-700 text-slate-400 hover:bg-red-900/40 hover:text-red-400 transition"><X size={13} /></button>
        </div>
      </div>
      <div className="flex-1 bg-[#1a1a2e] overflow-hidden">
        <iframe src={`${url}#toolbar=0&navpanes=0&scrollbar=1`} className="w-full h-full border-none" title={title} />
      </div>
    </div>
  );
};

// ─── PDF DOCS ─────────────────────────────────────────────────────────────────
const PDF_DOCS = [
  { id:'him-manual',  title:'HIM Facilitator Manual',   subtitle:'Hero In Me — Boys Programme',         description:'Complete facilitator guide with all 6 topics, classroom activities, Step-Up strategies, and trainer notes.', curriculum:'him'  as const, filename:'him-manual.pdf',  meta:'v2.1 · 2025 · 48 pages', color:'#185fa5', pale:'#dbeafe', icon:Shield },
  { id:'gesd-manual', title:'GESD Facilitator Manual',  subtitle:'Girls Empowerment & Safety Design',   description:'Full guide with session plans, SMEVB tools, verbal boundary techniques, and safety referral protocols.',      curriculum:'gesd' as const, filename:'gesd-manual.pdf', meta:'v2.0 · 2025 · 52 pages', color:'#a82563', pale:'#fce7f3', icon:Users  },
];

// ─── CURRICULUM OVERVIEW DATA ──────────────────────────────────────────────────
const HIM_OVERVIEW = {
  tagline: "Grounded in social norms and gender transformation theory, Hero In Me invites boys to explore and redefine masculinity.",
  audience: "Boys, ages 9–25",
  duration: "6 Topics · ~6 hours total",
  passmark: "80% quiz score",
  outcomes: [
    "Reshape harmful beliefs around gender and sexuality",
    "Increase the likelihood of seeking consent for any activity",
    "Intervene safely when witnessing violence against women and girls",
    "Use assertiveness, de-escalation, and negotiation to prevent conflict",
    "Break the silence and connect peers to referral pathways",
  ],
  modules: [
    { num:"Topic 1", title:"Needs Assessment – Knowing Myself & My Rights",     dur:"60 min", icon:"🧠" },
    { num:"Topic 2", title:"My Value System – Life Skills & Personal Awareness", dur:"60 min", icon:"💎" },
    { num:"Topic 3", title:"Introduction to H.I.M. & Verbal Techniques",        dur:"60 min", icon:"🦁" },
    { num:"Topic 4", title:"Stepping Up – Intervention Strategies",             dur:"60 min", icon:"🤝" },
    { num:"Topic 5", title:"Breaking the Silence & Referral Systems",           dur:"60 min", icon:"🔓" },
    { num:"Topic 6", title:"Boys & Girls Combined – Consent & Gender",          dur:"90 min", icon:"🌍" },
  ],
};

const GESD_OVERVIEW = {
  tagline: "Girls Empowerment Self-Defense builds girls' confidence through assertiveness, boundary-setting, voice defense, and strategic self-protection.",
  audience: "Girls, ages 9–25 (Beginner track for Grades 3–4)",
  duration: "6 Modules · ~7 hours total",
  passmark: "80% quiz score",
  outcomes: [
    "Recognise personal strengths and enhance self-image",
    "Identify the full range of attacks along the Attack Progression Scale",
    "Use the five personal weapons: Spirit, Mind, Eyes, Voice, Body (SMEVB)",
    "Apply the Five Fingers of Emergency: Think, Yell, Run, Fight, Tell",
    "Understand consent, gender, and gender stereotypes",
  ],
  modules: [
    { num:"Module 1", title:"Getting to Know You & Life Skills",              dur:"60 min", icon:"🌸" },
    { num:"Module 2", title:"GESD & Attack Progression Scale",                dur:"60 min", icon:"🛡️" },
    { num:"Module 3", title:"Perpetrator's Progression Pattern & Awareness",  dur:"60 min", icon:"👁️" },
    { num:"Module 4", title:"Verbal Safety Toolbox & Breaking the Silence",   dur:"60 min", icon:"📢" },
    { num:"Module 5", title:"Physical Techniques",                            dur:"60 min", icon:"💪" },
    { num:"Module 6", title:"Combined Class – Consent, Gender & Wrap-Up",     dur:"90 min", icon:"🤝" },
  ],
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export const CurriculumPage: React.FC = () => {
  const [tab, setTab] = useState<'him' | 'gesd'>('him');
  const [sel, setSel] = useState<Session | null>(null);
  const [pdfViewer, setPdfViewer] = useState<typeof PDF_DOCS[0] | null>(null);

  // Course flow
  const [courseMode, setCourseMode] = useState<'view' | 'register' | 'lesson' | 'quiz' | 'certificate'>('view');
  const [currentLesson, setCurrentLesson] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [quizScore, setQuizScore] = useState(0);
  const [quizPassed, setQuizPassed] = useState(false);

  // Registration
  const [regName,  setRegName]  = useState('');
  const [regSex,   setRegSex]   = useState('');
  const [regGrade, setRegGrade] = useState('');
  const [regError, setRegError] = useState('');

  const sessions = tab === 'him' ? HIM_SESSIONS : GESD_SESSIONS;
  const overview = tab === 'him' ? HIM_OVERVIEW : GESD_OVERVIEW;
  const isHim    = tab === 'him';
  const accent      = isHim ? '#185fa5' : '#a82563';
  const accentPale  = isHim ? '#dbeafe' : '#fce7f3';
  const accentText  = isHim ? 'text-blue-600 dark:text-blue-400' : 'text-pink-600 dark:text-pink-400';
  const badgeCol    = isHim ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' : 'bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300';
  const base        = (import.meta as any).env?.BASE_URL || '/';
  const currDoc     = PDF_DOCS.find(d => d.curriculum === tab)!;

  const openRegister = (c: 'him' | 'gesd') => {
    setTab(c);
    setRegName(''); setRegSex(c === 'gesd' ? 'F' : 'M'); setRegGrade(''); setRegError('');
    setCourseMode('register');
  };

  const startCourse = () => {
    if (!regName.trim()) { setRegError('Please enter your full name.'); return; }
    if (!regSex)         { setRegError('Please select your sex.'); return; }
    if (!regGrade)       { setRegError('Please select your grade or form.'); return; }
    if (tab === 'gesd' && regSex !== 'F') { setRegError('The GESD programme is for female students only.'); return; }
    setRegError('');
    setCurrentLesson(0);
    setCompletedLessons([]);
    setCourseMode('lesson');
  };

  const handleCompleteLesson = (idx: number) => {
    if (!completedLessons.includes(idx)) setCompletedLessons(p => [...p, idx]);
  };

  const handleQuizComplete = (score: number, passed: boolean) => {
    setQuizScore(score);
    setQuizPassed(passed);
    setCourseMode(passed ? 'certificate' : 'quiz');
  };

  // ── REGISTRATION SCREEN ──────────────────────────────────────────────────
  if (courseMode === 'register') return (
    <div className="max-w-md mx-auto py-8 animate-fade-in-up">
      <button onClick={() => setCourseMode('view')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-black dark:hover:text-white mb-5 transition">
        <ChevronLeft size={14} /> Back to Curriculum
      </button>

      <div className={`rounded-2xl p-6 text-white text-center mb-6 space-y-1`} style={{ background: `linear-gradient(135deg, ${accent}, ${isHim ? '#0d3b6e' : '#6b0f3a'})` }}>
        <div className="text-4xl">{isHim ? '🦁' : '🌸'}</div>
        <h2 className="text-xl font-black">{isHim ? 'Hero In Me (HIM)' : 'Girls Empowerment Self Defense'}</h2>
        <p className="text-sm opacity-80">{isHim ? "Boys' Empowerment Programme" : "Girls' Empowerment Programme"}</p>
      </div>

      <Card className="space-y-4">
        <div>
          <h3 className="font-bold text-base text-black dark:text-white">Register to Start</h3>
          <p className="text-xs text-slate-500 mt-0.5">Your details will appear on your certificate.</p>
        </div>

        <FInput label="Full Name *" value={regName} onChange={e => setRegName(e.target.value)} placeholder="e.g. Tiwonge Banda" />

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300 mb-1.5">Sex *</label>
          <div className="flex gap-3">
            {(['M','F'] as const).map(s => {
              const disabled = (tab === 'gesd' && s === 'M') || (tab === 'him' && s === 'F');
              return (
                <button key={s} type="button" disabled={disabled}
                  onClick={() => !disabled && setRegSex(s)}
                  className={`flex-1 py-2.5 rounded-xl border-2 font-bold text-sm transition-all ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                  style={{ borderColor: regSex === s ? accent : '#e5e7eb', backgroundColor: regSex === s ? accent : 'transparent', color: regSex === s ? 'white' : undefined }}>
                  {s === 'M' ? '♂ Male' : '♀ Female'}
                </button>
              );
            })}
          </div>
          {tab === 'gesd' && <p className="text-[11px] text-pink-600 mt-1.5">⚠️ The GESD programme is open to female students only.</p>}
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300 mb-1.5">Grade / Form *</label>
          <select value={regGrade} onChange={e => setRegGrade(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-slate-700 bg-white dark:bg-[#0f1623] text-black dark:text-white text-sm focus:outline-none focus:border-orange-400">
            <option value="">Select your grade or form...</option>
            <optgroup label="Primary School">
              {GRADES.filter(g => g.startsWith('Grade')).map(g => <option key={g}>{g}</option>)}
            </optgroup>
            <optgroup label="Secondary School">
              {GRADES.filter(g => g.startsWith('Form')).map(g => <option key={g}>{g}</option>)}
            </optgroup>
          </select>
        </div>

        {regError && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl p-3 text-xs text-red-700 dark:text-red-400 font-semibold">⚠️ {regError}</div>
        )}

        <div className="flex gap-3 pt-1">
          <button onClick={() => setCourseMode('view')} className="px-4 py-2.5 rounded-xl font-semibold text-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Cancel</button>
          <button onClick={startCourse} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white" style={{ backgroundColor: accent }}>
            Start Course <ChevronRight size={14} />
          </button>
        </div>
      </Card>
    </div>
  );

  // ── LESSON SCREEN ────────────────────────────────────────────────────────
  if (courseMode === 'lesson') return (
    <div className="space-y-5 w-full animate-fade-in-up">
      <button onClick={() => setCourseMode('view')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition">
        <ChevronLeft size={14} /> Back to Curriculum
      </button>
      <CourseLessonPage
        curriculum={tab}
        lessonIndex={currentLesson}
        onComplete={handleCompleteLesson}
        onStartQuiz={() => setCourseMode('quiz')}
        onNextLesson={() => setCurrentLesson(l => l + 1)}
        onPreviousLesson={() => setCurrentLesson(l => Math.max(0, l - 1))}
        completedLessons={completedLessons}
      />
    </div>
  );

  // ── QUIZ SCREEN ──────────────────────────────────────────────────────────
  if (courseMode === 'quiz') return (
    <div className="space-y-5 w-full animate-fade-in-up">
      <button onClick={() => setCourseMode('view')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition">
        <ChevronLeft size={14} /> Exit Quiz
      </button>
      <CourseQuizComponent
        curriculum={tab}
        studentName={regName}
        onComplete={handleQuizComplete}
        onBack={() => setCourseMode('view')}
        onReviewLessons={() => setCourseMode('lesson')}
      />
    </div>
  );

  // ── CERTIFICATE SCREEN ───────────────────────────────────────────────────
  if (courseMode === 'certificate' && quizPassed) return (
    <CertificateComponent
      studentName={regName}
      curriculum={tab}
      score={quizScore}
      completedAt={new Date().toISOString()}
      grade={regGrade}
      sex={regSex}
      onClose={() => { setCourseMode('view'); setCurrentLesson(0); setCompletedLessons([]); }}
    />
  );

  // ── MAIN VIEW ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 w-full animate-fade-in-up">

      {/* Header */}
      <div>
        <Kicker text="Digital Educational Panel" />
        <h1 className="text-base font-bold text-black dark:text-white m-0">Student Curriculums</h1>
        <p className="text-xs text-black dark:text-white opacity-70 mt-1">
          Structured lessons designed to empower girls and build constructive peer leadership among boys.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg w-fit border border-neutral-200 dark:border-slate-800">
        {([['him','Hero In Me (HIM)',Shield],['gesd','GESD — Girls',Users]] as const).map(([k,l,Icon]) => (
          <button key={k} onClick={() => { setTab(k); setCourseMode('view'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${tab===k ? 'bg-white dark:bg-[#0f1623] text-black dark:text-white shadow-sm border border-neutral-200 dark:border-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white'}`}>
            <Icon size={12} />{l}
          </button>
        ))}
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left sidebar */}
        <div className="lg:col-span-1 space-y-4">

          {/* Programme card */}
          <Card className="overflow-hidden p-0">
            <div className="p-4 text-white" style={{ background:`linear-gradient(135deg,${accent},${isHim?'#0d3b6e':'#6b0f3a'})` }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                  {isHim ? <Shield size={16} className="text-white" /> : <Users size={16} className="text-white" />}
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">{isHim?'Boys Programme':'Girls Programme'}</div>
                  <div className="text-sm font-bold leading-tight">{isHim?'Hero In Me (HIM)':'GESD Framework'}</div>
                </div>
              </div>
              <p className="text-[11px] text-white/80 leading-relaxed m-0">{overview.tagline}</p>
            </div>
            <div className="p-3 space-y-2 text-[11px]">
              {[['👥 Audience', overview.audience],['⏱️ Duration', overview.duration],['🎯 Pass Mark', overview.passmark]].map(([k,v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-slate-500">{k}</span>
                  <span className="font-semibold text-black dark:text-white">{v}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Start Course card */}
          <Card className="overflow-hidden p-0">
            <div className="px-4 py-3 border-b border-neutral-200 dark:border-slate-800 flex items-center gap-2">
              <Play size={13} className="text-[#e85d04]" />
              <span className="text-xs font-bold text-black dark:text-white">Take Course</span>
              <span className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ color:accent, backgroundColor:accentPale }}>Interactive</span>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-[11px] text-black dark:text-white opacity-60 leading-relaxed">
                Learn through interactive lessons, complete a quiz, and earn a certificate upon passing with 80% or higher.
              </p>
              <button onClick={() => openRegister(tab)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-white text-xs font-bold transition hover:opacity-90"
                style={{ backgroundColor:accent }}>
                <div className="flex items-center gap-2"><Play size={13}/><span>Start Course</span></div>
                <ArrowRight size={13}/>
              </button>
              <p className="text-[10px] text-slate-400 text-center">Takes 4–6 hours to complete all lessons</p>
            </div>
          </Card>

          {/* PDF card */}
          <Card className="overflow-hidden p-0">
            <div className="px-4 py-3 border-b border-neutral-200 dark:border-slate-800 flex items-center gap-2">
              <FileText size={13} className="text-[#e85d04]" />
              <span className="text-xs font-bold text-black dark:text-white">Facilitator Manual</span>
              <span className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ color:accent, backgroundColor:accentPale }}>PDF</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <div className="text-xs font-bold text-black dark:text-white">{currDoc.title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{currDoc.meta}</div>
                <p className="text-[11px] text-black dark:text-white opacity-60 leading-relaxed mt-1.5">{currDoc.description}</p>
              </div>
              <button onClick={() => setPdfViewer(currDoc)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-white text-xs font-bold transition hover:opacity-90"
                style={{ backgroundColor:accent }}>
                <div className="flex items-center gap-2"><FileText size={13}/><span>Open Manual</span></div>
                <ArrowRight size={13}/>
              </button>
            </div>
          </Card>
        </div>

        {/* Right — overview + modules */}
        <div className="lg:col-span-2 space-y-4">

          {/* Curriculum Overview */}
          <Card className="space-y-4">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color:accent }}>Curriculum Overview</div>
              <h2 className="text-sm font-bold text-black dark:text-white">
                {isHim ? 'Hero In Me (HIM) — Boys Empowerment Programme' : 'Girls Empowerment Self Defense (GESD)'}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{overview.tagline}</p>
            </div>

            {/* Learning outcomes */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-2">By the end of this course, learners will be able to:</div>
              <div className="space-y-1.5">
                {overview.outcomes.map((o, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor:accentPale }}>
                      <span className="text-[9px] font-bold" style={{ color:accent }}>{i+1}</span>
                    </div>
                    <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{o}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assessment info */}
            <div className="rounded-xl p-3 border" style={{ borderColor:accent+'40', backgroundColor:accentPale+'50' }}>
              <div className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color:accent }}>Assessment & Certification</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  ['Reflection Questions', 'End of each module'],
                  ['Role-play Scenarios', 'Assertiveness & Step-Up'],
                  ['Group Discussions', 'Applied to real-life situations'],
                  ['Personal Pledge', 'Commitment to programme values'],
                  ['Online Quiz', '20 questions · 80% to pass'],
                  ['Certificate', 'PDF certificate upon passing'],
                ].map(([k,v]) => (
                  <div key={k} className="flex items-start gap-1.5">
                    <CheckCircle2 size={11} className="mt-0.5 shrink-0" style={{ color:accent }} />
                    <span className="text-slate-700 dark:text-slate-300"><strong>{k}:</strong> {v}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Modules list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold text-black dark:text-white">
                Module Breakdown
                <span className="ml-2 text-[10px] font-normal text-slate-400">{overview.modules.length} modules</span>
              </div>
              <div className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color:accent, backgroundColor:accentPale }}>
                {isHim ? '60–90 min each' : '60–90 min each'}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {overview.modules.map((m, i) => {
                const session = sessions[i];
                return (
                  <div key={i} onClick={() => session && setSel(session)}
                    className="group bg-white dark:bg-[#0f1623] border border-neutral-200 dark:border-slate-800 rounded-lg p-3.5 cursor-pointer hover:border-[#e85d04] transition-all hover:shadow-sm">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{m.icon}</span>
                        <div className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded" style={{ color:accent, backgroundColor:accentPale }}>{m.num}</div>
                      </div>
                      <ChevronRight size={13} className="text-slate-300 dark:text-slate-600 group-hover:text-[#e85d04] transition shrink-0 mt-0.5" />
                    </div>
                    <h3 className="text-xs font-bold text-black dark:text-white mb-1 leading-snug line-clamp-2">{m.title}</h3>
                    {session && <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{session.desc}</p>}
                    <div className="mt-2.5 pt-2 border-t border-neutral-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-medium">{m.dur}</span>
                      <span className="text-[10px] font-bold text-[#e85d04]">View details →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Session detail modal */}
      {sel && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSel(null)} />
          <div className="relative bg-white dark:bg-[#0f1623] border border-neutral-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 text-white rounded-t-xl" style={{ background:`linear-gradient(135deg,${accent},${isHim?'#0d3b6e':'#6b0f3a'})` }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">{sel.num}</div>
                  <h3 className="text-sm font-bold leading-snug m-0">{sel.title}</h3>
                </div>
                <button onClick={() => setSel(null)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition shrink-0"><X size={13}/></button>
              </div>
              <div className="flex gap-2 mt-3">
                <span className="text-[10px] font-bold bg-white/15 px-2 py-0.5 rounded-full">{sel.dur}</span>
                <span className="text-[10px] font-bold bg-white/15 px-2 py-0.5 rounded-full">GBV Prevention</span>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 border border-neutral-100 dark:border-slate-800">
                <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">Lesson Summary</div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed m-0 italic">"{sel.desc}"</p>
              </div>

              {sel.pledge && (
                <div>
                  <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">Classroom Pledge</div>
                  <div className="rounded-lg p-3 border-l-[3px] text-xs font-medium leading-relaxed space-y-1" style={{ borderColor:accent, backgroundColor:accentPale, color:accent }}>
                    {sel.pledge.split('/').map((line,idx) => <div key={idx}>{line.trim()}</div>)}
                  </div>
                </div>
              )}

              <div>
                <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Learning Objectives</div>
                <div className="space-y-1.5">
                  {sel.objectives.map((obj,i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor:accentPale }}>
                        <span className="text-[9px] font-bold" style={{ color:accent }}>{i+1}</span>
                      </div>
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{obj}</span>
                    </div>
                  ))}
                </div>
              </div>

              {sel.keyTakeaways && sel.keyTakeaways.length > 0 && (
                <div>
                  <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Key Takeaways</div>
                  {sel.keyTakeaways.map((t,i) => (
                    <div key={i} className="flex items-start gap-2 mb-1.5">
                      <Zap size={11} className="mt-0.5 shrink-0" style={{ color:accent }} />
                      <span className="text-[11px] text-slate-600 dark:text-slate-300">{t}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-start gap-1.5 text-[10px] text-slate-400 pt-1 border-t border-neutral-100 dark:border-slate-800">
                <HelpCircle size={12} className="shrink-0 mt-0.5" />
                <span>All lessons comply with Malawi's National Primary School Curriculum safe space protocols.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {pdfViewer && (
        <PdfViewer url={`${base}${pdfViewer.filename}`} title={pdfViewer.title} subtitle={pdfViewer.subtitle} onClose={() => setPdfViewer(null)} />
      )}
    </div>
  );
};
