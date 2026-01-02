import { Box, Chip, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import type { Wallet, TTableContent } from '../../types';
import type { TTableData } from '../../types/table';
import { formatCurrency } from '../../utils';
import DataTable from '../common/DataTable';

interface WalletListProps {
  wallets: Wallet[];
  onEdit: (wallet: Wallet) => void;
  onDelete: (id: number) => void;
  onViewDetails: (wallet: Wallet) => void;
}

const WalletList = ({ wallets, onEdit, onDelete, onViewDetails }: WalletListProps) => {
  const headers: TTableContent[] = [
    {
      key: 'name',
      content: 'Name',
    },
    {
      key: 'type',
      content: 'Type',
    },
    {
      key: 'balance',
      content: 'Balance',
    },
    {
      key: 'currency',
      content: 'Currency',
    },
    {
      key: 'status',
      content: 'Status',
    },
    {
      key: 'actions',
      content: 'Actions',
    },
  ];

  const formatWalletType = (type: string): string => {
    const typeMap: Record<string, string> = {
      bank_account: 'Bank Account',
      e_wallet: 'E-Wallet',
      cash: 'Cash',
      savings: 'Savings',
    };
    return typeMap[type] || type;
  };

  const data: TTableData[] = wallets.map((wallet) => ({
    key: wallet.id,
    rows: [
      {
        key: 'name',
        content: (
          <Box sx={{ fontWeight: 'medium' }}>
            {wallet.name}
            {wallet.description && (
              <Box sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.5 }}>
                {wallet.description}
              </Box>
            )}
          </Box>
        ),
      },
      {
        key: 'type',
        content: (
          <Chip label={formatWalletType(wallet.type)} size="small" variant="outlined" />
        ),
      },
      {
        key: 'balance',
        content: (
          <Box
            sx={{
              fontWeight: 'medium',
              color: wallet.balanceCents >= 0 ? 'success.main' : 'error.main',
            }}
          >
            {formatCurrency(wallet.balanceCents)}
          </Box>
        ),
      },
      {
        key: 'currency',
        content: <Box sx={{ color: 'text.secondary' }}>{wallet.currency}</Box>,
      },
      {
        key: 'status',
        content: (
          <Chip
            label={wallet.isActive ? 'Active' : 'Inactive'}
            color={wallet.isActive ? 'success' : 'default'}
            size="small"
            variant="outlined"
          />
        ),
      },
      {
        key: 'actions',
        content: (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(wallet);
              }}
              aria-label="edit"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(wallet.id);
              }}
              aria-label="delete"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ],
  }));

  const handleRowClick = (rowKey: number | string) => {
    const wallet = wallets.find((w) => w.id === rowKey);
    if (wallet) {
      onViewDetails(wallet);
    }
  };

  return <DataTable data={data} headers={headers} onRowClick={handleRowClick} />;
};

export default WalletList;
