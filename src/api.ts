import { unwrapList } from './utils/mapFallback';

export const BASE_URL = import.meta.env.VITE_API_URL || '';

const getToken = () => localStorage.getItem('token');

async function apiRequest(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...(options.headers || {}),
    },
  });

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && ('error' in data || 'message' in data))
        ? String((data as { error?: string; message?: string }).error || (data as { message?: string }).message)
        : `HTTP ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  get: (path: string) => apiRequest(path),
  post: (path: string, body: any) => apiRequest(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path: string, body: any) => apiRequest(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path: string) => apiRequest(path, { method: 'DELETE' }),
};

async function apiGetList(path: string, keys: string[]) {
  const data = await api.get(path);
  return unwrapList(data, keys);
}

// ─── apiFetch — used by analyticsApi, monitoringApi, mapApi ──────────────────
async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token') || '';
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── REPORTS ─────────────────────────────────────────────────────────────────

export const reportsApi = {
  getAll: (country?: string) => apiGetList(`/api/reports${country && country !== 'all' ? `?country=${country}` : ''}`, ['reports', 'data', 'items']),
  getById: (id: number) => api.get(`/api/reports/${id}`),
  create: (data: any) => api.post('/api/reports', data),
  update: (id: number, data: any) => api.put(`/api/reports/${id}`, data),
  delete: (id: number) => api.delete(`/api/reports/${id}`),
  addComment: (id: number, content: string) => api.post(`/api/reports/${id}/comments`, { content }),
};

// ─── USERS ───────────────────────────────────────────────────────────────────

export const usersApi = {
  getMyNotificationPreferences: () => api.get('/api/users/me/notification-preferences'),
  updateMyNotificationPreferences: (prefs: any) => api.put('/api/users/me/notification-preferences', prefs),
  getAll: () => apiGetList('/api/users', ['users', 'data', 'items']),
  login: (email: string, password: string) => api.post('/api/users/login', { email, password }),
  forgotPassword: (email: string) => api.post('/api/users/forgot-password', { email }),
  updateProfile: (userId: string, data: { name: string; email: string }) =>
    api.put(`/api/users/${userId}`, data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/api/users/change-password', data),
  adminResetPassword: (id: string) => api.post(`/api/users/${id}/admin-reset-password`, {}),
  getAuditLog: (id: string) => apiGetList(`/api/users/${id}/audit-log`, ['log', 'data', 'items']),
};

// ─── STATS ───────────────────────────────────────────────────────────────────

export const statsApi = {
  get: (country?: string, region?: string) => {
    const params = new URLSearchParams();
    if (country && country !== 'all') params.set('country', country);
    if (region && region !== 'all') params.set('region', region);
    const qs = params.toString();
    return api.get(`/api/stats${qs ? `?${qs}` : ''}`);
  },
};

// ─── DOCUMENT REPORTS ────────────────────────────────────────────────────────

export const documentReportsApi = {
  getInbox: () => apiGetList('/api/document-reports/inbox', ['inbox', 'reports', 'data', 'items']),
  getSent: () => apiGetList('/api/document-reports/sent', ['sent', 'reports', 'data', 'items']),
  getUnreadCount: () => api.get('/api/document-reports/unread-count'),
  updateStatus: (id: number, status: string, feedback?: string) =>
    api.put(`/api/document-reports/${id}`, { status, feedback }),
  forward: (id: number) => api.put(`/api/document-reports/${id}`, { status: 'forwarded' }),
  delete: (id: number) => api.delete(`/api/document-reports/${id}`),
  submit: async (formData: FormData) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/api/document-reports`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    return res.json();
  },
  getDownloadUrl: (filePath: string) => `${BASE_URL}${filePath}`,
};

export const announcementsApi = {
  getActive: (country?: string) => apiGetList(`/api/announcements/active${country && country !== 'all' ? `?country=${country}` : ''}`, ['announcements', 'data', 'items']),
  getAll: (country?: string) => apiGetList(`/api/announcements${country && country !== 'all' ? `?country=${country}` : ''}`, ['announcements', 'data', 'items']),
  dismiss: (id: number) => api.post(`/api/announcements/${id}/dismiss`, {}),
  delete: (id: number) => api.delete(`/api/announcements/${id}`),
  update: async (id: number, formData: FormData) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/api/announcements/${id}`, {
      method: 'PUT',
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      body: formData,
    });
    return res.json();
  },
  submit: async (formData: FormData) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/api/announcements`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    return res.json();
  },
  getDownloadUrl: (filePath: string) => `${BASE_URL}${filePath}`,
  getDashboardVisible: (country?: string) => apiGetList(`/api/announcements/dashboard-visible${country && country !== 'all' ? `?country=${country}` : ''}`, ['announcements', 'data', 'items']),
};

// ─── Analytics API ────────────────────────────────────────────────────────────
export const analyticsApi = {
  /** GET /api/analytics */
  get: () =>
    apiFetch('/api/analytics').catch(err => {
      console.error('analyticsApi.get failed:', err.message);
      return { error: err.message };
    }),
};
// ─── DISTRICT MANAGEMENT ─────────────────────────────────────────────────────

export const districtsApi = {
  getAll: (country?: string) => apiGetList(`/api/districts${country && country !== 'all' ? `?country=${country}` : ''}`, ['districts', 'data', 'items']),
  getCountries: () => api.get('/api/districts/meta/countries'),
  getOne: (id: number) => api.get(`/api/districts/${id}`),
  getReports: (id: number) => apiGetList(`/api/districts/${id}/reports`, ['reports', 'data', 'items']),
  submitReport: (id: number, data: any) => api.post(`/api/districts/${id}/reports`, data),
  getTrainings: (id: number) => apiGetList(`/api/districts/${id}/trainings`, ['trainings', 'data', 'items']),
  createTraining: (id: number, data: any) => api.post(`/api/districts/${id}/trainings`, data),
  updateTraining: (id: number, data: any) => api.put(`/api/trainings/${id}`, data),
  deleteTraining: (id: number) => api.delete(`/api/trainings/${id}`),
  assignDC: (name: string, userId: string) => api.put(`/api/districts/${name}/assign-dc`, { userId }),
  create: (data: any) => api.post('/api/districts', data),
  update: (name: string, data: any) => api.put(`/api/districts/${encodeURIComponent(name)}`, data),
  delete: (name: string) => api.delete(`/api/districts/${encodeURIComponent(name)}`),
  bulkImport: (districts: any[]) => api.post('/api/districts/bulk-import', { districts }),
};
// ─── GBV CASES ───────────────────────────────────────────────────────────────

export const gbvCasesApi = {
  getAll: () => apiGetList('/api/gbv-cases', ['cases', 'data', 'items']),
  submit: (data: any) => api.post('/api/gbv-cases', data),
  updateStatus: (id: number, status: string) => api.put(`/api/gbv-cases/${id}/status`, { status }),
  getKanban: () => apiGetList('/api/gbv-cases/kanban', ['cases', 'data', 'items']),
  moveStage: (id: number, stage: string) => api.put(`/api/gbv-cases/${id}/stage`, { stage }),
  getStats: () => api.get('/api/gbv-cases/stats/summary'),
  getCasesByDistrict: (country?: string) =>
    api.get(`/api/gbv-cases/stats/by-district${country && country !== 'all' ? `?country=${country}` : ''}`),
  delete: (id: number) => api.delete(`/api/gbv-cases/${id}`),
};

export const staffMentorshipApi = {
  getAll: (country?: string) => apiGetList(`/api/staff-mentorship${country && country !== 'all' ? `?country=${country}` : ''}`, ['records', 'data', 'items']),
  submit: (data: any) => api.post('/api/staff-mentorship', data),
  update: (id: number, data: any) => api.put(`/api/staff-mentorship/${id}`, data),
  delete: (id: number) => api.delete(`/api/staff-mentorship/${id}`),
};

export const clusterFollowupsApi = {
  getAvailableClusters: (country?: string) =>
    api.get(`/api/cluster-followups/available-clusters${country && country !== 'all' ? `?country=${country}` : ''}`),
  getMyClusters: (country?: string) =>
    api.get(`/api/cluster-followups/my-clusters${country && country !== 'all' ? `?country=${country}` : ''}`),
  assignCluster: (clusterId: number) => api.post('/api/cluster-followups/my-clusters', { clusterId }),
  unassignCluster: (clusterId: number) => api.delete(`/api/cluster-followups/my-clusters/${clusterId}`),
  getThisWeek: (country?: string) =>
    api.get(`/api/cluster-followups/this-week${country && country !== 'all' ? `?country=${country}` : ''}`),
  submitFollowup: (data: any) => api.post('/api/cluster-followups/followup', data),
  getConsistency: (country?: string) => api.get(`/api/cluster-followups/consistency${country && country !== 'all' ? `?country=${country}` : ''}`),
  // District Coordinator -- assigning clusters to their own staff
  getDistrictStaff: () => api.get('/api/cluster-followups/district-staff'),
  getDistrictClusters: () => api.get('/api/cluster-followups/district-clusters'),
  assignToStaff: (userId: string, clusterId: number) => api.post('/api/cluster-followups/assign', { userId, clusterId }),
  unassignFromStaff: (userId: string, clusterId: number) => api.delete(`/api/cluster-followups/assign/${userId}/${clusterId}`),
};

export const districtRosterApi = {
  getAll: (type: string, district?: string) =>
    apiGetList(`/api/district-roster?type=${type}${district ? `&district=${district}` : ''}`, ['entries', 'data', 'items']),
  create: (data: any) => api.post('/api/district-roster', data),
  update: (id: number, data: any) => api.put(`/api/district-roster/${id}`, data),
  delete: (id: number) => api.delete(`/api/district-roster/${id}`),
  bulkImportTeachers: async (file: File) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}/api/district-roster/bulk-import`, {
      method: 'POST',
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      body: formData,
    });
    return res.json();
  },
};

export const districtAssetsApi = {
  getAll: (district?: string) => apiGetList(`/api/district-assets${district ? `?district=${district}` : ''}`, ['assets', 'data', 'items']),
  create: (data: any) => api.post('/api/district-assets', data),
  update: (id: number, data: any) => api.put(`/api/district-assets/${id}`, data),
  delete: (id: number) => api.delete(`/api/district-assets/${id}`),
};

export const districtStakeholdersApi = {
  getAll: (district?: string) => apiGetList(`/api/district-stakeholders${district ? `?district=${district}` : ''}`, ['stakeholders', 'data', 'items']),
  create: (data: any) => api.post('/api/district-stakeholders', data),
  update: (id: number, data: any) => api.put(`/api/district-stakeholders/${id}`, data),
  delete: (id: number) => api.delete(`/api/district-stakeholders/${id}`),
};

export const weeklyPlanningApi = {
  getTable: (biweekStart?: string) => api.get(`/api/weekly-planning${biweekStart ? `?biweekStart=${biweekStart}` : ''}`),
  submit: (activities: any[], biweekStart?: string) => api.post('/api/weekly-planning/submit', { activities, biweekStart }),
  updateActivity: (id: number, data: any) => api.put(`/api/weekly-planning/${id}`, data),
  deleteActivity: (id: number) => api.delete(`/api/weekly-planning/${id}`),
  getStats: (biweekStart?: string) => api.get(`/api/weekly-planning/stats${biweekStart ? `?biweekStart=${biweekStart}` : ''}`),
  generateReport: (biweekStart?: string) => api.post('/api/weekly-planning/generate-report', biweekStart ? { biweekStart } : {}),
  getReport: (id: number | string) => api.get(`/api/weekly-planning/report/${id}`),
  listReports: () => api.get('/api/weekly-planning/reports'),
};

export const planningSchedulesApi = {
  getAll: (country?: string, district?: string) => {
    const qs = new URLSearchParams();
    if (country && country !== 'all') qs.set('country', country);
    if (district) qs.set('district', district);
    const q = qs.toString();
    return apiGetList(`/api/planning-schedules${q ? `?${q}` : ''}`, ['schedules', 'data', 'items']);
  },
  getMyThisBiweek: () => api.get('/api/planning-schedules/mine/this-biweek'),
  submit: (data: any) => api.post('/api/planning-schedules', data),
  getSummary: (country?: string) => api.get(`/api/planning-schedules/summary${country && country !== 'all' ? `?country=${country}` : ''}`),
  sendReport: () => api.post('/api/planning-schedules/send-report', {}),
};

export const clusterTeachbacksApi = {
  getAll: (country?: string) => apiGetList(`/api/cluster-teachbacks${country && country !== 'all' ? `?country=${country}` : ''}`, ['records', 'data', 'items']),
  create: (data: any) => api.post('/api/cluster-teachbacks', data),
  update: (id: number, data: any) => api.put(`/api/cluster-teachbacks/${id}`, data),
  delete: (id: number) => api.delete(`/api/cluster-teachbacks/${id}`),
  getSummary: (country?: string) => api.get(`/api/cluster-teachbacks/summary${country && country !== 'all' ? `?country=${country}` : ''}`),
};

export const ttsRecordsApi = {
  getAll: (country?: string) => apiGetList(`/api/tts-records${country && country !== 'all' ? `?country=${country}` : ''}`, ['records', 'data', 'items']),
  create: (data: any) => api.post('/api/tts-records', data),
  update: (id: number, data: any) => api.put(`/api/tts-records/${id}`, data),
  delete: (id: number) => api.delete(`/api/tts-records/${id}`),
  getSummary: (country?: string) => api.get(`/api/tts-records/summary${country && country !== 'all' ? `?country=${country}` : ''}`),
};

export const trocaireRecordsApi = {
  getAll: (country?: string) => apiGetList(`/api/trocaire-records${country && country !== 'all' ? `?country=${country}` : ''}`, ['records', 'data', 'items']),
  create: (data: any) => api.post('/api/trocaire-records', data),
  update: (id: number, data: any) => api.put(`/api/trocaire-records/${id}`, data),
  delete: (id: number) => api.delete(`/api/trocaire-records/${id}`),
  getSummary: (country?: string) => api.get(`/api/trocaire-records/summary${country && country !== 'all' ? `?country=${country}` : ''}`),
};

export const clusterSchoolSessionsApi = {
  getMyClusters: () => api.get('/api/cluster-school-sessions/my-clusters'),
  getSchools: (clusterId: number) => api.get(`/api/cluster-school-sessions/schools?clusterId=${clusterId}`),
  getMine: (schoolId: number, reportingMonth: string) =>
    api.get(`/api/cluster-school-sessions/mine?schoolId=${schoolId}&reportingMonth=${reportingMonth}`),
  getAll: (country?: string) => apiGetList(`/api/cluster-school-sessions${country && country !== 'all' ? `?country=${country}` : ''}`, ['records', 'data', 'items']),
  submit: (data: any) => api.post('/api/cluster-school-sessions', data),
  getSummary: (country?: string) => api.get(`/api/cluster-school-sessions/summary${country && country !== 'all' ? `?country=${country}` : ''}`),
  getConsistency: (country?: string) => api.get(`/api/cluster-school-sessions/consistency${country && country !== 'all' ? `?country=${country}` : ''}`),
};

export const annualActivitiesApi = {
  getThisWeek: () => api.get('/api/annual-activities/this-week'),
  markComplete: (id: number, completionStatus: string, completionComment?: string) =>
    api.put(`/api/annual-activities/${id}/complete`, { completionStatus, completionComment }),
  getAll: (country?: string, filters?: { quarter?: string; district?: string; region?: string; completionStatus?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (country && country !== 'all') qs.set('country', country);
    if (filters?.quarter) qs.set('quarter', filters.quarter);
    if (filters?.district) qs.set('district', filters.district);
    if (filters?.region) qs.set('region', filters.region);
    if (filters?.completionStatus) qs.set('completionStatus', filters.completionStatus);
    if (filters?.search) qs.set('search', filters.search);
    const q = qs.toString();
    return apiGetList(`/api/annual-activities${q ? `?${q}` : ''}`, ['activities', 'data', 'items']);
  },
  getSummary: (country?: string) => api.get(`/api/annual-activities/summary${country && country !== 'all' ? `?country=${country}` : ''}`),
  update: (id: number, data: any) => api.put(`/api/annual-activities/${id}`, data),
  create: (data: any) => api.post('/api/annual-activities', data),
};

export const monthlyDcReportsApi = {
  getAll: (country?: string) => apiGetList(`/api/monthly-dc-reports${country && country !== 'all' ? `?country=${country}` : ''}`, ['reports', 'data', 'items']),
  getOne: (id: number) => api.get(`/api/monthly-dc-reports/${id}`),
  getLatestSummary: (country?: string) => apiGetList(`/api/monthly-dc-reports/summary/latest${country && country !== 'all' ? `?country=${country}` : ''}`, ['reports', 'data', 'items']),
  getDownloadUrl: (id: number) => `${BASE_URL}/api/monthly-dc-reports/${id}/download`,
  submit: async (formData: FormData) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/api/monthly-dc-reports`, {
      method: 'POST',
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      body: formData,
    });
    return res.json();
  },
};

export const sessionMonitoringApi = {
  getAll: (type: string, country?: string) =>
    api.get(`/api/session-monitoring?type=${type}${country && country !== 'all' ? `&country=${country}` : ''}`),
  submit: (data: any) => api.post('/api/session-monitoring', data),
  update: (id: number, data: any) => api.put(`/api/session-monitoring/${id}`, data),
  delete: (id: number) => api.delete(`/api/session-monitoring/${id}`),
  getRegionalView: (country?: string) =>
    api.get(`/api/session-monitoring/regional-view${country && country !== 'all' ? `?country=${country}` : ''}`),
  getRegionalPerformance: (country?: string) =>
    api.get(`/api/session-monitoring/regional-performance${country && country !== 'all' ? `?country=${country}` : ''}`),
};

export const qaReportsApi = {
  getAll: (country?: string) => apiGetList(`/api/qa-reports${country && country !== 'all' ? `?country=${country}` : ''}`, ['reports', 'data', 'items']),
  submit: async (formData: FormData) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/api/qa-reports`, {
      method: 'POST',
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      body: formData,
    });
    return res.json();
  },
  review: (id: number, status: string, reviewNotes?: string) =>
    api.put(`/api/qa-reports/${id}/review`, { status, reviewNotes }),
  getStats: (country?: string) => api.get(`/api/qa-reports/stats/summary${country && country !== 'all' ? `?country=${country}` : ''}`),
  getCompliance: (country?: string) => api.get(`/api/qa-reports/compliance${country && country !== 'all' ? `?country=${country}` : ''}`),
  getAttachmentUrl: (id: number) => `${BASE_URL}/api/qa-reports/${id}/attachment`,
  reassign: (id: number, assignedTo: string) => api.put(`/api/qa-reports/${id}/reassign`, { assignedTo }),
  getOfficers: () => apiGetList('/api/qa-reports/officers', ['officers', 'data', 'items']),
};

export const monthlyCaseReportsApi = {
  getStatus: () => api.get('/api/monthly-case-reports/status'),
  getAll: () => apiGetList('/api/monthly-case-reports', ['reports', 'data', 'items']),
  submit: (data: any) => api.post('/api/monthly-case-reports', data),
  getPendingReview: () => apiGetList('/api/monthly-case-reports/pending-review', ['reports', 'data', 'items']),
  approve: (id: number) => api.put(`/api/monthly-case-reports/${id}/approve`, {}),
};

// ─── SESSION RECORDS ──────────────────────────────────────────────────────────
export const sessionRecordsApi = {
  getAll:  ()             => apiGetList('/api/session-records', ['records', 'data', 'items']),
  submit:  (data: any)    => api.post('/api/session-records', data),
  update:  (id: number, data: any) => api.put(`/api/session-records/${id}`, data),
  delete:  (id: number)   => api.delete(`/api/session-records/${id}`),
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export const notificationsApi = {
  getAll: () => apiGetList('/api/notifications', ['notifications', 'data', 'items']),
  getUnreadCount: () => api.get('/api/notifications/unread-count'),
  markRead: (id: number) => api.put(`/api/notifications/${id}/read`, {}),
  markAllRead: () => api.put('/api/notifications/mark-all-read', {}),
};

// ─── CURRICULUM ──────────────────────────────────────────────────────────────
export const dataCompletenessApi = {
  get: () => api.get('/api/data-completeness'),
};

export const curriculumApi = {
  get: () => api.get('/api/curriculum'),
  updateOverview: (curriculum: string, body: any) => api.put(`/api/curriculum/overview/${curriculum}`, body),
  createModule: (body: any) => api.post('/api/curriculum/modules', body),
  updateModule: (id: number, body: any) => api.put(`/api/curriculum/modules/${id}`, body),
  deleteModule: (id: number) => api.delete(`/api/curriculum/modules/${id}`),
};

// ─── TEACHER RESOURCES ───────────────────────────────────────────────────────
export const teacherResourcesApi = {
  getAll: (curriculum?: string) => api.get(`/api/teacher-resources${curriculum ? `?curriculum=${curriculum}` : ''}`),
  upload: async (formData: FormData) => {
    const token = localStorage.getItem('token');
    const base = import.meta.env.VITE_API_URL || '';
    const res = await fetch(`${base}/api/teacher-resources`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || 'Upload failed');
    return data;
  },
  update: (id: number, body: any) => api.put(`/api/teacher-resources/${id}`, body),
  delete: (id: number) => api.delete(`/api/teacher-resources/${id}`),
};

// ─── IMPACT STORIES ───────────────────────────────────────────────────────────

export const impactStoriesApi = {
  getAll: (country?: string) => apiGetList(`/api/impact-stories${country && country !== 'all' ? `?country=${country}` : ''}`, ['stories', 'data', 'items']),
  getOne: (id: number) => api.get(`/api/impact-stories/${id}`),
  create: (data: any) => api.post('/api/impact-stories', data),
  update: (id: number, data: any) => api.put(`/api/impact-stories/${id}`, data),
  delete: (id: number) => api.delete(`/api/impact-stories/${id}`),
};
// ─── PROGRAMME STATS ─────────────────────────────────────────────────────────

export const programmeStatsApi = {
  getAll: (country?: string) => api.get(`/api/programme-stats${country && country !== 'all' ? `?country=${country}` : ''}`),
  update: (year: string, data: any) => api.put(`/api/programme-stats/${year}`, data),
  create: (data: any) => api.post('/api/programme-stats', data),
  delete: (year: string) => api.delete(`/api/programme-stats/${year}`),
};
// ─── TRAININGS ────────────────────────────────────────────────────────────────

export const trainingsApi = {
  getAll: (params?: string | { status?: string; country?: string; district?: string }) => {
    if (typeof params === 'string' || params === undefined) {
      const country = params;
      return apiGetList(`/api/trainings${country && country !== 'all' ? `?country=${country}` : ''}`, ['trainings', 'data', 'items']);
    }
    const qs = new URLSearchParams();
    if (params.status) qs.set('status', params.status);
    if (params.country) qs.set('country', params.country);
    if (params.district) qs.set('district', params.district);
    const q = qs.toString();
    return apiGetList(`/api/trainings${q ? `?${q}` : ''}`, ['trainings', 'data', 'items']);
  },
  create: (data: any) => api.post('/api/trainings', data),
  update: (id: number, data: any) => api.put(`/api/trainings/${id}`, data),
  delete: (id: number) => api.delete(`/api/trainings/${id}`),
};

// ─── Monitoring API ───────────────────────────────────────────────────────────
export const monitoringApi = {
  /** GET /api/monitoring/activities */
  getActivities: async (params?: { district?: string; month?: string; country?: string }) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    const data = await apiFetch(`/api/monitoring/activities${qs}`);
    return unwrapList(data, ['activities', 'data', 'items']);
  },

  /** POST /api/monitoring/activities */
  postActivity: (body: Record<string, any>) =>
    apiFetch('/api/monitoring/activities', { method: 'POST', body: JSON.stringify(body) }),

  /** PUT /api/monitoring/activities/:id */
  updateActivity: (id: number, body: Record<string, any>) =>
    apiFetch(`/api/monitoring/activities/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  /** DELETE /api/monitoring/activities/:id */
  deleteActivity: (id: number) =>
    apiFetch(`/api/monitoring/activities/${id}`, { method: 'DELETE' }),

  /** GET /api/monitoring/issues */
  getIssues: async (params?: { district?: string; month?: string; country?: string }) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    const data = await apiFetch(`/api/monitoring/issues${qs}`);
    return unwrapList(data, ['issues', 'data', 'items']);
  },

  /** POST /api/monitoring/issues */
  postIssue: (body: Record<string, any>) =>
    apiFetch('/api/monitoring/issues', { method: 'POST', body: JSON.stringify(body) }),

  /** PUT /api/monitoring/issues/:id */
  updateIssue: (id: number, body: Record<string, any>) =>
    apiFetch(`/api/monitoring/issues/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  /** DELETE /api/monitoring/issues/:id */
  deleteIssue: (id: number) =>
    apiFetch(`/api/monitoring/issues/${id}`, { method: 'DELETE' }),

  /** GET /api/monitoring/summary  (aggregate for charts) */
  getSummary: () => apiFetch('/api/monitoring/summary'),
};

// ─── CASE REFERRALS ────────────────────────────────────────────────────────

export const caseReferralsApi = {
  getAll: (params?: { status?: string; district?: string }) => {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiGetList(`/api/case-referrals${query}`, ['referrals', 'cases', 'data', 'items']);
  },
  getById: (id: number) => api.get(`/api/case-referrals/${id}`),
  create: (data: any) => api.post('/api/case-referrals', data),
  update: (id: number, data: any) => api.put(`/api/case-referrals/${id}`, data),
  delete: (id: number) => api.delete(`/api/case-referrals/${id}`),
};

// ─── SASA MONTHLY REPORTS ────────────────────────────────────────────────────

export const sasaReportsApi = {
  getAll: (params?: { status?: string; month?: string }) => {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiGetList(`/api/sasa-reports${query}`, ['reports', 'sasa_reports', 'data', 'items']);
  },
  getById: (id: number) => api.get(`/api/sasa-reports/${id}`),
  getAttachmentUrl: (id: number) => `${BASE_URL}/api/sasa-reports/${id}/attachment`,
  create: async (formData: FormData) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/api/sasa-reports`, {
      method: 'POST',
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      body: formData,
    });
    return res.json();
  },
  update: (id: number, data: any) => api.put(`/api/sasa-reports/${id}`, data),
  delete: (id: number) => api.delete(`/api/sasa-reports/${id}`),
};

// ─── MAP — CLUSTERS ──────────────────────────────────────────────────────────

export const mapClustersApi = {
  getAll: async (params?: { region?: string; district?: string; country?: string }) => {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    const data = await api.get(`/api/map/clusters${query}`);
    return unwrapList(data, ['clusters', 'data', 'items', 'results']);
  },
  getById:  (id: number) => api.get(`/api/map/clusters/${id}`),
  create:   (data: any)  => api.post('/api/map/clusters', data),
  update:   (id: number, data: any) => api.put(`/api/map/clusters/${id}`, data),
  delete:   (id: number) => api.delete(`/api/map/clusters/${id}`),
};

// ─── MAP — SCHOOLS ────────────────────────────────────────────────────────────

export const mapSchoolsApi = {
  getAll: async (params?: { cluster_id?: number; district?: string; region?: string; status?: string }) => {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    const data = await api.get(`/api/map/schools${query}`);
    return unwrapList(data, ['schools', 'data', 'items', 'results']);
  },
  getById:   (id: number) => api.get(`/api/map/schools/${id}`),
  create:    (data: any)  => api.post('/api/map/schools', data),
  update:    (id: number, data: any) => api.put(`/api/map/schools/${id}`, data),
  logVisit:  (id: number, data: any) => api.post(`/api/map/schools/${id}/visits`, data),
  bulkImport: async (file: File, country: string) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('country', country);
    const res = await fetch(`${BASE_URL}/api/map/schools/bulk-import`, {
      method: 'POST',
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      body: formData,
    });
    return res.json();
  },
};

export const mapZonesApi = {
  getAll: async () => {
    const data = await api.get('/api/map/zones');
    return unwrapList(data, ['zones', 'data', 'items']);
  },
};

// ─── Map / Clusters API ───────────────────────────────────────────────────────
export const mapApi = {
  /** GET /api/map/clusters  (or /api/clusters — whichever your server uses) */
  getClusters: (district?: string) => {
    const q = district ? `?district=${encodeURIComponent(district)}` : '';
    return apiFetch(`/api/map/clusters${q}`).catch(() => apiFetch(`/api/clusters${q}`));
  },
  updateCluster: (id: number, data: any) => api.put(`/api/map/clusters/${id}`, data),
};
// ─── YOUTH MEDIA (S3-backed videos & documents) ──────────────────────────────

export const youthApi = {
  getMedia: () => apiFetch('/api/youth/media'),
};
