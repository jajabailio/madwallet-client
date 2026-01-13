import type { SxProps, Theme } from '@mui/material';

export const styles = {
  container: {} as SxProps<Theme>,

  header: {
    mb: 3,
    fontWeight: 'bold',
  } as SxProps<Theme>,

  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    py: 8,
  } as SxProps<Theme>,
};
