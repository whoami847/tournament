import { mockTournaments } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function AdminTournamentsPage() {
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
                        {mockTournaments.map((tournament) => (
                            <TableRow key={tournament.id}>
                                <TableCell className="font-medium">{tournament.name}</TableCell>
                                <TableCell>{tournament.game}</TableCell>
                                <TableCell>
                                    <Badge variant={statusVariantMap[tournament.status] || 'default'}>
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
            </CardContent>
        </Card>
    )
}
