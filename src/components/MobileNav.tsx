import React from 'react';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface MobileNavProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  children: React.ReactNode;
  logo?: React.ReactNode;
}

export const MobileNav: React.FC<MobileNavProps> = ({ 
  isOpen, 
  onToggle, 
  onClose, 
  children,
  logo 
}) => {
  return (
    <>
      {/* Mobile menu button - visible only on small screens */}
      <button
        onClick={onToggle}
        className="md:hidden p-2.5 hover:bg-[var(--brand-50)] dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X size={24} className="text-black dark:text-white" />
        ) : (
          <Menu size={24} className="text-black dark:text-white" />
        )}
      </button>

      {/* Mobile menu backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Mobile menu drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed left-0 top-0 bottom-0 z-40 w-64 bg-white dark:bg-[#0f1623] border-r border-neutral-200 dark:border-slate-800 md:hidden overflow-y-auto"
            role="navigation"
            aria-label="Mobile navigation"
          >
            {/* Close button in drawer */}
            <div className="p-4 flex items-center justify-between border-b border-neutral-200 dark:border-slate-800">
              {logo}
              <button
                onClick={onClose}
                className="p-1 hover:bg-[var(--brand-50)] dark:hover:bg-slate-800 rounded transition-colors"
                aria-label="Close navigation"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile menu content */}
            <nav className="p-4">
              {children}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
