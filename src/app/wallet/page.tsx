
'use client';

import { AreaChart, Area } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Search, Banknote, Gamepad2, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

// --- MOCK DATA ---
const contacts = [
    { name: 'Emily Smith', avatar: 'https://placehold.co/48x48.png', dataAiHint: 'female portrait' },
    { name: 'Olivia Wilson', avatar: 'https://placehold.co/48x48.png', dataAiHint: 'female face' },
    { name: 'James Davis', avatar: 'https://placehold.co/48x48.png', dataAiHint: 'male portrait' },
    { name: 'Robert Smith', avatar: 'https://placehold.co/48x48.png', dataAiHint: 'male face' },
    { name: 'William Smith', avatar: 'https://placehold.co/48x48.png', dataAiHint: 'male glasses' },
    { name: 'Sophia Brown', avatar: 'https://placehold.co/48x48.png', dataAiHint: 'female smiling' },
];

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
];

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
        <Button variant="ghost" size="icon" className="rounded-full bg-card/80">
            <Search className="h-5 w-5" />
        </Button>
    </header>
);

const ContactList = () => (
    <section>
        <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2">
            {contacts.map((contact, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0 w-20">
                    <Avatar className="h-14 w-14 border-2 border-primary/20">
                        <AvatarImage src={contact.avatar} alt={contact.name} data-ai-hint={contact.dataAiHint} />
                        <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="text-xs text-center truncate w-full">{contact.name}</p>
                </div>
            ))}
        </div>
    </section>
);


const CardStack = () => {
    const [cardNumber, setCardNumber] = React.useState('**** **** **** ****');

    React.useEffect(() => {
        const generateCardNumber = () => {
            let num = '';
            for (let i = 0; i < 4; i++) {
                num += Math.floor(1000 + Math.random() * 9000).toString();
                if (i < 3) num += ' ';
            }
            return num;
        };
        setCardNumber(generateCardNumber());
    }, []);

    return (
        <div className="relative h-60 flex items-center justify-center group">
            {/* Bottom Card */}
            <div 
                className="absolute w-full max-w-[320px] h-52 rounded-2xl bg-gradient-to-br from-[#4A2E0C] to-[#8C5A2D] p-6 text-white shadow-lg transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:rotate-[-8deg]"
                style={{ transform: 'translateY(24px) rotate(-6deg)', zIndex: 10 }}
            >
                <div className="flex justify-between items-start">
                    <p className="font-bold tracking-wider">Mapple</p>
                    <p className="font-bold text-lg italic">Game Card</p>
                </div>
            </div>
             {/* Middle Card */}
            <div 
                className="absolute w-full max-w-[320px] h-52 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-6 text-white shadow-lg transition-transform duration-500 ease-out group-hover:-translate-y-1 group-hover:rotate-[-4deg]"
                style={{ transform: 'translateY(12px) rotate(-3deg)', zIndex: 20 }}
            >
                 <div className="flex justify-between items-start">
                    <p className="font-bold tracking-wider">Mapple</p>
                    <p className="font-bold text-lg italic">Game Card</p>
                </div>
            </div>
             {/* Top Card */}
            <div 
                className="absolute w-full max-w-[320px] h-52 rounded-2xl bg-black p-6 text-white shadow-2xl flex flex-col justify-between transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-translate-y-6"
                style={{ zIndex: 30 }}
            >
                <div className="flex justify-end items-start">
                    <p className="font-bold text-lg italic">Game Card</p>
                </div>
                <div>
                    <p className="text-2xl font-mono tracking-widest">{cardNumber}</p>
                    <div className="flex justify-between items-end mt-4">
                        <div>
                            <p className="text-xs uppercase text-gray-400">Card Holder Name</p>
                            <p className="font-medium tracking-wider">Mapple</p>
                        </div>
                        <div>
                             <p className="text-xs uppercase text-gray-400">Expiry Date</p>
                             <p className="font-medium text-2xl">∞</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const BalanceAnalytics = () => (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
                 <div>
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p className="text-3xl font-bold">
                        <span className="text-2xl align-top text-muted-foreground mr-1">TK</span>
                        7,500.80
                    </p>
                 </div>
                 <div className="text-right">
                    <p className="text-xs text-green-400">Income</p>
                    <p className="font-semibold">TK 9,000</p>
                    <p className="text-xs text-red-400 mt-1">Expenses</p>
                    <p className="font-semibold">TK 1,500</p>
                 </div>
            </div>
            <div className="h-[150px] w-full">
                <ChartContainer config={chartConfig}>
                    <AreaChart accessibilityLayer data={chartData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                            </linearGradient>
                             <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.7} />
                                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <ChartTooltip
                            cursor={true}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
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
                            stackId="a"
                        />
                    </AreaChart>
                </ChartContainer>
            </div>
        </CardContent>
    </Card>
)

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
                <ContactList />
                <CardStack />
                <BalanceAnalytics />
                <TransactionList />
            </main>
        </div>
    );
}
