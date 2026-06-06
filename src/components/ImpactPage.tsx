import React, { useState, useEffect } from 'react';
import { Star, Plus, Heart, Newspaper, ChevronDown, ChevronUp, MapPin, Calendar, Edit2, Trash2 } from 'lucide-react';
import { Card, Kicker, Btn, Modal, FInput, FSelect, FArea, Badge } from './SubComponents';
import { DISTRICT_LIST } from '../data';
import { impactStoriesApi } from '../api';

interface ImpactPageProps {
  reports: any[];
  showToast: (msg: string) => void;
  user: any;
}

const CURRICULUM_COLORS: Record<string, { color: string; pale: string }> = {
  GESD:      { color: '#a82563', pale: '#fce7f3' },
  HIM:       { color: '#185fa5', pale: '#dbeafe' },
  ETT:       { color: '#059669', pale: '#d1fae5' },
  Combined:  { color: '#7c3aed', pale: '#ede9fe' },
  Community: { color: '#e85d04', pale: '#fff1e6' },
};

const EMOJI_MAP: Record<string, string> = {
  GESD: '👧', HIM: '👦', ETT: '👩‍🏫', Combined: '🤝', Community: '📣',
};

const MILESTONES = [
  { year: '2023', event: 'ETT Country wide ScaleUp introduction' },
  { year: '2024', event: 'Scaled Up in 4 more districts' },
  { year: '2025', event: '585,000 Learners trained in 12 districts' },
  { year: '2026', event: 'MOU Signed with Ministry of Education' },
];

const PRESS = [
  { outlet: 'Nation Online Malawi', headline: 'ScaleUp ETT Program recognised as model SGBV intervention', date: 'Mar 2026' },
  { outlet: 'UNICEF Malawi', headline: 'Community-led safety training making strides in schools', date: 'Jan 2026' },
  { outlet: 'Ministry of Education', headline: 'ETT clusters adopted in national school safety framework', date: 'Nov 2025' },
];

export const ImpactPage: React.FC<ImpactPageProps> = ({ reports, showToast, user }) => {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingStory, setEditingStory] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [filterCurr, setFilterCurr] = useState('all');

  const [storyForm, setStoryForm] = useState({
    title: '', content: '', author_name: '', district_id: '',
    image_url: '', is_published: true,
    curriculum: 'GESD',
  });

  const canManage = user && (user.role === 'admin' || user.role === 'sasa_officer');

  useEffect(() => {
    impactStoriesApi.getAll().then(data => {
      if (Array.isArray(data)) setStories(data);
      setLoading(false);
    });
  }, []);

  const openEdit = (story: any) => {
    setEditingStory(story);
    setStoryForm({
      title: story.title,
      content: story.content,
      author_name: story.author_name || '',
      district_id: story.district_id || '',
      image_url: story.image_url || '',
      is_published: story.is_published,
      curriculum: story.curriculum || 'GESD',
    });
    setShowForm(true);
  };

  const submitStory = async () => {
    if (!storyForm.title || !storyForm.content) {
      showToast('⚠️ Title and content are required');
      return;
    }
    try {
      let data;
      if (editingStory) {
        data = await impactStoriesApi.update(editingStory.id, storyForm);
        if (data.error) { showToast(`⚠️ ${data.error}`); return; }
        setStories(prev => prev.map(s => s.id === editingStory.id ? { ...s, ...data } : s));
        showToast('✅ Story updated');
      } else {
        data = await impactStoriesApi.create(storyForm);
        if (data.error) { showToast(`⚠️ ${data.error}`); return; }
        setStories(prev => [data, ...prev]);
        showToast('✅ Story published');
      }
      setSubmitted(true);
    } catch {
      showToast('⚠️ Failed to save story');
    }
  };

  const deleteStory = async () => {
    if (!deleteId) return;
    const data = await impactStoriesApi.delete(deleteId);
    if (data.error) { showToast(`⚠️ ${data.error}`); return; }
    setStories(prev => prev.filter(s => s.id !== deleteId));
    setDeleteId(null);
    showToast('Story deleted');
  };

  const sf = (k: string) => (e: any) => setStoryForm(p => ({ ...p, [k]: e.target.value }));

  const visible = filterCurr === 'all'
    ? stories
    : stories.filter(s => s.curriculum === filterCurr);

  return (
    <div className="space-y-5 max-w-5xl mx-auto animate-fade-in-up">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <Kicker text="Field Outcomes" />
          <h1 className="text-base font-bold text-black dark:text-white m-0">Impact Stories</h1>
          <p className="text-xs text-black dark:text-white opacity-60 mt-1 m-0">
            Real outcomes from active districts and clusters across Malawi.
          </p>
        </div>
        {canManage && (
          <Btn size="sm" onClick={() => { setEditingStory(null); setStoryForm({ title: '', content: '', author_name: '', district_id: '', image_url: '', is_published: true, curriculum: 'GESD' }); setSubmitted(false); setShowForm(true); }}>
            <Plus size={13} /> Add Story
          </Btn>
        )}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ['592,200+', 'Learners Reached'],
          ['1,134', 'TOTs Certified'],
          ['127', 'School Clusters'],
          [stories.length.toString(), 'Impact Stories'],
        ].map(([v, l]) => (
          <Card key={l} className="p-3 text-center">
            <div className="text-base font-bold text-[#e85d04]">{v}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">{l}</div>
          </Card>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg w-fit border border-neutral-200 dark:border-slate-800 flex-wrap">
        {['all', 'GESD', 'HIM', 'Combined', 'ETT', 'Community'].map(c => (
          <button
            key={c}
            onClick={() => setFilterCurr(c)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              filterCurr === c
                ? 'bg-white dark:bg-[#0f1623] text-black dark:text-white shadow-sm border border-neutral-200 dark:border-slate-700'
                : 'text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white'
            }`}
          >
            {c === 'all' ? 'All Stories' : c}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-12 text-sm text-black/40 dark:text-white/40">Loading stories…</div>}

      {!loading && visible.length === 0 && (
        <div className="text-center py-12 text-sm text-black/40 dark:text-white/40">No stories yet.</div>
      )}

      {/* Stories grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map(s => {
          const isExp = expanded === s.id;
          const curr = s.curriculum || 'ETT';
          const colors = CURRICULUM_COLORS[curr] || CURRICULUM_COLORS['ETT'];
          const emoji = EMOJI_MAP[curr] || '🌟';
          return (
            <div
              key={s.id}
              className="bg-white dark:bg-[#0f1623] border border-neutral-200 dark:border-slate-800 rounded-lg flex flex-col overflow-hidden hover:border-[#e85d04] dark:hover:border-[#e85d04] transition-all"
            >
              <div className="h-1 shrink-0" style={{ backgroundColor: colors.color }} />

              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: colors.pale }}>
                    {emoji}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ color: colors.color, backgroundColor: colors.pale }}>
                      {curr}
                    </span>
                    {canManage && (
                      <>
                        <button onClick={() => openEdit(s)} className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-slate-800 text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white">
                          <Edit2 size={11} />
                        </button>
                        <button onClick={() => setDeleteId(s.id)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-black/30 dark:text-white/30 hover:text-red-600">
                          <Trash2 size={11} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <h3 className="text-xs font-bold text-black dark:text-white leading-snug mb-2">{s.title}</h3>

                <div className="border-l-2 pl-3 py-1 mb-3" style={{ borderColor: colors.color }}>
                  <p className="text-xs italic text-black dark:text-white opacity-80 leading-relaxed m-0">
                    "{s.content.length > 120 && !isExp ? s.content.slice(0, 120) + '…' : s.content}"
                  </p>
                </div>

                {s.author_name && (
                  <div className="text-[10px] font-semibold mb-3" style={{ color: colors.color }}>
                    — {s.author_name}
                  </div>
                )}

                <div className="mt-auto pt-3 border-t border-neutral-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <MapPin size={10} />
                    <span className="truncate max-w-[110px]">{s.district_name || 'Malawi'}</span>
                    <Calendar size={10} className="ml-1" />
                    <span>{new Date(s.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
                  </div>
                  <button
                    onClick={() => setExpanded(isExp ? null : s.id)}
                    className="flex items-center gap-1 text-[10px] font-bold transition"
                    style={{ color: colors.color }}
                  >
                    {isExp ? <><ChevronUp size={12} /> Less</> : <><ChevronDown size={12} /> Read more</>}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Milestones + Press */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center">
              <Star size={14} className="text-[#e85d04]" />
            </div>
            <h3 className="text-xs font-bold text-black dark:text-white m-0">ScaleUp Program Milestones</h3>
          </div>
          <div className="relative pl-5 space-y-4">
            <div className="absolute left-1.5 top-1 bottom-1 w-0.5 bg-orange-100 dark:bg-orange-950/40" />
            {MILESTONES.map((m, i) => {
              const isLast = i === MILESTONES.length - 1;
              return (
                <div key={i} className="relative flex items-start gap-3">
                  <div className={`absolute -left-[19px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-[#e85d04] ${isLast ? 'bg-[#e85d04]' : 'bg-white dark:bg-[#0f1623]'}`} />
                  <div className={`flex-1 p-2.5 rounded-lg border text-xs ${isLast ? 'border-orange-200 dark:border-orange-900/40 bg-orange-50/50 dark:bg-orange-950/10' : 'border-neutral-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-[#e85d04] text-[10px]">{m.year}</span>
                      <span className="text-black dark:text-white opacity-70 flex-1">{m.event}</span>
                      {isLast && <span className="text-[8px] font-bold uppercase bg-[#e85d04] text-white px-1.5 py-0.5 rounded shrink-0">Now</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center">
              <Newspaper size={14} className="text-[#e85d04]" />
            </div>
            <h3 className="text-xs font-bold text-black dark:text-white m-0">Recognition & Press</h3>
          </div>
          <div className="space-y-2.5">
            {PRESS.map((p, i) => (
              <div key={i} className="flex gap-3 items-center p-3 rounded-lg border border-neutral-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20">
                <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center shrink-0 text-base">📰</div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-black dark:text-white leading-snug truncate">{p.headline}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-medium">{p.outlet} · {p.date}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Add/Edit Story Modal (admin/sasa_officer only) */}
      {showForm && canManage && (
        <Modal
          title={editingStory ? 'Edit Story' : 'Add Impact Story'}
          onClose={() => { setShowForm(false); setSubmitted(false); setEditingStory(null); }}
        >
          {submitted ? (
            <div className="text-center py-6 space-y-3">
              <span className="text-4xl block">💖</span>
              <h3 className="text-sm font-bold text-black dark:text-white m-0">Story Saved!</h3>
              <Btn onClick={() => { setShowForm(false); setSubmitted(false); setEditingStory(null); }} size="sm">Close</Btn>
            </div>
          ) : (
            <div className="space-y-3">
              <FInput label="Title *" value={storyForm.title} onChange={sf('title')} placeholder="e.g. Breaking the Silence in Mzimba" />
              <FSelect label="Curriculum" value={storyForm.curriculum} onChange={sf('curriculum')}>
                {['GESD', 'HIM', 'ETT', 'Combined', 'Community'].map(c => <option key={c}>{c}</option>)}
              </FSelect>
              <FArea label="Story Content *" value={storyForm.content} onChange={sf('content')} rows={5} placeholder="Share the impact story in detail…" />
              <FInput label="Author Name (or role)" value={storyForm.author_name} onChange={sf('author_name')} placeholder="e.g. Student, GESD Graduate" />
              <FSelect label="District (optional)" value={storyForm.district_id} onChange={sf('district_id')}>
                <option value="">Select district…</option>
                {DISTRICT_LIST.map(d => <option key={d}>{d}</option>)}
              </FSelect>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={storyForm.is_published} onChange={e => setStoryForm(p => ({ ...p, is_published: e.target.checked }))} className="w-4 h-4 rounded text-orange-500" />
                <label className="text-xs text-black dark:text-white">Publish immediately</label>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Btn variant="secondary" size="sm" onClick={() => setShowForm(false)}>Cancel</Btn>
                <Btn size="sm" onClick={submitStory}>{editingStory ? 'Save Changes' : 'Publish Story'}</Btn>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <Modal title="Delete Story" onClose={() => setDeleteId(null)} width={400}>
          <p className="text-sm text-black/70 dark:text-white/70 mb-4">Are you sure you want to delete this story? This cannot be undone.</p>
          <div className="flex gap-2 justify-end">
            <Btn size="sm" variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Btn>
            <Btn size="sm" variant="secondary" onClick={deleteStory}><Trash2 size={13} /> Delete</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};
