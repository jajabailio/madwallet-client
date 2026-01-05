import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { Box, Card, CardContent, CircularProgress, Grid, Typography } from '@mui/material';
import { useState } from 'react';
import { useDashboard, useExpenses } from '../../contexts';
import type { Expense } from '../../types';
import { formatCurrency } from '../../utils';
import ExpenseDetailsDrawer from '../Expenses/ExpenseDetailsDrawer';
import PayExpenseModal from '../Expenses/PayExpenseModal';
import PendingDebtsDrawer from './PendingDebtsDrawer';

const SummaryBar = () => {
  const { summary, loading, refreshSummary } = useDashboard();
  const { refreshExpenses } = useExpenses();

  const [pendingDebtsDrawerOpen, setPendingDebtsDrawerOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [payingExpense, setPayingExpense] = useState<Expense | null>(null);

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={2}>
        {/* Total Cash Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              height: '100%',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalanceWalletIcon sx={{ fontSize: 40, mr: 2, opacity: 0.9 }} />
                <Typography variant="h6" sx={{ fontWeight: 500, opacity: 0.9 }}>
                  Total Cash
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {formatCurrency(summary.totalBalanceCents)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Combined from all active wallets
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Debts Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              height: '100%',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 6,
              },
            }}
            onClick={() => setPendingDebtsDrawerOpen(true)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CreditCardIcon sx={{ fontSize: 40, mr: 2, opacity: 0.9 }} />
                <Typography variant="h6" sx={{ fontWeight: 500, opacity: 0.9 }}>
                  Pending Debts
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {formatCurrency(summary.totalUnpaidCents)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {summary.unpaidCount} unpaid {summary.unpaidCount === 1 ? 'expense' : 'expenses'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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

      {/* Pay Expense Modal */}
      <PayExpenseModal
        open={!!payingExpense}
        onClose={() => setPayingExpense(null)}
        expense={payingExpense}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </Box>
  );
};

export default SummaryBar;
