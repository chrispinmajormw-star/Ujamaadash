const BASE_URL = 'https://13.61.100.62.nip.io';

const getToken = () => localStorage.getItem('token');

export const api = {
  get: async (path: string) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
      },
    });
    return res.json();
  },

  post: async (path: string, body: any) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
      },
      body: JSON.stringify(body),
    });
    return res.json();
  },

  put: async (path: string, body: any) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
      },
      body: JSON.stringify(body),
    });
    return res.json();
  },

  delete: async (path: string) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
      },
    });
    return res.json();
  },
};

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
  getAll: () => api.get('/api/reports'),
  getById: (id: number) => api.get(`/api/reports/${id}`),
  create: (data: any) => api.post('/api/reports', data),
  update: (id: number, data: any) => api.put(`/api/reports/${id}`, data),
  delete: (id: number) => api.delete(`/api/reports/${id}`),
  addComment: (id: number, content: string) => api.post(`/api/reports/${id}/comments`, { content }),
};

// ─── USERS ───────────────────────────────────────────────────────────────────

export const usersApi = {
  getAll: () => api.get('/api/users'),
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
  getInbox: () => api.get('/api/document-reports/inbox'),
  getSent: () => api.get('/api/document-reports/sent'),
  getUnreadCount: () => api.get('/api/document-reports/unread-count'),
  updateStatus: (id: number, status: string, feedback?: string) =>
    api.put(`/api/document-reports/${id}`, { status, feedback }),
  forward: (id: number) => api.put(`/api/document-reports/${id}`, { status: 'forwarded' }),
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
  getDownloadUrl: (filename: string) => `${BASE_URL}/api/document-reports/download/${filename}`,
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
  getAll: () => api.get('/api/districts'),
  getOne: (id: number) => api.get(`/api/districts/${id}`),
  getReports: (id: number) => api.get(`/api/districts/${id}/reports`),
  submitReport: (id: number, data: any) => api.post(`/api/districts/${id}/reports`, data),
  getTrainings: (id: number) => api.get(`/api/districts/${id}/trainings`),
  createTraining: (id: number, data: any) => api.post(`/api/districts/${id}/trainings`, data),
  updateTraining: (id: number, data: any) => api.put(`/api/trainings/${id}`, data),
  deleteTraining: (id: number) => api.delete(`/api/trainings/${id}`),
  assignDC: (id: number, userId: string) => api.put(`/api/districts/${id}/assign-dc`, { userId }),
};
// ─── GBV CASES ───────────────────────────────────────────────────────────────

export const gbvCasesApi = {
  getAll: () => api.get('/api/gbv-cases'),
  submit: (data: any) => api.post('/api/gbv-cases', data),
  updateStatus: (id: number, status: string) => api.put(`/api/gbv-cases/${id}/status`, { status }),
};

// ─── SESSION RECORDS ──────────────────────────────────────────────────────────

export const sessionRecordsApi = {
  getAll: () => api.get('/api/session-records'),
  submit: (data: any) => api.post('/api/session-records', data),
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export const notificationsApi = {
  getAll: () => api.get('/api/notifications'),
  getUnreadCount: () => api.get('/api/notifications/unread-count'),
  markRead: (id: number) => api.put(`/api/notifications/${id}/read`, {}),
  markAllRead: () => api.put('/api/notifications/mark-all-read', {}),
};

// ─── IMPACT STORIES ───────────────────────────────────────────────────────────

export const impactStoriesApi = {
  getAll: () => api.get('/api/impact-stories'),
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
  getAll: () => api.get('/api/trainings'),
};

// ─── Monitoring API ───────────────────────────────────────────────────────────
export const monitoringApi = {
  /** GET /api/monitoring/activities */
  getActivities: (params?: { district?: string; month?: string }) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiFetch(`/api/monitoring/activities${qs}`);
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
  getIssues: (params?: { district?: string; month?: string }) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return apiFetch(`/api/monitoring/issues${qs}`);
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
    return api.get(`/api/case-referrals${query}`);
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
    return api.get(`/api/sasa-reports${query}`);
  },
  getById: (id: number) => api.get(`/api/sasa-reports/${id}`),
  create: (data: any) => api.post('/api/sasa-reports', data),
  update: (id: number, data: any) => api.put(`/api/sasa-reports/${id}`, data),
  delete: (id: number) => api.delete(`/api/sasa-reports/${id}`),
};

// ─── MAP — CLUSTERS ──────────────────────────────────────────────────────────

export const mapClustersApi = {
  getAll: (params?: { region?: string; district?: string }) => {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return api.get(`/api/map/clusters${query}`);
  },
  getById:  (id: number) => api.get(`/api/map/clusters/${id}`),
  create:   (data: any)  => api.post('/api/map/clusters', data),
  update:   (id: number, data: any) => api.put(`/api/map/clusters/${id}`, data),
  delete:   (id: number) => api.delete(`/api/map/clusters/${id}`),
};

// ─── MAP — SCHOOLS ────────────────────────────────────────────────────────────

export const mapSchoolsApi = {
  getAll: (params?: { cluster_id?: number; district?: string; region?: string; status?: string }) => {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return api.get(`/api/map/schools${query}`);
  },
  getById:   (id: number) => api.get(`/api/map/schools/${id}`),
  create:    (data: any)  => api.post('/api/map/schools', data),
  update:    (id: number, data: any) => api.put(`/api/map/schools/${id}`, data),
  logVisit:  (id: number, data: any) => api.post(`/api/map/schools/${id}/visits`, data),
};

export const mapZonesApi = {
  getAll: () => api.get('/api/map/zones'),
};

// ─── Map / Clusters API ───────────────────────────────────────────────────────
export const mapApi = {
  /** GET /api/map/clusters  (or /api/clusters — whichever your server uses) */
  getClusters: () => apiFetch('/api/map/clusters').catch(() => apiFetch('/api/clusters')),
};