import {
  collection,
  onSnapshot,
  query,
  where,
  Timestamp,
  addDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { firestore } from './firebase';
import type { AppNotification } from '@/types';

// Helper to convert Firestore doc to AppNotification type
const fromFirestore = (doc: any): AppNotification => {
  const data = doc.data();
  return {
    id: doc.id,
    userId: data.userId,
    title: data.title,
    description: data.description,
    link: data.link,
    read: data.read,
    createdAt: data.createdAt, // This will be a Firestore Timestamp
    // NEW optional fields
    type: data.type || 'generic',
    from: data.from,
    team: data.team,
    status: data.status,
    response: data.response,
  };
};

export const getNotificationsStream = (
  userId: string,
  callback: (notifications: AppNotification[]) => void
) => {
  const q = query(
    collection(firestore, 'notifications'),
    where('userId', '==', userId)
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const notifications = querySnapshot.docs.map(fromFirestore);
    // Sort client-side to avoid needing a composite index
    const sorted = notifications.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
    callback(sorted.slice(0, 10)); // Limit to the 10 most recent
  }, (error) => {
    console.error("Error fetching notifications stream: ", error);
    callback([]);
  });

  return unsubscribe;
};

export const createNotification = async (notification: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => {
    try {
        await addDoc(collection(firestore, 'notifications'), {
            ...notification,
            read: false,
            createdAt: Timestamp.now(),
        });
        return { success: true };
    } catch (error) {
        console.error('Error creating notification:', error);
        return { success: false, error: (error as Error).message };
    }
}

export const markNotificationAsRead = async (notificationId: string) => {
    try {
        const docRef = doc(firestore, 'notifications', notificationId);
        await updateDoc(docRef, { read: true });
        return { success: true };
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return { success: false, error: (error as Error).message };
    }
}

export const updateNotificationStatus = async (notificationId: string, status: 'accepted' | 'rejected') => {
    try {
        const docRef = doc(firestore, 'notifications', notificationId);
        await updateDoc(docRef, { status: status, read: true }); // Mark as read when action is taken
        return { success: true };
    } catch (error) {
        console.error('Error updating notification status:', error);
        return { success: false, error: (error as Error).message };
    }
}
