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
  Typography,
  useMediaQuery,
  useTheme,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Show empty state if no data
  if (data.length === 0) {
    return (
      <Paper>
        <EmptyState message={emptyMessage} />
      </Paper>
    );
  }

  // Mobile: Card View
  if (isMobile) {
    return (
      <Stack spacing={2}>
        {data.map((item) => (
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

  // Desktop: Table View
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
