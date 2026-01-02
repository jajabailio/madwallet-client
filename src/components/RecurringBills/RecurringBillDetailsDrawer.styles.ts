import type { SxProps, Theme } from '@mui/material';

export const styles = {
  drawer: {
    width: { xs: '100vw', sm: 500 },
    p: { xs: 2, sm: 3 },
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

  dividerSpacing: {
    my: 2,
  } as SxProps<Theme>,

  detailRow: {
    mb: 2,
  } as SxProps<Theme>,

  detailLabel: {
    display: 'block',
    mb: 0.5,
  } as SxProps<Theme>,

  totalAmount: {
    fontWeight: 'bold',
  } as SxProps<Theme>,

  gridTwoColumns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 2,
  } as SxProps<Theme>,

  categoryChip: {
    color: '#fff',
  } as SxProps<Theme>,

  actionButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  } as SxProps<Theme>,

  installmentsTitle: {
    mb: 1,
  } as SxProps<Theme>,

  installmentsList: {
    bgcolor: 'background.paper',
    borderRadius: 1,
    p: 0,
  } as SxProps<Theme>,

  installmentItem: {
    borderBottom: '1px solid',
    borderColor: 'divider',
    '&:last-child': { borderBottom: 'none' },
  } as SxProps<Theme>,

  installmentPrimary: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as SxProps<Theme>,

  installmentAmount: {
    fontWeight: 'bold',
  } as SxProps<Theme>,

  installmentSecondary: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mt: 0.5,
  } as SxProps<Theme>,

  installmentChip: {
    height: 20,
    fontSize: '0.7rem',
  } as SxProps<Theme>,
};
