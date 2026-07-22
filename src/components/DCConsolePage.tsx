import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { districtAssetsApi, districtStakeholdersApi } from '../api';
import { DistrictsPage } from './DistrictsPage';
import { DistrictTrainingsPanel } from './DistrictTrainingsPanel';
import { DistrictRosterPanel } from './DistrictRosterPanel';
import { DistrictClustersPanel } from './DistrictClustersPanel';
import { Card, PageHeader, Btn, Modal, FInput, FArea, FSelect } from './SubComponents';
import { MapPin, GraduationCap, Package, Users, Plus, Edit2, Trash2, UserCheck, Route, ClipboardList, School } from 'lucide-react';

interface DCConsolePageProps {
  user: User | null;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

const TABS = [
  { id: 'district', label: 'My District', icon: MapPin },
  { id: 'trainings', label: 'Training Management', icon: GraduationCap },
  { id: 'assets', label: 'District Assets', icon: Package },
  { id: 'stakeholders', label: 'Stakeholders', icon: Users },
  { id: 'peas', label: 'PEAs', icon: UserCheck },
  { id: 'clusters', label: 'District Clusters', icon: Route },
  { id: 'tas', label: 'TAs', icon: ClipboardList },
  { id: 'tots', label: 'TOTs', icon: School },
] as const;

const ASSET_BLANK = { name: '', assetTag: '', colour: '#e85d04', description: '' };
const STAKEHOLDER_BLANK = { name: '', roleTitle: '', phone: '', email: '', location: '' };

export const DCConsolePage: React.FC<DCConsolePageProps> = ({ user, showToast }) => {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['id']>('district');

  // Assets
  const [assets, setAssets] = useState<any[]>([]);
  const [editingAsset, setEditingAsset] = useState<any | null>(null);
  const [assetForm, setAssetForm] = useState({ ...ASSET_BLANK });

  // Stakeholders
  const [stakeholders, setStakeholders] = useState<any[]>([]);
  const [editingStakeholder, setEditingStakeholder] = useState<any | null>(null);
  const [stakeholderForm, setStakeholderForm] = useState({ ...STAKEHOLDER_BLANK });

  const loadAssets = () => districtAssetsApi.getAll().then(setAssets).catch(() => {});
  const loadStakeholders = () => districtStakeholdersApi.getAll().then(setStakeholders).catch(() => {});

  useEffect(() => {
    if (activeTab === 'assets') loadAssets();
    if (activeTab === 'stakeholders') loadStakeholders();
  }, [activeTab, user]);

  // --- Assets handlers ---
  const submitAsset = async () => {
    if (!assetForm.name.trim()) { showToast('Asset name is required', 'warning'); return; }
    try {
      if (editingAsset?.isNew) {
        await districtAssetsApi.create(assetForm);
        showToast('Asset added', 'success');
      } else {
        await districtAssetsApi.update(editingAsset.id, assetForm);
        showToast('Asset updated', 'success');
      }
      setEditingAsset(null);
      loadAssets();
    } catch { showToast('Failed to save asset', 'error'); }
  };
  const removeAsset = async (id: number) => {
    if (!window.confirm('Delete this asset?')) return;
    try { await districtAssetsApi.delete(id); loadAssets(); showToast('Asset deleted', 'success'); }
    catch { showToast('Failed to delete asset', 'error'); }
  };

  // --- Stakeholders handlers ---
  const submitStakeholder = async () => {
    if (!stakeholderForm.name.trim()) { showToast('Stakeholder name is required', 'warning'); return; }
    try {
      if (editingStakeholder?.isNew) {
        await districtStakeholdersApi.create(stakeholderForm);
        showToast('Stakeholder added', 'success');
      } else {
        await districtStakeholdersApi.update(editingStakeholder.id, stakeholderForm);
        showToast('Stakeholder updated', 'success');
      }
      setEditingStakeholder(null);
      loadStakeholders();
    } catch { showToast('Failed to save stakeholder', 'error'); }
  };
  const removeStakeholder = async (id: number) => {
    if (!window.confirm('Delete this stakeholder?')) return;
    try { await districtStakeholdersApi.delete(id); loadStakeholders(); showToast('Stakeholder deleted', 'success'); }
    catch { showToast('Failed to delete stakeholder', 'error'); }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-base font-bold text-black dark:text-white m-0 mb-3">DC Console</h1>
        <div className="flex gap-1 border-b border-neutral-200 dark:border-slate-800 pb-0 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t-lg border-b-2 transition-all -mb-px shrink-0 ${
                activeTab === t.id
                  ? 'border-[var(--brand-500)] text-[var(--brand-600)] dark:text-[var(--brand-400)] bg-[var(--brand-50)] dark:bg-[var(--brand-950)]/20'
                  : 'border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'
              }`}
            >
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'district' && <DistrictsPage user={user} showToast={showToast} />}

      {activeTab === 'trainings' && <DistrictTrainingsPanel user={user} showToast={showToast} />}

      {activeTab === 'assets' && (
        <div>
          <PageHeader
            title="District Assets"
            subtitle="Ujamaa Pamodzi Africa properties in your district"
            actions={<Btn size="sm" onClick={() => { setAssetForm({ ...ASSET_BLANK }); setEditingAsset({ isNew: true }); }}><Plus size={14} /> New Asset</Btn>}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {assets.length === 0 ? (
              <div className="col-span-full text-center py-12 text-sm text-black/40 dark:text-white/40">No assets recorded yet.</div>
            ) : (
              assets.map((a: any) => (
                <Card key={a.id} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-4 h-4 rounded-full shrink-0" style={{ background: a.colour || '#94a3b8' }} />
                    <span className="font-bold text-sm text-black dark:text-white truncate">{a.name}</span>
                  </div>
                  {a.asset_tag && <div className="text-[10px] text-slate-400 mb-1">ID: {a.asset_tag}</div>}
                  {a.description && <p className="text-xs text-slate-500 mb-3">{a.description}</p>}
                  <div className="flex gap-2">
                    <Btn size="sm" variant="secondary" onClick={() => { setAssetForm({ name: a.name, assetTag: a.asset_tag || '', colour: a.colour || '#e85d04', description: a.description || '' }); setEditingAsset(a); }}><Edit2 size={12} /></Btn>
                    <Btn size="sm" variant="danger" onClick={() => removeAsset(a.id)}><Trash2 size={12} /></Btn>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'stakeholders' && (
        <div>
          <PageHeader
            title="Stakeholders"
            subtitle="Key contacts in your district"
            actions={<Btn size="sm" onClick={() => { setStakeholderForm({ ...STAKEHOLDER_BLANK }); setEditingStakeholder({ isNew: true }); }}><Plus size={14} /> New Stakeholder</Btn>}
          />
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/40">
                  <tr>
                    <th className="px-3 py-2 font-bold text-slate-500">Name</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Role</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Phone</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Email</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Location</th>
                    <th className="px-3 py-2 font-bold text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-slate-800">
                  {stakeholders.length === 0 ? (
                    <tr><td colSpan={6} className="px-3 py-6 text-center text-slate-400">No stakeholders recorded yet.</td></tr>
                  ) : (
                    stakeholders.map((s: any) => (
                      <tr key={s.id}>
                        <td className="px-3 py-2 font-bold text-black dark:text-white">{s.name}</td>
                        <td className="px-3 py-2">{s.role_title || '—'}</td>
                        <td className="px-3 py-2">{s.phone || '—'}</td>
                        <td className="px-3 py-2">{s.email || '—'}</td>
                        <td className="px-3 py-2">{s.location || '—'}</td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1">
                            <Btn size="sm" variant="secondary" onClick={() => { setStakeholderForm({ name: s.name, roleTitle: s.role_title || '', phone: s.phone || '', email: s.email || '', location: s.location || '' }); setEditingStakeholder(s); }}><Edit2 size={12} /></Btn>
                            <Btn size="sm" variant="danger" onClick={() => removeStakeholder(s.id)}><Trash2 size={12} /></Btn>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'peas' && (
        <DistrictRosterPanel
          type="pea"
          title="PEAs"
          subtitle="Primary Education Advisors in your district"
          fields={[{ key: 'name', label: 'Name' }, { key: 'zone', label: 'Zone' }, { key: 'phone', label: 'Phone Number' }]}
          showToast={showToast}
          canManage={true}
        />
      )}

      {activeTab === 'clusters' && <DistrictClustersPanel user={user} showToast={showToast} />}

      {activeTab === 'tas' && (
        <DistrictRosterPanel
          type="ta"
          title="TAs"
          subtitle="Traditional Authorities in your district"
          fields={[{ key: 'name', label: 'Name' }, { key: 'phone', label: 'TA Phone Number' }]}
          showToast={showToast}
          canManage={true}
        />
      )}

      {activeTab === 'tots' && (
        <DistrictRosterPanel
          type="tot"
          title="TOTs"
          subtitle="TOT roster for your district"
          fields={[{ key: 'name', label: 'Name' }, { key: 'phone', label: 'Phone Number' }, { key: 'cluster', label: 'Cluster' }, { key: 'school', label: 'School' }, { key: 'location', label: 'Location' }]}
          showToast={showToast}
          canManage={true}
        />
      )}

      {editingAsset && (
        <Modal title={editingAsset.isNew ? 'New Asset' : 'Edit Asset'} onClose={() => setEditingAsset(null)} width={460}>
          <div className="space-y-3">
            <FInput label="Asset Name *" value={assetForm.name} onChange={(e: any) => setAssetForm(p => ({ ...p, name: e.target.value }))} />
            <FInput label="Asset ID / Tag" value={assetForm.assetTag} onChange={(e: any) => setAssetForm(p => ({ ...p, assetTag: e.target.value }))} />
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 block">Colour</label>
              <input type="color" value={assetForm.colour} onChange={(e: any) => setAssetForm(p => ({ ...p, colour: e.target.value }))} className="w-16 h-9 rounded cursor-pointer" />
            </div>
            <FArea label="Description" value={assetForm.description} onChange={(e: any) => setAssetForm(p => ({ ...p, description: e.target.value }))} rows={3} />
            <div className="flex justify-end gap-2 pt-2">
              <Btn size="sm" variant="secondary" onClick={() => setEditingAsset(null)}>Cancel</Btn>
              <Btn size="sm" onClick={submitAsset}>{editingAsset.isNew ? 'Create' : 'Update'}</Btn>
            </div>
          </div>
        </Modal>
      )}

      {editingStakeholder && (
        <Modal title={editingStakeholder.isNew ? 'New Stakeholder' : 'Edit Stakeholder'} onClose={() => setEditingStakeholder(null)} width={460}>
          <div className="space-y-3">
            <FInput label="Name *" value={stakeholderForm.name} onChange={(e: any) => setStakeholderForm(p => ({ ...p, name: e.target.value }))} />
            <FInput label="Role / Title" value={stakeholderForm.roleTitle} onChange={(e: any) => setStakeholderForm(p => ({ ...p, roleTitle: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Phone" value={stakeholderForm.phone} onChange={(e: any) => setStakeholderForm(p => ({ ...p, phone: e.target.value }))} />
              <FInput label="Email" value={stakeholderForm.email} onChange={(e: any) => setStakeholderForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <FInput label="Location" value={stakeholderForm.location} onChange={(e: any) => setStakeholderForm(p => ({ ...p, location: e.target.value }))} />
            <div className="flex justify-end gap-2 pt-2">
              <Btn size="sm" variant="secondary" onClick={() => setEditingStakeholder(null)}>Cancel</Btn>
              <Btn size="sm" onClick={submitStakeholder}>{editingStakeholder.isNew ? 'Create' : 'Update'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
