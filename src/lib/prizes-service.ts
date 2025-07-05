import {
  collection,
  onSnapshot,
  doc,
  writeBatch,
  query,
  where,
  getDoc,
  increment,
  Timestamp,
} from 'firebase/firestore';
import { firestore } from './firebase';
import type { PendingPrize } from '@/types';
import { createNotification } from './notifications-service';

const fromFirestore = (doc: any): PendingPrize => {
    const data = doc.data();
    return {
        id: doc.id,
        userId: data.userId,
        userName: data.userName,
        userGamerId: data.userGamerId,
        amount: data.amount,
        tournamentId: data.tournamentId,
        tournamentName: data.tournamentName,
        reason: data.reason,
        status: data.status,
        createdAt: data.createdAt,
    };
};

export const getPendingPrizesStream = (callback: (prizes: PendingPrize[]) => void) => {
    const q = query(
        collection(firestore, 'pendingPrizes'),
        where('status', '==', 'pending')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const prizes = snapshot.docs.map(fromFirestore);
        prizes.sort((a, b) => a.createdAt.seconds - b.createdAt.seconds);
        callback(prizes);
    }, (error) => {
        console.error("Error fetching pending prizes:", error);
        callback([]);
    });
    return unsubscribe;
};

export const processPendingPrize = async (prizeId: string, newStatus: 'approved' | 'rejected') => {
    const prizeRef = doc(firestore, 'pendingPrizes', prizeId);
    
    try {
        const batch = writeBatch(firestore);
        const prizeSnap = await getDoc(prizeRef);
        if (!prizeSnap.exists()) throw new Error("Prize request not found.");
        
        const prizeData = prizeSnap.data() as any;
        const userRef = doc(firestore, 'users', prizeData.userId);

        batch.update(prizeRef, { status: newStatus });

        // Update user's balances
        batch.update(userRef, {
            pendingBalance: increment(-prizeData.amount)
        });

        if (newStatus === 'approved') {
            batch.update(userRef, {
                balance: increment(prizeData.amount)
            });
            // Create a transaction log
            const transactionRef = doc(collection(firestore, 'transactions'));
            batch.set(transactionRef, {
                userId: prizeData.userId,
                amount: prizeData.amount,
                type: 'prize',
                description: `Prize from ${prizeData.tournamentName}: ${prizeData.reason}`,
                date: Timestamp.now(),
                status: 'completed',
            });
        }
        
        await batch.commit();
        
        // Send notification to the user
        await createNotification({
            userId: prizeData.userId,
            title: `Prize Money ${newStatus}`,
            description: `Your prize of ${prizeData.amount} TK from ${prizeData.tournamentName} has been ${newStatus}.`,
            link: '/wallet'
        });
        
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
};
