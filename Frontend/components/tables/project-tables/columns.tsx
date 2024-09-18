// columns.tsx

'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { User } from '@/constants/data';
import { format } from 'date-fns'; // Import the format function from date-fns

const marginClass = "ml-5"; // Tailwind CSS class for left margin

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: () => (
      <div className={marginClass}>
        NAME
      </div>
    ),
    cell: ({ getValue }) => (
      <div className={marginClass}>
        {getValue()}
      </div>
    )
  },
  {
    accessorKey: 'description',
    header: () => (
      <div className={marginClass}>
        DESCRIPTION
      </div>
    ),
    cell: ({ getValue }) => (
      <div className={marginClass}>
        {getValue()}
      </div>
    )
  },
  {
    accessorKey: 'createdAt',
    header: () => (
      <div className={marginClass}>
        UPLOADED
      </div>
    ),
    cell: ({ getValue }) => {
      const date = new Date(getValue() as number * 1000); // Convert from seconds to milliseconds
      return (
        <div className={marginClass}>
          {format(date, 'dd/MM/yyyy')}
        </div>
      );
    }
  },
  {
    id: 'actions',
    header: () => (
      <div className={marginClass}>
        ACTIONS
      </div>
    ),
    cell: ({ row }) => (
      <div className={marginClass}>
        <CellAction data={row.original} />
      </div>
    )
  }
];
