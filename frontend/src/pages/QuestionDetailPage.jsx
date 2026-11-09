import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, ApiError } from '../api/client.js';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import {
  STATUS_LABELS,
  STATUS_BADGE_VARIANT,
  formatDate,
} from '../utils/question-display.js';

// Display labels for the structured reference types returned by the backend.
// Values match backend/src/utils/normalizeReferences.js: QURAN | HADITH | OTHER.
const REFERENCE_TYPE_LABELS = {
  QURAN: 'Quran',
  HADITH: 'Hadith',
  OTHER: 'Other',
};

// QuestionDetailPage — full view of one question the user owns.
//
// Fetch strategy (decision 1):
//   1. GET /questions/:id
//   2. If question.status === 'ANSWERED', also GET /questions/:id/answer
//
// The answer fetch is conditional because:
//   - The endpoint 404s both for "no answer yet" AND "wrong owner" — we
//     cannot distinguish, so we only call it when we know an answer exists.
//   - For 4 of the 5 statuses, no answer exists — no point hitting the API.
//
// 404 from /questions/:id means "not found OR not yours" — backend deliberately
// hides existence info (account enumeration protection). We show the same
// message for both.

export default function QuestionDetailPage() {
  const { id } = useParams();

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  const [answer, setAnswer] = useState(null);
  const [answerLoading, setAnswerLoading] = useState(false);
  const [answerError, setAnswerError] = useState('');

  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      setNotFound(false);
      setAnswer(null);
      setAnswerError('');

      try {
        const questionData = await api.get(`/questions/${id}`);
        if (cancelled) return;

        setQuestion(questionData.question);
        setLoading(false);

        if (questionData.question.status === 'ANSWERED') {
          setAnswerLoading(true);
          try {
            const answerData = await api.get(`/questions/${id}/answer`);
            if (!cancelled) setAnswer(answerData.answer);
          } catch (err) {
            if (cancelled) return;
            if (err instanceof ApiError && err.status === 401) return;
            if (err instanceof ApiError && err.status === 404) {
              setAnswerError('Answer details are unavailable right now.');
            } else if (err instanceof ApiError) {
              setAnswerError(err.message || 'Could not load the answer.');
            } else {
              setAnswerError('Could not reach the server.');
            }
          } finally {
            if (!cancelled) setAnswerLoading(false);
          }
        }
      } catch (err) {
        if (cancelled) return;

        if (err instanceof ApiError && err.status === 401) return;

        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else if (err instanceof ApiError) {
          setError(err.message || 'Could not load this question.');
        } else {
          setError(
            'Could not reach the server. Check your connection and try again.'
          );
        }
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id, retryToken]);

  function handleRetry() {
    setRetryToken((t) => t + 1);
  }

  return (
    <main className="min-h-screen bg-bg text-text px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4">
          <Link
            to="/my-questions"
            className={
              'rounded-base px-2 py-1 text-sm font-medium text-muted ' +
              'transition-colors hover:text-text ' +
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
            }
          >
            ← Back to my questions
          </Link>
        </div>

        {loading && (
          <Card>
            <div
              className="flex items-center gap-3 text-sm text-muted"
              role="status"
              aria-live="polite"
            >
              <Spinner className="h-5 w-5" />
              <span>Loading question…</span>
            </div>
          </Card>
        )}

        {!loading && notFound && (
          <Card>
            <p className="text-sm font-semibold text-text">Question not found</p>
            <p className="mt-1 text-sm text-muted">
              This question does not exist, or it does not belong to your account.
            </p>
            <div className="mt-4">
              <Link
                to="/my-questions"
                className={
                  'inline-block rounded-base bg-accent px-4 py-2 text-sm font-medium text-accent-text ' +
                  'transition-colors hover:bg-accent-hover ' +
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
                }
              >
                Back to my questions
              </Link>
            </div>
          </Card>
        )}

        {!loading && !notFound && error && (
          <div className="flex flex-col gap-3">
            <Alert variant="danger" title="Could not load question">
              {error}
            </Alert>
            <div>
              <Button variant="secondary" size="sm" onClick={handleRetry}>
                Retry
              </Button>
            </div>
          </div>
        )}

        {!loading && !notFound && !error && question && (
          <div className="flex flex-col gap-4">
            <header>
              <h1 className="text-2xl font-semibold tracking-tight text-text">
                {question.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge
                  variant={STATUS_BADGE_VARIANT[question.status] || 'default'}
                >
                  {STATUS_LABELS[question.status] || question.status}
                </Badge>
                <time
                  dateTime={question.createdAt}
                  className="text-xs text-muted"
                >
                  Submitted {formatDate(question.createdAt)}
                </time>
              </div>
            </header>

            <Card>
              <p className="whitespace-pre-wrap text-sm text-text">
                {question.body}
              </p>
            </Card>

            {question.status === 'NEEDS_CLARIFICATION' && (
              <Alert variant="warning" title="More information requested">
                The scholar has requested more information about your question.
                There is currently no way to respond through the app.
              </Alert>
            )}

            {question.status === 'ANSWERED' && (
              <>
                {answerLoading && (
                  <Card>
                    <div
                      className="flex items-center gap-3 text-sm text-muted"
                      role="status"
                      aria-live="polite"
                    >
                      <Spinner className="h-5 w-5" />
                      <span>Loading answer…</span>
                    </div>
                  </Card>
                )}

                {!answerLoading && answerError && (
                  <Alert variant="danger" title="Could not load answer">
                    {answerError}
                  </Alert>
                )}

                {!answerLoading && !answerError && answer && (
                  <Card title="Published answer">
                    <p className="whitespace-pre-wrap text-sm text-text">
                      {answer.body}
                    </p>

                    {Array.isArray(answer.references) && answer.references.length > 0 && (
                      <div className="mt-4 border-t border-border pt-4">
                        <p className="text-xs font-semibold text-muted">References</p>
                        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-text">
                          {answer.references.map((ref, index) => (
                            <li key={index}>
                              <span className="font-medium">
                                {REFERENCE_TYPE_LABELS[ref.type] || ref.type}:
                              </span>{' '}
                              {ref.citation}
                              {ref.text && (
                                <p className="mt-1 whitespace-pre-wrap text-xs text-muted">
                                  {ref.text}
                                </p>
                              )}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    <p className="mt-3 text-xs text-muted">
                      Answered by {answer.scholar.fullName} ·{' '}
                      {formatDate(answer.createdAt)}
                    </p>
                  </Card>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}