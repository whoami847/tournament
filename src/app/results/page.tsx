'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { getTournamentsStream } from '@/lib/tournaments-service';
import type { Tournament, PlayerProfile } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Calendar, Award, Trophy, Loader2 } from 'lucide-react';

const MatchHistoryCard = ({ tournament, profile }: { tournament: Tournament, profile: PlayerProfile }) => {
    const userTeam = tournament.participants.find(p => p.members?.some(m => m.gamerId === profile.gamerId));
    let finalRank: string = 'Participant';

    if (tournament.status === 'completed' && userTeam) {
        const bracket = tournament.bracket;
        if (bracket && bracket.length > 0) {
            const finalRound = bracket[bracket.length - 1];
            if (finalRound && finalRound.matches.length === 1) {
                const finalMatch = finalRound.matches[0];
                if (finalMatch.status === 'completed') {
                    const winner = finalMatch.scores[0] > finalMatch.scores[1] ? finalMatch.teams[0] : finalMatch.teams[1];
                    const loser = finalMatch.scores[0] < finalMatch.scores[1] ? finalMatch.teams[0] : finalMatch.teams[1];

                    if (winner?.id === userTeam.id) {
                        finalRank = 'Winner';
                    } else if (loser?.id === userTeam.id) {
                        finalRank = 'Runner-up';
                    }
                }
            }
        }
    } else if (tournament.status !== 'completed' && userTeam) {
        finalRank = 'Ongoing';
    }

    return (
        <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-4 p-4">
                <Image src={tournament.image} alt={tournament.name} width={80} height={80} className="rounded-lg aspect-square object-cover" data-ai-hint={tournament.dataAiHint} />
                <div className="flex-1">
                    <CardTitle className="text-base">{tournament.name}</CardTitle>
                    <CardDescription>{tournament.game}</CardDescription>
                    <Badge variant="outline" className="mt-2">{finalRank}</Badge>
                </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2 text-sm">
                <div className="flex justify-between items-center text-muted-foreground">
                    <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Date</span>
                    <span className="font-medium text-foreground">{format(new Date(tournament.startDate), 'PPP')}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                    <span className="flex items-center gap-2"><Award className="h-4 w-4" /> Kills/Points</span>
                    <span className="font-medium text-foreground">N/A</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                    <span className="flex items-center gap-2"><Trophy className="h-4 w-4" /> Final Rank</span>
                    <span className="font-medium text-foreground">{finalRank}</span>
                </div>
            </CardContent>
        </Card>
    );
};

export default function ResultsPage() {
    const { profile, loading: authLoading } = useAuth();
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        if (profile?.gamerId) {
            const unsubscribe = getTournamentsStream((allTournaments) => {
                const userTournaments = allTournaments.filter(t => 
                    t.participants.some(p => p.members?.some(m => m.gamerId === profile.gamerId))
                ).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
                
                setTournaments(userTournaments);
                setLoading(false);
            });
            return () => unsubscribe();
        } else {
            setLoading(false);
        }
    }, [profile, authLoading]);
    
    if (loading || authLoading) {
        return (
            <div className="container mx-auto px-4 py-8 md:pb-8 pb-24 flex justify-center items-center h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    if (!profile) {
        return (
            <div className="container mx-auto px-4 py-8 md:pb-8 pb-24 text-center h-[60vh] flex flex-col justify-center items-center">
                <h2 className="text-2xl font-bold">Please log in</h2>
                <p className="text-muted-foreground mt-2">Log in to see your match history.</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 md:pb-8 pb-24">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Match History</h1>
                <p className="text-muted-foreground">A record of all the tournaments you've participated in.</p>
            </header>
            
            {tournaments.length === 0 ? (
                 <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                        You haven't participated in any matches yet.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {tournaments.map(tournament => (
                        <MatchHistoryCard key={tournament.id} tournament={tournament} profile={profile} />
                    ))}
                </div>
            )}
        </div>
    );
}
