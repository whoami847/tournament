
"use client"

import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { mockTournaments } from '@/lib/data';
import Bracket from '@/components/bracket';
import { Button } from '@/components/ui/button';
import { ChevronLeft, MoreHorizontal } from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { Tournament, Round, Match } from '@/types';


const generateUpcomingBracket = (tournament: Tournament): Round[] => {
    const { maxTeams, participants } = tournament;

    // Ensure maxTeams is a power of 2, otherwise, a bracket is not possible
    if (maxTeams <= 1 || (maxTeams & (maxTeams - 1)) !== 0) {
        return [];
    }

    const roundNamesMap: Record<number, string> = {
        2: 'Finals',
        4: 'Semi-finals',
        8: 'Quarter-finals',
        16: 'Round of 16',
        32: 'Round of 32',
        64: 'Round of 64',
    };

    let rounds: Round[] = [];
    let numberOfTeamsInRound = maxTeams;

    while (numberOfTeamsInRound >= 2) {
        const roundName = roundNamesMap[numberOfTeamsInRound] || `Round of ${numberOfTeamsInRound}`;
        const matchCount = numberOfTeamsInRound / 2;
        const matches: Match[] = [];
        
        for (let i = 0; i < matchCount; i++) {
            matches.push({
                id: `${roundName}-m${i + 1}`,
                name: `Match ${i + 1}`,
                teams: [null, null],
                scores: [0, 0],
                status: 'pending',
            });
        }
        
        rounds.push({ name: roundName, matches });
        numberOfTeamsInRound /= 2;
    }

    const generatedRounds = rounds.reverse();

    // Populate the first round with participants
    if (generatedRounds.length > 0) {
        const firstRoundMatches = generatedRounds[0].matches;
        for (let i = 0; i < firstRoundMatches.length; i++) {
            const team1Index = i * 2;
            const team2Index = i * 2 + 1;
            const team1 = participants[team1Index] || null;
            const team2 = participants[team2Index] || null;
            firstRoundMatches[i].teams = [team1, team2];
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

  const bracketData = useMemo(() => {
    if (tournament.status === 'upcoming') {
        return generateUpcomingBracket(tournament);
    }
    return tournament.bracket;
  }, [tournament]);


  if (!bracketData || bracketData.length === 0) {
    return (
        <div className="bg-background min-h-screen text-foreground flex flex-col items-center justify-center p-4">
             <header className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
                <Button variant="ghost" size="icon" asChild>
                <Link href={`/tournaments/${tournament.id}`}>
                    <ChevronLeft className="h-6 w-6" />
                </Link>
                </Button>
                <h1 className="text-xl font-bold">Bracket</h1>
                <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-6 w-6" />
                </Button>
            </header>
            <p className="text-muted-foreground text-center">The bracket for this tournament is not available yet.</p>
        </div>
    )
  }

  const [activeRoundName, setActiveRoundName] = useState(bracketData[0].name);
  const roundNames = bracketData.map(r => r.name);

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
                <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-6 w-6" />
                </Button>
            </header>

            <div className="flex justify-center items-center gap-2 mb-8 flex-wrap">
              {roundNames.map(name => (
                <Button 
                  key={name}
                  variant={activeRoundName === name ? "default" : "secondary"}
                  className={cn(
                    "rounded-full h-9 px-4",
                    activeRoundName !== name && "bg-card text-muted-foreground hover:bg-accent"
                  )}
                  onClick={() => setActiveRoundName(name)}
                >
                  {name}
                </Button>
              ))}
            </div>

            <Bracket tournament={tournament} bracket={bracketData} activeRoundName={activeRoundName} />
        </div>
    </div>
  );
}
