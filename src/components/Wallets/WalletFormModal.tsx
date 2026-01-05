import { Dialog, DialogContent, DialogTitle, Grid, useMediaQuery, useTheme } from '@mui/material';
import Joi from 'joi';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useDashboard, useWallets } from '../../contexts';
import { httpService } from '../../services';
import type { Wallet } from '../../types';
import FormBuilder from '../form/FormBuilder';

interface WalletFormModalProps {
  open: boolean;
  onClose: () => void;
  editingWallet?: Wallet | null;
}

// Joi validation schema for wallet
const walletSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  description: Joi.string().allow('').max(500).optional(),
  type: Joi.string().required().valid('bank_account', 'e_wallet', 'cash', 'savings'),
  balance: Joi.number().min(0).optional().label('initial balance'),
  currency: Joi.string().length(3).optional().label('currency'),
  isActive: Joi.boolean().optional(),
});

const WalletFormModal = ({ open, onClose, editingWallet }: WalletFormModalProps) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { wallets, setWallets } = useWallets();
  const { refreshSummary } = useDashboard();
  const isEditing = !!editingWallet;

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (isEditing && editingWallet) {
      // Update existing wallet
      const previousWallets = [...wallets];

      // Optimistic update
      const updatedWallet: Wallet = {
        ...editingWallet,
        name: data.name as string,
        description: data.description as string,
        type: data.type as string,
        isActive: data.isActive as boolean,
        updatedAt: new Date(),
      };

      setWallets(wallets.map((w) => (w.id === editingWallet.id ? updatedWallet : w)));
      onClose();

      try {
        const response = await httpService<{ data: Wallet }>({
          method: 'put',
          url: `/wallets/${editingWallet.id}`,
          data: {
            name: data.name,
            description: data.description,
            type: data.type,
            isActive: data.isActive,
          },
        });

        setWallets((prev) =>
          prev
            ? prev.map((wallet) => (wallet.id === editingWallet.id ? response.data.data : wallet))
            : null,
        );

        await refreshSummary();
        toast.success('Wallet updated successfully!');
      } catch (error) {
        setWallets(previousWallets);
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { data?: { error?: string } } };
          const errorMessage =
            axiosError.response?.data?.error || 'Failed to update wallet. Please try again.';
          toast.error(errorMessage);
        } else {
          toast.error('Failed to update wallet. Please try again.');
        }
        console.error('Failed to update wallet:', error);
      }
    } else {
      // Create new wallet
      // Convert balance from dollars to cents
      const balanceInDollars = data.balance ? Number(data.balance) : 0;
      const balanceCents = Math.round(balanceInDollars * 100);

      // Optimistic wallet
      const optimisticWallet: Wallet = {
        id: -Date.now(),
        name: data.name as string,
        description: data.description as string,
        type: data.type as string,
        balanceCents,
        currency: (data.currency as string) || 'PHP',
        isActive: true,
        isDeleted: false,
        userId: 0, // Will be set by server
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const previousWallets = [...wallets];

      setWallets([optimisticWallet, ...wallets]);
      onClose();

      try {
        const response = await httpService<{ data: Wallet }>({
          method: 'post',
          url: '/wallets',
          data: {
            name: data.name,
            description: data.description,
            type: data.type,
            balanceCents,
            currency: data.currency || 'PHP',
          },
        });

        setWallets((prev) =>
          prev
            ? prev.map((wallet) =>
                wallet.id === optimisticWallet.id ? response.data.data : wallet,
              )
            : null,
        );

        await refreshSummary();
        toast.success('Wallet created successfully!');
      } catch (error) {
        setWallets(previousWallets);
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { data?: { error?: string } } };
          const errorMessage =
            axiosError.response?.data?.error || 'Failed to create wallet. Please try again.';
          toast.error(errorMessage);
        } else {
          toast.error('Failed to create wallet. Please try again.');
        }
        console.error('Failed to create wallet:', error);
      }
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
  } = FormBuilder({
    schema: walletSchema,
    onSubmit: handleSubmit,
  });

  // Reset form and pre-populate when modal opens
  useEffect(() => {
    if (open) {
      reset();
      if (editingWallet) {
        setValue('name', editingWallet.name);
        setValue('description', editingWallet.description || '');
        setValue('type', editingWallet.type);
        setValue('isActive', editingWallet.isActive);
      } else {
        setValue('type', 'bank_account');
        setValue('balance', 0);
        setValue('currency', 'PHP');
        setValue('isActive', true);
      }
    }
  }, [editingWallet, open, reset, setValue]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
      <DialogTitle>{isEditing ? 'Edit Wallet' : 'Add New Wallet'}</DialogTitle>
      <DialogContent>
        <form onSubmit={formHandleSubmit}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {renderTextInput({
              name: 'name',
              label: 'Wallet Name',
              placeholder: 'e.g., BDO Savings Account',
              required: true,
            })}
            {renderTextArea({
              name: 'description',
              label: 'Description',
              placeholder: 'Optional description',
              rows: 3,
            })}
            {renderSelect({
              name: 'type',
              label: 'Wallet Type',
              required: true,
              options: [
                { value: 'bank_account', label: 'Bank Account' },
                { value: 'e_wallet', label: 'E-Wallet' },
                { value: 'cash', label: 'Cash' },
                { value: 'savings', label: 'Savings' },
              ],
            })}
            {!isEditing && (
              <>
                <Grid size={6}>
                  {renderTextInput({
                    type: 'number',
                    name: 'balance',
                    label: 'Initial Balance',
                    placeholder: '0.00',
                    textFieldProps: {
                      inputProps: { step: '0.01', min: '0' },
                    },
                  })}
                </Grid>
                <Grid size={6}>
                  {renderTextInput({
                    name: 'currency',
                    label: 'Currency',
                    placeholder: 'PHP',
                    textFieldProps: {
                      inputProps: { maxLength: 3 },
                    },
                  })}
                </Grid>
              </>
            )}
            {isEditing &&
              renderCheckbox({
                name: 'isActive',
                label: 'Active',
                defaultValue: true,
              })}
            <Grid size={12}>
              {renderButton({
                text: isEditing ? 'Update Wallet' : 'Add Wallet',
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

export default WalletFormModal;
