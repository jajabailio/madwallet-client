import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Paper,
  Skeleton,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts';
import { httpService } from '../services';
import { styles } from './Settings.styles';

const Settings = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    if (!isDeleting) {
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    try {
      await httpService({
        method: 'delete',
        url: '/auth/account',
        label: 'account',
      });

      toast.success('Account deleted successfully. Goodbye!');

      // Clear auth state and redirect to login
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error('Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <Box sx={styles.container}>
      <Box sx={styles.header}>
        <SettingsIcon sx={styles.headerIcon} />
        <Typography variant="h4">Settings</Typography>
      </Box>

      {/* User Info Section */}
      <Paper elevation={1} sx={styles.section}>
        <Typography variant="h6" sx={styles.sectionTitle}>
          Account Information
        </Typography>
        <Divider sx={styles.divider} />
        <Box sx={styles.infoRow}>
          <Typography variant="body2" color="textSecondary">
            Name
          </Typography>
          {loading ? (
            <Skeleton width={150} />
          ) : (
            <Typography variant="body1">
              {user?.firstName} {user?.lastName}
            </Typography>
          )}
        </Box>
        <Box sx={styles.infoRow}>
          <Typography variant="body2" color="textSecondary">
            Email
          </Typography>
          {loading ? (
            <Skeleton width={200} />
          ) : (
            <Typography variant="body1">{user?.email}</Typography>
          )}
        </Box>
      </Paper>

      {/* Danger Zone Section */}
      <Paper sx={styles.dangerSection}>
        <Typography variant="h6" sx={styles.dangerTitle}>
          Danger Zone
        </Typography>
        <Divider sx={styles.divider} />
        <Box sx={styles.dangerContent}>
          <Box>
            <Typography variant="subtitle1" fontWeight="medium">
              Delete Account
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Permanently delete your account and all associated data. This action cannot be undone.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteForeverIcon />}
            onClick={handleOpenDeleteDialog}
            sx={styles.deleteButton}
          >
            Delete Account
          </Button>
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown={isDeleting}
      >
        <DialogTitle sx={styles.dialogTitle}>
          <DeleteForeverIcon color="error" sx={styles.dialogIcon} />
          Delete Account?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This will permanently remove:
          </DialogContentText>
          <Box component="ul" sx={styles.deleteList}>
            <li>All your expenses</li>
            <li>All your purchases</li>
            <li>All your wallets and transactions</li>
            <li>All your categories, statuses, and payment methods</li>
            <li>All your recurring bills</li>
          </Box>
          <DialogContentText sx={styles.warningText}>
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={styles.dialogActions}>
          <Button variant="text" onClick={handleCloseDeleteDialog} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
