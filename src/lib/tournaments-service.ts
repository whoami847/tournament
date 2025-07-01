'use server';

import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  Timestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { firestore } from './firebase';
import type { Tournament } from '@/types';

// Helper to convert Firestore doc to Tournament type
const fromFirestore = (doc: any): Tournament => {
  const data = doc.data();
  const a = {
    id: doc.id,
    name: data.name,
    game: data.game,
    // Convert Firestore Timestamp to ISO string for client-side compatibility
    startDate: new Date(data.startDate.seconds * 1000).toISOString(),
    teamsCount: data.teamsCount,
    maxTeams: data.maxTeams,
    entryFee: data.entryFee,
    prizePool: data.prizePool,
    rules: data.rules,
    status: data.status,
    participants: data.participants,
    bracket: data.bracket,
    image: data.image,
    dataAiHint: data.dataAiHint,
    format: data.format,
    perKillPrize: data.perKillPrize,
    map: data.map,
    version: data.version,
    createdAt: new Date(data.createdAt.seconds * 1000).toISOString(),
  };
  return a
};

export const addTournament = async (tournament: Omit<Tournament, 'id' | 'createdAt' | 'teamsCount' | 'status' | 'participants' | 'bracket' | 'image' | 'dataAiHint'>) => {
  try {
    const newTournament = {
      ...tournament,
      startDate: Timestamp.fromDate(new Date(tournament.startDate)),
      createdAt: Timestamp.now(),
      // Default values for a new tournament
      teamsCount: 0,
      status: 'upcoming', 
      participants: [],
      bracket: [],
      image: 'https://placehold.co/600x400.png',
      dataAiHint: 'esports tournament'
    };
    await addDoc(collection(firestore, 'tournaments'), newTournament);
    return { success: true };
  } catch (error) {
    console.error('Error adding tournament: ', error);
    return { success: false, error: (error as Error).message };
  }
};

export const getTournamentsStream = (callback: (tournaments: Tournament[]) => void) => {
  const q = query(collection(firestore, 'tournaments'), orderBy('startDate', 'desc'));
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const tournaments = querySnapshot.docs.map(fromFirestore);
    callback(tournaments);
  }, (error) => {
    console.error("Error fetching tournaments stream: ", error);
    callback([]);
  });

  return unsubscribe;
};

export const getTournament = async (id: string): Promise<Tournament | null> => {
  try {
    const docRef = doc(firestore, 'tournaments', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return fromFirestore(docSnap);
    }
    return null;
  } catch (error) {
    console.error('Error getting tournament: ', error);
    return null;
  }
};

export const updateTournament = async (id: string, data: Partial<Tournament>) => {
  try {
    const docRef = doc(firestore, 'tournaments', id);
    const updateData: { [key: string]: any } = { ...data };

    if (data.startDate) {
        updateData.startDate = Timestamp.fromDate(new Date(data.startDate));
    }

    await updateDoc(docRef, updateData);
    return { success: true };
  } catch (error) {
    console.error('Error updating tournament: ', error);
    return { success: false, error: (error as Error).message };
  }
};

export const deleteTournament = async (id: string) => {
  try {
    await deleteDoc(doc(firestore, 'tournaments', id));
    return { success: true };
  } catch (error) {
    console.error('Error deleting tournament: ', error);
    return { success: false, error: (error as Error).message };
  }
};
