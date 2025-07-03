'use client';

import { useState, useEffect } from 'react';
import type { Round, Team, Match, Tournament } from '@/types';
import { produce } from 'immer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Swords, Trophy, Crown, Video, User, CheckCircle, Clock, Send, Hourglass, Dices } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { useToast } from '@/hooks/use-toast';
import { requestMatchResults } from '@/lib/tournaments-service';


// --- HELPER COMPONENTS (LOCAL TO THIS FILE) ---
const TeamInMatchDisplay = ({ team }: { team: Team | null }) => {
    return (
        <div className="flex items-center justify-between p-2 h-9 w-full">
            <div className="flex items-center gap-2 overflow-hidden">
                {team ? (
                    <>
                        <Avatar className="h-5 w-5 flex-shrink-0">
                            <AvatarImage src={team.avatar} alt={team.name} data-ai-hint="team logo" />
                            <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs truncate font-medium text-foreground">
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
                )}
            </div>
        </div>
    );
};

const EditableMatchCard = ({ 
    match,
    tournamentId,
    roundName,
    onResultRequest
}: { 
    match: Match | null, 
    tournamentId: string,
    roundName: string,
    onResultRequest: () => void;
}) => {
    const team1 = match?.teams?.[0] ?? null;
    const team2 = match?.teams?.[1] ?? null;
    
    if (!match) return null;

    const canRequestResults = match.status === 'pending' && !!team1 && !!team2 && !match.resultSubmissionStatus;

    const getStatusContent = () => {
        if (match.status === 'completed') {
            const winner = match.scores[0] > match.scores[1] ? team1 : team2;
            return { icon: <CheckCircle className="h-3 w-3" />, text: `Winner: ${winner?.name}`, color: 'text-green-500' };
        }
        if (match.resultSubmissionStatus) {
            return { icon: <Hourglass className="h-3 w-3" />, text: 'Awaiting Submissions', color: 'text-amber-500' };
        }
        if (match.status === 'pending') {
            return { icon: <Clock className="h-3 w-3" />, text: 'Pending', color: 'text-muted-foreground' };
        }
        return null;
    };
    
    const statusContent = getStatusContent();
    
    return (
        <div className={cn("bg-card rounded-lg w-full flex-shrink-0 border shadow-sm flex flex-col justify-between min-h-[110px]")}>
             <div>
                <TeamInMatchDisplay team={team1} />
                <div className="border-t border-border/50 mx-2"></div>
                <TeamInMatchDisplay team={team2} />
            </div>
            <div className="p-2 border-t border-border/50 flex justify-between items-center">
                {statusContent && (
                    <div className={cn("flex items-center gap-1.5 text-xs font-medium", statusContent.color)}>
                        {statusContent.icon}
                        <span>{statusContent.text}</span>
                    </div>
                )}
                 {canRequestResults && (
                    <Button variant="outline" size="sm" className="ml-auto h-7 text-xs px-2" onClick={onResultRequest}>
                        <Send className="mr-1 h-3 w-3"/> Request Results
                    </Button>
                )}
            </div>
        </div>
    );
};

const EditableSingleMatchDisplay = ({ 
    match, 
    tournamentId,
    roundIndex, 
    matchIndex, 
    roundName,
    handleRequestResults
}: { 
    match: Match | null, 
    tournamentId: string,
    roundIndex: number, 
    matchIndex: number, 
    roundName: string,
    handleRequestResults: (roundName: string, matchId: string) => void
}) => {
    return (
      <div className="w-full md:w-48">
        <div className="flex justify-between items-center mb-1 h-4">
          <p className="text-[9px] text-muted-foreground">{match?.name ?? ''}</p>
          {match?.status === 'live' && (
            <Badge variant="default" className="flex items-center gap-1 text-[9px] h-3 px-1.5 bg-red-500 border-none">
                <Video className="h-2 w-2" />
                Live
            </Badge>
          )}
        </div>
        <EditableMatchCard
            match={match}
            tournamentId={tournamentId}
            roundName={roundName}
            onResultRequest={() => handleRequestResults(roundName, match!.id)}
        />
      </div>
    );
};

const Connector = () => (
    <div className="w-8 h-full flex-shrink-0 mx-2" style={{ height: `150px` }}>
        <svg className="w-full h-full" viewBox={`0 0 32 150`} preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d={`M1 23.5 C 16,23.5 16,75 32,75`} stroke="hsl(var(--border))" strokeWidth="2"/>
            <path d={`M1 126.5 C 16,126.5 16,75 32,75`} stroke="hsl(var(--border))" strokeWidth="2"/>
        </svg>
    </div>
);

// --- MAIN EDITOR COMPONENT ---

interface BracketEditorProps {
    bracket: Round[];
    participants: Team[];
    onUpdate: (bracket: Round[]) => void;
    tournamentId: Tournament['id'];
}

const getWinner = (match: Match): Team | null => {
    if (match.status !== 'completed' || !match.teams[0] || !match.teams[1]) return null;
    return match.scores[0] > match.scores[1] ? match.teams[0] : match.teams[1];
};

const roundAbbreviationMap: Record<string, string> = {
    'Finals': 'Finals', 'Semi-finals': 'Semis', 'Quarter-finals': 'Quarters', 'Round of 16': 'R16', 'Round of 32': 'R32', 'Round of 64': 'R64',
};

// Fisher-Yates shuffle algorithm to randomize team order
const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};


export function BracketEditor({ bracket: initialBracket, participants, onUpdate, tournamentId }: BracketEditorProps) {
    const { toast } = useToast();
    const [bracket, setBracket] = useState(initialBracket);
    const [activeRoundName, setActiveRoundName] = useState(initialBracket?.[0]?.name || '');

    useEffect(() => {
        setBracket(initialBracket);
        if (!activeRoundName && initialBracket?.[0]?.name) {
            setActiveRoundName(initialBracket[0].name);
        }
    }, [initialBracket, activeRoundName]);

    const handleRequestResults = async (roundName: string, matchId: string) => {
        const result = await requestMatchResults(tournamentId, roundName, matchId);
        if (result.success) {
            toast({
                title: "Request Sent",
                description: "Players have been notified to submit their results."
            });
            // The bracket will update via the stream from the parent component,
            // so we don't need to manually update state here.
        } else {
            toast({
                title: "Error",
                description: result.error || "Could not send result request.",
                variant: "destructive"
            });
        }
    };

    const handleLottery = () => {
        if (participants.length < 2) {
            toast({
                title: "Not enough participants",
                description: "You need at least 2 teams to run a lottery.",
                variant: "destructive",
            });
            return;
        }
    
        const newBracket = produce(bracket, draft => {
            if (!draft || draft.length === 0) return;
    
            // Shuffle participants for random assignment
            const shuffledParticipants = shuffleArray([...participants]);
    
            // Clear all teams from the entire bracket first to handle re-lottery
            draft.forEach(round => {
                round.matches.forEach(match => {
                    match.teams = [null, null];
                    match.status = 'pending';
                    match.scores = [0, 0];
                });
            });
    
            // Assign shuffled teams to the first round
            const firstRound = draft[0];
            let participantIndex = 0;
            for (const match of firstRound.matches) {
                for (let i = 0; i < match.teams.length; i++) {
                    if (participantIndex < shuffledParticipants.length) {
                        match.teams[i] = shuffledParticipants[participantIndex];
                        participantIndex++;
                    } else {
                        match.teams[i] = null; // Fill remaining slots with null (for byes)
                    }
                }
            }
        });
    
        setBracket(newBracket);
        onUpdate(newBracket); // This will save to Firestore
        toast({
            title: "Lottery Complete!",
            description: "Teams have been randomly assigned to the bracket.",
        });
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
                id: `${roundName}-m${i}`, name: `${roundName} #${i + 1}`, teams: [null, null], scores: [0, 0], status: 'pending', resultSubmissionStatus: {}
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

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="flex-grow flex justify-center overflow-x-auto no-scrollbar">
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
                 <Button onClick={handleLottery} variant="outline" disabled={participants.length < 2}>
                    <Dices className="mr-2 h-4 w-4" />
                    Run Lottery
                </Button>
            </div>

            <div className="flex flex-col items-center space-y-4">
                {activeRound.matches.length === 1 ? (
                    <EditableSingleMatchDisplay 
                        match={activeRound.matches[0]} 
                        tournamentId={tournamentId}
                        roundIndex={activeRoundIndex} 
                        matchIndex={0} 
                        roundName={activeRound.name}
                        handleRequestResults={handleRequestResults}
                    />
                ) : (
                    matchPairs.map((pair, i) => {
                        const [match1, match2] = pair;
                        const nextMatch = nextRound ? nextRound.matches[i] : null;

                        return (
                            <div key={i} className="flex items-center w-full justify-center">
                                <div className="space-y-8">
                                    <EditableSingleMatchDisplay 
                                        match={match1} 
                                        tournamentId={tournamentId}
                                        roundIndex={activeRoundIndex} 
                                        matchIndex={i*2} 
                                        roundName={activeRound.name}
                                        handleRequestResults={handleRequestResults}
                                    />
                                    {match2 && (
                                        <EditableSingleMatchDisplay 
                                            match={match2} 
                                            tournamentId={tournamentId}
                                            roundIndex={activeRoundIndex} 
                                            matchIndex={i*2+1} 
                                            roundName={activeRound.name}
                                            handleRequestResults={handleRequestResults}
                                        />
                                    )}
                                </div>
                                {nextRound && <Connector />}
                                {nextRound && (
                                     <div className="w-full md:w-48">
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
