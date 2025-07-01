'use client';

import { mockJoinRequests } from '@/lib/admin-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';

export default function AdminRequestsPage() {

    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', className?: string, text: string }> = {
        approved: { variant: 'default', className: 'bg-green-500/80 border-transparent text-green-50', text: 'Joined' },
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Registration History</CardTitle>
                <CardDescription>View a log of all team/player registrations for tournaments. Joining is automatic.</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Desktop Table */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tournament</TableHead>
                                <TableHead>Players</TableHead>
                                <TableHead>Joined At</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockJoinRequests.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell>
                                        <div className="font-medium">{req.tournamentName}</div>
                                        <div className="text-sm text-muted-foreground">{req.teamName}</div>
                                    </TableCell>
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
                    {mockJoinRequests.map((req) => (
                        <div key={req.id} className="bg-muted/20 p-4 rounded-lg border">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="font-semibold">{req.tournamentName}</p>
                                    <p className="text-sm text-muted-foreground">{req.teamName}</p>
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

                {mockJoinRequests.length === 0 && (
                     <div className="text-center py-16 border border-dashed rounded-lg">
                        <h3 className="text-xl font-medium">No Registrations Yet</h3>
                        <p className="text-muted-foreground mt-2">There are currently no tournament registrations.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
