import React from 'react';
import { X } from 'lucide-react';
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
  <div className="h-1.5 w-full bg-neutral-200 dark:bg-slate-800 rounded-full overflow-hidden">
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
    className={`bg-white dark:bg-[#0f1623] border border-neutral-200 dark:border-slate-800 rounded-lg p-4 text-black dark:text-white ${className}`}
    style={style}
    {...props}
  >
    {children}
  </div>
);

export const Kicker: React.FC<{ text: string }> = ({ text }) => (
  <div className="text-[10px] font-semibold tracking-wide uppercase text-black dark:text-white mb-0.5 opacity-70">
    {text}
  </div>
);

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => (
  <div className="flex flex-wrap items-start justify-between gap-3 mb-4 pb-3 border-b border-neutral-200 dark:border-slate-800">
    <div>
      <h1 className="text-base font-bold text-black dark:text-white m-0">{title}</h1>
      {subtitle && <p className="text-xs text-black dark:text-white mt-0.5 m-0 opacity-80">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
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
  const baseStyle = "font-sans font-bold rounded-xl cursor-pointer inline-flex items-center gap-2 transform active:scale-95 transition-all justify-center whitespace-nowrap min-h-[44px] sm:min-h-auto focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500";
  
  const variants = {
    primary: "bg-orange-600 hover:bg-orange-700 text-white shadow-sm border-none",
    secondary: "bg-white dark:bg-[#0f1623] text-black dark:text-white border border-neutral-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-600",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm border-none",
    ghost: "bg-white hover:bg-orange-50 dark:bg-[#0f1623] dark:hover:bg-slate-800 text-black dark:text-white border border-neutral-200 dark:border-slate-800",
    orange_ghost: "bg-white dark:bg-orange-950/20 hover:bg-orange-50 dark:hover:bg-orange-950/45 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/40",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm border-none",
    dark: "bg-[#0f1623] hover:bg-black text-white shadow-sm border-none"
  };

  const sizes = {
    sm: "px-3 py-1 sm:py-1.5 text-xs",
    md: "px-4 py-2 sm:py-2.5 text-sm",
    lg: "px-5 py-3 sm:py-3.5 text-base"
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-disabled={disabled}
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
    {label && <label className="block text-xs font-semibold mb-1.5 text-black dark:text-white">{label}</label>}
    <input
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2.5 sm:py-2 h-10 sm:h-9 bg-white dark:bg-[#0f1623] text-black dark:text-white border border-neutral-200 dark:border-slate-800 rounded-lg text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 outline-none transition-all placeholder:text-black/40 dark:placeholder:text-white/40 ${className}`}
      {...props}
    />
  </div>
);

interface FSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const FSelect: React.FC<FSelectProps> = ({ label, value, onChange, children, className = "", ...p }) => (
  <div className="mb-3 text-left">
    {label && <label className="block text-xs font-semibold mb-1.5 text-black dark:text-white">{label}</label>}
    <select
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2.5 sm:py-2 h-10 sm:h-9 bg-white dark:bg-[#0f1623] text-black dark:text-white border border-neutral-200 dark:border-slate-800 rounded-lg text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 outline-none transition-all cursor-pointer ${className}`}
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
    {label && <label className="block text-xs font-semibold mb-1.5 text-black dark:text-white">{label}</label>}
    <textarea
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2.5 bg-white dark:bg-[#0f1623] text-black dark:text-white border border-neutral-200 dark:border-slate-800 rounded-lg text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 outline-none resize-y min-h-[100px] transition-all placeholder:text-black/40 dark:placeholder:text-white/40 ${className}`}
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
        className="bg-white dark:bg-[#0f1623] rounded-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-200 dark:border-slate-800 position-relative animate-fade-in-up"
        style={{ maxWidth: `${width}px` }}
      >
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-[#0f1623] z-10">
          <h3 className="m-0 text-base font-bold text-black dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="bg-white dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 w-8 h-8 rounded-lg text-sm cursor-pointer hover:border-orange-400 text-black dark:text-white flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

export const Toast: React.FC<{ msg: string; onClose: () => void }> = ({ msg, onClose }) => {
  // Detect leading emoji to set accent colour; strip it from display text
  const emojiMap: Record<string, string> = {
    "✅": "#16a34a", "🎉": "#16a34a", "👋": "#16a34a", "💾": "#16a34a", "📋": "#16a34a",
    "⚠️": "#d97706", "🔔": "#d97706",
    "ℹ️": "#2563eb", "📊": "#2563eb", "🗑️": "#2563eb",
    "❌": "#dc2626", "🚫": "#dc2626",
  };
  const firstEmoji = msg.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u)?.[0] ?? "";
  const accentColor = emojiMap[firstEmoji] ?? "#e85d04";
  const cleanMsg = firstEmoji ? msg.replace(firstEmoji, "").trimStart() : msg;
  return (
    <div
      className="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-5 sm:max-w-xs bg-white dark:bg-[#1a2235] text-black dark:text-white px-4 py-3 sm:px-4 sm:py-3 rounded-xl text-sm z-[99999] shadow-2xl flex items-center gap-3 animate-slide-up border border-neutral-100 dark:border-slate-800 min-h-[48px] sm:min-h-auto"
      style={{ borderLeft: `4px solid ${accentColor}` }}
      role="alert"
      aria-live="polite"
    >
      <div
        className="flex-shrink-0 w-2 h-2 rounded-full"
        style={{ backgroundColor: accentColor }}
      />
      <span className="flex-1 font-medium leading-snug text-sm sm:text-sm">{cleanMsg}</span>
      <button
        onClick={onClose}
        className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-slate-700 transition-colors text-xs font-bold ml-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
};

interface StatCardProps {
  icon: string | React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
  sub?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color = OR, sub }) => (
  <div
    className="p-4 flex flex-col justify-between rounded-lg"
    style={{
      background: "linear-gradient(135deg, #e85d04 0%, #c44d00 100%)",
      boxShadow: "0 4px 18px rgba(232,93,4,0.28)",
    }}
  >
    <div>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 text-lg" style={{ background: "rgba(255,255,255,0.18)" }}>
        {icon}
      </div>
      <div className="text-2xl font-black leading-tight tracking-tight text-white">
        {value}
      </div>
      <div className="text-xs text-white mt-1 font-semibold opacity-85">{label}</div>
    </div>
    {sub && <div className="text-[10px] text-white mt-2 opacity-70">{sub}</div>}
  </div>
);

export const TH: React.FC<{ cols: string[] }> = ({ cols }) => (
  <thead>
    <tr className="bg-white dark:bg-[#0f1623]">
      {cols.map(c => (
        <th
          key={c}
          className="px-4 py-2.5 text-left text-[10px] font-extrabold text-black dark:text-white uppercase tracking-wider border-b border-neutral-200 dark:border-slate-800 whitespace-nowrap opacity-70"
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
            : "border-neutral-200 dark:border-slate-800 bg-white dark:bg-[#0f1623] text-black dark:text-white hover:border-orange-400 dark:hover:border-orange-600"
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
        className="ml-auto px-3.5 py-1.5 bg-white dark:bg-[#0f1623] border border-neutral-200 dark:border-slate-800 text-black dark:text-white text-xs rounded-full outline-none focus:border-orange-500 w-full sm:w-48 transition-all"
      />
    )}
  </div>
);

export const AfricaLogo: React.FC<{ size?: number; variant?: 'orange' | 'black' | 'flat' | 'full'; className?: string }> = ({
  size = 34,
  variant = "orange",
  className = ""
}) => {
  const base = import.meta.env.BASE_URL || '/';
  const logoSrc = `${base}africalogo.svg`;

  const LogoBox = ({ s, className: cls = "" }: { s: number; className?: string }) => (
    <div
      className="shrink-0 flex items-center justify-center rounded-lg"
      style={{ width: s, height: s, backgroundColor: '#e85d04', padding: Math.round(s * 0.1) }}
    >
      <img
        src={logoSrc}
        alt="Ujamaa Africa Logo"
        style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
      />
    </div>
  );

  if (variant === "full") {
    return (
      <div className={`flex items-center gap-2 select-none ${className}`}>
        <LogoBox s={size} />
      </div>
    );
  }

  return <LogoBox s={size} className={className} />;
};

// ─── TREND INDICATOR ─────────────────────────
export const TrendIndicator: React.FC<{ value: number; suffix?: string; className?: string }> = ({
  value,
  suffix = '%',
  className = ''
}) => {
  const isPositive = value >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${isPositive ? 'text-emerald-600' : 'text-red-500'} ${className}`}>
      <span>{isPositive ? '▲' : '▼'}</span>
      <span>{Math.abs(value)}{suffix}</span>
    </span>
  );
};

// ─── CONFIRM DIALOG ──────────────────────────
interface ConfirmDialogProps {
  isOpen?: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmText?: string;  // alias for confirmLabel
  cancelText?: string;   // alias for cancelLabel
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen = true,
  title,
  message,
  confirmLabel,
  cancelLabel,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  variant = 'danger'
}) => {
  // Support both confirmLabel/cancelLabel and confirmText/cancelText
  const confirmBtn = confirmLabel || confirmText || 'Confirm';
  const cancelBtn = cancelLabel || cancelText || 'Cancel';

  if (!isOpen) return null;

  const colors = {
    danger: { btn: 'bg-red-600 hover:bg-red-700', icon: '⚠️' },
    warning: { btn: 'bg-amber-500 hover:bg-amber-600', icon: '⚡' },
    info: { btn: 'bg-blue-600 hover:bg-blue-700', icon: 'ℹ️' }
  };
  const c = colors[variant];
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white dark:bg-[#0f1623] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 max-w-sm w-full z-10">
        <div className="text-2xl mb-3">{c.icon}</div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {cancelBtn}
          </button>
          <button
            onClick={onConfirm}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg text-white ${c.btn}`}
          >
            {confirmBtn}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── BREADCRUMBS ─────────────────────────────
interface BreadcrumbsProps {
  items: { label: string; onClick?: () => void }[];
}
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => (
  <nav className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mb-3">
    {items.map((item, i) => (
      <React.Fragment key={i}>
        {i > 0 && <span>/</span>}
        {item.onClick ? (
          <button onClick={item.onClick} className="hover:text-orange-500 font-medium transition">
            {item.label}
          </button>
        ) : (
          <span className="text-slate-600 dark:text-slate-300 font-semibold">{item.label}</span>
        )}
      </React.Fragment>
    ))}
  </nav>
);

// ─── TOUR ────────────────────────────────────
interface TourStep { target: string; title: string; content: string; }
interface TourProps { steps: TourStep[]; isOpen: boolean; onClose: () => void; onComplete: () => void; }
export const Tour: React.FC<TourProps> = ({ steps, isOpen, onClose, onComplete }) => {
  const [step, setStep] = React.useState(0);
  if (!isOpen) return null;
  const current = steps[step];
  const isLast = step === steps.length - 1;
  return (
    <div className="fixed bottom-6 right-6 z-[99999] bg-white dark:bg-[#0f1623] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-5 max-w-xs w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500">Tour {step + 1}/{steps.length}</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={14} /></button>
      </div>
      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{current.title}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">{current.content}</p>
      <div className="flex gap-2 justify-end">
        {step > 0 && <button onClick={() => setStep(s => s - 1)} className="px-3 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">Back</button>}
        <button
          onClick={() => isLast ? onComplete() : setStep(s => s + 1)}
          className="px-3 py-1 text-xs font-semibold rounded-lg bg-orange-500 hover:bg-orange-600 text-white"
        >
          {isLast ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
};
