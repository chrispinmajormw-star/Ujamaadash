import React, { useState, useEffect } from 'react';
import { Check, X, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import { QuizQuestion } from '../types';
import { HIM_QUIZ_QUESTIONS, GESD_QUIZ_QUESTIONS } from '../data';
import { Card } from './SubComponents';

interface CourseQuizComponentProps {
  curriculum: 'him' | 'gesd';
  studentName: string;
  onComplete: (score: number, passed: boolean) => void;
  onBack: () => void;
  onReviewLessons?: () => void;
}

const THEME = {
  him:  { accent: '#185fa5', pale: '#dbeafe', badge: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' },
  gesd: { accent: '#a82563', pale: '#fce7f3', badge: 'bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300' },
};

export const CourseQuizComponent: React.FC<CourseQuizComponentProps> = ({
  curriculum, studentName, onComplete, onBack, onReviewLessons,
}) => {
  const allQuestions = curriculum === 'him' ? HIM_QUIZ_QUESTIONS : GESD_QUIZ_QUESTIONS;
  const [questions, setQuestions]           = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers]               = useState<Record<number, number>>({});
  const [revealed, setRevealed]             = useState<Record<number, boolean>>({});
  const [submitted, setSubmitted]           = useState(false);
  const [score, setScore]                   = useState(0);
  const [passed, setPassed]                 = useState(false);
  const { accent, pale, badge }             = THEME[curriculum];

  useEffect(() => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, Math.min(20, shuffled.length)));
    setCurrentQuestion(0);
    setAnswers({});
    setRevealed({});
    setSubmitted(false);
  }, [curriculum]);

  const handleAnswerSelect = (optionIndex: number) => {
    if (revealed[currentQuestion]) return; // already answered this question
    setAnswers(prev => ({ ...prev, [currentQuestion]: optionIndex }));
    setRevealed(prev => ({ ...prev, [currentQuestion]: true }));
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, i) => { if (answers[i] === q.correctAnswer) correct++; });
    const pct = Math.round((correct / questions.length) * 100);
    setScore(pct);
    setPassed(pct >= 80);
    setSubmitted(true);
  };

  if (questions.length === 0) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center space-y-3">
        <div className="inline-block p-4 rounded-full mb-4" style={{ backgroundColor: pale }}>
          <AlertCircle size={24} style={{ color: accent }} />
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          {allQuestions.length === 0
            ? 'No quiz questions are available for this programme yet.'
            : 'Loading quiz...'}
        </p>
        {allQuestions.length === 0 && (
          <button onClick={onBack} className="text-sm font-semibold underline" style={{ color: accent }}>
            Back to curriculum
          </button>
        )}
      </div>
    </div>
  );

  if (submitted) return (
    <SubmissionResult score={score} passed={passed} curriculum={curriculum}
      studentName={studentName} questions={questions} answers={answers}
      onContinue={() => passed ? onComplete(score, passed) : (onReviewLessons ? onReviewLessons() : onComplete(score, passed))}
      onRetry={() => {
        const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
        setQuestions(shuffled.slice(0, Math.min(20, shuffled.length)));
        setCurrentQuestion(0); setAnswers({}); setRevealed({}); setSubmitted(false);
      }} />
  );

  const question     = questions[currentQuestion];
  const selectedAns  = answers[currentQuestion];
  const isRevealed   = revealed[currentQuestion];
  const isCorrect    = selectedAns === question.correctAnswer;
  const answeredCount = Object.keys(answers).length;
  const isLast       = currentQuestion === questions.length - 1;

  return (
    <div className="space-y-5 max-w-3xl mx-auto animate-fade-in-up pb-12">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full ${badge}`} style={{ color: accent }}>
            Question {currentQuestion + 1} of {questions.length}
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {answeredCount} / {questions.length} answered
          </div>
        </div>
        <h1 className="text-xl font-bold text-black dark:text-white">Course Assessment</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Score 80% or higher to receive your certificate. Answers reveal immediately after selection.
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full transition-all duration-500 rounded-full"
          style={{ width: `${(answeredCount / questions.length) * 100}%`, backgroundColor: accent }} />
      </div>

      {/* Question */}
      <Card className="p-6 space-y-5">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>{question.topic}</div>
          <h2 className="text-base font-bold text-black dark:text-white leading-snug">{question.question}</h2>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, idx) => {
            let borderColor = '#e5e7eb';
            let bg = 'transparent';
            let textColor = '';
            const letters = ['A', 'B', 'C', 'D'];

            if (isRevealed) {
              if (idx === question.correctAnswer) {
                borderColor = '#16a34a'; bg = '#f0fdf4';
              } else if (idx === selectedAns && idx !== question.correctAnswer) {
                borderColor = '#dc2626'; bg = '#fef2f2';
              }
            } else if (selectedAns === idx) {
              borderColor = accent; bg = pale;
            }

            return (
              <button key={idx} onClick={() => handleAnswerSelect(idx)}
                disabled={isRevealed}
                className="w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 group"
                style={{ borderColor, backgroundColor: bg, cursor: isRevealed ? 'default' : 'pointer' }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-xs transition-all"
                  style={{
                    backgroundColor: isRevealed && idx === question.correctAnswer ? '#16a34a'
                      : isRevealed && idx === selectedAns ? '#dc2626'
                      : selectedAns === idx ? accent : '#e5e7eb',
                    color: (isRevealed || selectedAns === idx) ? 'white' : '#374151'
                  }}>
                  {isRevealed && idx === question.correctAnswer ? <Check size={13} />
                    : isRevealed && idx === selectedAns ? <X size={13} />
                    : letters[idx]}
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-snug">{option}</span>
              </button>
            );
          })}
        </div>

        {/* Instant feedback */}
        {isRevealed && (
          <div className={`p-4 rounded-xl border-l-4 ${isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-red-500 bg-red-50 dark:bg-red-950/20'}`}>
            <p className={`text-sm font-bold mb-1 ${isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
              {isCorrect ? '✅ Correct!' : `❌ Incorrect — the correct answer is: "${question.options[question.correctAnswer]}"`}
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{question.explanation}</p>
          </div>
        )}
      </Card>

      {/* Navigation dots */}
      <div className="flex flex-wrap gap-2 justify-center">
        {questions.map((_, i) => (
          <button key={i} onClick={() => setCurrentQuestion(i)}
            className="w-8 h-8 rounded-full text-xs font-bold transition-all flex items-center justify-center"
            style={{
              backgroundColor: i === currentQuestion ? accent
                : answers[i] !== undefined
                  ? (answers[i] === questions[i].correctAnswer ? '#16a34a' : '#dc2626')
                  : undefined,
              color: i === currentQuestion || answers[i] !== undefined ? 'white' : undefined,
            }}
            title={`Question ${i + 1}`}>
            {answers[i] !== undefined
              ? (answers[i] === questions[i].correctAnswer ? <Check size={12} /> : <X size={12} />)
              : i + 1}
          </button>
        ))}
      </div>

      {/* Bottom nav */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        <button onClick={() => setCurrentQuestion(q => Math.max(0, q - 1))}
          disabled={currentQuestion === 0}
          className="flex items-center gap-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition disabled:opacity-50 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          <ChevronLeft size={16} /> Previous
        </button>

        {isLast ? (
          <button onClick={handleSubmit}
            disabled={answeredCount < questions.length}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm text-white transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: accent }}>
            Submit Quiz <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={() => setCurrentQuestion(q => Math.min(questions.length - 1, q + 1))}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm text-white transition hover:opacity-90"
            style={{ backgroundColor: accent }}>
            Next <ChevronRight size={16} />
          </button>
        )}
      </div>

      {answeredCount < questions.length && (
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          {questions.length - answeredCount} question(s) remaining before you can submit.
        </p>
      )}
    </div>
  );
};

/* ─── Submission Result ────────────────────────────────────────────── */
interface SubmissionResultProps {
  score: number; passed: boolean; curriculum: 'him' | 'gesd';
  studentName: string; questions: QuizQuestion[]; answers: Record<number, number>;
  onContinue: () => void; onRetry: () => void;
}

const SubmissionResult: React.FC<SubmissionResultProps> = ({
  score, passed, curriculum, studentName, questions, answers, onContinue, onRetry,
}) => {
  const { accent, pale } = THEME[curriculum];
  const correct = questions.filter((q, i) => answers[i] === q.correctAnswer).length;

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in-up pb-12">
      <div className="text-center space-y-5">
        {/* Score circle */}
        <div className="w-28 h-28 rounded-full border-8 mx-auto flex flex-col items-center justify-center"
          style={{ borderColor: passed ? '#16a34a' : '#dc2626', backgroundColor: pale }}>
          <span className="text-3xl font-black" style={{ color: passed ? '#16a34a' : '#dc2626' }}>{score}%</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Score</span>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-black dark:text-white">
            {passed ? '🎉 Congratulations!' : '📚 Keep Learning'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {passed
              ? `${studentName}, you've earned your certificate!`
              : `${studentName}, you scored ${score}%. You need 80% to pass.`}
          </p>
        </div>

        <Card className="p-5 text-left" style={{ backgroundColor: pale }}>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-black text-green-600">{correct}</div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-black text-red-600">{questions.length - correct}</div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Wrong</div>
            </div>
            <div>
              <div className="text-2xl font-black" style={{ color: accent }}>{questions.length}</div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Total</div>
            </div>
          </div>
          {!passed && (
            <p className="text-xs text-center mt-3" style={{ color: accent }}>
              You need {80 - score}% more to pass. Review the lessons and try again.
            </p>
          )}
        </Card>

        {/* Review wrong answers */}
        {!passed && (
          <Card className="p-4 text-left space-y-3">
            <div className="text-xs font-bold uppercase tracking-wide text-red-600 mb-2">Questions to Review</div>
            {questions.map((q, i) => answers[i] !== q.correctAnswer ? (
              <div key={i} className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
                <div className="text-xs font-bold text-red-700 dark:text-red-400 mb-1">Q{i+1}: {q.question}</div>
                <div className="text-xs text-green-700 dark:text-green-400">✅ Correct: {q.options[q.correctAnswer]}</div>
                <div className="text-xs text-slate-500 mt-1 italic">{q.explanation}</div>
              </div>
            ) : null)}
          </Card>
        )}

        <div className="flex gap-3">
          {!passed && (
            <button onClick={onRetry}
              className="flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition hover:opacity-80"
              style={{ borderColor: accent, color: accent }}>
              Retake Quiz
            </button>
          )}
          <button onClick={onContinue}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition hover:opacity-90"
            style={{ backgroundColor: accent }}>
            {passed ? 'Get Certificate' : 'Review Lessons'} <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
