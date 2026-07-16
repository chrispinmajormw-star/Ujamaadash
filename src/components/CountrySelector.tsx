import React, { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useCountry, ALL_COUNTRIES } from '../context/CountryContext';

export const CountrySelector: React.FC = () => {
  const { activeCountry, setActiveCountry, availableCountries, loading } = useCountry();
  const [open, setOpen] = useState(false);

  if (loading) return null;

  const options = [ALL_COUNTRIES, ...availableCountries];
  const label = activeCountry === ALL_COUNTRIES ? 'All Countries' : activeCountry;

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 h-9 sm:h-8 rounded-md border border-neutral-200 dark:border-slate-700 hover:border-[var(--brand-400)] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] text-[11px] font-bold whitespace-nowrap"
        title="Filter by country"
      >
        <Globe size={13} className="text-[var(--brand-500)] shrink-0" />
        <span className="hidden sm:inline">{label}</span>
        <ChevronDown size={12} className="opacity-60 shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-40 rounded-xl border border-neutral-200 dark:border-slate-700 bg-white dark:bg-[#0f1623] shadow-2xl p-1">
            {options.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => { setActiveCountry(opt); setOpen(false); }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition ${
                  activeCountry === opt
                    ? 'bg-[var(--brand)] text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-neutral-100 dark:hover:bg-slate-800'
                }`}
              >
                {opt === ALL_COUNTRIES ? 'All Countries' : opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
