'use client';

import { useState, useEffect } from 'react';
import type { Round, Team, Match } from '@/types';
import { produce } from 'immer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Swords, Trophy, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BracketEditorProps {
    bracket: Round[];
    participants: Team[];
    onUpdate: (bracket: Round[]) => void;
}

const getWinner = (match: Match): Team | null => {
    if (match.status !== 'completed' || !match.teams[0] || !match.teams[1]) return null;
    return match.scores[0] > match.scores[1] ? match.teams[0] : match.teams[1];
};


export function BracketEditor({ bracket: initialBracket, participants, onUpdate }: BracketEditorProps) {
    const [bracket, setBracket] = useState(initialBracket);

    useEffect(() => {
        setBracket(initialBracket);
    }, [initialBracket]);

    const handleSetWinner = (roundIndex: number, matchIndex: number, winnerIndex: number) => {
        if (!window.confirm("Are you sure you want to set this team as the winner? This action cannot be undone.")) {
            return;
        }

        const nextBracket = produce(bracket, draft => {
            const match = draft[roundIndex].matches[matchIndex];
            const team1 = match.teams[0];
            const team2 = match.teams[1];

            if (!team1 || !team2) return;

            match.status = 'completed';
            match.scores = winnerIndex === 0 ? [1, 0] : [0, 1];
            
            const winner = match.teams[winnerIndex];

            // Advance winner to the next round
            if (winner && roundIndex < draft.length - 1) {
                const nextRoundMatchIndex = Math.floor(matchIndex / 2);
                const teamSlotInNextMatch = matchIndex % 2;
                
                if (draft[roundIndex + 1].matches[nextRoundMatchIndex]) {
                    draft[roundIndex + 1].matches[nextRoundMatchIndex].teams[teamSlotInNextMatch] = winner;
                }
            }
        });
        setBracket(nextBracket);
        onUpdate(nextBracket);
    };

    const generateBracket = () => {
        const numParticipants = participants.length;
        if (numParticipants < 2) {
            alert("At least 2 participants are required to generate a bracket.");
            return;
        }

        let maxTeams = 2;
        while (maxTeams < numParticipants) {
            maxTeams *= 2;
        }

        const roundNamesMap: Record<number, string> = {
            2: 'Finals', 4: 'Semi-finals', 8: 'Quarter-finals', 16: 'Round of 16', 32: 'Round of 32', 64: 'Round of 64'
        };

        let rounds: Round[] = [];
        let numTeamsInRound = maxTeams;
        while(numTeamsInRound >= 2) {
            const roundName = roundNamesMap[numTeamsInRound] || `Round of ${numTeamsInRound}`;
            const numMatches = numTeamsInRound / 2;
            const matches: Match[] = Array.from({ length: numMatches }, (_, i) => ({
                id: `${roundName}-m${i}`, name: `${roundName} #${i + 1}`, teams: [null, null], scores: [0, 0], status: 'pending'
            }));
            rounds.push({ name: roundName, matches });
            numTeamsInRound /= 2;
        }

        const participantsPadded = [...participants];
        while (participantsPadded.length < maxTeams) {
            participantsPadded.push({ id: `tbd-${participantsPadded.length}`, name: 'TBD', avatar: '' });
        }
        
        for (let i = 0; i < maxTeams; i++) {
            const matchIndex = Math.floor(i / 2);
            const teamIndex = i % 2;
            if (rounds[0] && rounds[0].matches[matchIndex]) {
                const team = participantsPadded[i];
                if (team.name !== 'TBD') {
                   rounds[0].matches[matchIndex].teams[teamIndex] = team;
                }
            }
        }
        
        setBracket(rounds);
        onUpdate(rounds);
    };

    if (!bracket || bracket.length === 0) {
        return (
            <div className="text-center">
                <p className="text-muted-foreground mb-4">This tournament doesn't have a bracket yet.</p>
                <Button onClick={generateBracket} disabled={participants.length < 2}>
                    Generate Bracket
                </Button>
                 {participants.length < 2 && <p className="text-xs text-destructive mt-2">Need at least 2 participants to generate a bracket.</p>}
            </div>
        );
    }
    
    const finalWinner = bracket[bracket.length - 1].matches[0].status === 'completed' ? getWinner(bracket[bracket.length - 1].matches[0]) : null;

    return (
        <div className="space-y-8">
            {finalWinner && (
                 <Card className="border-amber-400 bg-amber-500/10">
                    <CardHeader className="text-center">
                        <Trophy className="h-10 w-10 text-amber-400 mx-auto" />
                        <CardTitle className="text-2xl text-amber-500">Tournament Champion</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-2">
                        <Avatar className="h-16 w-16 border-2 border-amber-400">
                           <AvatarImage src={finalWinner.avatar} alt={finalWinner.name} data-ai-hint="team logo" />
                           <AvatarFallback>{finalWinner.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="text-xl font-bold">{finalWinner.name}</p>
                    </CardContent>
                </Card>
            )}

            <div className="flex space-x-4 overflow-x-auto pb-4">
                {bracket.map((round, roundIndex) => (
                    <div key={round.name} className="flex flex-col space-y-8 min-w-[300px]">
                        <h3 className="text-xl font-bold text-center">{round.name}</h3>
                        <div className="space-y-6">
                            {round.matches.map((match, matchIndex) => {
                                const [team1, team2] = match.teams;
                                const isCompleted = match.status === 'completed';
                                const canUpdate = team1 && team1.name !== 'TBD' && team2 && team2.name !== 'TBD' && !isCompleted;

                                return (
                                <Card key={match.id} className={cn("p-4 space-y-3", isCompleted && 'bg-muted/50')}>
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <span>{match.name}</span>
                                        <span className={cn("capitalize font-semibold", match.status === 'live' && 'text-red-500', isCompleted && 'text-green-500' )}>{match.status}</span>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        {[team1, team2].map((team, teamIndex) => {
                                            const isWinner = isCompleted && match.scores[teamIndex] > 0;
                                            return (
                                            <div key={team?.id || teamIndex} className="flex items-center gap-2">
                                                {team ? (
                                                    <>
                                                        <Avatar className="h-8 w-8"><AvatarImage src={team.avatar} data-ai-hint="team logo" /><AvatarFallback>{team.name.charAt(0)}</AvatarFallback></Avatar>
                                                        <span className={cn("font-medium text-sm w-36 truncate", isWinner && "text-primary font-bold")}>{team.name}</span>
                                                        {canUpdate && 
                                                            <Button variant="outline" size="sm" className="ml-auto h-7 text-xs" onClick={() => handleSetWinner(roundIndex, matchIndex, teamIndex)}>
                                                                <Crown className="mr-1 h-3 w-3"/> Win
                                                            </Button>
                                                        }
                                                        {isWinner && <Crown className="h-4 w-4 text-amber-400 ml-auto" />}
                                                    </>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Swords className="h-8 w-8 p-1.5 bg-muted rounded-full" />
                                                        <span className="font-medium text-sm">TBD</span>
                                                    </div>
                                                )}
                                            </div>
                                            );
                                        })}
                                    </div>
                                </Card>
                            )})}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
