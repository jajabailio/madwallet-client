import { Box, Button, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { httpService } from '../../services';
import type { RecurringBill } from '../../types';
import RecurringBillDetailsDrawer from './RecurringBillDetailsDrawer';
import RecurringBillFormModal from './RecurringBillFormModal';
import RecurringBillList from './RecurringBillList';

const RecurringBillManager = () => {
  const [recurringBills, setRecurringBills] = useState<RecurringBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<RecurringBill | null>(null);
  const [selectedBill, setSelectedBill] = useState<RecurringBill | null>(null);

  // Fetch recurring bills on mount
  useEffect(() => {
    fetchRecurringBills();
  }, []);

  const fetchRecurringBills = async () => {
    try {
      const response = await httpService<RecurringBill[]>({
        method: 'get',
        url: '/recurring-bills',
      });

      setRecurringBills(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Failed to fetch recurring bills:', error);
    }
  };

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

      setRecurringBills(recurringBills.filter((bill) => bill.id !== id));
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
        recurringBills={recurringBills}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewDetails={handleViewDetails}
      />

      <RecurringBillFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        recurringBills={recurringBills}
        setRecurringBills={setRecurringBills}
        editingBill={editingBill}
      />

      <RecurringBillDetailsDrawer
        bill={selectedBill}
        open={!!selectedBill}
        onClose={handleCloseDrawer}
        onRefresh={fetchRecurringBills}
      />
    </Box>
  );
};

export default RecurringBillManager;
