import { Dialog, DialogContent, DialogTitle, Grid, useMediaQuery, useTheme } from '@mui/material';
import Joi from 'joi';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useCategories, usePaymentMethods, usePurchases, useStatuses } from '../../contexts';
import { httpService } from '../../services';
import type { Purchase } from '../../types';
import FormBuilder from '../form/FormBuilder';

interface PurchaseFormModalProps {
  open: boolean;
  onClose: () => void;
  editingPurchase?: Purchase | null;
}

// Joi validation schema for purchase
const purchaseSchema = Joi.object({
  description: Joi.string().required().min(2).max(500),
  totalAmount: Joi.number().required().positive().label('total amount'),
  installmentCount: Joi.number().integer().min(1).optional().label('installment count'),
  frequency: Joi.string()
    .valid('once', 'daily', 'weekly', 'monthly', 'yearly')
    .optional()
    .label('frequency'),
  startDate: Joi.date().required().label('start date'),
  status: Joi.string().valid('active', 'completed', 'cancelled').optional().label('status'),
  categoryId: Joi.number().integer().required().positive().label('category'),
  statusId: Joi.number().integer().required().positive().label('default status'),
  paymentMethodId: Joi.number().integer().positive().allow('').optional().label('payment method'),
  hasPaidInstallments: Joi.boolean().optional(),
  paidInstallments: Joi.number().integer().min(0).allow('').optional().label('paid installments'),
  paidInstallmentsStatusId: Joi.number()
    .integer()
    .positive()
    .allow('')
    .optional()
    .label('paid installments status'),
}).custom((value, helpers) => {
  // If frequency is 'once', installmentCount must be 1
  const frequency = value.frequency || 'once';
  const installmentCount = value.installmentCount || 1;

  if (frequency === 'once' && installmentCount !== 1) {
    return helpers.message({
      custom: 'Installment count must be 1 when frequency is "once"',
    });
  }

  // If hasPaidInstallments is true, validate paid installments
  if (value.hasPaidInstallments) {
    if (!value.paidInstallments && value.paidInstallments !== 0) {
      return helpers.message({
        custom: 'Paid installments is required when tracking previous payments',
      });
    }

    if (value.paidInstallments > installmentCount) {
      return helpers.message({
        custom: `Paid installments (${value.paidInstallments}) cannot exceed total installments (${installmentCount})`,
      });
    }

    if (!value.paidInstallmentsStatusId) {
      return helpers.message({
        custom: 'Status for paid installments is required when tracking previous payments',
      });
    }
  }

  return value;
});

const PurchaseFormModal = ({ open, onClose, editingPurchase }: PurchaseFormModalProps) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { refreshPurchases } = usePurchases();
  const { categories } = useCategories();
  const { statuses } = useStatuses();
  const { paymentMethods } = usePaymentMethods();
  const isEditing = !!editingPurchase;

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      if (isEditing && editingPurchase) {
        // Update existing purchase
        await httpService({
          method: 'put',
          url: `/purchases/${editingPurchase.id}`,
          data: {
            description: data.description,
            totalAmount: Number(data.totalAmount),
            installmentCount: data.installmentCount ? Number(data.installmentCount) : undefined,
            frequency: data.frequency,
            startDate: data.startDate,
            status: data.status,
            categoryId: Number(data.categoryId),
            statusId: Number(data.statusId),
            paymentMethodId: data.paymentMethodId ? Number(data.paymentMethodId) : undefined,
          },
        });

        await refreshPurchases();
        toast.success('Purchase updated successfully!');
        onClose();
      } else {
        // Create new purchase
        const requestData: Record<string, unknown> = {
          description: data.description,
          totalAmount: Number(data.totalAmount),
          installmentCount: data.installmentCount ? Number(data.installmentCount) : 1,
          frequency: data.frequency || 'once',
          startDate: data.startDate,
          status: data.status || 'active',
          categoryId: Number(data.categoryId),
          statusId: Number(data.statusId),
          paymentMethodId: data.paymentMethodId ? Number(data.paymentMethodId) : undefined,
        };

        // Only add paid installments fields if checkbox is checked
        if (data.hasPaidInstallments === true) {
          requestData.paidInstallments = Number(data.paidInstallments);
          requestData.paidInstallmentsStatusId = Number(data.paidInstallmentsStatusId);
        }

        await httpService({
          method: 'post',
          url: '/purchases',
          data: requestData,
        });

        await refreshPurchases();
        toast.success('Purchase created successfully!');
        onClose();
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        const errorMessage =
          axiosError.response?.data?.error ||
          `Failed to ${isEditing ? 'update' : 'create'} purchase. Please try again.`;
        toast.error(errorMessage);
      } else {
        toast.error(`Failed to ${isEditing ? 'update' : 'create'} purchase. Please try again.`);
      }
      console.error(`Failed to ${isEditing ? 'update' : 'create'} purchase:`, error);
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
    schema: purchaseSchema,
    onSubmit: handleSubmit,
  });

  // Reset form and pre-populate when modal opens
  useEffect(() => {
    if (open) {
      reset();
      if (editingPurchase) {
        setValue('description', editingPurchase.description);
        setValue('totalAmount', editingPurchase.totalAmountCents);
        setValue('installmentCount', editingPurchase.installmentCount);
        setValue('frequency', editingPurchase.frequency);
        setValue('startDate', new Date(editingPurchase.startDate).toISOString().split('T')[0]);
        setValue('status', editingPurchase.status);
        setValue('categoryId', editingPurchase.categoryId);
        setValue('statusId', editingPurchase.statusId);
        setValue('paymentMethodId', editingPurchase.paymentMethodId || '');
      } else {
        setValue('installmentCount', 1);
        setValue('frequency', 'once');
        setValue('status', 'active');
        setValue('startDate', new Date().toISOString().split('T')[0]);
        setValue('hasPaidInstallments', false);
        setValue('paidInstallments', 0);
        // Set default category and status
        if (categories.length > 0) {
          setValue('categoryId', categories[0].id);
        }
        if (statuses.length > 0) {
          // Default to "Unpaid" status for new purchases
          const unpaidStatus = statuses.find((s) => s.name === 'Unpaid');
          const paidStatus = statuses.find((s) => s.name === 'Paid');
          setValue('statusId', unpaidStatus?.id || statuses[0].id);
          // Set default paid installments status to "Paid"
          setValue('paidInstallmentsStatusId', paidStatus?.id || statuses[0].id);
        }
      }
    }
  }, [editingPurchase, open, reset, setValue, categories, statuses, paymentMethods]);

  // Auto-adjust frequency based on installmentCount
  useEffect(() => {
    if (open && !isEditing) {
      const installmentCount = Number(data.installmentCount);

      // If installmentCount is 1, set frequency to 'once'
      if (installmentCount === 1 && data.frequency !== 'once') {
        setValue('frequency', 'once');
      }

      // If installmentCount > 1 and frequency is 'once', change to 'monthly'
      if (installmentCount > 1 && data.frequency === 'once') {
        setValue('frequency', 'monthly');
      }
    }
  }, [data.installmentCount, data.frequency, open, isEditing, setValue]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={fullScreen}>
      <DialogTitle>{isEditing ? 'Edit Purchase' : 'Add New Purchase'}</DialogTitle>
      <DialogContent>
        <form onSubmit={formHandleSubmit}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {renderTextArea({
              name: 'description',
              label: 'Description',
              placeholder: 'Purchase description',
              required: true,
              rows: 3,
            })}
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
                label: 'Default Status for Installments',
                required: true,
                options: statuses.map((status) => ({
                  value: status.id,
                  label: status.name,
                })),
              })}
            </Grid>
            <Grid size={6}>
              {renderTextInput({
                type: 'number',
                name: 'totalAmount',
                label: 'Total Amount',
                placeholder: '0.00',
                required: true,
                textFieldProps: {
                  inputProps: { step: '0.01', min: '0' },
                },
              })}
            </Grid>
            <Grid size={6}>
              {renderTextInput({
                type: 'number',
                name: 'installmentCount',
                label: 'Installment Count',
                placeholder: '1',
                textFieldProps: {
                  inputProps: { step: '1', min: '1' },
                },
              })}
            </Grid>
            <Grid size={6}>
              {renderSelect({
                name: 'frequency',
                label: 'Frequency',
                options: [
                  { value: 'once', label: 'Once' },
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'yearly', label: 'Yearly' },
                ],
              })}
            </Grid>
            <Grid size={6}>
              {renderSelect({
                name: 'status',
                label: 'Status',
                options: [
                  { value: 'active', label: 'Active' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
                ],
              })}
            </Grid>
            {renderTextInput({
              type: 'date',
              name: 'startDate',
              label: 'Start Date',
              required: true,
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
            {!isEditing && (
              <>
                {renderCheckbox({
                  name: 'hasPaidInstallments',
                  label: 'Has Paid Installments (Track Previous Payments)',
                  defaultValue: false,
                })}
                {data.hasPaidInstallments === true && (
                  <>
                    <Grid size={6}>
                      {renderTextInput({
                        type: 'number',
                        name: 'paidInstallments',
                        label: 'Number of Paid Installments',
                        placeholder: '0',
                        required: true,
                        textFieldProps: {
                          inputProps: { step: '1', min: '0' },
                        },
                      })}
                    </Grid>
                    <Grid size={6}>
                      {renderSelect({
                        name: 'paidInstallmentsStatusId',
                        label: 'Status for Paid Installments',
                        required: true,
                        options: statuses.map((status) => ({
                          value: status.id,
                          label: status.name,
                        })),
                      })}
                    </Grid>
                  </>
                )}
              </>
            )}
            <Grid size={12}>
              {renderButton({
                text: isEditing ? 'Update Purchase' : 'Add Purchase',
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

export default PurchaseFormModal;
