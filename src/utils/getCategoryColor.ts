const getCategoryColor = (category: string) => {
  const colorMap: Record<
    string,
    'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
  > = {
    Groceries: 'success',
    Transportation: 'info',
    Electronics: 'secondary',
    'Food & Dining': 'warning',
    Entertainment: 'secondary',
    'Health & Fitness': 'error',
  };
  return colorMap[category] || 'default';
};

export default getCategoryColor;
