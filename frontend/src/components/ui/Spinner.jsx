// Spinner — animated loading indicator.
// Respects prefers-reduced-motion: the global CSS rule in index.css
// short-circuits animation-duration, so it appears as a static circle
// for users who prefer reduced motion.
//
// Defaults: h-5 w-5 (20×20px). Colours inherit via currentColor, so
// put it inside an element with the desired `text-*` class.
//
// Usage:
//   <Spinner />                       // 20×20, current text colour
//   <Spinner className="h-4 w-4" />   // 16×16
//   <Spinner className="text-white" />// white on dark backgrounds

export default function Spinner({ className = '', ...rest }) {
  return (
    <svg
      className={`animate-spin h-5 w-5 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label="Loading"
      {...rest}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}