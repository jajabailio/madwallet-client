import {
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Tab,
  Tabs,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Joi from 'joi';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useDashboard, useWallets, useWalletTransactions } from '../../contexts';
import { httpService } from '../../services';
import FormBuilder from '../form/FormBuilder';

interface TransactionFormModalProps {
  open: boolean;
  onClose: () => void;
}

// Joi validation schema for income transaction
const incomeSchema = Joi.object({
  description: Joi.string().required().min(2).max(500),
  amountCents: Joi.number().integer().positive().required().label('amount'),
  date: Joi.date().required().max('now').label('date'),
  walletId: Joi.number().integer().positive().required().label('wallet'),
});

// Joi validation schema for transfer transaction
const transferSchema = Joi.object({
  description: Joi.string().required().min(2).max(500),
  amountCents: Joi.number().integer().positive().required().label('amount'),
  date: Joi.date().required().max('now').label('date'),
  fromWalletId: Joi.number().integer().positive().required().label('from wallet'),
  toWalletId: Joi.number().integer().positive().required().label('to wallet'),
}).custom((value, helpers) => {
  // Validate that fromWalletId and toWalletId are different
  if (value.fromWalletId === value.toWalletId) {
    return helpers.message({
      custom: 'Cannot transfer to the same wallet',
    });
  }
  return value;
});

const TransactionFormModal = ({ open, onClose }: TransactionFormModalProps) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { wallets } = useWallets();
  const { refreshTransactions } = useWalletTransactions();
  const { refreshSummary } = useDashboard();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleIncomeSubmit = async (data: Record<string, unknown>) => {
    try {
      await httpService({
        method: 'post',
        url: '/wallet-transactions/income',
        data: {
          description: data.description,
          amountCents: Number(data.amountCents),
          date: data.date,
          walletId: Number(data.walletId),
        },
      });

      await refreshTransactions();
      await refreshSummary();
      toast.success('Income transaction added successfully!');
      onClose();
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        const errorMessage =
          axiosError.response?.data?.error || 'Failed to add income transaction. Please try again.';
        toast.error(errorMessage);
      } else {
        toast.error('Failed to add income transaction. Please try again.');
      }
      console.error('Failed to add income transaction:', error);
    }
  };

  const handleTransferSubmit = async (data: Record<string, unknown>) => {
    try {
      await httpService({
        method: 'post',
        url: '/wallet-transactions/transfer',
        data: {
          description: data.description,
          amountCents: Number(data.amountCents),
          date: data.date,
          fromWalletId: Number(data.fromWalletId),
          toWalletId: Number(data.toWalletId),
        },
      });

      await refreshTransactions();
      await refreshSummary();
      toast.success('Transfer completed successfully!');
      onClose();
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        const errorMessage =
          axiosError.response?.data?.error || 'Failed to complete transfer. Please try again.';
        toast.error(errorMessage);
      } else {
        toast.error('Failed to complete transfer. Please try again.');
      }
      console.error('Failed to complete transfer:', error);
    }
  };

  const incomeForm = FormBuilder({
    schema: incomeSchema,
    onSubmit: handleIncomeSubmit,
  });

  const transferForm = FormBuilder({
    schema: transferSchema,
    onSubmit: handleTransferSubmit,
  });

  // Reset forms and set defaults when modal opens
  useEffect(() => {
    if (open) {
      incomeForm.reset();
      transferForm.reset();

      // Set default values
      incomeForm.setValue('date', new Date().toISOString().split('T')[0]);
      transferForm.setValue('date', new Date().toISOString().split('T')[0]);

      if (wallets.length > 0) {
        incomeForm.setValue('walletId', wallets[0].id);
        transferForm.setValue('fromWalletId', wallets[0].id);
        if (wallets.length > 1) {
          transferForm.setValue('toWalletId', wallets[1].id);
        }
      }
    }
  }, [open, wallets]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
      <DialogTitle>Add Transaction</DialogTitle>
      <DialogContent>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Income" />
          <Tab label="Transfer" />
        </Tabs>

        {/* Income Tab */}
        {tabValue === 0 && (
          <form onSubmit={incomeForm.handleSubmit}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {incomeForm.renderTextInput({
                name: 'description',
                label: 'Description',
                placeholder: 'e.g., Salary, Bonus, Gift',
                required: true,
              })}
              {incomeForm.renderTextInput({
                type: 'number',
                name: 'amountCents',
                label: 'Amount (in cents)',
                placeholder: '0',
                required: true,
                textFieldProps: {
                  inputProps: { step: '1', min: '1' },
                },
              })}
              {incomeForm.renderTextInput({
                type: 'date',
                name: 'date',
                label: 'Date',
                required: true,
              })}
              {incomeForm.renderSelect({
                name: 'walletId',
                label: 'Wallet',
                required: true,
                options: wallets.map((wallet) => ({
                  value: wallet.id,
                  label: wallet.name,
                })),
              })}
              <Grid size={12}>
                {incomeForm.renderButton({
                  text: 'Add Income',
                  variant: 'contained',
                  fullWidth: true,
                })}
              </Grid>
            </Grid>
          </form>
        )}

        {/* Transfer Tab */}
        {tabValue === 1 && (
          <form onSubmit={transferForm.handleSubmit}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {transferForm.renderTextInput({
                name: 'description',
                label: 'Description',
                placeholder: 'e.g., Transfer to savings',
                required: true,
              })}
              {transferForm.renderTextInput({
                type: 'number',
                name: 'amountCents',
                label: 'Amount (in cents)',
                placeholder: '0',
                required: true,
                textFieldProps: {
                  inputProps: { step: '1', min: '1' },
                },
              })}
              {transferForm.renderTextInput({
                type: 'date',
                name: 'date',
                label: 'Date',
                required: true,
              })}
              {transferForm.renderSelect({
                name: 'fromWalletId',
                label: 'From Wallet',
                required: true,
                options: wallets.map((wallet) => ({
                  value: wallet.id,
                  label: wallet.name,
                })),
              })}
              {transferForm.renderSelect({
                name: 'toWalletId',
                label: 'To Wallet',
                required: true,
                options: wallets.map((wallet) => ({
                  value: wallet.id,
                  label: wallet.name,
                })),
              })}
              <Grid size={12}>
                {transferForm.renderButton({
                  text: 'Transfer',
                  variant: 'contained',
                  fullWidth: true,
                })}
              </Grid>
            </Grid>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TransactionFormModal;
