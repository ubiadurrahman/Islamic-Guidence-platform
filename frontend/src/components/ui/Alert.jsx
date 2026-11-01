// Alert — banner for info / success / warning / error messages.
//
// Props:
//   variant    'info' (default) | 'success' | 'warning' | 'danger'
//   title      optional string — bolded headline
//   onDismiss  optional () => void — if provided, shows an × button
//   children   message body
//   ...rest    passed through to <div> (id, aria-live, etc.)
//
// Accessibility:
//   - 'danger' and 'warning' use role="alert" (interrupts screen reader)
//   - 'info' and 'success' use role="status" (polite)
//   - Dismiss button has aria-label="Dismiss" so screen reader knows what it does

const VARIANT_CLASSES = {
  info: 'border-accent bg-bg text-text',
  success: 'border-success bg-bg text-text',
  warning: 'border-warning bg-bg text-text',
  danger: 'border-danger bg-bg text-text',
};

const VARIANT_TITLE_CLASSES = {
  info: 'text-accent',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
};

const VARIANT_ROLES = {
  info: 'status',
  success: 'status',
  warning: 'alert',
  danger: 'alert',
};

export default function Alert({
  variant = 'info',
  title,
  onDismiss,
  className = '',
  children,
  ...rest
}) {
  const variantClasses = VARIANT_CLASSES[variant] || VARIANT_CLASSES.info;
  const titleClasses = VARIANT_TITLE_CLASSES[variant] || VARIANT_TITLE_CLASSES.info;
  const role = VARIANT_ROLES[variant] || 'status';

  return (
    <div
      role={role}
      className={
        'flex items-start gap-3 rounded-base border-l-4 border-y border-r ' +
        'border-border px-4 py-3 text-sm ' +
        `${variantClasses} ${className}`
      }
      {...rest}
    >
      <div className="flex-1">
        {title && <p className={`font-semibold ${titleClasses}`}>{title}</p>}
        <div className={title ? 'mt-1' : ''}>{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className={
            'shrink-0 rounded p-0.5 text-muted ' +
            'transition-colors hover:text-text ' +
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
          }
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      )}
    </div>
  );
}