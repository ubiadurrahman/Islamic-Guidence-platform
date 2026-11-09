import { useId } from 'react';

// Input — labelled text input with inline validation feedback and an
// optional trailing adornment slot (e.g. show/hide password toggle).
//
// Props:
//   label          string (required) — rendered as <label htmlFor={id}>
//   error          string | undefined — shows below input in danger colour,
//                    sets aria-invalid + aria-describedby on the input
//   hint           string | undefined — helper text shown only when no error
//   required       boolean — adds red asterisk + aria-required
//   id             string (optional) — auto-generated via useId if omitted
//   rightAdornment ReactNode (optional) — rendered absolutely inside the
//                    input's own box, vertically centred on the right.
//                    The input reserves right padding when present so
//                    typed text never overlaps the adornment.
//   ...rest        passed through to <input> (type, value, onChange, etc.)
//
// Accessibility:
//   - label is always present and associated
//   - error is associated via aria-describedby and announced when field is focused
//   - aria-invalid is set when error is present
//   - required is announced by screen readers
//   - rightAdornment is positioned visually only; interactive adornments
//     (like a toggle button) must carry their own accessible name
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
  rightAdornment,
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

  const inputPaddingClass = rightAdornment ? 'pr-16' : '';

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
      <div className="relative">
        <input
          id={id}
          className={
            'w-full rounded-base border bg-surface px-3 py-2 text-sm text-text ' +
            'placeholder:text-muted ' +
            'transition-colors ' +
            'focus:outline-none focus-visible:ring-2 ' +
            'disabled:opacity-60 disabled:cursor-not-allowed ' +
            `${inputBorderClass} ${inputPaddingClass} ${className}`
          }
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          {...rest}
        />
        {rightAdornment && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightAdornment}
          </div>
        )}
      </div>
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