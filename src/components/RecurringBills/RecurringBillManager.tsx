import { Box, Button, CircularProgress } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useCachedFetch } from '../../hooks';
import { httpService } from '../../services';
import type { RecurringBill } from '../../types';
import RecurringBillDetailsDrawer from './RecurringBillDetailsDrawer';
import RecurringBillFormModal from './RecurringBillFormModal';
import RecurringBillList from './RecurringBillList';

const RecurringBillManager = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<RecurringBill | null>(null);
  const [selectedBill, setSelectedBill] = useState<RecurringBill | null>(null);

  const fetchFn = useCallback(async () => {
    const response = await httpService<RecurringBill[]>({
      method: 'get',
      url: '/recurring-bills',
    });
    return response.data;
  }, []);

  const {
    data: recurringBills,
    loading,
    fetch,
    setData: setRecurringBills,
  } = useCachedFetch<RecurringBill[]>({
    fetchFn,
    cacheTimeMinutes: 10,
  });

  // Fetch recurring bills on mount (uses cache if available)
  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleOpenModal = () => {
    setEditingBill(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingBill(null);
  };

  const handleEdit = (bill: RecurringBill) => {
    setEditingBill(bill);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this recurring bill?')) {
      return;
    }

    try {
      await httpService({
        method: 'delete',
        url: `/recurring-bills/${id}`,
      });

      setRecurringBills((prev) => (prev ? prev.filter((bill) => bill.id !== id) : null));
      toast.success('Recurring bill deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete recurring bill');
      console.error('Failed to delete recurring bill:', error);
    }
  };

  const handleViewDetails = (bill: RecurringBill) => {
    setSelectedBill(bill);
  };

  const handleCloseDrawer = () => {
    setSelectedBill(null);
  };

  const handleRefresh = async () => {
    await fetch(true); // Force refresh
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
        <h1>Recurring Bills</h1>
        <Button variant="contained" color="primary" onClick={handleOpenModal}>
          Add Recurring Bill
        </Button>
      </Box>

      <RecurringBillList
        recurringBills={recurringBills ?? []}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewDetails={handleViewDetails}
      />

      <RecurringBillFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        setRecurringBills={setRecurringBills}
        editingBill={editingBill}
      />

      <RecurringBillDetailsDrawer
        bill={selectedBill}
        open={!!selectedBill}
        onClose={handleCloseDrawer}
        onRefresh={handleRefresh}
      />
    </Box>
  );
};

export default RecurringBillManager;
