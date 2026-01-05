import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Chip, IconButton } from '@mui/material';
import { useCategories } from '../../contexts';
import type { RecurringBill, TTableContent } from '../../types';
import type { TTableData } from '../../types/table';
import { formatCurrency, formatDate } from '../../utils';
import DataTable from '../common/DataTable';

interface RecurringBillListProps {
  recurringBills: RecurringBill[];
  onEdit: (bill: RecurringBill) => void;
  onDelete: (id: number) => void;
  onViewDetails: (bill: RecurringBill) => void;
}

const RecurringBillList = ({
  recurringBills,
  onEdit,
  onDelete,
  onViewDetails,
}: RecurringBillListProps) => {
  const { categories } = useCategories();

  const headers: TTableContent[] = [
    {
      key: 'name',
      content: 'Name',
    },
    {
      key: 'category',
      content: 'Category',
    },
    {
      key: 'amount',
      content: 'Amount',
    },
    {
      key: 'frequency',
      content: 'Frequency',
    },
    {
      key: 'dayOfMonth',
      content: 'Day of Month',
    },
    {
      key: 'nextDueDate',
      content: 'Next Due Date',
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

  const data: TTableData[] = recurringBills.map((bill) => {
    const category = categories.find((cat) => cat.id === bill.categoryId);

    return {
      key: bill.id,
      rows: [
        {
          key: 'name',
          content: <Box sx={{ fontWeight: 'medium' }}>{bill.name}</Box>,
        },
        {
          key: 'category',
          content: category ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: category.color,
                  border: '2px solid #fff',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
                }}
              />
              <Box>{category.name}</Box>
            </Box>
          ) : (
            '-'
          ),
        },
        {
          key: 'amount',
          content: formatCurrency(Number(bill.amountCents)),
        },
        {
          key: 'frequency',
          content: (
            <Chip
              label={bill.frequency.charAt(0).toUpperCase() + bill.frequency.slice(1)}
              size="small"
              variant="outlined"
            />
          ),
        },
        {
          key: 'dayOfMonth',
          content: (
            <Box sx={{ color: 'text.secondary' }}>
              {bill.dayOfMonth}
              {bill.dayOfMonth === 1
                ? 'st'
                : bill.dayOfMonth === 2
                  ? 'nd'
                  : bill.dayOfMonth === 3
                    ? 'rd'
                    : 'th'}
            </Box>
          ),
        },
        {
          key: 'nextDueDate',
          content: formatDate(bill.nextDueDate),
        },
        {
          key: 'status',
          content: (
            <Chip
              label={bill.isActive ? 'Active' : 'Paused'}
              color={bill.isActive ? 'success' : 'default'}
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
                  onEdit(bill);
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
                  onDelete(bill.id);
                }}
                aria-label="delete"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ),
        },
      ],
    };
  });

  const handleRowClick = (rowKey: number | string) => {
    const bill = recurringBills.find((b) => b.id === rowKey);
    if (bill) {
      onViewDetails(bill);
    }
  };

  return <DataTable data={data} headers={headers} onRowClick={handleRowClick} />;
};

export default RecurringBillList;
