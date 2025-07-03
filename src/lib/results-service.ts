import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  Timestamp,
  query,
  orderBy,
  where,
  writeBatch,
} from 'firebase/firestore';
import { firestore } from './firebase';
import type { MatchResult, Tournament, Round, Match } from '@/types';

// Helper to convert Firestore doc to MatchResult type
const fromFirestore = (doc: any): MatchResult => {
  const data = doc.data();
  return {
    id: doc.id,
    tournamentId: data.tournamentId,
    tournamentName: data.tournamentName,
    matchId: data.matchId,
    roundName: data.roundName,
    teamId: data.teamId,
    teamName: data.teamName,
    kills: data.kills,
    position: data.position,
    screenshotUrl: data.screenshotUrl,
    status: data.status,
    submittedAt: new Date(data.submittedAt.seconds * 1000).toISOString(),
  };
};

export const addMatchResult = async (result: Omit<MatchResult, 'id' | 'submittedAt' | 'status'>) => {
  const tournamentRef = doc(firestore, 'tournaments', result.tournamentId);
  
  try {
    const batch = writeBatch(firestore);

    // 1. Add the new match result document
    const newResultRef = doc(collection(firestore, 'matchResults'));
    const newResultData = {
      ...result,
      status: 'pending',
      submittedAt: Timestamp.now(),
    };
    batch.set(newResultRef, newResultData);

    // 2. Update the submission status in the tournament bracket
    const tournamentSnap = await getDoc(tournamentRef);
    if (!tournamentSnap.exists()) {
      throw new Error("Tournament not found");
    }
    const tournamentData = tournamentSnap.data() as Tournament;
    const newBracket = JSON.parse(JSON.stringify(tournamentData.bracket));
    const round = newBracket.find((r: Round) => r.name === result.roundName);
    if (round) {
        const match = round.matches.find((m: Match) => m.id === result.matchId);
        if (match && match.resultSubmissionStatus) {
            match.resultSubmissionStatus[result.teamId] = 'submitted';
        }
    }
    batch.update(tournamentRef, { bracket: newBracket });

    await batch.commit();
    return { success: true, id: newResultRef.id };
  } catch (error) {
    console.error('Error adding match result: ', error);
    return { success: false, error: (error as Error).message };
  }
};

export const getPendingResultsStream = (callback: (results: MatchResult[]) => void) => {
  const q = query(
    collection(firestore, 'matchResults'), 
    where('status', '==', 'pending'),
    orderBy('submittedAt', 'asc')
  );
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const results = querySnapshot.docs.map(fromFirestore);
    callback(results);
  }, (error) => {
    console.error("Error fetching pending results stream: ", error);
    callback([]);
  });

  return unsubscribe;
};

export const approveResult = async (resultId: string, tournamentId: string, matchId: string, roundName: string, team1Score: number, team2Score: number) => {
    const batch = writeBatch(firestore);
    const resultRef = doc(firestore, 'matchResults', resultId);
    const tournamentRef = doc(firestore, 'tournaments', tournamentId);

    try {
        // 1. Update the result document status
        batch.update(resultRef, { status: 'approved' });

        // 2. Update the tournament bracket
        const tournamentSnap = await getDoc(tournamentRef);
        if (!tournamentSnap.exists()) throw new Error("Tournament not found");

        const tournament = tournamentSnap.data() as Tournament;
        const newBracket = JSON.parse(JSON.stringify(tournament.bracket));
        
        const roundIndex = newBracket.findIndex((r: Round) => r.name === roundName);
        if (roundIndex === -1) throw new Error("Round not found");

        const matchIndex = newBracket[roundIndex].matches.findIndex((m: Match) => m.id === matchId);
        if (matchIndex === -1) throw new Error("Match not found");

        const match = newBracket[roundIndex].matches[matchIndex];
        match.scores = [team1Score, team2Score];
        match.status = 'completed';

        // 3. Advance the winner to the next round
        const winner = team1Score > team2Score ? match.teams[0] : match.teams[1];
        if (winner && roundIndex < newBracket.length - 1) {
            const nextRoundIndex = roundIndex + 1;
            const nextMatchIndex = Math.floor(matchIndex / 2);
            const teamSlotInNextMatch = matchIndex % 2;

            if (newBracket[nextRoundIndex] && newBracket[nextRoundIndex].matches[nextMatchIndex]) {
                newBracket[nextRoundIndex].matches[nextMatchIndex].teams[teamSlotInNextMatch] = winner;
            }
        }
        
        batch.update(tournamentRef, { bracket: newBracket });

        await batch.commit();
        return { success: true };

    } catch(error) {
        console.error("Error approving result:", error);
        return { success: false, error: (error as Error).message };
    }
};

export const rejectResult = async (resultId: string) => {
    try {
        const resultRef = doc(firestore, 'matchResults', resultId);
        await updateDoc(resultRef, { status: 'rejected' });
        return { success: true };
    } catch(error) {
        console.error("Error rejecting result:", error);
        return { success: false, error: (error as Error).message };
    }
};
