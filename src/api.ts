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
    api.put(`/api/document-reports/${id}/status`, { status, feedback }),
  forward: (id: number) => api.put(`/api/document-reports/${id}/forward`, {}),
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
// ─── ANALYTICS ───────────────────────────────────────────────────────────────

export const analyticsApi = {
  get: () => api.get('/api/analytics'),
};
// ─── DISTRICT MANAGEMENT ─────────────────────────────────────────────────────

export const districtsApi = {
  getAll: () => api.get('/api/districts'),
  getOne: (id: number) => api.get(`/api/districts/${id}`),
  getReports: (id: number) => api.get(`/api/districts/${id}/reports`),
  submitReport: (id: number, data: any) => api.post(`/api/districts/${id}/reports`, data),
  getTrainings: (id: number) => api.get(`/api/districts/${id}/trainings`),
  createTraining: (id: number, data: any) => api.post(`/api/districts/${id}/trainings`, data),
  updateTraining: (id: number, data: any) => api.put(`/api/districts/trainings/${id}`, data),
  deleteTraining: (id: number) => api.delete(`/api/districts/trainings/${id}`),
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