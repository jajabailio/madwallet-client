import type { Wallet } from './wallet';

export interface WalletTransaction {
  id: number;
  description: string;
  amountCents: number;
  type: string;
  date: Date;
  walletId: number;
  wallet?: Wallet;
  transferWalletId?: number;
  balanceAfterCents: number;
  isDeleted: boolean;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}
