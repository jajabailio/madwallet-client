import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useWallets } from '../../contexts';
import { httpService } from '../../services';
import type { Expense } from '../../types';
import { formatCurrency } from '../../utils';

interface PayExpenseModalProps {
  open: boolean;
  onClose: () => void;
  expense: Expense | null;
  onPaymentSuccess: () => void;
}

const PayExpenseModal = ({ open, onClose, expense, onPaymentSuccess }: PayExpenseModalProps) => {
  const { wallets } = useWallets();
  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);
  const [paying, setPaying] = useState(false);

  if (!expense) return null;

  const activeWallets = wallets.filter((w) => w.isActive && !w.isDeleted);

  const handlePay = async () => {
    if (!selectedWalletId) {
      toast.error('Please select a wallet');
      return;
    }

    setPaying(true);

    try {
      await httpService({
        method: 'post',
        url: `/expenses/${expense.id}/pay`,
        data: { walletId: selectedWalletId },
      });

      toast.success('Expense paid successfully!');
      onPaymentSuccess();
      onClose();
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        const errorMessage = axiosError.response?.data?.error || 'Failed to pay expense';
        toast.error(errorMessage);
      } else {
        toast.error('Failed to pay expense');
      }
      console.error('Failed to pay expense:', error);
    } finally {
      setPaying(false);
    }
  };

  const handleClose = () => {
    if (!paying) {
      setSelectedWalletId(null);
      onClose();
    }
  };

  const selectedWallet = activeWallets.find((w) => w.id === selectedWalletId);
  const hasSufficientBalance = selectedWallet && selectedWallet.balanceCents >= expense.amountCents;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Pay Expense</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Expense
          </Typography>
          <Typography variant="h6">{expense.description}</Typography>
          <Typography variant="h5" color="primary" sx={{ mt: 1 }}>
            {formatCurrency(expense.amountCents)}
          </Typography>
        </Box>

        {activeWallets.length === 0 ? (
          <Alert severity="warning">No active wallets found. Please create a wallet first.</Alert>
        ) : (
          <>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend">Select Wallet to Pay From</FormLabel>
              <RadioGroup
                value={selectedWalletId}
                onChange={(e) => setSelectedWalletId(Number(e.target.value))}
              >
                {activeWallets.map((wallet) => {
                  const hasBalance = wallet.balanceCents >= expense.amountCents;
                  return (
                    <FormControlLabel
                      key={wallet.id}
                      value={wallet.id}
                      control={<Radio />}
                      label={
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: '100%',
                            pr: 2,
                          }}
                        >
                          <Box>
                            <Typography variant="body1">{wallet.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {wallet.type}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography
                              variant="body2"
                              color={hasBalance ? 'success.main' : 'error.main'}
                            >
                              {formatCurrency(wallet.balanceCents)}
                            </Typography>
                            {!hasBalance && (
                              <Typography variant="caption" color="error">
                                Insufficient
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      }
                      disabled={!hasBalance}
                    />
                  );
                })}
              </RadioGroup>
            </FormControl>

            {selectedWallet && !hasSufficientBalance && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Selected wallet has insufficient balance. Need{' '}
                {formatCurrency(expense.amountCents - selectedWallet.balanceCents)} more.
              </Alert>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={paying}>
          Cancel
        </Button>
        <Button
          onClick={handlePay}
          variant="contained"
          disabled={
            !selectedWalletId || !hasSufficientBalance || paying || activeWallets.length === 0
          }
        >
          {paying ? 'Processing...' : 'Pay Now'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PayExpenseModal;
