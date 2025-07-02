'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useParams, notFound, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { User, Users, Shield, ArrowLeft } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { getTournament, joinTournament } from '@/lib/tournaments-service';
import type { Tournament, Team } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

// Zod schema for a single player
const playerSchema = z.object({
  name: z.string().min(3, { message: "Gamer name must be at least 3 characters." }),
  id: z.string().min(3, { message: "Gamer ID must be at least 3 characters." }),
});

// Main form schema, adding an optional teamName
const formSchema = z.object({
  teamName: z.string().optional(),
  players: z.array(playerSchema).min(1, "At least one player is required."),
});

// Function to get team type (SOLO, DUO, SQUAD)
const getTeamType = (format: string): 'SOLO' | 'DUO' | 'SQUAD' => {
  const type = format.split('_')[1]?.toUpperCase() || 'SQUAD';
  if (type === 'SOLO' || type === 'DUO' || type === 'SQUAD') {
    return type;
  }
  return 'SQUAD'; // Default to SQUAD if format is unexpected
};

const JoinPageSkeleton = () => (
    <div className="container mx-auto px-4 py-8 md:pb-8 pb-24 animate-pulse">
        <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
                <Skeleton className="h-9 w-3/4 mx-auto" />
                <Skeleton className="h-6 w-1/2 mx-auto mt-2" />
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="space-y-4">
                    <Skeleton className="h-6 w-1/3 mx-auto" />
                    <Skeleton className="h-4 w-2/3 mx-auto" />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-28 w-full" />
                    </div>
                </div>
                <Skeleton className="h-px w-full" />
                <div className="space-y-6">
                    <Skeleton className="h-8 w-1/3 mx-auto" />
                    <div className="p-4 border rounded-lg bg-background shadow-sm relative">
                        <Skeleton className="h-5 w-16 absolute -top-3 left-4" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                           <div>
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-10 w-full" />
                           </div>
                           <div>
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-10 w-full" />
                           </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center">
                    <Skeleton className="h-12 w-48" />
                </div>
            </CardContent>
        </Card>
    </div>
);


export default function JoinTournamentPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { toast } = useToast();
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (params.id) {
            const fetchTournament = async () => {
                setLoading(true);
                const data = await getTournament(params.id);
                if (data) {
                    setTournament(data);
                } else {
                    notFound();
                }
                setLoading(false);
            };
            fetchTournament();
        }
    }, [params.id]);


    const teamType = tournament ? getTeamType(tournament.format) : 'SQUAD';
    const initialRegistrationSize = teamType === 'SOLO' ? 1 : 1;

    // State to manage how many players are being registered
    const [registrationSize, setRegistrationSize] = React.useState(initialRegistrationSize);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            teamName: '',
            players: Array.from({ length: initialRegistrationSize }, () => ({ name: '', id: '' })),
        },
    });

    const { fields, replace } = useFieldArray({
        control: form.control,
        name: "players",
    });

    // Update form fields when registration size changes
    React.useEffect(() => {
        const currentPlayers = form.getValues('players');
        const newPlayers = Array.from({ length: registrationSize }, (_, i) => 
            currentPlayers[i] || { name: '', id: '' }
        );
        replace(newPlayers);
    }, [registrationSize, replace, form]);

    React.useEffect(() => {
        // If tournament type is solo, always set player count to 1
        if (teamType === 'SOLO') {
            setRegistrationSize(1);
        } else {
            // When tournament data loads, reset to 1
            setRegistrationSize(1);
        }
    }, [teamType]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!tournament) return;
        setIsSubmitting(true);

        const newParticipant: Team = {
            id: `team-${Date.now()}`,
            name: values.teamName || values.players[0].name,
            avatar: 'https://placehold.co/40x40.png',
            dataAiHint: 'team logo',
            members: values.players.map(p => ({ name: p.name, gamerId: p.id })),
        };

        const result = await joinTournament(tournament.id, newParticipant);

        if (result.success) {
            toast({
                title: "Registration Submitted!",
                description: `You have successfully joined "${tournament.name}".`,
            });
            router.push(`/tournaments/${tournament.id}`);
        } else {
            toast({
                title: "Registration Failed",
                description: result.error || "An unexpected error occurred.",
                variant: "destructive",
            });
        }
        setIsSubmitting(false);
    }

    if (loading) {
        return <JoinPageSkeleton />;
    }

    if (!tournament) {
        notFound();
    }

    const registrationOptions = () => {
        if (teamType === 'SOLO') return null;

        const options = [];
        
        options.push({ label: 'Register Solo', value: 1, icon: User });
        if (teamType === 'DUO' || teamType === 'SQUAD') {
            options.push({ label: 'Register as Duo', value: 2, icon: Users });
        }
        if (teamType === 'SQUAD') {
            options.push({ label: 'Register as Squad', value: 4, icon: Shield });
        }

        return (
            <div className="space-y-4 text-center">
                <Label className="text-base font-semibold">How are you registering?</Label>
                <p className="text-sm text-muted-foreground mb-4">You can register individually or as a partial/full team.</p>
                <RadioGroup
                    defaultValue={registrationSize.toString()}
                    onValueChange={(value) => setRegistrationSize(parseInt(value))}
                    className={`grid grid-cols-1 ${options.length > 1 ? `sm:grid-cols-${options.length}` : ''} gap-4`}
                >
                    {options.map(opt => (
                        <div key={opt.value}>
                            <RadioGroupItem value={opt.value.toString()} id={`r-${opt.value}`} className="peer sr-only" />
                            <Label
                                htmlFor={`r-${opt.value}`}
                                className="flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:shadow-md peer-data-[state=checked]:bg-primary/5"
                            >
                                <opt.icon className="h-8 w-8 mb-2 text-primary" />
                                <span className="font-bold">{opt.label}</span>
                                <span className="text-sm text-muted-foreground">{opt.value} Player{opt.value > 1 ? 's' : ''}</span>
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>
        );
    };

    const showTeamNameInput = teamType !== 'SOLO' && registrationSize > 1;

    return (
        <div className="container mx-auto px-4 py-8 md:pb-8 pb-24">
             <div className="relative">
                <Button variant="outline" size="icon" className="absolute -top-4 -left-2" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
            </div>
            <Card className="max-w-4xl mx-auto">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl">Register for Tournament</CardTitle>
                    <CardDescription className="text-base">
                        You are registering for: <span className="font-semibold text-primary">{tournament.name}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            {registrationOptions()}

                            {showTeamNameInput && (
                                <FormField
                                    control={form.control}
                                    name="teamName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Team Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter your team name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                            
                            <Separator />
                            
                            <div className="space-y-6">
                                <h3 className="font-semibold text-xl text-center">Player Information</h3>
                                {fields.map((field, index) => (
                                    <div key={field.id} className="p-4 border rounded-lg bg-background shadow-sm relative">
                                        <span className="absolute -top-3 left-4 bg-background px-1 text-sm text-muted-foreground">{`Player ${index + 1}`}</span>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                            <FormField
                                                control={form.control}
                                                name={`players.${index}.name`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Gamer Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Enter in-game name" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`players.${index}.id`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Gamer ID</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Enter in-game ID" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="flex justify-center">
                                <Button type="submit" size="lg" disabled={isSubmitting}>
                                    {isSubmitting ? 'Submitting...' : 'Submit Registration'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
