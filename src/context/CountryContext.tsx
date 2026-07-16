import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { districtsApi } from '../api';

export const ALL_COUNTRIES = 'all';

// Maps ISO country codes (from IP geolocation) to the country names used in our system
const COUNTRY_CODE_MAP: Record<string, string> = {
  MW: 'Malawi',
  KE: 'Kenya',
  SO: 'Somaliland', // Somaliland shares ISO code 'SO' with Somalia in most geo-IP services
};

interface CountryContextValue {
  activeCountry: string;
  setActiveCountry: (country: string) => void;
  setDefaultCountry: (country: string) => void;
  availableCountries: string[];
  loading: boolean;
}

const CountryContext = createContext<CountryContextValue | undefined>(undefined);

export const CountryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeCountry, setActiveCountryState] = useState<string>(() => {
    return localStorage.getItem('active_country') || ALL_COUNTRIES;
  });
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const setActiveCountry = useCallback((country: string) => {
    setActiveCountryState(country);
    localStorage.setItem('active_country', country);
    localStorage.setItem('active_country_user_set', 'true'); // mark as an explicit user choice
  }, []);

  // Used for account-based or geo-based defaulting — does NOT mark the choice as
  // "explicit", so it never blocks a *different* user from getting their own default
  // later on the same device, and a genuine user pick can still override it.
  const setDefaultCountry = useCallback((country: string) => {
    setActiveCountryState(country);
    localStorage.setItem('active_country', country);
  }, []);

  useEffect(() => {
    districtsApi.getCountries()
      .then((data: any) => setAvailableCountries(Array.isArray(data) ? data : []))
      .catch((err: any) => console.error('CountryContext: failed to load countries', err))
      .finally(() => setLoading(false));
  }, []);

  // ── Auto-detect country by IP location, but only on a user's very first visit ──
  useEffect(() => {
    const alreadyChosen = localStorage.getItem('active_country_user_set');
    const alreadyDetected = localStorage.getItem('active_country_geo_attempted');
    if (alreadyChosen || alreadyDetected) return; // respect explicit choice or don't re-detect every load

    localStorage.setItem('active_country_geo_attempted', 'true');

    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        const code = data?.country_code as string | undefined;
        const matched = code ? COUNTRY_CODE_MAP[code] : undefined;
        if (matched) {
          setActiveCountryState(matched);
          localStorage.setItem('active_country', matched);
        }
      })
      .catch(err => {
        console.warn('CountryContext: IP geolocation failed, defaulting to All Countries', err);
      });
  }, []);

  return (
    <CountryContext.Provider value={{ activeCountry, setActiveCountry, setDefaultCountry, availableCountries, loading }}>
      {children}
    </CountryContext.Provider>
  );
};

export const useCountry = (): CountryContextValue => {
  const ctx = useContext(CountryContext);
  if (!ctx) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  return ctx;
};
