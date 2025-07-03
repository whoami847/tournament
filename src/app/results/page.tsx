
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useMemo, useState, useEffect } from 'react';
import type { Game, Team, Tournament, PlayerProfile, Match } from '@/types';
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
    const isUserTeam1 = match.team1.members?.some(m => m.gamerId === match.userTeam.members?.[0]?.gamerId);
    
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
    const [userMatches, setUserMatches] = useState<UserMatchResult[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch profile and tournaments data
    useEffect(() => {
        if (user?.uid) {
            const unsubProfile = getUserProfileStream(user.uid, setProfile);
            const unsubTournaments = getTournamentsStream(setTournaments);
            return () => {
                unsubProfile();
                unsubTournaments();
            };
        } else if (!authLoading) {
            setLoading(false); // Not logged in, stop loading
        }
    }, [user, authLoading]);

    // Process data once both profile and tournaments are loaded
    useEffect(() => {
        if (profile && tournaments.length > 0) {
            console.log("Processing matches: Profile and tournaments are loaded.");
            const currentUserGamerId = profile.gamerId;
            const matchesForUser: UserMatchResult[] = [];

            tournaments.forEach(tournament => {
                if (tournament.status === 'live' || tournament.status === 'completed') {
                    // Find the user's team in this specific tournament first
                    const userTeamInTournament = tournament.participants.find(p =>
                        p.members?.some(m => m.gamerId === currentUserGamerId)
                    );

                    if (userTeamInTournament) {
                        tournament.bracket.forEach(round => {
                            round.matches.forEach(match => {
                                const [team1, team2] = match.teams;
                                if (!team1 || !team2) return;

                                const isUserInMatch = team1.id === userTeamInTournament.id || team2.id === userTeamInTournament.id;
                                
                                if (isUserInMatch && (match.status === 'live' || match.status === 'completed')) {
                                    let resultStatus: UserMatchResult['status'];
                                    
                                    if (match.status === 'live') {
                                        resultStatus = 'live';
                                    } else { // 'completed'
                                        const userIsTeam1 = team1.id === userTeamInTournament.id;
                                        const userWon = (userIsTeam1 && match.scores[0] > match.scores[1]) || (!userIsTeam1 && match.scores[1] > match.scores[0]);
                                        resultStatus = userWon ? 'victory' : 'defeat';
                                    }

                                    matchesForUser.push({
                                        id: match.id,
                                        tournamentId: tournament.id,
                                        tournamentName: tournament.name,
                                        game: tournament.game,
                                        team1,
                                        team2,
                                        score1: match.scores[0],
                                        score2: match.scores[1],
                                        userTeam: userTeamInTournament,
                                        status: resultStatus,
                                    });
                                }
                            });
                        });
                    }
                }
            });

            console.log("User's filtered matches:", matchesForUser);

            // Sort matches to show live ones first
            const sortedMatches = matchesForUser.sort((a, b) => {
                if (a.status === 'live' && b.status !== 'live') return -1;
                if (b.status === 'live' && a.status !== 'live') return 1;
                return 0; // Can add date-based sorting here later
            });
            
            setUserMatches(sortedMatches);
            setLoading(false);
        } else if (!authLoading && (profile === null || tournaments.length > 0)) {
            // This handles the case where the user has a profile but no tournaments,
            // or is logged out but we've already tried fetching tournaments.
            setLoading(false);
        }
    }, [profile, tournaments, authLoading]);
    
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

    