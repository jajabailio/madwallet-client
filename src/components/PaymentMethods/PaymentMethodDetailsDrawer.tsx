import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
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
import { useCallback, useEffect, useMemo, useState } from 'react';
import httpService from '../../services/httpService';
import type { Expense, PaymentMethod, PaymentMethodSummary } from '../../types';
import { formatCurrency, formatDate, groupExpensesByMonth } from '../../utils';
import { styles } from './PaymentMethodDetailsDrawer.styles';

interface PaymentMethodDetailsDrawerProps {
  paymentMethod: PaymentMethod | null;
  open: boolean;
  onClose: () => void;
}

type ExpenseFilter = 'outstanding' | 'dueThisMonth' | 'overdue' | 'paid' | null;

const SummaryCard = ({
  label,
  amountCents,
  count,
  color,
  borderColor,
  isActive,
  onClick,
}: {
  label: string;
  amountCents: number;
  count: number;
  color: string;
  borderColor: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <Box
    onClick={onClick}
    sx={{
      ...styles.summaryCard,
      borderColor,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      bgcolor: isActive ? `${borderColor}` : 'transparent',
      '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: 2,
      },
    }}
  >
    <Typography sx={styles.summaryCardLabel} color={isActive ? 'common.white' : 'text.secondary'}>
      {label}
    </Typography>
    <Typography sx={styles.summaryCardValue} color={isActive ? 'common.white' : color}>
      {formatCurrency(amountCents)}
    </Typography>
    <Typography
      sx={styles.summaryCardCount}
      color={isActive ? 'rgba(255,255,255,0.8)' : 'text.secondary'}
    >
      {count} {count === 1 ? 'expense' : 'expenses'}
    </Typography>
  </Box>
);

const PaymentMethodDetailsDrawer = ({
  paymentMethod,
  open,
  onClose,
}: PaymentMethodDetailsDrawerProps) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<PaymentMethodSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ExpenseFilter>(null);

  const fetchData = useCallback(async () => {
    if (!paymentMethod) return;

    setLoading(true);
    try {
      // Fetch summary and expenses in parallel
      const [summaryResponse, expensesResponse] = await Promise.all([
        httpService<{ data: PaymentMethodSummary }>({
          method: 'get',
          url: `/payment-methods/${paymentMethod.id}/summary`,
        }),
        httpService<{ data: Expense[] }>({
          method: 'get',
          url: `/payment-methods/${paymentMethod.id}/expenses`,
        }),
      ]);

      setSummary(summaryResponse.data.data);
      setExpenses(expensesResponse.data.data);
    } catch (error) {
      console.error('Error fetching payment method details:', error);
    } finally {
      setLoading(false);
    }
  }, [paymentMethod]);

  useEffect(() => {
    if (open && paymentMethod) {
      fetchData();
    } else {
      // Reset state when drawer closes
      setExpenses([]);
      setSummary(null);
      setActiveFilter(null);
    }
  }, [open, paymentMethod, fetchData]);

  const isOverdue = useCallback((expense: Expense): boolean => {
    if (!expense.dueDate || expense.status?.name === 'Paid') return false;
    return new Date(expense.dueDate) < new Date();
  }, []);

  const isDueThisMonth = useCallback((expense: Expense): boolean => {
    if (!expense.dueDate || expense.status?.name === 'Paid') return false;
    const now = new Date();
    const dueDate = new Date(expense.dueDate);
    return dueDate.getFullYear() === now.getFullYear() && dueDate.getMonth() === now.getMonth();
  }, []);

  // Filter expenses based on active filter
  const filteredExpenses = useMemo(() => {
    if (!activeFilter) return expenses;

    switch (activeFilter) {
      case 'outstanding':
        return expenses.filter((e) => e.status?.name !== 'Paid');
      case 'dueThisMonth':
        return expenses.filter((e) => isDueThisMonth(e));
      case 'overdue':
        return expenses.filter((e) => isOverdue(e));
      case 'paid':
        return expenses.filter((e) => e.status?.name === 'Paid');
      default:
        return expenses;
    }
  }, [expenses, activeFilter, isOverdue, isDueThisMonth]);

  const handleFilterClick = (filter: ExpenseFilter) => {
    setActiveFilter((current) => (current === filter ? null : filter));
  };

  if (!paymentMethod) return null;

  const monthGroups = groupExpensesByMonth(filteredExpenses);

  const getFilterLabel = (): string => {
    switch (activeFilter) {
      case 'outstanding':
        return 'Outstanding';
      case 'dueThisMonth':
        return 'Due This Month';
      case 'overdue':
        return 'Overdue';
      case 'paid':
        return 'Paid';
      default:
        return '';
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={styles.drawer}>
        {/* Header */}
        <Box sx={styles.header}>
          <Box>
            <Typography variant="h5" component="h2">
              {paymentMethod.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {paymentMethod.type}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={styles.divider} />

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Payment Method Details */}
            {(paymentMethod.description ||
              paymentMethod.statementDate ||
              paymentMethod.paymentDueDate) && (
              <Box sx={styles.detailsSection}>
                {/* Description - full width row */}
                {paymentMethod.description && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body2">{paymentMethod.description}</Typography>
                  </Box>
                )}
                {/* Dates - side by side */}
                {(paymentMethod.statementDate || paymentMethod.paymentDueDate) && (
                  <Box sx={styles.detailsGrid}>
                    {paymentMethod.statementDate && (
                      <Box sx={styles.detailItem}>
                        <Typography variant="caption" color="text.secondary">
                          Statement Date
                        </Typography>
                        <Typography variant="body2">Day {paymentMethod.statementDate}</Typography>
                      </Box>
                    )}
                    {paymentMethod.paymentDueDate && (
                      <Box sx={styles.detailItem}>
                        <Typography variant="caption" color="text.secondary">
                          Payment Due Date
                        </Typography>
                        <Typography variant="body2">Day {paymentMethod.paymentDueDate}</Typography>
                      </Box>
                    )}
                  </Box>
                )}
                <Divider sx={{ mt: 2 }} />
              </Box>
            )}

            {/* Summary Cards */}
            {summary && (
              <Box sx={styles.summaryCardsGrid}>
                <SummaryCard
                  label="Total Outstanding"
                  amountCents={summary.totalUnpaidCents}
                  count={summary.unpaidCount}
                  color="warning.main"
                  borderColor="warning.main"
                  isActive={activeFilter === 'outstanding'}
                  onClick={() => handleFilterClick('outstanding')}
                />
                <SummaryCard
                  label="Due This Month"
                  amountCents={summary.dueThisMonthCents}
                  count={summary.dueThisMonthCount}
                  color="info.main"
                  borderColor="info.main"
                  isActive={activeFilter === 'dueThisMonth'}
                  onClick={() => handleFilterClick('dueThisMonth')}
                />
                <SummaryCard
                  label="Overdue"
                  amountCents={summary.overdueCents}
                  count={summary.overdueCount}
                  color="error.main"
                  borderColor="error.main"
                  isActive={activeFilter === 'overdue'}
                  onClick={() => handleFilterClick('overdue')}
                />
                <SummaryCard
                  label="Total Paid"
                  amountCents={summary.totalPaidCents}
                  count={summary.paidCount}
                  color="success.main"
                  borderColor="success.main"
                  isActive={activeFilter === 'paid'}
                  onClick={() => handleFilterClick('paid')}
                />
              </Box>
            )}

            {/* Active Filter Indicator */}
            {activeFilter && (
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Showing:
                </Typography>
                <Chip
                  label={getFilterLabel()}
                  size="small"
                  onDelete={() => setActiveFilter(null)}
                />
              </Box>
            )}

            <Divider sx={styles.divider} />

            {/* Expenses List Grouped by Month */}
            {monthGroups.length === 0 ? (
              <Box sx={styles.emptyState}>
                <Typography variant="h6" gutterBottom>
                  {activeFilter ? 'No matching expenses' : 'No expenses found'}
                </Typography>
                <Typography variant="body2">
                  {activeFilter
                    ? `No ${getFilterLabel().toLowerCase()} expenses for this payment method.`
                    : 'This payment method has no associated expenses yet.'}
                </Typography>
              </Box>
            ) : (
              <Stack spacing={3}>
                {monthGroups.map((group) => (
                  <Box key={`${group.year}-${group.monthNumber}`} sx={styles.monthGroup}>
                    {/* Month Header */}
                    <Box sx={styles.monthHeader}>
                      <Typography sx={styles.monthTitle}>{group.month}</Typography>
                      <Box sx={styles.monthSummary}>
                        {group.paidCount > 0 && (
                          <Typography color="success.main">
                            ✅ Paid ({group.paidCount}) {formatCurrency(group.totalPaidCents)}
                          </Typography>
                        )}
                        {group.unpaidCount > 0 && (
                          <Typography color="warning.main">
                            ❌ Unpaid ({group.unpaidCount}) {formatCurrency(group.totalUnpaidCents)}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Expenses List */}
                    <List dense sx={styles.expensesList}>
                      {group.expenses.map((expense) => (
                        <ListItem key={expense.id} sx={styles.expenseItem}>
                          <ListItemText
                            primary={
                              <Box sx={styles.expensePrimary}>
                                <Typography variant="body2">
                                  {expense.description}
                                  {expense.purchase && expense.installmentNumber && (
                                    <Typography
                                      component="span"
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{ ml: 1 }}
                                    >
                                      (Installment {expense.installmentNumber}/
                                      {expense.purchase.installmentCount})
                                    </Typography>
                                  )}
                                </Typography>
                                <Typography variant="body2" sx={styles.expenseAmount}>
                                  {formatCurrency(expense.amountCents)}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Box sx={styles.expenseSecondary}>
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(expense.date)}
                                </Typography>
                                {expense.category && (
                                  <Chip
                                    label={expense.category.name}
                                    size="small"
                                    sx={{
                                      height: 20,
                                      fontSize: '0.7rem',
                                      bgcolor: expense.category.color,
                                      color: '#fff',
                                    }}
                                  />
                                )}
                                {expense.status && (
                                  <Chip
                                    label={expense.status.name}
                                    size="small"
                                    color={expense.status.name === 'Paid' ? 'success' : 'warning'}
                                    variant="outlined"
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                  />
                                )}
                                {isOverdue(expense) && (
                                  <Chip label="OVERDUE" size="small" sx={styles.overdueIndicator} />
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ))}
              </Stack>
            )}
          </>
        )}
      </Box>
    </Drawer>
  );
};

export default PaymentMethodDetailsDrawer;
