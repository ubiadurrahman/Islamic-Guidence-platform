import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import Alert from '../components/ui/Alert.jsx';
import Spinner from '../components/ui/Spinner.jsx';

// Status labels / variants — duplicated from MyQuestionsPage.jsx.
// Third duplication will be in R5.3's QuestionDetailPage; at that point
// we extract to a shared module. Two now, so no extraction yet (rule 4).
const STATUS_LABELS = {
  PENDING: 'Pending',
  UNDER_REVIEW: 'Under review',
  NEEDS_CLARIFICATION: 'Needs clarification',
  ANSWERED: 'Answered',
  CLOSED: 'Closed',
};

const STATUS_BADGE_VARIANT = {
  PENDING: 'default',
  UNDER_REVIEW: 'info',
  NEEDS_CLARIFICATION: 'warning',
  ANSWERED: 'success',
  CLOSED: 'default',
};

function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function QuestionCard({
  question,
  currentUserId,
  expanded,
  onToggleExpand,
  onPickUp,
  pickingUp,
  anyPickingUp,
}) {
  const isOwnQuestion = question.author.id === currentUserId;
  const isAssignedToMe = question.scholar?.id === currentUserId;
  const isAssignedToOther = question.scholar && question.scholar.id !== currentUserId;

  const canPickUp =
    question.status === 'PENDING' && !question.scholar && !isOwnQuestion;

  const shouldTruncate = question.body.length > 200;

  let actionContent;
  if (canPickUp) {
    actionContent = (
      <Button
        variant="primary"
        size="sm"
        onClick={() => onPickUp(question.id)}
        loading={pickingUp}
        disabled={anyPickingUp && !pickingUp}
      >
        Pick up
      </Button>
    );
  } else if (isOwnQuestion && question.status === 'PENDING') {
    actionContent = <span className="text-xs text-muted">Your own question</span>;
  } else if (isAssignedToMe) {
    actionContent = <span className="text-xs text-muted">Picked up by you</span>;
  } else if (isAssignedToOther) {
    actionContent = (
      <span className="text-xs text-muted">
        Picked up by {question.scholar.fullName}
      </span>
    );
  } else {
    actionContent = (
      <span className="text-xs text-muted">
        {STATUS_LABELS[question.status] || question.status}
      </span>
    );
  }

  return (
    <Card title={question.title}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Badge variant={STATUS_BADGE_VARIANT[question.status] || 'default'}>
          {STATUS_LABELS[question.status] || question.status}
        </Badge>
        <span className="text-xs text-muted">by {question.author.fullName}</span>
        <span className="text-xs text-muted" aria-hidden="true">
          ·
        </span>
        <time dateTime={question.createdAt} className="text-xs text-muted">
          {formatDate(question.createdAt)}
        </time>
        {question.scholar && (
          <>
            <span className="text-xs text-muted" aria-hidden="true">
              ·
            </span>
            <span className="text-xs text-muted">
              Assigned: {question.scholar.fullName}
            </span>
          </>
        )}
      </div>

      <p
        className={
          'whitespace-pre-wrap text-sm text-text ' +
          (expanded || !shouldTruncate ? '' : 'line-clamp-3')
        }
      >
        {question.body}
      </p>

      {shouldTruncate && (
        <button
          type="button"
          onClick={onToggleExpand}
          className={
            'mt-2 rounded-base text-xs font-medium text-accent hover:underline ' +
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
          }
        >
          {expanded ? 'Show less' : 'Show full question'}
        </button>
      )}

      <div className="mt-4 flex items-center justify-end">{actionContent}</div>
    </Card>
  );
}

export default function ScholarQueuePage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('open');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryToken, setRetryToken] = useState(0);
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [pickingUpId, setPickingUpId] = useState(null);
  const [pickUpError, setPickUpError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const endpoint =
          filter === 'open'
            ? '/scholar/questions/pending'
            : '/scholar/questions/mine';
        const data = await api.get(endpoint);
        if (!cancelled) {
          setQuestions(data.questions ?? []);
        }
      } catch (err) {
        if (cancelled) return;

        if (err instanceof ApiError && err.status === 401) return;

        if (err instanceof ApiError) {
          if (err.status === 403) {
            setError('You do not have access to the scholar queue.');
          } else {
            setError(err.message || 'Could not load the queue.');
          }
        } else {
          setError(
            'Could not reach the server. Check your connection and try again.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [filter, retryToken]);

  // Hooks above; safe non-hook early exit below.
  // ProtectedRoute/RoleRoute guarantee `user`, so this is defence-in-depth.
  if (!user) return null;

  function handleFilterChange(next) {
    if (next === filter) return;
    setFilter(next);
    setExpandedIds(new Set());
    setPickUpError('');
  }

  function handleRetry() {
    setPickUpError('');
    setRetryToken((t) => t + 1);
  }

  function toggleExpand(id) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handlePickUp(questionId) {
    setPickingUpId(questionId);
    setPickUpError('');

    try {
      await api.post(`/scholar/questions/${questionId}/pick-up`, {});
      setRetryToken((t) => t + 1);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return;

      if (err instanceof ApiError && err.status === 409) {
        setPickUpError(
          'This question was just picked up by someone else. The list has been refreshed.'
        );
        setRetryToken((t) => t + 1);
      } else if (err instanceof ApiError) {
        setPickUpError(err.message || 'Could not pick up this question.');
      } else {
        setPickUpError(
          'Could not reach the server. Check your connection and try again.'
        );
      }
    } finally {
      setPickingUpId(null);
    }
  }

  const emptyMessage =
    filter === 'open'
      ? 'No questions in the queue right now.'
      : "You haven't picked up any questions yet.";
  const emptyHint =
    filter === 'open'
      ? 'Check back later — new questions from users will appear here.'
      : 'Browse the open queue to pick up a question to review.';

  return (
    <main className="min-h-screen bg-bg text-text px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text">
              Scholar queue
            </h1>
            <p className="mt-1 text-sm text-muted">
              Questions awaiting review. Pick one up to begin.
            </p>
          </div>
          <Link
            to="/dashboard"
            className={
              'rounded-base px-3 py-2 text-sm font-medium text-muted ' +
              'transition-colors hover:text-text ' +
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
            }
          >
            ← Back to dashboard
          </Link>
        </header>

        <div
          role="group"
          aria-label="Filter questions"
          className="mb-4 flex flex-wrap gap-2"
        >
          <Button
            variant={filter === 'open' ? 'primary' : 'secondary'}
            size="sm"
            aria-pressed={filter === 'open'}
            onClick={() => handleFilterChange('open')}
          >
            Open queue
          </Button>
          <Button
            variant={filter === 'mine' ? 'primary' : 'secondary'}
            size="sm"
            aria-pressed={filter === 'mine'}
            onClick={() => handleFilterChange('mine')}
          >
            My questions
          </Button>
        </div>

        {pickUpError && (
          <div className="mb-4">
            <Alert
              variant="warning"
              title="Could not pick up question"
              onDismiss={() => setPickUpError('')}
            >
              {pickUpError}
            </Alert>
          </div>
        )}

        {loading && (
          <Card>
            <div
              className="flex items-center gap-3 text-sm text-muted"
              role="status"
              aria-live="polite"
            >
              <Spinner className="h-5 w-5" />
              <span>Loading questions…</span>
            </div>
          </Card>
        )}

        {!loading && error && (
          <div className="flex flex-col gap-3">
            <Alert variant="danger" title="Could not load queue">
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
            <p className="text-sm text-text">{emptyMessage}</p>
            <p className="mt-1 text-sm text-muted">{emptyHint}</p>
          </Card>
        )}

        {!loading && !error && questions.length > 0 && (
          <ul className="flex flex-col gap-4">
            {questions.map((q) => (
              <li key={q.id}>
                <QuestionCard
                  question={q}
                  currentUserId={user.id}
                  expanded={expandedIds.has(q.id)}
                  onToggleExpand={() => toggleExpand(q.id)}
                  onPickUp={handlePickUp}
                  pickingUp={pickingUpId === q.id}
                  anyPickingUp={pickingUpId !== null}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}