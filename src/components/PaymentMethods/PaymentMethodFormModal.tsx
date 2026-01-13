import AddIcon from '@mui/icons-material/Add';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  MenuItem,
  Select,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Joi from 'joi';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { usePaymentMethods, useWallets } from '../../contexts';
import { httpService } from '../../services';
import type { PaymentMethod, Wallet } from '../../types';
import FormBuilder from '../form/FormBuilder';
import WalletFormModal from '../Wallets/WalletFormModal';

interface PaymentMethodFormModalProps {
  open: boolean;
  onClose: () => void;
  editingPaymentMethod?: PaymentMethod | null;
}

// Types that require a linked wallet
const TYPES_REQUIRING_WALLET = ['debit-card', 'e-wallet'];

// Types that show statement date fields
const TYPES_WITH_STATEMENT_DATE = ['credit-card'];

// Map payment method types to wallet types for auto-selection
const PAYMENT_TYPE_TO_WALLET_TYPE: Record<
  string,
  'bank_account' | 'e_wallet' | 'cash' | 'savings'
> = {
  'debit-card': 'bank_account',
  'e-wallet': 'e_wallet',
  cash: 'cash',
  'bank-account': 'bank_account',
};

// Joi validation schema for payment method
const paymentMethodSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  type: Joi.string()
    .valid('cash', 'e-wallet', 'credit-card', 'debit-card', 'bank-account', 'other')
    .required()
    .label('type'),
  description: Joi.string().allow('').max(500).optional(),
  statementDate: Joi.number().integer().min(1).max(31).allow('').optional().label('statement date'),
  paymentDueDate: Joi.number()
    .integer()
    .min(1)
    .max(31)
    .allow('')
    .optional()
    .label('payment due date'),
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
  const { wallets, refreshWallets } = useWallets();
  const isEditing = !!editingPaymentMethod;

  // Track selected type locally for conditional rendering
  const [selectedType, setSelectedType] = useState<string>('cash');
  const [showWalletFields, setShowWalletFields] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState<string | number>('');
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  // Check if this type requires a linked wallet
  const requiresLinkedWallet = TYPES_REQUIRING_WALLET.includes(selectedType);

  // Check if this type shows statement date fields
  const showStatementDateFields = TYPES_WITH_STATEMENT_DATE.includes(selectedType);

  // Filter active wallets for selection
  const activeWallets = wallets.filter((w) => w.isActive && !w.isDeleted);

  // Get suggested wallet type based on payment method type
  const getSuggestedWalletType = (): 'bank_account' | 'e_wallet' | 'cash' | 'savings' => {
    return PAYMENT_TYPE_TO_WALLET_TYPE[selectedType] || 'bank_account';
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    // Validate linked wallet is selected for required types
    if (requiresLinkedWallet && !selectedWalletId) {
      toast.error(
        `A linked wallet is required for ${selectedType === 'debit-card' ? 'debit cards' : 'e-wallets'}`,
      );
      return;
    }

    try {
      const requestData = {
        name: data.name,
        type: data.type,
        description: data.description || '',
        statementDate:
          showStatementDateFields && data.statementDate ? Number(data.statementDate) : null,
        paymentDueDate:
          showStatementDateFields && data.paymentDueDate ? Number(data.paymentDueDate) : null,
        autoDeduct: Boolean(data.autoDeduct),
        linkedWalletId: selectedWalletId ? Number(selectedWalletId) : null,
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
    renderCheckbox,
    renderButton,
    handleSubmit: formHandleSubmit,
    setValue,
    reset,
  } = FormBuilder({
    schema: paymentMethodSchema,
    onSubmit: handleSubmit,
  });

  // Handle type change to show/hide wallet fields and statement date fields
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setValue('type', type);

    // Show wallet fields for debit-card, e-wallet, and cash
    const shouldShowWalletFields = ['debit-card', 'e-wallet', 'cash'].includes(type);
    setShowWalletFields(shouldShowWalletFields);

    // Auto-enable autoDeduct for types that require wallet linking
    if (TYPES_REQUIRING_WALLET.includes(type) || type === 'cash') {
      setValue('autoDeduct', true);
    } else {
      setValue('autoDeduct', false);
    }

    // Set default statement dates for credit cards
    if (TYPES_WITH_STATEMENT_DATE.includes(type)) {
      setValue('statementDate', 1);
      setValue('paymentDueDate', 1);
    } else {
      // Clear statement dates for non-credit-card types
      setValue('statementDate', '');
      setValue('paymentDueDate', '');
    }

    // Reset wallet selection when type changes
    setSelectedWalletId('');
  };

  // Handle wallet selection
  const handleWalletChange = (value: string | number) => {
    if (value === 'create-new') {
      setWalletModalOpen(true);
    } else {
      setSelectedWalletId(value);
      setValue('linkedWalletId', value);
    }
  };

  // Handle wallet created callback
  const handleWalletCreated = async (wallet: Wallet) => {
    await refreshWallets();
    setSelectedWalletId(wallet.id);
    setValue('linkedWalletId', wallet.id);
    setWalletModalOpen(false);
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
        setSelectedWalletId(editingPaymentMethod.linkedWalletId || '');
        setShowWalletFields(
          ['debit-card', 'e-wallet', 'cash'].includes(editingPaymentMethod.type) ||
            editingPaymentMethod.autoDeduct ||
            false,
        );
      } else {
        setValue('type', 'cash');
        setValue('autoDeduct', true);
        setValue('linkedWalletId', '');

        setSelectedType('cash');
        setSelectedWalletId('');
        setShowWalletFields(true);
      }
    }
  }, [editingPaymentMethod, open, reset, setValue]);

  // Get helper text for linked wallet based on type
  const getLinkedWalletHelperText = (): string => {
    if (selectedType === 'debit-card') {
      return 'Debit cards require a linked wallet to track where money is deducted from.';
    }
    if (selectedType === 'e-wallet') {
      return 'E-Wallets require a linked wallet to track the balance.';
    }
    return '';
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
        <DialogTitle>{isEditing ? 'Edit Payment Method' : 'Add New Payment Method'}</DialogTitle>
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

              {/* Statement Date Fields - Only show for credit cards */}
              {showStatementDateFields && (
                <>
                  <Grid size={6}>
                    {renderTextInput({
                      type: 'number',
                      name: 'statementDate',
                      label: 'Statement Date (Day)',
                      placeholder: '1-31',
                      defaultValue: 1,
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
                      defaultValue: 1,
                      textFieldProps: {
                        inputProps: { min: 1, max: 31 },
                      },
                    })}
                  </Grid>
                </>
              )}

              {/* Wallet Linking Section */}
              {showWalletFields && (
                <>
                  <Grid size={12}>
                    {renderCheckbox({
                      name: 'autoDeduct',
                      label: 'Auto-deduct from wallet when creating expenses',
                    })}
                  </Grid>

                  <Grid size={12}>
                    <FormControl fullWidth required={requiresLinkedWallet}>
                      <FormLabel>Linked Wallet{requiresLinkedWallet && ' *'}</FormLabel>

                      {/* Show message when no wallets exist for required types */}
                      {activeWallets.length === 0 && requiresLinkedWallet ? (
                        <Alert
                          severity="info"
                          sx={{ mt: 1 }}
                          action={
                            <Button
                              color="inherit"
                              size="small"
                              startIcon={<AddIcon />}
                              onClick={() => setWalletModalOpen(true)}
                            >
                              Create Wallet
                            </Button>
                          }
                        >
                          <Box>
                            <strong>No wallets found.</strong>
                            <br />
                            {getLinkedWalletHelperText()}
                          </Box>
                        </Alert>
                      ) : (
                        <>
                          <Select
                            value={selectedWalletId}
                            onChange={(e) => handleWalletChange(e.target.value)}
                            fullWidth
                            error={requiresLinkedWallet && !selectedWalletId}
                          >
                            {!requiresLinkedWallet && (
                              <MenuItem value="">
                                <em>None</em>
                              </MenuItem>
                            )}
                            {activeWallets.map((wallet) => (
                              <MenuItem key={wallet.id} value={wallet.id}>
                                {wallet.name} ({wallet.type.replace('_', ' ')})
                              </MenuItem>
                            ))}
                            <MenuItem
                              value="create-new"
                              sx={{
                                borderTop: '1px solid',
                                borderColor: 'divider',
                                color: 'primary.main',
                                fontWeight: 500,
                              }}
                            >
                              <AddIcon sx={{ mr: 1, fontSize: 20 }} />
                              Create new wallet
                            </MenuItem>
                          </Select>
                          {requiresLinkedWallet && (
                            <FormHelperText>{getLinkedWalletHelperText()}</FormHelperText>
                          )}
                        </>
                      )}
                    </FormControl>
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

      {/* Wallet Creation Modal */}
      <WalletFormModal
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        defaultType={getSuggestedWalletType()}
        onWalletCreated={handleWalletCreated}
      />
    </>
  );
};

export default PaymentMethodFormModal;
