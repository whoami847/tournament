'use server';

import { redirect } from 'next/navigation';
import { mockTransactions, mockUsers } from './mock-data';

export async function createPaymentUrl(
  userId: string | null,
  state: { error: string } | null,
  formData: FormData
) {
  if (!userId) {
    return { error: 'User is not authenticated. Please log in again.' };
  }

  const rawFormData = {
    amount: formData.get('amount'),
  };

  if (!rawFormData.amount || +rawFormData.amount < 10) {
    return { error: 'Amount is required and must be at least 10.' };
  }

  const transaction_id = `TRX-${Date.now()}`;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
  const success_url = `${baseUrl}/payment/success?transaction_id=${transaction_id}`;
  
  // Simulate creating a pending transaction
  mockTransactions.unshift({
    id: transaction_id,
    userId,
    amount: parseFloat(rawFormData.amount.toString()),
    type: 'deposit',
    description: 'Mock Deposit',
    date: new Date().toISOString(),
    // @ts-ignore
    status: 'pending',
    transaction_id,
  });

  // In mock mode, we just redirect to success immediately.
  redirect(success_url);
}


export async function verifyPayment(transaction_id: string | null) {
  if (!transaction_id) {
    return { status: 'error' as const, message: 'Transaction ID is missing.' };
  }

  const transactionIndex = mockTransactions.findIndex(t => t.id === transaction_id);
  if (transactionIndex === -1) {
    return { status: 'fail' as const, message: 'Transaction not found in our system.' };
  }
  
  const transaction = mockTransactions[transactionIndex];
  // @ts-ignore
  if (transaction.status !== 'pending') {
    return { status: 'success' as const, message: 'Transaction already processed.' };
  }
  
  const user = mockUsers.find(u => u.id === transaction.userId);
  if (user) {
    user.balance += transaction.amount;
  }
  
  // @ts-ignore
  transaction.status = 'success';
  
  return { status: 'success' as const, data: { status: 'completed' }, message: 'Payment verified successfully.' };
}

export async function withdrawAmount(
  userId: string,
  amountToWithdraw: number,
  method: string
): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    return { success: false, error: 'User not authenticated.' };
  }
  if (!amountToWithdraw || amountToWithdraw <= 0) {
    return { success: false, error: 'Invalid withdrawal amount.' };
  }
  
  const user = mockUsers.find(u => u.id === userId);
  if (!user || user.balance < amountToWithdraw) {
    return { success: false, error: 'Insufficient balance.' };
  }

  user.balance -= amountToWithdraw;

  mockTransactions.unshift({
    id: `w_trx_${Date.now()}`,
    userId,
    amount: -amountToWithdraw,
    type: 'withdrawal',
    description: `Withdrawal to ${method}`,
    date: new Date().toISOString(),
  });
  
  return { success: true };
}
