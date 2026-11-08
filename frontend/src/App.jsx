import { useEffect, useState } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Link } from 'react-router-dom';
import Navbar from './components/layout/Navbar.jsx';
import KitchenSinkPage from './pages/KitchenSinkPage.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AskQuestionPage from './pages/AskQuestionPage.jsx';

// HealthCheckPage — proven working from R1. Kept here for regression checks.
function HealthCheckPage() {
  const [status, setStatus] = useState('loading');
  const [data, setData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    async function checkHealth() {
      setStatus('loading');
      setErrorMessage('');
      try {
        const res = await fetch('/api/health', { signal: controller.signal });
        if (!res.ok) throw new Error(`Backend returned ${res.status}`);
        const json = await res.json();
        if (!cancelled) {
          setData(json);
          setStatus('success');
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        if (!cancelled) {
          setErrorMessage(err.message || 'Unknown error');
          setStatus('error');
        }
      }
    }

    checkHealth();
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
          <p className="mt-2 text-muted">Frontend scaffold — Stage R1 health check</p>
        </header>

        {status === 'loading' && (
          <div className="rounded-base border border-border bg-surface p-6 text-center text-muted" role="status" aria-live="polite">
            Contacting backend…
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-base border border-danger bg-surface p-6" role="alert">
            <h2 className="font-semibold text-danger">Could not reach the backend</h2>
            <p className="mt-2 text-sm text-text">{errorMessage}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="rounded-base border border-border bg-surface p-6" role="status" aria-live="polite">
            <h2 className="font-semibold text-success">Backend is reachable ✓</h2>
            <pre className="mt-4 overflow-x-auto rounded-base bg-bg p-3 text-xs text-text">
{JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-muted">
          Try{' '}
          <a href="/kitchen-sink" className="text-accent underline">
            /kitchen-sink
          </a>{' '}
          to view the design system.
        </p>
      </div>
    </main>
  );
}

// Layout — everything inside this route gets the Navbar on top.
// Nested routes render into <Outlet />.
function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthProvider><Layout /></AuthProvider>,
    children: [
      { index: true, element: <HealthCheckPage /> },
      { path: 'kitchen-sink', element: <KitchenSinkPage /> },

      // Public auth pages — no guard
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },

      // Protected pages — wrapped in guard
      { path: 'dashboard', element: <ProtectedRoute><DashboardPage /></ProtectedRoute> },

      { path: 'ask', element: <ProtectedRoute><AskQuestionPage /></ProtectedRoute> },

      // (R4/R5 add: /ask, /my-questions, /questions/:id, /scholar — all protected)
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}