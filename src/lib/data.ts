import type { Tournament } from '@/types';

const teams = [
  { id: 't1', name: 'Cosmic Knights', avatar: 'https://placehold.co/40x40.png' },
  { id: 't2', name: 'Galaxy Predators', avatar: 'https://placehold.co/40x40.png' },
  { id: 't3', name: 'Solar Flares', avatar: 'https://placehold.co/40x40.png' },
  { id: 't4', name: 'Vortex Vipers', avatar: 'https://placehold.co/40x40.png' },
  { id: 't5', name: 'Abyss Watchers', avatar: 'https://placehold.co/40x40.png' },
  { id: 't6', name: 'Celestial Dragons', avatar: 'https://placehold.co/40x40.png' },
  { id: 't7', name: 'Quantum Leap', avatar: 'https://placehold.co/40x40.png' },
  { id: 't8', name: 'Nova Squad', avatar: 'https://placehold.co/40x40.png' },
];

export const mockTournaments: Tournament[] = [
  {
    id: 'codm-battle-arena',
    name: 'CODM Battle Arena',
    game: 'COD: Mobile',
    startDate: '2024-07-18T19:00:00',
    teamsCount: 8,
    maxTeams: 16,
    entryFee: 10,
    prizePool: '5,000',
    rules: 'Intense 5v5 action in a single-elimination bracket. Only the best will survive. Maps are chosen by veto. All standard league rules apply.',
    status: 'live',
    image: 'https://placehold.co/600x400.png',
    dataAiHint: 'soldiers modern warfare',
    participants: teams.slice(0, 8),
    bracket: [
      {
        name: 'Quarter-finals',
        matches: [
          { id: 'codm-qf1', name: 'QF-1', teams: [teams[0], teams[1]], scores: [1, 0], status: 'live' },
          { id: 'codm-qf2', name: 'QF-2', teams: [teams[2], teams[3]], scores: [0, 0], status: 'pending' },
          { id: 'codm-qf3', name: 'QF-3', teams: [teams[4], teams[5]], scores: [0, 0], status: 'pending' },
          { id: 'codm-qf4', name: 'QF-4', teams: [teams[6], teams[7]], scores: [0, 0], status: 'pending' },
        ],
      },
      {
        name: 'Semi-finals',
        matches: [
            { id: 'codm-sf1', name: 'SF-1', teams: [null, null], scores: [0, 0], status: 'pending' },
            { id: 'codm-sf2', name: 'SF-2', teams: [null, null], scores: [0, 0], status: 'pending' },
        ]
      },
      {
        name: 'Finals',
        matches: [{ id: 'codm-f1', name: 'Final', teams: [null, null], scores: [0, 0], status: 'pending' }]
      }
    ]
  },
  {
    id: 'ff-masters-2024',
    name: 'Free Fire Masters 2024',
    game: 'Free Fire',
    startDate: '2024-07-22T12:00:00',
    teamsCount: 6,
    maxTeams: 16,
    entryFee: 0,
    prizePool: '10,000',
    rules: 'Standard league rules apply. All matches are Best of 3 until the finals, which are Best of 5. No cheating or exploiting bugs. All players must be registered with their official in-game names.',
    status: 'upcoming',
    image: 'https://placehold.co/600x400.png',
    dataAiHint: 'fire battle',
    participants: teams.slice(0, 6),
    bracket: [],
  },
  {
    id: 'ml-diamond-cup-s5',
    name: 'ML Diamond Cup S5',
    game: 'Mobile Legends',
    startDate: '2024-07-10T18:00:00',
    teamsCount: 8,
    maxTeams: 8,
    entryFee: 25,
    prizePool: '50,000',
    rules: 'Single elimination bracket. All matches are Best of 3. Standard hero pick/ban phase applies. Fair play is enforced.',
    status: 'completed',
    image: 'https://placehold.co/600x400.png',
    dataAiHint: 'fantasy landscape',
    participants: teams.slice(0, 8),
    bracket: [
      {
        name: 'Quarter-finals',
        matches: [
          { id: 'qf1', name: 'QF-1', teams: [teams[0], teams[1]], scores: [2, 1], status: 'completed' },
          { id: 'qf2', name: 'QF-2', teams: [teams[2], teams[3]], scores: [1, 2], status: 'completed' },
          { id: 'qf3', name: 'QF-3', teams: [teams[4], teams[5]], scores: [2, 0], status: 'completed' },
          { id: 'qf4', name: 'QF-4', teams: [teams[6], teams[7]], scores: [2, 1], status: 'completed' },
        ],
      },
      {
        name: 'Semi-finals',
        matches: [
          { id: 'sf1', name: 'SF-1', teams: [null, null], scores: [2, 0], status: 'completed' },
          { id: 'sf2', name: 'SF-2', teams: [null, null], scores: [1, 2], status: 'completed' },
        ],
      },
      {
        name: 'Finals',
        matches: [{ id: 'f1', name: 'Final', teams: [null, null], scores: [3, 2], status: 'completed' }],
      },
    ],
  },
  {
    id: 'pubg-mobile-club-open',
    name: 'PUBG Mobile Club Open',
    game: 'PUBG',
    startDate: '2024-07-29T16:00:00',
    teamsCount: 12,
    maxTeams: 32,
    entryFee: 50,
    prizePool: '150,000',
    rules: 'Group stage followed by double-elimination playoffs. Standard PMCO ruleset. All participants must adhere to the official code of conduct.',
    status: 'upcoming',
    image: 'https://placehold.co/600x400.png',
    dataAiHint: 'battle royale soldiers',
    participants: teams.slice(0, 4),
    bracket: [],
  },
  {
    id: 'codm-championship-2024',
    name: 'CODM Championship 2024',
    game: 'COD: Mobile',
    startDate: '2024-07-05T20:00:00',
    teamsCount: 16,
    maxTeams: 16,
    entryFee: 10,
    prizePool: '25,000',
    rules: 'Round-robin group stage, followed by single-elimination bracket. Maps are pre-selected for each round. Standard competitive loadouts.',
    status: 'completed',
    image: 'https://placehold.co/600x400.png',
    dataAiHint: 'modern soldier',
    participants: teams,
    bracket: [],
  },
];
