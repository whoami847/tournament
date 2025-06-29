import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Game } from '@/types';

type Match = {
    tournament: string;
    game: Game;
    team1: { name: string; avatar: string, dataAiHint: string };
    team2: { name: string; avatar: string, dataAiHint: string };
    score1: number;
    score2: number;
    date: string;
    status: 'live' | 'victory' | 'defeat';
};

const liveMatch: Match = {
  tournament: 'Free Fire Pro Series',
  game: 'Free Fire',
  team1: { name: 'Team', avatar: 'https://placehold.co/48x48.png', dataAiHint: 'team logo' },
  team2: { name: 'Team', avatar: 'https://placehold.co/48x48.png', dataAiHint: 'team logo' },
  score1: 0,
  score2: 0,
  date: '04.04.2023',
  status: 'live',
};

const recentMatches: Match[] = [
  {
    tournament: 'PUBG Mobile Global Championship',
    game: 'PUBG',
    team1: { name: 'Team', avatar: 'https://placehold.co/48x48.png', dataAiHint: 'team logo' },
    team2: { name: 'Team', avatar: 'https://placehold.co/48x48.png', dataAiHint: 'team logo' },
    score1: 2,
    score2: 1,
    date: '07.03.2023',
    status: 'victory',
  },
  {
    tournament: 'COD:M Masters',
    game: 'COD: Mobile',
    team1: { name: 'Team', avatar: 'https://placehold.co/48x48.png', dataAiHint: 'team logo' },
    team2: { name: 'Team', avatar: 'https://placehold.co/48x48.png', dataAiHint: 'team logo' },
    score1: 1,
    score2: 2,
    date: '06.03.2023',
    status: 'defeat',
  },
   {
    tournament: 'MLBB Southeast Asia Cup',
    game: 'Mobile Legends',
    team1: { name: 'Team', avatar: 'https://placehold.co/48x48.png', dataAiHint: 'team logo' },
    team2: { name: 'Team', avatar: 'https://placehold.co/48x48.png', dataAiHint: 'team logo' },
    score1: 2,
    score2: 1,
    date: '07.03.2023',
    status: 'victory',
  },
];


const MatchCard = ({ match }: { match: Match }) => {
    const statusBadges = {
        live: <Badge className="bg-primary/80 text-primary-foreground border-none">Live</Badge>,
        victory: <Badge className="bg-green-500/80 text-green-50 border-none">Victory</Badge>,
        defeat: <Badge className="bg-red-500/80 text-red-50 border-none">Defeat</Badge>
    }

    return (
        <Card className="bg-card border-border/50 overflow-hidden">
            <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-muted-foreground">{match.tournament} &bull; {match.game}</p>
                    {statusBadges[match.status]}
                </div>
                <div className="flex items-center justify-between space-x-4">
                     <div className="flex flex-col items-center text-center gap-2 flex-1">
                        <Avatar className="h-12 w-12"><AvatarImage src={match.team1.avatar} data-ai-hint={match.team1.dataAiHint} /><AvatarFallback>T1</AvatarFallback></Avatar>
                        <span className="font-semibold text-sm truncate">{match.team1.name}</span>
                     </div>
                     <div className="text-3xl font-bold text-center flex items-center">
                        <span className={cn(match.score1 > match.score2 && "text-green-400")}>{match.score1}</span>
                        <span className="text-muted-foreground mx-3 text-lg">vs</span>
                        <span className={cn(match.score2 > match.score1 && "text-green-400")}>{match.score2}</span>
                     </div>
                     <div className="flex flex-col items-center text-center gap-2 flex-1">
                        <Avatar className="h-12 w-12"><AvatarImage src={match.team2.avatar} data-ai-hint={match.team2.dataAiHint} /><AvatarFallback>T2</AvatarFallback></Avatar>
                        <span className="font-semibold text-sm truncate">{match.team2.name}</span>
                     </div>
                </div>
                 <p className="text-center text-muted-foreground text-xs mt-4">{match.date}</p>
            </CardContent>
        </Card>
    );
};

export default function ProfilePage() {
  return (
    <div className="pb-24">
        {/* Header Section */}
        <div className="relative h-48 w-full">
            <Image
                src="https://placehold.co/800x300.png"
                alt="Profile banner"
                data-ai-hint="abstract background"
                fill
                className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            <div className="absolute top-14 right-4 sm:top-4">
                <Button variant="ghost" size="icon" className="bg-black/20 hover:bg-black/40">
                    <MoreHorizontal className="h-5 w-5" />
                </Button>
            </div>
            <h1 className="absolute top-16 left-4 text-2xl font-bold text-white sm:top-6">Profile</h1>
        </div>

        {/* Profile Info Section */}
        <div className="relative z-10 -mt-16 flex flex-col items-center text-center px-4">
            <div className="relative">
                <Avatar className="h-28 w-28 border-4 border-background">
                    <AvatarImage src="https://placehold.co/112x112.png" alt="Mapple" data-ai-hint="fantasy character" />
                    <AvatarFallback>M</AvatarFallback>
                </Avatar>
                <div className="absolute bottom-1 right-1 h-5 w-5 bg-teal-400 rounded-full border-2 border-background" />
            </div>
            <h2 className="mt-3 text-3xl font-bold">Mapple</h2>
            <p className="text-muted-foreground">Player</p>
        </div>
        
        {/* Tabs Navigation */}
        <div className="px-4 mt-6">
             <Tabs defaultValue="matches" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-transparent p-0 h-auto rounded-lg">
                    <TabsTrigger value="info" className="data-[state=active]:bg-card rounded-md">Information</TabsTrigger>
                    <TabsTrigger value="team" className="data-[state=active]:bg-card rounded-md">Team</TabsTrigger>
                    <TabsTrigger value="matches" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">Matches</TabsTrigger>
                    <TabsTrigger value="success" className="data-[state=active]:bg-card rounded-md">Achievements</TabsTrigger>
                </TabsList>
                <TabsContent value="matches" className="mt-6 space-y-6">
                    {/* Live Match */}
                    <div>
                         <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                            <span className="h-2 w-2 rounded-full bg-red-500 relative flex">
                               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            </span>
                            Live
                        </h3>
                        <MatchCard match={liveMatch} />
                    </div>

                    {/* Recent Matches */}
                    <div>
                        <div className="flex justify-between items-baseline mb-3">
                            <h3 className="text-lg font-semibold">Recent Matches</h3>
                            <span className="text-sm text-muted-foreground">{recentMatches.length} matches</span>
                        </div>
                        <div className="space-y-4">
                          {recentMatches.map((match, i) => <MatchCard key={i} match={match} />)}
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="info">
                    <Card><CardContent><p className="text-center text-muted-foreground p-8">Information not available.</p></CardContent></Card>
                </TabsContent>
                 <TabsContent value="team">
                    <Card><CardContent><p className="text-center text-muted-foreground p-8">Team details not available.</p></CardContent></Card>
                </TabsContent>
                 <TabsContent value="success">
                    <Card><CardContent><p className="text-center text-muted-foreground p-8">Achievements not available.</p></CardContent></Card>
                </TabsContent>
            </Tabs>
        </div>
    </div>
  );
}
