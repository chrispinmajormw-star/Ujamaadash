/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Report } from '../types';

export const exportToCSV = (data: any[], filename: string, headers: string[]) => {
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle null/undefined, escape quotes, and wrap in quotes if contains comma
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

export const exportReportsToCSV = (reports: Report[], filename: string = 'ett-reports') => {
  const headers = [
    'id',
    'school',
    'district',
    'zone',
    'boys',
    'girls',
    'curriculum',
    'session',
    'status',
    'submitted_by',
    'submitted_at',
    'challenges',
    'success'
  ];

  const exportData = reports.map(report => ({
    ...report,
    total_students: report.boys + report.girls
  }));

  exportToCSV(exportData, filename, headers);
};

export const exportToExcel = async (data: any[], filename: string, sheetName: string) => {
  // For Excel export, we'll use a simple approach that creates a CSV with BOM for Excel compatibility
  const headers = Object.keys(data[0] || {});
  
  const csvContent = [
    '\uFEFF' + headers.join(','), // Add BOM for Excel UTF-8 compatibility
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

export const exportAnalyticsToCSV = (analytics: any, filename: string = 'ett-analytics') => {
  const data = [
    { metric: 'Total Reports', value: analytics.totalReports },
    { metric: 'Boys Trained', value: analytics.boysTrained },
    { metric: 'Girls Trained', value: analytics.girlsTrained },
    { metric: 'Total Learners', value: analytics.totalLearners },
    { metric: 'Approved Reports', value: analytics.approved },
    { metric: 'Pending Reports', value: analytics.pending },
    { metric: 'Rejected Reports', value: analytics.rejected },
    { metric: 'Forwarded Reports', value: analytics.forwarded }
  ];

  exportToCSV(data, filename, ['metric', 'value']);
};
