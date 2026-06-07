import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, CheckCircle2, BookOpen,
  AlertCircle, Zap
} from 'lucide-react';
import { Session } from '../types';
import { HIM_SESSIONS, GESD_SESSIONS } from '../data';
import { Card } from './SubComponents';

interface CourseLessonPageProps {
  curriculum: 'him' | 'gesd';
  lessonIndex: number;
  onComplete: (lessonIndex: number) => void;
  onStartQuiz: () => void;
  completedLessons: number[];
}

export const CourseLessonPage: React.FC<CourseLessonPageProps> = ({
  curriculum,
  lessonIndex,
  onComplete,
  onStartQuiz,
  completedLessons,
}) => {
  const sessions = curriculum === 'him' ? HIM_SESSIONS : GESD_SESSIONS;
  const lesson = sessions[lessonIndex];
  const totalLessons = sessions.length;
  const isLast = lessonIndex === totalLessons - 1;
  const isCompleted = completedLessons.includes(lessonIndex);

  const accent = curriculum === 'him' ? '#185fa5' : '#a82563';
  const accentPale = curriculum === 'him' ? '#dbeafe' : '#fce7f3';
  const accentText = curriculum === 'him' ? 'text-blue-600 dark:text-blue-400' : 'text-pink-600 dark:text-pink-400';
  const badgeCol = curriculum === 'him'
    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
    : 'bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300';

  const handleNext = () => {
    if (!isCompleted) {
      onComplete(lessonIndex);
    }
    if (!isLast) {
      // Navigate to next lesson (handled by parent)
    } else if (isLast && isCompleted) {
      onStartQuiz();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in-up pb-12">
      {/* Lesson Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div
            className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full ${badgeCol}`}
            style={{ color: accent }}
          >
            Lesson {lessonIndex + 1} of {totalLessons}
          </div>
          {isCompleted && (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-bold">
              <CheckCircle2 size={14} /> Completed
            </div>
          )}
        </div>
        <h1 className="text-2xl font-bold text-black dark:text-white">{lesson.title}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">{lesson.desc}</p>
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <BookOpen size={12} />
          <span>{lesson.dur}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          Progress: {completedLessons.length + (isCompleted ? 0 : 0)} of {totalLessons} lessons completed
        </div>
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300"
            style={{ 
              width: `${((completedLessons.length) / totalLessons) * 100}%`,
              backgroundColor: accent 
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Lesson Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Lesson Content */}
          <Card className="p-5 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-black dark:text-white mb-3">Lesson Content</h2>
              <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {lesson.content || lesson.desc}
              </div>
            </div>
          </Card>

          {/* Activities */}
          {lesson.activities && lesson.activities.length > 0 && (
            <Card className="p-5 space-y-3">
              <h2 className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
                <Zap size={14} className={accentText} />
                Activities
              </h2>
              <div className="space-y-2">
                {lesson.activities.map((activity, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold text-white"
                      style={{ backgroundColor: accent }}
                    >
                      {i + 1}
                    </div>
                    <span className="text-slate-700 dark:text-slate-300">{activity}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Key Takeaways */}
          {lesson.keyTakeaways && lesson.keyTakeaways.length > 0 && (
            <Card className="p-5 space-y-3">
              <h2 className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
                <AlertCircle size={14} className={accentText} />
                Key Takeaways
              </h2>
              <div className="space-y-2">
                {lesson.keyTakeaways.map((takeaway, i) => (
                  <div
                    key={i}
                    className="px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300"
                    style={{ backgroundColor: accentPale }}
                  >
                    • {takeaway}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Pledge */}
          {lesson.pledge && (
            <Card className="p-5 space-y-3">
              <h2 className="text-sm font-bold text-black dark:text-white">Class Pledge</h2>
              <div
                className="rounded-lg p-4 border-l-[3px] text-sm font-medium leading-relaxed space-y-2"
                style={{ borderColor: accent, backgroundColor: accentPale, color: accent }}
              >
                {lesson.pledge.split('/').map((line, idx) => (
                  <div key={idx}>{line.trim()}</div>
                ))}
              </div>
            </Card>
          )}

          {/* Objectives */}
          {lesson.objectives && lesson.objectives.length > 0 && (
            <Card className="p-5 space-y-3">
              <h2 className="text-sm font-bold text-black dark:text-white">Learning Objectives</h2>
              <div className="space-y-2">
                {lesson.objectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: accentPale }}
                    >
                      <span className="text-[9px] font-bold" style={{ color: accent }}>
                        {i + 1}
                      </span>
                    </div>
                    <span className="text-slate-700 dark:text-slate-300">{obj}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right: Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Lesson Navigation */}
          <Card className="p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              All Lessons
            </h3>
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {sessions.map((s, i) => {
                const lessonCompleted = completedLessons.includes(i);
                return (
                  <div
                    key={i}
                    className={`p-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      i === lessonIndex
                        ? 'text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    style={{
                      backgroundColor: i === lessonIndex ? accent : 'transparent'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {lessonCompleted && <CheckCircle2 size={12} className="text-green-500" />}
                      <span className="flex-1 line-clamp-2">{s.title}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Completion Status */}
          <Card className="p-4 space-y-3" style={{ backgroundColor: accentPale }}>
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>
              Lesson Status
            </h3>
            {isCompleted ? (
              <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: accent }}>
                <CheckCircle2 size={16} />
                You've completed this lesson
              </div>
            ) : (
              <p className="text-xs leading-relaxed" style={{ color: accent }}>
                Finish reading the lesson content and click "Mark as Complete" below.
              </p>
            )}
          </Card>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          disabled={lessonIndex === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
          style={{
            backgroundColor: accent,
            color: 'white'
          }}
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Lesson {lessonIndex + 1} of {totalLessons}
        </div>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition hover:opacity-90 text-white"
          style={{ backgroundColor: accent }}
        >
          {isLast && isCompleted ? (
            <>
              Start Quiz
              <ChevronRight size={16} />
            </>
          ) : isLast ? (
            <>
              Mark as Complete & Start Quiz
              <ChevronRight size={16} />
            </>
          ) : (
            <>
              {isCompleted ? 'Next Lesson' : 'Mark as Complete & Continue'}
              <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
