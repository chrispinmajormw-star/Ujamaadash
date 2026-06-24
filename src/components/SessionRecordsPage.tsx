import React, { useState, useEffect } from 'react';
import { Plus, Trash2, RefreshCw, BookOpen, Users, Calendar, MapPin, Edit2, Save, X } from 'lucide-react';
import { Card, Kicker, Btn, FInput, FSelect, FArea, Modal } from './SubComponents';
import { sessionRecordsApi } from '../api';
import { User } from '../types';
import { DISTRICT_LIST } from '../data';

interface SessionRecord {
  id: number;
  school: string;
  district: string;
  session_date: string;
  curriculum: string;
  session_number: string;
  boys: number;
  girls: number;
  facilitator: string;
  tot_name?: string;
  notes?: string;
  submitted_by_name?: string;
  created_at: string;
}

interface SessionRecordsPageProps {
  user: User | null;
  showToast: (msg: string) => void;
}

const canDelete = (role: string) =>
  ['admin', 'program_manager', 'district_coordinator', 'sasa_officer'].includes(role);

const CURRICULA = ['ETT', 'HIM', 'GESD', 'SASA', 'Other'];

const BLANK_FORM = {
  school: '', district: 'Lilongwe', session_date: new Date().toISOString().split('T')[0],
  curriculum: 'ETT', session_number: '1', boys: 0, girls: 0,
  facilitator: '', tot_name: '', notes: '',
};

export const SessionRecordsPage: React.FC<SessionRecordsPageProps> = ({ user, showToast }) => {
  const [records, setRecords]       = useState<SessionRecord[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState({ ...BLANK_FORM });
  const [saving, setSaving]         = useState(false);
  const [deleteId, setDeleteId]     = useState<number | null>(null);
  const [deleting, setDeleting]     = useState(false);
  const [editRecord, setEditRecord] = useState<SessionRecord | null>(null);
  const [searchQ, setSearchQ]       = useState('');
  const [filterDistrict, setFilterDistrict] = useState('All');
  const [filterCurr, setFilterCurr] = useState('All');

  const role = user?.role || '';

  const load = async () => {
    setLoading(true);
    try {
      const data = await sessionRecordsApi.getAll();
      setRecords(data);
    } catch { showToast('⚠️ Could not load session records'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    if (!form.school || !form.district || !form.session_date || !form.facilitator) {
      showToast('⚠️ School, district, date and facilitator are required'); return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        boys: Number(form.boys) || 0,
        girls: Number(form.girls) || 0,
        session_number: String(form.session_number),
      };
      const saved = editRecord
        ? await sessionRecordsApi.update(editRecord.id, payload)
        : await sessionRecordsApi.submit(payload);

      if (saved?.error) { showToast(`⚠️ ${saved.error}`); setSaving(false); return; }

      if (editRecord) {
        setRecords(prev => prev.map(r => r.id === saved.id ? saved : r));
        showToast('✅ Session record updated');
      } else {
        setRecords(prev => [saved, ...prev]);
        showToast('✅ Session record saved');
      }
      setShowForm(false);
      setEditRecord(null);
      setForm({ ...BLANK_FORM });
    } catch { showToast('⚠️ Failed to save session record'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await sessionRecordsApi.delete(deleteId);
      setRecords(prev => prev.filter(r => r.id !== deleteId));
      showToast('🗑️ Session record deleted');
      setDeleteId(null);
    } catch { showToast('⚠️ Failed to delete record'); }
    setDeleting(false);
  };

  const openEdit = (r: SessionRecord) => {
    setForm({
      school: r.school, district: r.district,
      session_date: r.session_date?.split('T')[0] || '',
      curriculum: r.curriculum, session_number: r.session_number,
      boys: r.boys, girls: r.girls,
      facilitator: r.facilitator, tot_name: r.tot_name || '', notes: r.notes || '',
    });
    setEditRecord(r);
    setShowForm(true);
  };

  const filtered = records.filter(r => {
    if (filterDistrict !== 'All' && r.district !== filterDistrict) return false;
    if (filterCurr     !== 'All' && r.curriculum !== filterCurr)    return false;
    if (searchQ && !r.school.toLowerCase().includes(searchQ.toLowerCase()) &&
        !r.district.toLowerCase().includes(searchQ.toLowerCase()) &&
        !r.facilitator.toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  });

  const totalBoys  = filtered.reduce((a, r) => a + (r.boys  || 0), 0);
  const totalGirls = filtered.reduce((a, r) => a + (r.girls || 0), 0);

  return (
    <div className="space-y-5 animate-fade-in-up">

      {/* HEADER */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <Kicker text="Programme Delivery" />
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Session Records
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track every ETT, HIM, GESD and SASA session delivered across districts.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={load} className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-orange-500 transition">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''}/> Refresh
          </button>
          <Btn size="sm" onClick={() => { setForm({ ...BLANK_FORM, district: user?.district || 'Lilongwe' }); setEditRecord(null); setShowForm(true); }}>
            <Plus size={12} className="inline mr-1"/> Log Session
          </Btn>
        </div>
      </div>

      {/* STAT STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Sessions', value: filtered.length, sub: 'recorded' },
          { label: 'Boys Reached',   value: totalBoys.toLocaleString(),  sub: 'learners' },
          { label: 'Girls Reached',  value: totalGirls.toLocaleString(), sub: 'learners' },
          { label: 'Total Learners', value: (totalBoys + totalGirls).toLocaleString(), sub: 'combined' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-3">
            <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">{s.label}</div>
            <div className="text-xl font-black text-slate-900 dark:text-slate-50 leading-none">{s.value}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-2">
        <input
          type="text" placeholder="Search school, district, facilitator…"
          value={searchQ} onChange={e => setSearchQ(e.target.value)}
          className="flex-1 min-w-48 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-slate-200"
        />
        <select value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)}
          className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none dark:text-slate-200">
          <option value="All">All Districts</option>
          {DISTRICT_LIST.map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={filterCurr} onChange={e => setFilterCurr(e.target.value)}
          className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none dark:text-slate-200">
          <option value="All">All Curricula</option>
          {CURRICULA.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="flex items-center justify-center h-32 text-sm text-slate-400 gap-2">
          <RefreshCw size={14} className="animate-spin"/> Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen size={36} className="text-slate-300 dark:text-slate-600 mx-auto mb-3"/>
          <p className="text-sm font-semibold text-slate-500">No session records found.</p>
          <p className="text-xs text-slate-400 mt-1">Click "Log Session" to add the first one.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => (
            <Card key={r.id} className="p-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 flex items-center justify-center shrink-0">
                  <BookOpen size={16} className="text-orange-500"/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate">{r.school}</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400">
                      {r.curriculum}
                    </span>
                    <span className="text-[10px] text-slate-400">Session {r.session_number}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10.5px] text-slate-500">
                    <span className="flex items-center gap-1"><MapPin size={9}/> {r.district}</span>
                    <span className="flex items-center gap-1"><Calendar size={9}/> {new Date(r.session_date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Users size={9}/> {(r.boys||0)+(r.girls||0)} learners ({r.boys||0}B / {r.girls||0}G)</span>
                    <span>Facilitator: <b>{r.facilitator}</b></span>
                    {r.tot_name && <span>TOT: <b>{r.tot_name}</b></span>}
                  </div>
                  {r.notes && <p className="text-[10px] text-slate-400 mt-1 italic">{r.notes}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(r)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition">
                    <Edit2 size={12}/>
                  </button>
                  {canDelete(role) && (
                    <button onClick={() => setDeleteId(r.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition">
                      <Trash2 size={12}/>
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── LOG / EDIT MODAL ──────────────────────────────────────────────── */}
      {showForm && (
        <Modal
          title={editRecord ? 'Edit Session Record' : 'Log New Session'}
          onClose={() => { setShowForm(false); setEditRecord(null); }}
          width={560}
        >
          <div className="grid grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto pr-1">
            <div className="col-span-2">
              <FInput label="School Name *" value={form.school} onChange={e => set('school', e.target.value)} placeholder="e.g. Chichiri Primary School"/>
            </div>
            <FSelect label="District *" value={form.district} onChange={e => set('district', e.target.value)}>
              {DISTRICT_LIST.map(d => <option key={d}>{d}</option>)}
            </FSelect>
            <FInput label="Session Date *" type="date" value={form.session_date} onChange={e => set('session_date', e.target.value)}/>
            <FSelect label="Curriculum *" value={form.curriculum} onChange={e => set('curriculum', e.target.value)}>
              {CURRICULA.map(c => <option key={c}>{c}</option>)}
            </FSelect>
            <FInput label="Session Number" value={form.session_number} onChange={e => set('session_number', e.target.value)} placeholder="e.g. 3"/>
            <FInput label="Boys Attended" type="number" value={form.boys} onChange={e => set('boys', e.target.value)}/>
            <FInput label="Girls Attended" type="number" value={form.girls} onChange={e => set('girls', e.target.value)}/>
            <div className="col-span-2">
              <FInput label="Facilitator Name *" value={form.facilitator} onChange={e => set('facilitator', e.target.value)} placeholder="Name of teacher/TOT who facilitated"/>
            </div>
            <div className="col-span-2">
              <FInput label="TOT Name (if applicable)" value={form.tot_name} onChange={e => set('tot_name', e.target.value)} placeholder="TOT who supervised"/>
            </div>
            <div className="col-span-2">
              <FArea label="Notes" value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Any observations or highlights…"/>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
            <Btn variant="secondary" size="sm" onClick={() => { setShowForm(false); setEditRecord(null); }}>
              <X size={11} className="inline mr-1"/> Cancel
            </Btn>
            <Btn size="sm" onClick={handleSave} disabled={saving}>
              <Save size={11} className="inline mr-1"/>
              {saving ? 'Saving…' : editRecord ? 'Update Record' : 'Save Session'}
            </Btn>
          </div>
        </Modal>
      )}

      {/* ── DELETE CONFIRM ───────────────────────────────────────────────── */}
      {deleteId && (
        <Modal title="Delete Session Record" onClose={() => setDeleteId(null)} width={380}>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Are you sure? This session record will be permanently deleted.
          </p>
          <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
            <Btn variant="ghost" size="sm" onClick={() => setDeleteId(null)}>Cancel</Btn>
            <button onClick={handleDelete} disabled={deleting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white transition">
              <Trash2 size={12}/> {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
