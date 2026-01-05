import type { Expense } from '../types';

export const filterUpcomingExpenses = (expenses: Expense[], days = 30): Expense[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + days);

  return expenses
    .filter((expense) => {
      // Only unpaid expenses
      if (expense.status?.name === 'Paid') return false;

      // Must have due date
      if (!expense.dueDate) return false;

      const dueDate = new Date(expense.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      // Due within the next X days (including today)
      return dueDate >= today && dueDate <= futureDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.dueDate!);
      const dateB = new Date(b.dueDate!);
      return dateA.getTime() - dateB.getTime();
    });
};
