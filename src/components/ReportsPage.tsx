import React, { useState } from 'react';
import { FileText, Send, Check, X, ShieldAlert, Edit2, CornerDownRight, Download, Printer } from 'lucide-react';
import { User, Report } from '../types';
import { ROLE_CFG, can } from '../data';
import { Card, Kicker, FilterBar, TH, Pill, Badge, Btn, Modal, FInput, FSelect, FArea, OR, ConfirmDialog } from './SubComponents';
import { exportReportsToCSV } from '../utils/export';

// REPORT ROUTING WORKFLOW WORKER
export const REPORT_WORKFLOW = {
  tot: { sendTo: "district_coordinator", label: "District Coordinator" },
  viewer: { sendTo: "district_coordinator", label: "District Coordinator" },
  data_entry: { sendTo: "district_coordinator", label: "District Coordinator" },
  district_coordinator: { sendTo: "admin", label: "National Admin" },
  admin: { sendTo: null as any, label: "Final Recipient" },
};

export const getReportRecipient = (role: string) => {
  return (REPORT_WORKFLOW as any)[role] || { sendTo: "admin", label: "National Admin" };
};

interface ReportsPageProps {
  user: User;
  reports: Report[];
  onUpdateStatus: (id: number, status: 'approved' | 'rejected' | 'forwarded') => void;
  showToast: (msg: string) => void;
  onEditReport: (report: Report) => void;
  onForwardReport: (report: Report) => void;
  onBulkSubmit?: () => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  user,
  reports,
  onUpdateStatus,
  showToast,
  onEditReport,
  onForwardReport,
  onBulkSubmit
}) => {
  const [filt, setFilt] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [sel, setSel] = useState<Report | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; report: Report | null; action: 'reject' | 'suspend' }>({
    isOpen: false,
    report: null,
    action: 'reject'
  });
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedCurriculums, setSelectedCurriculums] = useState<string[]>([]);

  const workflow = getReportRecipient(user.role);

  const visible = reports.filter(r => {
    if (user.role === "district_coordinator" && r.district !== user.district) return false;
    if ((user.role === "data_entry" || user.role === "tot") && r.submitted_by !== user.name) return false;
    if (filt !== "all" && r.status !== filt) return false;
    const q = search.toLowerCase();
    if (q && !r.school.toLowerCase().includes(q) && !r.district.toLowerCase().includes(q)) return false;
    
    // Date range filter
    if (dateRange.start && r.submitted_at < dateRange.start) return false;
    if (dateRange.end && r.submitted_at > dateRange.end) return false;
    
    // District filter
    if (selectedDistricts.length > 0 && !selectedDistricts.includes(r.district)) return false;
    
    // Curriculum filter
    if (selectedCurriculums.length > 0 && !selectedCurriculums.includes(r.curriculum)) return false;
    
    return true;
  });

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <Kicker text="Reporting Log" />
          <h1 className="text-2xl font-black text-gray-900">
            {user.role === "data_entry" ? "My Reports Dashboard" : "All Session Reports"}
          </h1>
          <p className="text-xs text-gray-500">
            Monitor primary cluster attendances, SGBV compliance files, and school records.
          </p>
        </div>
        <Btn
          variant="secondary"
          onClick={() => exportReportsToCSV(visible, `ett-reports-${new Date().toISOString().split('T')[0]}`)}
          className="gap-2"
        >
          <Download size={14} />
          Export CSV
        </Btn>
        {user.role === "data_entry" && onBulkSubmit && (
          <Btn
            variant="secondary"
            onClick={onBulkSubmit}
            className="gap-2"
          >
            <Send size={14} />
            Bulk Submit
          </Btn>
        )}
        <Btn
          variant="secondary"
          onClick={() => window.print()}
          className="gap-2"
        >
          <Printer size={14} />
          Print
        </Btn>
      </div>

      {/* Workflow banner */}
      <div className="bg-orange-50 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-orange-850 dark:text-orange-400">
        <span>📋 Routing Channel:</span>
        {["tot", "viewer", "data_entry"].includes(user.role) && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="bg-orange-600 text-white px-2 py-0.5 rounded-full scale-95 font-bold">You</span>
            <CornerDownRight size={14} className="opacity-60" />
            <span className="bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full scale-95 font-bold">District Coordinator</span>
            <CornerDownRight size={14} className="opacity-60" />
            <span className="bg-emerald-150 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full scale-95 font-bold">Admin</span>
          </div>
        )}
        {user.role === "district_coordinator" && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full scale-95 font-bold">District Coordinator</span>
            <CornerDownRight size={14} className="opacity-60" />
            <span className="bg-emerald-150 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full scale-95 font-bold">Admin</span>
          </div>
        )}
        {user.role === "admin" && (
          <span className="bg-emerald-150 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full scale-95 font-bold">Final Recipient</span>
        )}
      </div>

      {/* Advanced Filters */}
      <div className="bg-white dark:bg-[#0f1623] border border-gray-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-black dark:text-white">Advanced Filters</h3>
          <button
            onClick={() => {
              setDateRange({ start: '', end: '' });
              setSelectedDistricts([]);
              setSelectedCurriculums([]);
            }}
            className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold hover:underline"
          >
            Clear All
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold mb-1 block">Date Range</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="flex-1 px-2 py-1 text-[11px] border border-gray-200 dark:border-slate-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-[#0f1623] text-black dark:text-white"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="flex-1 px-2 py-1 text-[11px] border border-gray-200 dark:border-slate-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-[#0f1623] text-black dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold mb-1 block">Districts</label>
            <select
              multiple
              value={selectedDistricts}
              onChange={(e) => setSelectedDistricts(Array.from(e.target.selectedOptions, opt => opt.value))}
              className="w-full px-2 py-1 text-[11px] border border-gray-200 dark:border-slate-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-[#0f1623] text-black dark:text-white h-16"
            >
              {Array.from(new Set(reports.map(r => r.district))).map(district => (
                <option key={district} value={district} className="text-black dark:text-white bg-white dark:bg-[#0f1623]">
                  {district}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold mb-1 block">Curriculum</label>
            <select
              multiple
              value={selectedCurriculums}
              onChange={(e) => setSelectedCurriculums(Array.from(e.target.selectedOptions, opt => opt.value))}
              className="w-full px-2 py-1 text-[11px] border border-gray-200 dark:border-slate-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-[#0f1623] text-black dark:text-white h-16"
            >
              {Array.from(new Set(reports.map(r => r.curriculum))).map(curriculum => (
                <option key={curriculum} value={curriculum} className="text-black dark:text-white bg-white dark:bg-[#0f1623]">
                  {curriculum}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <Card>
        <FilterBar
          options={["all", "pending", "approved", "rejected", "forwarded"].map(x => ({
            v: x,
            l: `${x.charAt(0).toUpperCase() + x.slice(1)} (${reports.filter(r => x === "all" ? true : r.status === x).length})`
          }))}
          active={filt}
          onChange={setFilt}
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search school or district..."
        />

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full border-collapse text-left text-xs text-slate-700 dark:text-slate-300 min-w-[800px]">
            <TH cols={["School", "District", "Curriculum", "Session Conducted", "Students", "Status", "Sent To Alignment", "Actions"]} />
            <tbody>
              {visible.map(r => (
                <tr
                  key={r.id}
                  className="border-b border-gray-100 hover:bg-orange-50/30 transition-colors"
                >
                  <td className="p-3 font-bold text-gray-900 whitespace-nowrap">{r.school}</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400">{r.district}</td>
                  <td className="p-3">
                    <Badge text={r.curriculum} bg="rgba(232,93,4,0.12)" color={OR} />
                  </td>
                  <td className="p-3 text-slate-500 dark:text-slate-400 max-w-[200px] truncate" title={r.session}>
                    {r.session}
                  </td>
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                    {r.boys + r.girls} <span className="text-[10px] text-slate-400 font-normal">({r.boys}B / {r.girls}G)</span>
                  </td>
                  <td className="p-3">
                    <Pill s={r.status} />
                  </td>
                  <td className="p-3 text-[10.5px] text-slate-500 dark:text-slate-400 font-semibold italic">
                    {r.sentToLabel || "In Progress"}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      <Btn size="sm" variant="ghost" onClick={() => setSel(r)}>
                        View
                      </Btn>
                      
                      {user.role === "data_entry" && (
                        <Btn
                          size="sm"
                          variant="ghost"
                          className="border-blue-100 text-blue-600 dark:text-blue-400 bg-blue-50/20"
                          onClick={() => onEditReport(r)}
                        >
                          ✏️ Edit
                        </Btn>
                      )}

                      {can(user.role, "approveReport") && r.status === "pending" && (
                        <>
                          <button
                            onClick={() => { onUpdateStatus(r.id, "approved"); showToast("✅ Report approved"); }}
                            className="bg-emerald-500 text-white rounded-lg p-1.5 hover:bg-emerald-600 cursor-pointer w-7 h-7 flex items-center justify-center transition"
                            title="Approve Report"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setConfirmDialog({ isOpen: true, report: r, action: 'reject' })}
                            className="bg-red-500 text-white rounded-lg p-1.5 hover:bg-red-600 cursor-pointer w-7 h-7 flex items-center justify-center transition"
                            title="Reject Report"
                          >
                            <X size={14} />
                          </button>
                        </>
                      )}

                      {user.role === "district_coordinator" && r.status === "approved" && r.sentTo !== "admin" && (
                        <Btn
                          size="sm"
                          variant="ghost"
                          className="border-orange-200 text-orange-600 dark:text-orange-400 bg-orange-50/30"
                          onClick={() => onForwardReport(r)}
                        >
                          Send Admin
                        </Btn>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400 dark:text-slate-500">
                    <FileText className="mx-auto mb-2 opacity-30" size={32} />
                    No reports match the active state filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {sel && (
        <Modal title={`Session Submission Log: ${sel.school}`} onClose={() => setSel(null)}>
          <div className="grid grid-cols-2 gap-4 mb-4 text-xs sm:text-sm bg-orange-50/30 p-4 rounded-2xl border border-orange-100">
            {[
              ["School", sel.school],
              ["District Domain", sel.district],
              ["Current Zone", sel.zone],
              ["Curriculum Alignment", sel.curriculum],
              ["Boys Attendance", sel.boys],
              ["Girls Attendance", sel.girls],
              ["Collective Attendance", sel.boys + sel.girls],
              ["Submitted By", sel.submitted_by],
              ["Submission Date", sel.submitted_at],
              ["Recipient Target", sel.sentToLabel || "Final Station"]
            ].map(([l, v]) => (
              <div key={l} className="space-y-0.5">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{l}</div>
                <div className="font-bold text-slate-800 dark:text-slate-100">{v}</div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Executed Work details</div>
              <div className="text-xs text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">{sel.session}</div>
            </div>

            {sel.challenges && (
              <div>
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Challenges Identified</div>
                <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50/30 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 p-3 rounded-xl">
                  {sel.challenges}
                </div>
              </div>
            )}

            {sel.success && (
              <div>
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Field Success Records</div>
                <div className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-3 rounded-xl">
                  {sel.success}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <Pill s={sel.status} />
            <div className="flex gap-2">
              {can(user.role, "approveReport") && sel.status === "pending" && (
                <>
                  <Btn
                    variant="success"
                    size="sm"
                    onClick={() => { onUpdateStatus(sel.id, "approved"); setSel(null); showToast("✅ Approved"); }}
                  >
                    Approve
                  </Btn>
                  <Btn
                    variant="danger"
                    size="sm"
                    onClick={() => { setConfirmDialog({ isOpen: true, report: sel, action: 'reject' }); }}
                  >
                    Reject
                  </Btn>
                </>
              )}
              {user.role === "district_coordinator" && sel.status === "approved" && sel.sentTo !== "admin" && (
                <Btn
                  variant="primary"
                  size="sm"
                  onClick={() => { onForwardReport(sel); setSel(null); }}
                >
                  📨 Forward to Admin
                </Btn>
              )}
              {user.role === "data_entry" && (
                <Btn
                  variant="secondary"
                  size="sm"
                  onClick={() => { onEditReport(sel); setSel(null); }}
                >
                  ✏️ Edit Data
                </Btn>
              )}
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Confirm Rejection"
        message={`Are you sure you want to reject the report from ${confirmDialog.report?.school}? This action cannot be undone and the submitter will need to resubmit.`}
        confirmText="Reject Report"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          if (confirmDialog.report) {
            onUpdateStatus(confirmDialog.report.id, "rejected");
            showToast("Report rejected");
            setConfirmDialog({ isOpen: false, report: null, action: 'reject' });
            setSel(null);
          }
        }}
        onCancel={() => setConfirmDialog({ isOpen: false, report: null, action: 'reject' })}
      />
    </div>
  );
};
