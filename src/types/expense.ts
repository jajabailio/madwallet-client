import type { Category } from './category';
import type { PaymentMethod } from './payment-method';
import type { Purchase } from './purchase';
import type { Status } from './status';

export interface Expense {
  id: number;
  description: string;
  amountCents: number;  // Amount stored in cents
  categoryId: number;
  category: Category;
  statusId?: number;
  status?: Status;
  paymentMethodId?: number;
  paymentMethod?: PaymentMethod;
  date: Date;
  purchaseId?: number;
  purchase?: Purchase;
  installmentNumber?: number;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
