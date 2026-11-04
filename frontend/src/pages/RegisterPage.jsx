import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api, ApiError } from '../api/client.js';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import Alert from '../components/ui/Alert.jsx';
import Card from '../components/ui/Card.jsx';

// RegisterPage — /register
//
// - If already authenticated, redirects to /dashboard
// - Inline validation from server 422 responses
// - 409 (duplicate email) surfaced in top Alert
// - Show/hide password toggle
// - After successful registration, auto-logs-in via the same credentials
//   and redirects to /dashboard (better UX than "now go log in")
// - Auto-focus full name on mount (first field)

export default function RegisterPage() {
  const navigate = useNavigate();
  const { user, login, isLoading: authLoading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');

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
      // 1) Register the account
      await api.post('/auth/register', {
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });
      // 2) Auto-login with the same credentials
      await login(email.trim(), password);
      // 3) Land on dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422 && err.fields) {
          setFieldErrors(err.fields);
        } else {
          setServerError(err.message || 'Registration failed. Please try again.');
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
          <h1 className="text-2xl font-semibold">Create account</h1>
          <p className="mt-1 text-sm text-muted">
            Your questions will be reviewed by scholars.
          </p>
        </header>

        <Card>
          {serverError && (
            <div className="mb-4">
              <Alert
                variant="danger"
                title="Could not create account"
                onDismiss={() => setServerError('')}
              >
                {serverError}
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-4">
              <Input
                label="Full name"
                type="text"
                id="fullName"
                autoComplete="name"
                autoFocus
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={fieldErrors.fullName}
                hint="As you'd like to be addressed in the app."
                required
              />

              <Input
                label="Email"
                type="email"
                id="email"
                autoComplete="email"
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
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={fieldErrors.password}
                  hint="At least 8 characters."
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
                {submitting ? 'Creating account…' : 'Create account'}
              </Button>
            </div>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-accent underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}