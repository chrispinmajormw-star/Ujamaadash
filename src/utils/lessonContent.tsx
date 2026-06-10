import React from 'react';

/** Render inline **bold** markers without showing asterisks */
export function renderInlineText(text: string, accent?: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold" style={accent ? { color: accent } : undefined}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function isListLine(line: string): boolean {
  return /^(\d+[\.\)]\s|[-•]\s)/.test(line.trim());
}

/** Split lesson body text into readable online-course sections */
export const SectionContent: React.FC<{ content: string; accent?: string }> = ({ content, accent }) => {
  const blocks = content.split(/\n\n+/);

  return (
    <div className="space-y-3">
      {blocks.map((block, bi) => {
        const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length === 0) return null;

        const allList = lines.every(isListLine);
        if (allList) {
          return (
            <ul key={bi} className="space-y-1.5 pl-1">
              {lines.map((line, li) => (
                <li key={li} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent || '#64748b' }} />
                  <span className="leading-relaxed">{renderInlineText(line.replace(/^(\d+[\.\)]\s|[-•]\s)/, ''), accent)}</span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <div key={bi} className="space-y-2">
            {lines.map((line, li) => (
              <p key={li} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {renderInlineText(line, accent)}
              </p>
            ))}
          </div>
        );
      })}
    </div>
  );
};
