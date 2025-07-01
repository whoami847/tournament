
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Banknote, Gamepad2, Gift, ArrowUp, ArrowDown, Landmark, CreditCard, Wallet, Globe, ChevronDown, ArrowLeft, ArrowRight, ChevronsRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState, useEffect, useActionState, useRef } from 'react';
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createPaymentUrl } from "@/lib/payment-actions";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { getUserProfileStream } from "@/lib/users-service";
import type { PlayerProfile } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";


// --- SWIPE BUTTON ---
const SwipeButton = ({ onSwipeSuccess }: { onSwipeSuccess: () => void }) => {
    const [isSwiping, setIsSwiping] = useState(false);
    const [sliderPosition, setSliderPosition] = useState(0);
    const sliderRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handlePointerMove = (clientX: number) => {
        if (!isSwiping || !sliderRef.current || !containerRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        let newX = clientX - containerRect.left - (sliderRef.current.offsetWidth / 2);

        const maxPosition = containerRect.width - sliderRef.current.offsetWidth;

        newX = Math.max(0, Math.min(newX, maxPosition));
        setSliderPosition(newX);

        if (newX >= maxPosition - 5) { // Threshold for success
            onSwipeSuccess();
            setIsSwiping(false);
        }
    };

    const handlePointerUp = () => {
        if (!isSwiping) return;
        setIsSwiping(false);
        if (sliderRef.current) {
            sliderRef.current.style.transition = 'left 0.3s ease-out';
            setSliderPosition(0);
            setTimeout(() => {
                if (sliderRef.current) sliderRef.current.style.transition = '';
            }, 300);
        }
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-14 bg-black dark:bg-black rounded-full relative flex items-center justify-center overflow-hidden select-none"
            onPointerMove={(e) => isSwiping && handlePointerMove(e.clientX)}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onTouchMove={(e) => isSwiping && handlePointerMove(e.touches[0].clientX)}
            onTouchEnd={handlePointerUp}
        >
            <div
                ref={sliderRef}
                className="h-12 w-12 bg-white/10 rounded-full absolute top-1/2 -translate-y-1/2 flex items-center justify-center z-10 cursor-grab active:cursor-grabbing"
                style={{ left: `${sliderPosition}px` }}
                onPointerDown={() => setIsSwiping(true)}
                onTouchStart={() => setIsSwiping(true)}
            >
                <ArrowRight className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-white/50 animate-pulse">Swipe to withdraw</span>
            <ChevronsRight className="h-5 w-5 absolute right-4 text-white/50" />
        </div>
    );
};


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
        <form action={formAction} className="space-y-6 pt-2">
            {state?.error && (
                <Alert variant="destructive">
                    <AlertDescription>{state.error}</AlertDescription>
                </Alert>
            )}

            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-semibold text-muted-foreground">
                    TK
                </span>
                <Input
                    id="amount"
                    name="amount"
                    type="number"
                    placeholder="0.00"
                    required
                    min="10"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-24 w-full rounded-xl border-2 border-border bg-muted/50 pl-16 pr-6 text-center text-6xl font-bold tracking-tighter focus:bg-background"
                />
            </div>
            
            <div>
                <p className="mb-3 text-center text-sm font-medium text-muted-foreground">Or choose a quick amount</p>
                <div className="grid grid-cols-4 gap-3">
                    {quickAmounts.map((value) => (
                        <Button
                            key={value}
                            type="button"
                            variant={amount === value.toString() ? "default" : "outline"}
                            onClick={() => handleQuickAmountClick(value)}
                            className="h-12 rounded-full text-base font-semibold"
                        >
                            {value}
                        </Button>
                    ))}
                </div>
            </div>
            
            <div className="pt-4">
                <SubmitButton />
            </div>
        </form>
    );
}

function WithdrawDialogContent({ closeDialog, profile }: { closeDialog: () => void, profile: PlayerProfile | null }) {
    const [step, setStep] = useState<'selectMethod' | 'enterAmount' | 'confirm'>('selectMethod');
    const [selectedMethod, setSelectedMethod] = useState('bank');
    const [amount, setAmount] = useState('');
    const { toast } = useToast();

    const handleNextFromMethod = () => setStep('enterAmount');
    const handleNextFromAmount = () => {
        if (amount && parseFloat(amount) > 0) {
            setStep('confirm');
        } else {
            toast({
                variant: "destructive",
                title: "Invalid Amount",
                description: "Please enter a valid amount to withdraw.",
            })
        }
    };
    const handleBack = () => {
        if (step === 'confirm') setStep('enterAmount');
        else if (step === 'enterAmount') setStep('selectMethod');
    };

    const handleWithdrawalSuccess = () => {
        toast({
            title: "Withdrawal Initiated",
            description: `Your withdrawal of TK ${parseFloat(amount).toFixed(2)} is being processed.`,
        });
        closeDialog();
    };

    const quickAmounts = [100, 200, 500, 1000];
    const handleQuickAmountClick = (value: number) => {
        setAmount(value.toString());
    };

    switch (step) {
        case 'enterAmount':
            return (
                <DialogContent className="sm:max-w-md p-0 rounded-2xl overflow-hidden">
                    <DialogHeader className="p-6 pb-4">
                        <Button variant="ghost" size="icon" className="absolute left-4 top-4" onClick={handleBack}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <DialogTitle className="text-xl text-center">Withdraw Amount</DialogTitle>
                        <DialogDescription className="text-center">Select or enter an amount to withdraw.</DialogDescription>
                    </DialogHeader>
                    <div className="px-6 pb-6 space-y-6">
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-semibold text-muted-foreground">TK</span>
                            <Input
                                id="withdraw-amount"
                                name="withdraw-amount"
                                type="number"
                                placeholder="0.00"
                                required
                                min="10"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="h-24 w-full rounded-xl border-2 border-border bg-muted/50 pl-16 pr-6 text-center text-6xl font-bold tracking-tighter focus:bg-background"
                            />
                        </div>
                        <div>
                            <p className="mb-3 text-center text-sm font-medium text-muted-foreground">Or choose a quick amount</p>
                            <div className="grid grid-cols-4 gap-3">
                                {quickAmounts.map((value) => (
                                    <Button key={value} type="button" variant={amount === value.toString() ? "default" : "outline"} onClick={() => handleQuickAmountClick(value)} className="h-12 rounded-full text-base font-semibold">
                                        {value}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <Button size="lg" className="w-full !mt-8" onClick={handleNextFromAmount}>
                            Confirm Amount
                        </Button>
                    </div>
                </DialogContent>
            );

        case 'confirm':
            const transactionId = `#${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(10 + Math.random() * 90)}`;
            const fromAccountNumber = profile ? `${profile.name} (${profile.gamerId})` : 'Your Account';
            const toAccountDetails = {
                bank: 'Bank Account ending in **6789',
                card: 'Card ending in **1234',
                'g-wallet': 'G-Wallet (mapple_gaming_123)',
            }[selectedMethod] || 'Selected Account';
            const now = new Date();
            const formattedDate = now.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
            const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

            return (
                <DialogContent className="sm:max-w-md p-0 bg-stone-100 dark:bg-stone-900 border-none rounded-2xl overflow-hidden">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Confirm Withdrawal</DialogTitle>
                        <DialogDescription>
                            Review the details and swipe to confirm your withdrawal of {parseFloat(amount).toFixed(2)} TK.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-6">
                        <header className="flex justify-between items-center mb-8">
                             <Button variant="ghost" size="icon" onClick={handleBack} className="text-black dark:text-white">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div className="flex-grow flex flex-col items-start ml-4">
                                <h1 className="text-3xl font-bold text-black dark:text-white">Withdrawing Money</h1>
                                <p className="text-sm text-stone-500 dark:text-stone-400">{formattedDate} &nbsp; {formattedTime}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="text-black dark:text-white">
                                <Globe className="h-6 w-6" />
                            </Button>
                        </header>
                        <main className="space-y-6">
                            <div className="text-center space-y-1">
                                <p className="text-sm text-stone-500 dark:text-stone-400">Amount</p>
                                <p className="text-5xl font-bold text-black dark:text-white">TK {parseFloat(amount).toFixed(2)}</p>
                            </div>
                            <div className="bg-white dark:bg-stone-800 p-4 rounded-xl space-y-4 text-black dark:text-white">
                                <div className="flex justify-between">
                                    <div>
                                        <p className="text-xs text-stone-500 dark:text-stone-400">Transaction ID</p>
                                        <p className="font-semibold">{transactionId}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-stone-500 dark:text-stone-400">Transaction Type</p>
                                        <p className="font-semibold">Withdrawal</p>
                                    </div>
                                </div>
                                <Separator className="bg-stone-200 dark:bg-stone-700" />
                                <div>
                                    <p className="text-xs text-stone-500 dark:text-stone-400">From Account</p>
                                    <p className="font-semibold">{fromAccountNumber}</p>
                                </div>
                                <Separator className="bg-stone-200 dark:bg-stone-700" />
                                <div>
                                    <p className="text-xs text-stone-500 dark:text-stone-400">Withdrawing to</p>
                                    <p className="font-semibold">{toAccountDetails}</p>
                                </div>
                            </div>
                        </main>
                    </div>
                    <footer className="px-6 pb-6 mt-4">
                        <SwipeButton onSwipeSuccess={handleWithdrawalSuccess} />
                    </footer>
                </DialogContent>
            );
        
        default: // 'selectMethod'
            return (
                <DialogContent className="sm:max-w-md p-0 rounded-2xl overflow-hidden">
                    <DialogHeader className="p-6 pb-4">
                        <DialogTitle className="text-xl text-center font-semibold">From Account</DialogTitle>
                    </DialogHeader>
                    <div className="px-6 pb-6 space-y-6">
                        {/* User Info */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                             <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border">
                                   <Globe className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="font-semibold">{profile?.name || 'Player'}</p>
                                    <p className="text-sm text-muted-foreground">{profile?.gamerId || 'N/A'}</p>
                                </div>
                            </div>
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        </div>
    
                        {/* Withdrawal Methods */}
                        <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <RadioGroupItem value="g-wallet" id="g-wallet" className="sr-only peer" />
                                    <Label htmlFor="g-wallet" className="flex h-full items-center justify-center gap-2 rounded-lg border-2 border-muted bg-muted/60 p-4 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 text-foreground font-semibold">
                                        <Wallet className="h-5 w-5" />
                                        G-wallet
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="card" id="card" className="sr-only peer" />
                                    <Label htmlFor="card" className="flex h-full items-center justify-center gap-2 rounded-lg border-2 border-muted bg-muted/60 p-4 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 text-foreground font-semibold">
                                        <CreditCard className="h-5 w-5" />
                                        Card
                                    </Label>
                                </div>
                            </div>
                            <div>
                                <RadioGroupItem value="bank" id="bank" className="sr-only peer" />
                                <Label htmlFor="bank" className="flex items-center justify-center gap-2 rounded-lg border-2 border-transparent bg-muted/60 p-4 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground text-foreground font-semibold">
                                    <Landmark className="h-5 w-5" />
                                    Bank Account
                                </Label>
                            </div>
                        </RadioGroup>
    
                        <Button size="lg" className="w-full !mt-8" onClick={handleNextFromMethod}>
                            Next
                        </Button>
                    </div>
                </DialogContent>
            );
    }
}


// --- SUB-COMPONENTS ---

const WalletHeader = ({ profile }: { profile: PlayerProfile | null }) => (
    <header className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary">
                <AvatarImage src={profile?.avatar || ''} alt={profile?.name || 'User'} data-ai-hint="wizard character" />
                <AvatarFallback>{profile?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div>
                <p className="text-xs text-muted-foreground">Welcome back,</p>
                <h1 className="font-bold">{profile?.name || 'Player'}</h1>
            </div>
        </div>
    </header>
);

const CardStack = ({ balance, profile }: { balance: number, profile: PlayerProfile | null }) => {
    const [isFanned, setIsFanned] = useState(false);
    const [isWithdrawDialogOpen, setWithdrawDialogOpen] = useState(false);

    const handleAddMoneyOpenChange = (open: boolean) => {
        if (!open) {
            setIsFanned(false);
        }
    };
    
    const handleWithdrawOpenChange = (open: boolean) => {
        if (!open) {
            setIsFanned(false);
        }
        setWithdrawDialogOpen(open);
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
                    <p className="font-bold tracking-wider">{profile?.name || 'Player'}</p>
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
                    <p className="font-bold tracking-wider">{profile?.name || 'Player'}</p>
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
                        <p className="font-medium tracking-wider">{profile?.name || 'Player'}</p>
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
                     <Dialog onOpenChange={handleAddMoneyOpenChange}>
                        <DialogTrigger asChild>
                             <Button onClick={() => setIsFanned(true)} className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs h-8 px-3 backdrop-blur-sm rounded-md">
                                <ArrowUp className="mr-2 h-4 w-4" /> Add Money
                            </Button>
                        </DialogTrigger>
                         <DialogContent className="sm:max-w-md p-0 rounded-2xl overflow-hidden">
                            <DialogHeader className="p-6 pb-4">
                                <DialogTitle className="text-2xl text-center">Add Money</DialogTitle>
                                <DialogDescription className="text-center">
                                   Select or enter an amount to add to your wallet.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="px-6 pb-6">
                                <AddMoneyForm />
                            </div>
                        </DialogContent>
                    </Dialog>
                     <Dialog open={isWithdrawDialogOpen} onOpenChange={handleWithdrawOpenChange}>
                        <DialogTrigger asChild>
                            <Button onClick={() => { setIsFanned(true); setWithdrawDialogOpen(true); }} variant="secondary" className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs h-8 px-3 backdrop-blur-sm rounded-md">
                                <ArrowDown className="mr-2 h-4 w-4" /> Withdraw
                            </Button>
                        </DialogTrigger>
                        <WithdrawDialogContent profile={profile} closeDialog={() => handleWithdrawOpenChange(false)} />
                    </Dialog>
                </div>
            </div>
        </div>
    );
}

const TransactionList = () => {
    // For now, transactions are not stored. This is a placeholder.
    const transactions: any[] = [];

    const transactionIcons: Record<string, React.ReactNode> = {
        deposit: <div className="p-3 bg-green-500/10 rounded-full"><Banknote className="h-5 w-5 text-green-400" /></div>,
        withdrawal: <div className="p-3 bg-red-500/10 rounded-full"><Gamepad2 className="h-5 w-5 text-red-400" /></div>,
        reward: <div className="p-3 bg-yellow-500/10 rounded-full"><Gift className="h-5 w-5 text-yellow-400" /></div>,
    };

    return (
        <section>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Recent Transactions</h2>
            </div>
            <div className="space-y-3">
                {transactions.length > 0 ? (
                    transactions.map((tx, index) => (
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
                    ))
                ) : (
                    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                        <CardContent className="p-6 text-center text-muted-foreground">
                            You have no recent transactions.
                        </CardContent>
                    </Card>
                )}
            </div>
        </section>
    );
};

export default function WalletPage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<PlayerProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.uid) {
            setLoading(true);
            const unsubscribe = getUserProfileStream(user.uid, (data) => {
                setProfile(data);
                setLoading(false);
            });
            return () => unsubscribe();
        } else if (!user) {
            setLoading(false);
        }
    }, [user]);

    const balance = profile?.balance ?? 0;

    if (loading) {
        return (
             <div className="bg-gradient-to-b from-amber-900/10 via-background to-background min-h-screen text-foreground pb-24 flex flex-col">
                <header className="container mx-auto flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                </header>
                <main className="container mx-auto px-4 mt-4 space-y-8 flex-grow">
                    <div className="relative h-60 flex items-center justify-center">
                        <Skeleton className="absolute w-full max-w-[320px] h-52 rounded-2xl" />
                    </div>
                    <div className="space-y-4">
                         <Skeleton className="h-6 w-32 mb-4" />
                         <Skeleton className="h-20 w-full" />
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="bg-gradient-to-b from-amber-900/10 via-background to-background min-h-screen text-foreground pb-24">
            <WalletHeader profile={profile} />
            <main className="container mx-auto px-4 mt-4 space-y-8">
                <CardStack balance={balance} profile={profile} />
                <TransactionList />
            </main>
        </div>
    );
}
