/**
 * API Client for Ujamaadash Backend
 * Handles authentication and API calls to the backend server
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    name: string;
    district: string | null;
    avatar: string;
    status: string;
    clusterId?: number;
  };
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Authentication
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.token);
    return response;
  }

  logout() {
    this.clearToken();
  }

  // Users
  async getUsers() {
    return this.request('/api/users');
  }

  async getUser(id: string) {
    return this.request(`/api/users/${id}`);
  }

  async registerUser(userData: any) {
    return this.request('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: any) {
    return this.request(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Reports
  async getReports(params?: { district?: string; status?: string; limit?: number; offset?: number }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/api/reports${queryString ? `?${queryString}` : ''}`);
  }

  async getReport(id: number) {
    return this.request(`/api/reports/${id}`);
  }

  async createReport(reportData: any) {
    return this.request('/api/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async updateReport(id: number, reportData: any) {
    return this.request(`/api/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reportData),
    });
  }

  async deleteReport(id: number) {
    return this.request(`/api/reports/${id}`, {
      method: 'DELETE',
    });
  }

  async addComment(reportId: number, content: string) {
    return this.request(`/api/reports/${reportId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Clusters
  async getClusters(params?: { district?: string }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/api/clusters${queryString ? `?${queryString}` : ''}`);
  }

  async getCluster(id: number) {
    return this.request(`/api/clusters/${id}`);
  }

  async createCluster(clusterData: any) {
    return this.request('/api/clusters', {
      method: 'POST',
      body: JSON.stringify(clusterData),
    });
  }

  async updateCluster(id: number, clusterData: any) {
    return this.request(`/api/clusters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clusterData),
    });
  }

  async deleteCluster(id: number) {
    return this.request(`/api/clusters/${id}`, {
      method: 'DELETE',
    });
  }

  // Districts
  async getDistricts() {
    return this.request('/api/districts');
  }

  async getDistrict(name: string) {
    return this.request(`/api/districts/${name}`);
  }

  async createDistrict(districtData: any) {
    return this.request('/api/districts', {
      method: 'POST',
      body: JSON.stringify(districtData),
    });
  }

  async updateDistrict(name: string, districtData: any) {
    return this.request(`/api/districts/${name}`, {
      method: 'PUT',
      body: JSON.stringify(districtData),
    });
  }

  async deleteDistrict(name: string) {
    return this.request(`/api/districts/${name}`, {
      method: 'DELETE',
    });
  }

  // Tasks
  async getTasks(params?: { assignedTo?: string; status?: string; priority?: string }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/api/tasks${queryString ? `?${queryString}` : ''}`);
  }

  async getTask(id: number) {
    return this.request(`/api/tasks/${id}`);
  }

  async createTask(taskData: any) {
    return this.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(id: number, taskData: any) {
    return this.request(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(id: number) {
    return this.request(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Trainings
  async getTrainings(params?: { status?: string }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/api/trainings${queryString ? `?${queryString}` : ''}`);
  }

  async getTraining(id: number) {
    return this.request(`/api/trainings/${id}`);
  }

  async createTraining(trainingData: any) {
    return this.request('/api/trainings', {
      method: 'POST',
      body: JSON.stringify(trainingData),
    });
  }

  async updateTraining(id: number, trainingData: any) {
    return this.request(`/api/trainings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(trainingData),
    });
  }

  async deleteTraining(id: number) {
    return this.request(`/api/trainings/${id}`, {
      method: 'DELETE',
    });
  }

  // Documents
  async getDocuments(params?: { type?: string; category?: string }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/api/documents${queryString ? `?${queryString}` : ''}`);
  }

  async getDocument(id: number) {
    return this.request(`/api/documents/${id}`);
  }

  async createDocument(documentData: any) {
    return this.request('/api/documents', {
      method: 'POST',
      body: JSON.stringify(documentData),
    });
  }

  async updateDocument(id: number, documentData: any) {
    return this.request(`/api/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(documentData),
    });
  }

  async deleteDocument(id: number) {
    return this.request(`/api/documents/${id}`, {
      method: 'DELETE',
    });
  }

  // Case Referrals
  async getCaseReferrals(params?: { status?: string; district?: string }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/api/case-referrals${queryString ? `?${queryString}` : ''}`);
  }

  async getCaseReferral(id: number) {
    return this.request(`/api/case-referrals/${id}`);
  }

  async createCaseReferral(referralData: any) {
    return this.request('/api/case-referrals', {
      method: 'POST',
      body: JSON.stringify(referralData),
    });
  }

  async updateCaseReferral(id: number, referralData: any) {
    return this.request(`/api/case-referrals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(referralData),
    });
  }

  async deleteCaseReferral(id: number) {
    return this.request(`/api/case-referrals/${id}`, {
      method: 'DELETE',
    });
  }

  // SASA Reports
  async getSasaReports(params?: { status?: string; month?: string }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/api/sasa-reports${queryString ? `?${queryString}` : ''}`);
  }

  async getSasaReport(id: number) {
    return this.request(`/api/sasa-reports/${id}`);
  }

  async createSasaReport(reportData: any) {
    return this.request('/api/sasa-reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async updateSasaReport(id: number, reportData: any) {
    return this.request(`/api/sasa-reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reportData),
    });
  }

  async deleteSasaReport(id: number) {
    return this.request(`/api/sasa-reports/${id}`, {
      method: 'DELETE',
    });
  }

  // Health Check
  async healthCheck() {
    return this.request('/health');
  }

  async dbHealthCheck() {
    return this.request('/health/db');
  }
}

export const apiClient = new ApiClient();
