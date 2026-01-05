import CloseIcon from '@mui/icons-material/Close';
import { Box, Chip, Divider, Drawer, IconButton, Stack, Typography } from '@mui/material';
import type { Expense } from '../../types';
import { formatCurrency, formatDate } from '../../utils';

interface ExpenseDetailsDrawerProps {
  expense: Expense | null;
  open: boolean;
  onClose: () => void;
}

const ExpenseDetailsDrawer = ({ expense, open, onClose }: ExpenseDetailsDrawerProps) => {
  if (!expense) return null;

  const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body1">{value || '—'}</Typography>
    </Box>
  );

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: '100vw', sm: 450 }, p: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            Expense Details
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Main Details */}
        <Stack spacing={2}>
          <DetailRow label="Description" value={expense.description} />

          <DetailRow
            label="Amount"
            value={
              <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(expense.amountCents)}
              </Typography>
            }
          />

          <DetailRow
            label="Category"
            value={
              expense.category ? (
                <Chip
                  label={expense.category.name}
                  size="small"
                  sx={{ bgcolor: expense.category.color, color: '#fff' }}
                />
              ) : (
                '—'
              )
            }
          />

          <DetailRow
            label="Status"
            value={
              expense.status ? (
                <Chip
                  label={expense.status.name}
                  size="small"
                  color={expense.status.name === 'Paid' ? 'success' : 'warning'}
                  variant={expense.status.name === 'Paid' ? 'filled' : 'outlined'}
                />
              ) : (
                '—'
              )
            }
          />

          <DetailRow
            label="Payment Method"
            value={
              expense.paymentMethod ? (
                <Chip label={expense.paymentMethod.name} size="small" variant="outlined" />
              ) : (
                '—'
              )
            }
          />

          {/* Payment Information */}
          {expense.status?.name === 'Paid' && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Payment Information
              </Typography>

              <Box
                sx={{
                  p: 2,
                  bgcolor: 'success.light',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'success.main',
                }}
              >
                <Typography variant="body2" sx={{ color: 'success.dark', fontWeight: 'medium' }}>
                  ✓ This expense has been paid
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'success.dark', display: 'block', mt: 0.5 }}
                >
                  Detailed payment tracking (wallet used, transaction date) will be available soon
                </Typography>
              </Box>
            </>
          )}

          <Divider sx={{ my: 2 }} />

          <DetailRow label="Date" value={formatDate(expense.date)} />

          <DetailRow label="Due Date" value={expense.dueDate ? formatDate(expense.dueDate) : '—'} />

          {/* Purchase/Installment Info */}
          {expense.purchase && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Installment Information
              </Typography>

              <DetailRow label="Purchase" value={expense.purchase.description} />

              <DetailRow
                label="Installment"
                value={
                  expense.installmentNumber
                    ? `${expense.installmentNumber} of ${expense.purchase.installmentCount}`
                    : '—'
                }
              />

              <DetailRow
                label="Total Purchase Amount"
                value={formatCurrency(expense.purchase.totalAmountCents)}
              />

              <DetailRow
                label="Frequency"
                value={
                  expense.purchase.frequency ? (
                    <Chip label={expense.purchase.frequency} size="small" variant="outlined" />
                  ) : (
                    '—'
                  )
                }
              />
            </>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Timestamps */}
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Timestamps
          </Typography>

          <DetailRow label="Created At" value={formatDate(expense.createdAt)} />

          <DetailRow label="Updated At" value={formatDate(expense.updatedAt)} />
        </Stack>
      </Box>
    </Drawer>
  );
};

export default ExpenseDetailsDrawer;
