import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ApiError } from '../api/client.js';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import Alert from '../components/ui/Alert.jsx';
import Card from '../components/ui/Card.jsx';

// LoginPage — /login
//
// - If already authenticated, redirects to /dashboard (no "log in again")
// - Inline validation from server 422 responses
// - Server errors (401, 403) shown in top Alert
// - Show/hide password toggle
// - Auto-focus email on mount

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, login, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');

  // If already logged in, bounce to dashboard. Also wait for initial
  // AuthProvider validation so we don't redirect a valid session to login
  // and then back.
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [authLoading, user, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError('');
    setFieldErrors({});
    setSubmitting(true);

    try {
      await login(email.trim(), password);
      // AuthContext has updated state; Navbar re-renders; then navigate.
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422 && err.fields) {
          setFieldErrors(err.fields);
        } else {
          setServerError(err.message || 'Login failed. Please try again.');
        }
      } else {
        setServerError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-bg text-text">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-semibold">Log in</h1>
          <p className="mt-1 text-sm text-muted">Welcome back.</p>
        </header>

        <Card>
          {serverError && (
            <div className="mb-4">
              <Alert
                variant="danger"
                title="Could not log in"
                onDismiss={() => setServerError('')}
              >
                {serverError}
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-4">
              <Input
                label="Email"
                type="email"
                id="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={fieldErrors.email}
                required
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={fieldErrors.password}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-8 text-xs text-muted transition-colors hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <Button type="submit" loading={submitting} disabled={submitting}>
                {submitting ? 'Logging in…' : 'Log in'}
              </Button>
            </div>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-muted">
          No account?{' '}
          <Link to="/register" className="text-accent underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}