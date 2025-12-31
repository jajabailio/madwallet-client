import { Dialog, DialogContent, DialogTitle, Grid } from '@mui/material';
import Joi from 'joi';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useStatuses } from '../../contexts';
import { httpService } from '../../services';
import FormBuilder from '../form/FormBuilder';

interface StatusFormModalProps {
  open: boolean;
  onClose: () => void;
  editingStatus?: Status | null;
}

// Joi validation schema for status
const statusSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  description: Joi.string().allow('').max(500).optional(),
});

const StatusFormModal = ({
  open,
  onClose,
  editingStatus,
}: StatusFormModalProps) => {
  const { refreshStatuses } = useStatuses();
  const isEditing = !!editingStatus;

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      if (isEditing && editingStatus) {
        // Update existing status
        await httpService({
          method: 'put',
          url: `/statuses/${editingStatus.id}`,
          data: {
            name: data.name,
            description: data.description || undefined,
          },
        });

        await refreshStatuses();
        toast.success('Status updated successfully!');
        onClose();
      } else {
        // Create new status
        await httpService({
          method: 'post',
          url: '/statuses',
          data: {
            name: data.name,
            description: data.description || undefined,
          },
        });

        await refreshStatuses();
        toast.success('Status created successfully!');
        onClose();
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        const errorMessage =
          axiosError.response?.data?.error ||
          `Failed to ${isEditing ? 'update' : 'create'} status. Please try again.`;
        toast.error(errorMessage);
      } else {
        toast.error(`Failed to ${isEditing ? 'update' : 'create'} status. Please try again.`);
      }
      console.error(`Failed to ${isEditing ? 'update' : 'create'} status:`, error);
    }
  };

  const {
    renderTextInput,
    renderTextArea,
    renderButton,
    handleSubmit: formHandleSubmit,
    setValue,
    reset,
  } = FormBuilder({
    schema: statusSchema,
    onSubmit: handleSubmit,
  });

  // Reset form and pre-populate when modal opens
  useEffect(() => {
    if (open) {
      reset();
      if (editingStatus) {
        setValue('name', editingStatus.name);
        setValue('description', editingStatus.description || '');
      }
    }
  }, [editingStatus, open, reset, setValue]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Status' : 'Add New Status'}</DialogTitle>
      <DialogContent>
        <form onSubmit={formHandleSubmit}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {renderTextInput({
              name: 'name',
              label: 'Name',
              placeholder: 'Status name',
              required: true,
            })}
            {renderTextArea({
              name: 'description',
              label: 'Description',
              placeholder: 'Status description (optional)',
              rows: 3,
            })}
            <Grid size={12}>
              {renderButton({
                text: isEditing ? 'Update Status' : 'Add Status',
                variant: 'contained',
                fullWidth: true,
              })}
            </Grid>
          </Grid>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StatusFormModal;
