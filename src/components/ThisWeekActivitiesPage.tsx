import React, { useState, useEffect } from 'react';
import { annualActivitiesApi } from '../api';
import { User } from '../types';
import { Card, PageHeader, Btn, Badge, Modal, FArea } from './SubComponents';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

interface ThisWeekActivitiesPageProps {
  user: User | null;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const ThisWeekActivitiesPage: React.FC<ThisWeekActivitiesPageProps> = ({ user, showToast }) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [marking, setMarking] = useState<{ id: number; status: 'done' | 'not_done' } | null>(null);
  const [comment, setComment] = useState('');

  const load = () => annualActivitiesApi.getThisWeek().then((res: any) => setActivities(Array.isArray(res) ? res : [])).catch(() => {});
  useEffect(() => { load(); }, [user]);

  const openMark = (id: number, status: 'done' | 'not_done') => {
    setComment('');
    setMarking({ id, status });
  };

  const submitMark = async () => {
    if (!marking) return;
    if (marking.status === 'not_done' && !comment.trim()) {
      showToast('Please explain why this activity was not completed', 'warning');
      return;
    }
    try {
      await annualActivitiesApi.markComplete(marking.id, marking.status, comment);
      showToast(marking.status === 'done' ? 'Marked as done' : 'Marked as not done', 'success');
      setMarking(null);
      load();
    } catch { showToast('Failed to update activity', 'error'); }
  };

  const statusBadge = (s: string) => {
    if (s === 'done') return <Badge text="Done" color="#065f46" bg="#dcfce7" />;
    if (s === 'not_done') return <Badge text="Not Done" color="#991b1b" bg="#fee2e2" />;
    return <Badge text="Pending" color="#92400e" bg="#fef3c7" />;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <PageHeader title="This Week's Activities" subtitle="Activities planned for your district this week — mark each one as done or not done" />

      {activities.length === 0 ? (
        <Card className="p-8 text-center text-slate-400 text-sm">No activities scheduled for this week.</Card>
      ) : (
        activities.map((a: any) => (
          <Card key={a.id} className="p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{a.quarter} · {a.goal}</div>
                <div className="font-bold text-black dark:text-white text-sm whitespace-pre-line">{a.weekly_activity_description}</div>
              </div>
              {statusBadge(a.completion_status)}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-3">
              {a.target && <div><span className="font-semibold">Target:</span> {a.target}</div>}
              {a.lead_person && <div><span className="font-semibold">Lead:</span> {a.lead_person}</div>}
              {a.holidays && <div><span className="font-semibold">Holiday this week:</span> {a.holidays}</div>}
              {a.risks_issues && <div><span className="font-semibold">Risks/Issues:</span> {a.risks_issues}</div>}
            </div>
            {a.completion_comment && (
              <div className="text-xs italic text-slate-500 bg-slate-50 dark:bg-slate-900/40 p-2 rounded mb-3">
                "{a.completion_comment}"
              </div>
            )}
            <div className="flex gap-2">
              <Btn size="sm" variant="success" onClick={() => openMark(a.id, 'done')}><CheckCircle2 size={13} /> Mark Done</Btn>
              <Btn size="sm" variant="danger" onClick={() => openMark(a.id, 'not_done')}><XCircle size={13} /> Not Done</Btn>
            </div>
          </Card>
        ))
      )}

      {marking && (
        <Modal title={marking.status === 'done' ? 'Mark Activity Done' : 'Mark Activity Not Done'} onClose={() => setMarking(null)} width={480}>
          <div className="space-y-3">
            <FArea
              label={marking.status === 'done' ? 'Comments (optional)' : 'Reason it was not completed *'}
              value={comment}
              onChange={(e: any) => setComment(e.target.value)}
              rows={4}
              placeholder={marking.status === 'done' ? 'Any notes on how it went...' : 'Explain why, and any other relevant details...'}
            />
            <div className="flex justify-end gap-2">
              <Btn size="sm" variant="secondary" onClick={() => setMarking(null)}>Cancel</Btn>
              <Btn size="sm" onClick={submitMark}>Confirm</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
