import type { Transaction } from '@/types';
import { mockTransactions } from './mock-data';

export const getTransactionsStream = (
  userId: string,
  callback: (transactions: Transaction[]) => void
) => {
  const userTransactions = mockTransactions
    .filter(t => t.userId === userId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
  callback(userTransactions);
  return () => {};
};
