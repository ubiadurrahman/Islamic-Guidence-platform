import Spinner from './Spinner.jsx';

// Button — the standard action button.
//
// Props:
//   variant  'primary' (default) | 'secondary' | 'danger' | 'ghost'
//   size     'md' (default) | 'sm'
//   loading  boolean — shows a spinner and disables the button
//   disabled boolean — standard
//   ...rest  passed through to <button> (type, onClick, aria-*, etc.)
//
// All variants use the same shape and radius, differ only in colour and
// border. Focus ring uses accent colour, visible only on keyboard focus
// (focus-visible) so mouse users don't see the outline.

const BASE =
  'inline-flex items-center justify-center gap-2 ' +
  'font-medium rounded-base ' +
  'transition-colors ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
  'focus-visible:ring-accent focus-visible:ring-offset-bg ' +
  'disabled:opacity-60 disabled:cursor-not-allowed';

const SIZES = {
  md: 'px-4 py-2 text-sm',
  sm: 'px-3 py-1.5 text-xs',
};

const VARIANTS = {
  primary:
    'bg-accent text-accent-text border border-transparent ' +
    'hover:bg-accent-hover',
  secondary:
    'bg-surface text-text border border-border ' +
    'hover:bg-bg hover:border-accent',
  danger:
    'bg-danger text-danger-text border border-transparent ' +
    'hover:opacity-90',
  ghost:
    'bg-transparent text-text border border-transparent ' +
    'hover:bg-surface',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...rest
}) {
  const isDisabled = disabled || loading;
  const variantClasses = VARIANTS[variant] || VARIANTS.primary;
  const sizeClasses = SIZES[size] || SIZES.md;

  return (
    <button
      type="button"
      className={`${BASE} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={isDisabled}
      {...rest}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}