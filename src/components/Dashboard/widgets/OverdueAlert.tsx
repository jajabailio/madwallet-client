import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import type { Expense } from '../../../types';
import { formatCurrency } from '../../../utils';

interface OverdueAlertProps {
  overdueExpenses: Expense[];
  overdueTotal: number;
  onPayExpense: (expense: Expense) => void;
  onViewAll?: () => void;
}

const OverdueAlert = ({
  overdueExpenses,
  overdueTotal,
  onPayExpense,
  onViewAll,
}: OverdueAlertProps) => {
  const hasOverdue = overdueExpenses.length > 0;

  if (!hasOverdue) {
    return (
      <Card
        sx={{
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          color: 'white',
          height: '100%',
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <ErrorOutlineIcon sx={{ fontSize: 40, mr: 2, opacity: 0.9 }} />
            <Typography variant="h6" sx={{ fontWeight: 500, opacity: 0.9 }}>
              No Overdue Payments
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            All caught up!
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            You have no overdue expenses. Great job!
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        color: 'white',
        height: '100%',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <ErrorOutlineIcon sx={{ fontSize: 40, mr: 2, opacity: 0.9 }} />
          <Typography variant="h6" sx={{ fontWeight: 500, opacity: 0.9 }}>
            Overdue Payments
          </Typography>
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
          {formatCurrency(overdueTotal)}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
          {overdueExpenses.length} overdue {overdueExpenses.length === 1 ? 'expense' : 'expenses'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {overdueExpenses.length === 1 && (
            <Button
              variant="contained"
              size="small"
              onClick={() => onPayExpense(overdueExpenses[0])}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
              }}
            >
              Pay Now
            </Button>
          )}
          {onViewAll && overdueExpenses.length > 1 && (
            <Button
              variant="contained"
              size="small"
              onClick={onViewAll}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
              }}
            >
              View All
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default OverdueAlert;
