import React, { useState, useEffect } from 'react';
import { useCountry } from '../context/CountryContext';
import { districtsApi } from '../api';
import { usersApi } from '../api';
import { Plus, Landmark, AlertTriangle, Globe, MoreVertical } from 'lucide-react';
import { User } from '../types';
import { api } from '../api';
import { ROLE_CFG } from '../data';
import { Kicker, Btn, Card, FilterBar, TH, Badge, Modal, FInput, FSelect } from './SubComponents';

export interface UsersPageProps {
  user: User;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  showToast: (msg: string) => void;
  refreshUsers?: () => void;
}

// ─── MALAWI DISTRICTS BY REGION ──────────────────────────────────────────────
const DISTRICTS_BY_REGION: Record<string, string[]> = {
  Northern: [
    'Chitipa', 'Karonga', 'Likoma', 'Mzimba', 'Nkhata Bay', 'Rumphi',
  ],
  Central: [
    'Dedza', 'Dowa', 'Kasungu', 'Lilongwe', 'Mchinji', 'Nkhotakota',
    'Ntcheu', 'Ntchisi', 'Salima',
  ],
  Southern: [
    'Balaka', 'Blantyre', 'Chikwawa', 'Chiradzulu', 'Machinga', 'Mangochi',
    'Mulanje', 'Mwanza', 'Nsanje', 'Thyolo', 'Phalombe', 'Zomba', 'Neno',
  ],
};


// Which location fields each role needs
type LocationType = 'hq' | 'region' | 'district';
const ROLE_LOCATION: Record<string, LocationType> = {
  admin:                'hq',
  data_entry:           'hq',
  cartographer:         'hq',
  sasa_officer:         'hq',
  qa_officer:           'hq',
  planning_officer:     'hq',
  viewer:               'hq',
  program_manager:      'region',
  program_staff:        'region',
  tot:                  'district',
  district_coordinator: 'district',
  field_officer:        'district',
};

// Region badge colours
const REGION_COLORS: Record<string, { bg: string; text: string }> = {
  Northern: { bg: 'bg-blue-100 dark:bg-blue-950/40',   text: 'text-blue-700 dark:text-blue-300' },
  Central:  { bg: 'bg-green-100 dark:bg-green-950/40', text: 'text-green-700 dark:text-green-300' },
  Southern: { bg: 'bg-purple-100 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300' },
};

// Default form state
const BLANK_FORM = {
  first: '', last: '', email: '', password: '',
  role: 'tot' as string,
  country: '',
  region: '',
  district: '',
};

export const UsersPage: React.FC<UsersPageProps> = ({ user: cu, users, setUsers, showToast, refreshUsers }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [filt, setFilt]       = useState('all');
  const [regionFilt, setRegionFilt] = useState('all');
  const [search, setSearch]   = useState('');
  const [nf, setNf]           = useState(BLANK_FORM);
  const { activeCountry } = useCountry();
  const [liveRegions, setLiveRegions] = useState<string[]>([]);

  // Regions shown in the filter adapt to whichever country is currently selected
  useEffect(() => {
    if (!activeCountry || activeCountry === 'all') {
      setLiveRegions([]);
      return;
    }
    districtsApi.getAll(activeCountry).then((res: any) => {
      const list = Array.isArray(res) ? res : [];
      setLiveRegions(Array.from(new Set(list.map((d: any) => d.region).filter(Boolean))).sort());
    }).catch(() => setLiveRegions([]));
  }, [activeCountry]);

  // Reset region filter whenever the country changes, since regions don't carry over
  useEffect(() => { setRegionFilt('all'); }, [activeCountry]);
  // Regions for the Add User form adapt to whichever country is selected *in that form*,
  // which may differ from the globally active country.
  const [formRegions, setFormRegions] = useState<string[]>([]);
  const [formDistrictList, setFormDistrictList] = useState<any[]>([]);
  useEffect(() => {
    if (!nf.country) {
      setFormRegions([]);
      setFormDistrictList([]);
      return;
    }
    districtsApi.getAll(nf.country).then((res: any) => {
      const list = Array.isArray(res) ? res : [];
      setFormRegions(Array.from(new Set(list.map((d: any) => d.region).filter(Boolean))).sort());
      setFormDistrictList(list);
    }).catch(() => { setFormRegions([]); setFormDistrictList([]); });
  }, [nf.country]);

  if (cu.role !== 'admin') {
    return (
      <div className="p-12 text-center text-slate-400 font-semibold italic">
        Restricted to System Administrator only.
      </div>
    );
  }

  const sn = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setNf(p => ({ ...p, [k]: e.target.value }));

  // When role changes, reset location fields
  const changeRole = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNf(p => ({ ...p, role: e.target.value, region: '', district: '' }));
  };

  // When region changes, reset district
  const changeRegion = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNf(p => ({ ...p, region: e.target.value, district: '' }));
  };

  const locationType: LocationType = ROLE_LOCATION[nf.role] || 'hq';
  const availableDistricts = nf.region ? formDistrictList.filter((d: any) => d.region === nf.region).map((d: any) => d.name).sort() : [];

  // ─── ADD USER (Admin creates directly — status active) ─────────────────────
  const addUser = async () => {
    if (!nf.first || !nf.last || !nf.email || !nf.password) {
      showToast('Please fill in all required fields', 'warning'); return;
    }
    if (!nf.country) {
      showToast('Please select a country', 'warning'); return;
    }
    if (locationType === 'region' && !nf.region) {
      showToast('Please select a region for this role', 'warning'); return;
    }
    if (locationType === 'district' && (!nf.region || !nf.district)) {
      showToast('Please select both a region and district for this role', 'warning'); return;
    }

    try {
      const payload: Record<string, any> = {
        name: `${nf.first} ${nf.last}`,
        email: nf.email,
        password: nf.password,
        role: nf.role,
        country: nf.country,
        avatar: (nf.first[0] + nf.last[0]).toUpperCase(),
        region: locationType !== 'hq' ? nf.region : null,
        district: locationType === 'district' ? nf.district : null,
      };

      const created = await api.post('/api/users/admin/create', payload);

 if (created.error) { showToast(`️ ${created.error}`, 'warning'); return; }

 setUsers(p => [created, ...p]);
 setShowAdd(false);
 setNf(BLANK_FORM);
 showToast(`${created.name} added and activated`, 'success');
 refreshUsers?.();
 } catch {
 showToast('Failed to create user. Check the server.', 'warning');
    }
  };

  // ─── FILTER USERS ──────────────────────────────────────────────────────────
  const visible = users.filter(u => {
    // The backend already only ever returns this Admin's own country's users
    // (pending and active alike), so no extra pending-specific override is needed here.
    if (activeCountry && activeCountry !== 'all' && (u as any).country !== activeCountry) return false;
    if (filt !== 'all' && u.role !== filt) return false;
    if (regionFilt !== 'all') {
      if (regionFilt === 'hq' && u.region) return false;
      if (regionFilt !== 'hq'&& u.region !== regionFilt) return false;
 }
 const q = search.toLowerCase();
 if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
 return true;
 });

 // ─── LOCATION DISPLAY HELPER ───────────────────────────────────────────────
 const locationDisplay = (u: User) => {
 const rc = u.region ? REGION_COLORS[u.region] : null;
 if (!u.region && !u.district) {
 return <span className="text-slate-400 text-[10px] font-medium italic">HQ / National</span>;
 }
 return (
 <div className="flex flex-col gap-1">
 {u.region && (
 <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${rc?.bg} ${rc?.text}`}>
 {u.region}
 </span>
 )}
 {u.district && (
 <span className="text-[10.5px] text-slate-500 dark:text-slate-400 font-semibold pl-0.5">
 {u.district}
 </span>
 )}
 </div>
 );
 };

 return (
 <div className="space-y-5 animate-fade-in-up">
 {/* ── Page Header ──────────────────────────────────────────────────────── */}
 <div className="flex justify-between items-end">
 <div>
 <Kicker text="Staff Alignment"/>
 <h1 className="text-base font-bold text-black dark:text-white m-0">Personnel Directory</h1>
 <p className="text-xs text-black dark:text-white opacity-80 mt-1 m-0">
 Manage district coordinators, certified TOTs, and programme staff by location.
 </p>
 </div>
 <Btn onClick={() => setShowAdd(true)}><Plus size={14} className="inline mr-1"/> Add User</Btn>
 </div>

 {/* ── Stats Summary ─────────────────────────────────────────────────── */}
 <div className="grid grid-cols-4 gap-3">
 {(() => {
 const countryUsers = activeCountry && activeCountry !== 'all'
            ? users.filter(u => (u as any).country === activeCountry)
            : users;
          const fallbackColor = { bg: 'bg-slate-100 dark:bg-slate-800/50', text: 'text-slate-700 dark:text-slate-200' };
          const regionsToShow = liveRegions.length > 0 ? liveRegions : ['Northern', 'Central', 'Southern'];
          return (
            <>
              {regionsToShow.map(r => {
                const rc = REGION_COLORS[r] || fallbackColor;
                const count = countryUsers.filter(u => u.region === r).length;
                return (
                  <div key={r} className={`rounded-xl p-3 border ${rc.bg} border-transparent`}>
                    <div className={`text-lg font-black ${rc.text}`}>{count}</div>
                    <div className={`text-[10px] font-bold ${rc.text} opacity-80`}>{r} Region</div>
                  </div>
                );
              })}
              <div className="rounded-xl p-3 border bg-slate-100 dark:bg-slate-800/50 border-transparent">
                <div className="text-lg font-black text-slate-700 dark:text-slate-200">
                  {countryUsers.filter(u => !u.region).length}
                </div>
                <div className="text-[10px] font-bold text-slate-500">HQ / National</div>
              </div>
            </>
          );
        })()}
      </div>

      <Card>
        {/* ── Role Filter ────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 px-1 pb-3">
          <select
            value={filt}
            onChange={e => setFilt(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            {[
              'all', 'admin', 'tot', 'data_entry', 'district_coordinator',
              'sasa_officer', 'qa_officer', 'planning_officer', 'cartographer', 'program_manager', 'field_officer'
            ].map(x => (
              <option key={x} value={x}>
                {x === 'all' ? 'ALL STAFF' : (ROLE_CFG[x as keyof typeof ROLE_CFG]?.label.toUpperCase() || x.toUpperCase())}
              </option>
            ))}
          </select>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search staff name or email..."
            className="flex-1 min-w-[180px] px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          />
        </div>

        {/* ── Region Filter ───────────────────────────────────────────────────── */}
        <div className="flex gap-2 px-1 pb-3 flex-wrap">
          {['all', ...liveRegions, 'hq'].map(r => (
            <button
              key={r}
              onClick={() => setRegionFilt(r)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                regionFilt === r
                  ? 'bg-[var(--brand-600)] text-white border-[var(--brand-600)]'
                  : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-[var(--brand-400)]'
              }`}
            >
              {r === 'all' ? 'ALL REGIONS' : r === 'hq' ? 'HQ ONLY': `${r.toUpperCase()}`}
            </button>
          ))}
        </div>

 {/* ── Users Table ─────────────────────────────────────────────────────── */}
 <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800/60 w-full">
 <table className="w-full border-collapse text-left text-xs min-w-[800px]">
 <TH cols={['Consultant Details', 'Designation', 'Location', 'Status', 'Last Seen', 'Actions']} />
            <tbody>
              {visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 italic text-xs">
                    No users match the current filters.
                  </td>
                </tr>
              )}
              {visible.map(u => {
                const config = ROLE_CFG[u.role as keyof typeof ROLE_CFG];
                return (
                  <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">

                    {/* Name + Email */}
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-[var(--brand-600)] shrink-0">
                          {u.avatar}
                        </span>
                        <div>
                          <div className="font-bold text-black dark:text-white">{u.name}</div>
                          <div className="text-[10.5px] text-slate-400 mt-0.5">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role badge */}
                    <td className="p-3">
                      <Badge text={config?.label || u.role} color={config?.color} bg={config?.bg} />
                    </td>

                    {/* Location: Region + District */}
                    <td className="p-3">{locationDisplay(u)}</td>

                    {/* Status */}
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-xs">
                        <span className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : u.status === 'inactive' ? 'bg-slate-400' : 'bg-amber-500'}`} />
                        {u.status.toUpperCase()}
                      </span>
                    </td>

                    {/* Last Seen / Online status */}
                    <td className="p-3">
                      {(() => {
                        const lastActive = u.lastActiveAt ? new Date(u.lastActiveAt) : null;
                        const isOnline = lastActive && (Date.now() - lastActive.getTime()) < 5 * 60 * 1000;
                        return isOnline ? (
                          <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 text-[11px]">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Online
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            {lastActive ? lastActive.toLocaleString() : 'Never logged in'}
                          </span>
                        );
                      })()}
                    </td>

                    {/* Action buttons */}
                    <td className="p-3">
                      <div className="flex gap-1.5 flex-wrap">

                        {/* ── PENDING users: Activate with role + location assignment ── */}
                        {u.status === 'pending' && (
                          <PendingUserActions u={u} setUsers={setUsers} showToast={showToast} cu={cu} refreshUsers={refreshUsers} />
                        )}

                        {/* ── ACTIVE users: Change role / suspend / delete ── */}
                        {u.status === 'inactive' && u.id !== cu.id && (
                          <Btn size="sm" variant="secondary" className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" onClick={async () => {
                            try {
                              await api.put(`/api/users/${u.id}`, {
                                name: u.name, district: u.district, region: u.region,
                                avatar: u.avatar, status: 'active', clusterId: u.clusterId, role: u.role,
                              });
                              setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: 'active' as const } : x));
                              showToast(`Reactivated ${u.name}`, 'success');
                              refreshUsers?.();
                            } catch { showToast('Failed to reactivate user', 'warning'); }
                          }}>
                            Reactivate
                          </Btn>
                        )}
                        {u.status === 'active' && u.id !== cu.id && (
                          <ActiveUserActions u={u} setUsers={setUsers} showToast={showToast} refreshUsers={refreshUsers} />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── ADD USER MODAL ─────────────────────────────────────────────────── */}
      {showAdd && (
        <Modal title="Add New Staff Member" onClose={() => { setShowAdd(false); setNf(BLANK_FORM); }}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FInput label="First Name *" value={nf.first} onChange={sn('first')} />
              <FInput label="Last Name *"  value={nf.last}  onChange={sn('last')}  />
            </div>
            <FInput label="Email Address *" type="email" value={nf.email} onChange={sn('email')} placeholder="user@example.com" />
            <FInput label="Temporary Password *" type="password" value={nf.password} onChange={sn('password')} placeholder="Min 6 characters" />

            {/* Role */}
            <FSelect label="Designation / Role *" value={nf.role} onChange={changeRole}>
              <option value="tot">Trainer of Trainers (TOT)</option>
              <option value="district_coordinator">District Coordinator (DC)</option>
              <option value="program_manager">Regional / Program Manager</option>
              <option value="field_officer">Field Officer</option>
              <option value="sasa_officer">SASA Officer</option>
              <option value="qa_officer">Quality Assurance Officer</option>
              <option value="planning_officer">Planning & Scheduling Officer</option>
              <option value="data_entry">M & E Officer</option>
              <option value="cartographer">Cartographer</option>
              <option value="admin">System Admin</option>
            </FSelect>
            {/* Country */}
            <FSelect label="Country *" value={nf.country} onChange={sn('country')}>
              <option value="">— Select Country —</option>
              <option value="Malawi">Malawi</option>
              <option value="Kenya">Kenya</option>
              <option value="Somaliland">Somaliland</option>
            </FSelect>

            {/* HQ notice */}
            {locationType === 'hq'&& (
 <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 text-[11px] text-blue-700 dark:text-blue-300 font-semibold">
 ️ This role is based at National HQ — no region or district needed.
 </div>
 )}

 {/* Region picker */}
 {(locationType === 'region' || locationType === 'district') && (
              <FSelect label={`Region *`} value={nf.region} onChange={changeRegion}>
                <option value="">— Select Region —</option>
                {formRegions.map(r => <option key={r} value={r}>{r} Region</option>)}
                <option value="HQ">HQ</option>
              </FSelect>
            )}

            {/* District picker — only shows after region is selected */}
            {locationType === 'district' && nf.region && (
              <FSelect label="District *" value={nf.district} onChange={sn('district')}>
                <option value="">— Select District in {nf.region} —</option>
                {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
              </FSelect>
            )}

            {/* Location summary */}
            {(nf.region || locationType === 'hq') && (
 <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-[var(--brand-50)] dark:bg-[var(--brand-950)]/20 border border-[var(--brand-200)] dark:border-[var(--brand-900)]/30 text-[11px] text-[var(--brand-700)] dark:text-[var(--brand-300)]">
 <span></span>
 <span>
 {locationType === 'hq' && 'User will be placed at National HQ.'}
                  {locationType === 'region' && nf.region && `User will be placed in ${nf.region} Region.`}
                  {locationType === 'district' && nf.region && !nf.district && `Select a district in ${nf.region} Region.`}
                  {locationType === 'district' && nf.district && `User will be placed in ${nf.district} District, ${nf.region} Region.`}
                </span>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-2">
              <Btn variant="secondary" size="sm" onClick={() => { setShowAdd(false); setNf(BLANK_FORM); }}>Cancel</Btn>
              <Btn onClick={addUser} size="sm">Create & Activate</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── PENDING USER ACTIONS ─────────────────────────────────────────────────────
// Shown for users who self-registered and are awaiting Admin activation.
// Admin can see what region/district they claimed and assign the real role before activating.
const PendingUserActions: React.FC<{
  u: User;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  showToast: (msg: string) => void;
  cu: User;
  refreshUsers?: () => void;
}> = ({ u, setUsers, showToast, refreshUsers }) => {
  const [selectedRole, setSelectedRole] = useState(u.role === 'viewer' ? '' : u.role);
  const [selectedRegion, setSelectedRegion] = useState(u.region || '');
  const [selectedDistrict, setSelectedDistrict] = useState(u.district || '');
  const [countryRegions, setCountryRegions] = useState<string[]>([]);
  const [countryDistricts, setCountryDistricts] = useState<any[]>([]);

  // Regions/districts must match the PENDING USER'S OWN country -- not whatever
  // country the Admin currently has selected on the dashboard.
  useEffect(() => {
    districtsApi.getAll((u as any).country).then((res: any) => {
      const list = Array.isArray(res) ? res : [];
      setCountryDistricts(list);
      setCountryRegions(Array.from(new Set(list.map((d: any) => d.region).filter(Boolean))).sort());
    }).catch(() => {});
  }, [(u as any).country]);

  const locationType: LocationType = ROLE_LOCATION[selectedRole] || 'hq';
  const districts = selectedRegion
    ? countryDistricts.filter((d: any) => d.region === selectedRegion).map((d: any) => d.name)
    : [];

  const activate = async () => {
    if (locationType === 'region' && !selectedRegion) {
      showToast('Please assign a region before activating', 'warning'); return;
    }
    if (locationType === 'district' && (!selectedRegion || !selectedDistrict)) {
      showToast('Please assign both a region and district before activating', 'warning'); return;
    }
    try {
      await api.put(`/api/users/${u.id}`, {
        name: u.name,
        district: locationType === 'district' ? selectedDistrict : null,
        region: locationType !== 'hq' ? selectedRegion : null,
        avatar: u.avatar,
        status: 'active',
        clusterId: u.clusterId,
        role: selectedRole,
      });
      setUsers(prev => prev.map(x => x.id === u.id
        ? { ...x, status: 'active' as const, role: selectedRole as any, region: selectedRegion || null, district: locationType === 'district'? selectedDistrict : null }
 : x
 ));
 showToast(`${u.name} activated as ${selectedRole} in ${selectedDistrict || selectedRegion || 'HQ'}`, 'success');
      refreshUsers?.();
    } catch {
      showToast('Failed to activate user', 'warning');
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {/* Show what the user claimed during registration */}
      {(u.region || u.district) && (
        <div className="text-[9.5px] text-slate-400 italic px-0.5">
          Claimed: {[u.district, u.region].filter(Boolean).join(', ')}
        </div>
      )}
      <select
        className="text-xs border border-neutral-200 dark:border-slate-700 rounded-md px-2 py-1 bg-white dark:bg-slate-800 text-black dark:text-white"
        value={selectedRole}
        onChange={e => { setSelectedRole(e.target.value); setSelectedRegion(''); setSelectedDistrict(''); }}
      >
        <option value="tot">TOT</option>
        <option value="district_coordinator">District Coordinator</option>
        <option value="program_manager">Program Manager</option>
        <option value="field_officer">Field Officer</option>
        <option value="sasa_officer">SASA Officer</option>
        <option value="qa_officer">Quality Assurance Officer</option>
        <option value="planning_officer">Planning & Scheduling Officer</option>
        <option value="data_entry">M & E Officer</option>
        <option value="cartographer">Cartographer</option>
        <option value="admin">Admin</option>
      </select>

      {/* Region selector for region/district roles */}
      {(locationType === 'region' || locationType === 'district') && (
        <select
          className="text-xs border border-neutral-200 dark:border-slate-700 rounded-md px-2 py-1 bg-white dark:bg-slate-800 text-black dark:text-white"
          value={selectedRegion}
          onChange={e => { setSelectedRegion(e.target.value); setSelectedDistrict(''); }}
        >
          <option value="">— Region —</option>
          {countryRegions.map(r => <option key={r} value={r}>{r}</option>)}
          <option value="HQ">HQ</option>
        </select>
      )}

      {/* District selector */}
      {locationType === 'district' && selectedRegion && (
        <select
          className="text-xs border border-neutral-200 dark:border-slate-700 rounded-md px-2 py-1 bg-white dark:bg-slate-800 text-black dark:text-white"
          value={selectedDistrict}
          onChange={e => setSelectedDistrict(e.target.value)}
        >
          <option value="">— District —</option>
          {districts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      )}

      <Btn size="sm" variant="success" onClick={activate}>Activate</Btn>
    </div>
  );
};

// ─── ACTIVE USER ACTIONS ──────────────────────────────────────────────────────
const ActiveUserActions: React.FC<{
  u: User;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  showToast: (msg: string) => void;
  refreshUsers?: () => void;
}> = ({ u, setUsers, showToast, refreshUsers }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditLog, setAuditLog] = useState<any[]>([]);

  const suspend = async () => {
    try {
      await api.put(`/api/users/${u.id}`, {
        name: u.name, district: u.district, region: u.region,
        avatar: u.avatar, status: 'pending', clusterId: u.clusterId, role: u.role,
      });
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: 'pending' as const } : x));
      showToast(`Suspended ${u.name}`);
      refreshUsers?.();
    } catch { showToast('Failed to suspend user', 'warning'); }
  };

  const deactivate = async () => {
    if (!confirm(`Deactivate ${u.name}? They will lose access immediately. If they're a District Coordinator, their district(s) will be freed up to assign to someone else -- all of their historical reports and trainings stay exactly as they are.`)) return;
    try {
      await api.put(`/api/users/${u.id}`, {
        name: u.name, district: u.district, region: u.region,
        avatar: u.avatar, status: 'inactive', clusterId: u.clusterId, role: u.role,
      });
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: 'inactive' as const } : x));
      showToast(`Deactivated ${u.name}`, 'success');
      refreshUsers?.();
    } catch { showToast('Failed to deactivate user', 'warning'); }
  };

  const remove = async () => {
    if (!confirm(`Delete ${u.name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/users/${u.id}`);
      setUsers(prev => prev.filter(x => x.id !== u.id));
      showToast(`${u.name} deleted`, 'success');
      refreshUsers?.();
    } catch { showToast('Failed to delete user', 'warning'); }
  };

  const resetPassword = async () => {
    try {
      const data = await usersApi.adminResetPassword(u.id);
      if (data.error) { showToast(data.error, 'warning'); return; }
      showToast(data.message || `Reset link sent to ${u.email}`, 'success');
    } catch { showToast('Failed to send reset email', 'warning'); }
  };

  const openAuditLog = async () => {
    setMenuOpen(false);
    setAuditOpen(true);
    try {
      const data = await usersApi.getAuditLog(u.id);
      setAuditLog(Array.isArray(data) ? data : []);
    } catch { setAuditLog([]); }
  };

  const menuItem = (label: string, onClick: () => void, colorClass: string) => (
    <button
      onClick={() => { setMenuOpen(false); onClick(); }}
      className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-md hover:bg-neutral-100 dark:hover:bg-slate-800 transition-colors ${colorClass}`}
    >
      {label}
    </button>
  );

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setMenuOpen(v => !v)}
        className="w-8 h-8 flex items-center justify-center rounded-md border border-neutral-200 dark:border-slate-700 text-slate-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="User actions"
      >
        <MoreVertical size={16} />
      </button>
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-9 z-50 w-44 rounded-xl border border-neutral-200 dark:border-slate-700 bg-white dark:bg-[#0f1623] shadow-xl p-1.5 space-y-0.5">
            {menuItem('Suspend', suspend, 'text-amber-600')}
            {menuItem('Deactivate', deactivate, 'text-slate-600 dark:text-slate-300')}
            {menuItem('Reset Password', resetPassword, 'text-blue-600')}
            {menuItem('Audit Log', openAuditLog, 'text-black dark:text-white')}
            <div className="border-t border-neutral-100 dark:border-slate-800 my-1" />
            {menuItem('Delete', remove, 'text-red-600')}
          </div>
        </>
      )}
      {auditOpen && (
        <Modal title={`Audit Log — ${u.name}`} onClose={() => setAuditOpen(false)} width={480}>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {auditLog.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-6">No audit history yet.</div>
            ) : (
              auditLog.map((entry: any) => (
                <div key={entry.id} className="text-xs border-b border-neutral-100 dark:border-slate-800 pb-2">
                  <div className="font-bold text-black dark:text-white">{entry.action.replace(/_/g, ' ')}</div>
                  <div className="text-slate-500">{entry.details}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(entry.created_at).toLocaleString()} · by {entry.actor_name || 'System'}
                  </div>
                </div>
              ))
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
