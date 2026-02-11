import { Box, Button, CircularProgress, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { usePaymentMethods } from '../../contexts';
import { httpService } from '../../services';
import type { PaymentMethod } from '../../types';
import EmptyState from '../common/EmptyState';
import PaymentMethodDetailsDrawer from './PaymentMethodDetailsDrawer';
import PaymentMethodFormModal from './PaymentMethodFormModal';
import PaymentMethodList from './PaymentMethodList';

const PaymentMethodManager = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { paymentMethods, loading, refreshPaymentMethods } = usePaymentMethods();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);

  const handleOpenModal = () => {
    setEditingPaymentMethod(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingPaymentMethod(null);
  };

  const handleEdit = (paymentMethod: PaymentMethod) => {
    setEditingPaymentMethod(paymentMethod);
    setModalOpen(true);
  };

  const handleViewDetails = (paymentMethod: PaymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
  };

  const handleCloseDrawer = () => {
    setSelectedPaymentMethod(null);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    try {
      await httpService({
        method: 'delete',
        url: `/payment-methods/${id}`,
      });

      await refreshPaymentMethods();
      toast.success('Payment method deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete payment method');
      console.error('Failed to delete payment method:', error);
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
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: 2,
          mb: 3,
        }}
      >
        <Typography variant={isMobile ? 'h5' : 'h4'} component="h1">
          Payment Methods
        </Typography>
        <Button variant="contained" color="primary" onClick={handleOpenModal} fullWidth={isMobile}>
          Add Payment Method
        </Button>
      </Box>

      {paymentMethods.length === 0 ? (
        <EmptyState message="No payment methods available. Add your first payment method!" />
      ) : (
        <PaymentMethodList
          paymentMethods={paymentMethods}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewDetails={handleViewDetails}
        />
      )}

      <PaymentMethodFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        editingPaymentMethod={editingPaymentMethod}
      />

      <PaymentMethodDetailsDrawer
        paymentMethod={selectedPaymentMethod}
        open={!!selectedPaymentMethod}
        onClose={handleCloseDrawer}
      />
    </Box>
  );
};

export default PaymentMethodManager;
