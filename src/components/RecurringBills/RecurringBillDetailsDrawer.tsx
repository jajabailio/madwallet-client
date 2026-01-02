import {
  Box,
  Button,
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
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';
import { httpService } from '../../services';
import { formatCurrency, formatDate } from '../../utils';
import type { RecurringBill } from '../../types';
import { styles } from './RecurringBillDetailsDrawer.styles';

interface RecurringBillDetailsDrawerProps {
  bill: RecurringBill | null;
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const RecurringBillDetailsDrawer = ({
  bill,
  open,
  onClose,
  onRefresh,
}: RecurringBillDetailsDrawerProps) => {
  if (!bill) return null;

  const handleToggleActive = async () => {
    try {
      await httpService({
        method: 'patch',
        url: `/recurring-bills/${bill.id}/toggle-active`,
      });

      toast.success(`Bill ${bill.isActive ? 'paused' : 'activated'} successfully!`);
      onRefresh();
      onClose();
    } catch (error) {
      toast.error(`Failed to ${bill.isActive ? 'pause' : 'activate'} bill`);
      console.error('Failed to toggle bill status:', error);
    }
  };

  const handleGenerateExpense = async () => {
    try {
      await httpService({
        method: 'post',
        url: `/recurring-bills/${bill.id}/generate`,
      });

      toast.success('Expense generated successfully!');
      onRefresh();
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        const errorMessage = axiosError.response?.data?.error || 'Failed to generate expense';
        toast.error(errorMessage);
      } else {
        toast.error('Failed to generate expense');
      }
      console.error('Failed to generate expense:', error);
    }
  };

  const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <Box sx={styles.detailRow}>
      <Typography variant="caption" color="text.secondary" sx={styles.detailLabel}>
        {label}
      </Typography>
      <Typography variant="body1">{value || '—'}</Typography>
    </Box>
  );

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={styles.drawer}>
        {/* Header */}
        <Box sx={styles.header}>
          <Typography variant="h5" component="h2">
            Recurring Bill Details
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={styles.divider} />

        {/* Main Details */}
        <Stack spacing={2}>
          <DetailRow label="Name" value={<Typography variant="h6">{bill.name}</Typography>} />

          {bill.description && <DetailRow label="Description" value={bill.description} />}

          <DetailRow
            label="Amount"
            value={
              <Typography variant="h6" color="primary" sx={styles.totalAmount}>
                {formatCurrency(bill.amountCents)}
              </Typography>
            }
          />

          <Box sx={styles.gridTwoColumns}>
            <DetailRow
              label="Frequency"
              value={
                <Chip
                  label={bill.frequency.charAt(0).toUpperCase() + bill.frequency.slice(1)}
                  size="small"
                  variant="outlined"
                />
              }
            />
            <DetailRow
              label="Day of Month"
              value={
                <Typography variant="body1">
                  {bill.dayOfMonth}
                  {bill.dayOfMonth === 1
                    ? 'st'
                    : bill.dayOfMonth === 2
                      ? 'nd'
                      : bill.dayOfMonth === 3
                        ? 'rd'
                        : 'th'}
                </Typography>
              }
            />
          </Box>

          <DetailRow
            label="Status"
            value={
              <Chip
                label={bill.isActive ? 'Active' : 'Paused'}
                size="small"
                color={bill.isActive ? 'success' : 'default'}
              />
            }
          />

          <Divider sx={styles.dividerSpacing} />

          <DetailRow
            label="Category"
            value={
              bill.category ? (
                <Chip
                  label={bill.category.name}
                  size="small"
                  sx={{ ...styles.categoryChip, bgcolor: bill.category.color }}
                />
              ) : (
                '—'
              )
            }
          />

          <DetailRow
            label="Default Status"
            value={
              bill.status ? <Chip label={bill.status.name} size="small" color="default" /> : '—'
            }
          />

          <DetailRow
            label="Payment Method"
            value={
              bill.paymentMethod ? (
                <Chip label={bill.paymentMethod.name} size="small" variant="outlined" />
              ) : (
                '—'
              )
            }
          />

          <Divider sx={styles.dividerSpacing} />

          <Box sx={styles.gridTwoColumns}>
            <DetailRow label="Start Date" value={formatDate(bill.startDate)} />
            <DetailRow label="Next Due Date" value={formatDate(bill.nextDueDate)} />
          </Box>

          {bill.lastGenerated && (
            <DetailRow label="Last Generated" value={formatDate(bill.lastGenerated)} />
          )}

          <Divider sx={styles.dividerSpacing} />

          {/* Action Buttons */}
          <Typography variant="subtitle2" color="text.secondary" sx={styles.installmentsTitle}>
            Actions
          </Typography>

          <Box sx={styles.actionButtons}>
            <Button
              variant="outlined"
              color={bill.isActive ? 'warning' : 'success'}
              startIcon={bill.isActive ? <PauseIcon /> : <PlayArrowIcon />}
              onClick={handleToggleActive}
              fullWidth
            >
              {bill.isActive ? 'Pause Bill' : 'Activate Bill'}
            </Button>

            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleGenerateExpense}
              disabled={!bill.isActive}
              fullWidth
            >
              Generate Expense
            </Button>
          </Box>

          {/* Generated Expenses List */}
          {bill.expenses && bill.expenses.length > 0 && (
            <>
              <Divider sx={styles.dividerSpacing} />
              <Typography variant="subtitle2" color="text.secondary" sx={styles.installmentsTitle}>
                Generated Expenses ({bill.expenses.length})
              </Typography>

              <List dense sx={styles.installmentsList}>
                {bill.expenses.slice(0, 12).map((expense) => (
                  <ListItem key={expense.id} sx={styles.installmentItem}>
                    <ListItemText
                      primary={
                        <Box sx={styles.installmentPrimary}>
                          <Typography variant="body2">{expense.description}</Typography>
                          <Typography variant="body2" sx={styles.installmentAmount}>
                            {formatCurrency(expense.amountCents)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={styles.installmentSecondary}>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(expense.date)}
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

          <DetailRow label="Created At" value={formatDate(bill.createdAt)} />

          <DetailRow label="Updated At" value={formatDate(bill.updatedAt)} />
        </Stack>
      </Box>
    </Drawer>
  );
};

export default RecurringBillDetailsDrawer;
