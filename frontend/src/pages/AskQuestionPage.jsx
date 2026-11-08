import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/ui/Card.jsx';
import Input from '../components/ui/Input.jsx';
import Textarea from '../components/ui/Textarea.jsx';
import Button from '../components/ui/Button.jsx';
import Alert from '../components/ui/Alert.jsx';

// Backend validation constants — kept in one place so the client mirrors
// the server's rules. If the backend rules ever change, they change HERE too.
// This is a mirror, not a source of truth: the server still rejects anything
// that slips through, and any 422 from the server overrides our local errors.
const TITLE_MIN = 5;
const TITLE_MAX = 200;
const BODY_MIN = 10;
const BODY_MAX = 5000;

function validateForm(title, body) {
  const errors = {};
  const trimmedTitle = title.trim();
  const trimmedBody = body.trim();

  if (!trimmedTitle) {
    errors.title = 'Title is required.';
  } else if (trimmedTitle.length < TITLE_MIN || trimmedTitle.length > TITLE_MAX) {
    errors.title = `Title must be between ${TITLE_MIN} and ${TITLE_MAX} characters.`;
  }

  if (!trimmedBody) {
    errors.body = 'Question body is required.';
  } else if (trimmedBody.length < BODY_MIN || trimmedBody.length > BODY_MAX) {
    errors.body = `Question body must be between ${BODY_MIN} and ${BODY_MAX} characters.`;
  }

  return errors;
}

export default function AskQuestionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [topError, setTopError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Defence-in-depth. ProtectedRoute guarantees this; kept to prevent a
  // crash if a future refactor moves the guard.
  if (!user) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    setTopError('');

    const clientErrors = validateForm(title, body);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);

    try {
      await api.post('/questions', {
        title: title.trim(),
        body: body.trim(),
      });
      navigate('/my-questions', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        // AuthContext already reacts to 401 by clearing session and
        // redirecting; this page will unmount. Swallow silently.
        if (err.status === 401) return;

        // Server validation — should be rare because we mirror it, but
        // the server is authoritative. Display inline.
        if (err.status === 422 && err.fields) {
          setFieldErrors(err.fields);
          setSubmitting(false);
          return;
        }

        setTopError(err.message || 'Something went wrong. Please try again.');
      } else {
        setTopError('Could not reach the server. Check your connection and try again.');
      }
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-bg text-text px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-text">
            Ask a question
          </h1>
          <p className="mt-1 text-sm text-muted">
            Your question will be reviewed by a scholar before an answer is provided.
          </p>
        </header>

        {topError && (
          <div className="mb-4">
            <Alert
              variant="danger"
              title="Could not submit question"
              onDismiss={() => setTopError('')}
            >
              {topError}
            </Alert>
          </div>
        )}

        <Card>
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <Input
              label="Title"
              required
              maxLength={TITLE_MAX}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={fieldErrors.title}
              hint={`${TITLE_MIN}–${TITLE_MAX} characters`}
              autoFocus
            />

            <Textarea
              label="Question body"
              required
              rows={8}
              maxLength={BODY_MAX}
              showCount
              value={body}
              onChange={(e) => setBody(e.target.value)}
              error={fieldErrors.body}
              hint={`${BODY_MIN}–${BODY_MAX} characters. Include relevant context so the scholar can give a useful answer.`}
            />

            <div className="flex items-center justify-end gap-3">
              <Link
                to="/dashboard"
                className={
                  'rounded-base px-3 py-2 text-sm font-medium text-muted ' +
                  'transition-colors hover:text-text ' +
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
                }
              >
                Cancel
              </Link>
              <Button type="submit" loading={submitting}>
                Submit question
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}