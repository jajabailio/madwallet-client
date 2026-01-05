import { Dialog, DialogContent, DialogTitle, Grid, useMediaQuery, useTheme } from '@mui/material';
import Joi from 'joi';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useCategories, useDashboard, usePaymentMethods, useStatuses } from '../../contexts';
import { httpService } from '../../services';
import type { Expense } from '../../types';
import FormBuilder from '../form/FormBuilder';

interface ExpenseFormModalProps {
  open: boolean;
  onClose: () => void;
  expenses: Expense[];
  setExpenses: (expenses: Expense[] | ((prev: Expense[]) => Expense[])) => void;
  editingExpense?: Expense | null;
}

// Joi validation schema for expense
const expenseSchema = Joi.object({
  description: Joi.string().required().min(3).max(200),
  amount: Joi.number().required().positive().precision(2),
  categoryId: Joi.number().required().label('category'),
  statusId: Joi.number().required().label('status'),
  date: Joi.date().required(),
  paymentMethodId: Joi.number().integer().positive().optional().label('payment method'),
});

const ExpenseFormModal = ({
  open,
  onClose,
  expenses,
  setExpenses,
  editingExpense,
}: ExpenseFormModalProps) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { categories, loading: loadingCategories } = useCategories();
  const { statuses, loading: loadingStatuses } = useStatuses();
  const { paymentMethods } = usePaymentMethods();
  const { refreshSummary } = useDashboard();

  const isEditing = !!editingExpense;

  const handleSubmit = async (data: Record<string, unknown>) => {
    const categoryId = Number(data.categoryId);
    const statusId = Number(data.statusId);
    const paymentMethodId = data.paymentMethodId ? Number(data.paymentMethodId) : undefined;
    const category = categories.find((cat) => cat.id === categoryId);
    const status = statuses.find((stat) => stat.id === statusId);
    const paymentMethod = paymentMethodId
      ? paymentMethods.find((pm) => pm.id === paymentMethodId)
      : undefined;

    if (!category) {
      toast.error('Invalid category selected');
      return;
    }

    if (!status) {
      toast.error('Invalid status selected');
      return;
    }

    if (isEditing && editingExpense) {
      // Update existing expense
      const previousExpenses = [...expenses];

      // Optimistic update
      const updatedExpense: Expense = {
        ...editingExpense,
        description: data.description as string,
        amountCents: Math.round(Number(data.amount) * 100),
        categoryId,
        category,
        statusId,
        status,
        paymentMethodId,
        paymentMethod,
        date: new Date(data.date as string),
        updatedAt: new Date(),
      };

      setExpenses(expenses.map((exp) => (exp.id === editingExpense.id ? updatedExpense : exp)));
      onClose();

      try {
        const response = await httpService<Expense>({
          method: 'put',
          url: `/expenses/${editingExpense.id}`,
          data: {
            description: data.description,
            amount: Math.round(Number(data.amount) * 100),
            categoryId,
            statusId,
            paymentMethodId,
            date: data.date,
          },
          label: 'expense',
        });

        setExpenses((prev) =>
          prev.map((expense) => (expense.id === editingExpense.id ? response.data : expense)),
        );

        await refreshSummary();
        toast.success('Expense updated successfully!');
      } catch (error) {
        setExpenses(previousExpenses);
        toast.error('Failed to update expense. Please try again.');
        console.error('Failed to update expense:', error);
      }
    } else {
      // Create new expense
      const optimisticExpense: Expense = {
        id: -Date.now(),
        description: data.description as string,
        amountCents: Math.round(Number(data.amount) * 100),
        categoryId,
        category,
        statusId,
        status,
        paymentMethodId,
        paymentMethod,
        date: new Date(data.date as string),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const previousExpenses = [...expenses];

      setExpenses([optimisticExpense, ...expenses]);
      onClose();

      try {
        const response = await httpService<Expense>({
          method: 'post',
          url: '/expenses',
          data: {
            description: data.description,
            amount: Math.round(Number(data.amount) * 100),
            categoryId,
            statusId,
            paymentMethodId,
            date: data.date,
          },
          label: 'expense',
        });

        setExpenses((prev) =>
          prev.map((expense) => (expense.id === optimisticExpense.id ? response.data : expense)),
        );

        await refreshSummary();
        toast.success('Expense created successfully!');
      } catch (error) {
        setExpenses(previousExpenses);
        toast.error('Failed to create expense. Please try again.');
        console.error('Failed to create expense:', error);
      }
    }
  };

  const {
    renderTextInput,
    renderSelect,
    renderDatePicker,
    renderButton,
    handleSubmit: formHandleSubmit,
    setValue,
    reset,
  } = FormBuilder({
    schema: expenseSchema,
    onSubmit: handleSubmit,
  });

  // Reset form and pre-populate when modal opens
  useEffect(() => {
    if (open) {
      reset();
      if (editingExpense) {
        setValue('description', editingExpense.description);
        setValue('amount', editingExpense.amountCents / 100);
        setValue('categoryId', editingExpense.categoryId);
        setValue('statusId', editingExpense.statusId);
        setValue('paymentMethodId', editingExpense.paymentMethodId || '');
        setValue('date', new Date(editingExpense.date));
      } else {
        setValue('date', new Date());
      }
    }
  }, [editingExpense, open, reset, setValue]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
      <DialogTitle>{isEditing ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
      <DialogContent>
        <form onSubmit={formHandleSubmit}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {renderTextInput({
              name: 'description',
              label: 'Description',
              placeholder: 'Description',
            })}
            {renderTextInput({
              type: 'number',
              name: 'amount',
              label: 'Amount',
              placeholder: '0.00',
            })}
            {renderSelect({
              name: 'categoryId',
              label: 'Category',
              required: true,
              options: categories.map((cat) => ({
                value: cat.id,
                label: cat.name,
              })),
            })}
            {renderSelect({
              name: 'statusId',
              label: 'Status',
              required: true,
              options: statuses.map((stat) => ({
                value: stat.id,
                label: stat.name,
              })),
            })}
            {renderSelect({
              name: 'paymentMethodId',
              label: 'Payment Method (Optional)',
              options: [
                { value: '', label: 'None' },
                ...paymentMethods.map((pm) => ({
                  value: pm.id,
                  label: pm.name,
                })),
              ],
            })}
            {renderDatePicker({
              name: 'date',
              label: 'Date',
              required: true,
              defaultValue: new Date(),
            })}
            <Grid size={12}>
              {renderButton({
                text: isEditing ? 'Update Expense' : 'Add Expense',
                variant: 'contained',
                fullWidth: true,
                disabled: loadingCategories || loadingStatuses,
              })}
            </Grid>
          </Grid>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseFormModal;
