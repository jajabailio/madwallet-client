import { Box, FormHelperText, Grid, Typography } from '@mui/material';
import { CATEGORY_COLORS } from '../../constants/colors';

interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
  error?: string;
  label?: string;
  required?: boolean;
}

const ColorPicker = ({ value, onChange, error, label, required }: ColorPickerProps) => {
  return (
    <Grid size={12}>
      <Box>
        {label && (
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            {label}
            {required && ' *'}
          </Typography>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 1.5,
            p: 2,
            border: error ? '1px solid #d32f2f' : '1px solid #e0e0e0',
            borderRadius: 1,
            backgroundColor: '#fafafa',
          }}
        >
          {CATEGORY_COLORS.map((color) => (
            <Box
              key={color.value}
              onClick={() => onChange(color.value)}
              sx={{
                width: '100%',
                paddingBottom: '100%',
                position: 'relative',
                cursor: 'pointer',
                borderRadius: 1,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                },
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: color.value,
                  borderRadius: 1,
                  border: value === color.value ? '3px solid #1976d2' : '2px solid rgba(0,0,0,0.1)',
                  boxShadow:
                    value === color.value
                      ? '0 0 0 3px rgba(25, 118, 210, 0.2)'
                      : '0 2px 4px rgba(0,0,0,0.1)',
                }}
                title={color.name}
              />
            </Box>
          ))}
        </Box>

        {error && (
          <FormHelperText error sx={{ mt: 0.5 }}>
            {error}
          </FormHelperText>
        )}
      </Box>
    </Grid>
  );
};

export default ColorPicker;
