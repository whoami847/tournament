'use client';

import { useState, useMemo } from 'react';
import { mockJoinRequests } from '@/lib/admin-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import type { Game } from '@/types';

type TeamType = 'all' | 'Solo' | 'Duo' | 'Squad';

export default function AdminRequestsPage() {
    const [selectedGame, setSelectedGame] = useState<Game | 'all'>('all');
    const [selectedTeamType, setSelectedTeamType] = useState<TeamType>('all');

    const filteredRequests = useMemo(() => {
        return mockJoinRequests.filter(req => {
            const gameMatch = selectedGame === 'all' || req.game === selectedGame;
            const teamTypeMatch = selectedTeamType === 'all' || req.teamType === selectedTeamType;
            return gameMatch && teamTypeMatch;
        });
    }, [selectedGame, selectedTeamType]);

    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', className?: string, text: string }> = {
        approved: { variant: 'default', className: 'bg-green-500/80 border-transparent text-green-50', text: 'Joined' },
    };

    const games: Game[] = ['Free Fire', 'PUBG', 'Mobile Legends', 'COD: Mobile'];
    const teamTypes: Exclude<TeamType, 'all'>[] = ['Solo', 'Duo', 'Squad'];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Registration History</CardTitle>
                <CardDescription>View a log of all team/player registrations for tournaments. Joining is automatic.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2 p-1 bg-muted rounded-full flex-wrap self-start">
                        <Button variant={selectedGame === 'all' ? 'default' : 'ghost'} size="sm" className="rounded-full h-8 px-4" onClick={() => setSelectedGame('all')}>All Games</Button>
                        {games.map(game => (
                            <Button key={game} variant={selectedGame === game ? 'default' : 'ghost'} size="sm" className="rounded-full h-8 px-4" onClick={() => setSelectedGame(game)}>{game}</Button>
                        ))}
                    </div>
                     <div className="flex items-center gap-2 p-1 bg-muted rounded-full flex-wrap self-start">
                        <Button variant={selectedTeamType === 'all' ? 'default' : 'ghost'} size="sm" className="rounded-full h-8 px-4" onClick={() => setSelectedTeamType('all')}>All Types</Button>
                        {teamTypes.map(type => (
                            <Button key={type} variant={selectedTeamType === type ? 'default' : 'ghost'} size="sm" className="rounded-full h-8 px-4" onClick={() => setSelectedTeamType(type)}>{type}</Button>
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
                            {filteredRequests.map((req) => (
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
                                        {formatDistanceToNow(new Date(req.requestedAt), { addSuffix: true })}
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
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile Card List */}
                <div className="md:hidden space-y-4">
                    {filteredRequests.map((req) => (
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
                                    {formatDistanceToNow(new Date(req.requestedAt), { addSuffix: true })}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredRequests.length === 0 && (
                     <div className="text-center py-16 border border-dashed rounded-lg">
                        <h3 className="text-xl font-medium">No Registrations Found</h3>
                        <p className="text-muted-foreground mt-2">Try adjusting your filters.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
