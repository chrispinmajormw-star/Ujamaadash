import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEME_PRESETS = [
  { name: 'Orange (Default)', value: '#e85d04' },
  { name: 'Blue', value: '#185fa5' },
  { name: 'Green', value: '#059669' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Pink', value: '#db2777' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Teal', value: '#0d9488' },
  { name: 'Amber', value: '#d97706' },
];

const DEFAULT_BRAND = '#e85d04';

interface ThemeContextValue {
  brandColor: string;
  setBrandColor: (color: string) => void;
  resetBrandColor: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brandColor, setBrandColorState] = useState<string>(() => {
    return localStorage.getItem('app_brand_color') || DEFAULT_BRAND;
  });

  // Apply the CSS variable on mount and whenever it changes — no login required,
  // this is a pure browser/device preference stored in localStorage.
  useEffect(() => {
    document.documentElement.style.setProperty('--brand', brandColor);
  }, [brandColor]);

  const setBrandColor = (color: string) => {
    setBrandColorState(color);
    localStorage.setItem('app_brand_color', color);
  };

  const resetBrandColor = () => {
    setBrandColorState(DEFAULT_BRAND);
    localStorage.setItem('app_brand_color', DEFAULT_BRAND);
  };

  return (
    <ThemeContext.Provider value={{ brandColor, setBrandColor, resetBrandColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
};
