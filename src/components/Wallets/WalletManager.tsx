import { Box, Button, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useWallets } from '../../contexts';
import { httpService } from '../../services';
import type { Wallet } from '../../types';
import WalletDetailsDrawer from './WalletDetailsDrawer';
import WalletFormModal from './WalletFormModal';
import WalletList from './WalletList';

const WalletManager = () => {
  const { wallets, setWallets, loading } = useWallets();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);

  const handleOpenModal = () => {
    setEditingWallet(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingWallet(null);
  };

  const handleEdit = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this wallet?')) {
      return;
    }

    // Optimistic update - remove from UI immediately
    const previousWallets = [...wallets];
    setWallets(wallets.filter((wallet) => wallet.id !== id));

    try {
      await httpService({
        method: 'delete',
        url: `/wallets/${id}`,
      });

      toast.success('Wallet deleted successfully!');
    } catch (error) {
      // Rollback on error
      setWallets(previousWallets);
      toast.error('Failed to delete wallet');
      console.error('Failed to delete wallet:', error);
    }
  };

  const handleViewDetails = (wallet: Wallet) => {
    setSelectedWallet(wallet);
  };

  const handleCloseDrawer = () => {
    setSelectedWallet(null);
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
        <h1>Wallets</h1>
        <Button variant="contained" color="primary" onClick={handleOpenModal}>
          Add Wallet
        </Button>
      </Box>

      {wallets.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '300px',
            color: 'text.secondary',
          }}
        >
          No wallets found. Create your first wallet to get started!
        </Box>
      ) : (
        <WalletList
          wallets={wallets}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewDetails={handleViewDetails}
        />
      )}

      <WalletFormModal open={modalOpen} onClose={handleCloseModal} editingWallet={editingWallet} />

      <WalletDetailsDrawer
        wallet={selectedWallet}
        open={!!selectedWallet}
        onClose={handleCloseDrawer}
      />
    </Box>
  );
};

export default WalletManager;
