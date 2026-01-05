import type { ReactNode } from 'react';

export type TTableContent = {
  key: string | number;
  content: ReactNode;
  /** For headers: whether this column is sortable */
  sortable?: boolean;
  /** For data rows: the value to sort by (use when content is JSX) */
  sortValue?: string | number | Date | null;
};

export type TTableData = { key: string | number; rows: TTableContent[] };

export type SortDirection = 'asc' | 'desc';
