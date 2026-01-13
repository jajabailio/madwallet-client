import { Box, Button, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useCategories } from '../../contexts';
import { httpService } from '../../services';
import type { Category } from '../../types';
import EmptyState from '../common/EmptyState';
import CategoryFormModal from './CategoryFormModal';
import CategoryList from './CategoryList';

const CategoryManager = () => {
  const { categories, loading, refreshCategories } = useCategories();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleOpenModal = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await httpService({
        method: 'delete',
        url: `/categories/${id}`,
      });

      await refreshCategories();
      toast.success('Category deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete category');
      console.error('Failed to delete category:', error);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <h1>Categories</h1>
        <Button variant="contained" color="primary" onClick={handleOpenModal}>
          Add Category
        </Button>
      </Box>

      {categories.length === 0 ? (
        <EmptyState message="No categories available. Create your first category!" />
      ) : (
        <CategoryList categories={categories} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      <CategoryFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        editingCategory={editingCategory}
      />
    </Box>
  );
};

export default CategoryManager;
