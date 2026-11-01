import { useEffect, useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

/**
 * HealthCheckPage — proves the React → Vite proxy → backend → Postgres
 * round-trip works before we build real pages.
 *
 * The three-state pattern (loading / success / error) is the blueprint
 * for every later page. AbortController ensures the effect cleans up
 * correctly when the component unmounts or when StrictMode double-invokes.
 */
function HealthCheckPage() {
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [data, setData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    async function checkHealth() {
      setStatus('loading');
      setErrorMessage('');
      try {
        // /api/health is proxied to http://localhost:3000/health by vite.config.js.
        // The backend endpoint stays exactly /health — the proxy just strips /api.
        const res = await fetch('/api/health', { signal: controller.signal });
        if (!res.ok) throw new Error(`Backend returned ${res.status}`);
        const json = await res.json();
        if (!cancelled) {
          setData(json);
          setStatus('success');
        }
      } catch (err) {
        // Abort is expected on unmount or StrictMode re-invoke — not a real error.
        if (err.name === 'AbortError') return;
        if (!cancelled) {
          setErrorMessage(err.message || 'Unknown error');
          setStatus('error');
        }
      }
    }

    checkHealth();

    // Cleanup: abort the in-flight fetch if the component unmounts.
    // This is what StrictMode's double-invocation in dev is testing for.
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return (
    <main className="min-h-screen bg-bg text-text flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-text">
            Islamic Guidance &amp; Knowledge
          </h1>
          <p className="mt-2 text-muted">
            Frontend scaffold — Stage R1 health check
          </p>
        </header>

        {status === 'loading' && (
          <div
            className="rounded-base border border-border bg-surface p-6 text-center text-muted"
            role="status"
            aria-live="polite"
          >
            Contacting backend…
          </div>
        )}

        {status === 'error' && (
          <div
            className="rounded-base border border-danger bg-surface p-6"
            role="alert"
          >
            <h2 className="font-semibold text-danger">Could not reach the backend</h2>
            <p className="mt-2 text-sm text-text">
              {errorMessage}
            </p>
            <p className="mt-3 text-sm text-muted">
              Make sure the backend is running on{' '}
              <code className="rounded bg-bg px-1 py-0.5 text-text">
                http://localhost:3000
              </code>{' '}
              and that the Vite dev server is on port 5173.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div
            className="rounded-base border border-border bg-surface p-6"
            role="status"
            aria-live="polite"
          >
            <h2 className="font-semibold text-success">Backend is reachable ✓</h2>
            <p className="mt-2 text-sm text-muted">
              This confirms the chain works: React → Vite proxy → Express → response.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-base bg-bg p-3 text-xs text-text">
{JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}

        <footer className="mt-8 text-center text-xs text-muted">
          Palette preview — the panels above use{' '}
          <code className="rounded bg-surface px-1 py-0.5 text-accent">bg-surface</code>,{' '}
          <code className="rounded bg-surface px-1 py-0.5 text-accent">border-border</code>,{' '}
          <code className="rounded bg-surface px-1 py-0.5 text-accent">text-text</code>,{' '}
          <code className="rounded bg-surface px-1 py-0.5 text-accent">text-muted</code>,{' '}
          <code className="rounded bg-surface px-1 py-0.5 text-accent">text-success</code>{' '}
          from our theme. Dark mode toggle arrives in R2.
        </footer>
      </div>
    </main>
  );
}

// React Router v7: createBrowserRouter returns a router object; RouterProvider
// attaches it to the React tree. Later, new routes will be added to the array.
const router = createBrowserRouter([
  { path: '/', element: <HealthCheckPage /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}