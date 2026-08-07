import React, { useState, useEffect } from 'react';
import { announcementsApi, usersApi } from '../api';
import { useCountry } from '../context/CountryContext';
import { User } from '../types';
import { Card, PageHeader, Btn, Badge, Modal, FInput, FArea, FSelect } from './SubComponents';
import { Megaphone, Download, Trash2, Plus, FileText, Edit2 } from 'lucide-react';

interface AnnouncementsPageProps {
  user: User | null;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

const COUNTRIES = ['Malawi', 'Kenya', 'Somaliland'];

export const AnnouncementsPage: React.FC<AnnouncementsPageProps> = ({ user, showToast }) => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: '', body: '', country: (user as any)?.country || 'Malawi',
    targetType: 'all' as 'all' | 'selected',
    selectedUserIds: [] as string[],
    file: null as File | null,
    showOnDashboard: false,
  });

  const isAdmin = user?.role === 'admin';

  const { activeCountry } = useCountry();
  const load = () => announcementsApi.getAll(activeCountry).then(setAnnouncements).catch(() => {});

  useEffect(() => { load(); }, [activeCountry]);
  useEffect(() => {
    if (isAdmin) usersApi.getAll().then((res: any) => setAllUsers(Array.isArray(res) ? res : [])).catch(() => {});
  }, [isAdmin]);

  const usersInCountry = allUsers.filter(u => u.country === form.country);

  const toggleUser = (id: string) => {
    setForm(p => ({
      ...p,
      selectedUserIds: p.selectedUserIds.includes(id)
        ? p.selectedUserIds.filter(x => x !== id)
        : [...p.selectedUserIds, id],
    }));
  };

  const openEdit = (a: any) => {
    setForm({
      title: a.title || '', body: a.body || '', country: a.country || 'Malawi',
      targetType: (a.target_type === 'selected' ? 'selected' : 'all'),
      selectedUserIds: [], file: null,
      showOnDashboard: !!a.show_on_dashboard,
    });
    setEditingId(a.id);
    setCreating(true);
  };

  const submit = async () => {
    if (!form.title.trim()) { showToast('Title is required', 'warning'); return; }
    if (form.targetType === 'selected' && form.selectedUserIds.length === 0) {
      showToast('Select at least one recipient', 'warning'); return;
    }
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('body', form.body);
    fd.append('country', form.country);
    fd.append('targetType', form.targetType);
    if (form.targetType === 'selected') fd.append('userIds', JSON.stringify(form.selectedUserIds));
    fd.append('showOnDashboard', String(form.showOnDashboard));
    if (form.file) fd.append('file', form.file);

    try {
      const data = editingId
        ? await announcementsApi.update(editingId, fd)
        : await announcementsApi.submit(fd);
      if (data.error) { showToast(data.error, 'error'); return; }
      showToast(editingId ? 'Announcement updated' : 'Announcement published', 'success');
      setCreating(false);
      setEditingId(null);
      setForm({ title: '', body: '', country: (user as any)?.country || 'Malawi', targetType: 'all', selectedUserIds: [], file: null, showOnDashboard: false });
      load();
    } catch {
      showToast(editingId ? 'Failed to update announcement' : 'Failed to publish announcement', 'error');
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm('Delete this announcement for everyone?')) return;
    try {
      await announcementsApi.delete(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      showToast('Announcement deleted', 'success');
    } catch {
      showToast('Failed to delete announcement', 'error');
    }
  };

  return (
    <div>
      <PageHeader
        title="Announcements"
        subtitle="Country-wide updates from the System Admin"
        actions={isAdmin && (
          <Btn size="sm" variant="primary" onClick={() => setCreating(true)}>
            <Plus size={14} /> New Announcement
          </Btn>
        )}
      />

      <div className="space-y-2">
        {announcements.length === 0 && (
          <div className="text-center py-12 text-sm text-black/40 dark:text-white/40">No announcements yet.</div>
        )}
        {announcements.map(a => (
          <Card key={a.id} className="p-4 flex flex-wrap items-start gap-3">
            <div className="p-2 rounded-lg bg-[var(--brand-50)] dark:bg-[var(--brand-950)]/20 shrink-0">
              <Megaphone size={16} className="text-[var(--brand-600)]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-bold text-sm text-black dark:text-white">{a.title}</span>
                {!a.is_read && <Badge text="New" color="#065f46" bg="#dcfce7" />}
              </div>
              {a.body && <p className="text-xs text-black/70 dark:text-white/70 mb-1">{a.body}</p>}
              <div className="text-[10px] text-slate-400">
                {a.created_by_name} · {new Date(a.created_at).toLocaleDateString()} · {a.target_type === 'all' ? 'All staff' : 'Selected recipients'}
              </div>
              {a.file_path && (
                  <a
                  href={announcementsApi.getDownloadUrl(a.file_path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-bold text-[var(--brand-600)] hover:underline"
                >
                  <FileText size={12} /> {a.file_name} <Download size={11} />
                </a>
              )}
            </div>
            {isAdmin && (
              <div className="flex gap-1.5 shrink-0">
                <Btn size="sm" variant="secondary" onClick={() => openEdit(a)}>
                  <Edit2 size={13} />
                </Btn>
                <Btn size="sm" variant="danger" onClick={() => remove(a.id)}>
                  <Trash2 size={13} />
                </Btn>
              </div>
            )}
          </Card>
        ))}
      </div>

      {creating && (
        <Modal title={editingId ? "Edit Announcement" : "New Announcement"} onClose={() => { setCreating(false); setEditingId(null); }} width={560}>
          <div className="space-y-3">
            <FInput label="Title *" value={form.title} onChange={(e: any) => setForm(p => ({ ...p, title: e.target.value }))} />
            <FArea label="Message (optional)" value={form.body} onChange={(e: any) => setForm(p => ({ ...p, body: e.target.value }))} rows={4} placeholder="Write the announcement, or leave blank if attaching a document..." />
            <FSelect label="Country *" value={form.country} onChange={(e: any) => setForm(p => ({ ...p, country: e.target.value, selectedUserIds: [] }))}>
              {COUNTRIES.map(c => <option key={c}>{c}</option>)}
            </FSelect>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 block">Attach a PDF or Word document (optional)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e: any) => setForm(p => ({ ...p, file: e.target.files?.[0] || null }))}
                className="text-xs w-full border border-neutral-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-black dark:text-white"
              />
            </div>

            <FSelect label="Recipients *" value={form.targetType} onChange={(e: any) => setForm(p => ({ ...p, targetType: e.target.value }))}>
              <option value="all">Everyone in {form.country}</option>
              <option value="selected">Selected personnel only</option>
            </FSelect>

            {form.targetType === 'selected' && (
              <div className="border border-neutral-200 dark:border-slate-700 rounded-lg max-h-48 overflow-y-auto p-2 space-y-1">
                {usersInCountry.length === 0 ? (
                  <div className="text-xs text-slate-400 p-2">No users found for {form.country}.</div>
                ) : (
                  usersInCountry.map(u => (
                    <label key={u.id} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200 p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.selectedUserIds.includes(u.id)}
                        onChange={() => toggleUser(u.id)}
                        className="accent-[var(--brand)]"
                      />
                      {u.name} <span className="text-slate-400">({u.role})</span>
                    </label>
                  ))
                )}
              </div>
            )}
            {isAdmin && (
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200 p-2 rounded-lg border border-neutral-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.showOnDashboard}
                  onChange={(e) => setForm(p => ({ ...p, showOnDashboard: e.target.checked }))}
                  className="accent-[var(--brand)]"
                />
                Show on Main Dashboard — visible to everyone, including logged-out visitors
              </label>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Btn size="sm" variant="secondary" onClick={() => { setCreating(false); setEditingId(null); }}>Cancel</Btn>
              <Btn size="sm" onClick={submit}>{editingId ? 'Save Changes' : 'Publish Announcement'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
