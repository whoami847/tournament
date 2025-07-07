import type { PendingPrize } from '@/types';
import { mockPendingPrizes, mockUsers, mockTransactions } from './mock-data';
import { createNotification } from './notifications-service';

let pendingPrizes = [...mockPendingPrizes];

export const getPendingPrizesStream = (callback: (prizes: PendingPrize[]) => void) => {
    const pending = pendingPrizes.filter(p => p.status === 'pending');
    pending.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    callback(pending);
    return () => {};
};

export const processPendingPrize = async (prizeId: string, newStatus: 'approved' | 'rejected') => {
    const prizeIndex = pendingPrizes.findIndex(p => p.id === prizeId);
    if (prizeIndex === -1) {
        return { success: false, error: "Prize request not found." };
    }
    
    const prize = pendingPrizes[prizeIndex];
    const user = mockUsers.find(u => u.id === prize.userId);
    
    if (!user) {
        return { success: false, error: "User not found." };
    }

    prize.status = newStatus;
    user.pendingBalance -= prize.amount;

    if (newStatus === 'approved') {
        user.balance += prize.amount;
        mockTransactions.unshift({
            id: `prize_trx_${Date.now()}`,
            userId: prize.userId,
            amount: prize.amount,
            type: 'prize',
            description: `Prize from ${prize.tournamentName}: ${prize.reason}`,
            date: new Date().toISOString(),
        });
    }
    
    await createNotification({
        userId: prize.userId,
        title: `Prize Money ${newStatus}`,
        description: `Your prize of ${prize.amount} TK from ${prize.tournamentName} has been ${newStatus}.`,
        link: '/wallet'
    });
    
    return { success: true };
};
