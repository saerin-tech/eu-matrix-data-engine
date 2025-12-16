import { ReactNode, HTMLAttributes } from 'react';


// TABLE CONTAINER

interface TableProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Table({ children, ...props }: TableProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden" {...props}>
      <div className="overflow-x-auto">
        <table className="w-full">
          {children}
        </table>
      </div>
    </div>
  );
}

// TABLE HEADER

interface TableHeaderProps {
  children: ReactNode;
  align?: 'left' | 'center' | 'right';
}

export function TableHeader({ children, align = 'left' }: TableHeaderProps) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[align];

  return (
    <th className={`px-6 py-3 ${alignClass} text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100 border-b-2 border-gray-300`}>
      {children}
    </th>
  );
}

// TABLE CELL

interface TableCellProps {
  children: ReactNode;
  align?: 'left' | 'center' | 'right';
  colSpan?: number;
}

export function TableCell({ children, align = 'left', colSpan }: TableCellProps) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[align];

  return (
    <td 
      className={`px-6 py-4 text-sm text-gray-800 border-b border-gray-200 ${alignClass}`}
      colSpan={colSpan}
    >
      {children}
    </td>
  );
}


// TABLE ROW


interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
  hoverable?: boolean;
}

export function TableRow({ children, hoverable = true, ...props }: TableRowProps) {
  const hoverClass = hoverable ? 'hover:bg-gray-50 transition-colors' : '';
  
  return (
    <tr className={hoverClass} {...props}>
      {children}
    </tr>
  );
}

// EMPTY STATE

interface EmptyStateProps {
  message?: string;
  icon?: ReactNode;
  colSpan?: number;
}

export function EmptyState({ message = 'No data found', icon, colSpan }: EmptyStateProps) {
  return (
    <TableCell colSpan={colSpan} align="center">
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        {icon}
        <p className="mt-2">{message}</p>
      </div>
    </TableCell>
  );
}