import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// ThemeContext manages:
//   - user preference ('light' | 'dark' | 'system'), persisted in localStorage
//   - the actual applied theme ('light' | 'dark'), which flips automatically
//     when the user's OS theme changes IF their preference is 'system'
//   - the .dark class on <html>, which is what drives all our CSS variables
//
// The logic here MUST stay in sync with the pre-hydration script in index.html.
// If you change the storage key, value format, or dark-decision rule here,
// change it in index.html too. Otherwise dark-mode users see a flash of
// light theme on first load.

const STORAGE_KEY = 'theme'; // must match index.html

const ThemeContext = createContext(null);

function getSystemPrefersDark() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function readInitialPreference() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {
    /* localStorage blocked — fall through to 'system' */
  }
  return 'system';
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readInitialPreference);
  const [systemPrefersDark, setSystemPrefersDark] = useState(getSystemPrefersDark);

  // Listen for OS theme changes. When the user has chosen 'system', we
  // re-resolve on every OS toggle. When they've chosen light/dark, this
  // listener still runs but has no effect (see resolvedTheme below).
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (event) => setSystemPrefersDark(event.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  const resolvedTheme =
    theme === 'system' ? (systemPrefersDark ? 'dark' : 'light') : theme;

  // Apply the .dark class whenever the resolved theme changes. This is the
  // ONLY place that touches the DOM class — everything else goes through state.
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [resolvedTheme]);

  // Persist user preference. We store 'system' literally, not the resolved
  // value — so if the user's OS changes later, they still track the OS.
  const setTheme = useCallback((next) => {
    if (next !== 'light' && next !== 'dark' && next !== 'system') return;
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* localStorage blocked — preference won't persist, but session works */
    }
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}