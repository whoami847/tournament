"use client";

import Image from 'next/image';
import { useRef, useState, useMemo, useEffect } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, ChevronRight, Users, DollarSign, Gamepad2, Trophy } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Link from 'next/link';
import { getTournamentsStream } from '@/lib/tournaments-service';
import { getBannersStream } from '@/lib/banners-service';
import { getGamesStream } from '@/lib/games-service';
import type { Tournament, Game, FeaturedBanner, GameCategory } from '@/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/hooks/use-auth';


// --- MOCK DATA ---

const topPlayersData = [
    { rank: 1, name: 'Jonathan Gaming', role: 'Player', winrate: '95%', games: 127, avatar: 'https://placehold.co/48x48.png', dataAiHint: 'male gamer headset',},
    { rank: 2, name: 'ScoutOP', role: 'Player', winrate: '87%', games: 98, avatar: 'https://placehold.co/48x48.png', dataAiHint: 'male gamer intense',},
    { rank: 3, name: 'Mortal', role: 'Player', winrate: '82.5%', games: 64, avatar: 'https://placehold.co/48x48.png', dataAiHint: 'male gamer smiling',},
];


// --- SUB-COMPONENTS ---
const notifications = [
    { title: "New Tournament Alert", description: "Free Fire World Series starts tomorrow!", time: "5m ago" },
    { title: "Team Invite", description: "Cosmic Knights has invited you to join their team.", time: "1h ago" },
    { title: "Match Reminder", description: "Your match vs Vortex Vipers starts in 30 minutes.", time: "2h ago" },
];

const HomeHeader = () => {
    const { user } = useAuth();
    const displayName = user?.displayName || user?.email?.split('@')[0] || 'Player';
    const fallback = displayName.charAt(0).toUpperCase();

    return (
        <header className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary">
                <AvatarImage src={user?.photoURL || ''} alt={displayName} data-ai-hint="wizard character" />
                <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
            <div><h1 className="font-bold">{displayName}</h1><p className="text-sm text-muted-foreground">Player</p></div>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative rounded-full bg-card h-10 w-10">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {notifications.map((n, i) => (
                        <DropdownMenuItem key={i} className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                            <p className="font-semibold">{n.title}</p>
                            <p className="text-xs text-muted-foreground">{n.description}</p>
                            <p className="text-xs text-muted-foreground self-end">{n.time}</p>
                        </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="justify-center">
                        <Link href="#" className="text-sm font-medium text-primary">View all notifications</Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
};

const SectionHeader = ({ title, actionText, actionHref }: { title: string, actionText?: string, actionHref?: string }) => (
  <div className="flex justify-between items-baseline mb-4">
    <h2 className="text-xl font-bold tracking-tight">{title}</h2>
    {actionText && actionHref && <Link href={actionHref} className="text-sm font-medium text-primary hover:underline">{actionText}</Link>}
  </div>
);

const FeaturedEvent = ({ banners }: { banners: FeaturedBanner[] }) => {
    const plugin = useRef(
        Autoplay({ delay: 3000, stopOnInteraction: true })
    );
    
    if (banners.length === 0) {
        return (
            <Card className="relative w-full h-48 border-none overflow-hidden rounded-2xl bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">No featured events available.</p>
            </Card>
        )
    }

    return (
        <Carousel
            plugins={[plugin.current]}
            className="w-full"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
        >
            <CarouselContent>
                {banners.map((event, i) => (
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
                        <Link href={`/tournaments/${event.id}`}>
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
                        </Link>
                    </CarouselItem>
                ))}
            </CarouselContent>
        </Carousel>
    </div>
);

const GamesList = ({ games }: { games: GameCategory[] }) => (
    <div className="-mx-4">
        <Carousel opts={{ align: "start", loop: false }} className="w-full">
            <CarouselContent className="pl-4">
            {games.map((game, i) => (
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

const GameFilter = ({ games }: { games: GameCategory[] }) => (
    <div className="grid grid-cols-2 gap-4 mb-6">
        {games.map((game) => (
            <Link 
                key={game.id} 
                href={`/tournaments?game=${encodeURIComponent(game.name)}`} 
                className="rounded-xl overflow-hidden cursor-pointer border-2 border-transparent transition-all bg-card hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary"
            >
                <div className="relative aspect-square bg-muted">
                    <Image src={game.image} alt={game.name} fill className="object-cover" data-ai-hint={game.dataAiHint}/>
                </div>
                <div className="p-3">
                    <h4 className="font-semibold text-center text-sm uppercase">{game.name}</h4>
                </div>
            </Link>
        ))}
    </div>
);


// --- MAIN PAGE COMPONENT ---
export default function HomePage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [banners, setBanners] = useState<FeaturedBanner[]>([]);
  const [games, setGames] = useState<GameCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeTournaments = getTournamentsStream((data) => {
      setTournaments(data);
      setLoading(false);
    });

    const unsubscribeBanners = getBannersStream((data) => {
        setBanners(data);
    });

    const unsubscribeGames = getGamesStream((data) => {
        setGames(data);
    });

    return () => {
        unsubscribeTournaments();
        unsubscribeBanners();
        unsubscribeGames();
    };
  }, []);

  const liveTournaments = useMemo(() => {
    return tournaments.filter(t => t.status === 'live');
  }, [tournaments]);


  return (
    <div className="bg-background text-foreground pb-24">
      <HomeHeader />
      <div className="container mx-auto px-4 mt-4">
        <div className="space-y-10">
          <FeaturedEvent banners={banners} />
          {!loading && liveTournaments.length > 0 && (
            <section>
              <SectionHeader title="Live/Ongoing" />
              <LiveEvents tournaments={liveTournaments} />
            </section>
          )}
          <section>
            <SectionHeader title="Upcoming Matches" actionText="All tournaments" actionHref="/tournaments" />
            <GameFilter games={games.slice(0, 4)} />
          </section>
          <section>
            <SectionHeader title="Our Supported Games" actionText="All games" actionHref="#" />
            <GamesList games={games} />
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
