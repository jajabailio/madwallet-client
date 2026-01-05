import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TodayIcon from '@mui/icons-material/Today';
import UpcomingIcon from '@mui/icons-material/Upcoming';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { useMemo } from 'react';
import { useExpenses } from '../../contexts';
import type { Expense } from '../../types';
import { formatCurrency, formatDate, groupExpensesByUrgency } from '../../utils';
import { styles } from './PendingDebtsDrawer.styles';

interface PendingDebtsDrawerProps {
  open: boolean;
  onClose: () => void;
  onPayExpense: (expense: Expense) => void;
  onViewDetails: (expense: Expense) => void;
}

interface UrgencySectionProps {
  title: string;
  icon: React.ReactNode;
  expenses: Expense[];
  totalCents: number;
  color: string;
  borderColor: string;
  onPayExpense: (expense: Expense) => void;
  onViewDetails: (expense: Expense) => void;
}

const UrgencySection = ({
  title,
  icon,
  expenses,
  totalCents,
  color,
  borderColor,
  onPayExpense,
  onViewDetails,
}: UrgencySectionProps) => {
  if (expenses.length === 0) return null;

  return (
    <Box sx={styles.urgencyGroup}>
      <Box sx={{ ...styles.urgencyHeader, borderColor }}>
        <Typography sx={styles.urgencyTitle} color={color}>
          {icon}
          {title} ({expenses.length})
        </Typography>
        <Typography sx={styles.urgencyTotal} color={color}>
          {formatCurrency(totalCents)}
        </Typography>
      </Box>

      <List dense sx={styles.expensesList}>
        {expenses.map((expense) => (
          <ListItem key={expense.id} sx={styles.expenseItem} onClick={() => onViewDetails(expense)}>
            <ListItemText
              primary={
                <Box sx={styles.expensePrimary}>
                  <Typography variant="body2" sx={styles.expenseDescription}>
                    {expense.description}
                    {expense.purchase && expense.installmentNumber && (
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        ({expense.installmentNumber}/{expense.purchase.installmentCount})
                      </Typography>
                    )}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={styles.expenseAmount} color={color}>
                      {formatCurrency(expense.amountCents)}
                    </Typography>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      sx={styles.payButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        onPayExpense(expense);
                      }}
                    >
                      Pay
                    </Button>
                  </Box>
                </Box>
              }
              secondary={
                <Box sx={styles.expenseSecondary}>
                  {expense.dueDate && (
                    <Typography variant="caption" color="text.secondary">
                      <ScheduleIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                      Due: {formatDate(expense.dueDate)}
                    </Typography>
                  )}
                  {expense.category && (
                    <Chip
                      label={expense.category.name}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.65rem',
                        bgcolor: expense.category.color,
                        color: '#fff',
                      }}
                    />
                  )}
                  {expense.paymentMethod && (
                    <Chip
                      label={expense.paymentMethod.name}
                      size="small"
                      variant="outlined"
                      sx={{ height: 18, fontSize: '0.65rem' }}
                    />
                  )}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

const PendingDebtsDrawer = ({
  open,
  onClose,
  onPayExpense,
  onViewDetails,
}: PendingDebtsDrawerProps) => {
  const { expenses, loading } = useExpenses();

  const urgencyGroups = useMemo(() => groupExpensesByUrgency(expenses), [expenses]);

  const totalUnpaid =
    urgencyGroups.overdueTotal + urgencyGroups.dueTodayTotal + urgencyGroups.upcomingTotal;
  const totalCount =
    urgencyGroups.overdue.length + urgencyGroups.dueToday.length + urgencyGroups.upcoming.length;

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={styles.drawer}>
        {/* Header */}
        <Box sx={styles.header}>
          <Typography variant="h5" component="h2">
            Pending Debts
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={styles.divider} />

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : totalCount === 0 ? (
          <Box sx={styles.emptyState}>
            <Typography variant="h6" gutterBottom>
              No pending debts
            </Typography>
            <Typography variant="body2">All your expenses are paid. Great job!</Typography>
          </Box>
        ) : (
          <>
            {/* Summary Section */}
            <Box sx={styles.summarySection}>
              <Typography sx={styles.summaryAmount}>{formatCurrency(totalUnpaid)}</Typography>
              <Typography sx={styles.summaryCount}>
                {totalCount} unpaid {totalCount === 1 ? 'expense' : 'expenses'}
              </Typography>
            </Box>

            <Divider sx={styles.divider} />

            {/* Urgency Sections */}
            <Stack spacing={2}>
              <UrgencySection
                title="OVERDUE"
                icon={<ErrorOutlineIcon sx={{ fontSize: 18 }} />}
                expenses={urgencyGroups.overdue}
                totalCents={urgencyGroups.overdueTotal}
                color="error.main"
                borderColor="error.main"
                onPayExpense={onPayExpense}
                onViewDetails={onViewDetails}
              />

              <UrgencySection
                title="DUE TODAY"
                icon={<TodayIcon sx={{ fontSize: 18 }} />}
                expenses={urgencyGroups.dueToday}
                totalCents={urgencyGroups.dueTodayTotal}
                color="warning.main"
                borderColor="warning.main"
                onPayExpense={onPayExpense}
                onViewDetails={onViewDetails}
              />

              <UrgencySection
                title="UPCOMING"
                icon={<UpcomingIcon sx={{ fontSize: 18 }} />}
                expenses={urgencyGroups.upcoming}
                totalCents={urgencyGroups.upcomingTotal}
                color="info.main"
                borderColor="info.main"
                onPayExpense={onPayExpense}
                onViewDetails={onViewDetails}
              />
            </Stack>
          </>
        )}
      </Box>
    </Drawer>
  );
};

export default PendingDebtsDrawer;
