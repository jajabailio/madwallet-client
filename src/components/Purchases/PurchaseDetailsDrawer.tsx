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
import CloseIcon from '@mui/icons-material/Close';
import { formatCurrency, formatDate } from '../../utils';
import type { Purchase } from '../../types';

interface PurchaseDetailsDrawerProps {
  purchase: Purchase | null;
  open: boolean;
  onClose: () => void;
}

const PurchaseDetailsDrawer = ({ purchase, open, onClose }: PurchaseDetailsDrawerProps) => {
  if (!purchase) return null;

  const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body1">{value || '—'}</Typography>
    </Box>
  );

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 500, p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            Purchase Details
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Main Details */}
        <Stack spacing={2}>
          <DetailRow label="Description" value={purchase.description} />

          <DetailRow label="Total Amount" value={
            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
              {formatCurrency(purchase.totalAmount)}
            </Typography>
          } />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <DetailRow label="Installment Count" value={purchase.installmentCount} />
            <DetailRow label="Frequency" value={
              <Chip label={purchase.frequency} size="small" variant="outlined" />
            } />
          </Box>

          <DetailRow label="Status" value={
            <Chip
              label={purchase.status}
              size="small"
              color={getStatusColor(purchase.status)}
            />
          } />

          <Divider sx={{ my: 2 }} />

          <DetailRow label="Category" value={
            purchase.category ? (
              <Chip
                label={purchase.category.name}
                size="small"
                sx={{ bgcolor: purchase.category.color, color: '#fff' }}
              />
            ) : '—'
          } />

          <DetailRow label="Default Status for Installments" value={
            purchase.defaultStatus ? (
              <Chip label={purchase.defaultStatus.name} size="small" color="default" />
            ) : '—'
          } />

          <DetailRow label="Payment Method" value={
            purchase.paymentMethod ? (
              <Chip label={purchase.paymentMethod.name} size="small" variant="outlined" />
            ) : '—'
          } />

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <DetailRow label="Start Date" value={formatDate(purchase.startDate)} />
            <DetailRow label="End Date" value={
              purchase.endDate ? formatDate(purchase.endDate) : '—'
            } />
          </Box>

          {/* Installments/Expenses List */}
          {purchase.expenses && purchase.expenses.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Installments ({purchase.expenses.length})
              </Typography>

              <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1, p: 0 }}>
                {purchase.expenses.map((expense) => (
                  <ListItem
                    key={expense.id}
                    sx={{
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2">
                            Installment {expense.installmentNumber}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {formatCurrency(expense.amount)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Due: {formatDate(expense.dueDate || expense.date)}
                          </Typography>
                          {expense.status && (
                            <Chip
                              label={expense.status.name}
                              size="small"
                              color={expense.status.name === 'Paid' ? 'success' : 'warning'}
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Timestamps */}
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Timestamps
          </Typography>

          <DetailRow label="Created At" value={formatDate(purchase.createdAt)} />

          <DetailRow label="Updated At" value={formatDate(purchase.updatedAt)} />
        </Stack>
      </Box>
    </Drawer>
  );
};

export default PurchaseDetailsDrawer;
