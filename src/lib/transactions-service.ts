import {
    collection,
    onSnapshot,
    query,
    where,
    orderBy,
} from 'firebase/firestore';
import { firestore } from './firebase';
import type { Transaction } from '@/types';

// Helper to convert Firestore doc to Transaction type
const fromFirestore = (doc: any): Transaction => {
  const data = doc.data();
  return {
    id: doc.id,
    userId: data.userId,
    amount: data.amount,
    type: data.type,
    description: data.description,
    date: new Date(data.date.seconds * 1000).toISOString(),
  };
};

export const getTransactionsStream = (
  userId: string,
  callback: (transactions: Transaction[]) => void
) => {
  const q = query(
    collection(firestore, 'transactions'),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const transactions = querySnapshot.docs.map(fromFirestore);
    callback(transactions);
  }, (error) => {
    console.error("Error fetching transactions stream: ", error);
    callback([]);
  });

  return unsubscribe;
};
