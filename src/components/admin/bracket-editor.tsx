'use client';

import { useState } from 'react';
import type { Round, Team, Match } from '@/types';
import { produce } from 'immer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, Swords, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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

    const handleScoreChange = (roundIndex: number, matchIndex: number, teamIndex: number, score: number) => {
        const nextBracket = produce(bracket, draft => {
            draft[roundIndex].matches[matchIndex].scores[teamIndex] = score;
        });
        setBracket(nextBracket);
    };

    const handleUpdateMatch = (roundIndex: number, matchIndex: number) => {
        const nextBracket = produce(bracket, draft => {
            const match = draft[roundIndex].matches[matchIndex];
            const [score1, score2] = match.scores;
            
            if (score1 === score2) {
                alert("Scores cannot be tied. Please declare a winner.");
                return;
            }

            match.status = 'completed';

            // Advance winner to the next round
            if (roundIndex < draft.length - 1) {
                const winner = score1 > score2 ? match.teams[0] : match.teams[1];
                const nextRoundMatchIndex = Math.floor(matchIndex / 2);
                const teamSlotInNextMatch = matchIndex % 2;

                if (winner && draft[roundIndex + 1].matches[nextRoundMatchIndex]) {
                    draft[roundIndex + 1].matches[nextRoundMatchIndex].teams[teamSlotInNextMatch] = winner;
                }
            }
        });
        setBracket(nextBracket);
        onUpdate(nextBracket);
    };

    const generateBracket = () => {
        const maxTeams = participants.length <= 2 ? 2 : participants.length <= 4 ? 4 : participants.length <= 8 ? 8 : 16; // Simple logic for now
        const roundNamesMap: Record<number, string> = {
            2: 'Finals', 4: 'Semi-finals', 8: 'Quarter-finals', 16: 'Round of 16'
        };

        let rounds: Round[] = [];
        let numTeams = maxTeams;
        while(numTeams >= 2) {
            const roundName = roundNamesMap[numTeams] || `Round of ${numTeams}`;
            const numMatches = numTeams / 2;
            const matches: Match[] = Array.from({ length: numMatches }, (_, i) => ({
                id: `${roundName}-m${i}`, name: `${roundName} #${i + 1}`, teams: [null, null], scores: [0, 0], status: 'pending'
            }));
            rounds.push({ name: roundName, matches });
            numTeams /= 2;
        }

        // Populate first round
        for (let i = 0; i < participants.length; i++) {
            const matchIndex = Math.floor(i / 2);
            const teamIndex = i % 2;
            if (rounds[0] && rounds[0].matches[matchIndex]) {
                rounds[0].matches[matchIndex].teams[teamIndex] = participants[i];
            }
        }
        
        onUpdate(rounds);
    };

    if (!bracket || bracket.length === 0) {
        return (
            <div className="text-center">
                <p className="text-muted-foreground mb-4">This tournament doesn't have a bracket yet.</p>
                <Button onClick={generateBracket}>Generate Bracket</Button>
            </div>
        );
    }
    
    const finalWinner = getWinner(bracket[bracket.length - 1].matches[0]);

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
                            {round.matches.map((match, matchIndex) => (
                                <Card key={match.id} className={cn("p-4 space-y-4", match.status === 'completed' && 'bg-muted/50')}>
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <span>{match.name}</span>
                                        <span className={cn("capitalize font-semibold", match.status === 'live' && 'text-red-500', match.status === 'completed' && 'text-green-500' )}>{match.status}</span>
                                    </div>
                                    
                                    {[0, 1].map(teamIndex => {
                                        const team = match.teams[teamIndex];
                                        return (
                                            <div key={teamIndex} className="flex items-center gap-2">
                                                <div className="flex items-center gap-2 flex-1">
                                                    {team ? (
                                                        <>
                                                            <Avatar className="h-8 w-8"><AvatarImage src={team.avatar} data-ai-hint="team logo" /><AvatarFallback>{team.name.charAt(0)}</AvatarFallback></Avatar>
                                                            <span className="font-medium text-sm w-28 truncate">{team.name}</span>
                                                        </>
                                                    ) : (
                                                         <div className="flex items-center gap-2 text-muted-foreground">
                                                            <Swords className="h-8 w-8 p-1.5 bg-muted rounded-full" />
                                                            <span className="font-medium text-sm">TBD</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <Input 
                                                    type="number" 
                                                    className="w-16 h-8"
                                                    value={match.scores[teamIndex]}
                                                    onChange={(e) => handleScoreChange(roundIndex, matchIndex, teamIndex, parseInt(e.target.value) || 0)}
                                                    disabled={!team || match.status === 'completed'}
                                                />
                                            </div>
                                        )
                                    })}
                                    
                                    {match.teams[0] && match.teams[1] && match.status !== 'completed' && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="sm" className="w-full">Update Match</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Confirm Match Results</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to set this match as complete? The winner will advance to the next round. This action cannot be undone.
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleUpdateMatch(roundIndex, matchIndex)}>Confirm</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
