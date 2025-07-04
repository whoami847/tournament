import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  type WriteBatch,
} from 'firebase/firestore';
import { firestore } from './firebase';
import type { RegistrationLog, TeamType } from '@/types';

const fromFirestore = (doc: any): RegistrationLog => {
  const data = doc.data();
  return {
    id: doc.id,
    tournamentId: data.tournamentId,
    tournamentName: data.tournamentName,
    game: data.game,
    teamName: data.teamName,
    teamType: data.teamType,
    players: data.players,
    status: data.status,
    registeredAt: data.registeredAt,
  };
};

export const createRegistrationLog = (
  batch: WriteBatch,
  logData: {
    tournamentId: string;
    tournamentName: string;
    game: string;
    teamName: string;
    teamType: TeamType;
    players: { name: string; gamerId: string }[];
  }
) => {
  const newLogRef = doc(collection(firestore, 'registrations'));
  const newLog: Omit<RegistrationLog, 'id'> = {
    ...logData,
    status: 'approved',
    registeredAt: Timestamp.now(),
  };
  batch.set(newLogRef, newLog);
};

export const getRegistrationsStream = (callback: (logs: RegistrationLog[]) => void) => {
  const q = query(collection(firestore, 'registrations'), orderBy('registeredAt', 'desc'));
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const logs = querySnapshot.docs.map(fromFirestore);
    callback(logs);
  }, (error) => {
    console.error("Error fetching registrations stream: ", error);
    callback([]);
  });

  return unsubscribe;
};
