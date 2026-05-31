import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, MapPin, Tag, Trash2, Clock, Info } from 'lucide-react';
import { User } from '../types';
import { Card, Btn, Badge, FInput, FSelect, FArea, Modal } from './SubComponents';
import { DISTRICT_LIST } from '../data';
import { safeStorage } from '../utils/storage';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  category: 'training' | 'deadline' | 'visit' | 'audit';
  district: string; // 'National' or school district
  createdBy: string;
  createdByName: string;
}

interface CalendarPageProps {
  user: User | null;
}

const CATEGORY_STYLES = {
  training: { label: 'Training Session', color: '#e85d04', bg: 'rgba(232, 93, 4, 0.1)', border: 'rgba(232, 93, 4, 0.2)' },
  deadline: { label: 'File Deadline', color: '#065f46', bg: 'rgba(6, 95, 70, 0.1)', border: 'rgba(6, 95, 70, 0.2)' },
  visit: { label: 'School Visit', color: '#1e40af', bg: 'rgba(30, 64, 175, 0.1)', border: 'rgba(30, 64, 175, 0.2)' },
  audit: { label: 'District Audit', color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.1)', border: 'rgba(124, 58, 237, 0.2)' }
};

const makeDate = (dayOffset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

const DEFAULT_EVENTS: CalendarEvent[] = [
  {
    id: 'e1',
    title: 'Kawale Primary HIM Topic 3 Session',
    description: 'Weekly Hero In Me training focusing on assertive verbal techniques. Led by local Trainer of Trainers.',
    date: makeDate(2),
    category: 'training',
    district: 'Lilongwe',
    createdBy: '2',
    createdByName: 'Trainer of Trainers'
  },
  {
    id: 'e2',
    title: 'District Coordination Progress Audit',
    description: 'Quarterly compliance and checklist audit of submissions for Lilongwe and Dedza clusters.',
    date: makeDate(5),
    category: 'audit',
    district: 'Lilongwe',
    createdBy: '4',
    createdByName: 'District Coordinator'
  },
  {
    id: 'e3',
    title: 'Mbayani Primary GESD Core Evaluation',
    description: 'School visit to evaluate Girls Empowerment Self-Defense trainer skills and classroom alignment.',
    date: makeDate(8),
    category: 'visit',
    district: 'Blantyre',
    createdBy: '4',
    createdByName: 'Mary Chirwa'
  },
  {
    id: 'e4',
    title: 'ETT Reports Submission Deadline',
    description: 'All monthly data summary uploads must be completed and marked as submitted to district.',
    date: makeDate(12),
    category: 'deadline',
    district: 'National',
    createdBy: '1',
    createdByName: 'Administrator'
  },
  {
    id: 'e5',
    title: 'Zomba LEA Physical Coaching Session',
    description: 'Joint physical technique refresher course with special attention on combined session coordination.',
    date: makeDate(15),
    category: 'training',
    district: 'Zomba',
    createdBy: '1',
    createdByName: 'Administrator'
  },
  {
    id: 'e6',
    title: 'Karonga Lakeshore Cluster Kickoff',
    description: 'Planning meeting for Phase 2 expansion clusters. District coordinators and local leaders expected.',
    date: makeDate(20),
    category: 'visit',
    district: 'Karonga',
    createdBy: '1',
    createdByName: 'Administrator'
  }
];

export const CalendarPage: React.FC<CalendarPageProps> = ({ user }) => {
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = safeStorage.getItem('ett_calendar_events');
    return saved ? JSON.parse(saved) : DEFAULT_EVENTS;
  });

  // Keep track of current calendar navigate date
  const today = new Date();
  const [currentDate, setCurrentDate] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDistrict, setFilterDistrict] = useState<string>('all');

  // New Event Form State
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: todayStr,
    category: 'training' as CalendarEvent['category'],
    district: 'National'
  });

  useEffect(() => {
    safeStorage.setItem('ett_calendar_events', JSON.stringify(events));
  }, [events]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleAddEvent = () => {
    if (!newEvent.title.trim()) return;

    const added: CalendarEvent = {
      id: 'evt_' + Date.now(),
      title: newEvent.title.trim(),
      description: newEvent.description.trim() || 'No description provided.',
      date: newEvent.date,
      category: newEvent.category,
      district: newEvent.district,
      createdBy: user?.id || 'public',
      createdByName: user?.name || 'Authorized Officer'
    };

    setEvents(prev => [...prev, added]);
    setShowAddModal(false);
    setNewEvent({
      title: '',
      description: '',
      date: selectedDateStr,
      category: 'training',
      district: user?.district || 'National'
    });
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm('Are you sure you want to dismiss this scheduled event?')) {
      setEvents(prev => prev.filter(e => e.id !== id));
    }
  };

  // Generate Month Days grid
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // Weekday of first day of the month

  const blanks = Array(firstDayIndex).fill(null);
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const daysGrid = [...blanks, ...monthDays];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const filteredEvents = events.filter(e => {
    const catMatch = filterCategory === 'all' || e.category === filterCategory;
    const destMatch = filterDistrict === 'all' || e.district === filterDistrict;
    return catMatch && destMatch;
  });

  const getEventsForDay = (dayNum: number) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    return filteredEvents.filter(e => e.date === dayStr);
  };

  const selectedDayEvents = filteredEvents.filter(e => e.date === selectedDateStr);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/60 mb-6">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e85d04] select-none">PLANNING REGISTER</span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight font-sans">
            Operations Calendar
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Schedule collaborative teacher check-ins, reporting targets, curriculum reviews, and district milestones.
          </p>
        </div>

        {/* ROLE INDICATOR BADGE */}
        {user && (
          <div className="flex items-center gap-2 self-start md:self-auto bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Access Scope: <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase">{user.role.replace('_', ' ')}</span>
            </span>
          </div>
        )}
      </div>

      {/* FILTERS & QUICK CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-slate-50/50 dark:bg-slate-900/30 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800/60">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 bg-white dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold mr-1">Category:</span>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 border-none outline-none cursor-pointer"
            >
              <option value="all">All Operations</option>
              <option value="training">Training Sessions</option>
              <option value="visit">School Visits</option>
              <option value="audit">District Audits</option>
              <option value="deadline">Deadlines</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-white dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold mr-1">District:</span>
            <select
              value={filterDistrict}
              onChange={e => setFilterDistrict(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 border-none outline-none cursor-pointer"
            >
              <option value="all">All Districts</option>
              <option value="National">National Hub Only</option>
              {DISTRICT_LIST.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* CLICK TO ADD BUTTON */}
        <Btn
          variant="primary"
          size="sm"
          onClick={() => {
            setNewEvent(p => ({ ...p, date: selectedDateStr }));
            setShowAddModal(true);
          }}
        >
          <Plus size={14} /> Schedule Event
        </Btn>
      </div>

      {/* CORE CALENDAR GRID & EVENT DETAIL split panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* CALENDAR DATE GRID BOARD */}
        <Card className="lg:col-span-8 p-4">
          
          {/* Calendar Month Selector Header */}
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <CalendarIcon size={18} className="text-[#e85d04]" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {monthNames[month]} <span className="font-light text-slate-500">{year}</span>
              </h2>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 cursor-pointer text-slate-600 dark:text-slate-400 transition"
                title="Previous Month"
              >
                <ChevronLeft size={15} />
              </button>
              
              <button
                onClick={() => { setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDateStr(todayStr); }}
                className="px-2.5 py-1 text-xs font-mono bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 font-bold transition cursor-pointer"
              >
                Today
              </button>

              <button
                onClick={handleNextMonth}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 cursor-pointer text-slate-600 dark:text-slate-400 transition"
                title="Next Month"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          {/* Weekday Labels Header */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] uppercase tracking-widest text-slate-400 mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Monthly grid cell matrix */}
          <div className="grid grid-cols-7 gap-1.5">
            {daysGrid.map((day, idx) => {
              if (day === null) {
                return (
                  <div
                    key={`blank-${idx}`}
                    className="aspect-square bg-slate-50/15 dark:bg-slate-950/5 rounded-xl border border-slate-100/40 dark:border-slate-900/10 pointer-events-none"
                  />
                );
              }

              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = selectedDateStr === dateStr;
              const isToday = dateStr === todayStr;
              const dayEvents = getEventsForDay(day);

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`aspect-square p-1.5 rounded-xl border cursor-pointer relative transition flex flex-col justify-between group overflow-hidden ${
                    isSelected
                      ? 'border-[#e85d04] bg-[#fff1e6]/30 dark:bg-orange-950/25 ring-1 ring-[#e85d04]/20'
                      : isToday
                      ? 'border-[#e85d04]/60 bg-[#fff1e6]/10 dark:bg-orange-950/12'
                      : 'border-slate-200/80 dark:border-slate-800/70 hover:border-slate-300 dark:hover:border-slate-700 bg-white/50 dark:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[12px] font-mono leading-none ${
                      isSelected
                        ? 'font-extrabold text-[#e85d04]'
                        : isToday
                        ? 'font-extrabold text-orange-600'
                        : 'text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                    }`}>
                      {day}
                    </span>

                    {/* Today indicator Dot */}
                    {isToday && (
                      <span className="w-1.5 h-1.5 bg-[#e85d04] rounded-full" title="Today" />
                    )}
                  </div>

                  {/* Bullet badges for scheduled events of the day */}
                  <div className="flex flex-col gap-0.5 mt-auto max-h-[70%] overflow-hidden select-none">
                    {dayEvents.slice(0, 3).map(e => {
                      const style = CATEGORY_STYLES[e.category];
                      return (
                        <div
                          key={e.id}
                          className="text-[9px] px-1 py-0.5 rounded border leading-tight truncate text-left"
                          style={{
                            color: style.color,
                            backgroundColor: style.bg,
                            borderColor: style.border
                          }}
                          title={e.title}
                        >
                          {e.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-[8px] text-slate-400 font-bold pl-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 mt-4.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 font-mono">
            <Info size={12} className="text-slate-400" />
            <span>Click any grid square to inspect schedule parameters or register a new operation on that day.</span>
          </div>

        </Card>

        {/* SELECTED DAY EVENTS SIDE PANEL */}
        <div className="lg:col-span-4 space-y-4">
          
          <Card className="border border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 select-none">DAY AGENDA</span>
                <span className="block text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono uppercase">
                  {new Date(selectedDateStr).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>

              {selectedDateStr === todayStr && (
                <Badge text="Today" color="#e85d04" bg="#fff1e6" className="text-[10px] tracking-wide" />
              )}
            </div>

            {selectedDayEvents.length === 0 ? (
              <div className="py-6 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center mx-auto mb-3 border border-slate-100 dark:border-slate-800">
                  <CalendarIcon size={16} className="text-slate-400 dark:text-slate-600" />
                </div>
                <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Empty Schedule
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 px-4">
                  No operations or deadlines booked. Click below to register one.
                </p>
                <div className="mt-4">
                  <Btn variant="orange_ghost" size="sm" onClick={() => {
                    setNewEvent(p => ({ ...p, date: selectedDateStr }));
                    setShowAddModal(true);
                  }}>
                    <Plus size={13} /> Add event on this day
                  </Btn>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                {selectedDayEvents.map(e => {
                  const style = CATEGORY_STYLES[e.category];
                  return (
                    <div
                      key={e.id}
                      className="p-3 bg-slate-50/60 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-800 transition relative overflow-hidden"
                    >
                      {/* Left accent color indicator stripe */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1"
                        style={{ backgroundColor: style.color }}
                      />

                      <div className="pl-1.5">
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded font-mono"
                            style={{ color: style.color, backgroundColor: style.bg }}
                          >
                            {style.label}
                          </span>

                          <button
                            onClick={() => handleDeleteEvent(e.id)}
                            className="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition border-none bg-transparent"
                            title="Remove appointment"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1 leading-snug">
                          {e.title}
                        </h4>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mb-2">
                          {e.description}
                        </p>

                        <div className="flex flex-wrap gap-2.5 items-center text-[9.5px] text-slate-400 dark:text-slate-500 font-mono">
                          <div className="flex items-center gap-1">
                            <MapPin size={11} className="text-slate-400" />
                            <span>Location: {e.district}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={11} className="text-slate-400" />
                            <span>By: {e.createdByName}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={() => {
                    setNewEvent(p => ({ ...p, date: selectedDateStr }));
                    setShowAddModal(true);
                  }}
                  className="w-full py-2 border border-dashed border-slate-200 dark:border-slate-800 hover:border-orange-400 dark:hover:border-orange-800 rounded-xl flex items-center justify-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-orange-600 cursor-pointer bg-transparent transition"
                >
                  <Plus size={12} /> Schedule additional event
                </button>
              </div>
            )}
          </Card>

          {/* COLOR LEGEND CARD WITH FAINT GRAY INTERNALS */}
          <Card className="p-3 border border-slate-100 dark:border-slate-800/80">
            <h4 className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2.5">
              Category Schemes
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 dark:text-slate-400">
              {Object.entries(CATEGORY_STYLES).map(([key, item]) => (
                <div key={key} className="flex items-center gap-2 font-medium">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>

      {/* MODAL POPUP FOR SCHEDULING NEW EVENT */}
      {showAddModal && (
        <Modal
          title="Schedule Operations Event"
          onClose={() => setShowAddModal(false)}
          width={480}
        >
          <div className="space-y-4">
            <FInput
              label="Event Title"
              placeholder="e.g., Zomba Central Teacher Quality Assessment"
              value={newEvent.title}
              onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))}
            />

            <FArea
              label="Event Description"
              placeholder="Detail guidelines, materials needed, objective targets, and expected attendance."
              value={newEvent.description}
              onChange={e => setNewEvent(p => ({ ...p, description: e.target.value }))}
              rows={3}
            />

            <div className="grid grid-cols-2 gap-3">
              <FInput
                label="Target Date"
                type="date"
                value={newEvent.date}
                onChange={e => setNewEvent(p => ({ ...p, date: e.target.value }))}
              />

              <FSelect
                label="Region District Scope"
                value={newEvent.district}
                onChange={e => setNewEvent(p => ({ ...p, district: e.target.value }))}
              >
                <option value="National">National (All Areas)</option>
                {DISTRICT_LIST.map(d => (
                  <option key={d} value={d}>{d} Area</option>
                ))}
              </FSelect>
            </div>

            <FSelect
              label="Engagement Category"
              value={newEvent.category}
              onChange={e => setNewEvent(p => ({ ...p, category: e.target.value as any }))}
            >
              <option value="training">Training Session & Coaching</option>
              <option value="visit">School Visit & Assessment</option>
              <option value="audit">District Audit & File Assembly</option>
              <option value="deadline">Reporting Submission Deadline</option>
            </FSelect>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Btn variant="secondary" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Btn>
              <Btn variant="success" size="sm" onClick={handleAddEvent}>
                Confirm Appointment
              </Btn>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
