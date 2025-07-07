import { mockGames } from './mock-data';
import type { GameCategory } from '@/types';

let games = [...mockGames];

export const addGame = async (game: Omit<GameCategory, 'id'>) => {
  const newGame = {
    ...game,
    id: `game_${Date.now()}`,
    description: game.description || "No description available.",
  };
  games.push(newGame);
  games.sort((a, b) => a.name.localeCompare(b.name));
  return { success: true };
};

export const getGamesStream = (callback: (games: GameCategory[]) => void) => {
  callback(games);
  return () => {};
};

export const getGames = async (): Promise<GameCategory[]> => {
  return Promise.resolve(games);
};

export const getGame = async (id: string): Promise<GameCategory | null> => {
  const game = games.find(g => g.id === id);
  return Promise.resolve(game || null);
};

export const updateGame = async (id: string, data: Partial<GameCategory>) => {
  const gameIndex = games.findIndex(g => g.id === id);
  if (gameIndex > -1) {
    games[gameIndex] = { ...games[gameIndex], ...data };
    return { success: true };
  }
  return { success: false, error: "Game not found." };
};

export const deleteGame = async (id: string) => {
  const initialLength = games.length;
  games = games.filter(g => g.id !== id);
  if (games.length < initialLength) {
    return { success: true };
  }
  return { success: false, error: "Game not found." };
};
