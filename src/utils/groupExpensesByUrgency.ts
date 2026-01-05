import type { Expense } from '../types';

export interface UrgencyGroup {
  overdue: Expense[];
  dueToday: Expense[];
  upcoming: Expense[];
  overdueTotal: number;
  dueTodayTotal: number;
  upcomingTotal: number;
}

export const groupExpensesByUrgency = (expenses: Expense[]): UrgencyGroup => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result: UrgencyGroup = {
    overdue: [],
    dueToday: [],
    upcoming: [],
    overdueTotal: 0,
    dueTodayTotal: 0,
    upcomingTotal: 0,
  };

  // Filter unpaid expenses only
  const unpaidExpenses = expenses.filter((expense) => expense.status?.name !== 'Paid');

  for (const expense of unpaidExpenses) {
    if (!expense.dueDate) {
      result.upcoming.push(expense);
      result.upcomingTotal += expense.amountCents;
      continue;
    }

    const dueDate = new Date(expense.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      result.overdue.push(expense);
      result.overdueTotal += expense.amountCents;
    } else if (dueDate.getTime() === today.getTime()) {
      result.dueToday.push(expense);
      result.dueTodayTotal += expense.amountCents;
    } else {
      result.upcoming.push(expense);
      result.upcomingTotal += expense.amountCents;
    }
  }

  // Sort each group by due date ascending (earliest first)
  const sortByDueDate = (a: Expense, b: Expense) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  };

  result.overdue.sort(sortByDueDate);
  result.dueToday.sort(sortByDueDate);
  result.upcoming.sort(sortByDueDate);

  return result;
};
