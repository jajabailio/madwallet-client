import { Box, Chip, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useCategories, useStatuses } from '../../contexts';
import type { Purchase, TTableContent } from '../../types';
import type { TTableData } from '../../types/table';
import { formatCurrency, formatDate } from '../../utils';
import DataTable from '../common/DataTable';

interface PurchaseListProps {
  purchases: Purchase[];
  onEdit: (purchase: Purchase) => void;
  onDelete: (id: number) => void;
  onViewDetails: (purchase: Purchase) => void;
}

const PurchaseList = ({ purchases, onEdit, onDelete, onViewDetails }: PurchaseListProps) => {
  const { categories } = useCategories();
  const { statuses } = useStatuses();
  const headers: TTableContent[] = [
    {
      key: 'description',
      content: 'Description',
    },
    {
      key: 'category',
      content: 'Category',
    },
    {
      key: 'totalAmount',
      content: 'Total Amount',
    },
    {
      key: 'installments',
      content: 'Installments',
    },
    {
      key: 'frequency',
      content: 'Frequency',
    },
    {
      key: 'startDate',
      content: 'Start Date',
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

  const data: TTableData[] = purchases.map((purchase) => {
    const category = categories.find((cat) => cat.id === purchase.categoryId);

    return {
      key: purchase.id,
      rows: [
        {
          key: 'description',
          content: <Box sx={{ fontWeight: 'medium' }}>{purchase.description}</Box>,
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
          key: 'totalAmount',
          content: formatCurrency(Number(purchase.totalAmountCents)),
        },
      {
        key: 'installments',
        content: (
          <Box sx={{ color: 'text.secondary' }}>
            {purchase.installmentCount} {purchase.installmentCount === 1 ? 'payment' : 'payments'}
          </Box>
        ),
      },
      {
        key: 'frequency',
        content: (
          <Chip
            label={purchase.frequency.charAt(0).toUpperCase() + purchase.frequency.slice(1)}
            size="small"
            variant="outlined"
          />
        ),
      },
      {
        key: 'startDate',
        content: formatDate(purchase.startDate),
      },
      {
        key: 'status',
        content: (
          <Chip
            label={purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
            color={
              purchase.status === 'active'
                ? 'success'
                : purchase.status === 'completed'
                  ? 'info'
                  : 'default'
            }
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
                onEdit(purchase);
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
                onDelete(purchase.id);
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
    const purchase = purchases.find((p) => p.id === rowKey);
    if (purchase) {
      onViewDetails(purchase);
    }
  };

  return <DataTable data={data} headers={headers} onRowClick={handleRowClick} />;
};

export default PurchaseList;
