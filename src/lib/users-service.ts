
import {
  collection,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  updateDoc,
  where,
  getDocs,
  writeBatch,
  increment,
  Timestamp,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { firestore } from './firebase';
import type { PlayerProfile } from '@/types';
import { sendPasswordReset } from './auth-service';

// Helper to convert Firestore doc to PlayerProfile type
const fromFirestore = (doc: any): PlayerProfile => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    email: data.email,
    avatar: data.avatar,
    banner: data.banner || 'https://placehold.co/800x300.png',
    gameName: data.gameName || 'Not Set',
    gamerId: data.gamerId,
    joined: data.joined,
    role: data.role,
    winrate: data.winrate,
    games: data.games,
    wins: data.wins || 0,
    balance: data.balance || 0,
    pendingBalance: data.pendingBalance || 0,
    teamId: data.teamId || undefined,
    status: data.status || 'active',
  };
};

export const createUserProfile = async (user: User) => {
  const userRef = doc(firestore, 'users', user.uid);
  const docSnap = await getDoc(userRef);

  if (!docSnap.exists()) {
    // Only create profile if it doesn't exist
    const newUserProfile: Omit<PlayerProfile, 'id'> = {
      name: user.displayName || user.email?.split('@')[0] || 'New Player',
      email: user.email || '',
      avatar: user.photoURL || `https://placehold.co/40x40.png`,
      banner: 'https://placehold.co/800x300.png',
      gameName: 'Not Set',
      gamerId: `player_${Math.random().toString(36).substring(2, 9)}`,
      joined: new Date().toISOString(),
      role: 'Player',
      winrate: 0,
      games: 0,
      wins: 0,
      balance: 0,
      pendingBalance: 0,
      teamId: '',
      status: 'active',
    };
    await setDoc(userRef, newUserProfile);
  }
};

export const getUsersStream = (callback: (users: PlayerProfile[]) => void) => {
  const q = query(collection(firestore, 'users'), orderBy('joined', 'desc'));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const users = querySnapshot.docs.map(fromFirestore);
    callback(users);
  }, (error) => {
    console.error("Error fetching users stream: ", error);
    callback([]);
  });

  return unsubscribe;
};

export const getTopPlayersStream = (callback: (players: PlayerProfile[]) => void, count: number = 3) => {
  const q = query(collection(firestore, 'users'), orderBy('winrate', 'desc'), limit(count));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const players = querySnapshot.docs.map(fromFirestore);
    callback(players);
  }, (error) => {
    console.error("Error fetching top players stream: ", error);
    callback([]);
  });

  return unsubscribe;
}

export const getPlayersStream = (callback: (players: PlayerProfile[]) => void) => {
  const q = query(collection(firestore, 'users'), orderBy('winrate', 'desc'));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const players = querySnapshot.docs.map(fromFirestore);
    callback(players);
  }, (error) => {
    console.error("Error fetching players stream: ", error);
    callback([]);
  });

  return unsubscribe;
};

export const getUserProfileStream = (userId: string, callback: (profile: PlayerProfile | null) => void) => {
    const userRef = doc(firestore, 'users', userId);

    const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(fromFirestore(docSnap));
        } else {
            callback(null);
        }
    }, (error) => {
        console.error("Error fetching user profile stream: ", error);
        callback(null);
    });

    return unsubscribe;
};

export const updateUserProfile = async (userId: string, data: Partial<Pick<PlayerProfile, 'name' | 'gamerId' | 'avatar' | 'banner' | 'gameName'>>) => {
  try {
    const userRef = doc(firestore, 'users', userId);
    await updateDoc(userRef, data);
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const findUserByGamerId = async (gamerId: string): Promise<PlayerProfile | null> => {
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('gamerId', '==', gamerId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }

    // Assuming gamerId is unique, return the first one found.
    return fromFirestore(querySnapshot.docs[0]);
}

export const updateUserBalance = async (
  userId: string,
  amount: number
): Promise<{ success: boolean; error?: string }> => {
  if (!userId || !amount) {
    return { success: false, error: 'User ID and amount are required.' };
  }

  const userRef = doc(firestore, 'users', userId);

  try {
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      return { success: false, error: 'User not found.' };
    }
    
    // Prevent balance from going negative on removal
    const currentBalance = userSnap.data().balance || 0;
    if (amount < 0 && (currentBalance + amount < 0)) {
        return { success: false, error: 'User balance cannot go below zero.' };
    }
    
    const batch = writeBatch(firestore);
    const transactionRef = doc(collection(firestore, 'transactions'));

    // Update user balance
    batch.update(userRef, { balance: increment(amount) });

    // Create a transaction log
    batch.set(transactionRef, {
      userId,
      amount,
      type: 'admin_adjustment',
      description: `Admin balance adjustment`,
      date: Timestamp.now(),
      status: 'completed',
    });

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error updating user balance:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const updateUserStatus = async (
    userId: string,
    status: 'active' | 'banned'
): Promise<{ success: boolean; error?: string }> => {
    try {
        const userRef = doc(firestore, 'users', userId);
        await updateDoc(userRef, { status });
        return { success: true };
    } catch (error) {
        console.error('Error updating user status:', error);
        return { success: false, error: (error as Error).message };
    }
}

export const sendPasswordResetForUser = async (email: string | null): Promise<{ success: boolean; error?: string }> => {
    if (!email) {
        return { success: false, error: 'User email is not available.' };
    }
    try {
        await sendPasswordReset(email);
        return { success: true };
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return { success: false, error: (error as Error).message };
    }
};
