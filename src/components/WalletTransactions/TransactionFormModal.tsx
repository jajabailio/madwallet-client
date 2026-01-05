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
import type { Wallet, WalletTransaction } from '../../types';
import FormBuilder from '../form/FormBuilder';

interface TransactionFormModalProps {
  open: boolean;
  onClose: () => void;
}

// Joi validation schema for income transaction
const incomeSchema = Joi.object({
  description: Joi.string().required().min(2).max(500),
  amount: Joi.number().positive().required().label('amount'),
  date: Joi.date().required().max('now').label('date'),
  walletId: Joi.number().integer().positive().required().label('wallet'),
});

// Joi validation schema for transfer transaction
const transferSchema = Joi.object({
  description: Joi.string().required().min(2).max(500),
  amount: Joi.number().positive().required().label('amount'),
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
  const { wallets, setWallets } = useWallets();
  const { transactions, setTransactions, refreshTransactions } = useWalletTransactions();
  const { refreshSummary } = useDashboard();
  const [tabValue, setTabValue] = useState(0);

  // Fetch transactions on component mount
  useEffect(() => {
    refreshTransactions();
  }, [refreshTransactions]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleIncomeSubmit = async (data: Record<string, unknown>) => {
    // Convert amount from dollars to cents
    const amountInDollars = Number(data.amount);
    const amountCents = Math.round(amountInDollars * 100);
    const walletId = Number(data.walletId);

    // Find the wallet to update
    const wallet = wallets.find((w) => w.id === walletId);
    if (!wallet) {
      toast.error('Wallet not found');
      return;
    }

    // Create optimistic transaction
    const optimisticTransaction: WalletTransaction = {
      id: -Date.now(),
      description: data.description as string,
      amountCents,
      type: 'income' as const,
      date: new Date(data.date as string),
      walletId,
      balanceAfterCents: wallet.balanceCents + amountCents,
      userId: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    };

    // Store previous state for rollback
    const previousTransactions = [...transactions];
    const previousWallets = [...wallets];

    // Optimistic updates
    setTransactions([optimisticTransaction, ...transactions]);
    setWallets(
      wallets.map((w) =>
        w.id === walletId ? { ...w, balanceCents: w.balanceCents + amountCents } : w,
      ),
    );
    onClose();

    try {
      const response = await httpService<{
        data: { transaction: WalletTransaction; wallet: Wallet };
      }>({
        method: 'post',
        url: '/wallet-transactions/income',
        data: {
          description: data.description,
          amountCents,
          date: data.date,
          walletId,
        },
      });

      // Replace optimistic transaction with server response
      setTransactions((prev) =>
        prev
          ? prev.map((t) =>
              t.id === optimisticTransaction.id ? response.data.data.transaction : t,
            )
          : null,
      );
      setWallets((prev) =>
        prev ? prev.map((w) => (w.id === walletId ? response.data.data.wallet : w)) : null,
      );

      await refreshSummary();
      toast.success('Income transaction added successfully!');
    } catch (error) {
      // Rollback on error
      setTransactions(previousTransactions);
      setWallets(previousWallets);

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
    // Convert amount from dollars to cents
    const amountInDollars = Number(data.amount);
    const amountCents = Math.round(amountInDollars * 100);
    const fromWalletId = Number(data.fromWalletId);
    const toWalletId = Number(data.toWalletId);

    // Find the wallets
    const fromWallet = wallets.find((w) => w.id === fromWalletId);
    const toWallet = wallets.find((w) => w.id === toWalletId);

    if (!fromWallet || !toWallet) {
      toast.error('Wallet not found');
      return;
    }

    // Create optimistic transactions (transfer creates 2 transactions)
    const optimisticTransactionFrom: WalletTransaction = {
      id: -Date.now(),
      description: data.description as string,
      amountCents,
      type: 'transfer' as const,
      date: new Date(data.date as string),
      walletId: fromWalletId,
      balanceAfterCents: fromWallet.balanceCents - amountCents,
      userId: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    };

    const optimisticTransactionTo: WalletTransaction = {
      id: -Date.now() - 1,
      description: data.description as string,
      amountCents,
      type: 'transfer' as const,
      date: new Date(data.date as string),
      walletId: toWalletId,
      balanceAfterCents: toWallet.balanceCents + amountCents,
      userId: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    };

    // Store previous state for rollback
    const previousTransactions = [...transactions];
    const previousWallets = [...wallets];

    // Optimistic updates
    setTransactions([optimisticTransactionFrom, optimisticTransactionTo, ...transactions]);
    setWallets(
      wallets.map((w) => {
        if (w.id === fromWalletId) {
          return { ...w, balanceCents: w.balanceCents - amountCents };
        }
        if (w.id === toWalletId) {
          return { ...w, balanceCents: w.balanceCents + amountCents };
        }
        return w;
      }),
    );
    onClose();

    try {
      const response = await httpService<{
        data: { transactions: WalletTransaction[]; wallets: Wallet[] };
      }>({
        method: 'post',
        url: '/wallet-transactions/transfer',
        data: {
          description: data.description,
          amountCents,
          date: data.date,
          fromWalletId,
          toWalletId,
        },
      });

      // Replace optimistic transactions with server response
      setTransactions((prev) => {
        if (!prev) return null;
        const filtered = prev.filter(
          (t) => t.id !== optimisticTransactionFrom.id && t.id !== optimisticTransactionTo.id,
        );
        return [...response.data.data.transactions, ...filtered];
      });

      setWallets((prev) =>
        prev
          ? prev.map((w) => {
              const updatedWallet = response.data.data.wallets.find((uw) => uw.id === w.id);
              return updatedWallet || w;
            })
          : null,
      );

      await refreshSummary();
      toast.success('Transfer completed successfully!');
    } catch (error) {
      // Rollback on error
      setTransactions(previousTransactions);
      setWallets(previousWallets);

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
  }, [
    open,
    wallets,
    incomeForm.reset, // Set default values
    incomeForm.setValue,
    transferForm.reset,
    transferForm.setValue,
  ]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
      <DialogTitle>Add Transaction</DialogTitle>
      <DialogContent>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
        >
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
                name: 'amount',
                label: 'Amount',
                placeholder: '0.00',
                required: true,
                textFieldProps: {
                  inputProps: { step: '0.01', min: '0.01' },
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
                name: 'amount',
                label: 'Amount',
                placeholder: '0.00',
                required: true,
                textFieldProps: {
                  inputProps: { step: '0.01', min: '0.01' },
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
