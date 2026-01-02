import { Dialog, DialogContent, DialogTitle, Grid, useMediaQuery, useTheme } from '@mui/material';
import Joi from 'joi';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useCategories, usePaymentMethods, useStatuses } from '../../contexts';
import { httpService } from '../../services';
import type { RecurringBill } from '../../types';
import FormBuilder from '../form/FormBuilder';

interface RecurringBillFormModalProps {
  open: boolean;
  onClose: () => void;
  recurringBills: RecurringBill[];
  setRecurringBills: React.Dispatch<React.SetStateAction<RecurringBill[]>>;
  editingBill?: RecurringBill | null;
}

// Joi validation schema for recurring bill
const recurringBillSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  description: Joi.string().allow('').max(500).optional(),
  amountCents: Joi.number().integer().positive().required().label('amount'),
  frequency: Joi.string().valid('monthly').default('monthly'),
  dayOfMonth: Joi.number().integer().min(1).max(31).required().label('day of month'),
  categoryId: Joi.number().integer().positive().required().label('category'),
  statusId: Joi.number().integer().positive().required().label('status'),
  paymentMethodId: Joi.number().integer().positive().allow('').optional().label('payment method'),
  startDate: Joi.date().required().max('now').label('start date'),
});

const RecurringBillFormModal = ({
  open,
  onClose,
  recurringBills,
  setRecurringBills,
  editingBill,
}: RecurringBillFormModalProps) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { categories } = useCategories();
  const { statuses } = useStatuses();
  const { paymentMethods } = usePaymentMethods();
  const isEditing = !!editingBill;

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      if (isEditing && editingBill) {
        // Update existing recurring bill
        const response = await httpService<RecurringBill>({
          method: 'put',
          url: `/recurring-bills/${editingBill.id}`,
          data: {
            name: data.name,
            description: data.description || undefined,
            amountCents: Number(data.amountCents),
            frequency: data.frequency,
            dayOfMonth: Number(data.dayOfMonth),
            categoryId: Number(data.categoryId),
            statusId: Number(data.statusId),
            paymentMethodId: data.paymentMethodId ? Number(data.paymentMethodId) : undefined,
            startDate: data.startDate,
          },
        });

        // Update the bill in the list
        setRecurringBills(
          recurringBills.map((bill) => (bill.id === editingBill.id ? response.data : bill)),
        );
        toast.success('Recurring bill updated successfully!');
        onClose();
      } else {
        // Create new recurring bill
        const response = await httpService<RecurringBill>({
          method: 'post',
          url: '/recurring-bills',
          data: {
            name: data.name,
            description: data.description || undefined,
            amountCents: Number(data.amountCents),
            frequency: data.frequency || 'monthly',
            dayOfMonth: Number(data.dayOfMonth),
            categoryId: Number(data.categoryId),
            statusId: Number(data.statusId),
            paymentMethodId: data.paymentMethodId ? Number(data.paymentMethodId) : undefined,
            startDate: data.startDate,
          },
        });

        setRecurringBills([response.data, ...recurringBills]);
        toast.success('Recurring bill created successfully!');
        onClose();
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        const errorMessage =
          axiosError.response?.data?.error ||
          `Failed to ${isEditing ? 'update' : 'create'} recurring bill. Please try again.`;
        toast.error(errorMessage);
      } else {
        toast.error(`Failed to ${isEditing ? 'update' : 'create'} recurring bill. Please try again.`);
      }
      console.error(`Failed to ${isEditing ? 'update' : 'create'} recurring bill:`, error);
    }
  };

  const {
    renderTextInput,
    renderTextArea,
    renderSelect,
    renderButton,
    handleSubmit: formHandleSubmit,
    setValue,
    reset,
  } = FormBuilder({
    schema: recurringBillSchema,
    onSubmit: handleSubmit,
  });

  // Reset form and pre-populate when modal opens
  useEffect(() => {
    if (open) {
      reset();
      if (editingBill) {
        setValue('name', editingBill.name);
        setValue('description', editingBill.description || '');
        setValue('amountCents', editingBill.amountCents);
        setValue('frequency', editingBill.frequency);
        setValue('dayOfMonth', editingBill.dayOfMonth);
        setValue('categoryId', editingBill.categoryId);
        setValue('statusId', editingBill.statusId);
        setValue('paymentMethodId', editingBill.paymentMethodId || '');
        setValue('startDate', new Date(editingBill.startDate).toISOString().split('T')[0]);
      } else {
        // Set defaults for new bill
        setValue('frequency', 'monthly');
        setValue('dayOfMonth', 1);
        setValue('startDate', new Date().toISOString().split('T')[0]);
        // Set default category and status
        if (categories.length > 0) {
          setValue('categoryId', categories[0].id);
        }
        if (statuses.length > 0) {
          // Default to "Unpaid" status for new recurring bills
          const unpaidStatus = statuses.find((s) => s.name === 'Unpaid');
          setValue('statusId', unpaidStatus?.id || statuses[0].id);
        }
      }
    }
  }, [editingBill, open, reset, setValue, categories, statuses]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={fullScreen}>
      <DialogTitle>{isEditing ? 'Edit Recurring Bill' : 'Add New Recurring Bill'}</DialogTitle>
      <DialogContent>
        <form onSubmit={formHandleSubmit}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {renderTextInput({
              name: 'name',
              label: 'Name',
              placeholder: 'e.g., Netflix Subscription',
              required: true,
            })}
            {renderTextArea({
              name: 'description',
              label: 'Description',
              placeholder: 'Optional description',
              rows: 2,
            })}
            <Grid size={6}>
              {renderTextInput({
                type: 'number',
                name: 'amountCents',
                label: 'Amount (in cents)',
                placeholder: '0',
                required: true,
                textFieldProps: {
                  inputProps: { step: '1', min: '1' },
                },
              })}
            </Grid>
            <Grid size={6}>
              {renderTextInput({
                type: 'number',
                name: 'dayOfMonth',
                label: 'Day of Month',
                placeholder: '1',
                required: true,
                textFieldProps: {
                  inputProps: { step: '1', min: '1', max: '31' },
                },
              })}
            </Grid>
            <Grid size={6}>
              {renderSelect({
                name: 'categoryId',
                label: 'Category',
                required: true,
                options: categories.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                })),
              })}
            </Grid>
            <Grid size={6}>
              {renderSelect({
                name: 'statusId',
                label: 'Default Status',
                required: true,
                options: statuses.map((status) => ({
                  value: status.id,
                  label: status.name,
                })),
              })}
            </Grid>
            <Grid size={6}>
              {renderSelect({
                name: 'frequency',
                label: 'Frequency',
                options: [{ value: 'monthly', label: 'Monthly' }],
              })}
            </Grid>
            <Grid size={6}>
              {renderTextInput({
                type: 'date',
                name: 'startDate',
                label: 'Start Date',
                required: true,
              })}
            </Grid>
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
            <Grid size={12}>
              {renderButton({
                text: isEditing ? 'Update Recurring Bill' : 'Add Recurring Bill',
                variant: 'contained',
                fullWidth: true,
              })}
            </Grid>
          </Grid>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecurringBillFormModal;
