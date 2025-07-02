'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Tournament, PointSystem } from '@/types';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2 } from 'lucide-react';

const pointSystemSchema = z.object({
  perKillPoints: z.coerce.number().min(0, "Points must be non-negative."),
  placementPoints: z.array(z.object({
    place: z.coerce.number().int().min(1, "Place must be a positive integer."),
    points: z.coerce.number().min(0, "Points must be non-negative."),
  })),
});

type PointSystemFormValues = z.infer<typeof pointSystemSchema>;

interface EditPointsFormProps {
    tournament: Tournament;
    onSave: (data: { pointSystem: PointSystem }) => void;
}

export function EditPointsForm({ tournament, onSave }: EditPointsFormProps) {
    const form = useForm<PointSystemFormValues>({
        resolver: zodResolver(pointSystemSchema),
        defaultValues: {
            perKillPoints: tournament.pointSystem?.perKillPoints ?? 1,
            placementPoints: tournament.pointSystem?.placementPoints ?? [
                { place: 1, points: 12 },
                { place: 2, points: 9 },
                { place: 3, points: 8 },
                { place: 4, points: 7 },
            ],
        },
    });
    
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "placementPoints"
    });

    function onSubmit(values: PointSystemFormValues) {
        onSave({ pointSystem: values });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="perKillPoints"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Points Per Kill</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div>
                    <h4 className="mb-2 text-lg font-medium">Placement Points</h4>
                    <div className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-4 p-4 border rounded-md bg-muted/50">
                                <FormField
                                    control={form.control}
                                    name={`placementPoints.${index}.place`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Place</FormLabel>
                                            <FormControl><Input type="number" placeholder="e.g., 1" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`placementPoints.${index}.points`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Points</FormLabel>
                                            <FormControl><Input type="number" placeholder="e.g., 15" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} className="mt-8">
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Remove Placement</span>
                                </Button>
                            </div>
                        ))}
                    </div>
                     <Button type="button" variant="outline" size="sm" onClick={() => append({ place: fields.length + 1, points: 0 })} className="mt-4">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Placement
                    </Button>
                </div>

                <Button type="submit">Save Point System</Button>
            </form>
        </Form>
    );
}
