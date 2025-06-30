"use client";

import Image from 'next/image';
import { useRef } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, ChevronRight, Users, DollarSign, Gamepad2 } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Link from 'next/link';
import { mockTournaments } from '@/lib/data';
import type { Tournament } from '@/types';
import { format } from 'date-fns';

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
const upcomingTournaments = mockTournaments.filter(t => t.status === 'upcoming');


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

const TournamentTag = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
    <div className="flex items-center gap-1 text-xs text-muted-foreground bg-card py-1 px-2 rounded-md">
        {icon}
        <span>{text}</span>
    </div>
);

const TournamentsGrid = ({tournaments}: {tournaments: Tournament[]}) => (
  <div className="grid grid-cols-2 gap-4">
    {tournaments.map((t, i) => (
      <Card key={i} className="border-border/50 bg-transparent overflow-hidden rounded-xl">
        <div className="relative h-48">
            <Image src={t.image} alt={t.name} fill className="object-cover" data-ai-hint={t.dataAiHint as string} />
            {t.status === 'upcoming' && <Badge className="absolute top-2 right-2 bg-primary/80 border-none text-xs">Open</Badge>}
        </div>
        <CardContent className="p-3 bg-card">
            <h4 className="font-bold truncate">{t.name}</h4>
            <p className="text-xs text-muted-foreground mb-2">{format(new Date(t.startDate), "dd.MM.yy '•' HH:mm")}</p>
        </CardContent>
      </Card>
    ))}
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

// --- MAIN PAGE COMPONENT ---
export default function HomePage() {
  return (
    <div className="bg-background text-foreground pb-24">
      <HomeHeader />
      <div className="container mx-auto px-4 mt-4">
        <div className="space-y-10">
          <FeaturedEvent />
          <section>
            <SectionHeader title="Live/Ongoing" />
            <LiveEvents tournaments={liveTournaments} />
          </section>
          <section>
            <SectionHeader title="Upcoming Matches" actionText="All tournaments" actionHref="/tournaments" />
            <TournamentsGrid tournaments={upcomingTournaments} />
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
