import type { RegistrationLog, TeamType } from '@/types';
import { mockRegistrationLogs } from './mock-data';

// This function is intended to be called within a batch in the original code.
// In mock mode, we'll just add it to the array.
export const createRegistrationLog = (
  batch: null, // Batch is not used in mock mode
  logData: {
    tournamentId: string;
    tournamentName: string;
    game: string;
    teamName: string;
    teamType: TeamType;
    players: { name: string; gamerId: string }[];
  }
) => {
  const newLog: RegistrationLog = {
    ...logData,
    id: `reg_${Date.now()}`,
    status: 'approved',
    registeredAt: new Date().toISOString(),
  };
  mockRegistrationLogs.unshift(newLog);
};

export const getRegistrationsStream = (callback: (logs: RegistrationLog[]) => void) => {
  callback(mockRegistrationLogs);
  return () => {};
};
