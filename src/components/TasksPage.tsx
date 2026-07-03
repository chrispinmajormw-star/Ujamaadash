import React, { useState, useEffect, useCallback } from 'react';
import { CheckSquare, ListTodo, Plus, Search, Calendar, ChevronRight, ChevronLeft, Trash2, RefreshCw } from 'lucide-react';
import { User } from '../types';
import { Card, Btn, Badge, FInput, FSelect, FArea, Modal } from './SubComponents';
import { DISTRICT_LIST } from '../data';
import { api } from '../api';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  assignedRole: 'admin' | 'district_coordinator' | 'data_entry';
  dueDate: string; // YYYY-MM-DD
  district: string;
  category: string;
  status: 'todo' | 'progress' | 'completed';
}

interface TasksPageProps {
  user: User | null;
}

const PRIORITY_CFG = {
  high: { label: 'High Priority', color: '#dc2626', bg: '#fee2e2' },
  medium: { label: 'Medium', color: '#d97706', bg: '#fef3c7' },
  low: { label: 'Standard', color: '#4b5563', bg: '#f3f4f6' }
};

const DEFAULT_TASKS: TaskItem[] = [
  // Admin tasks
  {
    id: 't1',
    title: 'Audit GESD Phase 2 Syllabus Refinements',
    description: 'Ensure safety protocols and boundary checklists match the updated school graduation criteria.',
    priority: 'high',
    assignedRole: 'admin',
    dueDate: '2026-05-28',
    district: 'National',
    category: 'Curriculum Review',
    status: 'progress'
  },
  {
    id: 't2',
    title: 'Verify pending ToT applications',
    description: 'Approve or requests review logs for 12 incoming Trainer of Trainers from Mangochi central.',
    priority: 'medium',
    assignedRole: 'admin',
    dueDate: '2026-05-30',
    district: 'Mangochi',
    category: 'User Management',
    status: 'todo'
  },
  {
    id: 't3',
    title: 'Compile Ministry of Education Annual Summary',
    description: 'Export regional KPIs, student attendance ratios, and incident helpline maps.',
    priority: 'high',
    assignedRole: 'admin',
    dueDate: '2026-05-18',
    district: 'National',
    category: 'System Reporting',
    status: 'completed'
  },
  // District Coordinators tasks
  {
    id: 't4',
    title: 'Schedule Dedza Central School Observations',
    description: 'Coordinate in-person visits with Mary Chirwa to audit Topic 4 bystander step-up tactics.',
    priority: 'medium',
    assignedRole: 'district_coordinator',
    dueDate: '2026-05-27',
    district: 'Dedza',
    category: 'Field Monitoring',
    status: 'todo'
  },
  {
    id: 't5',
    title: 'Verify June curriculum materials dispatch',
    description: 'Track if HIM workbooks and classroom signs have reached the Lilongwe North clusters.',
    priority: 'high',
    assignedRole: 'district_coordinator',
    dueDate: '2026-05-25',
    district: 'Lilongwe',
    category: 'Operations',
    status: 'progress'
  },
  {
    id: 't6',
    title: 'Convene Monthly District review panel',
    description: 'Go over submittals folder discrepancies and confirm approved GESD session files.',
    priority: 'low',
    assignedRole: 'district_coordinator',
    dueDate: '2026-05-14',
    district: 'Blantyre',
    category: 'Review folders',
    status: 'completed'
  },
  // Data entry tasks
  {
    id: 't7',
    title: 'Submit outstanding Kawale Primary reports',
    description: 'Digitize and upload boys HIM Day 2 participation metrics and success stories.',
    priority: 'high',
    assignedRole: 'data_entry',
    dueDate: '2026-05-26',
    district: 'Lilongwe',
    category: 'Data Uploads',
    status: 'todo'
  },
  {
    id: 't8',
    title: 'Re-verify cohort sizes for Mzimba cluster',
    description: 'Cross-reference paper registration logs with students listed online to clear system mismatch.',
    priority: 'medium',
    assignedRole: 'data_entry',
    dueDate: '2026-05-29',
    district: 'Mzimba',
    category: 'Data Uploads',
    status: 'progress'
  }
];

export const TasksPage: React.FC<TasksPageProps> = ({ user }) => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskItem['priority'],
    assignedRole: 'data_entry' as TaskItem['assignedRole'],
    dueDate: new Date().toISOString().split('T')[0],
    district: user?.district || 'National',
    category: 'Data Entry'
  });

  // Load tasks from API
  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/tasks');
      if (Array.isArray(data)) {
        setTasks(data.map((t: any) => ({
          id: String(t.id),
          title: t.title,
          description: t.description || '',
          priority: t.priority || 'medium',
          assignedRole: t.assigned_role || 'data_entry',
          dueDate: t.due_date ? t.due_date.split('T')[0] : '',
          district: t.district || 'National',
          category: t.category || 'General',
          status: t.status === 'in_progress' ? 'progress'
                : t.status === 'completed'   ? 'completed'
                : 'todo', // pending, todo, or anything else → todo
        })));
      }
    } catch { }
    setLoading(false);
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  useEffect(() => {
  if (user) {
    setRoleFilter('all'); // show all tasks by default
    setNewTask(p => ({ ...p, assignedRole: (user.role as any) || 'data_entry', district: user.district || 'National' }));
  }
}, [user]);

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;
    try {
      const created = await api.post('/api/tasks', {
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        priority: newTask.priority,
        assigned_role: newTask.assignedRole,
        due_date: newTask.dueDate,
        district: newTask.district,
        category: newTask.category || 'General Operations',
        status: 'pending',
        assigned_to: null,
        assigned_by: user?.id || null,
      });
      if (created && !created.error) {
        // Add immediately to UI — don't wait for reload
        const mapped: TaskItem = {
          id: String(created.id),
          title: created.title,
          description: created.description || '',
          priority: created.priority || 'medium',
          assignedRole: created.assigned_role || newTask.assignedRole,
          dueDate: created.due_date ? created.due_date.split('T')[0] : newTask.dueDate,
          district: created.district || newTask.district,
          category: created.category || newTask.category,
          status: 'todo',
        };
        setTasks(prev => [mapped, ...prev]);
        setShowAddModal(false);
        setNewTask({
          title: '', description: '', priority: 'medium',
          assignedRole: (user?.role as any) || 'data_entry',
          dueDate: new Date().toISOString().split('T')[0],
          district: user?.district || 'National',
          category: 'Operations'
        });
      }
    } catch { }
  };

  const handleMoveStatus = async (id: string, nextStatus: TaskItem['status']) => {
    const apiStatus = nextStatus === 'progress' ? 'in_progress' : nextStatus === 'completed' ? 'completed' : 'pending';
    try {
      await api.put(`/api/tasks/${id}`, { status: apiStatus });
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: nextStatus } : t));
    } catch { }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/api/tasks/${id}`);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch { }
  };

  // Filter processes
  const filteredTasks = tasks.filter(t => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || t.assignedRole === roleFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;

    return matchesSearch && matchesRole && matchesPriority;
  });

  const todoTasks = filteredTasks.filter(t => t.status === 'todo');
  const progressTasks = filteredTasks.filter(t => t.status === 'progress');
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');

  const getRoleLabel = (r: string) => {
    if (r === 'admin') return 'National Admin';
    if (r === 'district_coordinator') return 'Coordinator';
    return 'Data Entry Officer';
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-slate-800 mb-6">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e85d04] select-none">PORTAL ACTIONS</span>
          <h1 className="text-2xl font-extrabold text-black dark:text-white tracking-tight font-sans">Operations Tasks</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Register checkpoints, cross-examine database entries, schedule school reviews, and delegate task sheets.
          </p>
        </div>
        <div className="flex gap-2 self-start md:self-auto">
          <button onClick={loadTasks} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-orange-600 transition-colors px-2 py-1.5 rounded border border-slate-200">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <Btn variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
            <Plus size={14} /> New Task Entry
          </Btn>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12 text-slate-400 text-sm">Loading tasks from database...</div>
      )}

      {/* FILTER CONTROLS BAR WITH INTUITIVE INPUTS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white dark:bg-[#0f1623] p-3.5 rounded-2xl border border-neutral-200 dark:border-slate-800 mb-6 font-sans">
        
        {/* Search bar */}
        <div className="md:col-span-2 relative flex items-center">
          <Search size={14} className="absolute left-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks title, context summary..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#0f1623] text-gray-800 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl text-xs focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none transition-all placeholder-gray-400 dark:placeholder-slate-500"
          />
        </div>

        {/* Assigned role filter */}
        <div className="relative flex items-center bg-white dark:bg-[#0f1623] p-1 px-3 border border-gray-200 dark:border-slate-700 rounded-xl">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mr-1 whitespace-nowrap">Assigned to:</span>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="w-full bg-transparent text-xs font-bold text-gray-700 dark:text-white border-none outline-none cursor-pointer py-1"
          >
            <option value="all">Everyone's Log</option>
            <option value="admin">Admin Staff Tasks</option>
            <option value="district_coordinator">District Coordinators</option>
            <option value="data_entry">Data Entry Officers</option>
          </select>
        </div>

        {/* Priority filter */}
        <div className="relative flex items-center bg-white dark:bg-[#0f1623] p-1 px-3 border border-gray-200 dark:border-slate-700 rounded-xl">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mr-1 whitespace-nowrap">Priority:</span>
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="w-full bg-transparent text-xs font-bold text-gray-700 dark:text-white border-none outline-none cursor-pointer py-1"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Standard Tasks</option>
          </select>
        </div>

      </div>

      {/* THREE-COLUMN BOARD MATRIX WITH FAINT GRAY BORDERS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        
        {/* COLUMN 1: TO DO */}
        <div className="flex flex-col h-full bg-white dark:bg-[#0f1623] rounded-2xl p-4 border border-neutral-200 dark:border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-slate-800 mb-4 font-sans">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <h3 className="text-sm font-extrabold text-black dark:text-white tracking-tight">Planned Backlog</h3>
            </div>
            <span className="font-mono text-xs font-bold bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-300 px-2 py-0.5 rounded-md">
              {todoTasks.length}
            </span>
          </div>

          <div className="space-y-3 min-h-[420px] overflow-y-auto">
            {todoTasks.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-600">
                <p className="text-xs font-semibold">No planned items</p>
                <p className="text-[10.5px] mt-1 px-4">Create or filter differently to show operations backlogs.</p>
              </div>
            ) : (
              todoTasks.map(t => renderTaskCard(t))
            )}
          </div>
        </div>

        {/* COLUMN 2: IN PROGRESS */}
        <div className="flex flex-col h-full bg-white dark:bg-[#0f1623] rounded-2xl p-4 border border-neutral-200 dark:border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-slate-800 mb-4 font-sans">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h3 className="text-sm font-extrabold text-black dark:text-white tracking-tight">Active Operations</h3>
            </div>
            <span className="font-mono text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-450 px-2 py-0.5 rounded-md">
              {progressTasks.length}
            </span>
          </div>

          <div className="space-y-3 min-h-[420px] overflow-y-auto">
            {progressTasks.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-600">
                <p className="text-xs font-semibold">No active tasks</p>
                <p className="text-[10.5px] mt-1 px-4">Move a backlog task right using controls to begin operating.</p>
              </div>
            ) : (
              progressTasks.map(t => renderTaskCard(t))
            )}
          </div>
        </div>

        {/* COLUMN 3: COMPLETED */}
        <div className="flex flex-col h-full bg-white dark:bg-[#0f1623] rounded-2xl p-4 border border-neutral-200 dark:border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-slate-800 mb-4 font-sans">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-extrabold text-black dark:text-white tracking-tight">Certified Completed</h3>
            </div>
            <span className="font-mono text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 px-2 py-0.5 rounded-md">
              {completedTasks.length}
            </span>
          </div>

          <div className="space-y-3 min-h-[420px] overflow-y-auto">
            {completedTasks.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-600">
                <p className="text-xs font-semibold">No finished entries</p>
                <p className="text-[10.5px] mt-1 px-4">Log accomplishments when database or visits are resolved.</p>
              </div>
            ) : (
              completedTasks.map(t => renderTaskCard(t))
            )}
          </div>
        </div>

      </div>

      {/* RENDER DYNAMIC CARD DETAIL PORTION */}
      {showAddModal && (
        <Modal
          title="Create Actionable Task Log"
          onClose={() => setShowAddModal(false)}
          width={480}
        >
          <div className="space-y-4">
            <FInput
              label="Task Short Description"
              placeholder="e.g., Audit Mbayani primary attendance data gaps"
              value={newTask.title}
              onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
            />

            <FArea
              label="Core Directives & Checklist"
              placeholder="Provide exact procedures, requirements, hotlines to evaluate, or details about compliance gaps."
              value={newTask.description}
              onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
              rows={3}
            />

            <div className="grid grid-cols-2 gap-3">
              <FSelect
                label="Owner Role Delegation"
                value={newTask.assignedRole}
                onChange={e => setNewTask(p => ({ ...p, assignedRole: e.target.value as any }))}
              >
                <option value="admin">Administrators</option>
                <option value="district_coordinator">District Coordinators</option>
                <option value="data_entry">Data Entry Officers</option>
              </FSelect>

              <FSelect
                label="Priority Factor"
                value={newTask.priority}
                onChange={e => setNewTask(p => ({ ...p, priority: e.target.value as any }))}
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Standard Operation</option>
              </FSelect>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FInput
                label="Due Target Date"
                type="date"
                value={newTask.dueDate}
                onChange={e => setNewTask(p => ({ ...p, dueDate: e.target.value }))}
              />

              <FSelect
                label="Assigned District Area"
                value={newTask.district}
                onChange={e => setNewTask(p => ({ ...p, district: e.target.value }))}
              >
                <option value="National">National Hub / All</option>
                {DISTRICT_LIST.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </FSelect>
            </div>

            <FInput
              label="Assigned Category Tag"
              placeholder="e.g. Data Audit, District Visit, Hotlines Review"
              value={newTask.category}
              onChange={e => setNewTask(p => ({ ...p, category: e.target.value }))}
            />

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-200 dark:border-slate-800">
              <Btn variant="secondary" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Btn>
              <Btn variant="primary" size="sm" onClick={handleAddTask}>
                Register Assignment
              </Btn>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );

  // RENDER DYNAMIC CARD HELPER FUNCTION WITH MODERATE FONTS
  function renderTaskCard(t: TaskItem) {
    const pc = PRIORITY_CFG[t.priority];
    return (
      <Card
        key={t.id}
        className="p-4 bg-white dark:bg-[#0f1623] border border-neutral-200 dark:border-slate-800 hover:border-orange-200 transition duration-150 flex flex-col justify-between"
      >
        <div>
          {/* Header row: category and actions */}
          <div className="flex items-center justify-between gap-1.5 mb-2.5">
            <span className="text-[9px] font-extrabold uppercase bg-orange-50 dark:bg-orange-950/30 px-2 py-0.5 rounded border border-orange-100 dark:border-orange-900/40 text-orange-600 dark:text-orange-300 font-mono tracking-wider">
              {t.category}
            </span>
            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
              <button
                onClick={() => handleDeleteTask(t.id)}
                className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-none bg-transparent"
                title="Remove task sheet"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {/* Title with priority marker */}
          <h4 className="text-xs font-bold text-black dark:text-white line-clamp-2 leading-tight mb-1.5">
            {t.title}
          </h4>

          {/* Description */}
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mb-3">
            {t.description}
          </p>

          {/* District badge & role assignment */}
          <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-neutral-200 dark:border-slate-800 mb-3 text-[10px] font-semibold text-gray-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pc.color }} />
              <span className="text-[9px] font-mono" style={{ color: pc.color }}>{pc.label}</span>
            </div>
            <span>•</span>
            <span className="bg-[#fff1e6] dark:bg-amber-950/15 text-[#e85d04] px-1.5 rounded text-[9px] font-mono leading-tight">{getRoleLabel(t.assignedRole)}</span>
            {t.district !== 'National' && (
              <>
                <span>•</span>
                <span className="text-slate-500 font-mono text-[9px]">{t.district}</span>
              </>
            )}
          </div>
        </div>

        {/* BOTTOM STEP CONTROLLERS */}
        <div className="flex items-center justify-between text-[10.5px] text-slate-400 font-bold">
          <div className="flex items-center gap-1 font-mono text-gray-400 text-[10px]">
            <Calendar size={11} />
            <span>Due: {t.dueDate}</span>
          </div>

          <div className="flex items-center gap-1">
            {t.status !== 'todo' && (
              <button
                onClick={() => handleMoveStatus(t.id, t.status === 'completed' ? 'progress' : 'todo')}
                className="p-1 px-1.5 rounded border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer text-gray-500 dark:text-slate-400 text-[10px] flex items-center bg-transparent transition"
                title="Shift back"
              >
                <ChevronLeft size={12} /> Back
              </button>
            )}
            
            {t.status !== 'completed' && (
              <button
                onClick={() => handleMoveStatus(t.id, t.status === 'todo' ? 'progress' : 'completed')}
                className="p-1 px-1.5 rounded border border-[#e85d04]/20 hover:border-[#e85d04]/40 hover:bg-[#fff1e6]/10 text-[#e85d04] cursor-pointer text-[10px] flex items-center bg-transparent transition font-extrabold"
                title="Shift status forward"
              >
                Next <ChevronRight size={12} />
              </button>
            )}

            {t.status === 'completed' && (
              <Badge text="Certified" color="#065f46" bg="#dcfce7" className="text-[9px] py-0 px-1 hover:none font-mono" />
            )}
          </div>
        </div>

      </Card>
    );
  }
};
