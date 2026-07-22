import React, { useState, useEffect } from 'react';
import { mapApi } from '../api';
import { User } from '../types';
import { Card, PageHeader, Badge, Btn, Modal, FInput } from './SubComponents';
import { Edit2 } from 'lucide-react';

interface DistrictClustersPanelProps {
  user: User | null;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const DistrictClustersPanel: React.FC<DistrictClustersPanelProps> = ({ user, showToast }) => {
  const [clusters, setClusters] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ name: '', lead: '', lead_phone: '', lead_email: '' });

  const district = (user as any)?.district;

  const load = () => {
    if (district) mapApi.getClusters(district).then((res: any) => setClusters(Array.isArray(res) ? res : [])).catch(() => {});
  };
  useEffect(() => { load(); }, [user]);

  const openEdit = (c: any) => {
    setForm({ name: c.name || '', lead: c.lead || '', lead_phone: c.lead_phone || '', lead_email: c.lead_email || '' });
    setEditing(c);
  };

  const submit = async () => {
    if (!form.name.trim()) { showToast('Cluster name is required', 'warning'); return; }
    try {
      const data = await mapApi.updateCluster(editing.id, form);
      if (data.error) { showToast(data.error, 'error'); return; }
      showToast('Cluster info updated', 'success');
      setEditing(null);
      load();
    } catch { showToast('Failed to update cluster', 'error'); }
  };

  return (
    <div>
      <PageHeader
        title="District Clusters"
        subtitle="Verify and correct cluster info already registered by the Cartographer — new clusters are added by Cartographers only"
      />
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/40">
              <tr>
                <th className="px-3 py-2 font-bold text-slate-500">Cluster</th>
                <th className="px-3 py-2 font-bold text-slate-500">Cluster Lead</th>
                <th className="px-3 py-2 font-bold text-slate-500">Lead Phone</th>
                <th className="px-3 py-2 font-bold text-slate-500">Anchor</th>
                <th className="px-3 py-2 font-bold text-slate-500">Students</th>
                <th className="px-3 py-2 font-bold text-slate-500">TOTs</th>
                <th className="px-3 py-2 font-bold text-slate-500">STOTs</th>
                <th className="px-3 py-2 font-bold text-slate-500">Verified</th>
                <th className="px-3 py-2 font-bold text-slate-500">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-slate-800">
              {clusters.length === 0 ? (
                <tr><td colSpan={9} className="px-3 py-6 text-center text-slate-400">No clusters found for your district yet — new clusters are added by the Cartographer.</td></tr>
              ) : (
                clusters.map((c: any) => (
                  <tr key={c.id}>
                    <td className="px-3 py-2 font-bold text-black dark:text-white">{c.name}</td>
                    <td className="px-3 py-2">{c.lead || '—'}</td>
                    <td className="px-3 py-2">{c.lead_phone || '—'}</td>
                    <td className="px-3 py-2">{c.anchor_names || <span className="text-slate-400 italic">Unassigned</span>}</td>
                    <td className="px-3 py-2">{c.students ?? 0}</td>
                    <td className="px-3 py-2">{c.tots ?? 0}</td>
                    <td className="px-3 py-2">{c.stots ?? 0}</td>
                    <td className="px-3 py-2">
                      {c.verified ? <Badge text="Verified" color="#065f46" bg="#dcfce7" /> : <Badge text="Unverified" color="#92400e" bg="#fef9c3" />}
                    </td>
                    <td className="px-3 py-2">
                      <Btn size="sm" variant="secondary" onClick={() => openEdit(c)}><Edit2 size={12} /></Btn>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {editing && (
        <Modal title={`Edit Cluster Info — ${editing.name}`} onClose={() => setEditing(null)} width={460}>
          <div className="space-y-3">
            <FInput label="Cluster Name *" value={form.name} onChange={(e: any) => setForm(p => ({ ...p, name: e.target.value }))} />
            <FInput label="Cluster Lead" value={form.lead} onChange={(e: any) => setForm(p => ({ ...p, lead: e.target.value }))} />
            <FInput label="Lead Phone" value={form.lead_phone} onChange={(e: any) => setForm(p => ({ ...p, lead_phone: e.target.value }))} />
            <FInput label="Lead Email" value={form.lead_email} onChange={(e: any) => setForm(p => ({ ...p, lead_email: e.target.value }))} />
            <p className="text-[11px] text-slate-400">Note: district, region, and location are managed by the Cartographer and can't be changed here.</p>
            <div className="flex justify-end gap-2 pt-2">
              <Btn size="sm" variant="secondary" onClick={() => setEditing(null)}>Cancel</Btn>
              <Btn size="sm" onClick={submit}>Save Changes</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
