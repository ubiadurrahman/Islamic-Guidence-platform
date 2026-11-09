import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// NotFoundPage — rendered for any unmatched route.
// It's a child of the root Layout route, so the Navbar, theme, and auth
// context are all available. Guests see one link home; signed-in users
// also get a shortcut to the dashboard (the likelier destination).

export default function NotFoundPage() {
  const { user } = useAuth();

  const linkClass =
    'rounded-base border border-border bg-surface px-4 py-2 text-sm ' +
    'font-medium text-text transition-colors hover:border-accent ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent';

  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-muted">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <nav
        aria-label="Suggested destinations"
        className="mt-6 flex flex-wrap items-center justify-center gap-3"
      >
        <Link to="/" className={linkClass}>
          Back to home
        </Link>
        {user && (
          <Link to="/dashboard" className={linkClass}>
            Go to dashboard
          </Link>
        )}
      </nav>
    </main>
  );
}