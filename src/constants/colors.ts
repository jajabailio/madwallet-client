// Predefined pastel colors for categories
// Using Material-UI 300 and 400 shades for nice, soft colors

export const CATEGORY_COLORS = [
  // Lighter shades
  { name: 'Light Red', value: '#ef9a9a' },
  { name: 'Light Orange', value: '#ffcc80' },
  { name: 'Light Violet', value: '#ce93d8' },
  { name: 'Light Blue', value: '#90caf9' },
  { name: 'Light Gray', value: '#b0bec5' },
  { name: 'Light Green', value: '#a5d6a7' },

  // Regular shades
  { name: 'Red', value: '#e57373' },
  { name: 'Orange', value: '#ffb74d' },
  { name: 'Violet', value: '#ba68c8' },
  { name: 'Blue', value: '#64b5f6' },
  { name: 'Gray', value: '#90a4ae' },
  { name: 'Green', value: '#81c784' },
] as const;

export const DEFAULT_CATEGORY_COLOR = CATEGORY_COLORS[3].value; // Light Blue

// Helper to validate if a color is in the predefined list
export const isValidCategoryColor = (color: string): boolean => {
  return CATEGORY_COLORS.some((c) => c.value === color);
};

// Get all color values for validation
export const CATEGORY_COLOR_VALUES = CATEGORY_COLORS.map((c) => c.value);
