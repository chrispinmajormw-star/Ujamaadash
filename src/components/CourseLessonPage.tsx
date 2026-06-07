
import React from 'react';
import {
  ChevronLeft, ChevronRight, CheckCircle2, BookOpen,
  AlertCircle, Zap, MessageSquare, Shield, Lightbulb,
  Table2, Grid, Megaphone, Phone
} from 'lucide-react';
import { Session, ContentBlock } from '../types';
import { HIM_SESSIONS, GESD_SESSIONS } from '../data';
import { Card } from './SubComponents';

interface CourseLessonPageProps {
  curriculum: 'him' | 'gesd';
  lessonIndex: number;
  onComplete: (lessonIndex: number) => void;
  onStartQuiz: () => void;
  onNextLesson: () => void;
  onPreviousLesson: () => void;
  onGoToLesson: (index: number) => void;
  completedLessons: number[];
}

/* ─── Colour scheme per curriculum ─────────────────────────────────── */
const THEME = {
  him:  { accent: '#185fa5', pale: '#dbeafe', badge: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',  text: 'text-blue-600 dark:text-blue-400'  },
  gesd: { accent: '#a82563', pale: '#fce7f3', badge: 'bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300', text: 'text-pink-600 dark:text-pink-400'  },
};

/* ─── Content Block Renderers ───────────────────────────────────────── */
const RenderBlock: React.FC<{ block: ContentBlock; accent: string; pale: string }> = ({ block, accent, pale }) => {
  switch (block.type) {

    case 'paragraph':
      return (
        <div className="mb-3">
          {block.title && <h4 className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: accent }}>{block.title}</h4>}
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{block.content}</p>
        </div>
      );

    case 'trainer_says':
      return (
        <div className="my-3 rounded-r-xl border-l-4 p-4" style={{ borderColor: accent, backgroundColor: pale + '80' }}>
          <div className="flex items-center gap-2 mb-1.5">
            <MessageSquare size={13} style={{ color: accent }} />
            <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: accent }}>{block.label || 'Trainer Says'}</span>
          </div>
          <p className="text-sm italic text-slate-700 dark:text-slate-300 leading-relaxed">{block.content}</p>
        </div>
      );

    case 'activity':
      return (
        <div className="my-3 rounded-xl border p-4" style={{ borderColor: accent + '40', backgroundColor: accent + '08' }}>
          <div className="flex items-center gap-2 mb-2">
            <Zap size={13} style={{ color: accent }} />
            <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: accent }}>{block.label}</span>
          </div>
          {block.content && <p className="text-sm text-slate-700 dark:text-slate-300 mb-2 leading-relaxed">{block.content}</p>}
          {block.items && (
            <ul className="space-y-1.5">
              {block.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: accent }}>{i + 1}</div>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      );

    case 'definition':
      return (
        <div className="my-3 rounded-xl border-2 p-4 text-center" style={{ borderColor: accent + '60', backgroundColor: pale + '60' }}>
          <div className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: accent }}>DEFINITION</div>
          {block.title && <div className="text-lg font-black mb-1" style={{ color: accent }}>{block.title}</div>}
          {block.content && <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{block.content}</p>}
        </div>
      );

    case 'tip':
      return (
        <div className="my-3 rounded-r-xl border-l-4 p-3 border-green-400 bg-green-50 dark:bg-green-950/20">
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb size={13} className="text-green-600" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-green-700 dark:text-green-400">{block.label || 'Tip'}</span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{block.content}</p>
        </div>
      );

    case 'scenario':
      return (
        <div className="my-2 rounded-lg border p-3" style={{ borderColor: accent + '30', backgroundColor: accent + '05' }}>
          {block.label && <div className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: accent }}>{block.label}</div>}
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{block.content}</p>
        </div>
      );

    case 'table':
      return (
        <div className="my-4 overflow-x-auto">
          {block.label && <div className="text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: accent }}>{block.label}</div>}
          <table className="w-full text-xs border-collapse rounded-lg overflow-hidden">
            {block.headers && (
              <thead>
                <tr>
                  {block.headers.map((h, i) => (
                    <th key={i} className="px-3 py-2 text-left font-bold text-white text-[10px] uppercase tracking-wide" style={{ backgroundColor: accent }}>{h}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {block.rows?.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-neutral-50 dark:bg-slate-800/30' : ''}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 text-slate-700 dark:text-slate-300 border-b border-neutral-100 dark:border-slate-800">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'values_grid':
      return (
        <div className="my-3 grid grid-cols-2 gap-3">
          {block.columns?.map((col, i) => (
            <div key={i} className="rounded-xl border-2 p-3" style={{ borderColor: accent + '40' }}>
              <div className="text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: accent }}>{col.title}</div>
              <ul className="space-y-1">
                {col.items.map((item, j) => (
                  <li key={j} className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />{item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );

    case 'step_grid':
      return (
        <div className="my-3">
          {block.label && <div className="text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: accent }}>{block.label}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {block.steps?.map((step, i) => (
              <div key={i} className="flex gap-2 items-start rounded-lg p-2.5" style={{ backgroundColor: pale + '70' }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold text-white" style={{ backgroundColor: accent }}>{i + 1}</div>
                <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'pledge':
      return (
        <div className="my-3 rounded-xl border p-4" style={{ borderColor: accent, backgroundColor: pale + '80' }}>
          <div className="text-[10px] font-extrabold uppercase tracking-widest mb-2 text-center" style={{ color: accent }}>CLASS PLEDGE</div>
          <div className="text-sm font-medium leading-loose text-center" style={{ color: accent }}>
            {block.content?.split('\n').map((line, i) => <div key={i}>{line}</div>)}
          </div>
        </div>
      );

    case 'cheer':
      return (
        <div className="my-3 rounded-xl p-4 text-center" style={{ backgroundColor: accent, color: '#fff' }}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Megaphone size={14} />
            <span className="text-[10px] font-extrabold uppercase tracking-widest">{block.label}</span>
          </div>
          <p className="text-sm font-semibold leading-relaxed whitespace-pre-line">{block.content}</p>
        </div>
      );

    case 'helpline':
      return (
        <div className="my-3 rounded-xl border-2 border-red-400 bg-red-50 dark:bg-red-950/20 p-3 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Phone size={13} className="text-red-600" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-700">{block.label}</span>
          </div>
          <p className="text-sm font-bold text-red-700 dark:text-red-400">{block.content}</p>
        </div>
      );

    default:
      return null;
  }
};

/* ─── Main Component ────────────────────────────────────────────────── */
export const CourseLessonPage: React.FC<CourseLessonPageProps> = ({
  curriculum, lessonIndex, onComplete, onStartQuiz, onNextLesson, onPreviousLesson, onGoToLesson, completedLessons,
}) => {
  const sessions = curriculum === 'him' ? HIM_SESSIONS : GESD_SESSIONS;
  const lesson = sessions[lessonIndex];
  const totalLessons = sessions.length;
  const isLast = lessonIndex === totalLessons - 1;
  const isCompleted = completedLessons.includes(lessonIndex);
  const { accent, pale, badge, text } = THEME[curriculum];

  const handleNext = () => {
    if (!isCompleted) onComplete(lessonIndex);
    if (isLast) {
      onStartQuiz();
    } else {
      onNextLesson();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in-up pb-12">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full ${badge}`} style={{ color: accent }}>
            {lesson.num} of {totalLessons}
          </div>
          {isCompleted && (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-bold">
              <CheckCircle2 size={14} /> Completed
            </div>
          )}
        </div>
        <h1 className="text-2xl font-bold text-black dark:text-white">{lesson.title}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">{lesson.desc}</p>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <BookOpen size={12} /><span>{lesson.dur}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">{completedLessons.length} of {totalLessons} lessons completed</div>
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full transition-all duration-300 rounded-full" style={{ width: `${(completedLessons.length / totalLessons) * 100}%`, backgroundColor: accent }} />
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — lesson content */}
        <div className="lg:col-span-2 space-y-4">

          {/* Objectives */}
          {lesson.objectives?.length > 0 && (
            <Card className="p-5 space-y-3">
              <h2 className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
                <AlertCircle size={14} className={text} /> Learning Objectives
              </h2>
              <div className="space-y-2">
                {lesson.objectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: pale }}>
                      <span className="text-[9px] font-bold" style={{ color: accent }}>{i + 1}</span>
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{obj}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Rich content blocks */}
          {lesson.content && lesson.content.length > 0 && (
            <Card className="p-5 space-y-2">
              <h2 className="text-sm font-bold text-black dark:text-white mb-3">Lesson Content</h2>
              {typeof lesson.content === 'string' ? (
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{lesson.content}</p>
              ) : Array.isArray(lesson.content) ? (
                lesson.content.map((block: any, i: number) => (
                  <RenderBlock key={i} block={block} accent={accent} pale={pale} />
                ))
              ) : null}
            </Card>
          )}

          {/* Pledge */}
          {lesson.pledge && (
            <Card className="p-5">
              <h2 className="text-sm font-bold text-black dark:text-white mb-3">Class Pledge</h2>
              <div className="rounded-xl border-l-4 p-4 font-medium leading-loose space-y-1" style={{ borderColor: accent, backgroundColor: pale + '80', color: accent }}>
                {lesson.pledge.split('/').map((line, i) => <div key={i}>{line.trim()}</div>)}
              </div>
            </Card>
          )}

          {/* Key Takeaways */}
          {lesson.keyTakeaways && lesson.keyTakeaways.length > 0 && (
            <Card className="p-5 space-y-3">
              <h2 className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
                <Zap size={14} className={text} /> Key Takeaways
              </h2>
              {lesson.keyTakeaways.map((t, i) => (
                <div key={i} className="px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300" style={{ backgroundColor: pale }}>
                  • {t}
                </div>
              ))}
            </Card>
          )}
        </div>

        {/* Right — sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* All lessons list */}
          <Card className="p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">All Lessons</h3>
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {sessions.map((s, i) => {
                const done = completedLessons.includes(i);
                const canAccess = i === 0 || completedLessons.includes(i - 1) || i === lessonIndex;
                return (
                  <div
                    key={i}
                    onClick={() => {
                      if (canAccess && i !== lessonIndex) {
                        onGoToLesson(i);
                      }
                    }}
                    className={`p-2.5 rounded-lg text-xs font-medium transition-all ${canAccess ? 'cursor-pointer' : 'cursor-not-allowed'} ${i === lessonIndex ? 'text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    style={{ backgroundColor: i === lessonIndex ? accent : 'transparent', opacity: !canAccess ? 0.4 : 1 }}
                  >
                    <div className="flex items-center gap-2">
                      {done && <CheckCircle2 size={12} className="text-green-500 shrink-0" />}
                      <span className="flex-1 line-clamp-2">{s.title}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Status card */}
          <Card className="p-4 space-y-3" style={{ backgroundColor: pale }}>
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>Lesson Status</h3>
            {isCompleted ? (
              <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: accent }}>
                <CheckCircle2 size={16} /> You've completed this lesson
              </div>
            ) : (
              <p className="text-xs leading-relaxed" style={{ color: accent }}>
                Read through the lesson content, then click "Mark as Complete" below to continue.
              </p>
            )}
          </Card>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={onPreviousLesson}
          disabled={lessonIndex === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 text-white"
          style={{ backgroundColor: accent }}
        >
          <ChevronLeft size={16} /> Previous
        </button>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {lessonIndex + 1} / {totalLessons}
        </div>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition hover:opacity-90 text-white"
          style={{ backgroundColor: accent }}
        >
          {isLast && isCompleted ? 'Start Quiz' : isLast ? 'Mark Complete & Start Quiz' : isCompleted ? 'Next Lesson' : 'Mark Complete & Continue'}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};