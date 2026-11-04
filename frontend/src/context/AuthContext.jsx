import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError, TOKEN_KEY, USER_KEY } from '../api/client.js';

// AuthContext — real authentication (R3).
//
// Behavior:
//   - On mount: read {token, user} from localStorage, validate token via
//     GET /auth/me. On 401: clear + redirect. On network error: keep session
//     (transient). On success: confirm cached user.
//   - login(email, password): POST /auth/login, store {user, token},
//     update state, return {user, token} so caller can redirect.
//   - logout(): clear storage + state. Caller decides where to navigate.
//   - Listen for 'auth:unauthorized' events from api/client.js (any 401).
//     On fire: clear + redirect (unless already on a public auth path).
//
// Storage keys are TOKEN_KEY and USER_KEY from api/client.js — single
// source of truth, imported.
//
// The user object in state comes from:
//   (a) login() response cache, OR
//   (b) the localStorage cache at mount.
// If /auth/me validates the token but the cached user is missing, we
// keep the user minimal ({id, role}) from /auth/me. In practice this
// never happens because login() always caches.

const AuthContext = createContext(null);

const PUBLIC_PATHS = ['/login', '/register'];

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeStoredUser(user) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch {
    /* storage unavailable — session works for this page-load only */
  }
}

function readStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeStoredToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
}

function isPublicPath(pathname) {
  return PUBLIC_PATHS.includes(pathname);
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(readStoredToken);
  const [isLoading, setIsLoading] = useState(!!readStoredToken());

  // Guards against a redirect loop when many parallel API calls 401 at once.
  const redirectingRef = useRef(false);

  const clearSession = useCallback(() => {
    writeStoredToken(null);
    writeStoredUser(null);
    setUser(null);
    setToken(null);
  }, []);

  const redirectToLoginOnce = useCallback(() => {
    if (redirectingRef.current) return;
    if (isPublicPath(window.location.pathname)) return;
    redirectingRef.current = true;
    clearSession();
    navigate('/login', { replace: true });
    // Reset after navigation so future logouts on the login page aren't blocked
    setTimeout(() => {
      redirectingRef.current = false;
    }, 0);
  }, [navigate, clearSession]);

  // Initial validation of the stored token, once on mount.
  useEffect(() => {
    const storedToken = readStoredToken();
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    (async () => {
      try {
        const result = await api.get('/auth/me');
        if (cancelled) return;
        const minimalUser = result?.user; // { id, role }
        const cached = readStoredUser();
        // Prefer cached (has email/fullName) but reconcile if missing.
        const nextUser =
          cached && minimalUser && cached.id === minimalUser.id
            ? cached
            : minimalUser || cached || null;
        setUser(nextUser);
        setToken(storedToken);
        setIsLoading(false);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          clearSession();
          if (!isPublicPath(window.location.pathname)) {
            navigate('/login', { replace: true });
          }
          setIsLoading(false);
          return;
        }
        // Network error or server error — keep session, let user retry.
        // Do not logout on transient failures.
        setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate, clearSession]);

  // Listen for 401 events from the API client.
  useEffect(() => {
    const handler = () => {
      redirectToLoginOnce();
    };
    window.addEventListener('auth:unauthorized', handler);
    return () => window.removeEventListener('auth:unauthorized', handler);
  }, [redirectToLoginOnce]);

  const login = useCallback(async (email, password) => {
    const result = await api.post('/auth/login', { email, password });
    const { user: nextUser, token: nextToken } = result;
    writeStoredToken(nextToken);
    writeStoredUser(nextUser);
    setUser(nextUser);
    setToken(nextToken);
    setIsLoading(false);
    return { user: nextUser, token: nextToken };
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setIsLoading(false);
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, token, isLoading, login, logout }),
    [user, token, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}