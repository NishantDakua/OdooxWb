export function Skeleton({ className = '', ...props }) {
  return <div className={`ui-skeleton ${className}`.trim()} {...props} />;
}
