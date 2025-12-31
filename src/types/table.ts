import type { ReactNode } from 'react';

export type TTableContent = { key: string | number; content: ReactNode };

export type TTableData = { key: string | number; rows: TTableContent[] };
