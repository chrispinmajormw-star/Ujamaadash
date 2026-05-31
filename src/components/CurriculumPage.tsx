import React, { useState } from 'react';
import { BookOpen, Award, Layers, Sparkles, ChevronRight, HelpCircle, FileText, ExternalLink, Download, X } from 'lucide-react';
import { Card, Kicker, Btn, Modal } from './SubComponents';
import { Session } from '../types';
import { HIM_SESSIONS, GESD_SESSIONS } from '../data';

// ─── PDF VIEWER MODAL ────────────────────────
interface PdfViewerProps {
  url: string;
  title: string;
  onClose: () => void;
}
const PdfViewer: React.FC<PdfViewerProps> = ({ url, title, onClose }) => (
  <div className="fixed inset-0 z-[99999] flex flex-col bg-black/70">
    <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-[#0f1623] border-b border-slate-200 dark:border-slate-700 shrink-0">
      <div className="flex items-center gap-2">
        <FileText size={16} className="text-orange-500" />
        <span className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-[200px] sm:max-w-md">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <a
          href={url}
          download
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Download size={12} /> Download
        </a>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <ExternalLink size={12} /> Open
        </a>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
        >
          <X size={16} />
        </button>
      </div>
    </div>
    <div className="flex-1 overflow-hidden">
      <iframe
        src={`${url}#toolbar=1&view=FitH`}
        className="w-full h-full border-none"
        title={title}
      />
    </div>
  </div>
);

// ─── PDF DOCUMENTS CONFIG ────────────────────
// Add your PDF files to the /public folder and list them here
const PDF_DOCS = [
  {
    id: 'him-manual',
    title: 'HIM Facilitator Manual',
    description: 'Complete Hero In Me facilitator guide with all 6 topics, classroom activities, and trainer notes.',
    curriculum: 'him' as const,
    filename: 'him-manual.pdf', // place this file in /public
    pages: '48 pages',
    version: 'v2.1 — 2025'
  },
  {
    id: 'gesd-manual',
    title: 'GESD Facilitator Manual',
    description: 'Girls Empowerment & Safety Design full guide with session plans, SMEVB tools, and safety protocols.',
    curriculum: 'gesd' as const,
    filename: 'gesd-manual.pdf', // place this file in /public
    pages: '52 pages',
    version: 'v2.0 — 2025'
  },
  {
    id: 'combined-guide',
    title: 'Combined Session Guide',
    description: 'Topic 6 combined HIM + GESD session plan for joint graduation ceremonies and school safety charters.',
    curriculum: 'him' as const,
    filename: 'combined-session.pdf', // place this file in /public
    pages: '12 pages',
    version: 'v1.3 — 2025'
  },
];

export const CurriculumPage: React.FC = () => {
  const [tab, setTab] = useState<"him" | "gesd">("him");
  const [sel, setSel] = useState<Session | null>(null);
  const [pdfViewer, setPdfViewer] = useState<{ url: string; title: string } | null>(null);

  const sessions = tab === "him" ? HIM_SESSIONS : GESD_SESSIONS;
  const ac = tab === "him" ? "text-blue-600 dark:text-blue-400" : "text-pink-600 dark:text-pink-400";
  const borderCol = tab === "him" ? "border-blue-500 bg-blue-500" : "border-pink-500 bg-pink-500";
  const abg = tab === "him" ? "bg-blue-50 dark:bg-blue-950/20" : "bg-pink-50 dark:bg-pink-950/20";
  const badgeCol = tab === "him" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-350" : "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-350";
  const cardGradient = tab === "him"
    ? "from-[#e85d04] to-[#c44d00] text-white"
    : "from-[#0f1623] to-[#1a2540] text-white";

  const base = import.meta.env.BASE_URL || '/';
  const filteredDocs = PDF_DOCS.filter(d => d.curriculum === tab || d.id === 'combined-guide');

  const openPdf = (doc: typeof PDF_DOCS[0]) => {
    setPdfViewer({ url: `${base}${doc.filename}`, title: doc.title });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in-up">
      <div>
        <Kicker text="Digital Educational Panel" />
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight">
          Student Curriculums
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Explore structured lessons designed to empower girls and build constructive peer leadership among boys.
        </p>
      </div>

      <div className="flex border-b border-gray-200 dark:border-slate-700">
        {[
          ["him", "Hero in Me (HIM) — Boys"],
          ["gesd", "GESD — Girls"]
        ].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k as any)}
            className={`px-5 py-3 text-xs sm:text-sm font-bold cursor-pointer transition-all border-b-[3px] -mb-[2px] ${
              tab === k
                ? `${ac} border-orange-500`
                : "text-slate-400 border-transparent hover:text-slate-600"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Curriculum Banner */}
      <div className={`bg-gradient-to-br ${cardGradient} rounded-2xl p-6 text-white shadow-md relative overflow-hidden`}>
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/5" />
        <div className="relative space-y-3">
          <h2 className="text-lg sm:text-xl font-black m-0 leading-tight">
            {tab === "him" ? "Hero in Me (HIM) Framework" : "Girls Empowerment & Safety Design (GESD)"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl m-0">
            {tab === "him"
              ? "Empowers boys to challenge traditional, harmful gender paradigms, cultivate healthy emotional awareness, practice non-violent communication, and safely Step Up as leaders in their surrounding schools."
              : "An SGBV prevention curriculum blending boundary assertiveness, psychological threat awareness, voice defense, and strategic self-defense maneuvers to build girls' confidence and security across Malawi."}
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {(tab === "him" ? ["Boys Action", "6 Core Topics", "Bystander Steps", "Confidence & Care"] : ["Girls Action", "6 Core Sessions", "SMEVB Assertiveness", "Emergency Tools"]).map(t => (
              <span key={t} className="bg-white/10 dark:bg-black/25 text-white/90 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/10">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* PDF DOCUMENTS SECTION */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FileText size={16} className="text-orange-500" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white m-0">Curriculum Documents</h3>
          <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">PDF</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {filteredDocs.map(doc => (
            <div
              key={doc.id}
              className="bg-white dark:bg-[#0f1623] border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col gap-3 hover:border-orange-400 dark:hover:border-orange-600 transition cursor-pointer group"
              onClick={() => openPdf(doc)}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center shrink-0 border border-orange-100 dark:border-orange-900/40">
                  <FileText size={18} className="text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-tight mb-0.5">{doc.title}</h4>
                  <p className="text-[10px] text-slate-400 truncate">{doc.version} · {doc.pages}</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{doc.description}</p>
              <button className="flex items-center justify-center gap-1.5 w-full py-1.5 text-[11px] font-bold rounded-lg bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition border border-orange-100 dark:border-orange-900/40">
                <FileText size={12} /> View PDF
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Sessions Grid */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={16} className="text-orange-500" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white m-0">Session Breakdown</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((s, i) => (
            <div
              key={i}
              onClick={() => setSel(s)}
              className="bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1"
            >
              <div className="h-1" style={{ backgroundColor: tab === 'him' ? '#185fa5' : '#a82563' }} />
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className={`text-[10px] font-extrabold uppercase tracking-widest mb-1 ${ac}`}>
                    {s.num}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 line-clamp-1 mb-2">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {s.desc}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-800 text-[10.5px]">
                  <span className="text-slate-400 font-medium">Duration: {s.dur}</span>
                  <span className={`px-2.5 py-0.5 rounded font-bold hover:opacity-90 ${badgeCol}`}>
                    Details →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Session Detail Modal */}
      {sel && (
        <Modal title={`${sel.num}: ${sel.title}`} onClose={() => setSel(null)}>
          <div className="space-y-4 text-xs sm:text-sm">
            <div className={`${abg} p-4 rounded-xl border border-orange-100 dark:border-orange-900/30`}>
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                Lesson Concept Summary
              </div>
              <p className="text-slate-700 dark:text-slate-200 m-0 leading-relaxed italic">
                "{sel.desc}"
              </p>
            </div>
            <div className="flex gap-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${badgeCol}`}>
                Duration: {sel.dur}
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300">
                Type: Age-Appropriate GBV Prevention
              </span>
            </div>
            {sel.pledge !== null && (
              <div>
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                  Classroom Pledge / Chant
                </div>
                <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-xl border-l-[3px] border-orange-500 font-medium italic text-gray-700 dark:text-slate-300 space-y-1">
                  {sel.pledge.split("/").map((line, idx) => (
                    <div key={idx} className="leading-snug">{line.trim()}</div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                Learning Objectives / Targets
              </div>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 m-0">
                {sel.objectives.map((obj, i) => (
                  <li key={i} className="leading-relaxed">{obj}</li>
                ))}
              </ul>
            </div>
            <div className="text-[10px] text-slate-400 mt-4 leading-relaxed flex items-start gap-1">
              <HelpCircle size={14} className="shrink-0 text-slate-400 mt-0.5" />
              <span>All lessons comply with Malawi's National Primary School Curriculum safe space protocols.</span>
            </div>
          </div>
        </Modal>
      )}

      {/* PDF Viewer */}
      {pdfViewer && (
        <PdfViewer
          url={pdfViewer.url}
          title={pdfViewer.title}
          onClose={() => setPdfViewer(null)}
        />
      )}
    </div>
  );
};
