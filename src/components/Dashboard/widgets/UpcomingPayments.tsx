import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ScheduleIcon from '@mui/icons-material/Schedule';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import type { Expense } from '../../../types';
import { formatCurrency, formatDate } from '../../../utils';

interface UpcomingPaymentsProps {
  expenses: Expense[];
  limit?: number;
  onPayExpense: (expense: Expense) => void;
  onViewAll?: () => void;
}

const UpcomingPayments = ({
  expenses,
  limit = 5,
  onPayExpense,
  onViewAll,
}: UpcomingPaymentsProps) => {
  const displayExpenses = expenses.slice(0, limit);
  const hasMore = expenses.length > limit;

  const getDaysUntilDue = (dueDate: Date): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getUrgencyColor = (daysUntil: number): 'error' | 'warning' | 'info' | 'default' => {
    if (daysUntil <= 0) return 'error';
    if (daysUntil <= 3) return 'warning';
    if (daysUntil <= 7) return 'info';
    return 'default';
  };

  const getUrgencyLabel = (daysUntil: number): string => {
    if (daysUntil === 0) return 'Today';
    if (daysUntil === 1) return 'Tomorrow';
    if (daysUntil <= 7) return `${daysUntil} days`;
    return `${daysUntil} days`;
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarTodayIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Upcoming Payments
            </Typography>
          </Box>
          <Chip label={`Next 30 days`} size="small" variant="outlined" />
        </Box>

        {displayExpenses.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <Typography variant="body1">No upcoming payments</Typography>
            <Typography variant="body2">You're all set for the next 30 days!</Typography>
          </Box>
        ) : (
          <>
            <List dense sx={{ p: 0 }}>
              {displayExpenses.map((expense) => {
                const daysUntil = expense.dueDate ? getDaysUntilDue(expense.dueDate) : 0;
                return (
                  <ListItem
                    key={expense.id}
                    sx={{
                      px: 0,
                      py: 1.5,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 'none' },
                    }}
                    secondaryAction={
                      <Button size="small" variant="outlined" onClick={() => onPayExpense(expense)}>
                        Pay
                      </Button>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {expense.description}
                          </Typography>
                          {expense.purchase && expense.installmentNumber && (
                            <Chip
                              label={`${expense.installmentNumber}/${expense.purchase.installmentCount}`}
                              size="small"
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <ScheduleIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {expense.dueDate ? formatDate(expense.dueDate) : 'No due date'}
                          </Typography>
                          <Chip
                            label={getUrgencyLabel(daysUntil)}
                            size="small"
                            color={getUrgencyColor(daysUntil)}
                            sx={{ height: 18, fontSize: '0.65rem' }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 'bold', ml: 'auto', mr: 8 }}
                          >
                            {formatCurrency(expense.amountCents)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>

            {hasMore && onViewAll && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button size="small" onClick={onViewAll}>
                  View All ({expenses.length} total)
                </Button>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingPayments;
