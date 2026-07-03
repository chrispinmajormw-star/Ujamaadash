import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { districtsApi, usersApi, mapClustersApi } from '../api';
import {
  Card, PageHeader, Btn, ProgBar, Badge, FInput, FArea, FSelect, Modal, FilterBar
} from './SubComponents';
import {
  MapPin, GraduationCap, School, Users, Plus, Edit2, Trash2,
  ChevronDown, ChevronUp, FileText, Calendar, CheckCircle, Clock, AlertCircle
} from 'lucide-react';

interface DistrictsPageProps {
  user: User | null;
  showToast: (msg: string) => void;
}

const REGION_COLORS: Record<string, { color: string; bg: string }> = {
  Northern: { color: '#1e40af', bg: '#dbeafe' },
  Central:  { color: '#c44d00', bg: '#fff1e6' },
  Southern: { color: '#065f46', bg: '#d1fae5' },
};

const REGION_THEME: Record<string, {
  dot: string;
  panelBg: string;
  panelBorder: string;
  cardBg: string;
  chipBg: string;
  chipText: string;
}> = {
  Northern: {
    dot: '#f97316',
    panelBg: '#fff9f2',
    panelBorder: '#f9d3ad',
    cardBg: '#fffaf5',
    chipBg: '#fff1e6',
    chipText: '#c44d00',
  },
  Central: {
    dot: '#0f766e',
    panelBg: '#f6fbfb',
    panelBorder: '#b8e1dd',
    cardBg: '#f9fefe',
    chipBg: '#dff5f3',
    chipText: '#0f766e',
  },
  Southern: {
    dot: '#2563eb',
    panelBg: '#f4f8ff',
    panelBorder: '#c8d8fb',
    cardBg: '#f8fbff',
    chipBg: '#dbeafe',
    chipText: '#1e40af',
  },
};

const TODAY = new Date().toISOString().split('T')[0];

const getTrainingStatus = (startDate: string, endDate?: string) => {
  if (!startDate) return 'upcoming';
  // Auto-calculate end date as 6 days after start if not provided
  const calculatedEndDate = endDate || new Date(new Date(startDate).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  if (TODAY < startDate) return 'upcoming';
  if (TODAY > calculatedEndDate) return 'completed';
  return 'active';
};

const getProgressPct = (startDate: string) => {
  const start = new Date(startDate);
  const now = new Date();
  const days = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.min(Math.round((days / 6) * 100), 100);
};

const STATUS_CFG = {
  upcoming:  { label: 'Upcoming',  color: '#1e40af', bg: '#dbeafe', icon: <Clock size={11} /> },
  active:    { label: 'Active',    color: '#c44d00', bg: '#fff1e6', icon: <AlertCircle size={11} /> },
  completed: { label: 'Completed', color: '#065f46', bg: '#dcfce7', icon: <CheckCircle size={11} /> },
};

export const DistrictsPage: React.FC<DistrictsPageProps> = ({ user, showToast }) => {
  const [districts, setDistricts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState('all');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [districtData, setDistrictData] = useState<Record<number, { reports: any[]; trainings: any[]; clusters: any[] }>>({});

  // Modals
  const [reportModal, setReportModal] = useState<any | null>(null);
  const [trainingModal, setTrainingModal] = useState<{ district: any; training?: any } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ trainingId: number; districtId: number } | null>(null);
  const [assignModal, setAssignModal] = useState<any | null>(null);

  // Forms
  const [reportForm, setReportForm] = useState({ number_of_tots: '', teachers_trained: '', school_coverage: '', notes: '' });
  const [trainingForm, setTrainingForm] = useState({ training_name: '', cohort: '', start_date: '', participants: '', venue: '', training_lead_name: '' });
  const [assignUserId, setAssignUserId] = useState('');
  const [dcUsers, setDcUsers] = useState<any[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isDC = user?.role === 'district_coordinator';
  const isManager = user?.role === 'program_manager';
  const isTOT = user?.role === 'tot';

  // Filter districts based on user's role and location
  const visibleDistricts = districts.filter(d => {
    if (isAdmin) return true;                                           // Admin sees all
    if (isManager && user?.region) return d.region === user.region;    // Manager sees their region only
    if (isDC && user?.district) return d.name === user.district;       // DC sees their district only
    if (isTOT && user?.district) return d.name === user.district;      // TOT sees their district only
    return true;
  });

  useEffect(() => {
    if (isAdmin) {
      usersApi.getAll().then(data => {
        setDcUsers(data.filter((u: any) => u.role === 'district_coordinator'));
      });
    }
  }, [user]);

  useEffect(() => {
    districtsApi.getAll().then(data => {
      setDistricts(data);
      setLoading(false);
    });
  }, []);

  const loadDistrictData = async (districtId: number) => {
    if (districtData[districtId]) return;
    const district = districts.find(d => d.id === districtId);
    const [reports, trainings, clusters] = await Promise.all([
      districtsApi.getReports(districtId),
      districtsApi.getTrainings(districtId),
      district?.name ? mapClustersApi.getAll({ district: district.name }).catch(() => []) : Promise.resolve([]),
    ]);
    setDistrictData(prev => ({
      ...prev,
      [districtId]: {
        reports,
        trainings,
        clusters,
      }
    }));
  };

  const toggleExpand = (id: number) => {
    if (expanded === id) {
      setExpanded(null);
    } else {
      setExpanded(id);
      loadDistrictData(id);
    }
  };

  const canManage = (district: any) => {
    if (isAdmin) return true;
    if (isDC && String(district.district_coordinator_user_id) === String(user?.id)) return true;
    return false;
  };

  const assignDC = async () => {
    if (!assignModal || !assignUserId) return;
    // Prevent duplicate assignment: warn if district already has a DC and user is assigning a different one
    if (assignModal.district_coordinator_user_id && String(assignModal.district_coordinator_user_id) === String(assignUserId)) {
      showToast('⚠️ This DC is already assigned to this district');
      return;
    }
    const data = await districtsApi.assignDC(assignModal.name, assignUserId);
    if (data.error) { showToast(`⚠️ ${data.error}`); return; }
    setDistricts(prev => prev.map(d => d.id === assignModal.id ? {
      ...d,
      district_coordinator_user_id: assignUserId,
      coordinator_name: dcUsers.find(u => u.id === assignUserId)?.name || ''
    } : d));
    showToast('✅ District Coordinator assigned');
    setAssignModal(null);
    setAssignUserId('');
  };

  const validateReportForm = () => {
    const errors: Record<string, string> = {};
    if (!reportForm.number_of_tots || parseInt(reportForm.number_of_tots) < 0) {
      errors.number_of_tots = 'Please enter a valid number of TOTs';
    }
    if (!reportForm.teachers_trained || parseInt(reportForm.teachers_trained) < 0) {
      errors.teachers_trained = 'Please enter a valid number of teachers';
    }
    if (!reportForm.school_coverage || parseFloat(reportForm.school_coverage) < 0 || parseFloat(reportForm.school_coverage) > 100) {
      errors.school_coverage = 'Please enter coverage between 0-100%';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitReport = async () => {
    if (!reportModal) return;
    if (!validateReportForm()) {
      showToast('⚠️ Please fix the form errors');
      return;
    }
    setIsSubmitting(true);
    try {
      const data = await districtsApi.submitReport(reportModal.id, {
        number_of_tots: parseInt(reportForm.number_of_tots),
        teachers_trained: parseInt(reportForm.teachers_trained),
        school_coverage: parseFloat(reportForm.school_coverage),
        notes: reportForm.notes,
      });
      if (data.error) { showToast(`⚠️ ${data.error}`); return; }
      showToast('✅ District report submitted');
      setReportModal(null);
      setReportForm({ number_of_tots: '', teachers_trained: '', school_coverage: '', notes: '' });
      setFormErrors({});
      setDistrictData(prev => ({ ...prev, [reportModal.id]: undefined as any }));
      loadDistrictData(reportModal.id);
      setDistricts(prev => prev.map(d => d.id === reportModal.id ? {
        ...d,
        number_of_tots: data.number_of_tots,
        teachers_trained: data.teachers_trained,
        school_coverage: data.school_coverage,
      } : d));
    } catch (error) {
      showToast('⚠️ Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateTrainingForm = (isEdit = false) => {
    const errors: Record<string, string> = {};
    if (!trainingForm.training_name || trainingForm.training_name.trim().length < 3) {
      errors.training_name = 'Training name must be at least 3 characters';
    }
    if (!trainingForm.start_date) {
      errors.start_date = 'Start date is required';
    } else if (!isEdit) {
      // Only enforce future-date rule for NEW trainings, not when editing existing ones
      const selectedDate = new Date(trainingForm.start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.start_date = 'Start date cannot be in the past';
      }
    }
    if (trainingForm.participants && (parseInt(trainingForm.participants) < 1 || parseInt(trainingForm.participants) > 1000)) {
      errors.participants = 'Participants must be between 1-1000';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitTraining = async () => {
    if (!trainingModal) return;
    const { district, training } = trainingModal;
    const isEdit = !!training;
    if (!validateTrainingForm(isEdit)) {
      showToast('⚠️ Please fix the form errors');
      return;
    }
    setIsSubmitting(true);
    try {
      const fn = isEdit
        ? () => districtsApi.updateTraining(training.id, trainingForm)
        : () => districtsApi.createTraining(district.id, trainingForm);
      const data = await fn();
      if (data.error) { showToast(`⚠️ ${data.error}`); return; }
      showToast(isEdit ? '✅ Training updated' : '✅ Training added');
      setTrainingModal(null);
      setTrainingForm({ training_name: '', cohort: '', start_date: '', participants: '', venue: '', training_lead_name: '' });
      setFormErrors({});
      setDistrictData(prev => ({ ...prev, [district.id]: undefined as any }));
      loadDistrictData(district.id);
    } catch (error) {
      showToast('⚠️ Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteTraining = async () => {
    if (!deleteModal) return;
    setIsSubmitting(true);
    try {
      const data = await districtsApi.deleteTraining(deleteModal.trainingId);
      if (data.error) { showToast(`⚠️ ${data.error}`); return; }
      showToast('✅ Training deleted successfully');
      setDeleteModal(null);
      setDistrictData(prev => ({ ...prev, [deleteModal.districtId]: undefined as any }));
      loadDistrictData(deleteModal.districtId);
    } catch (error) {
      showToast('⚠️ Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = visibleDistricts.filter(d => {
    return region === 'all' || d.region === region;
  });
  const grouped: Record<string, any[]> = { Northern: [], Central: [], Southern: [] };
  filtered.forEach(d => { if (grouped[d.region]) grouped[d.region].push(d); });
  const regionNames = ['Northern', 'Central', 'Southern'];
  const regionSummary = (reg: string) => {
    const dists = grouped[reg] || [];
    const activeCount = dists.filter(d => d.is_active).length;
    return {
      districts: dists.length,
      activePct: dists.length ? Math.round((activeCount / dists.length) * 100) : 0,
    };
  };

  // Location context header for non-admin users
  const locationLabel = isManager
    ? `${user?.region} Region`
    : (isDC || isTOT)
    ? `${user?.district} District`
    : null;

  return (
    <div className="space-y-6 animate-fade-in-up bg-[#fdf6ef] dark:bg-[#0f1623] -m-4 sm:-m-6 p-4 sm:p-6 min-h-[calc(100vh-56px)]">
      <PageHeader
        title={locationLabel ? `${locationLabel} — Districts` : "Implementing Districts"}
        subtitle={locationLabel
          ? `Showing districts within your assigned ${isManager ? 'region' : 'district'}`
          : "All 28 districts of Malawi — active and planned"}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Districts', value: visibleDistricts.length, icon: <MapPin size={15} /> },
          { label: 'Active', value: visibleDistricts.filter(d => d.is_active).length, icon: <CheckCircle size={15} /> },
          { label: 'Total TOTs', value: visibleDistricts.reduce((a, d) => a + (parseInt(d.tots) || 0), 0), icon: <GraduationCap size={15} /> },
          { label: 'Teachers Trained', value: visibleDistricts.reduce((a, d) => a + (parseInt(d.teachers_trained) || 0), 0), icon: <Users size={15} /> },
        ].map((s, i) => (
          <div key={i} className="p-3 rounded-2xl bg-orange-50 border border-orange-200 shadow-[0_8px_30px_rgba(232,93,4,0.08)] dark:bg-orange-950/20 dark:border-orange-900/40">
            <div className="flex items-center gap-1.5 mb-1 text-orange-700 dark:text-orange-300 text-[10px] font-semibold uppercase tracking-wide">{s.icon}{s.label}</div>
            <div className="text-2xl font-black text-orange-700 dark:text-orange-300">{s.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {(isAdmin || isManager) && (
        <FilterBar
          options={[
            { v: 'all', l: isManager ? `${user?.region} Region` : 'All Regions' },
            ...(isAdmin ? [
              { v: 'Northern', l: 'Northern' },
              { v: 'Central',  l: 'Central'  },
              { v: 'Southern', l: 'Southern' },
            ] : []),
          ]}
          active={region}
          onChange={setRegion}
        />
      )}

      {loading && <div className="text-center py-12 text-sm text-black/40 dark:text-white/40">Loading districts…</div>}

      {regionNames.map(reg => {
        const dists = grouped[reg] || [];
        if (dists.length === 0) return null;
        const summary = regionSummary(reg);
        const theme = REGION_THEME[reg];
        return (
          <section
            key={reg}
            className="rounded-[24px] border shadow-[0_10px_30px_rgba(15,23,42,0.08)] overflow-hidden bg-white dark:bg-[#0f1623]"
            style={{
              borderColor: theme.panelBorder,
            }}
          >
            <div
              className="px-4 sm:px-6 py-4 sm:py-5 flex flex-wrap items-center gap-4 border-b"
              style={{ borderColor: theme.panelBorder }}
            >
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full shrink-0" style={{ background: theme.dot }} />
                <h3 className="text-2xl font-black text-slate-950 dark:text-white m-0">{reg} Region</h3>
              </div>
              <div className="ml-auto flex items-center gap-5 text-sm">
                <span
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-medium"
                  style={{ background: theme.chipBg, color: theme.chipText, borderColor: theme.panelBorder }}
                >
                  {summary.activePct}% Coverage
                </span>
                <span className="text-slate-500 font-medium">{summary.districts} districts</span>
                <ChevronUp size={18} className="text-slate-400" />
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {dists.map(d => {
                  const isExpanded = expanded === d.id;
                  const schoolCount = Number(d.schools_count) || Number(d.school_count) || 0;
                  const learners = Number(d.learners) || Number(d.students) || 0;
                  const trainings = districtData[d.id]?.trainings || [];
                  const clusters = districtData[d.id]?.clusters || [];
                  const clusterCount =
                    clusters.length ||
                    Number(d.clusters_count) ||
                    Number(d.cluster_count) ||
                    0;
                  const upcoming = trainings.filter(t => getTrainingStatus(t.start_date, t.end_date) === 'upcoming');
                  const active = trainings.filter(t => getTrainingStatus(t.start_date, t.end_date) === 'active');
                  const completed = trainings.filter(t => getTrainingStatus(t.start_date, t.end_date) === 'completed');
                  return (
                    <Card
                      key={d.id}
                      className={`rounded-[18px] border shadow-none p-4 sm:p-5 transition-all cursor-pointer bg-white dark:bg-[#0f1623] ${
                        isExpanded ? 'ring-2 ring-offset-2 ring-orange-300' : ''
                      }`}
                      style={{
                        borderColor: isExpanded ? theme.dot : theme.panelBorder,
                      }}
                      onClick={() => toggleExpand(d.id)}
                    >
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <CheckCircle size={20} style={{ color: d.is_active ? '#16a34a' : theme.chipText }} className="shrink-0" />
                            <h4 className="text-xl font-black text-slate-950 dark:text-white m-0 truncate">{d.name}</h4>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
                            {d.coordinator_name ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                                <CheckCircle size={11} /> DC: {d.coordinator_name}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                                <AlertCircle size={11} /> No DC Assigned
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: d.is_active ? '#16a34a' : '#94a3b8' }}>
                          {d.is_active ? 'active' : 'planned'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        {[
                          { value: schoolCount, label: 'Schools' },
                          { value: learners, label: 'Learners' },
                          { value: clusterCount, label: 'Clusters' },
                        ].map(item => (
                          <div key={item.label}>
                            <div className="text-lg font-extrabold text-slate-950 dark:text-white leading-none">{item.value}</div>
                            <div className="text-xs text-slate-500 mt-1">{item.label}</div>
                          </div>
                        ))}
                      </div>

                      {canManage(d) && (
                        <div className="flex flex-wrap gap-2 mt-4" onClick={e => e.stopPropagation()}>
                          <Btn size="sm" variant="secondary" onClick={() => { setReportForm({ number_of_tots: d.number_of_tots || d.tots || '', teachers_trained: d.teachers_trained || '', school_coverage: d.school_coverage || d.coverage || '', notes: '' }); setReportModal(d); }}>
                            <FileText size={12} /> Update Stats
                          </Btn>
                          <Btn size="sm" variant="primary" onClick={() => { setTrainingForm({ training_name: '', cohort: '', start_date: '', participants: '', venue: '', training_lead_name: '' }); setTrainingModal({ district: d }); }}>
                            <Plus size={12} /> Add Training
                          </Btn>
                          {isAdmin && (
                            <Btn size="sm" variant="ghost" onClick={() => { setAssignUserId(d.district_coordinator_user_id || ''); setAssignModal(d); }}>
                              <Users size={12} /> Assign DC
                            </Btn>
                          )}
                        </div>
                      )}

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t" style={{ borderColor: theme.panelBorder }} onClick={e => e.stopPropagation()}>
                          <div className="mb-4">
                            <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Clusters in district</div>
                            {clusters.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {clusters.map((cluster, idx) => (
                                  <span key={cluster.id || cluster.cluster_id || idx} className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                                    {cluster.name || cluster.cluster_name || `Cluster ${idx + 1}`}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <div className="text-xs text-slate-500">No clusters recorded yet.</div>
                            )}
                          </div>

                          {districtData[d.id] ? (
                            <div className="space-y-2">
                              <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Training activity</div>
                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  { label: 'Upcoming', value: upcoming.length, color: '#1e40af' },
                                  { label: 'Active', value: active.length, color: '#c44d00' },
                                  { label: 'Completed', value: completed.length, color: '#065f46' },
                                ].map(item => (
                                  <div key={item.label} className="rounded-xl bg-white/70 dark:bg-slate-900/70 border border-white/60 dark:border-slate-700 p-2">
                                    <div className="text-base font-black" style={{ color: item.color }}>{item.value}</div>
                                    <div className="text-[10px] text-slate-500">{item.label}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-slate-500">Click to load district details.</div>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}

      {/* ── MODALS — all outside the map loop ── */}

      {/* Assign DC Modal */}
      {assignModal && (
        <Modal title={`Assign DC — ${assignModal.name}`} onClose={() => setAssignModal(null)} width={420}>
          {assignModal.coordinator_name ? (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300">
              <CheckCircle size={14} className="mt-0.5 shrink-0" />
              <span>
                Currently assigned: <strong>{assignModal.coordinator_name}</strong>. Selecting a new DC below will replace them.
              </span>
            </div>
          ) : (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-xs text-amber-800 dark:text-amber-300">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>No District Coordinator assigned yet. Select one below.</span>
            </div>
          )}
          <FSelect label="Select District Coordinator *" value={assignUserId} onChange={e => setAssignUserId(e.target.value)}>
            <option value="">Choose a DC…</option>
            {dcUsers.map(u => (
              <option key={u.id} value={u.id}>{u.name} — {u.district || 'No district'}</option>
            ))}
          </FSelect>
          {assignUserId && assignModal.district_coordinator_user_id &&
            String(assignUserId) !== String(assignModal.district_coordinator_user_id) && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2">
              ⚠️ This will replace <strong>{assignModal.coordinator_name}</strong> as DC for {assignModal.name}.
            </p>
          )}
          <div className="flex gap-2 justify-end mt-3">
            <Btn size="sm" variant="ghost" onClick={() => setAssignModal(null)}>Cancel</Btn>
            <Btn size="sm" variant="primary" onClick={assignDC} disabled={!assignUserId}>Assign</Btn>
          </div>
        </Modal>
      )}

      {/* Report Modal */}
      {reportModal && (
        <Modal title={`Update Stats — ${reportModal.name}`} onClose={() => setReportModal(null)} width={480}>
          <p className="text-xs text-black/50 dark:text-white/50 mb-4">Submit latest district statistics.</p>
          <FInput label="Number of TOTs *" type="number" value={reportForm.number_of_tots} onChange={e => setReportForm(p => ({ ...p, number_of_tots: e.target.value }))} />
          <FInput label="Teachers Trained *" type="number" value={reportForm.teachers_trained} onChange={e => setReportForm(p => ({ ...p, teachers_trained: e.target.value }))} />
          <FInput label="School Coverage (%) *" type="number" value={reportForm.school_coverage} onChange={e => setReportForm(p => ({ ...p, school_coverage: e.target.value }))} />
          <FArea label="Notes" value={reportForm.notes} onChange={e => setReportForm(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Any additional context…" />
          <div className="flex gap-2 justify-end mt-3">
            <Btn size="sm" variant="ghost" onClick={() => setReportModal(null)}>Cancel</Btn>
            <Btn size="sm" variant="primary" onClick={submitReport}>Submit</Btn>
          </div>
        </Modal>
      )}

      {/* Training Modal */}
      {trainingModal && (
        <Modal title={`${trainingModal.training ? 'Edit' : 'Add'} Training — ${trainingModal.district.name}`} onClose={() => setTrainingModal(null)} width={520}>
          <p className="text-xs text-black/50 dark:text-white/50 mb-4">End date is automatically set to 6 days after start date.</p>
          <FInput label="Training Name *" value={trainingForm.training_name} onChange={e => setTrainingForm(p => ({ ...p, training_name: e.target.value }))} placeholder="e.g. ETT Cohort 16 — Lilongwe Urban" />
          <FInput label="Cohort" value={trainingForm.cohort} onChange={e => setTrainingForm(p => ({ ...p, cohort: e.target.value }))} placeholder="e.g. Cohort 16" />
          <FInput label="Start Date *" type="date" value={trainingForm.start_date} onChange={e => setTrainingForm(p => ({ ...p, start_date: e.target.value }))} />
          {trainingForm.start_date && (
            <p className="text-[11px] text-orange-600 -mt-2 mb-2">
              End date: {new Date(new Date(trainingForm.start_date).setDate(new Date(trainingForm.start_date).getDate() + 6)).toDateString()}
            </p>
          )}
          <FInput label="Number of Participants" type="number" value={trainingForm.participants} onChange={e => setTrainingForm(p => ({ ...p, participants: e.target.value }))} />
          <FInput label="Venue" value={trainingForm.venue} onChange={e => setTrainingForm(p => ({ ...p, venue: e.target.value }))} placeholder="e.g. Lilongwe Teachers College" />
          <FInput label="Training Lead Name" value={trainingForm.training_lead_name} onChange={e => setTrainingForm(p => ({ ...p, training_lead_name: e.target.value }))} placeholder="e.g. Grace Kamwendo" />
          <div className="flex gap-2 justify-end mt-3">
            <Btn size="sm" variant="ghost" onClick={() => setTrainingModal(null)}>Cancel</Btn>
            <Btn size="sm" variant="primary" onClick={submitTraining}>
              {trainingModal.training ? 'Save Changes' : 'Add Training'}
            </Btn>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteModal && (
        <Modal title="Delete Training" onClose={() => setDeleteModal(null)} width={400}>
          <p className="text-sm text-black/70 dark:text-white/70 mb-4">Are you sure you want to delete this training? This cannot be undone.</p>
          <div className="flex gap-2 justify-end">
            <Btn size="sm" variant="ghost" onClick={() => setDeleteModal(null)}>Cancel</Btn>
            <Btn size="sm" variant="secondary" onClick={deleteTraining}>
              <Trash2 size={13} /> Delete
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── TRAINING CARD ────────────────────────────────────────────────────────────

const TrainingCard: React.FC<{
  training: any;
  status: 'upcoming' | 'active' | 'completed';
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ training, status, canManage, onEdit, onDelete }) => {
  const cfg = STATUS_CFG[status];
  const pct = status === 'active' ? getProgressPct(training.start_date) : status === 'completed' ? 100 : 0;
  const startDate = training.start_date ? new Date(training.start_date).toLocaleDateString() : '—';
  const endDate   = training.end_date   ? new Date(training.end_date).toLocaleDateString()   : '—';

  return (
    <div className="p-3 rounded-lg border border-neutral-200 dark:border-slate-800 mb-2 bg-white dark:bg-[#0f1623]">
      <div className="flex items-start gap-2 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-xs text-black dark:text-white">{training.name}</span>
            {training.cohort && <span className="text-[10px] text-black/50 dark:text-white/50">· {training.cohort}</span>}
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold" style={{ color: cfg.color, background: cfg.bg }}>
              {cfg.icon}{cfg.label}
            </span>
          </div>
          <div className="text-[11px] text-black/50 dark:text-white/50 space-y-0.5">
            <div>📅 {startDate} → {endDate} · 👥 {training.participants || 0} participants</div>
            {training.venue && <div>📍 {training.venue}</div>}
            {training.training_lead_name && <div>👤 Lead: {training.training_lead_name}</div>}
          </div>
          {status === 'active' && (
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[10px] text-black/50 dark:text-white/50">
                <span>Progress</span><span className="font-bold text-orange-600">{pct}%</span>
              </div>
              <ProgBar pct={pct} color="#e85d04" />
            </div>
          )}
        </div>
        {canManage && (
          <div className="flex gap-1 shrink-0">
            <button onClick={onEdit} className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-slate-800 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white">
              <Edit2 size={12} />
            </button>
            <button onClick={onDelete} className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 text-black/40 dark:text-white/40 hover:text-red-600">
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
