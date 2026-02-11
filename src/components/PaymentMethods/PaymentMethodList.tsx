import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useState } from 'react';
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

const getTypeColor = (
  type: string,
): 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' => {
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

// Mobile Card Component
const MobilePaymentMethodCard = ({
  paymentMethod,
  onEdit,
  onDelete,
  onViewDetails,
}: {
  paymentMethod: PaymentMethod;
  onEdit: (paymentMethod: PaymentMethod) => void;
  onDelete: (id: number) => void;
  onViewDetails: (paymentMethod: PaymentMethod) => void;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    onEdit(paymentMethod);
  };

  const handleDelete = () => {
    handleMenuClose();
    onDelete(paymentMethod.id);
  };

  const hasDateInfo = paymentMethod.statementDate || paymentMethod.paymentDueDate;

  return (
    <Card
      onClick={() => onViewDetails(paymentMethod)}
      sx={{
        cursor: 'pointer',
        '&:hover': { boxShadow: 3 },
      }}
    >
      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
        {/* Header Row: Name, Type, and Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }} noWrap>
              {paymentMethod.name}
            </Typography>
          </Box>
          <Chip
            label={getTypeLabel(paymentMethod.type)}
            color={getTypeColor(paymentMethod.type)}
            size="small"
            variant="outlined"
          />
          <IconButton size="small" onClick={handleMenuOpen} aria-label="actions" sx={{ ml: 0.5 }}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            onClick={(e) => e.stopPropagation()}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={handleEdit}>
              <ListItemIcon>
                <EditIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleDelete}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </Menu>
        </Box>

        {/* Date Info Row (only if has data) */}
        {hasDateInfo && (
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              mt: 1,
              pt: 1,
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            {paymentMethod.statementDate && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Statement
                </Typography>
                <Typography variant="body2">Day {paymentMethod.statementDate}</Typography>
              </Box>
            )}
            {paymentMethod.paymentDueDate && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Due Date
                </Typography>
                <Typography variant="body2">Day {paymentMethod.paymentDueDate}</Typography>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const PaymentMethodList = ({
  paymentMethods,
  onEdit,
  onDelete,
  onViewDetails,
}: PaymentMethodListProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleRowClick = (rowKey: number | string) => {
    const paymentMethod = paymentMethods.find((pm) => pm.id === rowKey);
    if (paymentMethod) {
      onViewDetails(paymentMethod);
    }
  };

  // Mobile: Custom compact cards
  if (isMobile) {
    return (
      <Stack spacing={1.5}>
        {paymentMethods.map((paymentMethod) => (
          <MobilePaymentMethodCard
            key={paymentMethod.id}
            paymentMethod={paymentMethod}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewDetails={onViewDetails}
          />
        ))}
      </Stack>
    );
  }

  // Desktop: DataTable
  const headers: TTableContent[] = [
    { key: 'name', content: 'Name' },
    { key: 'type', content: 'Type' },
    { key: 'description', content: 'Description' },
    { key: 'statementDate', content: 'Statement Date' },
    { key: 'paymentDueDate', content: 'Payment Due Date' },
    { key: 'createdAt', content: 'Created' },
    { key: 'actions', content: 'Actions' },
  ];

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
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(paymentMethod);
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
                onDelete(paymentMethod.id);
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

  return <DataTable data={data} headers={headers} onRowClick={handleRowClick} />;
};

export default PaymentMethodList;
