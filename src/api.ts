import { unwrapList } from './utils/mapFallback';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://13.61.100.62.nip.io';

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
  getAll: () => apiGetList('/api/reports', ['reports', 'data', 'items']),
  getById: (id: number) => api.get(`/api/reports/${id}`),
  create: (data: any) => api.post('/api/reports', data),
  update: (id: number, data: any) => api.put(`/api/reports/${id}`, data),
  delete: (id: number) => api.delete(`/api/reports/${id}`),
  addComment: (id: number, content: string) => api.post(`/api/reports/${id}/comments`, { content }),
};

// ─── USERS ───────────────────────────────────────────────────────────────────

export const usersApi = {
  getAll: () => apiGetList('/api/users', ['users', 'data', 'items']),
  login: (email: string, password: string) => api.post('/api/users/login', { email, password }),
  forgotPassword: (email: string) => api.post('/api/users/forgot-password', { email }),
  updateProfile: (userId: string, data: { name: string; email: string }) =>
    api.put(`/api/users/${userId}`, data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/api/users/change-password', data),
};

// ─── STATS ───────────────────────────────────────────────────────────────────

export const statsApi = {
  get: () => api.get('/api/stats'),
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
  getAll: () => apiGetList('/api/districts', ['districts', 'data', 'items']),
  getOne: (id: number) => api.get(`/api/districts/${id}`),
  getReports: (id: number) => apiGetList(`/api/districts/${id}/reports`, ['reports', 'data', 'items']),
  submitReport: (id: number, data: any) => api.post(`/api/districts/${id}/reports`, data),
  getTrainings: (id: number) => apiGetList(`/api/districts/${id}/trainings`, ['trainings', 'data', 'items']),
  createTraining: (id: number, data: any) => api.post(`/api/districts/${id}/trainings`, data),
  updateTraining: (id: number, data: any) => api.put(`/api/trainings/${id}`, data),
  deleteTraining: (id: number) => api.delete(`/api/trainings/${id}`),
  assignDC: (id: number, userId: string) => api.put(`/api/districts/${id}/assign-dc`, { userId }),
};
// ─── GBV CASES ───────────────────────────────────────────────────────────────

export const gbvCasesApi = {
  getAll: () => apiGetList('/api/gbv-cases', ['cases', 'data', 'items']),
  submit: (data: any) => api.post('/api/gbv-cases', data),
  updateStatus: (id: number, status: string) => api.put(`/api/gbv-cases/${id}/status`, { status }),
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

// ─── IMPACT STORIES ───────────────────────────────────────────────────────────

export const impactStoriesApi = {
  getAll: () => apiGetList('/api/impact-stories', ['stories', 'data', 'items']),
  getOne: (id: number) => api.get(`/api/impact-stories/${id}`),
  create: (data: any) => api.post('/api/impact-stories', data),
  update: (id: number, data: any) => api.put(`/api/impact-stories/${id}`, data),
  delete: (id: number) => api.delete(`/api/impact-stories/${id}`),
};
// ─── PROGRAMME STATS ─────────────────────────────────────────────────────────

export const programmeStatsApi = {
  getAll: () => api.get('/api/programme-stats'),
  update: (year: string, data: any) => api.put(`/api/programme-stats/${year}`, data),
  create: (data: any) => api.post('/api/programme-stats', data),
  delete: (year: string) => api.delete(`/api/programme-stats/${year}`),
};
// ─── TRAININGS ────────────────────────────────────────────────────────────────

export const trainingsApi = {
  getAll: () => apiGetList('/api/trainings', ['trainings', 'data', 'items']),
};

// ─── Monitoring API ───────────────────────────────────────────────────────────
export const monitoringApi = {
  /** GET /api/monitoring/activities */
  getActivities: async (params?: { district?: string; month?: string }) => {
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
  getIssues: async (params?: { district?: string; month?: string }) => {
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
  create: (data: any) => api.post('/api/sasa-reports', data),
  update: (id: number, data: any) => api.put(`/api/sasa-reports/${id}`, data),
  delete: (id: number) => api.delete(`/api/sasa-reports/${id}`),
};

// ─── MAP — CLUSTERS ──────────────────────────────────────────────────────────

export const mapClustersApi = {
  getAll: async (params?: { region?: string; district?: string }) => {
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
  getClusters: () => apiFetch('/api/map/clusters').catch(() => apiFetch('/api/clusters')),
};