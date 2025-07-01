import {
  collection,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { firestore } from './firebase';
import type { PlayerProfile } from '@/types';

// Helper to convert Firestore doc to PlayerProfile type
const fromFirestore = (doc: any): PlayerProfile => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    email: data.email,
    avatar: data.avatar,
    gamerId: data.gamerId,
    country: data.country,
    joined: data.joined,
    role: data.role,
    winrate: data.winrate,
    games: data.games,
    balance: data.balance || 0,
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
      gamerId: `player_${Math.random().toString(36).substring(2, 9)}`,
      country: 'India',
      joined: new Date().toISOString(),
      role: 'Player',
      winrate: 0,
      games: 0,
      balance: 0,
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
