
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
import { UserPlus } from 'lucide-react';
import React from 'react';

// Zod schema for a single player
const playerSchema = z.object({
  name: z.string().min(3, { message: "Gamer name must be at least 3 characters." }),
  id: z.string().min(3, { message: "Gamer ID must be at least 3 characters." }),
});

// Main form schema
const formSchema = z.object({
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
    const maxPlayers = teamType === 'SQUAD' ? 4 : teamType === 'DUO' ? 2 : 1;

    // State to manage how many players are being registered
    const [registrationSize, setRegistrationSize] = React.useState(teamType === 'SOLO' ? 1 : 1);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            players: Array.from({ length: registrationSize }, () => ({ name: '', id: '' })),
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

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
        toast({
            title: "Registration Submitted!",
            description: `Your team has been registered for "${tournament.name}".`,
        });
        router.push(`/tournaments/${tournament.id}`);
    }

    const registrationOptions = () => {
        if (teamType === 'SOLO') return null;

        const options = [];
        
        options.push({ label: 'Register as Solo (1 Player)', value: 1 });
        if (teamType === 'DUO' || teamType === 'SQUAD') {
            options.push({ label: 'Register as Duo (2 Players)', value: 2 });
        }
        if (teamType === 'SQUAD') {
            options.push({ label: 'Register as a Squad (4 Players)', value: 4 });
        }

        return (
            <div className="mb-8">
                <Label className="text-base font-semibold">How many players are you registering?</Label>
                <p className="text-sm text-muted-foreground mb-4">You can register individually or as a partial/full team.</p>
                <RadioGroup
                    defaultValue={registrationSize.toString()}
                    onValueChange={(value) => setRegistrationSize(parseInt(value))}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    {options.map(opt => (
                        <div key={opt.value} className="flex items-center space-x-2">
                             <RadioGroupItem value={opt.value.toString()} id={`r-${opt.value}`} />
                            <Label htmlFor={`r-${opt.value}`}>{opt.label}</Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8 md:pb-8 pb-24">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">Register for Tournament</CardTitle>
                    <CardDescription className="text-base">
                        You are registering for: <span className="font-semibold text-primary">{tournament.name}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            {registrationOptions()}

                            <div className="space-y-6">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="p-4 border rounded-lg bg-muted/20">
                                        <h3 className="flex items-center gap-2 font-semibold mb-4 text-lg">
                                            <UserPlus className="h-5 w-5 text-primary" />
                                            Player {index + 1} Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            
                            <Separator />

                            <Button type="submit" size="lg">Submit Registration</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
