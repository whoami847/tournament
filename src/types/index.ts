export type Game = string;

export interface GameCategory {
  id: string;
  name: string;
  categories: string;
  image: string;
  dataAiHint?: string;
}

export interface Team {
  id: string;
  name: string;
  avatar: string;
}

export interface Match {
  id: string;
  name: string;
  teams: [Team | null, Team | null];
  scores: [number, number];
  status: 'pending' | 'live' | 'completed';
}

export interface Round {
  name: string;
  matches: Match[];
}

export interface Tournament {
  id: string;
  name: string;
  game: Game;
  startDate: string;
  teamsCount: number;
  maxTeams: number;
  entryFee: number;
  prizePool: string;
  rules: string;
  status: 'upcoming' | 'live' | 'completed';
  participants: Team[];
  bracket: Round[];
  image: string;
  dataAiHint?: string;
  format: string;
  perKillPrize?: number;
  map?: string;
  version?: string;
  createdAt?: string;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface FeaturedBanner {
  id: string;
  game: string;
  name: string;
  date: string;
  image: string;
  dataAiHint: string;
}
