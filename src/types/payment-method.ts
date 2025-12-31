export interface PaymentMethod {
  id: number;
  name: string;
  type: string;
  description?: string;
  statementDate?: number;
  paymentDueDate?: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
