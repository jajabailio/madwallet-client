import { createTheme, type PaletteMode } from '@mui/material/styles';

/**
 * Mad Wallet - Modern, Sleek Theme
 * Clean, professional design that's easy on the eyes
 * Supports both light and dark modes
 */

export const getTheme = (mode: PaletteMode) =>
  createTheme({
    // Color Palette - Deep purple with modern accents
    palette: {
      mode,
      primary: {
        main: '#6002ee', // Deep purple
        light: '#7c4dff',
        dark: '#4a00b4',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#03dac6', // Teal accent
        light: '#66fff9',
        dark: '#00a896',
        contrastText: '#000000',
      },
      error: {
        main: '#ef4444',
        light: '#f87171',
        dark: '#dc2626',
      },
      warning: {
        main: '#f59e0b',
        light: '#fbbf24',
        dark: '#d97706',
      },
      success: {
        main: '#10b981',
        light: '#34d399',
        dark: '#059669',
      },
      info: {
        main: '#3b82f6',
        light: '#60a5fa',
        dark: '#2563eb',
      },
      background: {
        default: mode === 'light' ? '#f8fafc' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
      text: {
        primary: mode === 'light' ? '#1e293b' : '#e2e8f0',
        secondary: mode === 'light' ? '#64748b' : '#94a3b8',
      },
      divider: mode === 'light' ? '#e2e8f0' : '#2d3748',
    },

    // Typography - Sleek, modern font stack
    typography: {
      fontFamily: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
        letterSpacing: '-0.02em',
      },
      h2: {
        fontWeight: 700,
        fontSize: '2rem',
        letterSpacing: '-0.01em',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.75rem',
        letterSpacing: '-0.01em',
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
        letterSpacing: '-0.01em',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.25rem',
      },
      h6: {
        fontWeight: 600,
        fontSize: '1.125rem',
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
      button: {
        fontWeight: 500,
        textTransform: 'none', // No uppercase buttons - more modern
        letterSpacing: '0.01em',
      },
    },

    // Spacing & Shape
    shape: {
      borderRadius: 12, // Rounded corners for modern look
    },

    // Component Overrides
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '10px 24px',
            fontSize: '0.9375rem',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            },
          },
          contained: {
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.1)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none', // Remove default MUI gradient
          },
          rounded: {
            borderRadius: 12,
          },
          elevation1: {
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 10,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: mode === 'light' ? '1px solid #e2e8f0' : '1px solid #2d3748',
          },
          head: {
            fontWeight: 600,
            backgroundColor: mode === 'light' ? '#f8fafc' : '#1a1a1a',
          },
        },
      },
    },
  });

// Default export for backward compatibility (light mode)
export default getTheme('light');
