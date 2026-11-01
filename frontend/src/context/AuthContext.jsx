import { createContext, useContext, useMemo } from 'react';

// AuthContext — R2 STUB.
//
// In R2 this provides the SHAPE of auth state to the rest of the app so
// that components (navbar, protected routes, buttons) can reference
// useAuth() and be written once. R3 will fill in the real implementation:
//   - read token from localStorage on mount
//   - call GET /auth/me to validate it
//   - expose real login/logout
//
// Deliberate design: login() and logout() THROW rather than silently no-op.
// If any R2 component accidentally calls them, you see a loud error
// instead of a mystery login that didn't happen.

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Stub values — nothing is stored, no network calls, no localStorage read.
  // R3 will replace these with real state + effects.
  const value = useMemo(
    () => ({
      user: null,          // { id, email, fullName, role } once logged in
      token: null,         // JWT once logged in
      isLoading: false,    // true while validating an existing token on load
      login: async () => {
        throw new Error('AuthContext.login is not implemented yet (arriving in R3)');
      },
      logout: () => {
        throw new Error('AuthContext.logout is not implemented yet (arriving in R3)');
      },
    }),
    []
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