import {
  Box,
  Card,
  CardContent,
  Table as MuiTable,
  Paper,
  Stack,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useMemo, useState } from 'react';
import type { TTableContent } from '../../types';
import type { SortDirection, TTableData } from '../../types/table';
import EmptyState from './EmptyState';

type TProps = {
  headers: TTableContent[];
  data: TTableData[];
  onRowClick?: (rowKey: number | string) => void;
  emptyMessage?: string;
  /** Default sort column key */
  defaultSortKey?: string | number;
  /** Default sort direction */
  defaultSortDirection?: SortDirection;
};

const DataTable = ({
  headers,
  data,
  onRowClick,
  emptyMessage = 'No data available',
  defaultSortKey,
  defaultSortDirection = 'asc',
}: TProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [sortKey, setSortKey] = useState<string | number | null>(defaultSortKey ?? null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection);

  const handleSort = (key: string | number) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;

    const headerIndex = headers.findIndex((h) => h.key === sortKey);
    if (headerIndex === -1) return data;

    return [...data].sort((a, b) => {
      const aRow = a.rows[headerIndex];
      const bRow = b.rows[headerIndex];

      // Use sortValue if available, otherwise try to use content directly
      const aValue = aRow?.sortValue ?? aRow?.content;
      const bValue = bRow?.sortValue ?? bRow?.content;

      // Handle null/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
      if (bValue == null) return sortDirection === 'asc' ? -1 : 1;

      // Compare based on type
      let comparison = 0;

      if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else {
        // Convert to string for comparison
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, headers, sortKey, sortDirection]);

  // Show empty state if no data
  if (data.length === 0) {
    return (
      <Paper>
        <EmptyState message={emptyMessage} />
      </Paper>
    );
  }

  // Mobile: Card View (no sorting UI, but data is still sorted)
  if (isMobile) {
    return (
      <Stack spacing={2}>
        {sortedData.map((item) => (
          <Card
            key={item.key}
            onClick={() => onRowClick?.(item.key)}
            sx={{
              cursor: onRowClick ? 'pointer' : 'default',
              '&:hover': onRowClick ? { boxShadow: 3 } : undefined,
            }}
          >
            <CardContent>
              <Stack spacing={1.5}>
                {item.rows.map((row, index) => {
                  const header = headers[index];

                  // Skip if header is marked as hidden on mobile
                  if (header.hiddenOnMobile) return null;

                  // Skip if hideIfEmpty is set and content is empty
                  const isEmpty =
                    row.content === null ||
                    row.content === undefined ||
                    row.content === '-' ||
                    row.content === '';
                  if (header.hideIfEmpty && isEmpty) return null;

                  return (
                    <Box key={row.key}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mb: 0.5 }}
                      >
                        {header.content}
                      </Typography>
                      <Box>{row.content}</Box>
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  }

  // Desktop: Table View with sorting
  return (
    <TableContainer component={Paper}>
      <MuiTable>
        <TableHead>
          <TableRow>
            {headers.map((header) => (
              <TableCell key={header.key} sx={{ fontWeight: 'bold' }}>
                {header.sortable ? (
                  <TableSortLabel
                    active={sortKey === header.key}
                    direction={sortKey === header.key ? sortDirection : 'asc'}
                    onClick={() => handleSort(header.key)}
                  >
                    {header.content}
                  </TableSortLabel>
                ) : (
                  header.content
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.map((item) => (
            <TableRow
              key={item.key}
              hover
              onClick={() => onRowClick?.(item.key)}
              sx={{
                cursor: onRowClick ? 'pointer' : 'default',
                '&:hover': onRowClick ? { bgcolor: 'action.hover' } : undefined,
              }}
            >
              {item.rows.map((row) => (
                <TableCell key={row.key}>{row.content}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </MuiTable>
    </TableContainer>
  );
};

export default DataTable;
