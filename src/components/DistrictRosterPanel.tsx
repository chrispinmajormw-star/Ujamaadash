import React, { useState, useEffect } from 'react';
import { districtRosterApi } from '../api';
import { Card, PageHeader, Btn, Modal, FInput, FSelect, Badge } from './SubComponents';
import { Plus, Edit2, Trash2, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle } from 'lucide-react';

interface FieldDef { key: string; label: string; }

interface DistrictRosterPanelProps {
  type: 'pea' | 'cluster' | 'ta' | 'tot';
  title: string;
  subtitle: string;
  fields: FieldDef[]; // exactly maps to field1..field5, in order
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  canManage: boolean;
}

const LEVEL_COLOR: Record<string, { color: string; bg: string }> = {
  TOT: { color: '#1e40af', bg: '#dbeafe' },
  STOT: { color: '#7c3aed', bg: '#ede9fe' },
  'Teacher Champion': { color: '#b45309', bg: '#fef3c7' },
};

export const DistrictRosterPanel: React.FC<DistrictRosterPanelProps> = ({ type, title, subtitle, fields, showToast, canManage }) => {
  const [entries, setEntries] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [totType, setTotType] = useState('TOT');
  const [tab, setTab] = useState<'list' | 'bulk'>('list');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState<any>(null);

  const load = () => districtRosterApi.getAll(type).then(setEntries).catch(() => {});
  useEffect(() => { load(); }, [type]);

  const blankForm = () => fields.reduce((acc, f, i) => ({ ...acc, [`field${i + 1}`]: '' }), {} as Record<string, string>);

  const openNew = () => { setForm(blankForm()); setTotType('TOT'); setEditing({ isNew: true }); };
  const openEdit = (e: any) => {
    const f = fields.reduce((acc, _, i) => ({ ...acc, [`field${i + 1}`]: e[`field${i + 1}`] || '' }), {} as Record<string, string>);
    setForm(f);
    setTotType(e.tot_type || 'TOT');
    setEditing(e);
  };

  const submit = async () => {
    if (!form.field1?.trim()) { showToast(`${fields[0].label} is required`, 'warning'); return; }
    try {
      const payload = type === 'tot' ? { ...form, totType } : form;
      if (editing.isNew) {
        const data = await districtRosterApi.create({ type, ...payload });
        if (data.error) { showToast(data.error, 'error'); return; }
        showToast('Added', 'success');
      } else {
        const data = await districtRosterApi.update(editing.id, payload);
        if (data.error) { showToast(data.error, 'error'); return; }
        showToast('Updated', 'success');
      }
      setEditing(null);
      load();
    } catch { showToast('Failed to save', 'error'); }
  };

  const remove = async (id: number) => {
    if (!window.confirm('Delete this entry?')) return;
    try { await districtRosterApi.delete(id); load(); showToast('Deleted', 'success'); }
    catch { showToast('Failed to delete', 'error'); }
  };

  const submitBulk = async () => {
    if (!file) { showToast('Please choose a file first', 'warning'); return; }
    setUploading(true);
    setBulkResult(null);
    try {
      const data = await districtRosterApi.bulkImportTeachers(file);
      if (data.error) { showToast(data.error, 'error'); return; }
      setBulkResult(data);
      showToast(`Imported ${data.created} of ${data.totalRows} rows`, 'success');
      load();
    } catch {
      showToast('Failed to upload file', 'error');
    } finally {
      setUploading(false);
    }
  };

  const addLabel = type === 'tot' ? 'Teacher' : fields[0].label.split(' ')[0];

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={canManage && tab === 'list' && <Btn size="sm" onClick={openNew}><Plus size={14} /> Add {addLabel}</Btn>}
      />

      {type === 'tot' && canManage && (
        <div className="flex gap-1 mb-4 border-b border-neutral-200 dark:border-slate-800">
          {[{ id: 'list', label: 'Teacher List' }, { id: 'bulk', label: 'Bulk Upload' }].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`px-4 py-2 text-xs font-bold border-b-2 -mb-px transition-all ${
                tab === t.id
                  ? 'border-[var(--brand-500)] text-[var(--brand-600)] dark:text-[var(--brand-400)]'
                  : 'border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {tab === 'bulk' ? (
        <div className="space-y-4 max-w-xl">
          <Card className="p-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-black dark:text-white block mb-1.5">Excel File</label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={e => setFile(e.target.files?.[0] || null)}
                className="w-full text-xs border border-neutral-200 dark:border-slate-700 rounded-lg px-3 py-2.5 bg-white dark:bg-slate-800 text-black dark:text-white"
              />
              {file && <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1"><FileSpreadsheet size={12} /> {file.name}</p>}
              <p className="text-[11px] text-slate-400 mt-1">Columns expected: Name, Phone Number, Cluster, School, Location, Level (TOT / STOT / Teacher Champion).</p>
            </div>
            <Btn variant="primary" onClick={submitBulk} disabled={uploading || !file}>
              <Upload size={14} /> {uploading ? 'Uploading…' : 'Upload & Import'}
            </Btn>
          </Card>

          {bulkResult && (
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <h3 className="text-sm font-bold text-black dark:text-white m-0">Import Complete</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-center">
                  <div className="text-xl font-black text-emerald-600">{bulkResult.created}</div>
                  <div className="text-[10px] text-slate-500 uppercase">Imported</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 text-center">
                  <div className="text-xl font-black text-black dark:text-white">{bulkResult.totalRows}</div>
                  <div className="text-[10px] text-slate-500 uppercase">Total Rows</div>
                </div>
              </div>
              {bulkResult.errors && bulkResult.errors.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                  <div className="flex items-center gap-1.5 mb-1.5 text-amber-700 dark:text-amber-400 text-xs font-bold">
                    <AlertTriangle size={13} /> {bulkResult.errors.length} row(s) had issues
                  </div>
                  <ul className="text-[11px] text-amber-700 dark:text-amber-400 space-y-0.5 list-disc pl-4">
                    {bulkResult.errors.map((e: string, i: number) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
            </Card>
          )}
        </div>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/40">
                <tr>
                  {fields.map(f => <th key={f.key} className="px-3 py-2 font-bold text-slate-500">{f.label}</th>)}
                  {type === 'tot' && <th className="px-3 py-2 font-bold text-slate-500">Level</th>}
                  {canManage && <th className="px-3 py-2 font-bold text-slate-500">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-slate-800">
                {entries.length === 0 ? (
                  <tr><td colSpan={fields.length + 1} className="px-3 py-6 text-center text-slate-400">No entries yet.</td></tr>
                ) : (
                  entries.map((e: any) => (
                    <tr key={e.id}>
                      {fields.map((f, i) => (
                        <td key={f.key} className={`px-3 py-2 ${i === 0 ? 'font-bold text-black dark:text-white' : ''}`}>
                          {e[`field${i + 1}`] || '—'}
                        </td>
                      ))}
                      {type === 'tot' && (
                        <td className="px-3 py-2">
                          <Badge text={e.tot_type || 'TOT'} color={LEVEL_COLOR[e.tot_type]?.color || LEVEL_COLOR.TOT.color} bg={LEVEL_COLOR[e.tot_type]?.bg || LEVEL_COLOR.TOT.bg} />
                        </td>
                      )}
                      {canManage && (
                        <td className="px-3 py-2">
                          <div className="flex gap-1">
                            <Btn size="sm" variant="secondary" onClick={() => openEdit(e)}><Edit2 size={12} /></Btn>
                            <Btn size="sm" variant="danger" onClick={() => remove(e.id)}><Trash2 size={12} /></Btn>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {editing && (
        <Modal title={editing.isNew ? `New ${type === 'tot' ? 'Teacher' : title}` : `Edit ${type === 'tot' ? 'Teacher' : title}`} onClose={() => setEditing(null)} width={440}>
          <div className="space-y-3">
            {fields.map((f, i) => (
              <FInput
                key={f.key}
                label={i === 0 ? `${f.label} *` : f.label}
                value={form[`field${i + 1}`] || ''}
                onChange={(e: any) => setForm(p => ({ ...p, [`field${i + 1}`]: e.target.value }))}
              />
            ))}
            {type === 'tot' && (
              <FSelect label="Level *" value={totType} onChange={(e: any) => setTotType(e.target.value)}>
                <option value="TOT">TOT</option>
                <option value="STOT">STOT (Senior TOT)</option>
                <option value="Teacher Champion">Teacher Champion</option>
              </FSelect>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Btn size="sm" variant="secondary" onClick={() => setEditing(null)}>Cancel</Btn>
              <Btn size="sm" onClick={submit}>{editing.isNew ? 'Add' : 'Update'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
