'use client';

import { useState, useMemo } from 'react';
import { mockTournaments } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Tournament } from '@/types';

export default function AdminTournamentsPage() {
    const [selectedStatus, setSelectedStatus] = useState<'live' | 'upcoming' | 'completed'>('upcoming');

    const filteredTournaments = useMemo(() => {
        return mockTournaments.filter((tournament: Tournament) => tournament.status === selectedStatus);
    }, [selectedStatus]);

    const statusVariantMap: { [key: string]: 'default' | 'secondary' | 'destructive' } = {
        upcoming: 'secondary',
        live: 'default',
        completed: 'destructive',
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Tournaments</CardTitle>
                <CardDescription>Manage all tournaments in the app.</CardDescription>
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
                            {filteredTournaments.map((tournament) => (
                                <TableRow key={tournament.id}>
                                    <TableCell className="font-medium">{tournament.name}</TableCell>
                                    <TableCell>{tournament.game}</TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariantMap[tournament.status] || 'default'} className="capitalize">
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
                                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile Card List */}
                <div className="md:hidden space-y-4">
                     {filteredTournaments.map((tournament) => (
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
                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                        <DropdownMenuItem>View Details</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                             <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground pt-4 border-t border-muted-foreground/20">
                                <Badge variant={statusVariantMap[tournament.status] || 'default'} className="capitalize">
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
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
