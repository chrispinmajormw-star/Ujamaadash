import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { User } from '../types';
import { api } from '../api';
import { ROLE_CFG, DISTRICT_LIST } from '../data';
import { Kicker, Btn, Card, FilterBar, TH, Badge, Modal, FInput, FSelect } from './SubComponents';

export interface UsersPageProps {
  user: User;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  showToast: (msg: string) => void;
}

export const UsersPage: React.FC<UsersPageProps> = ({ user: cu, users, setUsers, showToast }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [filt, setFilt] = useState("all");
  const [search, setSearch] = useState("");
  const [nf, setNf] = useState({ first: "", last: "", email: "", role: "data_entry" as any, district: "" });

  if (cu.role !== 'admin') {
    return <div className="p-12 text-center text-slate-400 font-semibold italic">Restricted to Central National Admin only.</div>;
  }

  const sn = (k: string) => (e: any) => setNf(p => ({ ...p, [k]: e.target.value }));

  const addUser = () => {
    if (!nf.first || !nf.last || !nf.email) { showToast("⚠️ Fill in user coordinates"); return; }
    const newUser: User = {
      id: Date.now().toString(),
      email: nf.email,
      password: "temp123",
      role: nf.role,
      name: `${nf.first} ${nf.last}`,
      district: nf.district || null,
      avatar: (nf.first[0] + nf.last[0]).toUpperCase(),
      status: 'pending'
    };
    setUsers(p => [newUser, ...p]);
    setShowAdd(false);
    setNf({ first: "", last: "", email: "", role: "data_entry", district: "" });
    showToast(`✅ Profile for ${newUser.name} ready — awaiting activation`);
  };

  const visible = users.filter(u => {
    if (filt !== "all" && u.role !== filt) return false;
    const q = search.toLowerCase();
    if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex justify-between items-end">
        <div>
          <Kicker text="Staff Alignment" />
          <h1 className="text-base font-bold text-black dark:text-white m-0">Personnel Directory</h1>
          <p className="text-xs text-black dark:text-white opacity-80 mt-1 m-0">Deploy district coordinators, certified TOTs, and alignment advocates.</p>
        </div>
        <Btn onClick={() => setShowAdd(true)}><Plus size={14} className="inline mr-1" /> Add User</Btn>
      </div>

      <Card>
        <FilterBar
          options={["all", "admin", "tot", "data_entry", "district_coordinator", "sasa_officer", "cartographer"].map(x => ({
            v: x,
            l: x === 'all' ? 'ALL STAFF' : ROLE_CFG[x as keyof typeof ROLE_CFG]?.label.toUpperCase() || x
          }))}
          active={filt}
          onChange={setFilt}
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search staff name..."
        />

        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800/60">
          <table className="w-full border-collapse text-left text-xs">
            <TH cols={["Consultant details", "Certified Position", "Region Boundary", "Security State", "Action Panels"]} />
            <tbody>
              {visible.map((u, i) => {
                const config = ROLE_CFG[u.role as keyof typeof ROLE_CFG];
                return (
                  <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800/40">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-orange-600">
                          {u.avatar}
                        </span>
                        <div>
                          <div className="font-bold text-black dark:text-white">{u.name}</div>
                          <div className="text-[10.5px] text-slate-400 mt-0.5">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge text={config?.label || u.role} color={config?.color} bg={config?.bg} />
                    </td>
                    <td className="p-3 text-slate-500 font-semibold">{u.district || "National alignment"}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-xs leading-normal">
                        <span className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {u.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1.5">
                        {u.status === "pending" && (
                          <div className="flex gap-1.5 flex-wrap">
                            <select
                              className="text-xs border border-neutral-200 dark:border-slate-700 rounded-md px-2 py-1 bg-white dark:bg-slate-800 text-black dark:text-white"
                              defaultValue={u.role}
                              onChange={e => setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: e.target.value as any } : x))}
                            >
                              <option value="viewer">Viewer</option>
                              <option value="tot">TOT</option>
                              <option value="data_entry">Data Entry</option>
                              <option value="district_coordinator">District Coordinator</option>
                              <option value="sasa_officer">SASA Officer</option>
                              <option value="admin">Admin</option>
                            </select>
                            <Btn size="sm" variant="success" onClick={async () => {
                              const selectedRole = (document.querySelector(`[data-user-id="${u.id}"]`) as HTMLSelectElement)?.value || u.role;
                              try {
                                await api.put(`/api/users/${u.id}`, {
                                  name: u.name,
                                  district: u.district,
                                  avatar: u.avatar,
                                  status: 'active',
                                  clusterId: u.clusterId,
                                  role: selectedRole,
                                });
                                setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: "active" as const, role: selectedRole as any } : x));
                                showToast(`✅ ${u.name} activated successfully`);
                              } catch (err) {
                                showToast(`⚠️ Failed to activate user`);
                              }
                            }}>
                              Activate
                            </Btn>
                          </div>
                        )}
                        {u.status === "active" && u.id !== cu.id && (
  <div className="flex gap-1.5 flex-wrap">
    <select
      className="text-xs border border-neutral-200 dark:border-slate-700 rounded-md px-2 py-1 bg-white dark:bg-slate-800 text-black dark:text-white"
      value={u.role}
      onChange={async e => {
        const newRole = e.target.value;
        try {
          await api.put(`/api/users/${u.id}`, {
            name: u.name, district: u.district, avatar: u.avatar,
            status: u.status, clusterId: u.clusterId, role: newRole,
          });
          setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: newRole as any } : x));
          showToast(`✅ Role updated to ${newRole}`);
        } catch { showToast('⚠️ Failed to update role'); }
      }}
    >
      <option value="viewer">Viewer</option>
      <option value="tot">TOT</option>
      <option value="data_entry">Data Entry</option>
      <option value="district_coordinator">District Coordinator</option>
      <option value="sasa_officer">SASA Officer</option>
      <option value="program_manager">Program Manager</option>
      <option value="field_officer">Field Officer</option>
      <option value="cartographer">Cartographer</option>
    </select>
    <Btn size="sm" variant="secondary" className="text-amber-600 bg-amber-50 dark:bg-amber-950/20" onClick={async () => {
      await api.put(`/api/users/${u.id}`, {
        name: u.name, district: u.district, avatar: u.avatar,
        status: 'pending', clusterId: u.clusterId, role: u.role,
      });
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: "pending" as const } : x));
      showToast(`Suspended ${u.name}`);
    }}>
      Suspend
    </Btn>
    <Btn size="sm" variant="secondary" className="text-red-600 bg-red-50 dark:bg-red-950/20" onClick={async () => {
      if (!confirm(`Delete ${u.name}? This cannot be undone.`)) return;
      try {
        await api.delete(`/api/users/${u.id}`);
        setUsers(prev => prev.filter(x => x.id !== u.id));
        showToast(`🗑️ ${u.name} deleted`);
      } catch { showToast('⚠️ Failed to delete user'); }
    }}>
      Delete
    </Btn>
  </div>
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

      {showAdd && (
        <Modal title="Deploy New ETT Consultant Profile" onClose={() => setShowAdd(false)}>
          <div className="grid grid-cols-2 gap-3">
            <FInput label="First Name *" value={nf.first} onChange={sn("first")} />
            <FInput label="Last Name *" value={nf.last} onChange={sn("last")} />
          </div>
          <FInput label="Email address *" type="email" value={nf.email} onChange={sn("email")} placeholder="champion@ujamaa.mw" />
          <FSelect label="Certified ETT Position *" value={nf.role} onChange={sn("role")}>
            <option value="tot">Trainer of Trainers (TOT)</option>
            <option value="district_coordinator">District Coordinator (DC)</option>
            <option value="data_entry">Data Entry Officer</option>
            <option value="viewer">Basic View Inspector</option>
          </FSelect>
          <FSelect label="Assigned Region" value={nf.district} onChange={sn("district")}>
            <option value="">Choose District (None/National)</option>
            {DISTRICT_LIST.map(d => <option key={d}>{d}</option>)}
          </FSelect>
          <div className="flex gap-2 justify-end pt-3">
            <Btn variant="secondary" size="sm" onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn onClick={addUser} size="sm">Deploy Profile</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};
