'use client';

import { useAuth } from '@/hooks/use-auth';
import { useMemo, useState, useEffect } from 'react';
import type { Game, Team, Tournament, PlayerProfile } from '@/types';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from '@/lib/utils';
import { ShieldOff, Loader2 } from 'lucide-react';
import { getTournamentsStream } from '@/lib/tournaments-service';
import { getUserProfileStream } from '@/lib/users-service';

// Define a new type for user-specific match results
type UserMatchResult = {
    id: string; // match id
    tournamentId: string;
    tournamentName: string;
    game: Game;
    team1: Team;
    team2: Team;
    score1: number;
    score2: number;
    userTeam: Team;
    status: 'live' | 'victory' | 'defeat' | 'pending';
};

// Reusable MatchCard component
const MatchCard = ({ match }: { match: UserMatchResult }) => {
    const isUserTeam1 = match.team1.id === match.userTeam.id;
    
    const statusBadges = {
        live: <Badge className="bg-red-500/90 text-white border-none animate-pulse">Live</Badge>,
        victory: <Badge className="bg-green-500/80 text-green-50 border-none">Victory</Badge>,
        defeat: <Badge className="bg-destructive/80 text-destructive-foreground border-none">Defeat</Badge>,
        pending: <Badge variant="outline">Pending</Badge>
    };

    const isWinner = match.status === 'victory';

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
                        <Avatar className={cn("h-12 w-12", isUserTeam1 && isWinner && "border-2 border-amber-400", isUserTeam1 && match.status === 'defeat' && "opacity-60")}>
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
                        <Avatar className={cn("h-12 w-12", !isUserTeam1 && isWinner && "border-2 border-amber-400", !isUserTeam1 && match.status === 'defeat' && "opacity-60")}>
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
    const { user, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState<PlayerProfile | null>(null);
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return; // Wait for authentication to resolve

        if (user) {
            setDataLoading(true);
            const unsubProfile = getUserProfileStream(user.uid, (data) => {
                setProfile(data);
                // We'll handle loading state together with tournaments
            });
            const unsubTournaments = getTournamentsStream((data) => {
                setTournaments(data);
                setDataLoading(false); // Set loading to false once we have tournaments
            });
            return () => {
                unsubProfile();
                unsubTournaments();
            };
        } else {
            // Not logged in
            setDataLoading(false);
        }
    }, [user, authLoading]);

    const userMatches = useMemo(() => {
        // Wait until we have all the necessary data
        if (!profile || tournaments.length === 0) {
            return [];
        }

        const allMatches: UserMatchResult[] = [];

        for (const tournament of tournaments) {
            // We only care about tournaments the user participated in that are live or completed.
            if (tournament.status === 'upcoming') {
                continue;
            }

            const userTeam = tournament.participants.find(p => 
                p.members?.some(m => m.gamerId === profile.gamerId)
            );

            if (!userTeam) continue;

            for (const round of tournament.bracket) {
                for (const match of round.matches) {
                    if (!match.teams[0] || !match.teams[1]) continue;

                    const isUserInMatch = match.teams.some(t => t?.id === userTeam.id);
                    if (!isUserInMatch) continue;

                    let status: UserMatchResult['status'] = 'pending';
                    
                    if (match.status === 'live') {
                        status = 'live';
                    } else if (match.status === 'completed') {
                        const userIsTeam1 = match.teams[0]?.id === userTeam.id;
                        const userTeamWon = (userIsTeam1 && match.scores[0] > match.scores[1]) || (!userIsTeam1 && match.scores[1] > match.scores[0]);
                        status = userTeamWon ? 'victory' : 'defeat';
                    } else if (tournament.status === 'completed' && match.status !== 'completed') {
                        // If tournament is over but this match wasn't explicitly marked as won,
                        // it's considered a loss for history purposes.
                        status = 'defeat';
                    }

                    // Only show matches that are live or have a definitive outcome.
                    if (status === 'live' || status === 'victory' || status === 'defeat') {
                        allMatches.push({
                            id: match.id,
                            tournamentId: tournament.id,
                            tournamentName: tournament.name,
                            game: tournament.game,
                            team1: match.teams[0],
                            team2: match.teams[1],
                            score1: match.scores[0],
                            score2: match.scores[1],
                            userTeam,
                            status,
                        });
                    }
                }
            }
        }
        
        return allMatches.sort((a,b) => {
            if (a.status === 'live' && b.status !== 'live') return -1;
            if (b.status === 'live' && a.status !== 'live') return 1;
            // Potentially add date sorting here later if needed
            return 0;
        });
    }, [profile, tournaments]);
    
    const loading = authLoading || dataLoading;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen w-screen bg-background fixed inset-0 z-50">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!user) {
         return (
            <div className="container mx-auto px-4 py-8 md:pb-8 pb-24 flex flex-col items-center justify-center min-h-[60vh] text-center">
                <h2 className="text-2xl font-bold">Please log in</h2>
                <p className="text-muted-foreground mt-2 max-w-md">
                   You need to be logged in to see your match history.
                </p>
            </div>
        );
    }
    
    if (!loading && userMatches.length === 0) {
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

    const liveMatch = userMatches.find(m => m.status === 'live');
    const recentMatches = userMatches.filter(m => m.status !== 'live');
    
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
