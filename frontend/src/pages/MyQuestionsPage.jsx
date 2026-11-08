import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../api/client.js';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { STATUS_LABELS, STATUS_BADGE_VARIANT, formatDate } from '../utils/question-display.js';

export default function MyQuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const data = await api.get('/questions/mine');
        if (!cancelled) {
          setQuestions(data.questions ?? []);
        }
      } catch (err) {
        if (cancelled) return;

        // 401: AuthContext is already redirecting; swallow silently.
        if (err instanceof ApiError && err.status === 401) return;

        if (err instanceof ApiError) {
          setError(err.message || 'Could not load your questions.');
        } else {
          setError('Could not reach the server. Check your connection and try again.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [retryToken]);

  function handleRetry() {
    setRetryToken((t) => t + 1);
  }

  return (
    <main className="min-h-screen bg-bg text-text px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text">
              My questions
            </h1>
            <p className="mt-1 text-sm text-muted">
              Questions you have asked and their current status.
            </p>
          </div>
          <Link
            to="/ask"
            className={
              'inline-block rounded-base border border-border bg-surface ' +
              'px-3 py-2 text-sm font-medium text-text ' +
              'transition-colors hover:border-accent hover:text-accent ' +
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
            }
          >
            + Ask a new question
          </Link>
        </header>

        {loading && (
          <Card>
            <div className="flex items-center gap-3 text-sm text-muted" role="status" aria-live="polite">
              <Spinner className="h-5 w-5" />
              <span>Loading your questions…</span>
            </div>
          </Card>
        )}

        {!loading && error && (
          <div className="flex flex-col gap-3">
            <Alert variant="danger" title="Could not load questions">
              {error}
            </Alert>
            <div>
              <Button variant="secondary" size="sm" onClick={handleRetry}>
                Retry
              </Button>
            </div>
          </div>
        )}

        {!loading && !error && questions.length === 0 && (
          <Card>
            <p className="text-sm text-text">You haven't asked any questions yet.</p>
            <p className="mt-1 text-sm text-muted">
              When you ask a question, it will appear here with its review status.
            </p>
            <div className="mt-4">
              <Link
                to="/ask"
                className={
                  'inline-block rounded-base bg-accent px-4 py-2 text-sm font-medium text-accent-text ' +
                  'transition-colors hover:bg-accent-hover ' +
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
                }
              >
                Ask your first question
              </Link>
            </div>
          </Card>
        )}

        {!loading && !error && questions.length > 0 && (
          <ul className="flex flex-col gap-4">
            {questions.map((q) => (
             <li key={q.id}>
  <Link
    to={`/questions/${q.id}`}
    className={
      'block rounded-base ' +
      'group ' +
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
    }
  >
    <Card
      title={q.title}
      className="transition-colors group-hover:border-accent"
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        ...
      </div>
      <p className="whitespace-pre-wrap text-sm text-text">{q.body}</p>
    </Card>
  </Link>
</li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}