"use client"

import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { mockTournaments } from '@/lib/data';
import Bracket from '@/components/bracket';
import { Button } from '@/components/ui/button';
import { ChevronLeft, MoreHorizontal } from 'lucide-react';

export default function BracketPage() {
  const params = useParams<{ id: string }>();
  if (!params) return notFound();

  const tournament = mockTournaments.find(t => t.id === params.id);
  
  if (!tournament || !tournament.bracket || tournament.bracket.length === 0) {
    notFound();
  }

  return (
    <div className="bg-background min-h-screen text-foreground">
        <div className="w-full px-4 py-4">
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

            <Bracket tournament={tournament} />
        </div>
    </div>
  );
}
