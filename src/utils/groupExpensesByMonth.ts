import type { Expense } from '../types';

export interface MonthGroup {
  month: string; // "February 2026"
  year: number;
  monthNumber: number;
  expenses: Expense[];
  totalPaidCents: number;
  totalUnpaidCents: number;
  paidCount: number;
  unpaidCount: number;
}

export const groupExpensesByMonth = (expenses: Expense[]): MonthGroup[] => {
  // Group expenses by year-month
  const monthMap = new Map<string, MonthGroup>();

  for (const expense of expenses) {
    const date = new Date(expense.date);
    const year = date.getFullYear();
    const monthNumber = date.getMonth(); // 0-11
    const monthKey = `${year}-${monthNumber}`;

    // Get or create month group
    let group = monthMap.get(monthKey);
    if (!group) {
      const monthName = date.toLocaleString('en-US', { month: 'long' });
      group = {
        month: `${monthName} ${year}`,
        year,
        monthNumber,
        expenses: [],
        totalPaidCents: 0,
        totalUnpaidCents: 0,
        paidCount: 0,
        unpaidCount: 0,
      };
      monthMap.set(monthKey, group);
    }

    group.expenses.push(expense);

    // Aggregate based on status
    const isPaid = expense.status?.name === 'Paid';
    if (isPaid) {
      group.totalPaidCents += expense.amountCents;
      group.paidCount++;
    } else {
      group.totalUnpaidCents += expense.amountCents;
      group.unpaidCount++;
    }
  }

  // Convert to array and sort by year-month descending (newest first)
  const monthGroups = Array.from(monthMap.values());
  monthGroups.sort((a, b) => {
    // Compare year first, then month
    if (a.year !== b.year) return b.year - a.year;
    return b.monthNumber - a.monthNumber;
  });

  return monthGroups;
};
