'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useParams, notFound, useRouter } from 'next/navigation';
import { mockTournaments } from '@/lib/data';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { User, Users, Shield } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';

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

export default function JoinTournamentPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { toast } = useToast();

    const tournament = mockTournaments.find(t => t.id === params.id);

    if (!tournament) {
        notFound();
    }

    const teamType = getTeamType(tournament.format);
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
        }
    }, [teamType]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
        toast({
            title: "Registration Submitted!",
            description: `Your registration for "${tournament.name}" has been received.`,
        });
        router.push(`/tournaments/${tournament.id}`);
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
                                        <Badge variant="secondary" className="absolute -top-3 left-4">{`Player ${index + 1}`}</Badge>
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
                                <Button type="submit" size="lg">Submit Registration</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
