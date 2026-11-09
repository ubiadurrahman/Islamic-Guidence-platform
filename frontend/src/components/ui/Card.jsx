// Card — a surface panel for grouping related content.
//
// Slots (all optional):
//   title    string — renders as a heading in the header, with bottom border
//   footer   ReactNode — renders below the content, with top border
//   children — main content, padded
//
// Example:
//   <Card title="My questions">List goes here</Card>
//   <Card footer={<Button>Save</Button>}>Form goes here</Card>

export default function Card({ title, footer, className = '', children, ...rest }) {
  return (
    <div
      className={`rounded-base border border-border bg-surface ${className}`}
      {...rest}
    >
      {title && (
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-text">{title}</h2>
        </div>
      )}
      <div className="px-4 py-4">{children}</div>
      {footer && (
        <div className="border-t border-border px-4 py-3">{footer}</div>
      )}
    </div>
  );
}