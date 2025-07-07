import type { PlayerProfile, Tournament, GameCategory, FeaturedBanner, Transaction, WithdrawMethod, WithdrawRequest, PendingPrize, RegistrationLog, UserTeam, Match, TeamMember } from '@/types';

// =================================
// USERS
// =================================
export const mockAdmin: PlayerProfile = {
  id: 'usr_admin_1',
  name: 'Admin',
  email: 'admin@esportshq.com',
  avatar: 'https://placehold.co/96x96.png',
  banner: 'https://placehold.co/800x300.png',
  gameName: 'The Overlord',
  gamerId: 'admin_god_mode',
  joined: '2023-01-01T10:00:00Z',
  role: 'Admin',
  winrate: 100,
  games: 1000,
  wins: 1000,
  balance: 99999,
  pendingBalance: 0,
  teamId: '',
  status: 'active',
};

export const mockUsers: PlayerProfile[] = [
  {
    id: 'usr_player_1',
    name: 'ShadowStriker',
    email: 'shadow@test.com',
    avatar: 'https://placehold.co/96x96.png',
    banner: 'https://placehold.co/800x300.png',
    gameName: 'Shadow',
    gamerId: 'shadow_123',
    joined: '2023-10-20T14:30:00Z',
    role: 'Player',
    winrate: 75,
    games: 80,
    wins: 60,
    balance: 1500.50,
    pendingBalance: 250,
    teamId: 'team_1',
    status: 'active',
  },
  {
    id: 'usr_player_2',
    name: 'Vortex',
    email: 'vortex@test.com',
    avatar: 'https://placehold.co/96x96.png',
    banner: 'https://placehold.co/800x300.png',
    gameName: 'Vortex',
    gamerId: 'vortex_pro',
    joined: '2023-11-05T18:00:00Z',
    role: 'Player',
    winrate: 68,
    games: 120,
    wins: 82,
    balance: 850.00,
    pendingBalance: 0,
    teamId: 'team_2',
    status: 'active',
  },
   {
    id: 'usr_player_3',
    name: 'Nova',
    email: 'nova@test.com',
    avatar: 'https://placehold.co/96x96.png',
    banner: 'https://placehold.co/800x300.png',
    gameName: 'Nova',
    gamerId: 'nova_plays',
    joined: '2024-01-15T09:00:00Z',
    role: 'Player',
    winrate: 82,
    games: 50,
    wins: 41,
    balance: 3200.00,
    pendingBalance: 0,
    teamId: 'team_3',
    status: 'active',
  },
];


// =================================
// GAMES
// =================================
export const mockGames: GameCategory[] = [
  {
    id: 'game_1',
    name: 'Free Fire',
    categories: 'Battle Royale, Action',
    image: 'https://placehold.co/400x300.png',
    dataAiHint: 'fire character action',
    description: 'Free Fire is a battle royale game, developed and published by Garena for Android and iOS. It became the most downloaded mobile game globally in 2019.'
  },
  {
    id: 'game_2',
    name: 'PUBG Mobile',
    categories: 'Battle Royale, Shooter',
    image: 'https://placehold.co/400x300.png',
    dataAiHint: 'soldier helmet war',
    description: 'PlayerUnknown\'s Battlegrounds Mobile is a free-to-play battle royale video game developed by LightSpeed & Quantum Studio, a division of Tencent Games.'
  },
  {
    id: 'game_3',
    name: 'Mobile Legends',
    categories: 'MOBA, Strategy',
    image: 'https://placehold.co/400x300.png',
    dataAiHint: 'fantasy character magic',
    description: 'Mobile Legends: Bang Bang is a mobile multiplayer online battle arena (MOBA) game developed and published by Moonton, a subsidiary of ByteDance.'
  },
  {
    id: 'game_4',
    name: 'Valorant',
    categories: 'Tactical Shooter, FPS',
    image: 'https://placehold.co/400x300.png',
    dataAiHint: 'cyborg agent neon',
    description: 'Valorant is a free-to-play first-person hero shooter developed and published by Riot Games, for Microsoft Windows.'
  }
];

// =================================
// BANNERS
// =================================
export const mockBanners: FeaturedBanner[] = [
  {
    id: 'banner_1',
    game: 'Free Fire',
    name: 'Free Fire World Series',
    date: '10.11.2024 • 18:00',
    image: 'https://placehold.co/600x300.png',
    dataAiHint: 'esports fire battle'
  },
  {
    id: 'banner_2',
    game: 'PUBG Mobile',
    name: 'Global Championship',
    date: '15.11.2024 • 20:00',
    image: 'https://placehold.co/600x300.png',
    dataAiHint: 'esports war soldier'
  }
];

// =================================
// TEAMS
// =================================
export const mockTeams: UserTeam[] = [
    {
        id: 'team_1',
        name: 'The Shadow Crew',
        leaderId: 'usr_player_1',
        avatar: 'https://placehold.co/96x96.png',
        dataAiHint: 'wolf logo dark',
        members: [
            { uid: 'usr_player_1', name: 'ShadowStriker', gamerId: 'shadow_123', avatar: 'https://placehold.co/96x96.png', role: 'Leader'},
            { name: 'Ghost', gamerId: 'ghost_gamer_x', role: 'Member' } as TeamMember,
        ],
        memberGamerIds: ['shadow_123', 'ghost_gamer_x'],
    },
    {
        id: 'team_2',
        name: 'Vortex United',
        leaderId: 'usr_player_2',
        avatar: 'https://placehold.co/96x96.png',
        dataAiHint: 'phoenix logo fire',
        members: [
            { uid: 'usr_player_2', name: 'Vortex', gamerId: 'vortex_pro', avatar: 'https://placehold.co/96x96.png', role: 'Leader'},
        ],
        memberGamerIds: ['vortex_pro'],
    },
    {
        id: 'team_3',
        name: 'Crimson Fury',
        leaderId: 'usr_player_3',
        avatar: 'https://placehold.co/96x96.png',
        dataAiHint: 'eagle logo red',
        members: [
            { uid: 'usr_player_3', name: 'Nova', gamerId: 'nova_plays', avatar: 'https://placehold.co/96x96.png', role: 'Leader' },
            { name: 'Reaper', gamerId: 'reaper_ff', role: 'Member' } as TeamMember,
        ],
        memberGamerIds: ['nova_plays', 'reaper_ff'],
    },
    {
        id: 'team_4',
        name: 'Blue Phoenix',
        leaderId: 'some_other_player',
        avatar: 'https://placehold.co/96x96.png',
        dataAiHint: 'phoenix logo blue',
        members: [
            { name: 'Raven', gamerId: 'raven_gaming', role: 'Leader' },
            { name: 'Spike', gamerId: 'spike_yt', role: 'Member' },
        ] as TeamMember[],
        memberGamerIds: ['raven_gaming', 'spike_yt'],
    }
];

// Define some teams for matches
const team1 = mockTeams.find(t => t.id === 'team_1')!;
const team3 = mockTeams.find(t => t.id === 'team_3')!;
const team4 = mockTeams.find(t => t.id === 'team_4')!;

// =================================
// TOURNAMENTS
// =================================
export const mockTournaments: Tournament[] = [
  {
    id: 'tour_1',
    name: 'Free Fire Summer Skirmish',
    game: 'Free Fire',
    startDate: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
    teamsCount: 10,
    maxTeams: 16,
    entryFee: 100,
    prizePool: '10,000',
    rules: 'Standard battle royale rules. Points for placement and kills. Top team advances. No cheating or exploiting bugs is allowed. All players must be registered with their official in-game names. Check-in starts 30 minutes before the match.',
    status: 'upcoming',
    participants: [],
    bracket: [],
    image: 'https://placehold.co/600x400.png',
    dataAiHint: 'esports fire character',
    format: 'BR_SQUAD',
    perKillPrize: 20
  },
  {
    id: 'tour_2',
    name: 'PUBG Mobile Pro League',
    game: 'PUBG Mobile',
    startDate: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    teamsCount: 4,
    maxTeams: 32,
    entryFee: 0,
    prizePool: '50,000',
    rules: 'Official PMGC ruleset applies. All matches are Best of 1. Good luck to all participants.',
    status: 'live',
    participants: [team1, team3],
    bracket: [
        {
            name: 'Semi-finals',
            matches: [
                {
                    id: 'tour_2_semis_m1',
                    name: 'Semi-finals #1',
                    teams: [team1, team3],
                    scores: [0, 0],
                    status: 'live',
                    resultSubmissionStatus: {},
                    roomId: '67890',
                    roomPass: 'livepass',
                },
                { id: 'tour_2_semis_m2', name: 'Semi-finals #2', teams: [null, null], scores: [0, 0], status: 'pending' } as Match,
            ]
        },
        {
            name: 'Finals',
            matches: [{ id: 'tour_2_final_m1', name: 'Finals #1', teams: [null, null], scores: [0, 0], status: 'pending' } as Match]
        }
    ],
    image: 'https://placehold.co/600x400.png',
    dataAiHint: 'esports soldier war',
    format: 'BR_SQUAD'
  },
  {
    id: 'tour_3',
    name: 'ML:BB Diamond Challenge',
    game: 'Mobile Legends',
    startDate: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
    teamsCount: 2,
    maxTeams: 8,
    entryFee: 50,
    prizePool: '5,000',
    rules: '5v5 MOBA format. Single elimination bracket. Finals are Best of 3.',
    status: 'completed',
    participants: [team1, team4],
    bracket: [
      {
          name: 'Finals',
          matches: [
            {
                id: 'tour_3_final_m1',
                name: 'Finals #1',
                teams: [team1, team4],
                scores: [1, 0], // ShadowStrikers win
                status: 'completed',
                resultSubmissionStatus: {},
                roomId: '12345',
                roomPass: 'pass',
            }
          ]
      }
    ],
    image: 'https://placehold.co/600x400.png',
    dataAiHint: 'esports magic fantasy',
    format: 'CS_SQUAD'
  }
];

// =================================
// TRANSACTIONS, REQUESTS, PRIZES
// =================================
export const mockTransactions: Transaction[] = [
  { id: 'trx_1', userId: 'usr_player_1', amount: 500, type: 'deposit', description: 'Deposited via MockPay', date: '2024-05-20T10:00:00Z' },
  { id: 'trx_2', userId: 'usr_player_1', amount: -100, type: 'fee', description: 'Entry fee for Summer Skirmish', date: '2024-05-21T11:00:00Z' },
  { id: 'trx_3', userId: 'usr_player_2', amount: 1000, type: 'prize', description: 'Prize from Winter Cup', date: '2024-04-15T16:00:00Z' },
];

export const mockWithdrawRequests: WithdrawRequest[] = [
    { id: 'wr_1', userId: 'usr_player_2', userName: 'Vortex', userGamerId: 'vortex_pro', amount: 500, method: 'bKash', accountNumber: '01234567890', status: 'pending', requestedAt: new Date(Date.now() - 3600000 * 2).toISOString() }
];

export const mockPendingPrizes: PendingPrize[] = [
    { id: 'pp_1', userId: 'usr_player_1', userName: 'ShadowStriker', userGamerId: 'shadow_123', amount: 250, tournamentId: 'tour_3', tournamentName: 'ML:BB Diamond Challenge', reason: 'MVP Prize', status: 'pending', createdAt: new Date(Date.now() - 86400000).toISOString() }
];

export const mockWithdrawMethods: WithdrawMethod[] = [
    { id: 'wm_1', name: 'bKash', receiverInfo: 'Personal: 01xxxxxxxxx', feePercentage: 1.85, minAmount: 50, maxAmount: 10000, status: 'active', image: 'https://placehold.co/64x64.png' },
    { id: 'wm_2', name: 'Nagad', receiverInfo: 'Personal: 01xxxxxxxxx', feePercentage: 1.5, minAmount: 50, maxAmount: 10000, status: 'active', image: 'https://placehold.co/64x64.png' },
    { id: 'wm_3', name: 'Bank Transfer', receiverInfo: 'Requires bank details', feePercentage: 0, minAmount: 1000, maxAmount: 50000, status: 'inactive', image: 'https://placehold.co/64x64.png' },
];

export const mockGatewaySettings = {
    name: 'MockPay',
    accessToken: 'MOCK_ACCESS_TOKEN',
    checkoutUrl: 'https://mock.url/checkout',
    verifyUrl: 'https://mock.url/verify',
};

export const mockRegistrationLogs: RegistrationLog[] = [];
export const mockMatchResults: MatchResult[] = [];
export const mockNotifications: AppNotification[] = [];
