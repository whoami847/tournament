
import type { Timestamp } from 'firebase/firestore';

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
  dataAiHint?: string;
  members?: { name: string; gamerId: string }[];
}

export interface Match {
  id: string;
  name: string;
  teams: [Team | null, Team | null];
  scores: [number, number];
  status: 'pending' | 'live' | 'completed';
  resultSubmissionStatus?: { [teamId: string]: 'pending' | 'submitted' | 'approved' | 'rejected' };
  roomId?: string;
  roomPass?: string;
}

export interface Round {
  name: string;
  matches: Match[];
}

export interface PlacementPoint {
  place: number;
  points: number;
}

export interface PointSystem {
  perKillPoints: number;
  placementPoints: PlacementPoint[];
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
  pointSystemEnabled?: boolean;
  pointSystem?: PointSystem;
  tournamentName?: string; // For MatchHistoryCard consistency
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

export interface PlayerProfile {
  id: string; // This will be the user's UID
  name: string;
  email: string;
  avatar: string;
  banner?: string;
  gameName?: string;
  gamerId: string;
  joined: string; // ISO String
  role: string;
  winrate: number;
  games: number;
  balance: number;
  teamId?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'prize' | 'fee';
  description: string;
  date: string; // ISO string
}

export interface MatchResult {
  id: string;
  tournamentId: string;
  tournamentName: string;
  matchId: string;
  roundName: string;
  teamId: string;
  teamName: string;
  kills: number;
  position: number;
  screenshotUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string; // ISO String
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  description: string;
  link: string;
  read: boolean;
  createdAt: Timestamp;
  type?: 'generic' | 'team_invite' | 'invite_response';
  from?: { uid: string; name:string; };
  team?: { id: string; name: string; };
  status?: 'pending' | 'accepted' | 'rejected';
  response?: 'accepted' | 'rejected';
}

export type TeamType = 'SOLO' | 'DUO' | 'SQUAD';

export interface RegistrationLog {
  id: string;
  tournamentId: string;
  tournamentName: string;
  game: Game;
  teamName: string;
  teamType: TeamType;
  players: { name: string; gamerId: string }[];
  status: 'approved';
  registeredAt: Timestamp;
}

export interface TeamMember {
  uid?: string;
  name: string;
  gamerId: string;
  avatar?: string;
  role: 'Leader' | 'Member';
}

export interface UserTeam {
  id: string;
  name: string;
  avatar: string;
  dataAiHint?: string;
  leaderId: string;
  members: TeamMember[];
  memberGamerIds: string[];
}

export interface PaymentGatewaySettings {
  id: string;
  name: string;
  accessToken: string;
  checkoutUrl: string;
  verifyUrl: string;
}

export interface WithdrawMethod {
  id: string;
  name: string;
  receiverInfo: string;
  feePercentage: number;
  minAmount: number;
  maxAmount: number;
  status: 'active' | 'inactive';
}

export interface WithdrawRequest {
  id: string;
  userId: string;
  userName: string;
  userGamerId: string;
  amount: number;
  method: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Timestamp;
}
