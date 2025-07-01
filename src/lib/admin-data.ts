export const mockUsers = [
    { id: 'usr1', name: 'Mapple', gamerId: 'mapple_gaming_123', country: 'India', joined: '2022-12-15' },
    { id: 'usr2', name: 'Jonathan Gaming', gamerId: 'jonathan_yt', country: 'India', joined: '2021-05-20' },
    { id: 'usr3', name: 'ScoutOP', gamerId: 'scout_op', country: 'India', joined: '2020-11-01' },
    { id: 'usr4', name: 'Mortal', gamerId: 'ig_mortal', country: 'India', joined: '2020-08-10' },
    { id: 'usr5', name: 'Shadow', gamerId: 'shadow_slays', country: 'USA', joined: '2023-01-30' },
    { id: 'usr6', name: 'Vortex', gamerId: 'vortex_v', country: 'UK', joined: '2023-02-11' },
];

export type JoinRequest = {
    id: string;
    tournamentName: string;
    teamName: string;
    players: { name: string; gamerId: string }[];
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: string;
};

export const mockJoinRequests: JoinRequest[] = [
    {
        id: 'req1',
        tournamentName: 'Summer Skirmish',
        teamName: 'Solo Entry',
        players: [{ name: 'PlayerOne', gamerId: 'p1_id_123' }],
        status: 'approved',
        requestedAt: '2024-07-25T10:00:00Z',
    },
    {
        id: 'req2',
        tournamentName: 'CODM Battle Arena',
        teamName: 'The Annihilators',
        players: [
            { name: 'Alpha', gamerId: 'alpha_codm' },
            { name: 'Bravo', gamerId: 'bravo_codm' },
        ],
        status: 'approved',
        requestedAt: '2024-07-25T11:30:00Z',
    },
    {
        id: 'req3',
        tournamentName: 'Free Fire Masters 2024',
        teamName: 'Headshot Kings',
        players: [
            { name: 'SniperGod', gamerId: 'sg_ff_99' },
            { name: 'Rusher', gamerId: 'rusher_ff_01' },
            { name: 'Camper', gamerId: 'camper_ff_07' },
            { name: 'Support', gamerId: 'support_ff_47' },
        ],
        status: 'approved',
        requestedAt: '2024-07-24T18:00:00Z',
    },
    {
        id: 'req4',
        tournamentName: 'ML Diamond Cup S5',
        teamName: 'Mythic Glory',
        players: [{ name: 'MLBBFan', gamerId: 'ml_fan_1' }],
        status: 'approved',
        requestedAt: '2024-07-23T09:00:00Z',
    },
    {
        id: 'req5',
        tournamentName: 'Summer Skirmish',
        teamName: 'Team Lag',
        players: [{ name: 'Ping999', gamerId: 'ping_high' }],
        status: 'approved',
        requestedAt: '2024-07-22T14:00:00Z',
    }
];
