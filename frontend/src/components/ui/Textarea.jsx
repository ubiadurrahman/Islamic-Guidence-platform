import { useId } from 'react';

// Textarea — multi-line peer of Input.jsx.
//
// Same props and accessibility wiring as Input, plus:
//   rows       number (default 6) — initial visible height
//   showCount  boolean — shows "X / maxLength" below the field
//              when both showCount and maxLength are provided.
//
// Usage:
//   <Textarea label="Body" required rows={8} maxLength={5000} showCount
//             value={body} onChange={...} error={fieldErrors.body} />

export default function Textarea({
  label,
  error,
  hint,
  required = false,
  id: idProp,
  className = '',
  rows = 6,
  showCount = false,
  maxLength,
  value,
  ...rest
}) {
  const autoId = useId();
  const id = idProp || autoId;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const describedBy = error ? errorId : hint ? hintId : undefined;

  const borderClass = error
    ? 'border-danger focus-visible:ring-danger'
    : 'border-border focus-visible:ring-accent';

  // Counter is only meaningful when we know a limit AND have the current value.
  const showCounter =
    showCount && typeof maxLength === 'number' && typeof value === 'string';

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
      <textarea
        id={id}
        rows={rows}
        maxLength={maxLength}
        value={value}
        className={
          'rounded-base border bg-surface px-3 py-2 text-sm text-text ' +
          'placeholder:text-muted ' +
          'transition-colors resize-y ' +
          'focus:outline-none focus-visible:ring-2 ' +
          'disabled:opacity-60 disabled:cursor-not-allowed ' +
          `${borderClass} ${className}`
        }
        required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy}
        {...rest}
      />
      {(error || hint || showCounter) && (
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            {error ? (
              <p id={errorId} className="text-xs text-danger">{error}</p>
            ) : hint ? (
              <p id={hintId} className="text-xs text-muted">{hint}</p>
            ) : null}
          </div>
          {showCounter && (
            <p className="shrink-0 text-xs text-muted tabular-nums" aria-hidden="true">
              {value.length} / {maxLength}
            </p>
          )}
        </div>
      )}
    </div>
  );
}