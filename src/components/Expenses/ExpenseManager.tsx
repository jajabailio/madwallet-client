import { Box, Button, CircularProgress, IconButton, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { httpService } from '../../services';
import type { Expense } from '../../types';
import EmptyState from '../common/EmptyState';
import ExpenseDetailsDrawer from './ExpenseDetailsDrawer';
import ExpenseFormModal from './ExpenseFormModal';
import ExpenseList from './ExpenseList';
import PayExpenseModal from './PayExpenseModal';

const ExpenseManager = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [payingExpense, setPayingExpense] = useState<Expense | null>(null);

  // Fetch expenses on mount
  useEffect(() => {
    fetchExpenses();
  }, []);

  // Auto-generate recurring bill expenses when month changes
  useEffect(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth() + 1; // getMonth() is 0-indexed

    // Generate expenses for the selected month
    httpService({
      method: 'post',
      url: '/recurring-bills/generate-for-month',
      data: { year, month },
    })
      .then(() => {
        // Refetch expenses after generation
        return fetchExpenses();
      })
      .catch((error) => {
        // Silently fail - it's ok if there are no recurring bills or generation fails
        console.log('No recurring bills to generate for this month:', error);
      });
  }, [selectedMonth]);

  const fetchExpenses = async () => {
    try {
      const response = await httpService<Expense[]>({
        method: 'get',
        url: '/expenses',
      });
      setExpenses(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Failed to fetch expenses:', error);
    }
  };

  const handleOpenModal = () => {
    setEditingExpense(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingExpense(null);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await httpService({
        method: 'delete',
        url: `/expenses/${id}`,
      });

      setExpenses(expenses.filter((expense) => expense.id !== id));
      toast.success('Expense deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete expense');
      console.error('Failed to delete expense:', error);
    }
  };

  const handleViewDetails = (expense: Expense) => {
    setSelectedExpense(expense);
  };

  const handleCloseDrawer = () => {
    setSelectedExpense(null);
  };

  const handlePay = (expense: Expense) => {
    setPayingExpense(expense);
  };

  const handlePaymentSuccess = async () => {
    await fetchExpenses();
    setPayingExpense(null);
  };

  // Filter expenses by selected month
  const filteredExpenses = useMemo(() => {
    const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startOfMonth && expenseDate <= endOfMonth;
    });
  }, [expenses, selectedMonth]);

  // Navigate to previous month
  const handlePreviousMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1));
  };

  // Navigate to next month
  const handleNextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1));
  };

  // Format month display (e.g., "January 2026")
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <h1>Expenses</h1>
        <Button variant="contained" color="primary" onClick={handleOpenModal}>
          Add Expense
        </Button>
      </Box>

      <Box
        sx={{
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          bgcolor: 'background.paper',
          p: 2,
          borderRadius: 1,
          boxShadow: 1,
        }}
      >
        <IconButton onClick={handlePreviousMonth} aria-label="previous month" color="primary">
          <ChevronLeft />
        </IconButton>

        <Typography variant="h6" sx={{ minWidth: 200, textAlign: 'center' }}>
          {formatMonthYear(selectedMonth)}
        </Typography>

        <IconButton onClick={handleNextMonth} aria-label="next month" color="primary">
          <ChevronRight />
        </IconButton>
      </Box>

      {filteredExpenses.length === 0 ? (
        <EmptyState message="No expenses found for the selected period" />
      ) : (
        <ExpenseList
          expenses={filteredExpenses}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewDetails={handleViewDetails}
          onPay={handlePay}
        />
      )}

      <ExpenseFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        expenses={expenses}
        setExpenses={setExpenses}
        editingExpense={editingExpense}
      />

      <ExpenseDetailsDrawer
        expense={selectedExpense}
        open={!!selectedExpense}
        onClose={handleCloseDrawer}
      />

      <PayExpenseModal
        open={!!payingExpense}
        onClose={() => setPayingExpense(null)}
        expense={payingExpense}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </Box>
  );
};

export default ExpenseManager;
