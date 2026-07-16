import React, { useState, useMemo } from 'react';
import {
  FileText, Send, Check, CornerDownRight, Download, Printer,
  SlidersHorizontal, ChevronDown, MoreVertical, Calendar, Users as UsersIcon
} from 'lucide-react';
import { User, Report } from '../types';
import { ROLE_CFG, can } from '../data';
import { Card, Kicker, FilterBar, TH, Pill, Badge, Btn, Modal, FInput, FSelect, FArea, OR, ConfirmDialog, StatCard, PageHeader } from './SubComponents';
import { exportReportsToCSV } from '../utils/export';

// REPORT ROUTING WORKFLOW WORKER
export const REPORT_WORKFLOW = {
  tot: { sendTo: "district_coordinator", label: "District Coordinator" },
  field_officer: { sendTo: "district_coordinator", label: "District Coordinator" },
  viewer: { sendTo: "district_coordinator", label: "District Coordinator" },
  data_entry: { sendTo: "district_coordinator", label: "District Coordinator" },
  district_coordinator: { sendTo: "program_manager", label: "Regional Manager" },
  program_manager: { sendTo: "admin", label: "National Admin" },
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
  onDeleteReport?: (report: Report) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  user,
  reports,
  onUpdateStatus,
  showToast,
  onEditReport,
  onForwardReport,
  onBulkSubmit,
  onDeleteReport
}) => {
  const [filt, setFilt] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [sel, setSel] = useState<Report | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; report: Report | null; action: 'reject' | 'suspend' }>({
    isOpen: false,
    report: null,
    action: 'reject'
  });
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedCurriculums, setSelectedCurriculums] = useState<string[]>([]);

  const workflow = getReportRecipient(user.role);
  const activeFilterCount = (dateRange.start ? 1 : 0) + (dateRange.end ? 1 : 0) + selectedDistricts.length + selectedCurriculums.length;

  const visible = reports.filter(r => {
    if (user.role === "district_coordinator" && r.district !== user.district) return false;
    if ((user.role === "data_entry" || user.role === "tot") && r.submitted_by !== user.name) return false;
    if (filt !== "all" && r.status !== filt) return false;
    const q = search.toLowerCase();
    if (q && !r.school.toLowerCase().includes(q) && !r.district.toLowerCase().includes(q)) return false;
    if (dateRange.start && r.submitted_at < dateRange.start) return false;
    if (dateRange.end && r.submitted_at > dateRange.end) return false;
    if (selectedDistricts.length > 0 && !selectedDistricts.includes(r.district)) return false;
    if (selectedCurriculums.length > 0 && !selectedCurriculums.includes(r.curriculum)) return false;
    return true;
  });

  const summary = useMemo(() => ({
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    approved: reports.filter(r => r.status === 'approved').length,
    learners: reports.reduce((a, r) => a + r.boys + r.girls, 0),
  }), [reports]);

  const clearFilters = () => {
    setDateRange({ start: '', end: '' });
    setSelectedDistricts([]);
    setSelectedCurriculums([]);
  };

  // Shared row-action logic — used by both the mobile card menu and the
  // desktop table row, so behavior never drifts between the two layouts.
  const renderActions = (r: Report, layout: 'menu' | 'inline') => {
    const items: React.ReactNode[] = [];

    items.push(
      <button
        key="view"
        onClick={() => { setSel(r); setOpenMenuId(null); }}
        className={layout === 'menu'
          ? "w-full text-left px-3 py-2 text-xs font-semibold text-black dark:text-white hover:bg-[var(--brand-50)] dark:hover:bg-slate-800 rounded-lg"
          : "px-2.5 py-1 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-slate-700 hover:border-[var(--brand-400)] dark:hover:border-[var(--brand-600)] text-black dark:text-white"}
      >
        View details
      </button>
    );

    if (user.role === "data_entry") {
      items.push(
        <button
          key="edit"
          onClick={() => { onEditReport(r); setOpenMenuId(null); }}
          className={layout === 'menu'
            ? "w-full text-left px-3 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg"
            : "px-2.5 py-1 text-xs font-semibold rounded-lg border border-blue-200 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20"}
        >
          Edit
        </button>
      );
    }

    if (can(user.role, "approveReport") && r.status === "pending") {
      items.push(
        <button
          key="approve"
          onClick={() => { onUpdateStatus(r.id, "approved"); showToast("Report approved", 'success'); setOpenMenuId(null); }}
          className={layout === 'menu'
            ? "w-full text-left px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg"
            : "px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white"}
        >
          Approve
        </button>
      );
      items.push(
        <button
          key="reject"
          onClick={() => { setConfirmDialog({ isOpen: true, report: r, action: 'reject' }); setOpenMenuId(null); }}
          className={layout === 'menu'
            ? "w-full text-left px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg"
            : "px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-500 hover:bg-red-600 text-white"}
        >
          Reject
        </button>
      );
    }

    if ((user.role === "district_coordinator" || user.role === "program_manager") && r.status === "approved" && r.sentTo !== "admin") {
      items.push(
        <button
          key="forward"
          onClick={() => { onForwardReport(r); setOpenMenuId(null); }}
          className={layout === 'menu'
            ? "w-full text-left px-3 py-2 text-xs font-semibold text-[var(--brand-600)] dark:text-[var(--brand-400)] hover:bg-[var(--brand-50)] dark:hover:bg-slate-800 rounded-lg"
            : "px-2.5 py-1 text-xs font-semibold rounded-lg border border-[var(--brand-200)] dark:border-[var(--brand-900)]/40 text-[var(--brand-600)] dark:text-[var(--brand-400)] hover:bg-[var(--brand-50)] dark:hover:bg-[var(--brand-950)]/20"}
        >
          Send to {workflow.label}
        </button>
      );
    }

    const isSender = r.submitted_by === user.id || (r as any).submittedBy === user.id;
    let isReceiver = false;
    if (user.role === 'admin') isReceiver = true;
    else if (user.role === 'program_manager') isReceiver = (r as any).submitter_role === 'district_coordinator' && (r as any).submitter_region === user.region;
    else if (user.role === 'district_coordinator') isReceiver = ['tot','field_officer'].includes((r as any).submitter_role) && (r as any).submitter_district === user.district;

    if (onDeleteReport && (isSender || isReceiver)) {
      items.push(
        <button
          key="delete"
          onClick={() => { onDeleteReport(r); setOpenMenuId(null); }}
          className={layout === 'menu'
            ? "w-full text-left px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg"
            : "px-2.5 py-1 text-xs font-semibold rounded-lg border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"}
        >
          Delete
        </button>
      );
    }

    return items;
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <PageHeader
        title={user.role === "data_entry" ? "My Reports" : "Session Reports"}
        subtitle="Track field session attendance, approvals, and routing status."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {user.role === "data_entry" && onBulkSubmit && (
              <Btn size="sm" variant="secondary" onClick={onBulkSubmit}>
                <Send size={13} /> Bulk Submit
              </Btn>
            )}
            <Btn
              size="sm"
              variant="secondary"
              onClick={() => exportReportsToCSV(visible, `ett-reports-${new Date().toISOString().split('T')[0]}`)}
            >
              <Download size={13} /> Export
            </Btn>
            <Btn size="sm" variant="secondary" onClick={() => window.print()} className="hidden sm:inline-flex">
              <Printer size={13} /> Print
            </Btn>
          </div>
        }
      />

      {/* Summary stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<FileText size={16} />} label="Total Reports" value={summary.total} />
        <StatCard icon={<Calendar size={16} />} label="Pending Review" value={summary.pending} />
        <StatCard icon={<Check size={16} />} label="Approved" value={summary.approved} />
        <StatCard icon={<UsersIcon size={16} />} label="Learners Reached" value={summary.learners.toLocaleString()} />
      </div>

      {/* Routing channel — condensed single line */}
      <div className="flex items-center gap-2 flex-wrap text-[11px] font-semibold text-black dark:text-white bg-[var(--brand-50)] dark:bg-[var(--brand-950)]/15 border border-[var(--brand-100)] dark:border-[var(--brand-900)]/30 rounded-xl px-3 py-2">
        <span className="opacity-60 shrink-0">Routes to:</span>
        {user.role === "admin" ? (
          <Badge text="You're the final recipient" color="#065f46" bg="#d1fae5" />
        ) : (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge text="You" color="#fff" bg={OR} />
            <CornerDownRight size={12} className="opacity-50" />
            <Badge text={workflow.label} color="#1e40af" bg="#dbeafe" />
          </div>
        )}
      </div>

      {/* Search + status tabs + filter toggle */}
      <Card className="p-3 sm:p-4">
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

        <button
          onClick={() => setFiltersOpen(o => !o)}
          className="flex items-center gap-1.5 text-xs font-semibold text-black dark:text-white opacity-70 hover:opacity-100 transition mb-2"
        >
          <SlidersHorizontal size={13} />
          More filters
          {activeFilterCount > 0 && <Badge text={String(activeFilterCount)} className="ml-1" />}
          <ChevronDown size={13} className={`transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
        </button>

        {filtersOpen && (
          <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-slate-800 mb-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold mb-1 block">Date range</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="flex-1 min-w-0 px-2 py-1.5 text-[11px] border border-neutral-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] bg-white dark:bg-[#0f1623] text-black dark:text-white"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="flex-1 min-w-0 px-2 py-1.5 text-[11px] border border-neutral-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] bg-white dark:bg-[#0f1623] text-black dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold mb-1 block">Districts</label>
                <select
                  multiple
                  value={selectedDistricts}
                  onChange={(e) => setSelectedDistricts(Array.from(e.target.selectedOptions, opt => opt.value))}
                  className="w-full px-2 py-1.5 text-[11px] border border-neutral-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] bg-white dark:bg-[#0f1623] text-black dark:text-white h-20"
                >
                  {Array.from(new Set(reports.map(r => r.district))).map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold mb-1 block">Curriculum</label>
                <select
                  multiple
                  value={selectedCurriculums}
                  onChange={(e) => setSelectedCurriculums(Array.from(e.target.selectedOptions, opt => opt.value))}
                  className="w-full px-2 py-1.5 text-[11px] border border-neutral-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] bg-white dark:bg-[#0f1623] text-black dark:text-white h-20"
                >
                  {Array.from(new Set(reports.map(r => r.curriculum))).map(curriculum => (
                    <option key={curriculum} value={curriculum}>{curriculum}</option>
                  ))}
                </select>
              </div>
            </div>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-[11px] text-[var(--brand-600)] dark:text-[var(--brand-400)] font-semibold hover:underline">
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* MOBILE: card list (below sm breakpoint) */}
        <div className="sm:hidden space-y-2.5 -mx-1">
          {visible.map(r => (
            <div
              key={r.id}
              className="bg-white dark:bg-[#0f1623] border border-neutral-200 dark:border-slate-800 rounded-xl p-3.5 mx-1"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <div className="font-bold text-sm text-black dark:text-white truncate">{r.school}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{r.district} · {r.zone}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Pill s={r.status} />
                  <button
                    onClick={() => setOpenMenuId(openMenuId === r.id ? null : r.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-neutral-100 dark:hover:bg-slate-800"
                    aria-label="More actions"
                  >
                    <MoreVertical size={15} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                <Badge text={r.curriculum} bg="rgba(232,93,4,0.12)" color={OR} className="text-[10px]" />
                <span>{r.boys + r.girls} learners ({r.boys}B / {r.girls}G)</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{r.session}</div>

              {openMenuId === r.id && (
                <div className="mt-2.5 pt-2.5 border-t border-neutral-100 dark:border-slate-800 flex flex-col gap-0.5">
                  {renderActions(r, 'menu')}
                </div>
              )}
            </div>
          ))}
          {visible.length === 0 && (
            <div className="p-10 text-center text-slate-400 dark:text-slate-500">
              <FileText className="mx-auto mb-2 opacity-30" size={28} />
              <p className="text-xs">No reports match these filters.</p>
            </div>
          )}
        </div>

        {/* DESKTOP: table (sm breakpoint and up) */}
        <div className="hidden sm:block overflow-x-auto rounded-xl border border-neutral-100 dark:border-slate-800">
          <table className="w-full border-collapse text-left text-xs text-slate-700 dark:text-slate-300">
            <TH cols={["School", "District", "Curriculum", "Session", "Learners", "Status", "Routing", "Actions"]} />
            <tbody>
              {visible.map(r => (
                <tr key={r.id} className="border-b border-neutral-100 dark:border-slate-800 hover:bg-[var(--brand-50)]/30 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-3 font-bold text-black dark:text-white whitespace-nowrap">{r.school}</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400">{r.district}</td>
                  <td className="p-3"><Badge text={r.curriculum} bg="rgba(232,93,4,0.12)" color={OR} /></td>
                  <td className="p-3 text-slate-500 dark:text-slate-400 max-w-[180px] truncate" title={r.session}>{r.session}</td>
                  <td className="p-3 font-semibold text-black dark:text-white">
                    {r.boys + r.girls} <span className="text-[10px] text-slate-400 font-normal">({r.boys}B/{r.girls}G)</span>
                  </td>
                  <td className="p-3"><Pill s={r.status} /></td>
                  <td className="p-3 text-[10.5px] text-slate-500 dark:text-slate-400 font-semibold italic">{r.sentToLabel || "In progress"}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1.5">{renderActions(r, 'inline')}</div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400 dark:text-slate-500">
                    <FileText className="mx-auto mb-2 opacity-30" size={32} />
                    No reports match the active filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {sel && (
        <Modal title={sel.school} onClose={() => setSel(null)}>
          <div className="grid grid-cols-2 gap-4 mb-4 text-xs sm:text-sm bg-[var(--brand-50)]/30 dark:bg-[var(--brand-950)]/10 p-4 rounded-2xl border border-[var(--brand-100)] dark:border-[var(--brand-900)]/30">
            {[
              ["District", sel.district],
              ["Zone", sel.zone],
              ["Curriculum", sel.curriculum],
              ["Boys present", sel.boys],
              ["Girls present", sel.girls],
              ["Total learners", sel.boys + sel.girls],
              ["Submitted by", sel.submitted_by],
              ["Submitted on", sel.submitted_at],
              ["Sent to", sel.sentToLabel || "Not yet routed"]
            ].map(([l, v]) => (
              <div key={l} className="space-y-0.5">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{l}</div>
                <div className="font-bold text-slate-800 dark:text-slate-100">{v}</div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Session conducted</div>
              <div className="text-xs text-slate-700 dark:text-slate-300 bg-neutral-50 dark:bg-slate-800/40 p-3 rounded-xl border border-neutral-100 dark:border-slate-800">{sel.session}</div>
            </div>

            {sel.challenges && (
              <div>
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Challenges</div>
                <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50/30 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 p-3 rounded-xl">
                  {sel.challenges}
                </div>
              </div>
            )}

            {sel.success && (
              <div>
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Success highlights</div>
                <div className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-3 rounded-xl">
                  {sel.success}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 pt-4 border-t border-neutral-100 dark:border-slate-800">
            <Pill s={sel.status} />
            <div className="flex flex-wrap gap-2">
              {can(user.role, "approveReport") && sel.status === "pending" && (
                <>
                  <Btn variant="success" size="sm" onClick={() => { onUpdateStatus(sel.id, "approved"); setSel(null); showToast("Approved", 'success'); }}>
                    Approve
                  </Btn>
                  <Btn variant="danger" size="sm" onClick={() => setConfirmDialog({ isOpen: true, report: sel, action: 'reject' })}>
                    Reject
                  </Btn>
                </>
              )}
              {user.role === "district_coordinator" && sel.status === "approved" && sel.sentTo !== "admin" && (
                <Btn variant="primary" size="sm" onClick={() => { onForwardReport(sel); setSel(null); }}>
                  Forward to {workflow.label}
                </Btn>
              )}
              {user.role === "data_entry" && (
                <Btn variant="secondary" size="sm" onClick={() => { onEditReport(sel); setSel(null); }}>
                  Edit
                </Btn>
              )}
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Reject this report?"
        message={`This will reject the report from ${confirmDialog.report?.school}. The submitter will need to resubmit — this cannot be undone.`}
        confirmText="Reject report"
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
