'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Tournament, Game } from '@/types';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  name: z.string().min(5, "Tournament name must be at least 5 characters."),
  game: z.enum(["Free Fire", "PUBG", "Mobile Legends", "COD: Mobile"]),
  prizePool: z.string().min(1, "Prize pool is required."),
  entryFee: z.coerce.number().min(0),
  maxTeams: z.coerce.number().int().min(4).max(64),
});

type EditInfoFormValues = z.infer<typeof formSchema>;

interface EditInfoFormProps {
    tournament: Tournament;
    onSave: (data: Partial<Tournament>) => void;
}

export function EditInfoForm({ tournament, onSave }: EditInfoFormProps) {
    const games: Game[] = ['Free Fire', 'PUBG', 'Mobile Legends', 'COD: Mobile'];

    const form = useForm<EditInfoFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: tournament.name,
            game: tournament.game,
            prizePool: tournament.prizePool,
            entryFee: tournament.entryFee,
            maxTeams: tournament.maxTeams,
        },
    });

    function onSubmit(values: EditInfoFormValues) {
        onSave(values);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tournament Name</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="game"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Game</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {games.map(game => <SelectItem key={game} value={game}>{game}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="prizePool"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Prize Pool (TK)</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="entryFee"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Entry Fee (TK)</FormLabel>
                                <FormControl><Input type="number" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="maxTeams"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Max Teams</FormLabel>
                                <FormControl><Input type="number" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit">Save Changes</Button>
            </form>
        </Form>
    );
}
