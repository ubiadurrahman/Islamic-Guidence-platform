import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/ui/Spinner.jsx';

// RoleRoute — gates a route to authenticated users with specific roles.
// Standalone guard: handles auth-loading, no-user, and wrong-role in one.
// Used by /scholar in R5.1; will be reused for any future role-restricted area.
//
// Behavior:
//   isLoading                → centered Spinner
//   no user                  → <Navigate to="/login" replace />
//   user.role not in allowed → <Navigate to="/dashboard" replace />
//   user.role allowed        → children
//
// Why redirect to /dashboard (not /login) on wrong role: the user IS logged
// in, they just don't have access to this area. Sending them to /login would
// immediately bounce them to /dashboard anyway (via LoginPage's "already
// logged in" redirect from R3.4) — two hops for nothing. Direct is cleaner.

export default function RoleRoute({ allowedRoles, children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-text">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}