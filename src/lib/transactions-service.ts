import {
    collection,
    onSnapshot,
    query,
    where,
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
  // The query was previously using orderBy('date', 'desc'), which requires a composite index in Firestore.
  // To avoid this requirement, we fetch the data without server-side sorting and sort it on the client.
  const q = query(
    collection(firestore, 'transactions'),
    where('userId', '==', userId)
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const transactions = querySnapshot.docs.map(fromFirestore);
    // Sort transactions by date in descending order on the client side.
    const sortedTransactions = transactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    callback(sortedTransactions);
  }, (error) => {
    console.error("Error fetching transactions stream: ", error);
    callback([]);
  });

  return unsubscribe;
};
