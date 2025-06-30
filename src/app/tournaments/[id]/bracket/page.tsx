"use client"

import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { useState } from 'react';
import { mockTournaments } from '@/lib/data';
import Bracket from '@/components/bracket';
import { Button } from '@/components/ui/button';
import { ChevronLeft, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Round } from '@/types';

export default function BracketPage() {
  const params = useParams<{ id: string }>();
  if (!params) return notFound();

  const tournament = mockTournaments.find(t => t.id === params.id);
  
  if (!tournament || !tournament.bracket || tournament.bracket.length === 0) {
    notFound();
  }

  const [activeRoundName, setActiveRoundName] = useState(tournament.bracket[0].name);

  return (
    <div className="bg-background min-h-screen text-foreground">
        <div className="container mx-auto px-4 py-4 md:pb-8 pb-24">
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

            <div className="flex justify-center mb-6">
                <div className="bg-card p-1 rounded-full flex flex-wrap items-center justify-center gap-1">
                    {tournament.bracket.map((round: Round) => (
                        <Button 
                            key={round.name}
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "rounded-full h-8 px-4 text-xs font-semibold tracking-wider uppercase",
                                activeRoundName === round.name 
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                                    : "text-muted-foreground hover:bg-card-foreground/5"
                            )}
                            onClick={() => setActiveRoundName(round.name)}
                        >
                            {round.name}
                        </Button>
                    ))}
                </div>
            </div>

            <Bracket tournament={tournament} activeRoundName={activeRoundName} />
        </div>
    </div>
  );
}
