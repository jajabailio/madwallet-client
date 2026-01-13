import { Box, Button, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { usePurchases } from '../../contexts';
import { httpService } from '../../services';
import type { Purchase } from '../../types';
import PurchaseDetailsDrawer from './PurchaseDetailsDrawer';
import PurchaseFormModal from './PurchaseFormModal';
import PurchaseList from './PurchaseList';

const PurchaseManager = () => {
  const { purchases, loading, refreshPurchases } = usePurchases();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  // Fetch purchases on component mount
  useEffect(() => {
    refreshPurchases();
  }, [refreshPurchases]);

  const handleOpenModal = () => {
    setEditingPurchase(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingPurchase(null);
  };

  const handleEdit = (purchase: Purchase) => {
    setEditingPurchase(purchase);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this purchase?')) {
      return;
    }

    try {
      await httpService({
        method: 'delete',
        url: `/purchases/${id}`,
      });

      await refreshPurchases();
      toast.success('Purchase deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete purchase');
      console.error('Failed to delete purchase:', error);
    }
  };

  const handleViewDetails = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
  };

  const handleCloseDrawer = () => {
    setSelectedPurchase(null);
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
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <h1>Purchases</h1>
        <Button variant="contained" color="primary" onClick={handleOpenModal}>
          Add Purchase
        </Button>
      </Box>

      <PurchaseList
        purchases={purchases}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewDetails={handleViewDetails}
      />

      <PurchaseFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        editingPurchase={editingPurchase}
      />

      <PurchaseDetailsDrawer
        purchase={selectedPurchase}
        open={!!selectedPurchase}
        onClose={handleCloseDrawer}
      />
    </Box>
  );
};

export default PurchaseManager;
