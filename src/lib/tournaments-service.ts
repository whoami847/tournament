
import type { Tournament, Team, Match, Round, TeamType, PlayerProfile } from '@/types';
import { mockTournaments, mockUsers } from './mock-data';
import { createNotification } from './notifications-service';
import { createRegistrationLog } from './registrations-service';

// Make it a mutable copy so we can simulate writes
let tournaments = [...mockTournaments];

// Helper to get team type (SOLO, DUO, SQUAD)
const getTeamType = (format: string = ''): TeamType => {
  const type = format.split('_')[1]?.toUpperCase() || 'SQUAD';
  if (type === 'SOLO' || type === 'DUO' || type === 'SQUAD') {
    return type;
  }
  return 'SQUAD';
};

// Helper to generate an empty bracket structure based on the maximum number of teams
const generateBracketStructure = (maxTeams: number, tournamentId: string): Round[] => {
    // Round up maxTeams to the next power of 2 for a standard bracket (e.g., 12 -> 16)
    let bracketSize = 2;
    while (bracketSize < maxTeams) {
        bracketSize *= 2;
    }

    const roundNamesMap: Record<number, string> = {
        2: 'Finals',
        4: 'Semi-finals',
        8: 'Quarter-finals',
        16: 'Round of 16',
        32: 'Round of 32',
        64: 'Round of 64',
    };

    const rounds: Round[] = [];
    let currentTeams = bracketSize;

    while (currentTeams >= 2) {
        const roundName = roundNamesMap[currentTeams] || `Round of ${currentTeams}`;
        const numMatches = currentTeams / 2;
        const matches: Match[] = Array.from({ length: numMatches }, (_, i) => ({
            id: `${tournamentId}_${roundName.replace(/\s+/g, '-')}_m${i + 1}`,
            name: `${roundName} #${i + 1}`,
            teams: [null, null],
            scores: [0, 0],
            status: 'pending',
            resultSubmissionStatus: {},
            roomId: '',
            roomPass: '',
        }));
        rounds.push({ name: roundName, matches });
        currentTeams /= 2;
    }

    return rounds;
};

export const addTournament = async (tournamentData: Omit<Tournament, 'id' | 'createdAt' | 'teamsCount' | 'status' | 'participants' | 'bracket'>) => {
    const tournamentId = `tour_${Date.now()}`;
    const newTournament: Tournament = {
        ...tournamentData,
        id: tournamentId,
        createdAt: new Date().toISOString(),
        teamsCount: 0,
        status: 'upcoming',
        participants: [],
        bracket: generateBracketStructure(tournamentData.maxTeams, tournamentId),
        image: tournamentData.image || 'https://placehold.co/600x400.png',
        dataAiHint: tournamentData.dataAiHint || 'esports tournament',
        map: tournamentData.map || 'TBD',
        version: tournamentData.version || 'Mobile',
        pointSystemEnabled: tournamentData.pointSystemEnabled ?? false,
        pointSystem: tournamentData.pointSystem ?? { perKillPoints: 1, placementPoints: [
            { place: 1, points: 15 },
            { place: 2, points: 12 },
            { place: 3, points: 10 },
            { place: 4, points: 8 },
          ] 
        },
    };
    tournaments.unshift(newTournament);
    return { success: true };
};

export const getTournamentsStream = (callback: (tournaments: Tournament[]) => void) => {
    const sorted = [...tournaments].sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    callback(sorted);
    return () => {};
};

export const getTournamentStream = (id: string, callback: (tournament: Tournament | null) => void) => {
    const tournament = tournaments.find(t => t.id === id) || null;
    callback(tournament);
    return () => {};
};

export const getTournaments = async (): Promise<Tournament[]> => {
    return Promise.resolve([...tournaments].sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()));
};

export const getTournament = async (id: string): Promise<Tournament | null> => {
    const tournament = tournaments.find(t => t.id === id);
    return Promise.resolve(tournament || null);
};

export const updateTournament = async (id: string, data: Partial<Tournament>) => {
    const tourIndex = tournaments.findIndex(t => t.id === id);
    if (tourIndex === -1) {
        return { success: false, error: "Tournament not found." };
    }

    const tournamentBeforeUpdate = { ...tournaments[tourIndex] };
    const updatedTournament = { ...tournamentBeforeUpdate, ...data };
    
    // Logic for processing byes when going live
    if (data.status === 'live' && tournamentBeforeUpdate.status !== 'live') {
      const currentBracket = updatedTournament.bracket;
      if (currentBracket && currentBracket.length > 0 && currentBracket[0].matches) {
        const bracketWithByesProcessed = JSON.parse(JSON.stringify(currentBracket));
        const firstRound = bracketWithByesProcessed[0];
        const nextRound = bracketWithByesProcessed.length > 1 ? bracketWithByesProcessed[1] : null;

        firstRound.matches.forEach((match: Match, matchIndex: number) => {
          const team1 = match.teams[0];
          const team2 = match.teams[1];
          if ((team1 && !team2) || (!team1 && team2)) {
            const winner = team1 || team2;
            match.status = 'completed';
            match.scores = team1 ? [1, 0] : [0, 1];
            if (nextRound && winner) {
              const nextRoundMatchIndex = Math.floor(matchIndex / 2);
              const teamSlotInNextMatch = matchIndex % 2;
              if (bracketWithByesProcessed[1].matches[nextRoundMatchIndex]) {
                bracketWithByesProcessed[1].matches[nextRoundMatchIndex].teams[teamSlotInNextMatch] = winner;
              }
            }
          }
        });
        updatedTournament.bracket = bracketWithByesProcessed;
      }
    }

    tournaments[tourIndex] = updatedTournament;
    return { success: true };
};

export const deleteTournament = async (id: string) => {
    const initialLength = tournaments.length;
    tournaments = tournaments.filter(t => t.id !== id);
    if (tournaments.length < initialLength) {
        return { success: true };
    }
    return { success: false, error: "Tournament not found." };
};

export const joinTournament = async (
  tournamentId: string,
  newParticipant: Team,
  userId: string
) => {
    const tourIndex = tournaments.findIndex(t => t.id === tournamentId);
    if (tourIndex === -1) return { success: false, error: 'Tournament not found.' };

    const user = mockUsers.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User profile not found.' };

    const tournament = tournaments[tourIndex];

    if (tournament.teamsCount >= tournament.maxTeams) {
        return { success: false, error: 'Tournament is already full.' };
    }

    const allJoinedGamerIds = new Set(tournament.participants.flatMap(p => p.members?.map(m => m.gamerId) || []));
    const newTeamGamerIds = newParticipant.members?.map(m => m.gamerId) || [];
    const alreadyJoinedMemberId = newTeamGamerIds.find(id => allJoinedGamerIds.has(id));
    if (alreadyJoinedMemberId) {
        return { success: false, error: `A player with Gamer ID ${alreadyJoinedMemberId} is already part of this tournament.` };
    }

    const entryFee = tournament.entryFee;
    if (entryFee > 0) {
        if (user.balance < entryFee) {
            return { success: false, error: 'Insufficient balance.' };
        }
        user.balance -= entryFee;
    }

    let teamPlaced = false;
    for (const match of tournament.bracket[0]?.matches || []) {
        for (let i = 0; i < match.teams.length; i++) {
            if (match.teams[i] === null) {
                match.teams[i] = newParticipant;
                teamPlaced = true;
                break;
            }
        }
        if (teamPlaced) break;
    }

    tournament.participants.push(newParticipant);
    tournament.teamsCount += 1;

    // This function is mock and doesn't do anything with batch, so null is fine.
    createRegistrationLog(null, {
        tournamentId: tournamentId,
        tournamentName: tournament.name,
        game: tournament.game,
        teamType: getTeamType(tournament.format),
        teamName: newParticipant.name,
        players: newParticipant.members || [],
    });

    return { success: true };
};


export const requestMatchResults = async (tournamentId: string, roundName: string, matchId: string) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament) return { success: false, error: "Tournament not found" };

    const round = tournament.bracket.find(r => r.name === roundName);
    if (!round) return { success: false, error: "Round not found" };

    const match = round.matches.find(m => m.id === matchId);
    if (!match) return { success: false, error: "Match not found" };

    if (match.teams[0] && match.teams[1]) {
        match.resultSubmissionStatus = {
            [match.teams[0].id]: 'pending',
            [match.teams[1].id]: 'pending',
        };

        const allUserIdsInMatch = [
            ...(match.teams[0].members?.map(m => m.uid) || []),
            ...(match.teams[1].members?.map(m => m.uid) || [])
        ].filter((uid): uid is string => !!uid);

        for (const userId of allUserIdsInMatch) {
            await createNotification({
                userId: userId,
                title: 'Match Result Submission',
                description: `Please submit your results for match "${match.name}" in the "${tournament.name}" tournament.`,
                link: `/tournaments/${tournamentId}`
            });
        }
        return { success: true };
    }
    return { success: false, error: "Both teams must be present to request results." };
}

export const setMatchWinner = async (tournamentId: string, roundName: string, matchId: string, winnerTeamId: string) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament) return { success: false, error: "Tournament not found." };
    
    const roundIndex = tournament.bracket.findIndex(r => r.name === roundName);
    const round = tournament.bracket[roundIndex];
    if (!round) return { success: false, error: "Round not found." };
    
    const matchIndex = round.matches.findIndex(m => m.id === matchId);
    const match = round.matches[matchIndex];
    if (!match) return { success: false, error: "Match not found." };
    
    if (!match.teams[0] || !match.teams[1]) {
      return { success: false, error: "Both teams must be present to set a winner." };
    }
    
    const winnerIndex = match.teams.findIndex(t => t?.id === winnerTeamId);
    if (winnerIndex === -1) return { success: false, error: 'Winner team not found in the match' };

    match.status = 'completed';
    match.scores = [0, 0];
    match.scores[winnerIndex] = 1;

    const winner = match.teams[winnerIndex];
    if (winner && roundIndex < tournament.bracket.length - 1) {
      const nextRound = tournament.bracket[roundIndex + 1];
      const nextMatchIndex = Math.floor(matchIndex / 2);
      const teamSlotInNextMatch = matchIndex % 2;
      if (nextRound?.matches[nextMatchIndex]) {
        nextRound.matches[nextMatchIndex].teams[teamSlotInNextMatch] = winner;
      }
    }
    
    return { success: true };
};

export const undoMatchResult = async (tournamentId: string, roundName: string, matchId: string) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament) return { success: false, error: "Tournament not found." };
    
    const roundIndex = tournament.bracket.findIndex(r => r.name === roundName);
    const round = tournament.bracket[roundIndex];
    if (!round) return { success: false, error: "Round not found." };
    
    const matchIndex = round.matches.findIndex(m => m.id === matchId);
    const match = round.matches[matchIndex];
    if (!match) return { success: false, error: "Match not found." };

    const oldWinnerIndex = match.scores[0] > match.scores[1] ? 0 : 1;
    const oldWinner = match.teams[oldWinnerIndex];

    match.status = 'pending';
    match.scores = [0, 0];

    if (oldWinner && roundIndex < tournament.bracket.length - 1) {
        const nextRound = tournament.bracket[roundIndex + 1];
        const nextMatchIndex = Math.floor(matchIndex / 2);
        const teamSlotInNextMatch = matchIndex % 2;
        if (nextRound?.matches[nextMatchIndex]) {
            const teamInNextMatch = nextRound.matches[nextMatchIndex].teams[teamSlotInNextMatch];
            if (teamInNextMatch && teamInNextMatch.id === oldWinner.id) {
                nextRound.matches[nextMatchIndex].teams[teamSlotInNextMatch] = null;
            }
        }
    }
    return { success: true };
};

export const updateMatchDetails = async (tournamentId: string, matchId: string, details: { roomId: string; roomPass: string }) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament) return { success: false, error: "Tournament not found." };

    for (const round of tournament.bracket) {
      const match = round.matches.find(m => m.id === matchId);
      if (match) {
        match.roomId = details.roomId;
        match.roomPass = details.roomPass;
        return { success: true };
      }
    }
    return { success: false, error: "Match not found in bracket." };
};
