import { useState } from 'react';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import Alert from '../components/ui/Alert.jsx';

// KitchenSinkPage — renders every UI component in every variant.
// Not user-facing; exists so we can visually verify the design system.
// Toggle theme in the navbar to check both palettes.
// To reach: http://localhost:5173/kitchen-sink

export default function KitchenSinkPage() {
  const [dismissed, setDismissed] = useState(false);
  const [demoEmail, setDemoEmail] = useState('');
  const emailError =
    demoEmail.length > 0 && !demoEmail.includes('@')
      ? 'Please enter a valid email address.'
      : undefined;

  return (
    <main className="min-h-screen bg-bg px-4 py-8 text-text">
      <div className="mx-auto max-w-3xl space-y-10">
        <header>
          <h1 className="text-2xl font-semibold">Design system — kitchen sink</h1>
          <p className="mt-1 text-sm text-muted">
            Not user-facing. Toggle the theme in the navbar to verify both palettes.
            Tab through controls to verify focus rings.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Buttons</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="ghost">Ghost</Button>
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
            <Button size="sm">Small</Button>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Inputs</h2>
          <div className="space-y-4 max-w-md">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={demoEmail}
              onChange={(e) => setDemoEmail(e.target.value)}
              error={emailError}
              hint="Try typing something without an @ to see the error state."
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              hint="At least 8 characters."
            />
            <Input label="Disabled" disabled value="Can't type here" readOnly />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Badges (question statuses)</h2>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">PENDING</Badge>
            <Badge variant="info">UNDER REVIEW</Badge>
            <Badge variant="warning">NEEDS CLARIFICATION</Badge>
            <Badge variant="success">ANSWERED</Badge>
            <Badge variant="default">CLOSED</Badge>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Alerts</h2>
          <div className="space-y-3">
            <Alert variant="info" title="Heads up">
              This is an informational message.
            </Alert>
            <Alert variant="success" title="Success">
              Your change was saved.
            </Alert>
            <Alert variant="warning" title="Please check">
              Something needs your attention before continuing.
            </Alert>
            <Alert
              variant="danger"
              title="Something went wrong"
              onDismiss={() => setDismissed(true)}
            >
              {dismissed
                ? 'You dismissed this alert. Refresh the page to see it again.'
                : 'This is an error message with a dismiss button. Click the × to remove it.'}
            </Alert>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Cards</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card title="With title">
              Plain body content.
            </Card>
            <Card title="With footer" footer={<Button size="sm">Action</Button>}>
              Body plus an action in the footer.
            </Card>
            <Card>
              No title, no footer — just a bordered panel.
            </Card>
            <Card title="Both" footer={<span className="text-sm text-muted">Footer text</span>}>
              Title, body, footer.
            </Card>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Spinner</h2>
          <div className="flex items-center gap-4 text-muted">
            <Spinner />
            <Spinner className="h-4 w-4" />
            <Spinner className="h-8 w-8 text-accent" />
            <span className="text-sm">Spinners inherit text colour.</span>
          </div>
        </section>
      </div>
    </main>
  );
}