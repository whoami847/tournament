'use client';

import { useState } from 'react';
import { mockJoinRequests, type JoinRequest } from '@/lib/admin-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { Check, X } from 'lucide-react';

export default function AdminRequestsPage() {
    const [requests, setRequests] = useState<JoinRequest[]>(mockJoinRequests);

    const handleRequestAction = (id: string, status: 'approved' | 'rejected') => {
        setRequests(requests.map(req => req.id === id ? { ...req, status } : req));
    };

    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', className?: string, text: string }> = {
        pending: { variant: 'secondary', className: 'bg-amber-500/80 border-transparent text-amber-50', text: 'Pending' },
        approved: { variant: 'default', className: 'bg-green-500/80 border-transparent text-green-50', text: 'Approved' },
        rejected: { variant: 'destructive', text: 'Rejected' },
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Join Requests</CardTitle>
                <CardDescription>Approve or reject team/player registrations for tournaments.</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Desktop Table */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tournament</TableHead>
                                <TableHead>Players</TableHead>
                                <TableHead>Requested</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.map((req) => (
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
                                            variant={statusConfig[req.status].variant}
                                            className={statusConfig[req.status].className}
                                        >
                                            {statusConfig[req.status].text}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {req.status === 'pending' && (
                                            <div className="flex gap-2 justify-end">
                                                <Button size="icon" variant="outline" className="h-8 w-8 text-green-500 hover:text-green-500 hover:bg-green-500/10 border-green-500/50" onClick={() => handleRequestAction(req.id, 'approved')}>
                                                    <Check className="h-4 w-4" />
                                                    <span className="sr-only">Approve</span>
                                                </Button>
                                                <Button size="icon" variant="outline" className="h-8 w-8 text-red-500 hover:text-red-500 hover:bg-red-500/10 border-red-500/50" onClick={() => handleRequestAction(req.id, 'rejected')}>
                                                    <X className="h-4 w-4" />
                                                    <span className="sr-only">Reject</span>
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile Card List */}
                <div className="md:hidden space-y-4">
                    {requests.map((req) => (
                        <div key={req.id} className="bg-muted/20 p-4 rounded-lg border">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="font-semibold">{req.tournamentName}</p>
                                    <p className="text-sm text-muted-foreground">{req.teamName}</p>
                                </div>
                                <Badge
                                    variant={statusConfig[req.status].variant}
                                    className={statusConfig[req.status].className}
                                >
                                    {statusConfig[req.status].text}
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
                                {req.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="h-8 text-green-500 hover:text-green-500 hover:bg-green-500/10 border-green-500/50" onClick={() => handleRequestAction(req.id, 'approved')}>
                                            <Check className="mr-1 h-4 w-4" /> Approve
                                        </Button>
                                        <Button size="sm" variant="outline" className="h-8 text-red-500 hover:text-red-500 hover:bg-red-500/10 border-red-500/50" onClick={() => handleRequestAction(req.id, 'rejected')}>
                                            <X className="mr-1 h-4 w-4" /> Reject
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {requests.length === 0 && (
                     <div className="text-center py-16 border border-dashed rounded-lg">
                        <h3 className="text-xl font-medium">No Join Requests</h3>
                        <p className="text-muted-foreground mt-2">There are currently no pending join requests.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
