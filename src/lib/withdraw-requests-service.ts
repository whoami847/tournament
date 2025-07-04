import {
  collection,
  onSnapshot,
  doc,
  writeBatch,
  query,
  orderBy,
  where,
  getDoc,
  increment,
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { firestore } from './firebase';
import type { WithdrawRequest, PlayerProfile } from '@/types';
import { createNotification } from './notifications-service';

const fromFirestore = (doc: any): WithdrawRequest => {
  const data = doc.data();
  return {
    id: doc.id,
    userId: data.userId,
    userName: data.userName,
    userGamerId: data.userGamerId,
    amount: data.amount,
    method: data.method,
    status: data.status,
    requestedAt: data.requestedAt,
  };
};

export const getPendingWithdrawRequestsStream = (callback: (requests: WithdrawRequest[]) => void) => {
  const q = query(
    collection(firestore, 'withdrawRequests'), 
    where('status', '==', 'pending'),
    orderBy('requestedAt', 'asc')
  );
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    callback(querySnapshot.docs.map(fromFirestore));
  }, (error) => {
    console.error("Error fetching withdraw requests:", error);
    callback([]);
  });

  return unsubscribe;
};

export const processWithdrawRequest = async (requestId: string, newStatus: 'approved' | 'rejected') => {
    const requestRef = doc(firestore, 'withdrawRequests', requestId);
    
    try {
        const batch = writeBatch(firestore);
        const requestSnap = await getDoc(requestRef);
        if (!requestSnap.exists()) throw new Error("Request not found.");
        
        const requestData = requestSnap.data() as any;
        const userRef = doc(firestore, 'users', requestData.userId);

        batch.update(requestRef, { status: newStatus });

        // If REJECTED, refund the money to the user's balance
        if (newStatus === 'rejected') {
            batch.update(userRef, { balance: increment(requestData.amount) });
        }
        
        // If APPROVED, create a transaction log (money is already deducted on request)
        if (newStatus === 'approved') {
            const transactionRef = doc(collection(firestore, 'transactions'));
            batch.set(transactionRef, {
                userId: requestData.userId,
                amount: -requestData.amount,
                type: 'withdrawal',
                description: `Withdrawal to ${requestData.method}`,
                date: Timestamp.now(),
                status: 'completed',
            });
        }
        
        await batch.commit();
        
        // Send notification to the user
        await createNotification({
            userId: requestData.userId,
            title: `Withdrawal ${newStatus}`,
            description: `Your withdrawal request of ${requestData.amount} TK has been ${newStatus}.`,
            link: '/wallet'
        });
        
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
};

export async function createWithdrawalRequest(
  profile: PlayerProfile,
  amount: number,
  method: string
): Promise<{ success: boolean; error?: string }> {
  if (!profile) return { success: false, error: 'User not authenticated.' };
  if (!amount || amount <= 0) return { success: false, error: 'Invalid withdrawal amount.' };
  if (profile.balance < amount) return { success: false, error: 'Insufficient balance.' };
  
  try {
    const batch = writeBatch(firestore);
    const userRef = doc(firestore, 'users', profile.id);
    const requestRef = doc(collection(firestore, 'withdrawRequests'));
    
    // Hold the funds by deducting from balance
    batch.update(userRef, { balance: increment(-amount) });
    
    // Create the withdrawal request document
    const newRequest: Omit<WithdrawRequest, 'id'> = {
        userId: profile.id,
        userName: profile.name,
        userGamerId: profile.gamerId,
        amount: amount,
        method: method,
        status: 'pending',
        requestedAt: Timestamp.now(),
    };
    batch.set(requestRef, newRequest);
    
    await batch.commit();
    return { success: true };

  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
