export interface Wallet {
  id: number;
  name: string;
  description?: string;
  type: string;
  balanceCents: number;
  currency: string;
  isActive: boolean;
  isDeleted: boolean;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}
