/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AuditLog {
  id: number;
  action: 'approved' | 'rejected' | 'forwarded' | 'edited' | 'created' | 'deleted';
  entityType: 'report' | 'user';
  entityId: number;
  entityName: string;
  performedBy: string;
  performedByRole: string;
  timestamp: string;
  details?: string;
}

const AUDIT_LOGS_KEY = 'ett_audit_logs';

export const getAuditLogs = (): AuditLog[] => {
  const saved = localStorage.getItem(AUDIT_LOGS_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const addAuditLog = (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
  const logs = getAuditLogs();
  const newLog: AuditLog = {
    ...log,
    id: Date.now(),
    timestamp: new Date().toISOString()
  };
  logs.unshift(newLog); // Add to beginning
  
  // Keep only last 1000 logs
  if (logs.length > 1000) {
    logs.pop();
  }
  
  localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(logs));
  return newLog;
};

export const getAuditLogsForEntity = (entityId: number): AuditLog[] => {
  return getAuditLogs().filter(log => log.entityId === entityId);
};

export const getAuditLogsByAction = (action: AuditLog['action']): AuditLog[] => {
  return getAuditLogs().filter(log => log.action === action);
};

export const getAuditLogsByUser = (userName: string): AuditLog[] => {
  return getAuditLogs().filter(log => log.performedBy === userName);
};

export const exportAuditLogsToCSV = () => {
  const logs = getAuditLogs();
  const headers = ['id', 'action', 'entityType', 'entityId', 'entityName', 'performedBy', 'performedByRole', 'timestamp', 'details'];
  
  const csvContent = [
    '\uFEFF' + headers.join(','),
    ...logs.map(log => 
      headers.map(header => {
        const value = (log as any)[header];
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
  link.setAttribute('download', `ett-audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};
