import React, { useState, useEffect } from 'react';
import {
  BookOpen, ChevronRight, ChevronLeft, HelpCircle,
  FileText, ExternalLink, X, Maximize2, Layers,
  Shield, Users, Star, ArrowRight
} from 'lucide-react';
import { Card, Kicker } from './SubComponents';
import { Session } from '../types';
import { HIM_SESSIONS, GESD_SESSIONS } from '../data';

// ─── PRESENTATION PDF VIEWER ─────────────────
interface PdfViewerProps {
  url: string;
  title: string;
  subtitle: string;
  onClose: () => void;
}
const PdfViewer: React.FC<PdfViewerProps> = ({ url, title, subtitle, onClose }) => {
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[99999] bg-black/90 flex flex-col">
      {/* Presentation top bar */}
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
            onClick={() => setFullscreen(f => !f)}
            className="w-7 h-7 flex items-center justify-center rounded border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            title="Toggle fullscreen"
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

      {/* PDF viewer — iframe on desktop, Google Docs viewer on mobile */}
      <div className="flex-1 bg-[#1a1a2e] overflow-hidden">
        <PdfEmbed url={url} title={title} />
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

  return (
    <div className="space-y-5 max-w-5xl mx-auto animate-fade-in-up">

      {/* Header */}
      <div>
        <Kicker text="Digital Educational Panel" />
        <h1 className="text-base font-bold text-black dark:text-white m-0">Student Curriculums</h1>
        <p className="text-xs text-black dark:text-white opacity-70 mt-1">
          Structured lessons designed to empower girls and build constructive peer leadership among boys.
        </p>
      </div>

      {/* Tab switcher — matches app FilterBar style */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg w-fit border border-neutral-200 dark:border-slate-800">
        {([['him', 'Hero In Me (HIM)', Shield], ['gesd', 'GESD — Girls', Users]] as const).map(([k, l, Icon]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
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
