import React from 'react';

// Renders **bold** markers as proper bold text
export const renderInlineText = (text: string, accent: string): React.ReactNode => {
  if (!text || !text.includes('**')) return text;
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: accent, fontWeight: 700 }}>{part}</strong>
      : part
  );
};

// Renders a content string with bold markers
export const SectionContent: React.FC<{ content: string; accent: string }> = ({ content, accent }) => {
  if (!content) return null;
  return (
    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
      {renderInlineText(content, accent)}
    </p>
  );
};
