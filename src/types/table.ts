import type { ReactNode } from 'react';

export type TTableContent = {
  key: string | number;
  content: ReactNode;
  /** For headers: whether this column is sortable */
  sortable?: boolean;
  /** For data rows: the value to sort by (use when content is JSX) */
  sortValue?: string | number | Date | null;
  /** Hide this column/row on mobile devices */
  hiddenOnMobile?: boolean;
  /** Skip rendering on mobile if content is empty (null, undefined, or '-') */
  hideIfEmpty?: boolean;
};

export type TTableData = { key: string | number; rows: TTableContent[] };

export type SortDirection = 'asc' | 'desc';
