"use client"

import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { mockTournaments } from '@/lib/data';
import Bracket, { SoloBracket, processBracketForWinners, ChampionCard, ChampionPlaceholder } from '@/components/bracket';
import { Button } from '@/components/ui/button';
import { ChevronLeft, MoreHorizontal, Trophy, GitBranch } from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { Tournament, Round, Match, Team } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const roundAbbreviationMap: Record<string, string> = {
    'Finals': 'Finals',
    'Semi-finals': 'Semis',
    'Quarter-finals': 'Quarters',
    'Round of 16': 'R16',
    'Round of 32': 'R32',
    'Round of 64': 'R64',
};

const generateUpcomingBracket = (tournament: Tournament): Round[] => {
    const { maxTeams, participants } = tournament;

    const placeholderTeamNames = [
        'Thunderbolts', 'Arctic Wolves', 'Desert Scorpions', 'Ironclad Legion', 
        'Venomous Vipers', 'Rising Phoenix', 'Goliath Titans', 'Emerald Spectres',
        'Steel Sentinels', 'Nightmare Knights', 'Inferno Squad', 'Cyclone Crew',
        'Rogue Warriors', 'Phantom Phantoms', 'Savage Spartans', 'Digital Dynamos'
    ];
    
    let teamNameCounter = 0;
    const generatePlaceholderTeam = (): Team => {
        const name = placeholderTeamNames[teamNameCounter % placeholderTeamNames.length];
        const team: Team = {
            id: `p-${teamNameCounter}`,
            name: name,
            avatar: 'https://placehold.co/40x40.png'
        };
        teamNameCounter++;
        return team;
    }

    // Ensure maxTeams is a power of 2, otherwise, a bracket is not possible
    if (maxTeams <= 1 || (maxTeams & (maxTeams - 1)) !== 0) {
        return [];
    }

    const roundNamesMap: Record<number, { name: string, prefix: string }> = {
        2: { name: 'Finals', prefix: 'F' },
        4: { name: 'Semi-finals', prefix: 'SF' },
        8: { name: 'Quarter-finals', prefix: 'QF' },
        16: { name: 'Round of 16', prefix: 'R16' },
        32: { name: 'Round of 32', prefix: 'R32' },
        64: { name: 'Round of 64', prefix: 'R64' },
    };

    let rounds: Round[] = [];
    let numberOfTeamsInRound = maxTeams;

    while (numberOfTeamsInRound >= 2) {
        const roundInfo = roundNamesMap[numberOfTeamsInRound] || { name: `Round of ${numberOfTeamsInRound}`, prefix: `R${numberOfTeamsInRound}` };
        const roundName = roundInfo.name;
        const matchPrefix = roundInfo.prefix;
        const matchCount = numberOfTeamsInRound / 2;
        const matches: Match[] = [];
        
        for (let i = 0; i < matchCount; i++) {
            matches.push({
                id: `${roundName}-m${i + 1}`,
                name: `${matchPrefix}-${i + 1}`,
                teams: [null, null],
                scores: [0, 0],
                status: 'pending',
            });
        }
        
        rounds.push({ name: roundName, matches });
        numberOfTeamsInRound /= 2;
    }

    const generatedRounds = rounds;

    // Populate the first round with participants, then placeholders
    if (generatedRounds.length > 0) {
        const firstRoundMatches = generatedRounds[0].matches;
        for (let i = 0; i < firstRoundMatches.length; i++) {
            const team1Index = i * 2;
            const team2Index = i * 2 + 1;
            const team1 = participants[team1Index] || generatePlaceholderTeam();
            const team2 = participants[team2Index] || generatePlaceholderTeam();
            firstRoundMatches[i].teams = [team1, team2];
        }
    }
    
    // Populate subsequent rounds with placeholder teams
    for(let r = 1; r < generatedRounds.length; r++) {
        for(let m = 0; m < generatedRounds[r].matches.length; m++) {
            generatedRounds[r].matches[m].teams = [generatePlaceholderTeam(), generatePlaceholderTeam()];
        }
    }

    return generatedRounds;
};


export default function BracketPage() {
  const params = useParams<{ id: string }>();
  if (!params) return notFound();

  const tournament = mockTournaments.find(t => t.id === params.id);
  
  if (!tournament) {
    notFound();
  }

  const isSoloTournament = tournament.format.toLowerCase().includes('solo');

  const bracketData = useMemo(() => {
    if (tournament.status === 'upcoming' && !isSoloTournament) {
        return generateUpcomingBracket(tournament);
    }
    return tournament.bracket;
  }, [tournament, isSoloTournament]);

  const winner = useMemo(() => {
    if (tournament.status !== 'completed' || !bracketData || bracketData.length === 0) {
        return null;
    }
    const processed = processBracketForWinners(bracketData);
    const finalRound = processed[processed.length - 1];
    if (!finalRound || finalRound.matches.length !== 1) return null;
    const finalMatch = finalRound.matches[0];
    if (finalMatch.status !== 'completed' || !finalMatch.teams[0] || !finalMatch.teams[1]) return null;
    const [team1, team2] = finalMatch.teams;
    const [score1, score2] = finalMatch.scores;
    return score1 > score2 ? team1 : team2;
  }, [tournament.status, bracketData]);


  if (!isSoloTournament && (!bracketData || bracketData.length === 0)) {
    return (
        <div className="bg-background min-h-screen text-foreground flex flex-col items-center justify-center p-4">
             <header className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
                <Button variant="ghost" size="icon" asChild>
                <Link href={`/tournaments/${tournament.id}`}>
                    <ChevronLeft className="h-6 w-6" />
                </Link>
                </Button>
                <h1 className="text-xl font-bold">Bracket</h1>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-6 w-6" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Share Bracket</DropdownMenuItem>
                        <DropdownMenuItem>View Rules</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Report an issue</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>
            <p className="text-muted-foreground text-center">The bracket for this tournament is not available yet.</p>
        </div>
    )
  }

  const [activeRoundName, setActiveRoundName] = useState(bracketData?.[0]?.name ?? '');
  const roundNames = bracketData?.map(r => r.name) ?? [];

  return (
    <div className="bg-background min-h-screen text-foreground pb-24">
        <div className="container mx-auto px-4 py-4">
            <header className="flex items-center justify-between mb-6">
                <Button variant="ghost" size="icon" asChild>
                <Link href={`/tournaments/${tournament.id}`}>
                    <ChevronLeft className="h-6 w-6" />
                </Link>
                </Button>
                <h1 className="text-xl font-bold">Bracket</h1>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-6 w-6" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Share Bracket</DropdownMenuItem>
                        <DropdownMenuItem>View Rules</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Report an issue</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>

            {isSoloTournament ? (
                <SoloBracket tournament={tournament} />
            ) : (
                <Tabs defaultValue="bracket" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-card p-1 rounded-full h-auto">
                        <TabsTrigger value="bracket" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2">
                            <GitBranch className="h-4 w-4" />
                            Bracket
                        </TabsTrigger>
                        <TabsTrigger value="winner" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2">
                            <Trophy className="h-4 w-4" />
                            Winner
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="bracket" className="mt-6">
                        <div className="flex justify-center mb-8">
                            <div className="inline-flex items-center justify-center rounded-full bg-card p-1 text-card-foreground">
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
                        <Bracket tournament={tournament} bracket={bracketData} activeRoundName={activeRoundName} />
                    </TabsContent>
                    <TabsContent value="winner" className="mt-6">
                         <Card>
                            <CardHeader>
                                <CardTitle>Tournament Winner</CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-center items-center py-16">
                               {winner ? <ChampionCard team={winner} /> : <ChampionPlaceholder />}
                            </CardContent>
                         </Card>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    </div>
  );
}
