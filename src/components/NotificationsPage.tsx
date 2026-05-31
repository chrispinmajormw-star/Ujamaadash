import React, { useState } from 'react';
import { Bell, Inbox, Send, Clock, Check, X, ArrowRight, Filter, Search, FileText, AlertCircle } from 'lucide-react';
import { User, Report } from '../types';
import { Card, Kicker, Btn } from './SubComponents';

interface NotificationsPageProps {
  user: User | null;
  reports: Report[];
  showToast: (msg: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  user,
  reports,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter reports based on user role and tab
  const getFilteredReports = () => {
    let filtered: Report[] = [];

    if (activeTab === 'inbox') {
      // Reports sent to this user for review/approval
      if (user?.role === 'district_coordinator') {
        filtered = reports.filter(r => r.status === 'pending' && r.district === user.district);
      } else if (user?.role === 'admin') {
        filtered = reports.filter(r => r.status === 'pending');
      } else {
        filtered = [];
      }
    } else {
      // Reports submitted by this user
      filtered = reports.filter(r => r.submitted_by === user?.name);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.school.toLowerCase().includes(query) ||
        r.district.toLowerCase().includes(query) ||
        r.session.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
  };

  const filteredReports = getFilteredReports();

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      forwarded: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-bold ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getReportStats = () => {
    const myReports = reports.filter(r => r.submitted_by === user?.name);
    const pendingReview = user?.role === 'district_coordinator' 
      ? reports.filter(r => r.status === 'pending' && r.district === user.district).length
      : user?.role === 'admin'
      ? reports.filter(r => r.status === 'pending').length
      : 0;

    return {
      totalSubmitted: myReports.length,
      approved: myReports.filter(r => r.status === 'approved').length,
      pending: myReports.filter(r => r.status === 'pending').length,
      pendingReview,
    };
  };

  const stats = getReportStats();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <Kicker text="Notifications" />
        <h1 className="text-2xl font-bold text-black dark:text-white">Notification Center</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">View reports you've submitted and reports awaiting your review.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Send size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-black dark:text-white">{stats.totalSubmitted}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Total Submitted</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
              <Check size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-black dark:text-white">{stats.approved}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Approved</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
              <Clock size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-black dark:text-white">{stats.pending}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Pending</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
              <Inbox size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-black dark:text-white">{stats.pendingReview}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Pending Review</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="p-6">
        {/* Tabs */}
        <div className="flex items-center gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'inbox'
                ? 'bg-orange-500 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Inbox size={16} />
            Inbox
            {stats.pendingReview > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{stats.pendingReview}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'sent'
                ? 'bg-orange-500 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Send size={16} />
            Sent
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0f1623] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0f1623] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-bold text-black dark:text-white mb-2">No reports found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {activeTab === 'inbox' ? 'No reports are pending your review.' : 'You haven\'t submitted any reports yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1623] hover:border-orange-200 dark:hover:border-orange-900/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={16} className="text-orange-500" />
                      <h4 className="font-bold text-black dark:text-white">{report.school}</h4>
                      {getStatusBadge(report.status)}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">District:</span>
                        <span className="ml-1 font-medium text-black dark:text-white">{report.district}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Session:</span>
                        <span className="ml-1 font-medium text-black dark:text-white">{report.session}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Boys:</span>
                        <span className="ml-1 font-medium text-black dark:text-white">{report.boys}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Girls:</span>
                        <span className="ml-1 font-medium text-black dark:text-white">{report.girls}</span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Clock size={12} />
                      <span>Submitted: {new Date(report.submitted_at).toLocaleDateString()}</span>
                      <span className="mx-2">•</span>
                      <span>By: {report.submitted_by}</span>
                    </div>
                  </div>
                  <Btn size="sm" variant="secondary">
                    View Details
                    <ArrowRight size={14} className="ml-1" />
                  </Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
