import { Dialog, DialogContent, DialogTitle, Grid, useMediaQuery, useTheme } from '@mui/material';
import Joi from 'joi';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { CATEGORY_COLOR_VALUES, DEFAULT_CATEGORY_COLOR } from '../../constants/colors';
import { useCategories } from '../../contexts';
import { httpService } from '../../services';
import ColorPicker from '../form/ColorPicker';
import FormBuilder from '../form/FormBuilder';

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  editingCategory?: Category | null;
}

// Joi validation schema for category
const categorySchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  description: Joi.string().allow('').max(255).optional(),
  color: Joi.string()
    .valid(...CATEGORY_COLOR_VALUES)
    .required()
    .label('color'),
});

const CategoryFormModal = ({
  open,
  onClose,
  editingCategory,
}: CategoryFormModalProps) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { refreshCategories } = useCategories();
  const isEditing = !!editingCategory;

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      if (isEditing && editingCategory) {
        // Update existing category
        await httpService({
          method: 'put',
          url: `/categories/${editingCategory.id}`,
          data: {
            name: data.name,
            description: data.description || undefined,
            color: data.color,
          },
        });

        await refreshCategories();
        toast.success('Category updated successfully!');
        onClose();
      } else {
        // Create new category
        await httpService({
          method: 'post',
          url: '/categories',
          data: {
            name: data.name,
            description: data.description || undefined,
            color: data.color,
          },
        });

        await refreshCategories();
        toast.success('Category created successfully!');
        onClose();
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        const errorMessage =
          axiosError.response?.data?.error ||
          `Failed to ${isEditing ? 'update' : 'create'} category. Please try again.`;
        toast.error(errorMessage);
      } else {
        toast.error(`Failed to ${isEditing ? 'update' : 'create'} category. Please try again.`);
      }
      console.error(`Failed to ${isEditing ? 'update' : 'create'} category:`, error);
    }
  };

  const {
    renderTextInput,
    renderTextArea,
    renderButton,
    handleSubmit: formHandleSubmit,
    setValue,
    reset,
    data,
    errors,
  } = FormBuilder({
    schema: categorySchema,
    onSubmit: handleSubmit,
  });

  // Reset form and pre-populate when modal opens
  useEffect(() => {
    if (open) {
      reset();
      if (editingCategory) {
        setValue('name', editingCategory.name);
        setValue('description', editingCategory.description || '');
        setValue('color', editingCategory.color);
      } else {
        setValue('color', DEFAULT_CATEGORY_COLOR);
      }
    }
  }, [editingCategory, open, reset, setValue]);

  const currentColor = (data.color as string) || DEFAULT_CATEGORY_COLOR;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
      <DialogTitle>{isEditing ? 'Edit Category' : 'Add New Category'}</DialogTitle>
      <DialogContent>
        <form onSubmit={formHandleSubmit}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {renderTextInput({
              name: 'name',
              label: 'Name',
              placeholder: 'Category name',
              required: true,
            })}
            {renderTextArea({
              name: 'description',
              label: 'Description',
              placeholder: 'Category description (optional)',
              rows: 3,
            })}
            <ColorPicker
              value={currentColor}
              onChange={(color) => setValue('color', color)}
              error={errors.color}
              label="Color"
              required
            />
            <Grid size={12}>
              {renderButton({
                text: isEditing ? 'Update Category' : 'Add Category',
                variant: 'contained',
                fullWidth: true
              })}
            </Grid>
          </Grid>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryFormModal;
