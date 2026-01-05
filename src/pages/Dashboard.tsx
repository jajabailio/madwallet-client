import { Box, CircularProgress, Grid, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import PendingDebtsDrawer from '../components/common/PendingDebtsDrawer';
import { styles } from '../components/Dashboard/Dashboard.styles';
import {
  CategoryBreakdown,
  OverdueAlert,
  RecentTransactions,
  TotalBalanceCard,
  UpcomingPayments,
} from '../components/Dashboard/widgets';
import ExpenseDetailsDrawer from '../components/Expenses/ExpenseDetailsDrawer';
import PayExpenseModal from '../components/Expenses/PayExpenseModal';
import { useDashboard, useExpenses, useWalletTransactions } from '../contexts';
import type { Expense } from '../types';
import { calculateCategoryTotals, filterUpcomingExpenses, groupExpensesByUrgency } from '../utils';

const Dashboard = () => {
  const { summary, loading: dashboardLoading, refreshSummary } = useDashboard();
  const { expenses, loading: expensesLoading, refreshExpenses } = useExpenses();
  const {
    transactions,
    loading: transactionsLoading,
    refreshTransactions,
  } = useWalletTransactions();

  const [payingExpense, setPayingExpense] = useState<Expense | null>(null);
  const [pendingDebtsDrawerOpen, setPendingDebtsDrawerOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Fetch data on mount
  useEffect(() => {
    refreshExpenses();
    refreshTransactions();
  }, [refreshExpenses, refreshTransactions]);

  // Derived data
  const urgencyGroups = useMemo(() => groupExpensesByUrgency(expenses), [expenses]);

  const upcomingExpenses = useMemo(() => filterUpcomingExpenses(expenses, 30), [expenses]);

  const categoryTotals = useMemo(() => {
    // Current month expenses only
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthExpenses = expenses.filter((exp) => {
      const date = new Date(exp.date);
      return date >= startOfMonth && date <= endOfMonth;
    });

    return calculateCategoryTotals(monthExpenses);
  }, [expenses]);

  const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions]);

  const handlePayExpense = (expense: Expense) => {
    setPayingExpense(expense);
  };

  const handleViewDetails = (expense: Expense) => {
    setSelectedExpense(expense);
  };

  const handlePaymentSuccess = async () => {
    await refreshExpenses(true);
    await refreshSummary(true);
    setPayingExpense(null);
  };

  const handleViewAllOverdue = () => {
    setPendingDebtsDrawerOpen(true);
  };

  const isLoading = dashboardLoading || expensesLoading || transactionsLoading;

  if (isLoading && expenses.length === 0) {
    return (
      <Box sx={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={styles.container}>
      <Typography variant="h4" sx={styles.header}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Row 1: Summary Cards */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TotalBalanceCard balanceCents={summary?.totalBalanceCents || 0} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <OverdueAlert
            overdueExpenses={urgencyGroups.overdue}
            overdueTotal={urgencyGroups.overdueTotal}
            onPayExpense={handlePayExpense}
            onViewAll={handleViewAllOverdue}
          />
        </Grid>

        {/* Row 2: Main Content */}
        <Grid size={{ xs: 12, md: 8 }}>
          <UpcomingPayments
            expenses={upcomingExpenses}
            onPayExpense={handlePayExpense}
            onViewAll={handleViewAllOverdue}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <CategoryBreakdown categoryTotals={categoryTotals} />
        </Grid>

        {/* Row 3: Activity */}
        <Grid size={12}>
          <RecentTransactions transactions={recentTransactions} />
        </Grid>
      </Grid>

      {/* Pay Expense Modal */}
      <PayExpenseModal
        open={!!payingExpense}
        onClose={() => setPayingExpense(null)}
        expense={payingExpense}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Pending Debts Drawer */}
      <PendingDebtsDrawer
        open={pendingDebtsDrawerOpen}
        onClose={() => setPendingDebtsDrawerOpen(false)}
        onPayExpense={handlePayExpense}
        onViewDetails={handleViewDetails}
      />

      {/* Expense Details Drawer */}
      <ExpenseDetailsDrawer
        expense={selectedExpense}
        open={!!selectedExpense}
        onClose={() => setSelectedExpense(null)}
      />
    </Box>
  );
};

export default Dashboard;
