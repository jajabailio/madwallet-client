import {
  Table as MuiTable,
  Paper,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import type { TTableContent } from '../../types';
import type { TTableData } from '../../types/table';
import EmptyState from './EmptyState';

type TProps = {
  headers: TTableContent[];
  data: TTableData[];
  onRowClick?: (rowKey: number | string) => void;
  emptyMessage?: string;
};

const DataTable = ({ headers, data, onRowClick, emptyMessage = 'No data available' }: TProps) => {
  // Show empty state if no data
  if (data.length === 0) {
    return (
      <Paper>
        <EmptyState message={emptyMessage} />
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <MuiTable>
        <TableHead>
          <TableRow>
            {headers.map((header) => (
              <TableCell key={header.key} sx={{ fontWeight: 'bold' }}>
                {header.content}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item) => (
            <TableRow
              key={item.key}
              hover
              onClick={() => onRowClick?.(item.key)}
              sx={{
                cursor: onRowClick ? 'pointer' : 'default',
                '&:hover': onRowClick
                  ? {
                      bgcolor: 'action.hover',
                    }
                  : undefined,
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
