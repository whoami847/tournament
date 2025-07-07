import type { PlayerProfile } from '@/types';
import { mockUsers, mockAdmin, mockTransactions } from './mock-data';

let users = [...mockUsers, mockAdmin];

export const createUserProfile = async (user: any) => {
  // In mock mode, profile is assumed to be created on sign up.
  return Promise.resolve();
};

export const getUsersStream = (callback: (users: PlayerProfile[]) => void) => {
  const sortedUsers = [...users].sort((a, b) => new Date(b.joined).getTime() - new Date(a.joined).getTime());
  callback(sortedUsers);
  return () => {};
};

export const getTopPlayersStream = (callback: (players: PlayerProfile[]) => void, count: number = 3) => {
  const sortedPlayers = [...users]
    .filter(u => u.role === 'Player')
    .sort((a, b) => b.winrate - a.winrate)
    .slice(0, count);
  callback(sortedPlayers);
  return () => {};
}

export const getPlayersStream = (callback: (players: PlayerProfile[]) => void) => {
  const sortedPlayers = [...users]
    .filter(u => u.role === 'Player')
    .sort((a, b) => b.winrate - a.winrate);
  callback(sortedPlayers);
  return () => {};
};

export const getUserProfileStream = (userId: string, callback: (profile: PlayerProfile | null) => void) => {
    const user = users.find(u => u.id === userId) || null;
    callback(user);
    return () => {};
};

export const updateUserProfile = async (userId: string, data: Partial<Pick<PlayerProfile, 'name' | 'gamerId' | 'avatar' | 'banner' | 'gameName'>>) => {
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex > -1) {
    users[userIndex] = { ...users[userIndex], ...data };
    return { success: true };
  }
  return { success: false, error: "User not found." };
};

export const findUserByGamerId = async (gamerId: string): Promise<PlayerProfile | null> => {
    const user = users.find(u => u.gamerId === gamerId);
    return Promise.resolve(user || null);
}

export const updateUserBalance = async (
  userId: string,
  amount: number
): Promise<{ success: boolean; error?: string }> => {
  const user = users.find(u => u.id === userId);
  if (!user) return { success: false, error: "User not found." };

  if (amount < 0 && (user.balance + amount < 0)) {
    return { success: false, error: 'User balance cannot go below zero.' };
  }

  user.balance += amount;

  mockTransactions.unshift({
    id: `admin_trx_${Date.now()}`,
    userId,
    amount,
    type: 'admin_adjustment',
    description: `Admin balance adjustment`,
    date: new Date().toISOString(),
  });

  return { success: true };
};

export const updateUserStatus = async (
    userId: string,
    status: 'active' | 'banned'
): Promise<{ success: boolean; error?: string }> => {
    const user = users.find(u => u.id === userId);
    if (user) {
        user.status = status;
        return { success: true };
    }
    return { success: false, error: "User not found." };
}

export const sendPasswordResetForUser = async (email: string | null): Promise<{ success: boolean; error?: string }> => {
    if (!email) {
        return { success: false, error: 'User email is not available.' };
    }
    console.log(`Mock: Password reset sent to ${email}`);
    return { success: true };
};
