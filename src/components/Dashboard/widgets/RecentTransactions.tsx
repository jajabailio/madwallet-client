import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import {
  Box,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import type { WalletTransaction } from '../../../types';
import { formatCurrency, formatDate } from '../../../utils';

interface RecentTransactionsProps {
  transactions: WalletTransaction[];
  limit?: number;
}

const RecentTransactions = ({ transactions, limit = 5 }: RecentTransactionsProps) => {
  const displayTransactions = transactions.slice(0, limit);

  const formatTransactionType = (type: string): string => {
    const typeMap: Record<string, string> = {
      income: 'Income',
      transfer_in: 'Transfer In',
      transfer_out: 'Transfer Out',
    };
    return typeMap[type] || type;
  };

  const getTypeColor = (type: string): 'success' | 'error' | 'warning' | 'default' => {
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

  const getAmountPrefix = (type: string): string => {
    if (type === 'transfer_out') return '-';
    return '+';
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <ReceiptLongIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Recent Transactions
          </Typography>
        </Box>

        {displayTransactions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <Typography variant="body1">No transactions yet</Typography>
            <Typography variant="body2">Add income or make transfers to see them here</Typography>
          </Box>
        ) : (
          <List dense sx={{ p: 0 }}>
            {displayTransactions.map((transaction) => (
              <ListItem
                key={transaction.id}
                sx={{
                  px: 0,
                  py: 1.5,
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
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {transaction.description}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 'bold',
                          color:
                            transaction.type === 'income' || transaction.type === 'transfer_in'
                              ? 'success.main'
                              : 'error.main',
                        }}
                      >
                        {getAmountPrefix(transaction.type)}
                        {formatCurrency(transaction.amountCents)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(transaction.date)}
                      </Typography>
                      {transaction.wallet && (
                        <Typography variant="caption" color="text.secondary">
                          • {transaction.wallet.name}
                        </Typography>
                      )}
                      <Chip
                        label={formatTransactionType(transaction.type)}
                        size="small"
                        color={getTypeColor(transaction.type)}
                        variant="outlined"
                        sx={{ height: 18, fontSize: '0.65rem', ml: 'auto' }}
                      />
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
