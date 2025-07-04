'use client';

import { useState, useEffect } from 'react';
import type { WithdrawRequest } from '@/types';
import { getPendingWithdrawRequestsStream, processWithdrawRequest } from '@/lib/withdraw-requests-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, XCircle } from 'lucide-react';

export default function AdminWithdrawRequestsPage() {
    const [requests, setRequests] = useState<WithdrawRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const unsubscribe = getPendingWithdrawRequestsStream((data) => {
            setRequests(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleProcessRequest = async (requestId: string, status: 'approved' | 'rejected') => {
        const result = await processWithdrawRequest(requestId, status);
        if (result.success) {
            toast({ title: `Request ${status} successfully.` });
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Withdrawal Requests</CardTitle>
                <CardDescription>Approve or reject user withdrawal requests.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => ( <Skeleton key={i} className="h-16 w-full" /> ))}
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Requested</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.length > 0 ? requests.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell>
                                        <div className="font-medium">{req.userName}</div>
                                        <div className="text-sm text-muted-foreground">{req.userGamerId}</div>
                                    </TableCell>
                                    <TableCell>{req.amount} TK</TableCell>
                                    <TableCell>{req.method}</TableCell>
                                    <TableCell>{formatDistanceToNow(req.requestedAt.toDate(), { addSuffix: true })}</TableCell>
                                    <TableCell className="flex gap-2">
                                        <Button size="icon" variant="outline" className="text-green-500" onClick={() => handleProcessRequest(req.id, 'approved')}>
                                            <CheckCircle className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="destructive" onClick={() => handleProcessRequest(req.id, 'rejected')}>
                                            <XCircle className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        No pending requests.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
