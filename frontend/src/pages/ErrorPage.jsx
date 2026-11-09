import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';

// ErrorPage — rendered by the router's errorElement when a route throws.
// CRITICAL: it renders OUTSIDE the root Layout route's element tree, so
// AuthProvider, ThemeProvider-based hooks that rely on router context, and
// even useAuth are NOT safely available here. This component must depend on
// nothing but React Router primitives.

export default function ErrorPage() {
  const error = useRouteError();

  const is404 = isRouteErrorResponse(error) && error.status === 404;
  const title = is404 ? 'Page not found' : 'Something went wrong';
  const message = is404
    ? "The page you're looking for doesn't exist or may have moved."
    : 'An unexpected error occurred. You can try reloading the page.';

  const linkClass =
    'rounded-base border border-border bg-surface px-4 py-2 text-sm ' +
    'font-medium text-text transition-colors hover:border-accent ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent';

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-muted">{message}</p>
      <nav
        aria-label="Recovery options"
        className="mt-6 flex flex-wrap items-center justify-center gap-3"
      >
        <Link to="/" className={linkClass}>
          Back to home
        </Link>
        {!is404 && (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className={linkClass}
          >
            Reload page
          </button>
        )}
      </nav>
    </main>
  );
}