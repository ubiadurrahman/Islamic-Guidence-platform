// Badge — small status pill.
//
// Props:
//   variant  'default' | 'info' | 'success' | 'warning' | 'danger'
//   children — the label text
//   ...rest  passed through to <span> (title, aria-*, etc.)
//
// Intended usage maps to QuestionStatus:
//   PENDING              → default
//   UNDER_REVIEW         → info
//   NEEDS_CLARIFICATION  → warning
//   ANSWERED             → success
//   CLOSED               → default
//
// All colours come from theme tokens, so dark mode flips automatically.

const VARIANTS = {
  default: 'bg-bg text-text border-border',
  info: 'bg-bg text-accent border-accent',
  success: 'bg-bg text-success border-success',
  warning: 'bg-bg text-warning border-warning',
  danger: 'bg-bg text-danger border-danger',
};

export default function Badge({ variant = 'default', className = '', children, ...rest }) {
  const variantClasses = VARIANTS[variant] || VARIANTS.default;

  return (
    <span
      className={
        'inline-flex items-center rounded-full border px-2 py-0.5 ' +
        'text-xs font-medium ' +
        `${variantClasses} ${className}`
      }
      {...rest}
    >
      {children}
    </span>
  );
}