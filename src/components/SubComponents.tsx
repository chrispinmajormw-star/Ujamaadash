import React from 'react';
import { User, Report } from '../types';

export const OR = "#e85d04";
export const OR_D = "#c44d00";
export const OR_PALE = "#fff1e6";
export const BLACK = "#0f1623";

interface BadgeProps {
  text: string;
  color?: string;
  bg?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ text, color = OR, bg = OR_PALE, className = "" }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold leading-5 tracking-wide whitespace-nowrap ${className}`}
    style={{ color, background: bg }}
  >
    {text}
  </span>
);

export const Pill: React.FC<{ s: string }> = ({ s }) => {
  const m: Record<string, { c: string; bg: string }> = {
    Active: { c: OR_D, bg: OR_PALE },
    Completed: { c: "#065f46", bg: "#dcfce7" },
    Planned: { c: "#4b5563", bg: "#f3f4f6" },
    approved: { c: "#065f46", bg: "#dcfce7" },
    pending: { c: "#92400e", bg: "#fef9c3" },
    rejected: { c: "#991b1b", bg: "#fee2e2" },
    forwarded: { c: "#1e40af", bg: "#dbeafe" }
  };
  const config = m[s] || { c: "#4b5563", bg: "#f3f4f6" };
  return <Badge text={s.charAt(0).toUpperCase() + s.slice(1)} color={config.c} bg={config.bg} />;
};

export const ProgBar: React.FC<{ pct: number; color?: string }> = ({ pct, color = OR }) => (
  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
    <div
      className="h-full rounded-full transition-all duration-500 ease"
      style={{ width: `${Math.max(0, Math.min(pct, 100))}%`, backgroundColor: color }}
    />
  </div>
);

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = "", style, ...props }) => (
  <div
    className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md dark:shadow-black/20 transition-all duration-200 ${className}`}
    style={style}
    {...props}
  >
    {children}
  </div>
);

export const Kicker: React.FC<{ text: string }> = ({ text }) => (
  <div className="text-[11px] font-extrabold tracking-widest uppercase text-orange-600 mb-1">
    {text}
  </div>
);

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'dark' | 'orange_ghost';
  size?: 'sm' | 'md' | 'lg';
  full?: boolean;
}

export const Btn: React.FC<BtnProps> = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  full = false,
  className = "",
  style,
  ...props
}) => {
  const baseStyle = "font-sans font-bold rounded-xl cursor-pointer inline-flex items-center gap-2 transform active:scale-95 transition-all justify-center whitespace-nowrap";
  
  const variants = {
    primary: "bg-orange-600 hover:bg-orange-700 text-white shadow-sm hover:shadow-orange-600/20 shadow-orange-600/10 border-none",
    secondary: "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm border-none",
    ghost: "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800",
    orange_ghost: "bg-orange-50 dark:bg-orange-950/20 hover:bg-orange-100/50 dark:hover:bg-orange-950/45 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/40",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm border-none",
    dark: "bg-slate-900 dark:bg-slate-950 hover:bg-black dark:hover:bg-black text-white shadow-sm border-none"
  };

  const sizes = {
    sm: "px-3 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-3 text-base"
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${full ? 'w-full' : ''} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
};

interface FInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const FInput: React.FC<FInputProps> = ({ label, value, onChange, className = "", ...props }) => (
  <div className="mb-3 text-left">
    {label && <label className="block text-xs font-semibold mb-1.5 text-slate-600 dark:text-slate-400">{label}</label>}
    <input
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500 ${className}`}
      {...props}
    />
  </div>
);

interface FSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const FSelect: React.FC<FSelectProps> = ({ label, value, onChange, children, className = "", ...p }) => (
  <div className="mb-3 text-left">
    {label && <label className="block text-xs font-semibold mb-1.5 text-slate-600 dark:text-slate-400">{label}</label>}
    <select
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none transition-all cursor-pointer ${className}`}
      {...p}
    >
      {children}
    </select>
  </div>
);

interface FAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const FArea: React.FC<FAreaProps> = ({ label, value, onChange, className = "", ...p }) => (
  <div className="mb-3 text-left">
    {label && <label className="block text-xs font-semibold mb-1.5 text-slate-600 dark:text-slate-300">{label}</label>}
    <textarea
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none resize-y min-height-[80px] transition-all placeholder-slate-400 dark:placeholder-slate-500 ${className}`}
      {...p}
    />
  </div>
);

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  width?: number;
}

export const Modal: React.FC<ModalProps> = ({ title, children, onClose, width = 520 }) => {
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 w-full h-full bg-slate-950/70 z-[99000] flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300"
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 position-relative animate-fade-in-up"
        style={{ maxWidth: `${width}px` }}
      >
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm z-10">
          <h3 className="m-0 text-base font-bold text-slate-900 dark:text-slate-50">{title}</h3>
          <button
            onClick={onClose}
            className="bg-slate-100 dark:bg-slate-800 border-none w-8 h-8 rounded-lg text-sm cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

export const Toast: React.FC<{ msg: string; onClose: () => void }> = ({ msg, onClose }) => (
  <div className="fixed bottom-5 right-5 bg-slate-900 dark:bg-slate-950 text-white px-4 py-3 rounded-xl text-sm font-semibold z-[99999] shadow-xl border-l-[4px] border-orange-500 flex items-center gap-3 animate-slide-up">
    <span>{msg}</span>
    <span onClick={onClose} className="cursor-pointer opacity-50 hover:opacity-105 text-base p-1">✕</span>
  </div>
);

interface StatCardProps {
  icon: string | React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
  sub?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color = OR, sub }) => (
  <Card className="p-4 flex flex-col justify-between">
    <div>
      <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center mb-3 text-lg">
        {icon}
      </div>
      <div className="text-2xl font-black leading-tight tracking-tight text-slate-950 dark:text-slate-50" style={{ color: color }}>
        {value}
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">{label}</div>
    </div>
    {sub && <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">{sub}</div>}
  </Card>
);

export const TH: React.FC<{ cols: string[] }> = ({ cols }) => (
  <thead>
    <tr className="bg-slate-50 dark:bg-slate-900">
      {cols.map(c => (
        <th
          key={c}
          className="px-4 py-2.5 text-left text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 whitespace-nowrap"
        >
          {c}
        </th>
      ))}
    </tr>
  </thead>
);

interface FilterBarProps {
  options: { v: string; l: string }[];
  active: string;
  onChange: (val: string) => void;
  search?: string;
  onSearch?: (val: string) => void;
  searchPlaceholder?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  options,
  active,
  onChange,
  search,
  onSearch,
  searchPlaceholder = "Search..."
}) => (
  <div className="flex flex-wrap items-center gap-2 mb-4">
    {options.map(o => (
      <button
        key={o.v}
        onClick={() => onChange(o.v)}
        className={`px-3.5 py-1.5 rounded-full border text-xs font-bold cursor-pointer transition-all ${
          active === o.v
            ? "border-orange-500 bg-orange-500 text-white"
            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
        }`}
      >
        {o.l}
      </button>
    ))}
    {onSearch !== undefined && (
      <input
        placeholder={searchPlaceholder}
        value={search || ""}
        onChange={e => onSearch(e.target.value)}
        className="ml-auto px-3.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-50 text-xs rounded-full outline-none focus:border-orange-500 w-full sm:w-48 transition-all"
      />
    )}
  </div>
);

export const AfricaLogo: React.FC<{ size?: number; variant?: 'orange' | 'black' | 'flat' | 'full'; className?: string }> = ({
  size = 34,
  variant = "orange",
  className = ""
}) => {
  const fillColor = variant === "black" ? BLACK : OR;

  if (variant === "full") {
    return (
      <div className={`flex items-center gap-3.5 select-none ${className}`}>
        {/* Left side: text column, matching UJAMAA (line 1) & AFRICA (line 2) */}
        <div className="flex flex-col items-start leading-[0.8] font-sans shrink-0">
          <span className="text-[#e85d04] font-[900] tracking-wider text-base sm:text-lg">
            UJAMAA
          </span>
          <span className="text-[#e85d04] font-extrabold tracking-[0.22em] text-[11px] sm:text-[12px]">
            AFRICA
          </span>
        </div>
        
        {/* Right side: Africa silhouette icon SVG */}
        <svg
          width={size}
          height={Math.round(size * 1.1)}
          viewBox="0 0 100 110"
          className="shrink-0"
          fill="#e85d04"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stylized continent of Africa silhouette */}
          <path d="M 42 12 Q 52 8 68 12 Q 78 15 76 25 Q 86 28 84 38 Q 82 48 74 54 Q 68 62 60 72 T 50 94 Q 48 94 48 88 T 44 70 Q 44 64 42 58 Q 38 52 30 50 Q 18 48 16 38 Q 14 28 22 24 Q 30 20 38 18 Z" />
          {/* Madagascar */}
          <path d="M 76 68 Q 78 65 79 70 Q 80 75 76 80 Q 73 82 74 74 Z" />
        </svg>
      </div>
    );
  }

  return (
    <svg
      width={size}
      height={Math.round(size * 1.1)}
      viewBox="0 0 100 110"
      className={`shrink-0 transition-transform ${className}`}
      fill={fillColor}
      xmlns="http://www.w3.org/2000/svg"
      style={variant === "flat" ? {} : { filter: `drop-shadow(0 2px 4px ${fillColor}20)` }}
    >
      {/* Stylized continent of Africa silhouette */}
      <path d="M 42 12 Q 52 8 68 12 Q 78 15 76 25 Q 86 28 84 38 Q 82 48 74 54 Q 68 62 60 72 T 50 94 Q 48 94 48 88 T 44 70 Q 44 64 42 58 Q 38 52 30 50 Q 18 48 16 38 Q 14 28 22 24 Q 30 20 38 18 Z" />
      {/* Madagascar */}
      <path d="M 76 68 Q 78 65 79 70 Q 80 75 76 80 Q 73 82 74 74 Z" />
    </svg>
  );
};
