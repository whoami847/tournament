
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Banknote, Gamepad2, Gift, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createPaymentUrl } from "@/lib/payment-actions";

// --- MOCK DATA ---
const mockTransactions = [
    { type: 'deposit', amount: 2500.00, description: 'Deposit from Card', date: '2024-07-28' },
    { type: 'withdrawal', amount: -500.00, description: 'Entry Fee: Summer Skirmish', date: '2024-07-27' },
    { type: 'withdrawal', amount: -1000.00, description: 'Entry Fee: CODM Battle Arena', date: '2024-07-26' },
    { type: 'reward', amount: 1500.00, description: 'Prize: ML Diamond Cup S5', date: '2024-07-20' },
];

const totalBalance = mockTransactions.reduce((acc, tx) => acc + tx.amount, 0);

// --- FORM COMPONENTS ---

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? 'Processing...' : 'Proceed to Pay'}
        </Button>
    );
}

function AddMoneyForm() {
    const [state, formAction] = useActionState(createPaymentUrl, null);
    const [amount, setAmount] = useState('');

    const quickAmounts = [100, 200, 500, 1000];

    const handleQuickAmountClick = (value: number) => {
        setAmount(value.toString());
    };

    return (
        <form action={formAction} className="space-y-6 pt-4">
            {state?.error && (
                <Alert variant="destructive">
                    <AlertDescription>{state.error}</AlertDescription>
                </Alert>
            )}
            <div className="space-y-2 text-center">
                <Label htmlFor="amount" className="text-sm text-muted-foreground">Enter Amount</Label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-semibold text-muted-foreground">TK</span>
                    <Input
                        id="amount"
                        name="amount"
                        type="number"
                        placeholder="0.00"
                        required
                        min="10"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="h-20 w-full rounded-xl border-2 border-border bg-muted pl-16 pr-4 text-center text-5xl font-bold tracking-tighter focus:bg-background"
                    />
                </div>
            </div>

            <div>
                <p className="mb-2 text-center text-sm text-muted-foreground">Or select a quick amount</p>
                <div className="grid grid-cols-4 gap-2">
                    {quickAmounts.map((value) => (
                        <Button
                            key={value}
                            type="button"
                            variant={amount === value.toString() ? "default" : "outline"}
                            onClick={() => handleQuickAmountClick(value)}
                            className="h-12 text-lg"
                        >
                            {value}
                        </Button>
                    ))}
                </div>
            </div>
            
            <DialogFooter>
                <SubmitButton />
            </DialogFooter>
        </form>
    );
}

function WithdrawDialogContent() {
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Withdraw Funds</DialogTitle>
                <DialogDescription>
                    Withdrawal functionality is coming soon.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 text-center text-muted-foreground">
                <p>This feature is currently under development.</p>
            </div>
             <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}


// --- SUB-COMPONENTS ---

const WalletHeader = () => (
    <header className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary"><AvatarImage src="https://placehold.co/40x40.png" alt="Mapple" data-ai-hint="wizard character" /><AvatarFallback>M</AvatarFallback></Avatar>
            <div>
                <p className="text-xs text-muted-foreground">Welcome back,</p>
                <h1 className="font-bold">Mapple</h1>
            </div>
        </div>
    </header>
);

const CardStack = ({ balance }: { balance: number }) => {
    const [isFanned, setIsFanned] = useState(false);

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setIsFanned(false);
        }
    };

    return (
        <div className={cn("relative h-60 flex items-center justify-center", !isFanned && "group")}>
            {/* Bottom Card */}
            <div
                className={cn(
                    "absolute w-full max-w-[320px] h-52 rounded-2xl bg-gradient-to-br from-[#4A2E0C] to-[#8C5A2D] p-6 text-white shadow-lg transition-all duration-500 ease-out",
                    isFanned 
                        ? 'transform -translate-y-20 -translate-x-24 rotate-[-15deg]' 
                        : 'translate-y-6 rotate-[-6deg] group-hover:-translate-y-2 group-hover:rotate-[-8deg]'
                )}
                style={{ zIndex: 10 }}
            >
                <div className="flex justify-between items-start">
                    <p className="font-bold tracking-wider">Mapple</p>
                    <p className="font-bold text-lg italic">Game Card</p>
                </div>
            </div>
             {/* Middle Card */}
            <div
                className={cn(
                    "absolute w-full max-w-[320px] h-52 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-6 text-white shadow-lg transition-all duration-500 ease-out",
                    isFanned
                        ? 'transform -translate-y-20 translate-x-24 rotate-[15deg]'
                        : 'translate-y-3 rotate-[-3deg] group-hover:-translate-y-1 group-hover:rotate-[-4deg]'
                )}
                style={{ zIndex: 20 }}
            >
                 <div className="flex justify-between items-start">
                    <p className="font-bold tracking-wider">Mapple</p>
                    <p className="font-bold text-lg italic">Game Card</p>
                </div>
            </div>
             {/* Top Card */}
            <div
                className={cn(
                    "absolute w-full max-w-[320px] h-52 rounded-2xl bg-black p-6 text-white shadow-2xl flex flex-col justify-between transition-all duration-500 ease-out",
                    isFanned
                        ? 'transform translate-y-20 rotate-0'
                        : 'group-hover:scale-105 group-hover:-translate-y-6'
                )}
                style={{ zIndex: 30 }}
            >
                 <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs uppercase text-gray-400">Card Holder Name</p>
                        <p className="font-medium tracking-wider">Mapple</p>
                    </div>
                    <p className="font-bold text-lg italic">Game Card</p>
                </div>

                <div className="mt-auto mb-2">
                    <p className="text-xs uppercase text-gray-400">Current Balance</p>
                    <p className="text-3xl font-bold tracking-tight">
                        {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TK
                    </p>
                </div>

                <div className="flex justify-start gap-4">
                     <Dialog onOpenChange={handleOpenChange}>
                        <DialogTrigger asChild>
                             <Button onClick={() => setIsFanned(true)} className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs h-8 px-3 backdrop-blur-sm rounded-md">
                                <ArrowUp className="mr-2 h-4 w-4" /> Add Money
                            </Button>
                        </DialogTrigger>
                         <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Add Money</DialogTitle>
                                <DialogDescription>
                                   Select or enter an amount to add to your wallet.
                                </DialogDescription>
                            </DialogHeader>
                            <AddMoneyForm />
                        </DialogContent>
                    </Dialog>
                     <Dialog onOpenChange={handleOpenChange}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setIsFanned(true)} variant="secondary" className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs h-8 px-3 backdrop-blur-sm rounded-md">
                                <ArrowDown className="mr-2 h-4 w-4" /> Withdraw
                            </Button>
                        </DialogTrigger>
                        <WithdrawDialogContent />
                    </Dialog>
                </div>
            </div>
        </div>
    );
}

const TransactionList = () => {
    const transactionIcons: Record<string, React.ReactNode> = {
        deposit: <div className="p-3 bg-green-500/10 rounded-full"><Banknote className="h-5 w-5 text-green-400" /></div>,
        withdrawal: <div className="p-3 bg-red-500/10 rounded-full"><Gamepad2 className="h-5 w-5 text-red-400" /></div>,
        reward: <div className="p-3 bg-yellow-500/10 rounded-full"><Gift className="h-5 w-5 text-yellow-400" /></div>,
    };
    return (
        <section>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Transaction</h2>
                <Button variant="link" className="text-primary">See all</Button>
            </div>
            <div className="space-y-3">
                {mockTransactions.map((tx, index) => (
                    <Card key={index} className="bg-card/80 backdrop-blur-sm border-border/50">
                        <CardContent className="p-3 flex items-center gap-4">
                            {transactionIcons[tx.type]}
                            <div className="flex-grow">
                                <p className="font-semibold">{tx.description}</p>
                                <p className="text-sm text-muted-foreground">{new Date(tx.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                            <p className={cn(
                                "font-bold text-base",
                                tx.amount > 0 ? "text-green-400" : "text-foreground"
                            )}>
                                {tx.amount > 0 ? `+` : ``}{tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TK
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
};

export default function WalletPage() {
    return (
        <div className="bg-gradient-to-b from-amber-900/10 via-background to-background min-h-screen text-foreground pb-24">
            <WalletHeader />
            <main className="container mx-auto px-4 mt-4 space-y-8">
                <CardStack balance={totalBalance} />
                <TransactionList />
            </main>
        </div>
    );
}
