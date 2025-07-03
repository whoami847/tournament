'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Round, Team, Match } from '@/types';
import { produce } from 'immer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Swords, Trophy, Crown, Video, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';


// --- HELPER COMPONENTS (LOCAL TO THIS FILE) ---

const EditableTeamDisplay = ({ 
    team, 
    score, 
    isWinner, 
    isLoser,
    isEditable,
    onSetWinner,
}: { 
    team: Team | null, 
    score?: number, 
    isWinner?: boolean, 
    isLoser?: boolean,
    isEditable?: boolean,
    onSetWinner?: () => void
}) => {
    const teamContent = team ? (
        <>
            <Avatar className="h-5 w-5 flex-shrink-0">
                <AvatarImage src={team.avatar} alt={team.name} data-ai-hint="team logo" />
                <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className={cn(
                "text-xs truncate",
                isWinner ? "font-bold text-foreground" : "font-medium text-muted-foreground",
                isLoser && "font-medium text-destructive/80 opacity-70"
            )}>
                {team.name}
            </span>
        </>
    ) : (
        <>
            <div className="h-5 w-5 rounded-md bg-muted/20 flex-shrink-0 flex items-center justify-center">
                <User className="h-3 w-3 text-muted-foreground" />
            </div>
            <span className="text-muted-foreground text-xs">TBD</span>
        </>
    );

    return (
        <div className="flex items-center justify-between p-2 h-9 w-full">
            <div className="flex items-center gap-2 overflow-hidden">
                {teamContent}
            </div>
            {isEditable && onSetWinner && (
                 <Button variant="outline" size="sm" className="ml-auto h-7 text-xs" onClick={onSetWinner}>
                    <Crown className="mr-1 h-3 w-3"/> Win
                </Button>
            )}
            {typeof score !== 'undefined' && !isEditable && (
                <span className={cn(
                    "font-bold text-sm",
                    isWinner ? "text-amber-400" : "text-muted-foreground/50",
                    isLoser && "text-destructive/80 opacity-70"
                )}>
                    {score}
                </span>
            )}
             {isWinner && !isEditable && <Crown className="h-4 w-4 text-amber-400 ml-auto" />}
        </div>
    );
};

const EditableMatchCard = ({ match, onSetWinner }: { match: Match | null, onSetWinner: (winnerIndex: 0 | 1) => void }) => {
    const team1 = match?.teams?.[0] ?? null;
    const team2 = match?.teams?.[1] ?? null;
    const score1 = match?.scores?.[0] ?? 0;
    const score2 = match?.scores?.[1] ?? 0;
    const status = match?.status ?? 'pending';

    const isCompleted = status === 'completed';
    const canUpdate = !!team1 && !!team2 && !isCompleted;

    const winner1 = isCompleted && score1 > score2;
    const winner2 = isCompleted && score2 > score1;
    const loser1 = isCompleted && score1 < score2;
    const loser2 = isCompleted && score2 < score1;
    
    return (
        <div className={cn("bg-card rounded-lg w-full flex-shrink-0 border shadow-sm h-[76px]", isCompleted && 'bg-muted/50')}>
             <EditableTeamDisplay 
                team={team1} 
                score={score1} 
                isWinner={winner1} 
                isLoser={loser1}
                isEditable={canUpdate}
                onSetWinner={() => onSetWinner(0)} 
            />
            <div className="border-t border-border/50 mx-2"></div>
            <EditableTeamDisplay 
                team={team2} 
                score={score2} 
                isWinner={winner2} 
                isLoser={loser2}
                isEditable={canUpdate}
                onSetWinner={() => onSetWinner(1)}
            />
        </div>
    );
};

const EditableSingleMatchDisplay = ({ match, roundIndex, matchIndex, handleSetWinner }: { match: Match | null, roundIndex: number, matchIndex: number, handleSetWinner: (roundIndex: number, matchIndex: number, winnerIndex: 0 | 1) => void }) => {
    return (
      <div className="w-full md:w-40">
        <div className="flex justify-between items-center mb-1 h-4">
          <p className="text-[9px] text-muted-foreground">{match?.name ?? ''}</p>
          {match?.status === 'live' && (
            <Badge variant="default" className="flex items-center gap-1 text-[9px] h-3 px-1.5 bg-red-500 border-none">
                <Video className="h-2 w-2" />
                Live
            </Badge>
          )}
        </div>
        <EditableMatchCard match={match} onSetWinner={(winnerIndex) => handleSetWinner(roundIndex, matchIndex, winnerIndex)} />
      </div>
    );
};

const Connector = () => (
    <div className="w-8 h-full flex-shrink-0 mx-2" style={{ height: `124px` }}>
        <svg className="w-full h-full" viewBox={`0 0 32 124`} preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d={`M1 18.5 C 16,18.5 16,62 32,62`} stroke="hsl(var(--border))" strokeWidth="2"/>
            <path d={`M1 105.5 C 16,105.5 16,62 32,62`} stroke="hsl(var(--border))" strokeWidth="2"/>
        </svg>
    </div>
);

// --- MAIN EDITOR COMPONENT ---

interface BracketEditorProps {
    bracket: Round[];
    participants: Team[];
    onUpdate: (bracket: Round[]) => void;
}

const getWinner = (match: Match): Team | null => {
    if (match.status !== 'completed' || !match.teams[0] || !match.teams[1]) return null;
    return match.scores[0] > match.scores[1] ? match.teams[0] : match.teams[1];
};

const roundAbbreviationMap: Record<string, string> = {
    'Finals': 'Finals', 'Semi-finals': 'Semis', 'Quarter-finals': 'Quarters', 'Round of 16': 'R16', 'Round of 32': 'R32', 'Round of 64': 'R64',
};

export function BracketEditor({ bracket: initialBracket, participants, onUpdate }: BracketEditorProps) {
    const [bracket, setBracket] = useState(initialBracket);
    const [activeRoundName, setActiveRoundName] = useState(initialBracket?.[0]?.name || '');

    useEffect(() => {
        setBracket(initialBracket);
        if (!activeRoundName && initialBracket?.[0]?.name) {
            setActiveRoundName(initialBracket[0].name);
        }
    }, [initialBracket, activeRoundName]);

    const handleSetWinner = (roundIndex: number, matchIndex: number, winnerIndex: 0 | 1) => {
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
        // ...(bracket generation logic remains the same)
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
    const roundNames = bracket.map(r => r.name);
    const activeRoundIndex = bracket.findIndex(r => r.name === activeRoundName);
    const activeRound = bracket[activeRoundIndex];
    const nextRound = bracket[activeRoundIndex + 1] || null;

    const matchPairs = [];
    if (activeRound) {
        for (let i = 0; i < activeRound.matches.length; i += 2) {
            matchPairs.push([
                activeRound.matches[i],
                activeRound.matches[i + 1] || null
            ]);
        }
    }

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

            <div className="flex justify-center mb-4 overflow-x-auto no-scrollbar">
                <div className="inline-flex items-center justify-center rounded-full bg-card p-1 text-card-foreground border">
                    {roundNames.map(name => (
                        <Button
                            key={name}
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "rounded-full h-8 px-4 font-semibold",
                                activeRoundName === name 
                                    ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                                    : 'text-muted-foreground hover:bg-accent/50'
                            )}
                            onClick={() => setActiveRoundName(name)}
                        >
                            {roundAbbreviationMap[name] || name}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col items-center space-y-4">
                {activeRound.matches.length === 1 ? (
                    <EditableSingleMatchDisplay match={activeRound.matches[0]} roundIndex={activeRoundIndex} matchIndex={0} handleSetWinner={handleSetWinner} />
                ) : (
                    matchPairs.map((pair, i) => {
                        const [match1, match2] = pair;
                        const nextMatch = nextRound ? nextRound.matches[i] : null;

                        return (
                            <div key={i} className="flex items-center w-full justify-center">
                                <div className="space-y-8">
                                    <EditableSingleMatchDisplay match={match1} roundIndex={activeRoundIndex} matchIndex={i*2} handleSetWinner={handleSetWinner} />
                                    {match2 && <EditableSingleMatchDisplay match={match2} roundIndex={activeRoundIndex} matchIndex={i*2+1} handleSetWinner={handleSetWinner} />}
                                </div>
                                {nextRound && <Connector />}
                                {nextRound && (
                                     <div className="w-full md:w-40">
                                        <div className="h-5 mb-1" />
                                        <div className={cn("bg-card rounded-lg w-full flex-shrink-0 border shadow-sm h-[76px] p-0")}>
                                            <div className="flex items-center justify-between p-2 h-9 w-full">
                                                <div className="flex items-center gap-2 overflow-hidden text-muted-foreground text-xs">
                                                    <div className="h-5 w-5 rounded-md bg-muted/20 shrink-0 flex items-center justify-center"><User className="h-3 w-3" /></div>
                                                    <span>{ getWinner(match1)?.name || 'TBD'}</span>
                                                </div>
                                            </div>
                                            <div className="border-t border-border/50 mx-2" />
                                            <div className="flex items-center justify-between p-2 h-9 w-full">
                                                <div className="flex items-center gap-2 overflow-hidden text-muted-foreground text-xs">
                                                    <div className="h-5 w-5 rounded-md bg-muted/20 shrink-0 flex items-center justify-center"><User className="h-3 w-3" /></div>
                                                    <span>{ getWinner(match2)?.name || 'TBD'}</span>
                                                </div>
                                            </div>
                                        </div>
                                     </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );
}
