/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  email: string;
  password?: string;
  role:
    | 'admin'
    | 'tot'
    | 'data_entry'
    | 'district_coordinator'
    | 'viewer'
    | 'sasa_officer'
    | 'program_manager'
    | 'program_staff'
    | 'field_officer'
    | 'cartographer';
  name: string;
  region: string | null;   // 'Northern' | 'Central' | 'Southern' | null (HQ)
  district: string | null;
  avatar: string;
  status: 'active' | 'pending' | 'inactive';
  clusterId?: number;
}

export interface Report {
  id: number;
  school: string;
  district: string;
  zone: string;
  boys: number;
  girls: number;
  curriculum: string;
  session: string;
  status: 'approved' | 'pending' | 'rejected' | 'forwarded' | 'draft';
  submitted_by: string;
  submitted_at: string;
  challenges: string;
  success: string;
  sentTo?: string;
  sentToLabel?: string;
  workflow_status?: string;
  submitted_role?: string;
  photos?: File[];
  comments?: Comment[];
}

export interface Comment {
  id: number;
  reportId: number;
  author: string;
  content: string;
  timestamp: string;
}

export interface Cluster {
  id: number;
  name: string;
  district: string;
  lead: string;
  leadPhone?: string;
  schools: number;
  students: number;
  progress: number;
  trained: number;
}

export interface District {
  name: string;
  r: 'Northern' | 'Central' | 'Southern';
  s: 'Active' | 'Planned';
  tots: number;
  schools: number;
  cov: number;
  population: string;
  zones: number;
  teachersTrained: number;
}

export interface Training {
  name: string;
  loc: string;
  venue: string;
  trainers: string;
  dates: string;
  pax: number;
  day: number | null;
  s: 'active' | 'upcoming' | 'completed';
}

// ─── Rich content block types (used in Session.content) ──────────────────────

export interface ContentBlock {
  type:
    | 'paragraph'
    | 'trainer_says'
    | 'activity'
    | 'definition'
    | 'tip'
    | 'scenario'
    | 'table'
    | 'values_grid'
    | 'step_grid'
    | 'pledge'
    | 'cheer'
    | 'helpline';
  title?: string;
  label?: string;
  content?: string;
  items?: string[];
  headers?: string[];
  rows?: string[][];
  columns?: { title: string; items: string[] }[];
  steps?: string[];
}

export interface Session {
  num: string;
  title: string;
  dur: string;
  desc: string;
  pledge: string | null;
  objectives: string[];
  content?: ContentBlock[];
  keyTakeaways?: string[];
}

export interface QuizQuestion {
  id: number;
  topic: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Document {
  id: number;
  title: string;
  type: 'curriculum' | 'guide' | 'template' | 'report';
  category: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  size: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdAt: string;
  reportId?: number;
}

export interface CaseReferral {
  id: number;
  caseId: number;
  caseSchool: string;
  caseDistrict: string;
  agency: string;
  agencyLabel: string;
  referredBy: string;
  referredAt: string;
  status: 'pending' | 'in_progress' | 'resolved';
  outcome?: string;
  notes?: string;
}

export interface SasaMonthlyReport {
  id: number;
  month: string;
  submittedBy: string;
  submittedAt: string;
  totalCases: number;
  publicCases: number;
  referrals: number;
  resolvedReferrals: number;
  highlights: string;
  challenges: string;
  recommendations: string;
  status: 'draft' | 'submitted';
}