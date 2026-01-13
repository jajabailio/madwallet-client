import type { SxProps, Theme } from '@mui/material';

export const styles = {
  container: {
    maxWidth: 600,
    mx: 'auto',
  } as SxProps<Theme>,

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 3,
  } as SxProps<Theme>,

  headerIcon: {
    fontSize: 32,
  } as SxProps<Theme>,

  section: {
    p: 3,
    mb: 3,
  } as SxProps<Theme>,

  sectionTitle: {
    fontWeight: 'medium',
  } as SxProps<Theme>,

  divider: {
    my: 2,
  } as SxProps<Theme>,

  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    py: 1,
  } as SxProps<Theme>,

  dangerSection: {
    p: 3,
    border: '1px solid',
    borderColor: 'error.main',
  } as SxProps<Theme>,

  dangerTitle: {
    fontWeight: 'medium',
    color: 'error.main',
  } as SxProps<Theme>,

  dangerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 2,
    flexWrap: 'wrap',
  } as SxProps<Theme>,

  deleteButton: {
    flexShrink: 0,
  } as SxProps<Theme>,

  dialogTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  } as SxProps<Theme>,

  dialogIcon: {
    fontSize: 28,
  } as SxProps<Theme>,

  deleteList: {
    mt: 2,
    mb: 2,
    pl: 3,
    '& li': {
      mb: 0.5,
    },
  } as SxProps<Theme>,

  warningText: {
    fontWeight: 'bold',
    color: 'error.main',
  } as SxProps<Theme>,

  dialogActions: {
    px: 3,
    pb: 2,
  } as SxProps<Theme>,
};
