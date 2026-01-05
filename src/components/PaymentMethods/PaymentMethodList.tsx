import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Box, Chip, IconButton } from '@mui/material';
import type { PaymentMethod, TTableContent } from '../../types';
import type { TTableData } from '../../types/table';
import { formatDate } from '../../utils';
import DataTable from '../common/DataTable';

interface PaymentMethodListProps {
  paymentMethods: PaymentMethod[];
  onEdit: (paymentMethod: PaymentMethod) => void;
  onDelete: (id: number) => void;
  onViewDetails: (paymentMethod: PaymentMethod) => void;
}

const PaymentMethodList = ({
  paymentMethods,
  onEdit,
  onDelete,
  onViewDetails,
}: PaymentMethodListProps) => {
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
      key: 'description',
      content: 'Description',
    },
    {
      key: 'statementDate',
      content: 'Statement Date',
    },
    {
      key: 'paymentDueDate',
      content: 'Payment Due Date',
    },
    {
      key: 'createdAt',
      content: 'Created',
    },
    {
      key: 'actions',
      content: 'Actions',
    },
  ];

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      cash: 'Cash',
      'e-wallet': 'E-Wallet',
      'credit-card': 'Credit Card',
      'debit-card': 'Debit Card',
      'bank-account': 'Bank Account',
      other: 'Other',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<
      string,
      'default' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'
    > = {
      cash: 'success',
      'e-wallet': 'info',
      'credit-card': 'warning',
      'debit-card': 'primary',
      'bank-account': 'secondary',
      other: 'default',
    };
    return colors[type] || 'default';
  };

  const data: TTableData[] = paymentMethods.map((paymentMethod) => ({
    key: paymentMethod.id,
    rows: [
      {
        key: 'name',
        content: <Box sx={{ fontWeight: 'medium' }}>{paymentMethod.name}</Box>,
      },
      {
        key: 'type',
        content: (
          <Chip
            label={getTypeLabel(paymentMethod.type)}
            color={getTypeColor(paymentMethod.type)}
            size="small"
            variant="outlined"
          />
        ),
      },
      {
        key: 'description',
        content: (
          <Box sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
            {paymentMethod.description || '-'}
          </Box>
        ),
      },
      {
        key: 'statementDate',
        content: paymentMethod.statementDate ? `Day ${paymentMethod.statementDate}` : '-',
      },
      {
        key: 'paymentDueDate',
        content: paymentMethod.paymentDueDate ? `Day ${paymentMethod.paymentDueDate}` : '-',
      },
      {
        key: 'createdAt',
        content: formatDate(paymentMethod.createdAt),
      },
      {
        key: 'actions',
        content: (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              color="info"
              onClick={() => onViewDetails(paymentMethod)}
              aria-label="view details"
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="primary"
              onClick={() => onEdit(paymentMethod)}
              aria-label="edit"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(paymentMethod.id)}
              aria-label="delete"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ],
  }));

  return <DataTable data={data} headers={headers} />;
};

export default PaymentMethodList;
