import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { documentReportsApi } from '../api';
import { Card, PageHeader, Btn, FInput, FArea, Modal } from './SubComponents';
import { Inbox, Send, Upload, Download, CheckCircle, XCircle, FileText, Eye, ExternalLink, Trash2, BarChart2, AlertTriangle, Mail, Map, Shield} from 'lucide-react';

const BASE_URL = 'https://13.61.100.62.nip.io';

interface DocumentReportsPageProps {
  user: User | null;
  showToast: (msg: string) => void;
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Pending',  color: '#92400e', bg: '#fef9c3' },
  reviewed: { label: 'Reviewed', color: '#1e40af', bg: '#dbeafe' },
  approved: { label: 'Approved', color: '#065f46', bg: '#dcfce7' },
  rejected: { label: 'Rejected', color: '#991b1b', bg: '#fee2e2' },
};

const RECIPIENT_LABEL: Record<string, string> = {
  tot: 'District Coordinator',
  sasa_officer: 'System Admin',
  data_entry: 'System Admin',
  district_coordinator: 'Program Manager',
};

const canSubmit  = (role: string) => ['tot', 'sasa_officer', 'data_entry', 'district_coordinator'].includes(role);
const canDelete  = (role: string) => ['admin', 'program_manager', 'district_coordinator', 'sasa_officer'].includes(role);
const canReceive = (role: string) => ['district_coordinator', 'program_manager', 'admin'].includes(role);

const isPdf  = (name: string) => name?.toLowerCase().endsWith('.pdf');
const isDocx = (name: string) => name?.toLowerCase().match(/\.(doc|docx)$/);

// ─── Document Viewer Modal ────────────────────────────────────────────────────
const DocViewer: React.FC<{ report: any; onClose: () => void }> = ({ report, onClose }) => {
  const fileName = report.file_name || report.file_path || '';
  const fileUrl = `${BASE_URL}${report.file_path}`;

  // Google Docs viewer works for both PDF and DOCX without auth
  const googleViewerUrl =
  `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;

  return (
    <Modal title={report.title} onClose={onClose} width={900}>
      <div className="space-y-3">
        {/* File info bar */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <FileText size={13} className="text-[var(--brand-500)]" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">{report.file_name}</span>
            <span>·</span>
            <span>From <strong>{report.sender_name}</strong></span>
            <span>·</span>
            <span>{new Date(report.created_at).toLocaleDateString()}</span>
          </div>
          <a
            href={fileUrl}
            download={report.file_name}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[var(--brand-400)] text-slate-700 dark:text-slate-300 transition"
          >
            <Download size={12} /> Download
          </a>
        </div>

        {/* Viewer — Google Docs Viewer embeds both PDF and DOCX */}
      <div
        className="w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700"
        style={{ height: '65vh' }}>
        {isPdf(fileName) ? (
        <iframe
         src={fileUrl}
         className="w-full h-full"
         title={report.title}
         />
         ) : (
        <iframe
         src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
          className="w-full h-full"
          frameBorder="0"
          title={report.title}
        />
       )}
      </div>

        <p className="text-[10px] text-slate-400 text-center">
          Google Docs Viewer · If the document doesn't load,{' '}
          <a href={fileUrl} download className="text-[var(--brand-500)] underline">download it directly</a>
        </p>
      </div>
    </Modal>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const DocumentReportsPage: React.FC<DocumentReportsPageProps> = ({ user, showToast }) => {
  const [tab, setTab]           = useState<'inbox' | 'sent' | 'submit'>('inbox');
  const [inbox, setInbox]       = useState<any[]>([]);
  const [sent, setSent]         = useState<any[]>([]);
  const [loading, setLoading]   = useState(false);
  const [reviewing, setReviewing] = useState<any | null>(null);
  const [viewing, setViewing]   = useState<any | null>(null);
  const [feedback, setFeedback] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Submit form
  const [title, setTitle]         = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile]           = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const role = user?.role || '';

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      canReceive(role) ? documentReportsApi.getInbox() : Promise.resolve([]),
      canSubmit(role)  ? documentReportsApi.getSent()  : Promise.resolve([]),
    ]).then(([inboxData, sentData]) => {
      if (Array.isArray(inboxData)) setInbox(inboxData);
      if (Array.isArray(sentData))  setSent(sentData);
      setLoading(false);
    });
  }, [user]);

  const handleSubmit = async () => {
    if (!title || !file) { showToast('Title and file are required', 'warning'); return; }
    setSubmitting(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('file', file);
 try {
 const data = await documentReportsApi.submit(formData);
 if (data.error) { showToast(`️ ${data.error}`, 'warning'); setSubmitting(false); return; }
 showToast(`Report submitted to ${RECIPIENT_LABEL[role]}`, 'success');
 setSent(prev => [data, ...prev]);
 setTitle(''); setDescription(''); setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      setTab('sent');
    } catch {
      showToast('Failed to submit report', 'warning');
 }
 setSubmitting(false);
 };

 const handleUpdateStatus = async (id: number, status: string) => {
 const data = await documentReportsApi.updateStatus(id, status, feedback);
 if (data.error) { showToast(`️ ${data.error}`, 'warning'); return; }
 setInbox(prev => prev.map(r => r.id === id ? { ...r, status, feedback } : r));
 showToast(`Report marked as ${status}`);
 setReviewing(null);
 setFeedback('');
 };

 const handleDelete = async () => {
 if (!deleteId) return;
 setDeleting(true);
 try {
 const data = await documentReportsApi.delete(deleteId);
 if (data?.error) { showToast(`️ ${data.error}`, 'warning'); setDeleting(false); return; }
 setInbox(prev => prev.filter(r => r.id !== deleteId));
 setSent(prev => prev.filter(r => r.id !== deleteId));
 showToast('Report deleted', 'success');
      setDeleteId(null);
    } catch {
      showToast('Failed to delete report', 'warning');
    }
    setDeleting(false);
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '';
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(0)} KB`
      : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const TABS = [
    ...(canReceive(role) ? [{ id: 'inbox',  label: 'Inbox',         icon: <Inbox size={14}/>,  count: inbox.filter(r => r.status === 'pending').length }] : []),
    ...(canSubmit(role)  ? [{ id: 'sent',   label: 'Sent',          icon: <Send size={14}/>  },
                             { id: 'submit', label: 'Submit Report', icon: <Upload size={14}/> }] : []),
  ] as any[];

  if (!user) return <div className="p-12 text-center text-black/40 dark:text-white/40">Sign in to access this page.</div>;

  // ─── Report card ───────────────────────────────────────────────────────────
  const ReportCard = ({ r, showReview }: { r: any; showReview?: boolean }) => (
    <Card key={r.id} className="p-4">
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <FileText size={14} className="text-[var(--brand-500)] shrink-0" />
            <span className="font-bold text-sm text-black dark:text-white">{r.title}</span>
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ color: STATUS_CFG[r.status]?.color, background: STATUS_CFG[r.status]?.bg }}
            >
              {STATUS_CFG[r.status]?.label}
            </span>
          </div>
          <div className="text-[11px] text-black/60 dark:text-white/60 mb-1">
            {showReview
              ? <>From: <strong>{r.sender_name}</strong> · {r.district} · {new Date(r.created_at).toLocaleDateString()}</>
              : <>To: <strong>{RECIPIENT_LABEL[role]}</strong> · {new Date(r.created_at).toLocaleDateString()}</>
            }
          </div>
          {r.sender_role && (
            <div className="text-[10px] text-[var(--brand-600)] font-semibold mb-1">
              {r.sender_role === 'sasa_officer'          ? 'From SASA Officer' :
               r.sender_role === 'district_coordinator'  ? 'From District Coordinator' :
               r.sender_role === 'program_manager'       ? 'Forwarded by Manager' : ''}
 </div>
 )}
 {r.description && <p className="text-xs text-black/70 dark:text-white/70 mb-1">{r.description}</p>}
 {r.feedback && (
 <div className="mt-1 text-xs text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 rounded p-2">
 Feedback: {r.feedback}
 </div>
 )}
 </div>

 {/* Action buttons */}
 <div className="flex flex-col gap-1.5 shrink-0">
 {/* View button — opens in-app viewer */}
 {r.file_name && (
 <button
 onClick={() => {
 console.log('REPORT', r);
              setViewing(r);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--brand-50)] dark:bg-[var(--brand-950)]/20 border border-[var(--brand-200)] dark:border-[var(--brand-800)] text-[var(--brand-700)] dark:text-[var(--brand-400)] hover:bg-[var(--brand-100)] transition"
            >
              <Eye size={12}/> View Document
            </button>
          )}
          {/* Download button */}
          {r.file_name && (
            <a
              href={`${BASE_URL}${r.file_path}`}
              download={r.file_name}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[var(--brand-400)] text-slate-600 dark:text-slate-300 transition"
            >
              <Download size={12}/> Download
            </a>
          )}
          {/* Review button (inbox only, pending only) */}
          {showReview && r.status === 'pending' && (
            <Btn size="sm" variant="secondary" onClick={() => setReviewing(r)}>
              Review & Decide
            </Btn>
          )}
          {/* Delete button — privileged roles only */}
          {canDelete(role) && (
            <button
              onClick={() => setDeleteId(r.id)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
            >
              <Trash2 size={12}/> Delete
            </button>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div>
      <PageHeader
        title="Document Reports"
        subtitle="Submit and receive district programme reports"
      />

      {/* Tab bar */}
      <div className="flex gap-1 mb-5 border-b border-neutral-200 dark:border-slate-800 pb-0">
        {TABS.map((t: any) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t-lg border-b-2 transition-all -mb-px ${
              tab === t.id
                ? 'border-[var(--brand-500)] text-[var(--brand-600)] dark:text-[var(--brand-400)] bg-[var(--brand-50)] dark:bg-[var(--brand-950)]/20'
                : 'border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'
            }`}
          >
            {t.icon}{t.label}
            {t.count > 0 && (
              <span className="ml-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* INBOX */}
      {tab === 'inbox' && (
        <div className="space-y-2">
          {loading && <div className="text-center py-8 text-sm text-black/40">Loading...</div>}
          {!loading && inbox.length === 0 && (
            <div className="text-center py-12 text-sm text-black/40">No reports received yet.</div>
          )}
          {inbox.map(r => <ReportCard key={r.id} r={r} showReview />)}
        </div>
      )}

      {/* SENT */}
      {tab === 'sent' && (
        <div className="space-y-2">
          {loading && <div className="text-center py-8 text-sm text-black/40">Loading...</div>}
          {!loading && sent.length === 0 && (
            <div className="text-center py-12 text-sm text-black/40">No reports submitted yet.</div>
          )}
          {sent.map(r => <ReportCard key={r.id} r={r} />)}
        </div>
      )}

      {/* SUBMIT */}
      {tab === 'submit' && (
        <Card className="max-w-xl">
          <div className="mb-4">
            <p className="text-xs text-black/60 dark:text-white/60">
              Your report will be sent to: <strong className="text-[var(--brand-600)]">{RECIPIENT_LABEL[role]}</strong>
            </p>
          </div>
          <FInput
            label="Report Title *"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Lilongwe District Monthly Report — May 2026"
          />
          <FArea
            label="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            placeholder="Brief summary of the report contents…"
          />
          <div className="mb-4">
            <label className="block text-[11px] font-bold uppercase tracking-wide text-black/60 dark:text-white/60 mb-1.5">
              Attach File * (PDF or Word, max 10MB)
            </label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-black dark:text-white file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[var(--brand-50)] file:text-[var(--brand-700)] hover:file:bg-[var(--brand-100)]"
            />
            {file && (
              <p className="text-[11px] text-black/60 dark:text-white/60 mt-1">
                Selected: {file.name} ({formatSize(file.size)})
              </p>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <Btn size="sm" variant="ghost" onClick={() => { setTitle(''); setDescription(''); setFile(null); if (fileRef.current) fileRef.current.value = ''; }}>
              Clear
            </Btn>
            <Btn size="sm" variant="primary" onClick={handleSubmit} disabled={submitting}>
              <Upload size={13}/> {submitting ? 'Submitting…' : 'Submit Report'}
            </Btn>
          </div>
        </Card>
      )}

      {/* ── DOCUMENT VIEWER MODAL ─────────────────────────────────────────── */}
      {viewing && <DocViewer report={viewing} onClose={() => setViewing(null)} />}

      {/* ── REVIEW MODAL ─────────────────────────────────────────────────── */}
      {reviewing && (
        <Modal title={`Review — ${reviewing.title}`} onClose={() => { setReviewing(null); setFeedback(''); }} width={520}>
          <div className="space-y-4">
            <div className="text-xs text-black/60 dark:text-white/60">
              From <strong>{reviewing.sender_name}</strong> · {reviewing.district} · {new Date(reviewing.created_at).toLocaleDateString()}
            </div>

            {/* View inline before deciding */}
            <button
              onClick={() => setViewing(reviewing)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--brand-50)] dark:bg-[var(--brand-950)]/20 border-2 border-dashed border-[var(--brand-300)] dark:border-[var(--brand-700)] text-[var(--brand-700)] dark:text-[var(--brand-400)] font-semibold text-sm hover:bg-[var(--brand-100)] transition"
            >
              <Eye size={16}/> View Document Before Deciding
            </button>

            <FArea
              label="Feedback (optional)"
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              rows={3}
              placeholder="Add feedback or comments for the sender…"
            />

            <div className="flex gap-2 justify-end flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800">
              <Btn size="sm" variant="ghost" onClick={() => { setReviewing(null); setFeedback(''); }}>Cancel</Btn>
              <Btn size="sm" variant="secondary" onClick={() => handleUpdateStatus(reviewing.id, 'rejected')}>
                <XCircle size={13}/> Reject
              </Btn>
              <Btn size="sm" variant="success" onClick={() => handleUpdateStatus(reviewing.id, 'approved')}>
                <CheckCircle size={13}/> Approve
              </Btn>
              {role === 'program_manager'&& (
 <Btn size="sm"variant="primary"onClick={async () => {
 const data = await documentReportsApi.forward(reviewing.id);
 if (data.error) { showToast(`️ ${data.error}`, 'warning'); return; }
 setInbox(prev => prev.filter(r => r.id !== reviewing.id));
 setReviewing(null);
 showToast('Report forwarded to Admin', 'success');
                }}>
                  Forward to Admin
                </Btn>
              )}
            </div>
          </div>
        </Modal>
      )}
      {/* ── DELETE CONFIRM MODAL ─────────────────────────────────────────── */}
      {deleteId && (
        <Modal title="Delete Report" onClose={() => setDeleteId(null)} width={380}>
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Are you sure you want to permanently delete this report? This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <Btn size="sm" variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Btn>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white transition"
              >
                <Trash2 size={12}/> {deleting ? 'Deleting…' : 'Delete Report'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
