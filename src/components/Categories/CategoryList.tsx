import { Box, Chip, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import type { Category, TTableContent } from '../../types';
import type { TTableData } from '../../types/table';
import { formatDate } from '../../utils';
import DataTable from '../common/DataTable';

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
}

const CategoryList = ({ categories, onEdit, onDelete }: CategoryListProps) => {
  const headers: TTableContent[] = [
    {
      key: 'name',
      content: 'Name',
    },
    {
      key: 'description',
      content: 'Description',
    },
    {
      key: 'createdAt',
      content: 'Created',
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

  const data: TTableData[] = categories.map((category) => ({
    key: category.id,
    rows: [
      {
        key: 'name',
        content: (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: category.color,
                border: '2px solid #fff',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
              }}
            />
            <Box sx={{ fontWeight: 'medium' }}>{category.name}</Box>
          </Box>
        ),
      },
      {
        key: 'description',
        content: (
          <Box sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
            {category.description || '-'}
          </Box>
        ),
      },
      {
        key: 'createdAt',
        content: formatDate(category.createdAt),
      },
      {
        key: 'status',
        content: (
          <Chip
            label={category.isDeleted ? 'Deleted' : 'Active'}
            color={category.isDeleted ? 'error' : 'success'}
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
              onClick={() => onEdit(category)}
              aria-label="edit"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(category.id)}
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

export default CategoryList;
