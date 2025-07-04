
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { GameCategory, Tournament } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { addTournament } from "@/lib/tournaments-service"
import { getGamesStream } from "@/lib/games-service"
import { ImageUpload } from "@/components/admin/image-upload"

const formSchema = z.object({
  name: z.string().min(5, "Tournament name must be at least 5 characters."),
  game: z.string().min(1, "Please select a game."),
  image: z.string().min(1, "Please upload a tournament banner."),
  dataAiHint: z.string().min(1, "AI Hint is required for the image."),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date and time.",
  }),
  mode: z.enum(["BR", "CS", "LONE WOLF"], { required_error: "Please select a mode." }),
  teamType: z.enum(["SOLO", "DUO", "SQUAD"], { required_error: "Please select a team type." }),
  maxTeams: z.coerce.number().int().min(2, "Must have at least 2 teams/players.").max(64, "Cannot exceed 64 teams."),
  entryFee: z.coerce.number().min(0).optional(),
  prizePool: z.string().min(1, "Prize pool is required."),
  rules: z.string().min(50, "Rules must be at least 50 characters long."),
  format: z.string(), // Will be constructed from mode and teamType
  map: z.string().optional(),
  perKillPrize: z.coerce.number().min(0).optional(),
  version: z.string().optional(),
}).refine(data => {
    if (data.mode === 'LONE WOLF' && data.teamType === 'SQUAD') {
        return false;
    }
    return true;
}, {
    message: "Squad mode is not available for Lone Wolf.",
    path: ["teamType"],
});

export default function CreateTournamentPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [games, setGames] = useState<GameCategory[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const unsubscribe = getGamesStream(setGames);
        return () => unsubscribe();
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            game: undefined,
            image: "",
            dataAiHint: "esports tournament banner",
            startDate: "",
            mode: "BR",
            teamType: "SQUAD",
            maxTeams: 16,
            entryFee: 0,
            prizePool: "1,000",
            rules: "Standard league rules apply. All matches are Best of 3 until the finals, which are Best of 5. No cheating or exploiting bugs. All players must be registered with their official in-game names.",
            format: "BR_SQUAD",
            map: "Bermuda",
            perKillPrize: 10,
            version: "Mobile",
        },
    })

    const mode = form.watch('mode');
    const teamType = form.watch('teamType');

    useEffect(() => {
        if (mode === 'LONE WOLF' && form.getValues('teamType') === 'SQUAD') {
            form.setValue('teamType', 'SOLO');
        }
    }, [mode, form]);

    useEffect(() => {
        form.setValue('format', `${mode}_${teamType}`);
    }, [mode, teamType, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const result = await addTournament(values as Omit<Tournament, 'id' | 'createdAt' | 'teamsCount' | 'status' | 'participants' | 'bracket'>);
            if (result.success) {
                toast({
                    title: "Tournament Created!",
                    description: `The tournament "${values.name}" has been successfully created.`,
                })
                form.reset();
                router.push('/admin/tournaments');
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to create tournament.",
                    variant: "destructive",
                })
            }
        } catch (error) {
             toast({
                title: "Error",
                description: "An unexpected error occurred while creating the tournament.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }
  
    return (
        <div className="container mx-auto px-4 py-8 md:pb-8 pb-24">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Tournament</CardTitle>
                    <CardDescription>Fill out the details below to set up your next big event.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tournament Banner</FormLabel>
                                        <FormControl>
                                            <ImageUpload
                                                onUploadComplete={(url) => {
                                                    form.setValue('image', url, { shouldValidate: true });
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="dataAiHint"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Image AI Hint</FormLabel>
                                        <FormControl><Input placeholder="e.g., fire battle action" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Tournament Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Summer Skirmish 2024" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormField
                                    control={form.control}
                                    name="game"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Game</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a game" />
                                                </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {games.map(game => <SelectItem key={game.id} value={game.name}>{game.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Start Date & Time</FormLabel>
                                            <FormControl>
                                                <Input type="datetime-local" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormField
                                    control={form.control}
                                    name="mode"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Mode</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a mode" />
                                                </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="BR">Battle Royale</SelectItem>
                                                    <SelectItem value="CS">Clash Squad</SelectItem>
                                                    <SelectItem value="LONE WOLF">Lone Wolf</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="teamType"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Team Type</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a team type" />
                                                </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="SOLO">Solo</SelectItem>
                                                    <SelectItem value="DUO">Duo</SelectItem>
                                                    {mode !== 'LONE WOLF' && <SelectItem value="SQUAD">Squad</SelectItem>}
                                                </SelectContent>
                                            </Select>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <FormField
                                    control={form.control}
                                    name="maxTeams"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{teamType === 'SOLO' ? 'Players' : 'Teams'}</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
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
                                            <FormControl>
                                                <Input type="number" placeholder="0 for free entry" {...field} />
                                            </FormControl>
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
                                            <FormControl>
                                                <Input placeholder="e.g. 10,000" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormField
                                    control={form.control}
                                    name="map"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Map</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Bermuda, Erangel" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="version"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Game Version</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a version" />
                                                </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Mobile">Mobile</SelectItem>
                                                    <SelectItem value="PC">PC</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="rules"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Rules</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Describe the tournament rules, format, and schedule..." className="min-h-[150px]" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Be clear and concise. This will be shown to all participants.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex items-center gap-4">
                                <Button type="submit" size="lg" disabled={isSubmitting}>
                                    {isSubmitting ? 'Creating...' : 'Create Tournament'}
                                </Button>
                                <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
