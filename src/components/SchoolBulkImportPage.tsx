import React, { useState } from 'react';
import { mapSchoolsApi } from '../api';
import { User } from '../types';
import { Card, PageHeader, Btn } from './SubComponents';
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle } from 'lucide-react';

interface SchoolBulkImportPageProps {
  user: User | null;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

const COUNTRIES = ['Malawi', 'Kenya', 'Somaliland'];

export const SchoolBulkImportPage: React.FC<SchoolBulkImportPageProps> = ({ user, showToast }) => {
  const [country, setCountry] = useState('Kenya');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const submit = async () => {
    if (!file) { showToast('Please choose a file first', 'warning'); return; }
    setUploading(true);
    setResult(null);
    try {
      const data = await mapSchoolsApi.bulkImport(file, country);
      if (data.error) { showToast(data.error, 'error'); return; }
      setResult(data);
      showToast(`Imported ${data.created + data.updated} of ${data.totalRows} rows`, 'success');
    } catch {
      showToast('Failed to upload file', 'error');
    } finally {
      setUploading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return <Card className="p-8 text-center text-sm text-black/50 dark:text-white/50">You don't have access to this page.</Card>;
  }

  return (
    <div className="space-y-4 animate-fade-in-up max-w-2xl mx-auto">
      <PageHeader
        title="Bulk Import Schools"
        subtitle="Add or update many schools at once by uploading a filled-in Excel sheet. This writes directly into the same records that power Learners Reached, Teachers Trained, Schools Reached, and STOTs on the Main Dashboard."
      />

      <Card className="p-5 space-y-4">
        <div>
          <label className="text-xs font-bold text-black dark:text-white block mb-1.5">Country</label>
          <select
            value={country}
            onChange={e => setCountry(e.target.value)}
            className="w-full text-sm border border-neutral-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-black dark:text-white"
          >
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <p className="text-[11px] text-slate-400 mt-1">Every District name in your sheet must match an existing district in this country.</p>
        </div>

        <div>
          <label className="text-xs font-bold text-black dark:text-white block mb-1.5">Excel File</label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={e => setFile(e.target.files?.[0] || null)}
            className="w-full text-xs border border-neutral-200 dark:border-slate-700 rounded-lg px-3 py-2.5 bg-white dark:bg-slate-800 text-black dark:text-white"
          />
          {file && <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1"><FileSpreadsheet size={12} /> {file.name}</p>}
        </div>

        <Btn variant="primary" onClick={submit} disabled={uploading || !file}>
          <Upload size={14} /> {uploading ? 'Uploading…' : 'Upload & Import'}
        </Btn>
      </Card>

      {result && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={18} className="text-emerald-500" />
            <h3 className="text-sm font-bold text-black dark:text-white m-0">Import Complete</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-center">
              <div className="text-xl font-black text-emerald-600">{result.created}</div>
              <div className="text-[10px] text-slate-500 uppercase">Created</div>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-center">
              <div className="text-xl font-black text-blue-600">{result.updated}</div>
              <div className="text-[10px] text-slate-500 uppercase">Updated</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 text-center">
              <div className="text-xl font-black text-black dark:text-white">{result.totalRows}</div>
              <div className="text-[10px] text-slate-500 uppercase">Total Rows</div>
            </div>
          </div>
          {result.errors && result.errors.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
              <div className="flex items-center gap-1.5 mb-1.5 text-amber-700 dark:text-amber-400 text-xs font-bold">
                <AlertTriangle size={13} /> {result.errors.length} row(s) had issues
              </div>
              <ul className="text-[11px] text-amber-700 dark:text-amber-400 space-y-0.5 list-disc pl-4">
                {result.errors.map((e: string, i: number) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
