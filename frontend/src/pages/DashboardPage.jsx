import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';

// DashboardPage — the landing page after login/register.
//
// Guarded by <ProtectedRoute> in App.jsx (wired in R3.7). That guard
// guarantees `user` is non-null before this component ever renders, so we
// don't need to null-check it here. Trust the guard.
//
// Role-aware cards:
//   USER              → Ask a question, My questions
//   SCHOLAR or ADMIN  → same, plus Scholar queue
//
// Links point to routes that don't exist yet (R4 adds /ask and
// /my-questions; R5 adds /scholar). Clicking them will 404 until then —
// that's expected and informative during development.

const ROLE_BADGE_VARIANT = {
  USER: 'default',
  SCHOLAR: 'info',
  ADMIN: 'warning',
};

// The "actions" a user can take from the dashboard, derived from their role.
// Keeping this as data (rather than JSX) makes the render below trivial.
function getActionsForRole(role) {
  const actions = [
    {
      to: '/ask',
      title: 'Ask a question',
      description: 'Submit a question to the scholars for review and guidance.',
    },
    {
      to: '/my-questions',
      title: 'My questions',
      description: 'View the questions you have asked and their current status.',
    },
  ];

  if (role === 'SCHOLAR' || role === 'ADMIN') {
    actions.push({
      to: '/scholar',
      title: 'Scholar queue',
      description: 'Review pending questions and provide scholarly answers.',
    });
  }

  return actions;
}

export default function DashboardPage() {
  const { user } = useAuth();

  // ProtectedRoute guarantees user is non-null; this is defence-in-depth
  // against future refactors that might move the guard. It should never
  // render in practice.
  if (!user) return null;

  const actions = getActionsForRole(user.role);
  const badgeVariant = ROLE_BADGE_VARIANT[user.role] || 'default';

  return (
    <main className="min-h-screen bg-bg text-text px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text">
              Welcome, {user.fullName}
            </h1>
            <p className="mt-1 text-sm text-muted">
              What would you like to do today?
            </p>
          </div>
          <Badge variant={badgeVariant} aria-label={`Role: ${user.role}`}>
            {user.role}
          </Badge>
        </header>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {actions.map((action) => (
            <li key={action.to}>
              <Card title={action.title}>
                <p className="text-sm text-muted">{action.description}</p>
                <Link
                  to={action.to}
                  className="mt-4 inline-block text-sm font-medium text-accent hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-base"
                >
                  Open {action.title} →
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}