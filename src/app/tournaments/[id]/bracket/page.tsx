"use client"

import { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { mockTournaments } from '@/lib/data';
import Bracket from '@/components/bracket';
import { Button } from '@/components/ui/button';
import { ChevronLeft, MoreHorizontal } from 'lucide-react';

export default function BracketPage({ params }: { params: { id: string } }) {
  const tournament = mockTournaments.find(t => t.id === params.id);
  
  if (!tournament || !tournament.bracket || tournament.bracket.length === 0) {
    notFound();
  }

  const [activeRoundName, setActiveRoundName] = useState(tournament.bracket[0].name);

  return (
    <div className="container mx-auto px-4 py-4 md:pb-8 pb-24">
      <header className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/tournaments/${params.id}`}>
            <ChevronLeft className="h-6 w-6" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold">Bracket</h1>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-6 w-6" />
        </Button>
      </header>

      <div className="flex justify-center mb-6">
        <div className="flex gap-2 p-1 bg-muted rounded-full">
          {tournament.bracket.map(round => (
            <Button
              key={round.name}
              variant={activeRoundName === round.name ? 'default' : 'ghost'}
              className="rounded-full h-8 px-4"
              onClick={() => setActiveRoundName(round.name)}
            >
              {round.name}
            </Button>
          ))}
        </div>
      </div>

      <Bracket tournament={tournament} activeRoundName={activeRoundName} />
    </div>
  );
}
