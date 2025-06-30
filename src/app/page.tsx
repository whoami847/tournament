"use client";

import Image from 'next/image';
import { useRef, useState, useMemo } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, ChevronRight, Users, DollarSign, Gamepad2, Trophy } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Link from 'next/link';
import { mockTournaments } from '@/lib/data';
import type { Tournament, Game } from '@/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// --- MOCK DATA ---

const featuredEventsData = [
  {
    game: 'Free Fire',
    name: 'Free Fire World Series',
    date: '10.11.2024 • 18:00',
    image: 'https://placehold.co/800x400.png',
    dataAiHint: 'fire battle action'
  },
  {
    game: 'Mobile Legends',
    name: 'MSC 2024',
    date: '28.06.24 • 19:00',
    image: 'https://placehold.co/800x400.png',
    dataAiHint: 'fantasy MOBA characters'
  },
  {
    game: 'PUBG',
    name: 'PMGC Grand Finals',
    date: '08.12.24 • 20:00',
    image: 'https://placehold.co/800x400.png',
    dataAiHint: 'soldiers battle royale'
  }
];

const liveTournaments = mockTournaments.filter(t => t.status === 'live');


const gamesData = [
    { name: 'Free Fire', categories: 'Battle Royale • Action', image: 'https://placehold.co/400x200.png', dataAiHint: 'fire character action',},
    { name: 'PUBG', categories: 'Battle Royale • FPS', image: 'https://placehold.co/400x200.png', dataAiHint: 'soldier helmet',},
    { name: 'Mobile Legends', categories: 'MOBA • Strategy', image: 'https://placehold.co/400x200.png', dataAiHint: 'fantasy characters',},
    { name: 'COD: Mobile', categories: 'FPS • Action', image: 'https://placehold.co/400x200.png', dataAiHint: 'modern warfare soldier',},
];

const topPlayersData = [
    { rank: 1, name: 'Jonathan Gaming', role: 'Player', winrate: '95%', games: 127, avatar: 'https://placehold.co/48x48.png', dataAiHint: 'male gamer headset',},
    { rank: 2, name: 'ScoutOP', role: 'Player', winrate: '87%', games: 98, avatar: 'https://placehold.co/48x48.png', dataAiHint: 'male gamer intense',},
    { rank: 3, name: 'Mortal', role: 'Player', winrate: '82.5%', games: 64, avatar: 'https://placehold.co/48x48.png', dataAiHint: 'male gamer smiling',},
];

const gameFilterData = [
    { name: 'Free Fire' as Game, displayName: 'Free Fire', image: 'https://placehold.co/400x400.png', dataAiHint: 'fire character action' },
    { name: 'PUBG' as Game, displayName: 'PUBG', image: 'https://placehold.co/400x400.png', dataAiHint: 'soldier helmet' },
    { name: 'Mobile Legends' as Game, displayName: 'Mobile Legends', image: 'https://placehold.co/400x400.png', dataAiHint: 'fantasy characters' },
    { name: 'COD: Mobile' as Game, displayName: 'COD: Mobile', image: 'https://placehold.co/400x400.png', dataAiHint: 'modern warfare soldier' },
];


// --- SUB-COMPONENTS ---

const HomeHeader = () => (
  <header className="flex items-center justify-between p-4">
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10 border-2 border-primary"><AvatarImage src="https://placehold.co/40x40.png" alt="Mapple" data-ai-hint="wizard character" /><AvatarFallback>M</AvatarFallback></Avatar>
      <div><h1 className="font-bold">Mapple</h1><p className="text-sm text-muted-foreground">Player</p></div>
    </div>
    <Button variant="ghost" size="icon" className="relative rounded-full bg-card h-10 w-10">
        <Bell className="h-5 w-5" />
        <span className="absolute top-2 right-2 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
    </Button>
  </header>
);

const SectionHeader = ({ title, actionText, actionHref }: { title: string, actionText?: string, actionHref?: string }) => (
  <div className="flex justify-between items-baseline mb-4">
    <h2 className="text-xl font-bold tracking-tight">{title}</h2>
    {actionText && actionHref && <Link href={actionHref} className="text-sm font-medium text-primary hover:underline">{actionText}</Link>}
  </div>
);

const FeaturedEvent = () => {
    const plugin = useRef(
        Autoplay({ delay: 3000, stopOnInteraction: true })
    );

    return (
        <Carousel
            plugins={[plugin.current]}
            className="w-full"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
        >
            <CarouselContent>
                {featuredEventsData.map((event, i) => (
                    <CarouselItem key={i}>
                        <Card className="relative w-full h-48 border-none overflow-hidden rounded-2xl">
                            <Image src={event.image} alt={event.name} fill className="object-cover" data-ai-hint={event.dataAiHint} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                            <CardContent className="absolute bottom-0 left-0 p-4 text-white">
                                <p className="text-xs font-bold uppercase tracking-wider">{event.game}</p>
                                <h3 className="text-2xl font-black">{event.name}</h3>
                                <p className="text-xs text-white/80">{event.date}</p>
                            </CardContent>
                            <Button size="icon" className="absolute bottom-4 right-4 rounded-full bg-primary/80 backdrop-blur-sm h-12 w-12 border-2 border-primary/50"><ChevronRight className="h-6 w-6" /></Button>
                        </Card>
                    </CarouselItem>
                ))}
            </CarouselContent>
        </Carousel>
    );
};

const LiveEvents = ({tournaments}: {tournaments: Tournament[]}) => (
    <div className="-mx-4">
        <Carousel opts={{ align: "start", loop: false }} className="w-full">
            <CarouselContent className="pl-4">
                {tournaments.map((event, i) => (
                    <CarouselItem key={i} className="basis-2/5">
                        <Card className="relative h-48 border-none overflow-hidden rounded-xl">
                            <Image src={event.image} alt={event.name} fill className="object-cover" data-ai-hint={event.dataAiHint} />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            <CardContent className="absolute bottom-0 left-0 p-3 text-white w-full">
                                <Badge className="mb-1 bg-red-500 text-white border-none font-bold animate-pulse">Live</Badge>
                                <h4 className="font-bold truncate">{event.name}</h4>
                                <p className="text-xs text-white/70">{format(new Date(event.startDate), "dd.MM.yy '•' HH:mm")}</p>
                            </CardContent>
                            <Badge variant="secondary" className="absolute top-2 right-2 text-xs">{event.game}</Badge>
                        </Card>
                    </CarouselItem>
                ))}
            </CarouselContent>
        </Carousel>
    </div>
);

const GamesList = () => (
    <div className="-mx-4">
        <Carousel opts={{ align: "start", loop: false }} className="w-full">
            <CarouselContent className="pl-4">
            {gamesData.map((game, i) => (
                <CarouselItem key={i} className="basis-3/5">
                    <Card className="relative h-28 border-none overflow-hidden rounded-xl">
                        <Image src={game.image} alt={game.name} fill className="object-cover" data-ai-hint={game.dataAiHint}/>
                        <div className="absolute inset-0 bg-black/50" />
                        <CardContent className="absolute bottom-0 left-0 p-3 text-white">
                            <h4 className="font-bold">{game.name}</h4>
                            <p className="text-xs text-white/70">{game.categories}</p>
                        </CardContent>
                    </Card>
                </CarouselItem>
            ))}
            </CarouselContent>
        </Carousel>
    </div>
);

const TopPlayers = () => (
    <div className="space-y-2">
        {topPlayersData.map(p => (
            <Card key={p.rank} className="p-3 bg-card flex items-center gap-4 border-none">
                <div className="relative h-12 w-12 flex-shrink-0">
                    <Avatar className="h-12 w-12 border-2 border-primary/50"><AvatarImage src={p.avatar} data-ai-hint={p.dataAiHint}/><AvatarFallback>{p.name.charAt(0)}</AvatarFallback></Avatar>
                    <Badge className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground h-5 w-5 p-0 flex items-center justify-center text-xs font-bold border-2 border-background">{p.rank}</Badge>
                </div>
                <div className="flex-grow">
                    <p className="font-bold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.role}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-primary">{p.winrate}</p>
                    <p className="text-xs text-muted-foreground">{p.games} Games</p>
                </div>
            </Card>
        ))}
    </div>
);

const GameFilter = ({ selectedGame, onSelectGame }: { selectedGame: Game, onSelectGame: (game: Game) => void }) => (
    <div className="grid grid-cols-2 gap-4 mb-6">
        {gameFilterData.map((game) => (
            <div
                key={game.name}
                className={cn(
                    "rounded-xl overflow-hidden cursor-pointer border-2 transition-all bg-card",
                    selectedGame === game.name ? 'border-primary' : 'border-transparent'
                )}
                onClick={() => onSelectGame(game.name)}
            >
                <div className="relative aspect-square bg-muted">
                    <Image src={game.image} alt={game.displayName} fill className="object-cover" data-ai-hint={game.dataAiHint}/>
                </div>
                <div className="p-3">
                    <h4 className="font-semibold text-center text-sm uppercase">{game.displayName}</h4>
                </div>
            </div>
        ))}
    </div>
);

const TournamentsGrid = ({ tournaments }: { tournaments: Tournament[] }) => {
    if (tournaments.length === 0) {
        return (
            <div className="text-center py-16 border border-dashed rounded-lg col-span-2">
                <h3 className="text-xl font-medium">No Upcoming Matches</h3>
                <p className="text-muted-foreground mt-2">Check back later or select another game.</p>
            </div>
        )
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tournaments.map((t) => (
                <Card key={t.id} className="border-border/50 hover:border-primary/50 transition-colors group">
                     <Link href={`/tournaments/${t.id}`}>
                        <div className="relative aspect-[16/10] bg-muted rounded-t-lg overflow-hidden">
                            <Image src={t.image} alt={t.name} fill className="object-cover transition-transform group-hover:scale-105" data-ai-hint={t.dataAiHint as string} />
                        </div>
                    </Link>
                    <CardContent className="p-3 bg-card rounded-b-lg">
                        <h4 className="font-semibold truncate group-hover:text-primary transition-colors">{t.name}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{format(new Date(t.startDate), "dd.MM.yy '•' HH:mm")}</p>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="font-normal gap-1"><Gamepad2 className="h-3 w-3" /> {t.format}</Badge>
                            <Badge variant="secondary" className="font-normal gap-1"><Trophy className="h-3 w-3" /> ${t.prizePool}</Badge>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};


// --- MAIN PAGE COMPONENT ---
export default function HomePage() {
  const [selectedUpcomingGame, setSelectedUpcomingGame] = useState<Game>('Free Fire');
  
  const upcomingTournaments = useMemo(() => {
    return mockTournaments.filter(
        t => t.status === 'upcoming' && t.game === selectedUpcomingGame
    );
  }, [selectedUpcomingGame]);

  return (
    <div className="bg-background text-foreground pb-24">
      <HomeHeader />
      <div className="container mx-auto px-4 mt-4">
        <div className="space-y-10">
          <FeaturedEvent />
          {liveTournaments.length > 0 && (
            <section>
              <SectionHeader title="Live/Ongoing" />
              <LiveEvents tournaments={liveTournaments} />
            </section>
          )}
          <section>
            <SectionHeader title="Upcoming Matches" actionText="All tournaments" actionHref="/tournaments" />
            <GameFilter selectedGame={selectedUpcomingGame} onSelectGame={setSelectedUpcomingGame} />
            <div className="mt-6">
                <TournamentsGrid tournaments={upcomingTournaments} />
            </div>
          </section>
          <section>
            <SectionHeader title="Our Supported Games" actionText="All games" actionHref="#" />
            <GamesList />
          </section>
          <section>
            <SectionHeader title="Top Players" actionText="Full Ranking" actionHref="#" />
            <TopPlayers />
          </section>
        </div>
      </div>
    </div>
  );
}
