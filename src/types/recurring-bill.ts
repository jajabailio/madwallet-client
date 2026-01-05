import type { Category } from './category';
import type { Expense } from './expense';
import type { PaymentMethod } from './payment-method';
import type { Status } from './status';

export type RecurringBillFrequency = 'monthly' | 'quarterly' | 'annual';

export interface RecurringBill {
  id: number;
  userId: number;
  name: string;
  description?: string;
  amountCents: number; // Amount stored in cents
  frequency: RecurringBillFrequency;
  dayOfMonth: number; // 1-31
  categoryId: number;
  category?: Category;
  statusId: number;
  status?: Status;
  paymentMethodId?: number;
  paymentMethod?: PaymentMethod;
  startDate: Date;
  nextDueDate: Date;
  lastGenerated?: Date;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  expenses?: Expense[];
}
