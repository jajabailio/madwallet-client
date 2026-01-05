import { Box, Button, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useStatuses } from '../../contexts';
import { httpService } from '../../services';
import type { Status } from '../../types';
import StatusFormModal from './StatusFormModal';
import StatusList from './StatusList';

const StatusManager = () => {
  const { statuses, loading, refreshStatuses } = useStatuses();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<Status | null>(null);

  const handleOpenModal = () => {
    setEditingStatus(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingStatus(null);
  };

  const handleEdit = (status: Status) => {
    setEditingStatus(status);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this status?')) {
      return;
    }

    try {
      await httpService({
        method: 'delete',
        url: `/statuses/${id}`,
      });

      await refreshStatuses();
      toast.success('Status deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete status');
      console.error('Failed to delete status:', error);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <h1>Statuses</h1>
        <Button variant="contained" color="primary" onClick={handleOpenModal}>
          Add Status
        </Button>
      </Box>

      <StatusList statuses={statuses} onEdit={handleEdit} onDelete={handleDelete} />

      <StatusFormModal open={modalOpen} onClose={handleCloseModal} editingStatus={editingStatus} />
    </Box>
  );
};

export default StatusManager;
