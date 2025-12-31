import { Dialog, DialogContent, DialogTitle, Grid } from '@mui/material';
import Joi from 'joi';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { usePaymentMethods } from '../../contexts';
import { httpService } from '../../services';
import type { PaymentMethod } from '../../types';
import FormBuilder from '../form/FormBuilder';

interface PaymentMethodFormModalProps {
  open: boolean;
  onClose: () => void;
  editingPaymentMethod?: PaymentMethod | null;
}

// Joi validation schema for payment method
const paymentMethodSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  type: Joi.string()
    .valid('cash', 'e-wallet', 'credit-card', 'debit-card', 'bank-account', 'other')
    .required()
    .label('type'),
  description: Joi.string().allow('').max(500).optional(),
  statementDate: Joi.number().integer().min(1).max(31).optional().label('statement date'),
  paymentDueDate: Joi.number().integer().min(1).max(31).optional().label('payment due date'),
});

const PaymentMethodFormModal = ({
  open,
  onClose,
  editingPaymentMethod,
}: PaymentMethodFormModalProps) => {
  const { refreshPaymentMethods } = usePaymentMethods();
  const isEditing = !!editingPaymentMethod;

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      if (isEditing && editingPaymentMethod) {
        // Update existing payment method
        await httpService({
          method: 'put',
          url: `/payment-methods/${editingPaymentMethod.id}`,
          data: {
            name: data.name,
            type: data.type,
            description: data.description || undefined,
            statementDate: data.statementDate ? Number(data.statementDate) : undefined,
            paymentDueDate: data.paymentDueDate ? Number(data.paymentDueDate) : undefined,
          },
        });

        await refreshPaymentMethods();
        toast.success('Payment method updated successfully!');
        onClose();
      } else {
        // Create new payment method
        await httpService({
          method: 'post',
          url: '/payment-methods',
          data: {
            name: data.name,
            type: data.type,
            description: data.description || undefined,
            statementDate: data.statementDate ? Number(data.statementDate) : undefined,
            paymentDueDate: data.paymentDueDate ? Number(data.paymentDueDate) : undefined,
          },
        });

        await refreshPaymentMethods();
        toast.success('Payment method created successfully!');
        onClose();
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        const errorMessage =
          axiosError.response?.data?.error ||
          `Failed to ${isEditing ? 'update' : 'create'} payment method. Please try again.`;
        toast.error(errorMessage);
      } else {
        toast.error(
          `Failed to ${isEditing ? 'update' : 'create'} payment method. Please try again.`,
        );
      }
      console.error(`Failed to ${isEditing ? 'update' : 'create'} payment method:`, error);
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
    schema: paymentMethodSchema,
    onSubmit: handleSubmit,
  });

  // Reset form and pre-populate when modal opens
  useEffect(() => {
    if (open) {
      reset();
      if (editingPaymentMethod) {
        setValue('name', editingPaymentMethod.name);
        setValue('type', editingPaymentMethod.type);
        setValue('description', editingPaymentMethod.description || '');
        setValue('statementDate', editingPaymentMethod.statementDate || '');
        setValue('paymentDueDate', editingPaymentMethod.paymentDueDate || '');
      } else {
        setValue('type', 'cash');
      }
    }
  }, [editingPaymentMethod, open, reset, setValue]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? 'Edit Payment Method' : 'Add New Payment Method'}
      </DialogTitle>
      <DialogContent>
        <form onSubmit={formHandleSubmit}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {renderTextInput({
              name: 'name',
              label: 'Name',
              placeholder: 'e.g., BDO Credit Card, GCash, Cash',
              required: true,
            })}
            {renderSelect({
              name: 'type',
              label: 'Type',
              required: true,
              options: [
                { value: 'cash', label: 'Cash' },
                { value: 'e-wallet', label: 'E-Wallet' },
                { value: 'credit-card', label: 'Credit Card' },
                { value: 'debit-card', label: 'Debit Card' },
                { value: 'bank-account', label: 'Bank Account' },
                { value: 'other', label: 'Other' },
              ],
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
                name: 'statementDate',
                label: 'Statement Date (Day)',
                placeholder: '1-31',
                textFieldProps: {
                  inputProps: { min: 1, max: 31 },
                },
              })}
            </Grid>
            <Grid size={6}>
              {renderTextInput({
                type: 'number',
                name: 'paymentDueDate',
                label: 'Payment Due Date (Day)',
                placeholder: '1-31',
                textFieldProps: {
                  inputProps: { min: 1, max: 31 },
                },
              })}
            </Grid>
            <Grid size={12}>
              {renderButton({
                text: isEditing ? 'Update Payment Method' : 'Add Payment Method',
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

export default PaymentMethodFormModal;
