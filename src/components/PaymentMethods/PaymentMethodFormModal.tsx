import { Dialog, DialogContent, DialogTitle, FormControl, FormLabel, Grid, MenuItem, Select, useMediaQuery, useTheme } from '@mui/material';
import Joi from 'joi';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { usePaymentMethods, useWallets } from '../../contexts';
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
  autoDeduct: Joi.boolean().optional().label('auto-deduct'),
  linkedWalletId: Joi.number().integer().positive().allow('').optional().label('linked wallet'),
});

const PaymentMethodFormModal = ({
  open,
  onClose,
  editingPaymentMethod,
}: PaymentMethodFormModalProps) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { refreshPaymentMethods } = usePaymentMethods();
  const { wallets } = useWallets();
  const isEditing = !!editingPaymentMethod;

  // Track selected type locally for conditional rendering
  const [selectedType, setSelectedType] = useState<string>('cash');
  const [showWalletFields, setShowWalletFields] = useState(false);

  // Filter active wallets for selection
  const activeWallets = wallets.filter((w) => w.isActive && !w.isDeleted);

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      const requestData = {
        name: data.name,
        type: data.type,
        description: data.description || undefined,
        statementDate: data.statementDate ? Number(data.statementDate) : undefined,
        paymentDueDate: data.paymentDueDate ? Number(data.paymentDueDate) : undefined,
        autoDeduct: Boolean(data.autoDeduct),
        linkedWalletId: data.linkedWalletId ? Number(data.linkedWalletId) : undefined,
      };

      if (isEditing && editingPaymentMethod) {
        // Update existing payment method
        await httpService({
          method: 'put',
          url: `/payment-methods/${editingPaymentMethod.id}`,
          data: requestData,
        });

        await refreshPaymentMethods();
        toast.success('Payment method updated successfully!');
        onClose();
      } else {
        // Create new payment method
        await httpService({
          method: 'post',
          url: '/payment-methods',
          data: requestData,
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
    renderCheckbox,
    renderButton,
    handleSubmit: formHandleSubmit,
    setValue,
    reset,
    data,
  } = FormBuilder({
    schema: paymentMethodSchema,
    onSubmit: handleSubmit,
  });

  // Handle type change to show/hide wallet fields
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setValue('type', type);

    // Auto-enable for debit and cash
    if (type === 'debit-card' || type === 'cash') {
      setValue('autoDeduct', true);
      setShowWalletFields(true);
    } else {
      setValue('autoDeduct', false);
      setShowWalletFields(false);
    }
  };

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
        setValue('autoDeduct', editingPaymentMethod.autoDeduct || false);
        setValue('linkedWalletId', editingPaymentMethod.linkedWalletId || '');

        setSelectedType(editingPaymentMethod.type);
        setShowWalletFields(editingPaymentMethod.autoDeduct || false);
      } else {
        setValue('type', 'cash');
        setValue('autoDeduct', true);
        setValue('linkedWalletId', '');

        setSelectedType('cash');
        setShowWalletFields(true);
      }
    }
  }, [editingPaymentMethod, open, reset, setValue]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
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

            {/* Custom Type Select with onChange */}
            <Grid size={12}>
              <FormControl fullWidth required>
                <FormLabel>Type</FormLabel>
                <Select
                  value={selectedType}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="e-wallet">E-Wallet</MenuItem>
                  <MenuItem value="credit-card">Credit Card</MenuItem>
                  <MenuItem value="debit-card">Debit Card</MenuItem>
                  <MenuItem value="bank-account">Bank Account</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
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

            {/* Wallet Linking Section - only show for debit/cash or when manually enabled */}
            {showWalletFields && (
              <>
                <Grid size={12}>
                  {renderCheckbox({
                    name: 'autoDeduct',
                    label: 'Auto-deduct from wallet when creating expenses',
                  })}
                </Grid>

                <Grid size={12}>
                  {renderSelect({
                    name: 'linkedWalletId',
                    label: 'Linked Wallet',
                    required: false,
                    options: [
                      { value: '', label: 'Select a wallet' },
                      ...activeWallets.map((wallet) => ({
                        value: wallet.id,
                        label: `${wallet.name} (${wallet.type})`,
                      })),
                    ],
                  })}
                </Grid>
              </>
            )}

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
