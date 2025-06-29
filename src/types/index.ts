export type Game = 'Free Fire' | 'Mobile Legends' | 'Valorant' | 'COD: Mobile';

export interface Team {
  id: string;
  name: string;
  avatar: string;
}

export interface Match {
  id: string;
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
}
