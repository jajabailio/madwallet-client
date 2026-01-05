import type { SxProps, Theme } from '@mui/material';

export const styles = {
  drawer: {
    width: { xs: '100vw', sm: 500 },
    p: { xs: 2, sm: 3 },
    maxHeight: '100vh',
    overflowY: 'auto',
  } as SxProps<Theme>,

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 3,
  } as SxProps<Theme>,

  divider: {
    mb: 3,
  } as SxProps<Theme>,

  summarySection: {
    mb: 3,
    p: 2,
    bgcolor: 'background.default',
    borderRadius: 1,
    textAlign: 'center',
  } as SxProps<Theme>,

  summaryAmount: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'error.main',
  } as SxProps<Theme>,

  summaryCount: {
    fontSize: '0.875rem',
    color: 'text.secondary',
    mt: 0.5,
  } as SxProps<Theme>,

  urgencyGroup: {
    mb: 3,
  } as SxProps<Theme>,

  urgencyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 1,
    pb: 1,
    borderBottom: '2px solid',
  } as SxProps<Theme>,

  urgencyTitle: {
    fontWeight: 'bold',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  } as SxProps<Theme>,

  urgencyTotal: {
    fontWeight: 'bold',
    fontSize: '0.9rem',
  } as SxProps<Theme>,

  expensesList: {
    bgcolor: 'background.paper',
    borderRadius: 1,
    p: 0,
  } as SxProps<Theme>,

  expenseItem: {
    borderBottom: '1px solid',
    borderColor: 'divider',
    '&:last-child': { borderBottom: 'none' },
    py: 1.5,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': {
      bgcolor: 'action.hover',
    },
  } as SxProps<Theme>,

  expensePrimary: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as SxProps<Theme>,

  expenseDescription: {
    fontWeight: 500,
    maxWidth: '60%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as SxProps<Theme>,

  expenseAmount: {
    fontWeight: 'bold',
  } as SxProps<Theme>,

  expenseSecondary: {
    display: 'flex',
    gap: 1,
    alignItems: 'center',
    mt: 0.5,
    flexWrap: 'wrap',
  } as SxProps<Theme>,

  payButton: {
    minWidth: 'auto',
    px: 1.5,
    py: 0.5,
    fontSize: '0.75rem',
  } as SxProps<Theme>,

  emptyState: {
    textAlign: 'center',
    py: 8,
    color: 'text.secondary',
  } as SxProps<Theme>,
};
