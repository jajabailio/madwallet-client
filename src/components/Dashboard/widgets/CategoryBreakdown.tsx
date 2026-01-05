import CategoryIcon from '@mui/icons-material/Category';
import { Box, Card, CardContent, Chip, Typography } from '@mui/material';
import type { CategoryTotal } from '../../../types';
import { formatCurrency } from '../../../utils';
import CategoryPieChart from '../charts/CategoryPieChart';

interface CategoryBreakdownProps {
  categoryTotals: CategoryTotal[];
}

const CategoryBreakdown = ({ categoryTotals }: CategoryBreakdownProps) => {
  const totalSpent = categoryTotals.reduce((sum, cat) => sum + cat.totalCents, 0);
  const topCategories = categoryTotals.slice(0, 5);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CategoryIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Spending by Category
            </Typography>
          </Box>
          <Chip label="This Month" size="small" variant="outlined" />
        </Box>

        {categoryTotals.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <Typography variant="body1">No expenses this month</Typography>
            <Typography variant="body2">Start tracking your spending!</Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
              <CategoryPieChart data={topCategories} />
            </Box>

            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total Spent
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(totalSpent)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
              {topCategories.map((cat) => (
                <Chip
                  key={cat.categoryId}
                  label={`${cat.categoryName}: ${cat.percentage}%`}
                  size="small"
                  sx={{
                    bgcolor: cat.color,
                    color: '#fff',
                    fontWeight: 500,
                  }}
                />
              ))}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryBreakdown;
