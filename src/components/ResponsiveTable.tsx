import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ResponsiveTableProps {
  headers: string[];
  rows: (string | React.ReactNode)[][];
  rowKey?: (row: (string | React.ReactNode)[], index: number) => string;
  className?: string;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  headers,
  rows,
  rowKey = (_, i) => i.toString(),
  className = ""
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRowExpanded = (key: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedRows(newExpanded);
  };

  // Desktop view - standard table
  return (
    <>
      {/* Desktop Table - hidden on mobile */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className={`w-full border-collapse ${className}`}>
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-neutral-200 dark:border-slate-800">
              {headers.map((header, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const key = rowKey(row, idx);
              return (
                <tr
                  key={key}
                  className="border-b border-neutral-200 dark:border-slate-800 hover:bg-orange-50/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {row.map((cell, cellIdx) => (
                    <td
                      key={cellIdx}
                      className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View - visible only on small screens */}
      <div className="md:hidden space-y-3">
        {rows.map((row, idx) => {
          const key = rowKey(row, idx);
          const isExpanded = expandedRows.has(key);
          const firstCell = row[0];

          return (
            <div
              key={key}
              className="bg-white dark:bg-[#0f1623] border border-neutral-200 dark:border-slate-800 rounded-lg overflow-hidden"
            >
              {/* Card header - always visible */}
              <button
                onClick={() => toggleRowExpanded(key)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-orange-50/50 dark:hover:bg-slate-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-inset"
                aria-expanded={isExpanded}
              >
                <div className="text-left flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {firstCell}
                  </p>
                  {row.length > 1 && row[1] && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                      {row[1]}
                    </p>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp size={20} className="text-gray-500 flex-shrink-0 ml-2" />
                ) : (
                  <ChevronDown size={20} className="text-gray-500 flex-shrink-0 ml-2" />
                )}
              </button>

              {/* Card content - expandable */}
              {isExpanded && (
                <div className="border-t border-neutral-200 dark:border-slate-800 px-4 py-3 bg-gray-50/50 dark:bg-slate-900/30 space-y-2">
                  {headers.map((header, cellIdx) => {
                    // Skip first column since it's in header
                    if (cellIdx === 0) return null;

                    return (
                      <div key={cellIdx} className="flex justify-between items-start gap-2 text-sm">
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase flex-shrink-0">
                          {header}
                        </span>
                        <span className="text-gray-900 dark:text-white text-right flex-1">
                          {row[cellIdx]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};
