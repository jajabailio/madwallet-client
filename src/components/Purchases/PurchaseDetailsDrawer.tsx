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
import type { Purchase } from '../../types';
import { formatCurrency, formatDate } from '../../utils';
import { styles } from './PurchaseDetailsDrawer.styles';

interface PurchaseDetailsDrawerProps {
  purchase: Purchase | null;
  open: boolean;
  onClose: () => void;
}

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box sx={styles.detailRow}>
    <Typography variant="caption" color="text.secondary" sx={styles.detailLabel}>
      {label}
    </Typography>
    <Typography variant="body1">{value || '—'}</Typography>
  </Box>
);

const PurchaseDetailsDrawer = ({ purchase, open, onClose }: PurchaseDetailsDrawerProps) => {
  if (!purchase) return null;

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
      <Box sx={styles.drawer}>
        {/* Header */}
        <Box sx={styles.header}>
          <Typography variant="h5" component="h2">
            Purchase Details
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={styles.divider} />

        {/* Main Details */}
        <Stack spacing={2}>
          <DetailRow label="Description" value={purchase.description} />

          <DetailRow
            label="Total Amount"
            value={
              <Typography variant="h6" color="primary" sx={styles.totalAmount}>
                {formatCurrency(purchase.totalAmountCents)}
              </Typography>
            }
          />

          <Box sx={styles.gridTwoColumns}>
            <DetailRow label="Installment Count" value={purchase.installmentCount} />
            <DetailRow
              label="Frequency"
              value={<Chip label={purchase.frequency} size="small" variant="outlined" />}
            />
          </Box>

          <DetailRow
            label="Status"
            value={
              <Chip label={purchase.status} size="small" color={getStatusColor(purchase.status)} />
            }
          />

          <Divider sx={styles.dividerSpacing} />

          <DetailRow
            label="Category"
            value={
              purchase.category ? (
                <Chip
                  label={purchase.category.name}
                  size="small"
                  sx={{ ...styles.categoryChip, bgcolor: purchase.category.color }}
                />
              ) : (
                '—'
              )
            }
          />

          <DetailRow
            label="Default Status for Installments"
            value={
              purchase.defaultStatus ? (
                <Chip label={purchase.defaultStatus.name} size="small" color="default" />
              ) : (
                '—'
              )
            }
          />

          <DetailRow
            label="Payment Method"
            value={
              purchase.paymentMethod ? (
                <Chip label={purchase.paymentMethod.name} size="small" variant="outlined" />
              ) : (
                '—'
              )
            }
          />

          <Divider sx={styles.dividerSpacing} />

          <Box sx={styles.gridTwoColumns}>
            <DetailRow label="Start Date" value={formatDate(purchase.startDate)} />
            <DetailRow
              label="End Date"
              value={purchase.endDate ? formatDate(purchase.endDate) : '—'}
            />
          </Box>

          {/* Installments/Expenses List */}
          {purchase.expenses && purchase.expenses.length > 0 && (
            <>
              <Divider sx={styles.dividerSpacing} />
              <Typography variant="subtitle2" color="text.secondary" sx={styles.installmentsTitle}>
                Installments ({purchase.expenses.length})
              </Typography>

              <List dense sx={styles.installmentsList}>
                {purchase.expenses.map((expense) => (
                  <ListItem key={expense.id} sx={styles.installmentItem}>
                    <ListItemText
                      primary={
                        <Box sx={styles.installmentPrimary}>
                          <Typography variant="body2">
                            Installment {expense.installmentNumber}
                          </Typography>
                          <Typography variant="body2" sx={styles.installmentAmount}>
                            {formatCurrency(expense.amountCents)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={styles.installmentSecondary}>
                          <Typography variant="caption" color="text.secondary">
                            Due: {formatDate(expense.dueDate || expense.date)}
                          </Typography>
                          {expense.status && (
                            <Chip
                              label={expense.status.name}
                              size="small"
                              color={expense.status.name === 'Paid' ? 'success' : 'warning'}
                              variant="outlined"
                              sx={styles.installmentChip}
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

          <Divider sx={styles.dividerSpacing} />

          {/* Timestamps */}
          <Typography variant="subtitle2" color="text.secondary" sx={styles.installmentsTitle}>
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
