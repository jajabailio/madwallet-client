import { Box, Button, CircularProgress, Grid, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { httpService } from '../../services';
import type { Expense } from '../../types';
import ExpenseDetailsDrawer from './ExpenseDetailsDrawer';
import ExpenseFormModal from './ExpenseFormModal';
import ExpenseList from './ExpenseList';

type TimelineFilter = 'all' | '1d' | '7d' | '15d' | '30d' | 'custom';

const ExpenseManager = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>('1d');
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);

  // Fetch expenses on mount
  useEffect(() => {
    httpService<Expense[]>({
      method: 'get',
      url: '/expenses',
      onSuccess: (response) => {
        setExpenses(response.data);
        setLoading(false);
      },
    }).catch(() => {
      setLoading(false);
    });
  }, []);

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

  // Filter expenses based on timeline
  const filteredExpenses = useMemo(() => {
    if (timelineFilter === 'all') {
      return expenses;
    }

    if (timelineFilter === 'custom') {
      if (!customStartDate || !customEndDate) {
        return expenses;
      }

      const startDate = new Date(customStartDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999); // End of the day

      return expenses.filter((expense) => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startDate && expenseDate <= endDate;
      });
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today

    const filterDays = {
      '1d': 1,
      '7d': 7,
      '15d': 15,
      '30d': 30,
    };

    const days = filterDays[timelineFilter];
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + days);

    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      expenseDate.setHours(0, 0, 0, 0);

      return expenseDate >= now && expenseDate < endDate;
    });
  }, [expenses, timelineFilter, customStartDate, customEndDate]);

  const handleTimelineChange = (_event: React.MouseEvent<HTMLElement>, newFilter: TimelineFilter) => {
    if (newFilter !== null) {
      setTimelineFilter(newFilter);
    }
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

      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={timelineFilter}
          exclusive
          onChange={handleTimelineChange}
          aria-label="timeline filter"
          size="small"
          color="primary"
        >
          <ToggleButton value="1d" aria-label="today">
            Today
          </ToggleButton>
          <ToggleButton value="7d" aria-label="next 7 days">
            7 Days
          </ToggleButton>
          <ToggleButton value="15d" aria-label="next 15 days">
            15 Days
          </ToggleButton>
          <ToggleButton value="30d" aria-label="next 30 days">
            30 Days
          </ToggleButton>
          <ToggleButton value="custom" aria-label="custom date range">
            Custom
          </ToggleButton>
          <ToggleButton value="all" aria-label="all expenses">
            All
          </ToggleButton>
        </ToggleButtonGroup>

        {timelineFilter === 'custom' && (
          <Box sx={{ mt: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Start Date"
                    value={customStartDate}
                    onChange={(newValue) => setCustomStartDate(newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="End Date"
                    value={customEndDate}
                    onChange={(newValue) => setCustomEndDate(newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>
          </Box>
        )}
      </Box>

      <ExpenseList
        expenses={filteredExpenses}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewDetails={handleViewDetails}
      />

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
    </Box>
  );
};

export default ExpenseManager;
