import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PaymentIcon from '@mui/icons-material/Payment';
import { Box, Chip, IconButton } from '@mui/material';
import type { Expense, TTableContent } from '../../types';
import type { TTableData } from '../../types/table';
import { formatCurrency, formatDate } from '../../utils';
import DataTable from '../common/DataTable';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: number) => void;
  onViewDetails: (expense: Expense) => void;
  onPay: (expense: Expense) => void;
}

const ExpenseList = ({ expenses, onEdit, onDelete, onViewDetails, onPay }: ExpenseListProps) => {
  const headers: TTableContent[] = [
    {
      key: 'description',
      content: 'Description',
      sortable: true,
    },
    {
      key: 'category',
      content: 'Category',
      sortable: true,
    },
    {
      key: 'amount',
      content: 'Amount',
      sortable: true,
    },
    {
      key: 'date',
      content: 'Date',
      sortable: true,
    },
    {
      key: 'status',
      content: 'Status',
      sortable: true,
    },
    {
      key: 'actions',
      content: 'Actions',
      sortable: false,
    },
  ];

  const data: TTableData[] = expenses.map((expense) => ({
    key: expense.id,
    rows: [
      {
        key: 'description',
        content: (
          <Box>
            <div>{expense.description}</div>
            {expense.installmentNumber && (
              <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                Payment {expense.installmentNumber}
                {expense.purchase && `/${expense.purchase.installmentCount}`}
              </div>
            )}
          </Box>
        ),
        sortValue: expense.description,
      },
      {
        key: 'category',
        content: (
          <Chip
            label={expense.category.name}
            size="small"
            sx={{
              backgroundColor: expense.category.color,
              color: '#fff',
              fontWeight: 'medium',
            }}
          />
        ),
        sortValue: expense.category.name,
      },
      {
        key: 'amount',
        content: formatCurrency(expense.amountCents),
        sortValue: expense.amountCents,
      },
      {
        key: 'date',
        content: formatDate(expense.date),
        sortValue: new Date(expense.date),
      },
      {
        key: 'status',
        content: expense.status ? (
          <Chip
            label={expense.status.name}
            color={expense.status.name === 'Paid' ? 'success' : 'warning'}
            size="small"
            variant="outlined"
          />
        ) : (
          <Chip label="Unknown" color="default" size="small" variant="outlined" />
        ),
        sortValue: expense.status?.name ?? '',
      },
      {
        key: 'actions',
        content: (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {expense.status?.name !== 'Paid' && (
              <IconButton
                size="small"
                color="success"
                onClick={(e) => {
                  e.stopPropagation();
                  onPay(expense);
                }}
                aria-label="pay"
              >
                <PaymentIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(expense);
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
                onDelete(expense.id);
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
    const expense = expenses.find((exp) => exp.id === rowKey);
    if (expense) {
      onViewDetails(expense);
    }
  };

  return (
    <DataTable
      data={data}
      headers={headers}
      onRowClick={handleRowClick}
      defaultSortKey="date"
      defaultSortDirection="desc"
    />
  );
};

export default ExpenseList;
