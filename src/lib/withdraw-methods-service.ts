import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  Timestamp,
  where,
  getDocs,
} from 'firebase/firestore';
import { firestore } from './firebase';
import type { WithdrawMethod } from '@/types';

const fromFirestore = (doc: any): WithdrawMethod => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    receiverInfo: data.receiverInfo,
    feePercentage: data.feePercentage,
    minAmount: data.minAmount,
    maxAmount: data.maxAmount,
    status: data.status,
  };
};

export const addWithdrawMethod = async (method: Omit<WithdrawMethod, 'id'>) => {
  try {
    await addDoc(collection(firestore, 'withdrawMethods'), {
      ...method,
      createdAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const getWithdrawMethodsStream = (callback: (methods: WithdrawMethod[]) => void) => {
  const q = query(collection(firestore, 'withdrawMethods'), orderBy('name', 'asc'));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    callback(querySnapshot.docs.map(fromFirestore));
  }, (error) => {
    console.error("Error fetching withdraw methods:", error);
    callback([]);
  });
  return unsubscribe;
};

export const getActiveWithdrawMethods = async (): Promise<WithdrawMethod[]> => {
    // The query was previously using orderBy('name'), which requires a composite index.
    // To avoid this requirement for the user, we sort the results in code.
    const q = query(collection(firestore, 'withdrawMethods'), where('status', '==', 'active'));
    try {
        const querySnapshot = await getDocs(q);
        const methods = querySnapshot.docs.map(fromFirestore);
        // Sort alphabetically by name
        methods.sort((a, b) => a.name.localeCompare(b.name));
        return methods;
    } catch (error) {
        console.error("Error fetching active withdraw methods:", error);
        return [];
    }
}

export const updateWithdrawMethod = async (id: string, data: Partial<Omit<WithdrawMethod, 'id'>>) => {
  try {
    await updateDoc(doc(firestore, 'withdrawMethods', id), data);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const deleteWithdrawMethod = async (id: string) => {
  try {
    await deleteDoc(doc(firestore, 'withdrawMethods', id));
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};
