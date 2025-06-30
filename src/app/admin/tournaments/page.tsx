'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { mockTournaments } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Tournament } from '@/types';

export default function AdminTournamentsPage() {
    const [tournaments, setTournaments] = useState<Tournament[]>(mockTournaments);
    const [selectedStatus, setSelectedStatus] = useState<'live' | 'upcoming' | 'completed'>('upcoming');

    const filteredTournaments = useMemo(() => {
        return tournaments.filter((tournament: Tournament) => tournament.status === selectedStatus);
    }, [tournaments, selectedStatus]);

    const handleDelete = (tournamentId: string) => {
        setTournaments(prev => prev.filter(t => t.id !== tournamentId));
    };

    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', className?: string }> = {
      upcoming: { variant: 'secondary' },
      live: { variant: 'destructive' },
      completed: { variant: 'default', className: 'bg-green-500 text-primary-foreground border-transparent hover:bg-green-600' },
    };
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Tournaments</CardTitle>
                    <CardDescription>Manage all tournaments in the app.</CardDescription>
                </div>
                <Button asChild size="sm">
                    <Link href="/create-tournament">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Tournament
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2 p-1 bg-muted rounded-full flex-wrap mb-6 self-start">
                    <Button variant={selectedStatus === 'upcoming' ? 'default' : 'ghost'} size="sm" className="rounded-full h-8 px-4 capitalize" onClick={() => setSelectedStatus('upcoming')}>Upcoming</Button>
                    <Button variant={selectedStatus === 'live' ? 'default' : 'ghost'} size="sm" className="rounded-full h-8 px-4 capitalize" onClick={() => setSelectedStatus('live')}>Live</Button>
                    <Button variant={selectedStatus === 'completed' ? 'default' : 'ghost'} size="sm" className="rounded-full h-8 px-4 capitalize" onClick={() => setSelectedStatus('completed')}>Completed</Button>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Game</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Participants</TableHead>
                                <TableHead>Prize Pool</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTournaments.map((tournament) => {
                                const config = statusConfig[tournament.status] ?? { variant: 'secondary' };
                                return (
                                <TableRow key={tournament.id}>
                                    <TableCell className="font-medium">{tournament.name}</TableCell>
                                    <TableCell>{tournament.game}</TableCell>
                                    <TableCell>
                                        <Badge variant={config.variant} className={`capitalize ${config.className ?? ''}`}>
                                            {tournament.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{tournament.teamsCount} / {tournament.maxTeams}</TableCell>
                                    <TableCell>${tournament.prizePool}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/tournaments/${tournament.id}/edit`}>Edit</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/tournaments/${tournament.id}`}>View Details</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(tournament.id)}>Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile Card List */}
                <div className="md:hidden space-y-4">
                     {filteredTournaments.map((tournament) => {
                        const config = statusConfig[tournament.status] ?? { variant: 'secondary' };
                        return (
                        <div key={tournament.id} className="bg-muted/20 p-4 rounded-lg border">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold">{tournament.name}</p>
                                    <p className="text-sm text-muted-foreground">{tournament.game}</p>
                                </div>
                                 <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                            <Link href={`/admin/tournaments/${tournament.id}/edit`}>Edit</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/tournaments/${tournament.id}`}>View Details</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(tournament.id)}>Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                             <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground pt-4 border-t border-muted-foreground/20">
                                <Badge variant={config.variant} className={`capitalize ${config.className ?? ''}`}>
                                    {tournament.status}
                                </Badge>
                                <div className="text-right">
                                    <p className="font-medium text-foreground">{tournament.teamsCount} / {tournament.maxTeams}</p>
                                    <p className="text-xs">Participants</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-foreground">${tournament.prizePool}</p>
                                    <p className="text-xs">Prize Pool</p>
                                </div>
                            </div>
                        </div>
                    )})}
                </div>
            </CardContent>
        </Card>
    );
}
