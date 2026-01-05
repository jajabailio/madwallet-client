import type { SxProps, Theme } from '@mui/material';

export const SIDEBAR_WIDTH = 240;

export const styles = {
  permanentDrawer: {
    width: SIDEBAR_WIDTH,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
      width: SIDEBAR_WIDTH,
      boxSizing: 'border-box',
      borderRight: '1px solid',
      borderColor: 'divider',
    },
  } as SxProps<Theme>,

  temporaryDrawer: {
    '& .MuiDrawer-paper': {
      width: SIDEBAR_WIDTH,
      boxSizing: 'border-box',
    },
  } as SxProps<Theme>,

  drawerContent: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  } as SxProps<Theme>,

  toolbarSpacer: {
    minHeight: 64,
  } as SxProps<Theme>,

  brandSection: {
    px: 2,
    py: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  } as SxProps<Theme>,

  navList: {
    px: 1,
    py: 1,
  } as SxProps<Theme>,

  navItem: {
    borderRadius: 1,
    mb: 0.5,
    '&.Mui-selected': {
      bgcolor: 'primary.main',
      color: 'primary.contrastText',
      '&:hover': {
        bgcolor: 'primary.dark',
      },
      '& .MuiListItemIcon-root': {
        color: 'inherit',
      },
    },
  } as SxProps<Theme>,

  navIcon: {
    minWidth: 40,
  } as SxProps<Theme>,
};
