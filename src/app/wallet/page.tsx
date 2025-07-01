'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, PlusCircle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const mockTransactions = [
    { type: 'deposit', amount: 25.00, description: 'Deposit from Card', date: '2024-07-28' },
    { type: 'withdrawal', amount: -5.00, description: 'Entry Fee: Summer Skirmish', date: '2024-07-27' },
    { type: 'withdrawal', amount: -10.00, description: 'Entry Fee: CODM Battle Arena', date: '2024-07-26' },
    { type: 'deposit', amount: 50.00, description: 'Initial Deposit', date: '2024-07-25' },
    { type: 'reward', amount: 15.00, description: 'Prize: ML Diamond Cup S5', date: '2024-07-20' },
];

export default function WalletPage() {
    const { toast } = useToast();
    const [balance, setBalance] = useState(75.00);
    const [amount, setAmount] = useState('');

    const handleAddMoney = () => {
        const value = parseFloat(amount);
        if (isNaN(value) || value <= 0) {
            toast({
                title: 'Invalid Amount',
                description: 'Please enter a valid positive number.',
                variant: 'destructive',
            });
            return;
        }
        setBalance(prev => prev + value);
        toast({
            title: 'Success!',
            description: `$${value.toFixed(2)} has been added to your wallet.`,
        });
        setAmount('');
    };
    
    const handleWithdraw = () => {
        const value = parseFloat(amount);
        if (isNaN(value) || value <= 0) {
            toast({
                title: 'Invalid Amount',
                description: 'Please enter a valid positive number.',
                variant: 'destructive',
            });
            return;
        }
        if (value > balance) {
            toast({
                title: 'Insufficient Funds',
                description: 'You cannot withdraw more than your current balance.',
                variant: 'destructive',
            });
            return;
        }
        setBalance(prev => prev - value);
        toast({
            title: 'Withdrawal Initiated',
            description: `$${value.toFixed(2)} is being processed for withdrawal.`,
        });
        setAmount('');
    };

    const transactionIcons = {
        deposit: <ArrowUpCircle className="h-6 w-6 text-green-500" />,
        withdrawal: <ArrowDownCircle className="h-6 w-6 text-red-500" />,
        reward: <ArrowUpCircle className="h-6 w-6 text-yellow-500" />,
    };
    
    return (
        <div className="container mx-auto px-4 py-8 md:pb-8 pb-24">
            <div className="space-y-8 max-w-2xl mx-auto">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardDescription className="flex items-center gap-2 text-base">
                            <Wallet className="h-5 w-5" />
                            Current Balance
                        </CardDescription>
                        <CardTitle className="text-5xl font-bold">
                            ${balance.toFixed(2)}
                        </CardTitle>
                    </CardHeader>
                    <CardFooter className="gap-4">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="w-full" size="lg">
                                    <PlusCircle className="mr-2 h-5 w-5" /> Add Money
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Money to Wallet</DialogTitle>
                                    <DialogDescription>Enter the amount you wish to deposit.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="amount-add" className="text-right">Amount ($)</Label>
                                        <Input
                                            id="amount-add"
                                            type="number"
                                            placeholder="e.g., 50.00"
                                            className="col-span-3"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" onClick={handleAddMoney}>Confirm Deposit</Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                         <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="secondary" className="w-full" size="lg">
                                    Withdraw
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Withdraw Funds</DialogTitle>
                                    <DialogDescription>Enter the amount you wish to withdraw. Processing may take 3-5 business days.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="amount-withdraw" className="text-right">Amount ($)</Label>
                                        <Input
                                            id="amount-withdraw"
                                            type="number"
                                            placeholder={`Max $${balance.toFixed(2)}`}
                                            className="col-span-3"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                     <DialogClose asChild>
                                        <Button type="button" onClick={handleWithdraw}>Request Withdrawal</Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>Your last 5 wallet activities.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {mockTransactions.map((tx, index) => (
                                <div key={index} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                                    {transactionIcons[tx.type as keyof typeof transactionIcons]}
                                    <div className="flex-grow">
                                        <p className="font-semibold">{tx.description}</p>
                                        <p className="text-sm text-muted-foreground">{new Date(tx.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                    <p className={cn(
                                        "font-bold text-lg",
                                        tx.amount > 0 ? "text-green-400" : "text-red-400"
                                    )}>
                                        {tx.amount > 0 ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
