import React, { useState } from 'react';
import { User, Report, Comment, Document, Task } from '../types';

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
  title: string;
  subtitle?: string;
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
  const baseStyle = "font-sans font-bold rounded-xl cursor-pointer inline-flex items-center gap-2 transform active:scale-95 transition-all justify-center whitespace-nowrap";
  
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
    {label && <label className="block text-xs font-semibold mb-1.5 text-black dark:text-white">{label}</label>}
    <input
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 bg-white dark:bg-[#0f1623] text-black dark:text-white border border-neutral-200 dark:border-slate-800 rounded-lg text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none transition-all placeholder:text-black/40 dark:placeholder:text-white/40 ${className}`}
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
      className={`w-full px-3 py-2.5 bg-white dark:bg-[#0f1623] text-black dark:text-white border border-neutral-200 dark:border-slate-800 rounded-lg text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none transition-all cursor-pointer ${className}`}
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
      className={`w-full px-3 py-2 bg-white dark:bg-[#0f1623] text-black dark:text-white border border-neutral-200 dark:border-slate-800 rounded-lg text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none resize-y min-height-[80px] transition-all placeholder:text-black/40 dark:placeholder:text-white/40 ${className}`}
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
      <div className="text-2xl font-black leading-tight tracking-tight text-black dark:text-white" style={{ color: color }}>
        {value}
      </div>
      <div className="text-xs text-black dark:text-white mt-1 font-semibold opacity-80">{label}</div>
    </div>
    {sub && <div className="text-[10px] text-black dark:text-white mt-2 opacity-60">{sub}</div>}
  </Card>
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

// Skeleton loaders for loading states
export const Skeleton: React.FC<{ className?: string; width?: string; height?: string }> = ({ 
  className = "", 
  width = "100%", 
  height = "1rem" 
}) => (
  <div 
    className={`animate-pulse bg-neutral-200 dark:bg-slate-700 rounded ${className}`} 
    style={{ width, height }}
  />
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`bg-white dark:bg-[#0f1623] border border-neutral-200 dark:border-slate-800 rounded-lg p-4 ${className}`}>
    <Skeleton width="60%" height="1.5rem" className="mb-3" />
    <Skeleton width="100%" height="1rem" className="mb-2" />
    <Skeleton width="80%" height="1rem" className="mb-2" />
    <Skeleton width="40%" height="1rem" />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-2">
    <div className="flex gap-2 p-3 bg-neutral-50 dark:bg-slate-800/50 rounded">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} width={`${100 / cols}%`} height="1rem" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-2 p-3 border-b border-neutral-100 dark:border-slate-800">
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} width={`${100 / cols}%`} height="1rem" />
        ))}
      </div>
    ))}
  </div>
);

export const LoadingSpinner: React.FC<{ size?: number; className?: string }> = ({ 
  size = 24, 
  className = "" 
}) => (
  <div 
    className={`border-2 border-neutral-200 dark:border-slate-700 border-t-orange-500 rounded-full animate-spin ${className}`}
    style={{ width: size, height: size }}
  />
);

export const LoadingOverlay: React.FC<{ message?: string }> = ({ message = "Loading..." }) => (
  <div className="fixed inset-0 bg-white/80 dark:bg-[#0f1623]/80 backdrop-blur-sm z-[99999] flex items-center justify-center">
    <div className="text-center space-y-4">
      <LoadingSpinner size={48} className="mx-auto" />
      <p className="text-sm font-semibold text-black dark:text-white">{message}</p>
    </div>
  </div>
);

// Confirmation dialog for destructive actions
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: '⚠️',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      borderColor: 'border-red-200 dark:border-red-900/40',
      btnColor: 'bg-red-600 hover:bg-red-700'
    },
    warning: {
      icon: '⚡',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20',
      borderColor: 'border-amber-200 dark:border-amber-900/40',
      btnColor: 'bg-amber-600 hover:bg-amber-700'
    },
    info: {
      icon: 'ℹ️',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      borderColor: 'border-blue-200 dark:border-blue-900/40',
      btnColor: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  const style = variantStyles[variant];

  return (
    <div className="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center p-4">
      <div className={`bg-white dark:bg-[#0f1623] rounded-lg w-full max-w-md shadow-2xl border ${style.borderColor}`}>
        <div className="p-6">
          <div className="flex items-start gap-4">
            <span className="text-3xl">{style.icon}</span>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-black dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-black dark:text-white opacity-80 leading-relaxed">{message}</p>
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <Btn variant="secondary" onClick={onCancel}>{cancelText}</Btn>
          <Btn className={style.btnColor} onClick={onConfirm}>{confirmText}</Btn>
        </div>
      </div>
    </div>
  );
};

// Success celebration animation
interface SuccessCelebrationProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

export const SuccessCelebration: React.FC<SuccessCelebrationProps> = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0f1623] rounded-lg w-full max-w-sm shadow-2xl border border-emerald-200 dark:border-emerald-900/40 text-center p-8">
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">Success!</h3>
        <p className="text-sm text-black dark:text-white opacity-80 mb-6">{message}</p>
        <Btn onClick={onClose} className="bg-emerald-600 hover:bg-emerald-700">Continue</Btn>
      </div>
    </div>
  );
};

// Breadcrumb navigation component
interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  currentPage: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, currentPage }) => {
  return (
    <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="text-slate-300 dark:text-slate-600">/</span>}
          {item.path ? (
            <button
              onClick={() => {
                // Navigate to path - this would need to be passed from parent
                window.history.back();
              }}
              className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="font-medium text-black dark:text-white">{item.label}</span>
          )}
        </React.Fragment>
      ))}
      <span className="text-slate-300 dark:text-slate-600">/</span>
      <span className="font-semibold text-orange-600 dark:text-orange-400">{currentPage}</span>
    </nav>
  );
};

// Trend indicator component for KPI changes
interface TrendIndicatorProps {
  value: number;
  previousValue: number;
  showPercentage?: boolean;
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({ value, previousValue, showPercentage = true }) => {
  if (previousValue === 0) return null;
  
  const change = value - previousValue;
  const percentage = previousValue > 0 ? ((change / previousValue) * 100).toFixed(1) : '0';
  const isPositive = change >= 0;
  
  return (
    <div className={`flex items-center gap-1 text-[10px] font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
      {isPositive ? (
        <span className="inline-flex items-center">↑</span>
      ) : (
        <span className="inline-flex items-center">↓</span>
      )}
      {showPercentage && <span>{Math.abs(parseFloat(percentage))}%</span>}
    </div>
  );
};

// Tour/Help System Components
interface TourStep {
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface TourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const Tour: React.FC<TourProps> = ({ steps, isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-[#0f1623] rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-black dark:text-white">{step.title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 text-2xl font-bold">
            ×
          </button>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{step.content}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Step {currentStep + 1} of {steps.length}
          </span>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Btn variant="secondary" size="sm" onClick={() => setCurrentStep(currentStep - 1)}>
                Previous
              </Btn>
            )}
            {currentStep < steps.length - 1 ? (
              <Btn size="sm" onClick={() => setCurrentStep(currentStep + 1)}>
                Next
              </Btn>
            ) : (
              <Btn size="sm" onClick={onComplete}>
                Complete
              </Btn>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Comment Thread Component
interface CommentThreadProps {
  comments: Comment[];
  onAddComment: (content: string) => void;
  currentUser: string;
}

export const CommentThread: React.FC<CommentThreadProps> = ({ comments, onAddComment, currentUser }) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  return (
    <div className="space-y-3">
      <div className="max-h-60 overflow-y-auto space-y-2">
        {comments.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No comments yet</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-black dark:text-white">{comment.author}</span>
                <span className="text-[10px] text-slate-500">
                  {new Date(comment.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300">{comment.content}</p>
            </div>
          ))
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-[#0f1623] text-black dark:text-white"
        />
        <Btn size="sm" type="submit" disabled={!newComment.trim()}>
          Post
        </Btn>
      </form>
    </div>
  );
};

// Document Library Component
interface DocumentLibraryProps {
  documents: Document[];
  onUpload?: (file: File) => void;
  onDelete?: (id: number) => void;
  currentUser: string;
}

export const DocumentLibrary: React.FC<DocumentLibraryProps> = ({ documents, onUpload, onDelete, currentUser }) => {
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredDocs = documents.filter(doc => {
    const matchesFilter = filter === 'all' || doc.type === filter;
    const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase()) ||
                         doc.category.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const typeColors = {
    curriculum: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
    guide: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300',
    template: 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300',
    report: 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300'
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search documents..."
          className="flex-1 px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-[#0f1623] text-black dark:text-white"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-[#0f1623] text-black dark:text-white"
        >
          <option value="all">All Types</option>
          <option value="curriculum">Curriculum</option>
          <option value="guide">Guide</option>
          <option value="template">Template</option>
          <option value="report">Report</option>
        </select>
        {onUpload && (
          <label className="px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-[#0f1623] text-black dark:text-white">
            <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
            Upload
          </label>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="bg-white dark:bg-[#0f1623] border border-gray-200 dark:border-slate-800 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${typeColors[doc.type]}`}>
                {doc.type}
              </span>
              {onDelete && (
                <button
                  onClick={() => onDelete(doc.id)}
                  className="text-slate-400 hover:text-red-500"
                >
                  ×
                </button>
              )}
            </div>
            <h4 className="text-sm font-bold text-black dark:text-white mb-1">{doc.title}</h4>
            <p className="text-xs text-slate-500 mb-2">{doc.category}</p>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>{doc.size}</span>
              <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredDocs.length === 0 && (
        <p className="text-center text-xs text-slate-500 italic py-8">No documents found</p>
      )}
    </div>
  );
};

// Task Assignment Component
interface TaskAssignmentProps {
  tasks: Task[];
  onAssignTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onUpdateStatus: (taskId: number, status: 'pending' | 'in_progress' | 'completed') => void;
  users: User[];
  currentUser: string;
}

export const TaskAssignment: React.FC<TaskAssignmentProps> = ({ tasks, onAssignTask, onUpdateStatus, users, currentUser }) => {
  const [showAssign, setShowAssign] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.title && newTask.assignedTo) {
      onAssignTask({
        ...newTask,
        assignedBy: currentUser,
        status: 'pending'
      });
      setNewTask({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '' });
      setShowAssign(false);
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-300',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
    completed: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300'
  };

  const priorityColors = {
    low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    medium: 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300',
    high: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300'
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-black dark:text-white">Task Assignments</h3>
        <Btn size="sm" onClick={() => setShowAssign(!showAssign)}>
          {showAssign ? 'Cancel' : 'Assign Task'}
        </Btn>
      </div>

      {showAssign && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#0f1623] border border-gray-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
          <input
            type="text"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            placeholder="Task title"
            className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-[#0f1623] text-black dark:text-white"
            required
          />
          <textarea
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            placeholder="Task description"
            rows={2}
            className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-[#0f1623] text-black dark:text-white"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={newTask.assignedTo}
              onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
              className="px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-[#0f1623] text-black dark:text-white"
              required
            >
              <option value="">Assign to...</option>
              {users.map((u) => (
                <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
              ))}
            </select>
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
              className="px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-[#0f1623] text-black dark:text-white"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
          <input
            type="date"
            value={newTask.dueDate}
            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-[#0f1623] text-black dark:text-white"
          />
          <Btn size="sm" type="submit" className="w-full">
            Assign Task
          </Btn>
        </form>
      )}

      <div className="space-y-2">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white dark:bg-[#0f1623] border border-gray-200 dark:border-slate-800 rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-sm font-bold text-black dark:text-white">{task.title}</h4>
                <p className="text-xs text-slate-500">{task.description}</p>
              </div>
              <div className="flex gap-2">
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${statusColors[task.status]}`}>
                  {task.status.replace('_', ' ')}
                </span>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Assigned to: {task.assignedTo}</span>
              <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
            </div>
            <div className="flex gap-2 mt-2">
              {task.status !== 'completed' && (
                <select
                  value={task.status}
                  onChange={(e) => onUpdateStatus(task.id, e.target.value as 'pending' | 'in_progress' | 'completed')}
                  className="px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-[#0f1623] text-black dark:text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              )}
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <p className="text-center text-xs text-slate-500 italic py-8">No tasks assigned</p>
      )}
    </div>
  );
};
