'use client';

import { useState, useMemo, useEffect } from 'react';
import { getRegistrationsStream } from '@/lib/registrations-service';
import type { RegistrationLog } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import type { Game } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

type TeamTypeFilter = RegistrationLog['teamType'] | 'all';

const RegistrationHistorySkeleton = () => (
    <Card>
        <CardHeader>
            <CardTitle>Registration History</CardTitle>
            <CardDescription>View a log of all team/player registrations for tournaments. Joining is automatic.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                <div className="flex gap-4">
                    <Skeleton className="h-10 w-1/4" />
                    <Skeleton className="h-10 w-1/4" />
                </div>
                <Skeleton className="h-48 w-full" />
            </div>
        </CardContent>
    </Card>
);

export default function AdminRequestsPage() {
    const [registrations, setRegistrations] = useState<RegistrationLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGame, setSelectedGame] = useState<Game | 'all'>('all');
    const [selectedTeamType, setSelectedTeamType] = useState<TeamTypeFilter>('all');

    useEffect(() => {
        const unsubscribe = getRegistrationsStream((data) => {
            setRegistrations(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredRequests = useMemo(() => {
        return registrations.filter(req => {
            const gameMatch = selectedGame === 'all' || req.game === selectedGame;
            const teamTypeMatch = selectedTeamType === 'all' || req.teamType === selectedTeamType;
            return gameMatch && teamTypeMatch;
        });
    }, [registrations, selectedGame, selectedTeamType]);

    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', className?: string, text: string }> = {
        approved: { variant: 'default', className: 'bg-green-500/80 border-transparent text-green-50', text: 'Joined' },
    };

    const games = useMemo(() => Array.from(new Set(registrations.map((req) => req.game))), [registrations]);
    const teamTypes = useMemo(() => Array.from(new Set(registrations.map((req) => req.teamType))), [registrations]);

    const handleGameSelect = (game: Game) => {
        setSelectedGame((prev) => (prev === game ? 'all' : game));
    };

    const handleTeamTypeSelect = (type: RegistrationLog['teamType']) => {
        setSelectedTeamType((prev) => (prev === type ? 'all' : type));
    };

    if (loading) {
        return <RegistrationHistorySkeleton />;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Registration History</CardTitle>
                <CardDescription>View a log of all team/player registrations for tournaments. Joining is automatic.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2 p-1 bg-muted rounded-full flex-wrap self-start">
                        {games.map(game => (
                            <Button key={game} variant={selectedGame === game ? 'default' : 'ghost'} size="sm" className="rounded-full h-8 px-4" onClick={() => handleGameSelect(game)}>{game}</Button>
                        ))}
                    </div>
                     <div className="flex items-center gap-2 p-1 bg-muted rounded-full flex-wrap self-start">
                        {teamTypes.map(type => (
                            <Button key={type} variant={selectedTeamType === type ? 'default' : 'ghost'} size="sm" className="rounded-full h-8 px-4" onClick={() => handleTeamTypeSelect(type)}>{type}</Button>
                        ))}
                    </div>
                </div>
                
                {/* Desktop Table */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tournament</TableHead>
                                <TableHead>Game</TableHead>
                                <TableHead>Team Type</TableHead>
                                <TableHead>Players</TableHead>
                                <TableHead>Joined At</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRequests.length > 0 ? filteredRequests.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell>
                                        <div className="font-medium">{req.tournamentName}</div>
                                        <div className="text-sm text-muted-foreground">{req.teamName}</div>
                                    </TableCell>
                                    <TableCell>{req.game}</TableCell>
                                    <TableCell><Badge variant="outline">{req.teamType}</Badge></TableCell>
                                    <TableCell>
                                        <ul className="space-y-1">
                                            {req.players.map((p, i) => (
                                                <li key={i}>
                                                    <span className="font-semibold">{p.name}</span> <span className="text-muted-foreground">({p.gamerId})</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </TableCell>
                                    <TableCell>
                                        {formatDistanceToNow(req.registeredAt.toDate(), { addSuffix: true })}
                                    </TableCell>
                                    <TableCell>
                                        <Badge 
                                            variant={statusConfig[req.status]?.variant ?? 'secondary'}
                                            className={statusConfig[req.status]?.className}
                                        >
                                            {statusConfig[req.status]?.text ?? 'Unknown'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">No registrations found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile Card List */}
                <div className="md:hidden space-y-4">
                    {filteredRequests.length > 0 ? filteredRequests.map((req) => (
                        <div key={req.id} className="bg-muted/20 p-4 rounded-lg border">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="font-semibold">{req.tournamentName}</p>
                                    <p className="text-sm text-muted-foreground">{req.teamName}</p>
                                     <div className="flex gap-2 mt-2">
                                        <Badge variant="secondary">{req.game}</Badge>
                                        <Badge variant="outline">{req.teamType}</Badge>
                                    </div>
                                </div>
                                <Badge
                                    variant={statusConfig[req.status]?.variant ?? 'secondary'}
                                    className={statusConfig[req.status]?.className}
                                >
                                    {statusConfig[req.status]?.text ?? 'Unknown'}
                                </Badge>
                            </div>

                            <div className="space-y-2 mb-4">
                                <h4 className="text-sm font-semibold text-muted-foreground">Players</h4>
                                {req.players.map((p, i) => (
                                     <div key={i} className="text-sm bg-background/50 p-2 rounded-md border">
                                        <span className="font-medium text-foreground">{p.name}</span> <span className="text-muted-foreground text-xs">/ ID: {p.gamerId}</span>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="flex justify-between items-center text-xs text-muted-foreground pt-4 border-t border-muted-foreground/20">
                                <span>
                                    {formatDistanceToNow(req.registeredAt.toDate(), { addSuffix: true })}
                                </span>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-16 border border-dashed rounded-lg">
                            <h3 className="text-xl font-medium">No Registrations Found</h3>
                            <p className="text-muted-foreground mt-2">Try adjusting your filters or wait for new registrations.</p>
                        </div>
                    )}
                </div>

                {registrations.length > 0 && filteredRequests.length === 0 && (
                     <div className="text-center py-16 border border-dashed rounded-lg">
                        <h3 className="text-xl font-medium">No Registrations Found</h3>
                        <p className="text-muted-foreground mt-2">Try adjusting your filters.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
