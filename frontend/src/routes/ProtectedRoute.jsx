import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/ui/Spinner.jsx';

// ProtectedRoute — wraps pages that require authentication.
//
// Usage in the router:
//   { path: 'dashboard', element: <ProtectedRoute><DashboardPage /></ProtectedRoute> }
//
// Behavior:
//   - isLoading  → show centered spinner (token being validated on first load)
//   - no user    → redirect to /login (with replace, so back button is sane)
//   - user       → render children
//
// The loading state is what prevents a "flash to /login" for a fraction of
// a second when the user reloads a protected page with a valid token.
// AuthProvider validates the token via /auth/me before isLoading becomes false.

export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        className="flex min-h-[40vh] items-center justify-center text-muted"
        role="status"
        aria-live="polite"
      >
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}