'use client';

import { useState, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoreVertical, ArrowUp, ArrowDown, Banknote, Gamepad2, Gift, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { createPaymentUrl } from '@/lib/payment-actions';

const chartData = [
  { month: 'Jan', income: 4000, expenses: 2400 },
  { month: 'Feb', income: 3000, expenses: 1398 },
  { month: 'Mar', income: 5000, expenses: 6800 },
  { month: 'Apr', income: 2780, expenses: 3908 },
  { month: 'May', income: 1890, expenses: 4800 },
  { month: 'Jun', income: 6390, expenses: 3800 },
];

const chartConfig = {
  income: {
    label: 'Income',
    color: 'hsl(var(--primary))',
  },
  expenses: {
    label: 'Expenses',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

const mockTransactions = [
    { type: 'deposit', amount: 2500.00, description: 'Deposit from Card', date: '2024-07-28' },
    { type: 'withdrawal', amount: -500.00, description: 'Entry Fee: Summer Skirmish', date: '2024-07-27' },
    { type: 'withdrawal', amount: -1000.00, description: 'Entry Fee: CODM Battle Arena', date: '2024-07-26' },
    { type: 'reward', amount: 1500.00, description: 'Prize: ML Diamond Cup S5', date: '2024-07-20' },
    { type: 'deposit', amount: 5000.00, description: 'Initial Deposit', date: '2024-07-25' },
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

    useEffect(() => {
        if (state?.error) {
            toast({
                title: 'Payment Error',
                description: state.error,
                variant: 'destructive',
            });
        }
    }, [state, toast]);
    
    return (
        <form action={formAction}>
            <DialogHeader>
                <DialogTitle>Add Money to Wallet</DialogTitle>
                <DialogDescription>Enter the amount you wish to deposit.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="amount">Amount (TK)</Label>
                    <Input id="amount" name="amount" type="number" placeholder="e.g., 500.00" required />
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

    const transactionIcons: Record<string, React.ReactNode> = {
        deposit: <div className="p-2 bg-green-500/10 rounded-full"><Banknote className="h-5 w-5 text-green-400" /></div>,
        withdrawal: <div className="p-2 bg-red-500/10 rounded-full"><Gamepad2 className="h-5 w-5 text-red-400" /></div>,
        reward: <div className="p-2 bg-yellow-500/10 rounded-full"><Gift className="h-5 w-5 text-yellow-400" /></div>,
    };
    
    return (
        <div className="min-h-screen bg-background text-foreground pb-24">
            <header className="flex items-center justify-between p-4">
                <h1 className="text-xl font-bold">My Wallet</h1>
                <Dialog>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DialogTrigger asChild>
                                <DropdownMenuItem>Add Money</DropdownMenuItem>
                            </DialogTrigger>
                             <DialogTrigger asChild>
                                <DropdownMenuItem>Withdraw</DropdownMenuItem>
                             </DialogTrigger>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DialogContent>
                        <AddMoneyForm />
                    </DialogContent>
                </Dialog>
            </header>

            <main className="px-4">
                <div className="text-center my-6">
                    <p className="text-sm text-muted-foreground">Total Balance</p>
                    <p className="text-5xl font-bold tracking-tight">
                        <span className="text-3xl align-top text-muted-foreground mr-1">TK</span>
                        {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <Card className="bg-card/50 border-0">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 bg-green-900/50 rounded-full">
                                <ArrowDown className="h-5 w-5 text-green-400" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Income</p>
                                <p className="font-semibold">TK 9,000</p>
                            </div>
                        </CardContent>
                    </Card>
                     <Card className="bg-card/50 border-0">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 bg-red-900/50 rounded-full">
                                <ArrowUp className="h-5 w-5 text-red-400" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Expenses</p>
                                <p className="font-semibold">TK 1,500</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                <section>
                    <Card className="bg-card border-0">
                        <CardHeader>
                            <CardTitle>Analytics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px] w-full">
                                <ChartContainer config={chartConfig}>
                                    <AreaChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12, top: 10 }}>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                                        <XAxis
                                            dataKey="month"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            tickFormatter={(value) => value.slice(0, 3)}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            hide
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent indicator="dot" />}
                                        />
                                        <defs>
                                            <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                                            </linearGradient>
                                            <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            dataKey="income"
                                            type="natural"
                                            fill="url(#fillIncome)"
                                            stroke="hsl(var(--primary))"
                                            stackId="a"
                                        />
                                        <Area
                                            dataKey="expenses"
                                            type="natural"
                                            fill="url(#fillExpenses)"
                                            stroke="hsl(var(--chart-1))"
                                            stackId="b"
                                        />
                                    </AreaChart>
                                </ChartContainer>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Transactions</h2>
                        <Button variant="link" className="text-primary">See all</Button>
                    </div>
                    <div className="space-y-3">
                        {mockTransactions.map((tx, index) => (
                            <Card key={index} className="bg-card/50 border-0">
                                <CardContent className="p-4 flex items-center gap-4">
                                    {transactionIcons[tx.type]}
                                    <div className="flex-grow">
                                        <p className="font-semibold">{tx.description}</p>
                                        <p className="text-sm text-muted-foreground">{new Date(tx.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
            </main>

            {/* This Dialog is for the withdraw functionality, it's kept separate for clarity */}
            <Dialog>
                <DialogTrigger asChild>
                    {/* This is an invisible trigger, the real one is in the dropdown. A bit of a hack but works with shadcn's dialog. */}
                    <Button className="hidden">Withdraw</Button>
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
        </div>
    );
}
