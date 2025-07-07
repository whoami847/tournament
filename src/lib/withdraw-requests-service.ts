import type { WithdrawRequest, PlayerProfile } from '@/types';
import { mockWithdrawRequests, mockUsers, mockTransactions } from './mock-data';
import { createNotification } from './notifications-service';

let requests = [...mockWithdrawRequests];

export const getPendingWithdrawRequestsStream = (callback: (requests: WithdrawRequest[]) => void) => {
  const pending = requests.filter(r => r.status === 'pending');
  pending.sort((a, b) => new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime());
  callback(pending);
  return () => {};
};

export const processWithdrawRequest = async (requestId: string, newStatus: 'approved' | 'rejected') => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return { success: false, error: "Request not found." };

    request.status = newStatus;

    if (newStatus === 'rejected') {
        const user = mockUsers.find(u => u.id === request.userId);
        if (user) {
            user.balance += request.amount;
        }
    }
    
    if (newStatus === 'approved') {
        mockTransactions.unshift({
            id: `w_trx_${Date.now()}`,
            userId: request.userId,
            amount: -request.amount,
            type: 'withdrawal',
            description: `Withdrawal to ${request.method}`,
            date: new Date().toISOString(),
        });
    }

    await createNotification({
        userId: request.userId,
        title: `Withdrawal ${newStatus}`,
        description: `Your withdrawal request of ${request.amount} TK has been ${newStatus}.`,
        link: '/wallet'
    });
    
    return { success: true };
};

export async function createWithdrawalRequest(
  profile: PlayerProfile,
  amount: number,
  method: string,
  accountNumber: string
): Promise<{ success: boolean; error?: string }> {
  if (!profile) return { success: false, error: 'User not authenticated.' };
  if (!amount || amount <= 0) return { success: false, error: 'Invalid withdrawal amount.' };
  if (!accountNumber) return { success: false, error: 'Account number is required.' };
  
  const user = mockUsers.find(u => u.id === profile.id);
  if (!user || user.balance < amount) return { success: false, error: 'Insufficient balance.' };
  
  user.balance -= amount;
  
  const newRequest: WithdrawRequest = {
      id: `wr_${Date.now()}`,
      userId: profile.id,
      userName: profile.name,
      userGamerId: profile.gamerId,
      amount: amount,
      method: method,
      accountNumber: accountNumber,
      status: 'pending',
      requestedAt: new Date().toISOString(),
  };
  requests.unshift(newRequest);
  
  return { success: true };
}
