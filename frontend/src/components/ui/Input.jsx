import { useId } from 'react';

// Input — labelled text input with inline validation feedback.
//
// Props:
//   label        string (required) — rendered as <label htmlFor={id}>
//   error        string | undefined — shows below input in danger colour,
//                sets aria-invalid + aria-describedby on the input
//   hint         string | undefined — helper text shown only when no error
//   required     boolean — adds red asterisk + aria-required
//   id           string (optional) — auto-generated via useId if omitted
//   ...rest      passed through to <input> (type, value, onChange, etc.)
//
// Accessibility:
//   - label is always present and associated
//   - error is associated via aria-describedby and announced when field is focused
//   - aria-invalid is set when error is present
//   - required is announced by screen readers
//
// Usage:
//   <Input label="Email" type="email" value={email} onChange={...} />
//   <Input label="Password" type="password" error="Too short" required />

export default function Input({
  label,
  error,
  hint,
  required = false,
  id: idProp,
  className = '',
  ...rest
}) {
  const autoId = useId();
  const id = idProp || autoId;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const describedBy = error ? errorId : hint ? hintId : undefined;

  const inputBorderClass = error
    ? 'border-danger focus-visible:ring-danger'
    : 'border-border focus-visible:ring-accent';

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-text">
        {label}
        {required && (
          <span className="ml-1 text-danger" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        id={id}
        className={
          'rounded-base border bg-surface px-3 py-2 text-sm text-text ' +
          'placeholder:text-muted ' +
          'transition-colors ' +
          'focus:outline-none focus-visible:ring-2 ' +
          'disabled:opacity-60 disabled:cursor-not-allowed ' +
          `${inputBorderClass} ${className}`
        }
        required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy}
        {...rest}
      />
      {error && (
        <p id={errorId} className="text-xs text-danger">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}