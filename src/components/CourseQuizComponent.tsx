import React, { useState, useEffect } from 'react';
import { Check, X, ChevronRight, AlertCircle } from 'lucide-react';
import { QuizQuestion } from '../types';
import { HIM_QUIZ_QUESTIONS, GESD_QUIZ_QUESTIONS } from '../data';
import { Card } from './SubComponents';

interface CourseQuizComponentProps {
  curriculum: 'him' | 'gesd';
  studentName: string;
  onComplete: (score: number, passed: boolean) => void;
  onBack: () => void;
}

export const CourseQuizComponent: React.FC<CourseQuizComponentProps> = ({
  curriculum,
  studentName,
  onComplete,
  onBack,
}) => {
  const allQuestions = curriculum === 'him' ? HIM_QUIZ_QUESTIONS : GESD_QUIZ_QUESTIONS;
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);

  const accent = curriculum === 'him' ? '#185fa5' : '#a82563';
  const accentPale = curriculum === 'him' ? '#dbeafe' : '#fce7f3';
  const badgeCol = curriculum === 'him'
    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
    : 'bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300';

  useEffect(() => {
    // Shuffle and select random questions
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(10, shuffled.length));
    setQuestions(selected);
  }, [curriculum]);

  const handleAnswerSelect = (optionIndex: number) => {
    if (!submitted) {
      setAnswers({
        ...answers,
        [currentQuestion]: optionIndex,
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / questions.length) * 100);
    const isPassed = percentage >= 80;

    setScore(percentage);
    setPassed(isPassed);
    setSubmitted(true);
  };

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block p-4 rounded-full mb-4" style={{ backgroundColor: accentPale }}>
            <AlertCircle size={24} style={{ color: accent }} />
          </div>
          <p className="text-slate-600 dark:text-slate-400">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return <SubmissionResult score={score} passed={passed} curriculum={curriculum} studentName={studentName} onContinue={() => onComplete(score, passed)} />;
  }

  const question = questions[currentQuestion];
  const selectedAnswer = answers[currentQuestion];
  const answered = selectedAnswer !== undefined;

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in-up pb-12">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full ${badgeCol}`} style={{ color: accent }}>
            Question {currentQuestion + 1} of {questions.length}
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {Object.keys(answers).length} answered
          </div>
        </div>
        <h1 className="text-xl font-bold text-black dark:text-white">Course Assessment</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Answer {questions.length} questions. Score 80% or higher to receive your certificate.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${((currentQuestion + 1) / questions.length) * 100}%`,
              backgroundColor: accent,
            }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-black dark:text-white">{question.question}</h2>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={submitted}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedAnswer === index
                  ? 'border-white bg-white dark:bg-[#0f1623]'
                  : 'border-neutral-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
              style={
                selectedAnswer === index
                  ? { backgroundColor: accentPale, borderColor: accent }
                  : {}
              }
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                  style={{
                    borderColor: selectedAnswer === index ? accent : '#d1d5db',
                    backgroundColor: selectedAnswer === index ? accent : 'transparent',
                  }}
                >
                  {selectedAnswer === index && <Check size={14} className="text-white" />}
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {option}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Explanation (if provided) */}
        {selectedAnswer !== undefined && question.explanation && !submitted && (
          <div
            className="p-4 rounded-lg border-l-4"
            style={{ backgroundColor: accentPale, borderColor: accent, color: accent }}
          >
            <p className="text-sm font-semibold mb-1">Explanation:</p>
            <p className="text-sm">{question.explanation}</p>
          </div>
        )}
      </Card>

      {/* Question Navigation Dots */}
      <div className="flex flex-wrap gap-2 justify-center">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentQuestion(i)}
            className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
              i === currentQuestion
                ? 'text-white'
                : answers[i] !== undefined
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
            style={
              i === currentQuestion
                ? { backgroundColor: accent, color: 'white' }
                : {}
            }
          >
            {answers[i] !== undefined ? <Check size={14} /> : i + 1}
          </button>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestion === 0}
          className="px-4 py-2.5 rounded-lg font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#e5e7eb', color: '#374151' }}
        >
          Previous
        </button>

        {currentQuestion < questions.length - 1 ? (
          <button
            onClick={handleNextQuestion}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm text-white transition hover:opacity-90"
            style={{ backgroundColor: accent }}
          >
            Next
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < questions.length}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: accent }}
          >
            Submit Quiz
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Answer Status */}
      <div className="text-center text-xs text-slate-500 dark:text-slate-400">
        {Object.keys(answers).length < questions.length && (
          <p>Answer all {questions.length} questions to submit.</p>
        )}
      </div>
    </div>
  );
};

interface SubmissionResultProps {
  score: number;
  passed: boolean;
  curriculum: 'him' | 'gesd';
  studentName: string;
  onContinue: () => void;
}

const SubmissionResult: React.FC<SubmissionResultProps> = ({
  score,
  passed,
  curriculum,
  studentName,
  onContinue,
}) => {
  const accent = curriculum === 'him' ? '#185fa5' : '#a82563';
  const accentPale = curriculum === 'him' ? '#dbeafe' : '#fce7f3';

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in-up pb-12">
      <div className="text-center space-y-6">
        {/* Result Icon */}
        <div
          className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
          style={{ backgroundColor: accentPale }}
        >
          {passed ? (
            <Check size={40} style={{ color: accent }} />
          ) : (
            <X size={40} style={{ color: '#ef4444' }} />
          )}
        </div>

        {/* Result Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            {passed ? '🎉 Congratulations!' : 'Keep Learning'}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {passed
              ? `${studentName}, you've earned your certificate!`
              : `${studentName}, you scored ${score}%. You need 80% to pass.`}
          </p>
        </div>

        {/* Score Display */}
        <Card className="p-6 space-y-3" style={{ backgroundColor: accentPale }}>
          <div className="text-5xl font-bold" style={{ color: accent }}>
            {score}%
          </div>
          <p className="text-sm" style={{ color: accent }}>
            {passed
              ? "Excellent work! You've mastered the course content."
              : `You need ${80 - score}% more to pass. Review the lessons and try again.`}
          </p>
        </Card>

        {/* CTA Button */}
        <button
          onClick={onContinue}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white text-sm transition hover:opacity-90 w-full"
          style={{ backgroundColor: accent }}
        >
          {passed ? 'Get Your Certificate' : 'Review Lessons'}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
