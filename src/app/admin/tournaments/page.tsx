'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { getTournamentsStream, deleteTournament, updateTournament } from '@/lib/tournaments-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Tournament } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminTournamentsPage() {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState<'live' | 'upcoming' | 'completed'>('upcoming');
    const { toast } = useToast();

    useEffect(() => {
        const unsubscribe = getTournamentsStream((data) => {
            setTournaments(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredTournaments = useMemo(() => {
        if (!tournaments) return [];
        return tournaments.filter((tournament: Tournament) => tournament.status === selectedStatus);
    }, [tournaments, selectedStatus]);

    const handleStatusChange = async (tournamentId: string, tournamentName: string, status: 'live' | 'completed') => {
        const result = await updateTournament(tournamentId, { status });
        if (result.success) {
            toast({
                title: "Status Updated",
                description: `"${tournamentName}" has been updated to ${status}.`,
            });
        } else {
             toast({
                title: "Error",
                description: result.error || "Failed to update status.",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (tournamentId: string, tournamentName: string) => {
        if (confirm(`Are you sure you want to delete the tournament: "${tournamentName}"?`)) {
            const result = await deleteTournament(tournamentId);
            if (result.success) {
                toast({
                    title: "Tournament Deleted",
                    description: `"${tournamentName}" has been successfully deleted.`,
                });
            } else {
                 toast({
                    title: "Error",
                    description: result.error || "Failed to delete tournament.",
                    variant: "destructive",
                });
            }
        }
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

                {loading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                             <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                                <Skeleton className="h-12 w-1/4" />
                                <Skeleton className="h-12 w-1/4" />
                                <Skeleton className="h-12 w-1/4" />
                                <Skeleton className="h-12 w-1/4" />
                            </div>
                        ))}
                    </div>
                ) : (
                <>
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
                                {filteredTournaments.length > 0 ? filteredTournaments.map((tournament) => {
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
                                        <TableCell>{tournament.prizePool} TK</TableCell>
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
                                                    
                                                    {tournament.status === 'upcoming' && (
                                                        <DropdownMenuItem onSelect={() => handleStatusChange(tournament.id, tournament.name, 'live')}>
                                                            Go Live
                                                        </DropdownMenuItem>
                                                    )}
                                                    {tournament.status === 'live' && (
                                                        <DropdownMenuItem onSelect={() => handleStatusChange(tournament.id, tournament.name, 'completed')}>
                                                            Mark as Completed
                                                        </DropdownMenuItem>
                                                    )}
                                                    
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => handleDelete(tournament.id, tournament.name)}>Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )}) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24">
                                            No tournaments found for this status.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile Card List */}
                    <div className="md:hidden space-y-4">
                        {filteredTournaments.length > 0 ? filteredTournaments.map((tournament) => {
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

                                            {tournament.status === 'upcoming' && (
                                                <DropdownMenuItem onSelect={() => handleStatusChange(tournament.id, tournament.name, 'live')}>
                                                    Go Live
                                                </DropdownMenuItem>
                                            )}
                                            {tournament.status === 'live' && (
                                                <DropdownMenuItem onSelect={() => handleStatusChange(tournament.id, tournament.name, 'completed')}>
                                                    Mark as Completed
                                                </DropdownMenuItem>
                                            )}

                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => handleDelete(tournament.id, tournament.name)}>Delete</DropdownMenuItem>
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
                                        <p className="font-medium text-foreground">{tournament.prizePool} TK</p>
                                        <p className="text-xs">Prize Pool</p>
                                    </div>
                                </div>
                            </div>
                        )}) : (
                            <div className="text-center py-16 border border-dashed rounded-lg">
                                <h3 className="text-xl font-medium">No Tournaments Found</h3>
                                <p className="text-muted-foreground mt-2">No tournaments match the selected status.</p>
                            </div>
                        )}
                    </div>
                </>
                )}
            </CardContent>
        </Card>
    );
}
