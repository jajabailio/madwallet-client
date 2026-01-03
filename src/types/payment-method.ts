import type { Wallet } from './wallet';

export interface PaymentMethod {
  id: number;
  name: string;
  type: string;
  description?: string;
  statementDate?: number;
  paymentDueDate?: number;
  linkedWalletId?: number;
  linkedWallet?: Wallet;
  autoDeduct: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethodSummary {
  totalExpensesCents: number;
  totalPaidCents: number;
  totalUnpaidCents: number;
  paidCount: number;
  unpaidCount: number;
  overdueCents: number;
  overdueCount: number;
  dueThisMonthCents: number;
  dueThisMonthCount: number;
}

export interface PaymentMethodExpenseFilters {
  startDate?: Date;
  endDate?: Date;
  statusId?: number;
  isPurchase?: boolean;
}
