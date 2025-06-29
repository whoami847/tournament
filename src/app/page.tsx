"use client";

import { useState, useMemo } from 'react';
import type { Tournament, Game } from '@/types';
import { mockTournaments } from '@/lib/data';
import TournamentCard from '@/components/tournament-card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export default function HomePage() {
  const [tournaments, setTournaments] = useState<Tournament[]>(mockTournaments);
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});

  const handleBookmarkToggle = (id: string) => {
    setBookmarked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const tournamentsByGame = useMemo(() => {
    return tournaments.reduce((acc, tournament) => {
        const gameKey = tournament.game;
        if (!acc[gameKey]) {
            acc[gameKey] = [];
        }
        acc[gameKey].push(tournament);
        return acc;
    }, {} as Record<Game, Tournament[]>);
  }, [tournaments]);

  const gamesInOrder = useMemo(() => [...new Set(tournaments.map(t => t.game))], [tournaments]);

  return (
    <div className="container mx-auto px-4 py-8 md:pb-8 pb-24">
      <div className="space-y-8">
        <div className="text-center py-8">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                Esports HQ
            </h1>
            <p className="text-muted-foreground mt-2 text-lg md:text-xl">Your central hub for competitive gaming.</p>
        </div>

        <div className="space-y-12">
          {gamesInOrder.map((game) => (
            <section key={game}>
              <h2 className="text-3xl font-bold tracking-tight mb-6">{game}</h2>
              {tournamentsByGame[game] && tournamentsByGame[game].length > 0 ? (
                <Carousel opts={{ align: "start", loop: false }} className="w-full">
                  <CarouselContent className="-ml-4">
                    {tournamentsByGame[game].map(tournament => (
                      <CarouselItem key={tournament.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                          <div className="p-1">
                              <TournamentCard 
                                tournament={tournament}
                                isBookmarked={!!bookmarked[tournament.id]}
                                onBookmarkToggle={() => handleBookmarkToggle(tournament.id)}
                              />
                          </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="hidden sm:flex" />
                  <CarouselNext className="hidden sm:flex"/>
                </Carousel>
              ) : (
                <div className="text-center py-16 border border-dashed rounded-lg">
                  <h3 className="text-xl font-medium">No Tournaments Found</h3>
                  <p className="text-muted-foreground mt-2">There are no tournaments for {game} at the moment.</p>
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
