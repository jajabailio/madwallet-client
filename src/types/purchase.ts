import type { Category } from './category';
import type { Expense } from './expense';
import type { PaymentMethod } from './payment-method';
import type { Status } from './status';

export interface Purchase {
  id: number;
  description: string;
  totalAmount: number;
  installmentCount: number;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  status: string;
  categoryId: number;
  category?: Category;
  statusId: number;
  defaultStatus?: Status;
  paymentMethodId?: number;
  paymentMethod?: PaymentMethod;
  expenses?: Expense[];
  createdAt: Date;
  updatedAt: Date;
}
