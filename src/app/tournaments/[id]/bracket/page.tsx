"use client"

import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { mockTournaments } from '@/lib/data';
import Bracket from '@/components/bracket';
import { Button } from '@/components/ui/button';
import { ChevronLeft, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function BracketPage() {
  const params = useParams<{ id: string }>();
  if (!params) return notFound();

  const tournament = mockTournaments.find(t => t.id === params.id);
  
  if (!tournament || !tournament.bracket || tournament.bracket.length === 0) {
    notFound();
  }

  const [activeRoundName, setActiveRoundName] = useState(tournament.bracket[0].name);

  const roundNames = tournament.bracket.map(r => r.name);

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

            <Bracket tournament={tournament} activeRoundName={activeRoundName} />
        </div>
    </div>
  );
}
