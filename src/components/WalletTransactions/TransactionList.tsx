import { Box, Chip, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { WalletTransaction, TTableContent } from '../../types';
import type { TTableData } from '../../types/table';
import { formatCurrency, formatDate } from '../../utils';
import DataTable from '../common/DataTable';

interface TransactionListProps {
  transactions: WalletTransaction[];
  onDelete: (id: number) => void;
}

const TransactionList = ({ transactions, onDelete }: TransactionListProps) => {
  const headers: TTableContent[] = [
    {
      key: 'date',
      content: 'Date',
    },
    {
      key: 'description',
      content: 'Description',
    },
    {
      key: 'wallet',
      content: 'Wallet',
    },
    {
      key: 'type',
      content: 'Type',
    },
    {
      key: 'amount',
      content: 'Amount',
    },
    {
      key: 'balanceAfter',
      content: 'Balance After',
    },
    {
      key: 'actions',
      content: 'Actions',
    },
  ];

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
        return 'success';
      case 'transfer_in':
        return 'success';
      case 'transfer_out':
        return 'error';
      default:
        return 'default';
    }
  };

  const data: TTableData[] = transactions.map((transaction) => ({
    key: transaction.id,
    rows: [
      {
        key: 'date',
        content: formatDate(transaction.date),
      },
      {
        key: 'description',
        content: <Box sx={{ fontWeight: 'medium' }}>{transaction.description}</Box>,
      },
      {
        key: 'wallet',
        content: transaction.wallet ? (
          <Box sx={{ color: 'text.secondary' }}>{transaction.wallet.name}</Box>
        ) : (
          '-'
        ),
      },
      {
        key: 'type',
        content: (
          <Chip
            label={formatTransactionType(transaction.type)}
            size="small"
            color={getTypeColor(transaction.type)}
            variant="outlined"
          />
        ),
      },
      {
        key: 'amount',
        content: (
          <Box
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
          </Box>
        ),
      },
      {
        key: 'balanceAfter',
        content: (
          <Box sx={{ color: 'text.secondary' }}>
            {formatCurrency(transaction.balanceAfterCents)}
          </Box>
        ),
      },
      {
        key: 'actions',
        content: (
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(transaction.id);
            }}
            aria-label="delete"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        ),
      },
    ],
  }));

  return <DataTable data={data} headers={headers} />;
};

export default TransactionList;
