import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Chip, IconButton } from '@mui/material';
import type { Status, TTableContent } from '../../types';
import type { TTableData } from '../../types/table';
import { formatDate } from '../../utils';
import DataTable from '../common/DataTable';

interface StatusListProps {
  statuses: Status[];
  onEdit: (status: Status) => void;
  onDelete: (id: number) => void;
}

const StatusList = ({ statuses, onEdit, onDelete }: StatusListProps) => {
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

  const data: TTableData[] = statuses.map((status) => ({
    key: status.id,
    rows: [
      {
        key: 'name',
        content: (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ fontWeight: 'medium' }}>{status.name}</Box>
            {status.isSystem && (
              <Chip label="System" size="small" color="info" variant="outlined" />
            )}
          </Box>
        ),
      },
      {
        key: 'description',
        content: (
          <Box sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
            {status.description || '-'}
          </Box>
        ),
      },
      {
        key: 'createdAt',
        content: formatDate(status.createdAt),
      },
      {
        key: 'status',
        content: (
          <Chip
            label={status.isDeleted ? 'Deleted' : 'Active'}
            color={status.isDeleted ? 'error' : 'success'}
            size="small"
            variant="outlined"
          />
        ),
      },
      {
        key: 'actions',
        content: status.isSystem ? (
          <Box sx={{ color: 'text.disabled', fontSize: '0.875rem' }}>Protected</Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              color="primary"
              onClick={() => onEdit(status)}
              aria-label="edit"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(status.id)}
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

export default StatusList;
