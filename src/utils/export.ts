import { Report } from '../types';

export const exportReportsToCSV = (reports: Report[], filename: string) => {
  const headers = ['School', 'District', 'Zone', 'Curriculum', 'Session', 'Boys', 'Girls', 'Total', 'Status', 'Submitted By', 'Date', 'Sent To'];
  const rows = reports.map(r => [
    r.school, r.district, r.zone, r.curriculum, r.session,
    r.boys, r.girls, r.boys + r.girls,
    r.status, r.submitted_by, r.submitted_at, r.sentToLabel || ''
  ]);
  const csv = [headers, ...rows].map(row =>
    row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
  ).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
};

export const exportAnalyticsToCSV = (data: Record<string, any>, filename: string) => {
  const rows = Object.entries(data).map(([k, v]) => `"${k}","${v}"`);
  const csv = ['Metric,Value', ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
};
