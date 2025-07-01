'use client';

import { useState, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, PlusCircle, ArrowUpCircle, ArrowDownCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { createPaymentUrl } from '@/lib/payment-actions';

const mockTransactions = [
    { type: 'deposit', amount: 2500.00, description: 'Deposit from Card', date: '2024-07-28' },
    { type: 'withdrawal', amount: -500.00, description: 'Entry Fee: Summer Skirmish', date: '2024-07-27' },
    { type: 'withdrawal', amount: -1000.00, description: 'Entry Fee: CODM Battle Arena', date: '2024-07-26' },
    { type: 'deposit', amount: 5000.00, description: 'Initial Deposit', date: '2024-07-25' },
    { type: 'reward', amount: 1500.00, description: 'Prize: ML Diamond Cup S5', date: '2024-07-20' },
];


function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {pending ? 'Processing...' : 'Proceed to Pay'}
        </Button>
    );
}

function AddMoneyForm() {
    const { toast } = useToast();
    const [state, formAction] = useActionState(createPaymentUrl, null);
    const [isDialogOpen, setIsDialogOpen] = useState(true);

    useEffect(() => {
        if (state?.error) {
            toast({
                title: 'Payment Error',
                description: state.error,
                variant: 'destructive',
            });
        }
        // A successful submission redirects, so no success toast is needed here.
    }, [state, toast]);

    // This closes the dialog if a redirect happens, which can prevent it from being stuck open
    useEffect(() => {
        if (!isDialogOpen) {
          // Reset form state when dialog is closed
          // This is a bit of a workaround for resetting useFormState
        }
    }, [isDialogOpen]);
    
    return (
        <form action={formAction}>
            <DialogHeader>
                <DialogTitle>Add Money to Wallet</DialogTitle>
                <DialogDescription>Enter your details and the amount you wish to deposit.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="amount">Amount (TK)</Label>
                    <Input id="amount" name="amount" type="number" placeholder="e.g., 500.00" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="customer_name">Full Name</Label>
                    <Input id="customer_name" name="customer_name" placeholder="Your full name" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="customer_email">Email</Label>
                    <Input id="customer_email" name="customer_email" type="email" placeholder="Your email address" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="customer_phone">Phone Number</Label>
                    <Input id="customer_phone" name="customer_phone" placeholder="Your phone number" required />
                </div>
            </div>
            <DialogFooter>
                 <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <SubmitButton />
            </DialogFooter>
        </form>
    );
}


export default function WalletPage() {
    const { toast } = useToast();
    const [balance, setBalance] = useState(7500.00);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    
    const handleWithdraw = () => {
        const value = parseFloat(withdrawAmount);
        if (isNaN(value) || value <= 0) {
            toast({ title: 'Invalid Amount', description: 'Please enter a valid positive number.', variant: 'destructive' });
            return;
        }
        if (value > balance) {
            toast({ title: 'Insufficient Funds', description: 'You cannot withdraw more than your current balance.', variant: 'destructive' });
            return;
        }
        setBalance(prev => prev - value);
        toast({ title: 'Withdrawal Initiated', description: `${value.toFixed(2)} TK is being processed for withdrawal.` });
        setWithdrawAmount('');
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
                            {balance.toFixed(2)} TK
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
                                <AddMoneyForm />
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
                                        <Label htmlFor="amount-withdraw" className="text-right">Amount (TK)</Label>
                                        <Input
                                            id="amount-withdraw"
                                            type="number"
                                            placeholder={`Max ${balance.toFixed(2)} TK`}
                                            className="col-span-3"
                                            value={withdrawAmount}
                                            onChange={(e) => setWithdrawAmount(e.target.value)}
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
                                        {tx.amount > 0 ? `+${tx.amount.toFixed(2)} TK` : `-${Math.abs(tx.amount).toFixed(2)} TK`}
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
