'use client';

import { useState, useEffect } from 'react';
import { getUsersStream, updateUserBalance } from '@/lib/users-service';
import type { PlayerProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, Wallet } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const ManageWalletDialog = ({ user, onClose }: { user: PlayerProfile; onClose: () => void }) => {
    const [amount, setAmount] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleUpdateBalance = async (adjustment: number) => {
        if (!amount || amount <= 0) {
            toast({ title: 'Invalid Amount', description: 'Please enter a positive amount.', variant: 'destructive' });
            return;
        }
        setIsSubmitting(true);
        const result = await updateUserBalance(user.id, adjustment);
        if (result.success) {
            toast({ title: 'Balance Updated', description: `${user.name}'s balance has been adjusted.` });
            onClose();
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        }
        setIsSubmitting(false);
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Manage Wallet for {user.name}</DialogTitle>
                <DialogDescription>
                    Current Balance: <span className="font-bold">{user.balance.toFixed(2)} TK</span>
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="amount">Adjustment Amount (TK)</Label>
                    <Input
                        id="amount"
                        type="number"
                        placeholder="e.g., 100"
                        value={amount || ''}
                        onChange={(e) => setAmount(Number(e.target.value))}
                    />
                </div>
            </div>
            <DialogFooter>
                 <Button
                    variant="destructive"
                    onClick={() => handleUpdateBalance(-amount)}
                    disabled={isSubmitting || amount <= 0}
                >
                    Remove Balance
                </Button>
                <Button
                    onClick={() => handleUpdateBalance(amount)}
                    disabled={isSubmitting || amount <= 0}
                >
                    Add Balance
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};


export default function AdminUsersPage() {
    const [users, setUsers] = useState<PlayerProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = getUsersStream((data) => {
            setUsers(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const closeWalletDialog = () => {
        setSelectedUserId(null);
    };

    const userForDialog = users.find(u => u.id === selectedUserId);

    const UserTableSkeleton = () => (
        <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg bg-muted/50">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>Manage all registered users.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <UserTableSkeleton />
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>User ID</TableHead>
                                            <TableHead>Gamer ID</TableHead>
                                            <TableHead>Balance</TableHead>
                                            <TableHead>Joined Date</TableHead>
                                            <TableHead><span className="sr-only">Actions</span></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.length > 0 ? users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="gamer avatar" />
                                                            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium">{user.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell><span className="font-mono text-xs">{user.id}</span></TableCell>
                                                <TableCell>{user.gamerId}</TableCell>
                                                <TableCell>{user.balance.toFixed(2)} TK</TableCell>
                                                <TableCell>{format(new Date(user.joined), 'PPP')}</TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                                <span className="sr-only">Toggle menu</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onSelect={() => setSelectedUserId(user.id)}>
                                                                <Wallet className="mr-2 h-4 w-4" />
                                                                Manage Wallet
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-24 text-center">No users found.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile Card List */}
                            <div className="md:hidden">
                                <div className="space-y-4">
                                    {users.length > 0 ? users.map((user) => (
                                        <div key={user.id} className="bg-muted/20 p-4 rounded-lg border">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="gamer avatar" />
                                                        <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold">{user.name}</p>
                                                        <p className="text-sm text-muted-foreground">{user.gamerId}</p>
                                                        <p className="text-xs text-muted-foreground font-mono pt-1">{user.id}</p>
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Toggle menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onSelect={() => setSelectedUserId(user.id)}>
                                                            <Wallet className="mr-2 h-4 w-4" />
                                                            Manage Wallet
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <div className="mt-4 flex justify-between text-sm text-muted-foreground pt-4 border-t border-muted-foreground/20">
                                                <span>Joined: <span className="font-medium text-foreground">{format(new Date(user.joined), 'PPP')}</span></span>
                                                <span className="font-bold text-primary">{user.balance.toFixed(2)} TK</span>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-16 border border-dashed rounded-lg">
                                            <h3 className="text-xl font-medium">No Users Found</h3>
                                            <p className="text-muted-foreground mt-2">New users will appear here after they register.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!userForDialog} onOpenChange={(open) => !open && closeWalletDialog()}>
                {userForDialog && <ManageWalletDialog user={userForDialog} onClose={closeWalletDialog} />}
            </Dialog>
        </>
    );
}
