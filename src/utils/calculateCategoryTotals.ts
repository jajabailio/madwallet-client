import type { CategoryTotal, Expense } from '../types';

export const calculateCategoryTotals = (expenses: Expense[]): CategoryTotal[] => {
  const categoryMap = new Map<number, CategoryTotal>();
  let grandTotal = 0;

  for (const expense of expenses) {
    const categoryId = expense.categoryId;
    const existing = categoryMap.get(categoryId);

    if (existing) {
      existing.totalCents += expense.amountCents;
      existing.count += 1;
    } else {
      categoryMap.set(categoryId, {
        categoryId,
        categoryName: expense.category?.name || 'Unknown',
        color: expense.category?.color || '#90caf9',
        totalCents: expense.amountCents,
        count: 1,
        percentage: 0,
      });
    }
    grandTotal += expense.amountCents;
  }

  // Calculate percentages
  const results = Array.from(categoryMap.values());
  for (const category of results) {
    category.percentage = grandTotal > 0 ? Math.round((category.totalCents / grandTotal) * 100) : 0;
  }

  // Sort by total descending
  return results.sort((a, b) => b.totalCents - a.totalCents);
};
