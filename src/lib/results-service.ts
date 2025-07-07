import type { MatchResult, Tournament, Round, Match } from '@/types';
import { mockMatchResults, mockTournaments } from './mock-data';

let matchResults = [...mockMatchResults];

export const addMatchResult = async (result: Omit<MatchResult, 'id' | 'submittedAt' | 'status'>) => {
  const newResult: MatchResult = {
    ...result,
    id: `result_${Date.now()}`,
    status: 'pending',
    submittedAt: new Date().toISOString(),
  };
  matchResults.unshift(newResult);

  // Simulate updating the tournament bracket status
  const tournament = mockTournaments.find(t => t.id === result.tournamentId);
  if (tournament) {
    const round = tournament.bracket.find(r => r.name === result.roundName);
    if (round) {
      const match = round.matches.find(m => m.id === result.matchId);
      if (match && match.resultSubmissionStatus) {
        match.resultSubmissionStatus[result.teamId] = 'submitted';
      }
    }
  }

  return { success: true, id: newResult.id };
};

export const getPendingResultsStream = (callback: (results: MatchResult[]) => void) => {
  const pending = matchResults.filter(r => r.status === 'pending');
  pending.sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
  callback(pending);
  return () => {};
};

export const approveResult = async (resultId: string, tournamentId: string, matchId: string, roundName: string, team1Score: number, team2Score: number) => {
    const resultIndex = matchResults.findIndex(r => r.id === resultId);
    if (resultIndex === -1) return { success: false, error: "Result not found." };
    
    matchResults[resultIndex].status = 'approved';

    const tournament = mockTournaments.find(t => t.id === tournamentId);
    if (!tournament) return { success: false, error: "Tournament not found." };

    const roundIndex = tournament.bracket.findIndex(r => r.name === roundName);
    if (roundIndex === -1) return { success: false, error: "Round not found." };

    const matchIndex = tournament.bracket[roundIndex].matches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return { success: false, error: "Match not found." };

    const match = tournament.bracket[roundIndex].matches[matchIndex];
    match.scores = [team1Score, team2Score];
    match.status = 'completed';

    const winner = team1Score > team2Score ? match.teams[0] : match.teams[1];
    if (winner && roundIndex < tournament.bracket.length - 1) {
        const nextRoundIndex = roundIndex + 1;
        const nextMatchIndex = Math.floor(matchIndex / 2);
        const teamSlotInNextMatch = matchIndex % 2;

        if (tournament.bracket[nextRoundIndex]?.matches[nextMatchIndex]) {
            tournament.bracket[nextRoundIndex].matches[nextMatchIndex].teams[teamSlotInNextMatch] = winner;
        }
    }
    
    return { success: true };
};

export const rejectResult = async (resultId: string) => {
    const result = matchResults.find(r => r.id === resultId);
    if (result) {
        result.status = 'rejected';
        return { success: true };
    }
    return { success: false, error: "Result not found." };
};
