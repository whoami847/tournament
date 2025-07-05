
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  Timestamp,
  query,
  orderBy,
  arrayUnion,
  increment,
  writeBatch,
  setDoc,
  getDocs,
  where,
} from 'firebase/firestore';
import { firestore } from './firebase';
import type { Tournament, Team, Match, Round, TeamType, PlayerProfile } from '@/types';
import { createNotification } from './notifications-service';
import { createRegistrationLog } from './registrations-service';

// Helper to get team type (SOLO, DUO, SQUAD)
const getTeamType = (format: string = ''): TeamType => {
  const type = format.split('_')[1]?.toUpperCase() || 'SQUAD';
  if (type === 'SOLO' || type === 'DUO' || type === 'SQUAD') {
    return type;
  }
  return 'SQUAD';
};

// Helper to convert Firestore doc to Tournament type
const fromFirestore = (doc: any): Tournament => {
  const data = doc.data();
  const a = {
    id: doc.id,
    name: data.name,
    game: data.game,
    // Convert Firestore Timestamp to ISO string for client-side compatibility
    startDate: new Date(data.startDate.seconds * 1000).toISOString(),
    teamsCount: data.teamsCount,
    maxTeams: data.maxTeams,
    entryFee: data.entryFee,
    prizePool: data.prizePool,
    rules: data.rules,
    status: data.status,
    participants: data.participants,
    bracket: data.bracket,
    image: data.image,
    dataAiHint: data.dataAiHint,
    format: data.format,
    perKillPrize: data.perKillPrize,
    map: data.map,
    version: data.version,
    createdAt: new Date(data.createdAt.seconds * 1000).toISOString(),
    pointSystemEnabled: data.pointSystemEnabled ?? false,
    pointSystem: data.pointSystem || { perKillPoints: 0, placementPoints: [] },
  };
  return a
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


export const addTournament = async (tournament: Omit<Tournament, 'id' | 'createdAt' | 'teamsCount' | 'status' | 'participants' | 'bracket'>) => {
  try {
    const newTournamentRef = doc(collection(firestore, 'tournaments'));
    const tournamentId = newTournamentRef.id;

    const newTournament = {
      ...tournament,
      startDate: Timestamp.fromDate(new Date(tournament.startDate)),
      createdAt: Timestamp.now(),
      teamsCount: 0,
      status: 'upcoming', 
      participants: [],
      bracket: generateBracketStructure(tournament.maxTeams, tournamentId),
      image: tournament.image || 'https://placehold.co/600x400.png',
      dataAiHint: tournament.dataAiHint || 'esports tournament',
      map: tournament.map || 'TBD',
      version: tournament.version || 'Mobile',
      pointSystemEnabled: tournament.pointSystemEnabled ?? false,
      pointSystem: tournament.pointSystem ?? { perKillPoints: 1, placementPoints: [
          { place: 1, points: 15 },
          { place: 2, points: 12 },
          { place: 3, points: 10 },
          { place: 4, points: 8 },
        ] 
      },
    };
    await setDoc(newTournamentRef, newTournament);
    return { success: true };
  } catch (error) {
    console.error('Error adding tournament: ', error);
    return { success: false, error: (error as Error).message };
  }
};

export const getTournamentsStream = (callback: (tournaments: Tournament[]) => void) => {
  const q = query(collection(firestore, 'tournaments'), orderBy('startDate', 'desc'));
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const tournaments = querySnapshot.docs.map(fromFirestore);
    callback(tournaments);
  }, (error) => {
    console.error("Error fetching tournaments stream: ", error);
    callback([]);
  });

  return unsubscribe;
};

export const getTournamentStream = (id: string, callback: (tournament: Tournament | null) => void) => {
    const docRef = doc(firestore, 'tournaments', id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(fromFirestore(docSnap));
        } else {
            callback(null);
        }
    }, (error) => {
        console.error(`Error fetching tournament stream for ID ${id}: `, error);
        callback(null);
    });
    return unsubscribe;
};

export const getTournament = async (id: string): Promise<Tournament | null> => {
  try {
    const docRef = doc(firestore, 'tournaments', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return fromFirestore(docSnap);
    }
    return null;
  } catch (error) {
    console.error('Error getting tournament: ', error);
    return null;
  }
};

export const updateTournament = async (id: string, data: Partial<Tournament>) => {
  try {
    const docRef = doc(firestore, 'tournaments', id);
    const updateData: { [key: string]: any } = { ...data };

    if (data.startDate) {
        updateData.startDate = Timestamp.fromDate(new Date(data.startDate));
    }

    // If the tournament is being set to 'live', process byes in the first round.
    if (data.status === 'live') {
        const tournamentSnap = await getDoc(docRef);
        if (tournamentSnap.exists()) {
            const tournament = fromFirestore(tournamentSnap);
            const currentBracket = tournament.bracket;

            if (currentBracket && currentBracket.length > 0 && currentBracket[0].matches) {
                const firstRound = currentBracket[0];
                const nextRound = currentBracket.length > 1 ? currentBracket[1] : null;

                const bracketWithByesProcessed = JSON.parse(JSON.stringify(currentBracket));

                firstRound.matches.forEach((match, matchIndex) => {
                    const team1 = match.teams[0];
                    const team2 = match.teams[1];

                    // Check for a bye (one team present, one is null)
                    if ((team1 && !team2) || (!team1 && team2)) {
                        const winner = team1 || team2;
                        
                        // Update the current match as completed
                        const matchInDraft = bracketWithByesProcessed[0].matches[matchIndex];
                        matchInDraft.status = 'completed';
                        matchInDraft.scores = team1 ? [1, 0] : [0, 1];

                        // Advance the winner to the next round, if a next round exists
                        if (nextRound && winner) {
                            const nextRoundMatchIndex = Math.floor(matchIndex / 2);
                            const teamSlotInNextMatch = matchIndex % 2;
                            
                            if (bracketWithByesProcessed[1].matches[nextRoundMatchIndex]) {
                                bracketWithByesProcessed[1].matches[nextRoundMatchIndex].teams[teamSlotInNextMatch] = winner;
                            }
                        }
                    }
                });
                
                updateData.bracket = bracketWithByesProcessed;
            }
        }
    }

    await updateDoc(docRef, updateData);
    return { success: true };
  } catch (error) {
    console.error('Error updating tournament: ', error);
    return { success: false, error: (error as Error).message };
  }
};

export const deleteTournament = async (id: string) => {
  try {
    await deleteDoc(doc(firestore, 'tournaments', id));
    return { success: true };
  } catch (error) {
    console.error('Error deleting tournament: ', error);
    return { success: false, error: (error as Error).message };
  }
};

export const joinTournament = async (
  tournamentId: string,
  newParticipant: Team,
  userId: string
) => {
  const tournamentRef = doc(firestore, 'tournaments', tournamentId);
  const userRef = doc(firestore, 'users', userId);
  
  try {
    const tournamentSnap = await getDoc(tournamentRef);
    const userSnap = await getDoc(userRef);

    if (!tournamentSnap.exists()) {
      return { success: false, error: 'Tournament not found.' };
    }
    if (!userSnap.exists()) {
      return { success: false, error: 'User profile not found.' };
    }

    const tournamentData = fromFirestore(tournamentSnap);
    const userData = userSnap.data() as PlayerProfile;

    if (tournamentData.teamsCount >= tournamentData.maxTeams) {
        return { success: false, error: 'Tournament is already full.' };
    }

    const allJoinedGamerIds = new Set(tournamentData.participants.flatMap(p => p.members?.map(m => m.gamerId) || []));
    const newTeamGamerIds = newParticipant.members?.map(m => m.gamerId) || [];
    const alreadyJoinedMemberId = newTeamGamerIds.find(id => allJoinedGamerIds.has(id));
    if (alreadyJoinedMemberId) {
        return { success: false, error: `A player with Gamer ID ${alreadyJoinedMemberId} is already part of this tournament.` };
    }

    const batch = writeBatch(firestore);

    // Handle entry fee
    const entryFee = tournamentData.entryFee;
    if (entryFee > 0) {
        if (userData.balance < entryFee) {
            return { success: false, error: 'Insufficient balance.' }; // Server-side check
        }
        
        // Deduct fee and create transaction log for the team leader
        batch.update(userRef, { balance: increment(-entryFee) });
        
        const transactionRef = doc(collection(firestore, 'transactions'));
        batch.set(transactionRef, {
            userId: userId,
            amount: -entryFee,
            type: 'fee',
            description: `Entry fee for ${tournamentData.name}`,
            date: Timestamp.now(),
            status: 'completed',
        });
    }

    // Deep copy the bracket to avoid mutation issues.
    const updatedBracket = JSON.parse(JSON.stringify(tournamentData.bracket)); 
    let teamPlaced = false;

    // Find the first empty slot in the first round and place the new team
    if (updatedBracket.length > 0 && updatedBracket[0].matches) {
      for (const match of updatedBracket[0].matches) {
        for (let i = 0; i < match.teams.length; i++) {
            if (match.teams[i] === null) {
                match.teams[i] = newParticipant;
                teamPlaced = true;
                break;
            }
        }
        if (teamPlaced) break;
      }
    }

    const updateData: any = {
      participants: arrayUnion(newParticipant),
      teamsCount: increment(1),
    };

    if (teamPlaced) {
        updateData.bracket = updatedBracket;
    }

    batch.update(tournamentRef, updateData);

    // Add a registration log
    createRegistrationLog(batch, {
        tournamentId: tournamentId,
        tournamentName: tournamentData.name,
        game: tournamentData.game,
        teamType: getTeamType(tournamentData.format),
        teamName: newParticipant.name,
        players: newParticipant.members || [],
    });

    await batch.commit();
    return { success: true };

  } catch (error) {
    console.error('Error joining tournament:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const requestMatchResults = async (tournamentId: string, roundName: string, matchId: string) => {
    const tournamentRef = doc(firestore, 'tournaments', tournamentId);
    try {
        const docSnap = await getDoc(tournamentRef);
        if (!docSnap.exists()) {
            throw new Error("Tournament not found");
        }
        
        const tournament = docSnap.data() as Tournament;
        const newBracket = JSON.parse(JSON.stringify(tournament.bracket));

        const round = newBracket.find((r: Round) => r.name === roundName);
        if (!round) throw new Error("Round not found");
        
        const match = round.matches.find((m: Match) => m.id === matchId);
        if (!match) throw new Error("Match not found");

        if (match.teams[0] && match.teams[1]) {
             match.resultSubmissionStatus = {
                [match.teams[0].id]: 'pending',
                [match.teams[1].id]: 'pending',
            };

            // Create notifications for all players in the match
            const allMemberGamerIds = [
                ...(match.teams[0].members?.map(m => m.gamerId) || []),
                ...(match.teams[1].members?.map(m => m.gamerId) || [])
            ].filter(id => id); // Filter out any potential undefined IDs

            if (allMemberGamerIds.length > 0) {
                const usersQuery = query(collection(firestore, 'users'), where('gamerId', 'in', allMemberGamerIds));
                const usersSnapshot = await getDocs(usersQuery);

                for (const userDoc of usersSnapshot.docs) {
                    await createNotification({
                        userId: userDoc.id,
                        title: 'Match Result Submission',
                        description: `Please submit your results for match "${match.name}" in the "${tournament.name}" tournament.`,
                        link: `/tournaments/${tournamentId}`
                    });
                }
            }

        } else {
            throw new Error("Both teams must be present to request results.");
        }

        await updateDoc(tournamentRef, { bracket: newBracket });
        return { success: true };

    } catch(error) {
        console.error("Error requesting match results:", error);
        return { success: false, error: (error as Error).message };
    }
}

export const setMatchWinner = async (
  tournamentId: string,
  roundName: string,
  matchId: string,
  winnerTeamId: string
) => {
  const tournamentRef = doc(firestore, 'tournaments', tournamentId);
  try {
    const tournamentSnap = await getDoc(tournamentRef);
    if (!tournamentSnap.exists()) throw new Error('Tournament not found');

    const tournament = fromFirestore(tournamentSnap);
    const newBracket = JSON.parse(JSON.stringify(tournament.bracket));

    const roundIndex = newBracket.findIndex((r: Round) => r.name === roundName);
    if (roundIndex === -1) throw new Error('Round not found');

    const matchIndex = newBracket[roundIndex].matches.findIndex((m: Match) => m.id === matchId);
    if (matchIndex === -1) throw new Error('Match not found');

    const match = newBracket[roundIndex].matches[matchIndex];
    if (!match.teams[0] || !match.teams[1]) {
      throw new Error("Both teams must be present to set a winner.");
    }
    
    const winnerIndex = match.teams.findIndex((t: Team | null) => t?.id === winnerTeamId);
    if (winnerIndex === -1) throw new Error('Winner team not found in the match');

    match.status = 'completed';
    match.scores = [0, 0];
    match.scores[winnerIndex] = 1;

    // Advance winner
    const winner = match.teams[winnerIndex];
    if (winner && roundIndex < newBracket.length - 1) {
      const nextRoundIndex = roundIndex + 1;
      const nextMatchIndex = Math.floor(matchIndex / 2);
      const teamSlotInNextMatch = matchIndex % 2;

      if (newBracket[nextRoundIndex]?.matches[nextMatchIndex]) {
        newBracket[nextRoundIndex].matches[nextMatchIndex].teams[teamSlotInNextMatch] = winner;
      }
    }
    
    await updateDoc(tournamentRef, { bracket: newBracket });
    return { success: true };
  } catch (error) {
    console.error('Error setting match winner:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const undoMatchResult = async (
  tournamentId: string,
  roundName: string,
  matchId: string
) => {
    const tournamentRef = doc(firestore, 'tournaments', tournamentId);
    try {
        const tournamentSnap = await getDoc(tournamentRef);
        if (!tournamentSnap.exists()) throw new Error('Tournament not found');

        const tournament = fromFirestore(tournamentSnap);
        const newBracket = JSON.parse(JSON.stringify(tournament.bracket));

        const roundIndex = newBracket.findIndex((r: Round) => r.name === roundName);
        if (roundIndex === -1) throw new Error('Round not found');

        const matchIndex = newBracket[roundIndex].matches.findIndex((m: Match) => m.id === matchId);
        if (matchIndex === -1) throw new Error('Match not found');
        
        const match = newBracket[roundIndex].matches[matchIndex];
        const oldWinnerIndex = match.scores[0] > match.scores[1] ? 0 : 1;
        const oldWinner = match.teams[oldWinnerIndex];

        // Revert match
        match.status = 'pending';
        match.scores = [0, 0];
        
        // Revert next round
        if (oldWinner && roundIndex < newBracket.length - 1) {
            const nextRoundIndex = roundIndex + 1;
            const nextMatchIndex = Math.floor(matchIndex / 2);
            const teamSlotInNextMatch = matchIndex % 2;

            if (newBracket[nextRoundIndex]?.matches[nextMatchIndex]) {
                const teamInNextMatch = newBracket[nextRoundIndex].matches[nextMatchIndex].teams[teamSlotInNextMatch];
                // Only remove if it's the same team, to prevent race conditions or weird states
                if (teamInNextMatch && teamInNextMatch.id === oldWinner.id) {
                    newBracket[nextRoundIndex].matches[nextMatchIndex].teams[teamSlotInNextMatch] = null;
                }
            }
        }

        await updateDoc(tournamentRef, { bracket: newBracket });
        return { success: true };
    } catch (error) {
        console.error('Error undoing match result:', error);
        return { success: false, error: (error as Error).message };
    }
};

export const updateMatchDetails = async (
  tournamentId: string,
  matchId: string,
  details: { roomId: string; roomPass: string }
) => {
  const tournamentRef = doc(firestore, 'tournaments', tournamentId);
  try {
    const tournamentSnap = await getDoc(tournamentRef);
    if (!tournamentSnap.exists()) throw new Error('Tournament not found');

    const tournament = fromFirestore(tournamentSnap);
    const newBracket = JSON.parse(JSON.stringify(tournament.bracket));

    let matchFound = false;
    for (const round of newBracket) {
      const matchIndex = round.matches.findIndex((m: Match) => m.id === matchId);
      if (matchIndex !== -1) {
        round.matches[matchIndex].roomId = details.roomId;
        round.matches[matchIndex].roomPass = details.roomPass;
        matchFound = true;
        break;
      }
    }

    if (!matchFound) throw new Error("Match not found in bracket");

    await updateDoc(tournamentRef, { bracket: newBracket });
    return { success: true };
  } catch (error) {
    console.error('Error updating match details:', error);
    return { success: false, error: (error as Error).message };
  }
};
