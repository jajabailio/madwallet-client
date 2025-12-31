import {
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { formatCurrency, formatDate } from '../../utils';
import type { Expense } from '../../types';

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
      <Box sx={{ width: 450, p: 3 }}>
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

          <DetailRow label="Amount" value={
            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
              {formatCurrency(expense.amount)}
            </Typography>
          } />

          <DetailRow label="Category" value={
            expense.category ? (
              <Chip
                label={expense.category.name}
                size="small"
                sx={{ bgcolor: expense.category.color, color: '#fff' }}
              />
            ) : '—'
          } />

          <DetailRow label="Status" value={
            expense.status ? (
              <Chip label={expense.status.name} size="small" color="default" />
            ) : '—'
          } />

          <DetailRow label="Payment Method" value={
            expense.paymentMethod ? (
              <Chip label={expense.paymentMethod.name} size="small" variant="outlined" />
            ) : '—'
          } />

          <Divider sx={{ my: 2 }} />

          <DetailRow label="Date" value={formatDate(expense.date)} />

          <DetailRow label="Due Date" value={
            expense.dueDate ? formatDate(expense.dueDate) : '—'
          } />

          {/* Purchase/Installment Info */}
          {expense.purchase && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Installment Information
              </Typography>

              <DetailRow label="Purchase" value={expense.purchase.description} />

              <DetailRow label="Installment" value={
                expense.installmentNumber
                  ? `${expense.installmentNumber} of ${expense.purchase.installmentCount}`
                  : '—'
              } />

              <DetailRow label="Total Purchase Amount" value={
                formatCurrency(expense.purchase.totalAmount)
              } />

              <DetailRow label="Frequency" value={
                expense.purchase.frequency ? (
                  <Chip
                    label={expense.purchase.frequency}
                    size="small"
                    variant="outlined"
                  />
                ) : '—'
              } />
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
