import React, { useState } from 'react';
import { BookOpen, Award, ChevronRight, Lock, CheckCircle2, Users, Clock, Star } from 'lucide-react';
import { CourseLessonPage } from './CourseLessonPage';
import { CourseQuizComponent } from './CourseQuizComponent';
import { CertificateComponent } from './CertificateComponent';
import { Card, Btn, FInput, FSelect } from './SubComponents';

type Screen = 'home' | 'register' | 'lessons' | 'quiz' | 'certificate';
type Curriculum = 'him' | 'gesd';

const GRADES = [
  'Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8',
  'Form 1','Form 2','Form 3','Form 4',
];

const THEME = {
  him:  { accent: '#185fa5', pale: '#dbeafe', gradient: 'from-blue-700 to-blue-900',   badge: 'bg-blue-100 text-blue-700',  label: 'Hero In Me',                         sub: "Boys' Empowerment Programme",  emoji: '🦁', sex: 'M' },
  gesd: { accent: '#a82563', pale: '#fce7f3', gradient: 'from-pink-700 to-purple-900', badge: 'bg-pink-100 text-pink-700',  label: 'Girls Empowerment Self Defense',     sub: "Girls' Empowerment Programme", emoji: '🌸', sex: 'F' },
};

export const CurriculumPage: React.FC = () => {
  const [screen, setScreen]                   = useState<Screen>('home');
  const [curriculum, setCurriculum]           = useState<Curriculum>('him');
  const [lessonIndex, setLessonIndex]         = useState(0);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [quizScore, setQuizScore]             = useState(0);
  const [quizPassed, setQuizPassed]           = useState(false);
  const [completedAt, setCompletedAt]         = useState('');

  // Registration form
  const [regName,   setRegName]   = useState('');
  const [regSex,    setRegSex]    = useState('');
  const [regGrade,  setRegGrade]  = useState('');
  const [regError,  setRegError]  = useState('');

  const t = THEME[curriculum];

  /* ── Handlers ─────────────────────────────────────────────────── */
  const openRegister = (c: Curriculum) => {
    setCurriculum(c);
    setRegName(''); setRegSex(''); setRegGrade(''); setRegError('');
    // Pre-set sex restriction
    if (c === 'gesd') setRegSex('F');
    if (c === 'him')  setRegSex('M');
    setScreen('register');
  };

  const startCourse = () => {
    if (!regName.trim())  { setRegError('Please enter your full name.'); return; }
    if (!regSex)          { setRegError('Please select your sex.'); return; }
    if (!regGrade)        { setRegError('Please select your grade or form.'); return; }
    if (curriculum === 'gesd' && regSex !== 'F') { setRegError('The GESD programme is for female students only.'); return; }
    setRegError('');
    setLessonIndex(0);
    setCompletedLessons([]);
    setScreen('lessons');
  };

  const completeLesson = (idx: number) => {
    setCompletedLessons(prev => prev.includes(idx) ? prev : [...prev, idx]);
  };

  const handleQuizComplete = (score: number, passed: boolean) => {
    setQuizScore(score);
    setQuizPassed(passed);
    setCompletedAt(new Date().toISOString());
    setScreen('certificate');
  };

  /* ── Screens ──────────────────────────────────────────────────── */
  if (screen === 'lessons') return (
    <CourseLessonPage
      curriculum={curriculum}
      lessonIndex={lessonIndex}
      completedLessons={completedLessons}
      onComplete={completeLesson}
      onStartQuiz={() => setScreen('quiz')}
      onNextLesson={() => setLessonIndex(i => i + 1)}
      onPreviousLesson={() => setLessonIndex(i => Math.max(0, i - 1))}
    />
  );

  if (screen === 'quiz') return (
    <CourseQuizComponent
      curriculum={curriculum}
      studentName={regName}
      onComplete={handleQuizComplete}
      onBack={() => setScreen('lessons')}
    />
  );

  if (screen === 'certificate') return (
    <>
      {/* Result landing */}
      <div className="max-w-xl mx-auto text-center space-y-5 py-8">
        <div className="text-6xl">{quizPassed ? '🎉' : '📚'}</div>
        <h1 className="text-2xl font-bold text-black dark:text-white">
          {quizPassed ? 'Course Complete!' : 'Keep Studying'}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {quizPassed
            ? `Congratulations ${regName}! You scored ${quizScore}% and earned your certificate.`
            : `You scored ${quizScore}%. You need 80% to pass. Review the lessons and try again.`}
        </p>
        <div className="flex gap-3 justify-center">
          <Btn variant="secondary" onClick={() => setScreen('lessons')}>Back to Lessons</Btn>
          {quizPassed && (
            <Btn onClick={() => setScreen('certificate')}>View Certificate</Btn>
          )}
          {!quizPassed && (
            <Btn onClick={() => setScreen('quiz')}>Retake Quiz</Btn>
          )}
        </div>
      </div>

      {quizPassed && (
        <CertificateComponent
          studentName={regName}
          curriculum={curriculum}
          score={quizScore}
          completedAt={completedAt}
          grade={regGrade}
          sex={regSex}
          onClose={() => setScreen('home')}
        />
      )}
    </>
  );

  /* ── Registration Form ────────────────────────────────────────── */
  if (screen === 'register') return (
    <div className="max-w-md mx-auto py-8 animate-fade-in-up">
      {/* Course header */}
      <div className={`bg-gradient-to-br ${t.gradient} rounded-2xl p-6 text-white text-center mb-6 space-y-2`}>
        <div className="text-4xl">{t.emoji}</div>
        <h2 className="text-xl font-black tracking-wide">{t.label}</h2>
        <p className="text-sm opacity-80">{t.sub}</p>
      </div>

      <Card className="space-y-4">
        <div>
          <h3 className="font-bold text-base text-black dark:text-white">Register to Start</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Your details will appear on your certificate.</p>
        </div>

        <FInput
          label="Full Name *"
          value={regName}
          onChange={e => setRegName(e.target.value)}
          placeholder="e.g. Tiwonge Banda"
        />

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300 mb-1.5">Sex *</label>
          <div className="flex gap-3">
            {(['M', 'F'] as const).map(s => {
              const disabled = (curriculum === 'gesd' && s === 'M') || (curriculum === 'him' && s === 'F');
              return (
                <button
                  key={s}
                  type="button"
                  disabled={disabled}
                  onClick={() => !disabled && setRegSex(s)}
                  className={`flex-1 py-2.5 rounded-xl border-2 font-bold text-sm transition-all
                    ${regSex === s ? 'text-white' : 'text-slate-600 dark:text-slate-300'}
                    ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  style={{
                    borderColor: regSex === s ? t.accent : '#e5e7eb',
                    backgroundColor: regSex === s ? t.accent : 'transparent',
                  }}
                >
                  {s === 'M' ? '♂ Male' : '♀ Female'}
                </button>
              );
            })}
          </div>
          {curriculum === 'gesd' && (
            <p className="text-[11px] text-pink-600 dark:text-pink-400 mt-1.5">
              ⚠️ The GESD programme is open to female students only.
            </p>
          )}
        </div>

        <FSelect label="Grade / Form *" value={regGrade} onChange={e => setRegGrade(e.target.value)}>
          <option value="">Select your grade or form...</option>
          <optgroup label="Primary School">
            {GRADES.filter(g => g.startsWith('Grade')).map(g => <option key={g}>{g}</option>)}
          </optgroup>
          <optgroup label="Secondary School">
            {GRADES.filter(g => g.startsWith('Form')).map(g => <option key={g}>{g}</option>)}
          </optgroup>
        </FSelect>

        {regError && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl p-3 text-xs text-red-700 dark:text-red-400 font-semibold">
            ⚠️ {regError}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <Btn variant="secondary" onClick={() => setScreen('home')}>Back</Btn>
          <Btn className="flex-1" onClick={startCourse}>
            Start Course <ChevronRight size={14} className="ml-1" />
          </Btn>
        </div>
      </Card>
    </div>
  );

  /* ── Home Screen ──────────────────────────────────────────────── */
  return (
    <div className="space-y-8 animate-fade-in-up max-w-4xl mx-auto pb-12">
      {/* Page header */}
      <div>
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-orange-500 mb-1">ETT Programme</div>
        <h1 className="text-2xl font-bold text-black dark:text-white">Empowerment Training Curriculum</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Choose a course below. Complete all lessons and pass the quiz to earn your certificate.
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <BookOpen size={16} className="text-orange-500" />, label: 'Courses',  value: '2' },
          { icon: <Clock size={16} className="text-sky-500" />,        label: 'Sessions', value: '12' },
          { icon: <Award size={16} className="text-green-500" />,      label: 'Pass Mark', value: '80%' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-slate-800/50 border border-neutral-100 dark:border-slate-800">
            {s.icon}
            <div>
              <div className="text-base font-black text-black dark:text-white">{s.value}</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Course cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(['him', 'gesd'] as Curriculum[]).map(c => {
          const theme = THEME[c];
          const sessions = c === 'him'
            ? ['Getting to Know You', 'My Value System', 'Intro to H.I.M & Verbal Techniques', 'Step-Up Strategies', 'Referrals & Break the Silence', 'Boys & Girls Combined']
            : ['Getting to Know You', 'Intro to GESD', 'Awareness & Inner Voice', 'Verbal Techniques', 'Physical Techniques', 'Combined Class'];

          return (
            <div key={c} className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
              {/* Hero banner */}
              <div className={`bg-gradient-to-br ${theme.gradient} p-6 text-white`}>
                <div className="text-4xl mb-2">{theme.emoji}</div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${theme.badge} mb-2 inline-block`}>
                  {c === 'him' ? 'Boys Only' : 'Girls Only'}
                </span>
                <h2 className="text-xl font-black">{theme.label}</h2>
                <p className="text-sm opacity-80 mt-0.5">{theme.sub}</p>
              </div>

              {/* Content */}
              <div className="bg-white dark:bg-[#0f1623] p-5 space-y-4">
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><BookOpen size={12} /> 6 Sessions</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> ~6 Hours</span>
                  <span className="flex items-center gap-1"><Award size={12} /> Certificate</span>
                </div>

                {/* Sessions list */}
                <div className="space-y-1.5">
                  {sessions.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                        style={{ backgroundColor: theme.accent }}>
                        {i + 1}
                      </div>
                      {s}
                    </div>
                  ))}
                </div>

                {/* What you'll learn */}
                <div className="p-3 rounded-xl text-xs space-y-1" style={{ backgroundColor: theme.pale }}>
                  <div className="font-bold uppercase tracking-wide text-[10px]" style={{ color: theme.accent }}>What You'll Learn</div>
                  {c === 'him' ? (
                    <>
                      <div className="flex items-start gap-1.5 text-slate-700"><Star size={10} className="mt-0.5 shrink-0" style={{ color: theme.accent }} /> Child rights and personal values</div>
                      <div className="flex items-start gap-1.5 text-slate-700"><Star size={10} className="mt-0.5 shrink-0" style={{ color: theme.accent }} /> Hero in Me — turning negative to positive</div>
                      <div className="flex items-start gap-1.5 text-slate-700"><Star size={10} className="mt-0.5 shrink-0" style={{ color: theme.accent }} /> Step-Up, de-escalation and negotiation</div>
                      <div className="flex items-start gap-1.5 text-slate-700"><Star size={10} className="mt-0.5 shrink-0" style={{ color: theme.accent }} /> Breaking the silence and referral pathways</div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start gap-1.5 text-slate-700"><Star size={10} className="mt-0.5 shrink-0" style={{ color: theme.accent }} /> Self-empowerment, self-efficacy, self-defense</div>
                      <div className="flex items-start gap-1.5 text-slate-700"><Star size={10} className="mt-0.5 shrink-0" style={{ color: theme.accent }} /> I AM A.B.L.E — 4 signs of awareness</div>
                      <div className="flex items-start gap-1.5 text-slate-700"><Star size={10} className="mt-0.5 shrink-0" style={{ color: theme.accent }} /> Verbal and physical self-defense techniques</div>
                      <div className="flex items-start gap-1.5 text-slate-700"><Star size={10} className="mt-0.5 shrink-0" style={{ color: theme.accent }} /> Consent, gender equality and breaking silence</div>
                    </>
                  )}
                </div>

                <button
                  onClick={() => openRegister(c)}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white transition hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ backgroundColor: theme.accent }}>
                  {theme.emoji} Start {c === 'him' ? 'HIM' : 'GESD'} Course
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info note */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 text-xs text-amber-800 dark:text-amber-300">
        <strong>Note:</strong> The HIM course is for male students only. The GESD course is for female students only.
        You must complete all 6 lessons and score at least 80% on the quiz to receive a certificate.
      </div>
    </div>
  );
};
