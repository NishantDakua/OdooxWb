export function Button({ children, className = '', variant = 'default', type = 'button', ...props }) {
  return (
    <button type={type} className={`ui-button ui-button-${variant} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
