import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { httpService } from '../../services';
import type { Wallet, WalletTransaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils';

interface WalletDetailsDrawerProps {
  wallet: Wallet | null;
  open: boolean;
  onClose: () => void;
}

const WalletDetailsDrawer = ({ wallet, open, onClose }: WalletDetailsDrawerProps) => {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!wallet) return;

      try {
        setLoadingTransactions(true);
        const response = await httpService<{ data: WalletTransaction[] }>({
          method: 'get',
          url: `/wallet-transactions?walletId=${wallet.id}`,
        });
        // Show only the last 10 transactions
        setTransactions(response.data.data.slice(0, 10));
      } catch (error) {
        console.error('Failed to fetch wallet transactions:', error);
      } finally {
        setLoadingTransactions(false);
      }
    };

    if (open && wallet) {
      fetchTransactions();
    }
  }, [wallet, open]);

  if (!wallet) return null;

  const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body1">{value || '—'}</Typography>
    </Box>
  );

  const formatWalletType = (type: string): string => {
    const typeMap: Record<string, string> = {
      bank_account: 'Bank Account',
      e_wallet: 'E-Wallet',
      cash: 'Cash',
      savings: 'Savings',
    };
    return typeMap[type] || type;
  };

  const getTransactionTypeColor = (type: string): 'success' | 'error' | 'warning' | 'default' => {
    switch (type) {
      case 'income':
      case 'transfer_in':
        return 'success';
      case 'transfer_out':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 400, p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            Wallet Details
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Main Details */}
        <Stack spacing={2}>
          <DetailRow label="Name" value={wallet.name} />

          {wallet.description && <DetailRow label="Description" value={wallet.description} />}

          <DetailRow
            label="Type"
            value={<Chip label={formatWalletType(wallet.type)} size="small" variant="outlined" />}
          />

          <DetailRow
            label="Balance"
            value={
              <Typography
                variant="h6"
                sx={{
                  color: wallet.balanceCents >= 0 ? 'success.main' : 'error.main',
                  fontWeight: 'bold',
                }}
              >
                {formatCurrency(wallet.balanceCents)}
              </Typography>
            }
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <DetailRow label="Currency" value={wallet.currency} />
            <DetailRow
              label="Status"
              value={
                <Chip
                  label={wallet.isActive ? 'Active' : 'Inactive'}
                  size="small"
                  color={wallet.isActive ? 'success' : 'default'}
                />
              }
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Recent Transactions */}
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Recent Transactions (Last 10)
          </Typography>

          {loadingTransactions ? (
            <Typography variant="body2" color="text.secondary">
              Loading transactions...
            </Typography>
          ) : transactions.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No transactions yet
            </Typography>
          ) : (
            <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
              {transactions.map((transaction) => (
                <ListItem
                  key={transaction.id}
                  sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="body2">{transaction.description}</Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 'bold',
                            color:
                              transaction.type === 'income' || transaction.type === 'transfer_in'
                                ? 'success.main'
                                : 'error.main',
                          }}
                        >
                          {transaction.type === 'transfer_out' ? '-' : '+'}
                          {formatCurrency(transaction.amountCents)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mt: 0.5,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(transaction.date)}
                        </Typography>
                        <Chip
                          label={transaction.type.replace('_', ' ')}
                          size="small"
                          color={getTransactionTypeColor(transaction.type)}
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.65rem' }}
                        />
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Timestamps */}
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Timestamps
          </Typography>

          <DetailRow label="Created At" value={formatDate(wallet.createdAt)} />

          <DetailRow label="Updated At" value={formatDate(wallet.updatedAt)} />
        </Stack>
      </Box>
    </Drawer>
  );
};

export default WalletDetailsDrawer;
