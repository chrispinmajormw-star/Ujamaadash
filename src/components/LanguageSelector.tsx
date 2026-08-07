import React, { useState, useEffect } from 'react';
import { Languages, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../i18n';

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  // Language defaults to English everywhere and only ever changes when the
  // person explicitly picks one below -- no auto-switching based on country.

  const setLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('app_language', code);
    localStorage.setItem('app_language_user_set', 'true');
    setOpen(false);
  };

  const current = SUPPORTED_LANGUAGES.find(l => l.code === i18n.language) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 h-9 sm:h-8 rounded-md border border-neutral-200 dark:border-slate-700 hover:border-[var(--brand-400)] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] text-[11px] font-bold whitespace-nowrap"
        title="Change language"
      >
        <Languages size={13} className="text-[var(--brand-500)] shrink-0" />
        <span>{current.short}</span>
        <ChevronDown size={12} className="opacity-60 shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-40 rounded-xl border border-neutral-200 dark:border-slate-700 bg-white dark:bg-[#0f1623] shadow-2xl p-1">
            {SUPPORTED_LANGUAGES.map(l => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLanguage(l.code)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center justify-between gap-2 ${
                  i18n.language === l.code
                    ? 'bg-[var(--brand)] text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-neutral-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{l.label}</span>
                <span className="opacity-60">{l.short}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
