import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Globe, MapPin, Upload, FileText, CheckCircle2 } from 'lucide-react';
import { Card, Kicker, PageHeader, Btn, FInput, FSelect } from './SubComponents';
import { districtsApi } from '../api';
import { useCountry } from '../context/CountryContext';

// Kenya calls this administrative division a "County"; everyone else calls it a "District".
const termFor = (country?: string) => country === 'Kenya' ? 'County' : 'District';

interface District {
  id: number;
  name: string;
  region: string;
  country: string;
  status: string;
  tots: number;
  schools: number;
  coverage: number;
  population: string;
  zones: number;
  teachers_trained: number;
}

const BLANK: Partial<District> = {
  name: '', region: '', country: 'Malawi', status: 'Planned',
  tots: 0, schools: 0, coverage: 0, population: '', zones: 0, teachers_trained: 0,
};

export const AdminDistrictsPage: React.FC = () => {
  const { districtTermPlural } = useCountry();
  const [districts, setDistricts] = useState<District[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [editing, setEditing] = useState<Partial<District> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<District | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ inserted: number; updated: number; errors: number } | null>(null);
  const [newCountryMode, setNewCountryMode] = useState(false);
  const [newCountryName, setNewCountryName] = useState('');

  const load = async () => {
    setLoading(true);
    const [d, c] = await Promise.all([
      districtsApi.getAll(),
      districtsApi.getCountries(),
    ]);
    setDistricts(Array.isArray(d) ? d : []);
    setCountries(Array.isArray(c) ? c : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = countryFilter === 'all' ? districts : districts.filter(d => d.country === countryFilter);

  const grouped: Record<string, District[]> = {};
  filtered.forEach(d => {
    if (!grouped[d.country]) grouped[d.country] = [];
    grouped[d.country].push(d);
  });

  const openNew = () => {
    setEditing({ ...BLANK });
    setIsNew(true);
    setNewCountryMode(false);
    setNewCountryName('');
  };

  const CSV_HEADERS = ['name', 'region', 'country', 'status', 'tots', 'schools', 'coverage', 'population', 'zones', 'teachersTrained'];

  const parseCsv = (text: string) => {
    const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) {
      setImportPreview([]);
      setImportErrors(['CSV must have a header row plus at least one data row.']);
      return;
    }
    const headers = lines[0].split(',').map(h => h.trim());
    const missingRequired = ['name', 'region', 'country'].filter(h => !headers.includes(h));
    if (missingRequired.length > 0) {
      setImportPreview([]);
      setImportErrors([`Missing required column(s): ${missingRequired.join(', ')}. Expected header: ${CSV_HEADERS.join(',')}`]);
      return;
    }
    const rows: any[] = [];
    const errors: string[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(',').map(c => c.trim());
      const row: any = {};
      headers.forEach((h, idx) => { row[h] = cells[idx] ?? ''; });
      if (!row.name || !row.region || !row.country) {
        errors.push(`Row ${i + 1}: missing name, region, or country — skipped.`);
        continue;
      }
      row.tots = parseInt(row.tots) || 0;
      row.schools = parseInt(row.schools) || 0;
      row.coverage = parseInt(row.coverage) || 0;
      row.zones = parseInt(row.zones) || 0;
      row.teachersTrained = parseInt(row.teachersTrained) || 0;
      row.status = row.status || 'Planned';
      rows.push(row);
    }
    setImportPreview(rows);
    setImportErrors(errors);
  };

  const handleCsvTextChange = (text: string) => {
    setCsvText(text);
    setImportResult(null);
    if (text.trim()) parseCsv(text);
    else { setImportPreview([]); setImportErrors([]); }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      handleCsvTextChange(text);
    };
    reader.readAsText(file);
  };

  const runImport = async () => {
    if (importPreview.length === 0) return;
    setImporting(true);
    try {
      const res: any = await districtsApi.bulkImport(importPreview);
      setImportResult(res.summary);
      await load();
    } catch (err: any) {
      setImportErrors([err.message || 'Import failed.']);
    }
    setImporting(false);
  };

  const closeImport = () => {
    setShowImport(false);
    setCsvText('');
    setImportPreview([]);
    setImportErrors([]);
    setImportResult(null);
  };

  const openEdit = (d: District) => {
    setEditing({ ...d });
    setIsNew(false);
    setNewCountryMode(false);
    setNewCountryName('');
  };

  const closeModal = () => {
    setEditing(null);
    setIsNew(false);
  };

  const handleSave = async () => {
    if (!editing?.name || !editing?.region) return;
    const finalCountry = newCountryMode && newCountryName.trim() ? newCountryName.trim() : editing.country;
    setSaving(true);
    try {
      if (isNew) {
        await districtsApi.create({
          name: editing.name,
          region: editing.region,
          status: editing.status,
          tots: editing.tots || 0,
          schools: editing.schools || 0,
          coverage: editing.coverage || 0,
          population: editing.population || '',
          zones: editing.zones || 0,
          teachersTrained: editing.teachers_trained || 0,
          country: finalCountry,
        });
      } else {
        await districtsApi.update(editing.name!, {
          region: editing.region,
          status: editing.status,
          tots: editing.tots || 0,
          schools: editing.schools || 0,
          coverage: editing.coverage || 0,
          population: editing.population || '',
          zones: editing.zones || 0,
          teachersTrained: editing.teachers_trained || 0,
          country: finalCountry,
        });
      }
      closeModal();
      await load();
    } catch (err: any) {
      alert(err.message || 'Failed to save district.');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await districtsApi.delete(confirmDelete.name);
      setConfirmDelete(null);
      await load();
    } catch (err: any) {
      alert(err.message || 'Failed to delete district.');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in-up max-w-5xl mx-auto pb-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title={`${districtTermPlural} & Countries`} subtitle={`Manage ${districtTermPlural.toLowerCase()}, regions, and countries across the system.`} />
        <div className="flex items-center gap-2">
          <Btn variant="secondary" onClick={() => setShowImport(true)}><Upload size={14} /> Bulk Import</Btn>
          <Btn onClick={openNew}><Plus size={14} /> Add {districtTermPlural.slice(0, -1)}</Btn>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => setCountryFilter('all')}
          className={`px-3 py-1.5 text-[11px] font-bold rounded-full border transition ${countryFilter === 'all' ? 'border-[var(--brand)] text-[var(--brand)] bg-[var(--brand-50)] dark:bg-[var(--brand-950)]/20' : 'border-neutral-200 dark:border-slate-700 text-slate-500 hover:border-[var(--brand)]'}`}
        >
          All Countries
        </button>
        {countries.map(c => (
          <button
            key={c}
            onClick={() => setCountryFilter(c)}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-full border transition ${countryFilter === c ? 'border-[var(--brand)] text-[var(--brand)] bg-[var(--brand-50)] dark:bg-[var(--brand-950)]/20' : 'border-neutral-200 dark:border-slate-700 text-slate-500 hover:border-[var(--brand)]'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-slate-400">Loading districts…</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-12 text-sm text-slate-400">No districts found.</div>
      ) : (
        Object.entries(grouped).map(([country, list]) => (
          <Card key={country} className="p-0 overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-2 border-b border-neutral-100 dark:border-slate-800 bg-neutral-50 dark:bg-slate-900/40">
              <Globe size={14} className="text-[var(--brand-500)]" />
              <h3 className="font-bold text-sm text-black dark:text-white m-0">{country}</h3>
              <span className="text-[11px] text-slate-400">{list.length} districts</span>
            </div>
            <div className="divide-y divide-neutral-100 dark:divide-slate-800">
              {list.map(d => (
                <div key={d.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-slate-900/30">
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin size={13} className="text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-black dark:text-white truncate">{d.name}</div>
                      <div className="text-[11px] text-slate-400">{d.region} · {d.status} · {d.tots || 0} TOTs · {d.schools || 0} schools</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => openEdit(d)} className="w-7 h-7 flex items-center justify-center rounded-lg border border-neutral-200 dark:border-slate-700 text-slate-400 hover:border-[var(--brand)] hover:text-[var(--brand)] transition">
                      <Edit2 size={12} />
                    </button>
                    <button onClick={() => setConfirmDelete(d)} className="w-7 h-7 flex items-center justify-center rounded-lg border border-neutral-200 dark:border-slate-700 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20 transition">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))
      )}

      {/* ── ADD/EDIT MODAL ── */}
      {editing && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f1623] rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-black dark:text-white m-0">{isNew ? `Add ${termFor(editing.country)}` : `Edit ${editing.name}`}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-black dark:hover:text-white"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-3">
              <FInput label={`${termFor(editing.country)} Name *`} value={editing.name || ''} onChange={e => setEditing(p => ({ ...p!, name: e.target.value }))} disabled={!isNew} />

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Country *</label>
                {!newCountryMode ? (
                  <div className="flex items-center gap-2 mt-1">
                    <select
                      value={editing.country || ''}
                      onChange={e => setEditing(p => ({ ...p!, country: e.target.value }))}
                      className="flex-1 px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-slate-700 bg-white dark:bg-[#0f1623] text-black dark:text-white"
                    >
                      {countries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button
                      type="button"
                      onClick={() => setNewCountryMode(true)}
                      className="px-2.5 py-2 text-[11px] font-bold rounded-lg border border-neutral-200 dark:border-slate-700 text-slate-500 hover:border-[var(--brand)] hover:text-[var(--brand)] whitespace-nowrap"
                    >
                      + New
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      value={newCountryName}
                      onChange={e => setNewCountryName(e.target.value)}
                      placeholder="e.g. Uganda"
                      className="flex-1 px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-slate-700 bg-white dark:bg-[#0f1623] text-black dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setNewCountryMode(false)}
                      className="px-2.5 py-2 text-[11px] font-bold rounded-lg border border-neutral-200 dark:border-slate-700 text-slate-500"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                {newCountryMode && (
                  <p className="text-[10px] text-slate-400 mt-1">This will register a brand-new country — it'll appear in the Country Selector automatically once this district is saved.</p>
                )}
              </div>

              <FInput label="Region *" value={editing.region || ''} onChange={e => setEditing(p => ({ ...p!, region: e.target.value }))} placeholder="e.g. Central, Coast, Awdal..." />

              <FSelect label="Status" value={editing.status || 'Planned'} onChange={e => setEditing(p => ({ ...p!, status: e.target.value }))}>
                <option value="Active">Active</option>
                <option value="Planned">Planned</option>
              </FSelect>

              <div className="grid grid-cols-2 gap-3">
                <FInput label="TOTs" type="number" value={editing.tots ?? 0} onChange={e => setEditing(p => ({ ...p!, tots: parseInt(e.target.value) || 0 }))} />
                <FInput label="Schools" type="number" value={editing.schools ?? 0} onChange={e => setEditing(p => ({ ...p!, schools: parseInt(e.target.value) || 0 }))} />
                <FInput label="Coverage" type="number" value={editing.coverage ?? 0} onChange={e => setEditing(p => ({ ...p!, coverage: parseInt(e.target.value) || 0 }))} />
                <FInput label="Zones" type="number" value={editing.zones ?? 0} onChange={e => setEditing(p => ({ ...p!, zones: parseInt(e.target.value) || 0 }))} />
                <FInput label="Teachers Trained" type="number" value={editing.teachers_trained ?? 0} onChange={e => setEditing(p => ({ ...p!, teachers_trained: parseInt(e.target.value) || 0 }))} />
                <FInput label="Population" value={editing.population || ''} onChange={e => setEditing(p => ({ ...p!, population: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-neutral-100 dark:border-slate-800">
              <Btn variant="secondary" onClick={closeModal}>Cancel</Btn>
              <Btn onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Btn>
 </div>
 </div>
 </div>
 )}

 {/* ── DELETE CONFIRM ── */}
 {confirmDelete && (
 <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
 <div className="bg-white dark:bg-[#0f1623] rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4">
 <h3 className="font-bold text-sm text-black dark:text-white m-0">Delete {confirmDelete.name}?</h3>
 <p className="text-xs text-slate-500">This cannot be undone. Any reports, clusters, or trainings linked to this district may be affected.</p>
 <div className="flex justify-end gap-2">
 <Btn variant="secondary"onClick={() => setConfirmDelete(null)}>Cancel</Btn>
 <Btn onClick={handleDelete} className="bg-red-500 hover:bg-red-600">Delete</Btn>
 </div>
 </div>
 </div>
 )}

 {/* ── BULK IMPORT MODAL ── */}
 {showImport && (
 <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
 <div className="bg-white dark:bg-[#0f1623] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
 <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-slate-800">
 <h3 className="font-bold text-sm text-black dark:text-white m-0">Bulk Import {districtTermPlural}</h3>
 <button onClick={closeImport} className="text-slate-400 hover:text-black dark:hover:text-white"><X size={18} /></button>
 </div>
 <div className="p-5 space-y-4">
 {importResult ? (
 <div className="text-center space-y-3 py-6">
 <div className="text-4xl flex justify-center"><CheckCircle2 size={40} className="text-emerald-500" /></div>
 <div className="text-sm font-bold text-black dark:text-white">Import complete</div>
 <div className="text-xs text-slate-500">
 {importResult.inserted} new district{importResult.inserted === 1 ? '' : 's'} added,{' '}
                    {importResult.updated} updated
                    {importResult.errors > 0 ? `, ${importResult.errors} error(s)` : ''}.
                  </div>
                  <Btn onClick={closeImport}>Done</Btn>
                </div>
              ) : (
                <>
                  <div className="rounded-xl border border-neutral-200 dark:border-slate-700 bg-neutral-50 dark:bg-slate-900/40 p-3 text-[11px] text-slate-500">
                    <div className="font-bold text-slate-600 dark:text-slate-300 mb-1">Expected CSV format (header row required):</div>
                    <code className="text-[10px] block overflow-x-auto whitespace-nowrap">name,region,country,status,tots,schools,coverage,population,zones,teachersTrained</code>
                    <div className="mt-1">Only <strong>name</strong>, <strong>region</strong>, and <strong>country</strong> are required — the rest default to 0/blank. Existing districts (matched by name) will be updated; new ones will be created.</div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Upload a .csv file</label>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
                      className="w-full mt-1 text-xs text-slate-600 dark:text-slate-300"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-neutral-200 dark:bg-slate-800" />
                    <span className="text-[10px] text-slate-400 font-bold">OR PASTE BELOW</span>
                    <div className="flex-1 h-px bg-neutral-200 dark:bg-slate-800" />
                  </div>

                  <textarea
                    value={csvText}
                    onChange={e => handleCsvTextChange(e.target.value)}
                    rows={6}
                    placeholder="name,region,country,status,tots,schools,coverage,population,zones,teachersTrained
Example,Central,Uganda,Planned,0,0,0,,0,0"
                    className="w-full px-3 py-2 text-[11px] font-mono rounded-lg border border-neutral-200 dark:border-slate-700 bg-white dark:bg-[#0f1623] text-black dark:text-white"
                  />

                  {importErrors.length > 0 && (
                    <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 p-3 space-y-1">
                      {importErrors.map((err, i) => (
                        <div key={i} className="text-[11px] text-red-600 dark:text-red-400">{err}</div>
                      ))}
                    </div>
                  )}

                  {importPreview.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <FileText size={12} /> Preview ({importPreview.length} row{importPreview.length === 1 ? '' : 's'})
                      </div>
                      <div className="max-h-48 overflow-y-auto rounded-lg border border-neutral-200 dark:border-slate-700">
                        <table className="w-full text-[11px]">
                          <thead className="bg-neutral-50 dark:bg-slate-900/40 sticky top-0">
                            <tr>
                              <th className="text-left px-2 py-1.5 font-bold text-slate-500">Name</th>
                              <th className="text-left px-2 py-1.5 font-bold text-slate-500">Region</th>
                              <th className="text-left px-2 py-1.5 font-bold text-slate-500">Country</th>
                              <th className="text-left px-2 py-1.5 font-bold text-slate-500">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100 dark:divide-slate-800">
                            {importPreview.map((row, i) => (
                              <tr key={i}>
                                <td className="px-2 py-1.5 text-black dark:text-white">{row.name}</td>
                                <td className="px-2 py-1.5 text-slate-500">{row.region}</td>
                                <td className="px-2 py-1.5 text-slate-500">{row.country}</td>
                                <td className="px-2 py-1.5 text-slate-500">{row.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            {!importResult && (
              <div className="flex justify-end gap-2 px-5 py-4 border-t border-neutral-100 dark:border-slate-800">
                <Btn variant="secondary" onClick={closeImport}>Cancel</Btn>
                <Btn onClick={runImport} disabled={importing || importPreview.length === 0}>
                  {importing ? 'Importing…' : `Import ${importPreview.length} ${importPreview.length === 1 ? districtTermPlural.slice(0, -1) : districtTermPlural}`}
                </Btn>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
