export function Badge({ className = '', tone = 'neutral', children, ...props }) {
  return (
    <span className={`ui-badge ui-badge-${tone} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}
