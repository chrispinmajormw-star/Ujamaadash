import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { documentReportsApi } from '../api';
import { Card, PageHeader, Btn, Badge, FInput, FArea, Modal } from './SubComponents';
import { Inbox, Send, Upload, Download, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';

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
  sasa_officer: 'District Coordinator',
  data_entry: 'District Coordinator',
  district_coordinator: 'Program Manager',
};

const canSubmit = (role: string) => ['tot', 'sasa_officer', 'data_entry', 'district_coordinator'].includes(role);
const canReceive = (role: string) => ['district_coordinator', 'program_manager', 'admin'].includes(role);

export const DocumentReportsPage: React.FC<DocumentReportsPageProps> = ({ user, showToast }) => {
  const [tab, setTab] = useState<'inbox' | 'sent' | 'submit'>('inbox');
  const [inbox, setInbox] = useState<any[]>([]);
  const [sent, setSent] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviewing, setReviewing] = useState<any | null>(null);
  const [feedback, setFeedback] = useState('');

  // Submit form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const role = user?.role || '';

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      canReceive(role) ? documentReportsApi.getInbox() : Promise.resolve([]),
      canSubmit(role) ? documentReportsApi.getSent() : Promise.resolve([]),
    ]).then(([inboxData, sentData]) => {
      if (Array.isArray(inboxData)) setInbox(inboxData);
      if (Array.isArray(sentData)) setSent(sentData);
      setLoading(false);
    });
  }, [user]);

  const handleSubmit = async () => {
    if (!title || !file) { showToast('⚠️ Title and file are required'); return; }
    setSubmitting(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('file', file);
    try {
      const data = await documentReportsApi.submit(formData);
      if (data.error) { showToast(`⚠️ ${data.error}`); setSubmitting(false); return; }
      showToast(`✅ Report submitted to ${RECIPIENT_LABEL[role]}`);
      setSent(prev => [data, ...prev]);
      setTitle(''); setDescription(''); setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      setTab('sent');
    } catch {
      showToast('⚠️ Failed to submit report');
    }
    setSubmitting(false);
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    const data = await documentReportsApi.updateStatus(id, status, feedback);
    if (data.error) { showToast(`⚠️ ${data.error}`); return; }
    setInbox(prev => prev.map(r => r.id === id ? { ...r, status, feedback } : r));
    showToast(`Report marked as ${status}`);
    setReviewing(null);
    setFeedback('');
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '';
    return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const openFile = async (filename: string, displayName: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${documentReportsApi.getDownloadUrl(filename)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { showToast('⚠️ Could not open file'); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch {
      showToast('⚠️ Failed to open file');
    }
  };

  const TABS = [
    ...(canReceive(role) ? [{ id: 'inbox', label: 'Inbox', icon: <Inbox size={14} />, count: inbox.filter(r => r.status === 'pending').length }] : []),
    ...(canSubmit(role) ? [{ id: 'sent', label: 'Sent', icon: <Send size={14} /> }, { id: 'submit', label: 'Submit Report', icon: <Upload size={14} /> }] : []),
  ] as any[];

  if (!user) return <div className="p-12 text-center text-black/40 dark:text-white/40">Sign in to access this page.</div>;

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
                ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20'
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
          {loading && <div className="text-center py-8 text-sm text-black/40 dark:text-white/40">Loading...</div>}
          {!loading && inbox.length === 0 && (
            <div className="text-center py-12 text-sm text-black/40 dark:text-white/40">No reports received yet.</div>
          )}
          {inbox.map(r => (
            <Card key={r.id} className="p-4">
              <div className="flex flex-wrap items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <FileText size={14} className="text-orange-500 shrink-0" />
                    <span className="font-bold text-sm text-black dark:text-white">{r.title}</span>
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ color: STATUS_CFG[r.status]?.color, background: STATUS_CFG[r.status]?.bg }}
                    >
                      {STATUS_CFG[r.status]?.label}
                    </span>
                  </div>
                  <div className="text-[11px] text-black/60 dark:text-white/60 mb-1">
                    From: <strong>{r.sender_name}</strong> · {r.district} · {new Date(r.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-[10px] text-orange-600 font-semibold">
                    {r.sender_role === 'sasa_officer' ? '🛡️ From SASA Officer' :
                    r.sender_role === 'district_coordinator' ? '🗺️ From District Coordinator' :
                    r.sender_role === 'program_manager' ? '📊 Forwarded by Manager' : ''}
                  </div>
                  {r.description && <p className="text-xs text-black/70 dark:text-white/70">{r.description}</p>}
                  {r.feedback && (
                    <div className="mt-2 text-xs text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 rounded p-2">
                      Feedback: {r.feedback}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0 flex-wrap">
                  <button
                    onClick={() => openFile(r.file_path, r.file_name)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md border border-neutral-200 dark:border-slate-700 hover:border-orange-400 text-black dark:text-white"
                  >
                    <Download size={12} /> {r.file_name} {r.file_size ? `(${formatSize(r.file_size)})` : ''}
                  </button>
                  {r.status === 'pending' && (
                    <Btn size="sm" variant="secondary" onClick={() => setReviewing(r)}>
                      Review
                    </Btn>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* SENT */}
      {tab === 'sent' && (
        <div className="space-y-2">
          {loading && <div className="text-center py-8 text-sm text-black/40 dark:text-white/40">Loading...</div>}
          {!loading && sent.length === 0 && (
            <div className="text-center py-12 text-sm text-black/40 dark:text-white/40">No reports submitted yet.</div>
          )}
          {sent.map(r => (
            <Card key={r.id} className="p-4">
              <div className="flex flex-wrap items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <FileText size={14} className="text-orange-500 shrink-0" />
                    <span className="font-bold text-sm text-black dark:text-white">{r.title}</span>
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ color: STATUS_CFG[r.status]?.color, background: STATUS_CFG[r.status]?.bg }}
                    >
                      {STATUS_CFG[r.status]?.label}
                    </span>
                  </div>
                  <div className="text-[11px] text-black/60 dark:text-white/60 mb-1">
                    To: <strong>{RECIPIENT_LABEL[role]}</strong> · {new Date(r.created_at).toLocaleDateString()}
                  </div>
                  {r.description && <p className="text-xs text-black/70 dark:text-white/70">{r.description}</p>}
                  {r.feedback && (
                    <div className="mt-2 text-xs text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 rounded p-2">
                      Feedback: {r.feedback}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => openFile(r.file_path, r.file_name)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md border border-neutral-200 dark:border-slate-700 hover:border-orange-400 text-black dark:text-white shrink-0"
                >
                  <Download size={12} /> {r.file_name}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* SUBMIT */}
      {tab === 'submit' && (
        <Card className="max-w-xl">
          <div className="mb-4">
            <p className="text-xs text-black/60 dark:text-white/60">
              Your report will be sent to: <strong className="text-orange-600">{RECIPIENT_LABEL[role]}</strong>
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
              className="w-full text-sm text-black dark:text-white file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
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
              <Upload size={13} /> {submitting ? 'Submitting…' : 'Submit Report'}
            </Btn>
          </div>
        </Card>
      )}

      {/* Review modal */}
      {reviewing && (
        <Modal title={`Review — ${reviewing.title}`} onClose={() => { setReviewing(null); setFeedback(''); }} width={480}>
          <p className="text-xs text-black/60 dark:text-white/60 mb-4">
            From <strong>{reviewing.sender_name}</strong> · {reviewing.district} · {new Date(reviewing.created_at).toLocaleDateString()}
          </p>
          <div className="mb-4">
            <button
              onClick={() => openFile(reviewing.file_path, reviewing.file_name)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-md border border-neutral-200 dark:border-slate-700 hover:border-orange-400 text-black dark:text-white w-fit"
            >
              <Download size={13} /> Open {reviewing.file_name}
            </button>
          </div>
          <FArea
            label="Feedback (optional)"
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            rows={3}
            placeholder="Add feedback or comments for the sender…"
          />
          <div className="flex gap-2 justify-end mt-3 flex-wrap">
            <Btn size="sm" variant="ghost" onClick={() => { setReviewing(null); setFeedback(''); }}>Cancel</Btn>
            <Btn size="sm" variant="secondary" onClick={() => handleUpdateStatus(reviewing.id, 'rejected')}>
            <XCircle size={13} /> Reject
              </Btn>
            <Btn size="sm" variant="success" onClick={() => handleUpdateStatus(reviewing.id, 'approved')}>
            <CheckCircle size={13} /> Approve
            </Btn>
            {role === 'program_manager' && (
            <Btn size="sm" variant="primary" onClick={async () => {
            const data = await documentReportsApi.forward(reviewing.id);
              if (data.error) { showToast(`⚠️ ${data.error}`); return; }
            setInbox(prev => prev.filter(r => r.id !== reviewing.id));
            setReviewing(null);
            showToast('📨 Report forwarded to Admin');
            }}>
            Forward to Admin
            </Btn>
            )}
        </div>
        </Modal>
      )}
    </div>
  );
};
