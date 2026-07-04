export function Table({ className = '', children, ...props }) {
  return (
    <div className="ui-table-shell">
      <table className={`ui-table ${className}`.trim()} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ className = '', children, ...props }) {
  return (
    <thead className={className} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ className = '', children, ...props }) {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ className = '', children, ...props }) {
  return (
    <tr className={className} {...props}>
      {children}
    </tr>
  );
}

export function TableCell({ className = '', children, ...props }) {
  return (
    <td className={className} {...props}>
      {children}
    </td>
  );
}

export function TableHeader({ className = '', children, ...props }) {
  return (
    <th className={className} {...props}>
      {children}
    </th>
  );
}
