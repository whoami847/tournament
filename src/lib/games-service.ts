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
  getDoc,
  getDocs,
} from 'firebase/firestore';
import { firestore } from './firebase';
import type { GameCategory } from '@/types';

// Helper to convert Firestore doc to GameCategory type
const fromFirestore = (doc: any): GameCategory => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    categories: data.categories,
    image: data.image,
    dataAiHint: data.dataAiHint,
    description: data.description || '',
  };
};

export const addGame = async (game: Omit<GameCategory, 'id'>) => {
  try {
    const newGame = {
      ...game,
      createdAt: Timestamp.now(),
    };
    await addDoc(collection(firestore, 'games'), newGame);
    return { success: true };
  } catch (error) {
    console.error('Error adding game: ', error);
    return { success: false, error: (error as Error).message };
  }
};

export const getGamesStream = (callback: (games: GameCategory[]) => void) => {
  const q = query(collection(firestore, 'games'), orderBy('name', 'asc'));
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const games = querySnapshot.docs.map(fromFirestore);
    callback(games);
  }, (error) => {
    console.error("Error fetching games stream: ", error);
    callback([]);
  });

  return unsubscribe;
};

export const getGames = async (): Promise<GameCategory[]> => {
    try {
        const q = query(collection(firestore, 'games'), orderBy('name', 'asc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(fromFirestore);
    } catch (error) {
        console.error("Error fetching games: ", error);
        return [];
    }
};

export const getGame = async (id: string): Promise<GameCategory | null> => {
    try {
        const docRef = doc(firestore, 'games', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return fromFirestore(docSnap);
        }
        return null;
    } catch (error) {
        console.error('Error getting game:', error);
        return null;
    }
};

export const updateGame = async (id: string, data: Partial<GameCategory>) => {
  try {
    const docRef = doc(firestore, 'games', id);
    await updateDoc(docRef, data);
    return { success: true };
  } catch (error) {
    console.error('Error updating game: ', error);
    return { success: false, error: (error as Error).message };
  }
};

export const deleteGame = async (id: string) => {
  try {
    await deleteDoc(doc(firestore, 'games', id));
    return { success: true };
  } catch (error) {
    console.error('Error deleting game: ', error);
    return { success: false, error: (error as Error).message };
  }
};
