import React from 'react';
import { ShieldOff, ArrowLeft } from 'lucide-react';

interface RestrictedAccessPageProps {
  allowedRoles: string;
  setPage?: (p: string) => void;
}

export const RestrictedAccessPage: React.FC<RestrictedAccessPageProps> = ({ allowedRoles, setPage }) => (
  <div className="flex flex-col items-center justify-center text-center py-20 px-4 max-w-md mx-auto">
    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
      <ShieldOff size={28} className="text-slate-400" />
    </div>
    <h2 className="text-base font-bold text-black dark:text-white m-0 mb-1.5">Restricted Access</h2>
    <p className="text-sm text-slate-500 dark:text-slate-400 m-0 mb-6">
      This page is only available to <span className="font-semibold text-slate-700 dark:text-slate-300">{allowedRoles}</span>.
      If you believe you should have access, contact your System Admin.
    </p>
    {setPage && (
      <button
        onClick={() => setPage('dashboard')}
        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-[var(--brand-600)] hover:bg-[var(--brand-700)] transition-colors"
      >
        <ArrowLeft size={13} /> Back to Dashboard
      </button>
    )}
  </div>
);
