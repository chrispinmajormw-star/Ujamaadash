import React, { useState, useEffect } from 'react';
import {
  BookOpen, ChevronRight, ChevronLeft, HelpCircle,
  FileText, ExternalLink, X, Maximize2, Layers,
  Shield, Users, Star, ArrowRight, Play
} from 'lucide-react';
import { Card, Kicker } from './SubComponents';
import { Session } from '../types';
import { HIM_SESSIONS, GESD_SESSIONS } from '../data';
import { CourseLessonPage } from './CourseLessonPage';
import { CourseQuizComponent } from './CourseQuizComponent';
import { CertificateComponent } from './CertificateComponent';

// ─── PRESENTATION PDF VIEWER ─────────────────
interface PdfViewerProps {
  url: string;
  title: string;
  subtitle: string;
  onClose: () => void;
}
const PdfViewer: React.FC<PdfViewerProps> = ({ url, title, subtitle, onClose }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const onFsChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen();
    }
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-[99999] bg-black/90 flex flex-col">
      <div className="shrink-0 h-11 flex items-center justify-between px-4 bg-[#0f1623] border-b border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-6 h-6 rounded bg-[#e85d04] flex items-center justify-center shrink-0">
            <FileText size={12} className="text-white" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-white truncate block">{title}</span>
            <span className="text-[10px] text-slate-400 truncate block">{subtitle}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <ExternalLink size={11} /> Open tab
          </a>
          <button
            onClick={toggleFullscreen}
            className="w-7 h-7 flex items-center justify-center rounded border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            title={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            <Maximize2 size={13} />
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded border border-slate-700 text-slate-400 hover:bg-red-900/40 hover:text-red-400 transition"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-[#1a1a2e] overflow-hidden">
        <iframe
          src={`${url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH&zoom=page-fit`}
          className="w-full h-full border-none"
          title={title}
          style={{ background: '#1a1a2e' }}
        />
      </div>
    </div>
  );
};

// ─── PDF DOCUMENTS ────────────────────────────
const PDF_DOCS = [
  {
    id: 'him-manual',
    title: 'HIM Facilitator Manual',
    subtitle: 'Hero In Me — Boys Programme',
    description: 'Complete facilitator guide with all 6 topics, classroom activities, Step-Up strategies, and trainer notes.',
    curriculum: 'him' as const,
    filename: 'him-manual.pdf',
    meta: 'v2.1 · 2025 · 48 pages',
    color: '#185fa5',
    pale: '#dbeafe',
    icon: Shield
  },
  {
    id: 'gesd-manual',
    title: 'GESD Facilitator Manual',
    subtitle: 'Girls Empowerment & Safety Design',
    description: 'Full guide with session plans, SMEVB tools, verbal boundary techniques, and safety referral protocols.',
    curriculum: 'gesd' as const,
    filename: 'gesd-manual.pdf',
    meta: 'v2.0 · 2025 · 52 pages',
    color: '#a82563',
    pale: '#fce7f3',
    icon: Users
  },
];

export const CurriculumPage: React.FC = () => {
  const [tab, setTab] = useState<'him' | 'gesd'>('him');
  const [sel, setSel] = useState<Session | null>(null);
  const [pdfViewer, setPdfViewer] = useState<typeof PDF_DOCS[0] | null>(null);
  
  // Course state
  const [courseMode, setCourseMode] = useState<'view' | 'lesson' | 'quiz' | 'certificate'>('view');
  const [currentLesson, setCurrentLesson] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [quizScore, setQuizScore] = useState(0);
  const [quizPassed, setQuizPassed] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentGrade, setStudentGrade] = useState('');
  const [studentSex, setStudentSex] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempGrade, setTempGrade] = useState('');
  const [tempSex, setTempSex] = useState('');

  const sessions = tab === 'him' ? HIM_SESSIONS : GESD_SESSIONS;
  const isHim = tab === 'him';
  const accent = isHim ? '#185fa5' : '#a82563';
  const accentPale = isHim ? '#dbeafe' : '#fce7f3';
  const accentText = isHim ? 'text-blue-600 dark:text-blue-400' : 'text-pink-600 dark:text-pink-400';
  const badgeCol = isHim
    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
    : 'bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300';

  const base = import.meta.env.BASE_URL || '/';
  const currDoc = PDF_DOCS.find(d => d.curriculum === tab)!;

  const handleStartCourse = () => {
    if (sessions.length === 0) return;
    setShowNamePrompt(true);
  };

  const handleEnterName = () => {
    if (tempName.trim() && tempGrade.trim()) {
      setStudentName(tempName.trim());
      setStudentGrade(tempGrade.trim());
      setStudentSex(tempSex.trim());
      setShowNamePrompt(false);
      setCourseMode('lesson');
      setCurrentLesson(0);
      setCompletedLessons([]);
    }
  };

  const handleCompleteLesson = (lessonIndex: number) => {
    if (!completedLessons.includes(lessonIndex)) {
      setCompletedLessons([...completedLessons, lessonIndex]);
    }
  };

  const handleQuizComplete = (score: number, passed: boolean) => {
    setQuizScore(score);
    setQuizPassed(passed);
    setCourseMode(passed ? 'certificate' : 'lesson');
  };

  // Course view
  if (courseMode === 'lesson') {
    return (
      <div className="space-y-5 max-w-5xl mx-auto animate-fade-in-up">
        <button
          onClick={() => {
            setCourseMode('view');
            setCurrentLesson(0);
            setCompletedLessons([]);
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition"
        >
          <ChevronLeft size={14} />
          Back to Curriculum
        </button>
        <CourseLessonPage
          curriculum={tab}
          lessonIndex={currentLesson}
          onComplete={handleCompleteLesson}
          onStartQuiz={() => {
            setCourseMode('quiz');
          }}
          onNextLesson={() => {
            setCurrentLesson(currentLesson + 1);
          }}
          onPreviousLesson={() => {
            setCurrentLesson(currentLesson - 1);
          }}
          onGoToLesson={(index) => {
            setCurrentLesson(index);
          }}
          completedLessons={completedLessons}
        />
      </div>
    );
  }

  if (courseMode === 'quiz') {
    return (
      <div className="space-y-5 max-w-5xl mx-auto animate-fade-in-up">
        <button
          onClick={() => setCourseMode('view')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition"
        >
          <ChevronLeft size={14} />
          Exit Quiz
        </button>
        <CourseQuizComponent
          curriculum={tab}
          studentName={studentName}
          onComplete={handleQuizComplete}
          onBack={() => setCourseMode('view')}
          onReviewLessons={() => setCourseMode('lesson')}
        />
      </div>
    );
  }

  if (courseMode === 'certificate' && quizPassed) {
    return (
      <CertificateComponent
        studentName={studentName}
        curriculum={tab}
        score={quizScore}
        grade={studentGrade}
        sex={studentSex}
        completedAt={new Date().toISOString()}
        onClose={() => {
          setCourseMode('view');
          setCurrentLesson(0);
          setCompletedLessons([]);
        }}
      />
    );
  }

  // Main curriculum view
  return (
    <div className="space-y-5 max-w-5xl mx-auto animate-fade-in-up">

      {/* Name Prompt Modal */}
      {showNamePrompt && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-md space-y-4">
            <div>
              <h2 className="text-lg font-bold text-black dark:text-white">Student Details</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Your details will appear on your certificate upon completion
              </p>
            </div>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Full name"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-black dark:text-white focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': accent } as any}
              autoFocus
            />
            <input
              type="text"
              value={tempGrade}
              onChange={(e) => setTempGrade(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEnterName()}
              placeholder="Grade / Form (e.g. Form 2)"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-black dark:text-white focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': accent } as any}
            />
            <select
              value={tempSex}
              onChange={(e) => setTempSex(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-black dark:text-white focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': accent } as any}
            >
              <option value="">Sex (optional)</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => setShowNamePrompt(false)}
                className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleEnterName}
                disabled={!tempName.trim() || !tempGrade.trim()}
                className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: accent }}
              >
                Start Course
              </button>
            </div>
          </Card>
        </div>
      )}

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
        {([['him', 'Hero In Me (HIM)', Shield], ['gesd', 'GESD — Girls', Users]] as const).map(([k, l, Icon]) => (
          <button
            key={k}
            onClick={() => {
              setTab(k);
              setCourseMode('view');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              tab === k
                ? 'bg-white dark:bg-[#0f1623] text-black dark:text-white shadow-sm border border-neutral-200 dark:border-slate-700'
                : 'text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Icon size={12} />
            {l}
          </button>
        ))}
      </div>

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left: Programme overview + PDF access */}
        <div className="lg:col-span-1 space-y-4">

          {/* Programme card */}
          <Card className="overflow-hidden p-0">
            <div
              className="p-4 text-white"
              style={{ background: `linear-gradient(135deg, ${accent} 0%, ${isHim ? '#0d3b6e' : '#6b0f3a'} 100%)` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                  {isHim ? <Shield size={16} className="text-white" /> : <Users size={16} className="text-white" />}
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                    {isHim ? 'Boys Programme' : 'Girls Programme'}
                  </div>
                  <div className="text-sm font-bold leading-tight">
                    {isHim ? 'Hero In Me (HIM)' : 'GESD Framework'}
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-white/80 leading-relaxed m-0">
                {isHim
                  ? 'Empowers boys to challenge harmful gender norms, develop healthy emotional awareness, and practise non-violent communication.'
                  : 'Builds girls\' confidence through assertiveness training, boundary-setting, voice defence, and strategic self-protection tools.'}
              </p>
            </div>

            <div className="p-3 space-y-2">
              {(isHim
                ? ['6 Core Topics', 'Bystander Step-Up Strategies', 'Confidence & Care', 'Referral Pathways']
                : ['6 Core Sessions', 'SMEVB Assertiveness', 'Emergency Safety Tools', 'Break-the-Silence Modules']
              ).map(tag => (
                <div key={tag} className="flex items-center gap-2 text-[11px]">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
                  <span className="text-black dark:text-white opacity-70 font-medium">{tag}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Take Course Card */}
          <Card className="overflow-hidden p-0">
            <div className="px-4 py-3 border-b border-neutral-200 dark:border-slate-800 flex items-center gap-2">
              <Play size={13} className="text-[#e85d04]" />
              <span className="text-xs font-bold text-black dark:text-white">Take Course</span>
              <span
                className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{ color: accent, backgroundColor: accentPale }}
              >
                Interactive
              </span>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <div className="text-xs font-bold text-black dark:text-white">
                  {isHim ? 'Hero In Me Course' : 'Girls Empowerment Course'}
                </div>
                <p className="text-[11px] text-black dark:text-white opacity-60 leading-relaxed mt-1.5">
                  Learn through interactive lessons, complete a quiz, and earn a certificate upon passing.
                </p>
              </div>

              <button
                onClick={handleStartCourse}
                disabled={sessions.length === 0}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-white text-xs font-bold transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: accent }}
              >
                <div className="flex items-center gap-2">
                  <Play size={13} />
                  <span>Start Course</span>
                </div>
                <ArrowRight size={13} />
              </button>

              <p className="text-[10px] text-slate-400 text-center">
                Takes 4-6 hours to complete all lessons
              </p>
            </div>
          </Card>

          {/* PDF document card */}
          <Card className="overflow-hidden p-0">
            <div className="px-4 py-3 border-b border-neutral-200 dark:border-slate-800 flex items-center gap-2">
              <FileText size={13} className="text-[#e85d04]" />
              <span className="text-xs font-bold text-black dark:text-white">Facilitator Manual</span>
              <span
                className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{ color: accent, backgroundColor: accentPale }}
              >
                PDF
              </span>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <div className="text-xs font-bold text-black dark:text-white">{currDoc.title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{currDoc.meta}</div>
                <p className="text-[11px] text-black dark:text-white opacity-60 leading-relaxed mt-1.5">
                  {currDoc.description}
                </p>
              </div>

              <button
                onClick={() => setPdfViewer(currDoc)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-white text-xs font-bold transition hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: accent }}
              >
                <div className="flex items-center gap-2">
                  <FileText size={13} />
                  <span>Open Presentation</span>
                </div>
                <ArrowRight size={13} />
              </button>

              <p className="text-[10px] text-slate-400 text-center">
                Opens in full-screen presentation mode
              </p>
            </div>
          </Card>
        </div>

        {/* Right: Sessions grid */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-black dark:text-white">
              Session Breakdown
              <span className="ml-2 text-[10px] font-normal text-slate-400">{sessions.length} lessons</span>
            </div>
            <div
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ color: accent, backgroundColor: accentPale }}
            >
              {isHim ? '45–90 min each' : '45–60 min each'}
            </div>
          </div>

          {sessions.length === 0 && (
            <Card className="p-6 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No sessions are available for this programme yet.
              </p>
            </Card>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sessions.map((s, i) => (
              <div
                key={i}
                onClick={() => setSel(s)}
                className="group bg-white dark:bg-[#0f1623] border border-neutral-200 dark:border-slate-800 rounded-lg p-3.5 cursor-pointer hover:border-[#e85d04] dark:hover:border-[#e85d04] transition-all hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div
                    className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded"
                    style={{ color: accent, backgroundColor: accentPale }}
                  >
                    {s.num}
                  </div>
                  <ChevronRight
                    size={13}
                    className="text-slate-300 dark:text-slate-600 group-hover:text-[#e85d04] transition shrink-0 mt-0.5"
                  />
                </div>
                <h3 className="text-xs font-bold text-black dark:text-white mb-1 leading-snug line-clamp-2">
                  {s.title}
                </h3>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {s.desc}
                </p>
                <div className="mt-2.5 pt-2 border-t border-neutral-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">{s.dur}</span>
                  <span className="text-[10px] font-bold text-[#e85d04]">View details →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Session detail modal */}
      {sel && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSel(null)} />
          <div className="relative bg-white dark:bg-[#0f1623] border border-neutral-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div
              className="p-4 text-white rounded-t-xl"
              style={{ background: `linear-gradient(135deg, ${accent}, ${isHim ? '#0d3b6e' : '#6b0f3a'})` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">{sel.num}</div>
                  <h3 className="text-sm font-bold leading-snug m-0">{sel.title}</h3>
                </div>
                <button
                  onClick={() => setSel(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition shrink-0"
                >
                  <X size={13} />
                </button>
              </div>
              <div className="flex gap-2 mt-3">
                <span className="text-[10px] font-bold bg-white/15 px-2 py-0.5 rounded-full">{sel.dur}</span>
                <span className="text-[10px] font-bold bg-white/15 px-2 py-0.5 rounded-full">GBV Prevention</span>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Description */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 border border-neutral-100 dark:border-slate-800">
                <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">Lesson Summary</div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed m-0 italic">"{sel.desc}"</p>
              </div>

              {/* Pledge */}
              {sel.pledge && (
                <div>
                  <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">Classroom Pledge</div>
                  <div
                    className="rounded-lg p-3 border-l-[3px] text-xs font-medium leading-relaxed space-y-1"
                    style={{ borderColor: accent, backgroundColor: accentPale, color: accent }}
                  >
                    {sel.pledge.split('/').map((line, idx) => (
                      <div key={idx}>{line.trim()}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Objectives */}
              <div>
                <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Learning Objectives</div>
                <div className="space-y-1.5">
                  {sel.objectives.map((obj, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: accentPale }}>
                        <span className="text-[9px] font-bold" style={{ color: accent }}>{i + 1}</span>
                      </div>
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{obj}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-1.5 text-[10px] text-slate-400 pt-1 border-t border-neutral-100 dark:border-slate-800">
                <HelpCircle size={12} className="shrink-0 mt-0.5" />
                <span>All lessons comply with Malawi's National Primary School Curriculum safe space protocols.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer */}
      {pdfViewer && (
        <PdfViewer
          url={`${base}${pdfViewer.filename}`}
          title={pdfViewer.title}
          subtitle={pdfViewer.subtitle}
          onClose={() => setPdfViewer(null)}
        />
      )}
    </div>
  );
};
