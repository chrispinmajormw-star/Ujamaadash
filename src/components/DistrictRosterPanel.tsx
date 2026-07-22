import React, { useState, useEffect } from 'react';
import { districtRosterApi } from '../api';
import { Card, PageHeader, Btn, Modal, FInput, FSelect, Badge } from './SubComponents';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface FieldDef { key: string; label: string; }

interface DistrictRosterPanelProps {
  type: 'pea' | 'cluster' | 'ta' | 'tot';
  title: string;
  subtitle: string;
  fields: FieldDef[]; // exactly maps to field1..field5, in order
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  canManage: boolean;
}

export const DistrictRosterPanel: React.FC<DistrictRosterPanelProps> = ({ type, title, subtitle, fields, showToast, canManage }) => {
  const [entries, setEntries] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [totType, setTotType] = useState('TOT');

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

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={canManage && <Btn size="sm" onClick={openNew}><Plus size={14} /> Add {fields[0].label.split(' ')[0]}</Btn>}
      />
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
                        <Badge text={e.tot_type || 'TOT'} color={e.tot_type === 'STOT' ? '#7c3aed' : '#1e40af'} bg={e.tot_type === 'STOT' ? '#ede9fe' : '#dbeafe'} />
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

      {editing && (
        <Modal title={editing.isNew ? `New ${title}` : `Edit ${title}`} onClose={() => setEditing(null)} width={440}>
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
              <FSelect label="TOT or STOT? *" value={totType} onChange={(e: any) => setTotType(e.target.value)}>
                <option value="TOT">TOT</option>
                <option value="STOT">STOT (Senior TOT)</option>
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
