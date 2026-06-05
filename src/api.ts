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