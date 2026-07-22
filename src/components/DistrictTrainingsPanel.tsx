import React, { useState, useEffect } from 'react';
import { districtsApi } from '../api';
import { User } from '../types';
import { Card, PageHeader, Btn, Badge, Modal, FInput } from './SubComponents';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface DistrictTrainingsPanelProps {
  user: User | null;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

const getStatus = (startDate?: string, endDate?: string) => {
  if (!startDate) return 'upcoming';
  const now = new Date();
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 6));
  if (now < start) return 'upcoming';
  if (now > end) return 'completed';
  return 'active';
};

const STATUS_CFG: Record<string, { color: string; bg: string }> = {
  upcoming: { color: '#1e40af', bg: '#dbeafe' },
  active: { color: '#065f46', bg: '#dcfce7' },
  completed: { color: '#475569', bg: '#f1f5f9' },
};

const BLANK = { training_name: '', cohort: '', start_date: '', participants: '', venue: '', training_lead_name: '' };

export const DistrictTrainingsPanel: React.FC<DistrictTrainingsPanelProps> = ({ user, showToast }) => {
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [trainings, setTrainings] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [form, setForm] = useState({ ...BLANK });

  useEffect(() => {
    const country = (user as any)?.country || 'Malawi';
    districtsApi.getAll(country).then((list: any) => {
      const mine = (Array.isArray(list) ? list : []).find((d: any) => d.name === (user as any)?.district);
      if (mine) setDistrictId(mine.id);
    }).catch(() => {});
  }, [user]);

  const load = () => { if (districtId) districtsApi.getTrainings(districtId).then(setTrainings).catch(() => {}); };
  useEffect(() => { load(); }, [districtId]);

  const openNew = () => { setForm({ ...BLANK }); setEditing({ isNew: true }); };
  const openEdit = (t: any) => {
    setForm({
      training_name: t.name || '', cohort: t.cohort || '', start_date: t.start_date || '',
      participants: t.participants ?? '', venue: t.venue || '', training_lead_name: t.training_lead_name || '',
    });
    setEditing(t);
  };

  const submit = async () => {
    if (!form.training_name.trim()) { showToast('Training name is required', 'warning'); return; }
    if (!form.start_date) { showToast('Start date is required', 'warning'); return; }
    try {
      if (editing.isNew) {
        if (!districtId) { showToast('Could not resolve your district', 'error'); return; }
        await districtsApi.createTraining(districtId, form);
        showToast('Training added', 'success');
      } else {
        await districtsApi.updateTraining(editing.id, form);
        showToast('Training updated', 'success');
      }
      setEditing(null);
      load();
    } catch { showToast('Failed to save training', 'error'); }
  };

  const remove = async () => {
    if (!deleting) return;
    try { await districtsApi.deleteTraining(deleting); setDeleting(null); load(); showToast('Training deleted', 'success'); }
    catch { showToast('Failed to delete training', 'error'); }
  };

  return (
    <div>
      <PageHeader
        title="Training Management"
        subtitle="Trainings scheduled for your district"
        actions={<Btn size="sm" onClick={openNew}><Plus size={14} /> Add Training</Btn>}
      />
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/40">
              <tr>
                <th className="px-3 py-2 font-bold text-slate-500">Name</th>
                <th className="px-3 py-2 font-bold text-slate-500">Cohort</th>
                <th className="px-3 py-2 font-bold text-slate-500">Dates</th>
                <th className="px-3 py-2 font-bold text-slate-500">Venue</th>
                <th className="px-3 py-2 font-bold text-slate-500">Participants</th>
                <th className="px-3 py-2 font-bold text-slate-500">Lead</th>
                <th className="px-3 py-2 font-bold text-slate-500">Status</th>
                <th className="px-3 py-2 font-bold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-slate-800">
              {trainings.length === 0 ? (
                <tr><td colSpan={8} className="px-3 py-6 text-center text-slate-400">No trainings scheduled yet.</td></tr>
              ) : (
                trainings.map((t: any) => {
                  const status = getStatus(t.start_date, t.end_date);
                  return (
                    <tr key={t.id}>
                      <td className="px-3 py-2 font-bold text-black dark:text-white">{t.name}</td>
                      <td className="px-3 py-2">{t.cohort || '—'}</td>
                      <td className="px-3 py-2">{t.start_date ? new Date(t.start_date).toLocaleDateString() : '—'}</td>
                      <td className="px-3 py-2">{t.venue || '—'}</td>
                      <td className="px-3 py-2">{t.participants ?? 0}</td>
                      <td className="px-3 py-2">{t.training_lead_name || '—'}</td>
                      <td className="px-3 py-2"><Badge text={status} color={STATUS_CFG[status].color} bg={STATUS_CFG[status].bg} /></td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          <Btn size="sm" variant="secondary" onClick={() => openEdit(t)}><Edit2 size={12} /></Btn>
                          <Btn size="sm" variant="danger" onClick={() => setDeleting(t.id)}><Trash2 size={12} /></Btn>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {editing && (
        <Modal title={editing.isNew ? 'Add Training' : 'Edit Training'} onClose={() => setEditing(null)} width={480}>
          <div className="space-y-3">
            <FInput label="Training Name *" value={form.training_name} onChange={(e: any) => setForm(p => ({ ...p, training_name: e.target.value }))} placeholder="e.g. ETT Cohort 16 — Lilongwe Urban" />
            <FInput label="Cohort" value={form.cohort} onChange={(e: any) => setForm(p => ({ ...p, cohort: e.target.value }))} placeholder="e.g. Cohort 16" />
            <FInput label="Start Date *" type="date" value={form.start_date} onChange={(e: any) => setForm(p => ({ ...p, start_date: e.target.value }))} />
            <FInput label="Number of Participants" type="number" value={form.participants} onChange={(e: any) => setForm(p => ({ ...p, participants: e.target.value }))} />
            <FInput label="Venue" value={form.venue} onChange={(e: any) => setForm(p => ({ ...p, venue: e.target.value }))} placeholder="e.g. Lilongwe Teachers College" />
            <FInput label="Training Lead Name" value={form.training_lead_name} onChange={(e: any) => setForm(p => ({ ...p, training_lead_name: e.target.value }))} />
            <div className="flex justify-end gap-2 pt-2">
              <Btn size="sm" variant="secondary" onClick={() => setEditing(null)}>Cancel</Btn>
              <Btn size="sm" onClick={submit}>{editing.isNew ? 'Add Training' : 'Save Changes'}</Btn>
            </div>
          </div>
        </Modal>
      )}

      {deleting && (
        <Modal title="Delete Training" onClose={() => setDeleting(null)} width={400}>
          <p className="text-sm text-black/70 dark:text-white/70 mb-4">Are you sure you want to delete this training? This cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <Btn size="sm" variant="secondary" onClick={() => setDeleting(null)}>Cancel</Btn>
            <Btn size="sm" variant="danger" onClick={remove}>Delete</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};
