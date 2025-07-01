'use client';

import { useAuth } from '@/hooks/use-auth';
import { useMemo } from 'react';
import type { Game, Team } from '@/types';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from '@/lib/utils';
import { ShieldOff } from 'lucide-react';

// Define a new type for user-specific match results
type UserMatchResult = {
    id: string;
    tournamentName: string;
    game: Game;
    team1: Team;
    team2: Team;
    score1: number;
    score2: number;
    userTeamName: string; // The name of the team the user was on
    status: 'live' | 'victory' | 'defeat';
};

// Create mock data for a specific user, e.g., 'Mapple'.
// In a real app, this would be fetched from Firestore based on the user's ID.
const mockUserMatches: UserMatchResult[] = [
    {
        id: 'match1',
        tournamentName: 'Free Fire Pro Series',
        game: 'Free Fire',
        team1: { id: 't1', name: 'Cosmic Knights', avatar: 'https://placehold.co/48x48.png', dataAiHint: 'knight helmet' },
        team2: { id: 't2', name: 'Vortex Vipers', avatar: 'https://placehold.co/48x48.png', dataAiHint: 'viper snake' },
        score1: 0,
        score2: 0,
        userTeamName: 'Cosmic Knights',
        status: 'live',
    },
    {
        id: 'match2',
        tournamentName: 'PUBG Mobile Global Championship',
        game: 'PUBG',
        team1: { id: 't1', name: 'Cosmic Knights', avatar: 'https://placehold.co/48x48.png', dataAiHint: 'knight helmet' },
        team2: { id: 't3', name: 'Rogue Warriors', avatar: 'https://placehold.co/48x48.png', dataAiHint: 'warrior axe' },
        score1: 2,
        score2: 1,
        userTeamName: 'Cosmic Knights',
        status: 'victory',
    },
    {
        id: 'match3',
        tournamentName: 'COD:M Masters',
        game: 'COD: Mobile',
        team1: { id: 't4', name: 'Team Shadow', avatar: 'https://placehold.co/48x48.png', dataAiHint: 'shadow hooded' },
        team2: { id: 't1', name: 'Cosmic Knights', avatar: 'https://placehold.co/48x48.png', dataAiHint: 'knight helmet' },
        score1: 2,
        score2: 1,
        userTeamName: 'Cosmic Knights',
        status: 'defeat',
    },
];

// Reusable MatchCard component
const MatchCard = ({ match }: { match: UserMatchResult }) => {
    const isUserTeam1 = match.team1.name === match.userTeamName;
    const userWon = (match.status === 'victory' && isUserTeam1) || (match.status === 'defeat' && !isUserTeam1);
    
    const statusBadges = {
        live: <Badge className="bg-red-500/90 text-white border-none animate-pulse">Live</Badge>,
        victory: <Badge className="bg-green-500/80 text-green-50 border-none">Victory</Badge>,
        defeat: <Badge className="bg-destructive/80 text-destructive-foreground border-none">Defeat</Badge>
    };

    return (
        <Card className="bg-card border-border/50 overflow-hidden">
            <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <p className="text-sm font-semibold">{match.tournamentName}</p>
                        <p className="text-xs text-muted-foreground">{match.game}</p>
                    </div>
                    {statusBadges[match.status]}
                </div>
                <div className="flex items-center justify-between space-x-4">
                     <div className="flex flex-col items-center text-center gap-2 flex-1">
                        <Avatar className={cn("h-12 w-12", match.status !== 'live' && isUserTeam1 && userWon && "border-2 border-amber-400", match.status !== 'live' && isUserTeam1 && !userWon && "opacity-60")}>
                            <AvatarImage src={match.team1.avatar} data-ai-hint={match.team1.dataAiHint} />
                            <AvatarFallback>{match.team1.name.substring(0,2)}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-sm truncate">{match.team1.name}</span>
                     </div>
                     <div className="text-3xl font-bold text-center flex items-center">
                        <span className={cn(match.score1 > match.score2 && "text-foreground")}>{match.score1}</span>
                        <span className="text-muted-foreground mx-3 text-lg">vs</span>
                        <span className={cn(match.score2 > match.score1 && "text-foreground")}>{match.score2}</span>
                     </div>
                     <div className="flex flex-col items-center text-center gap-2 flex-1">
                        <Avatar className={cn("h-12 w-12", match.status !== 'live' && !isUserTeam1 && userWon && "border-2 border-amber-400", match.status !== 'live' && !isUserTeam1 && !userWon && "opacity-60")}>
                            <AvatarImage src={match.team2.avatar} data-ai-hint={match.team2.dataAiHint} />
                            <AvatarFallback>{match.team2.name.substring(0,2)}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-sm truncate">{match.team2.name}</span>
                     </div>
                </div>
            </CardContent>
        </Card>
    );
};


// Main page component
export default function ResultsPage() {
    const { user } = useAuth();

    // In a real app, this data would be fetched based on the user's ID.
    // For now, we are filtering mock data based on the logged-in user's display name.
    const userMatches = useMemo(() => {
        if (user?.displayName === "Mapple") { // Simulate data for a specific user
            return mockUserMatches;
        }
        return [];
    }, [user]);

    const liveMatch = userMatches.find(m => m.status === 'live');
    const recentMatches = userMatches.filter(m => m.status !== 'live');

    if (!user) {
        return null; // Or a loading indicator
    }

    if (userMatches.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8 md:pb-8 pb-24 flex flex-col items-center justify-center min-h-[60vh] text-center">
                <ShieldOff className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h2 className="text-2xl font-bold">No Match History</h2>
                <p className="text-muted-foreground mt-2 max-w-md">
                    You haven't participated in any matches yet. Join a tournament to see your match history here.
                </p>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto px-4 py-8 md:pb-8 pb-24">
            <h1 className="text-3xl font-bold mb-6">My Match History</h1>
            <div className="space-y-8">
                {liveMatch && (
                    <div>
                         <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                            <span className="h-2 w-2 rounded-full bg-red-500 relative flex">
                               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            </span>
                            Live Match
                        </h3>
                        <MatchCard match={liveMatch} />
                    </div>
                )}

                {recentMatches.length > 0 && (
                     <div>
                        <h3 className="text-lg font-semibold mb-3">Recent Matches</h3>
                        <div className="space-y-4">
                          {recentMatches.map((match) => <MatchCard key={match.id} match={match} />)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}