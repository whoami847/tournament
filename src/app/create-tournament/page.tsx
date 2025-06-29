"use client"

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
import { Game } from "@/types"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  name: z.string().min(5, "Tournament name must be at least 5 characters."),
  game: z.enum(["Free Fire", "Mobile Legends", "Valorant", "COD: Mobile"]),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date and time.",
  }),
  maxTeams: z.coerce.number().int().min(4, "Must have at least 4 teams.").max(64, "Cannot exceed 64 teams."),
  entryFee: z.coerce.number().min(0).optional(),
  prizePool: z.string().min(1, "Prize pool is required."),
  rules: z.string().min(50, "Rules must be at least 50 characters long."),
})

export default function CreateTournamentPage() {
    const { toast } = useToast()
    const games: Game[] = ['Free Fire', 'Mobile Legends', 'Valorant', 'COD: Mobile'];

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            game: "Free Fire",
            maxTeams: 16,
            entryFee: 0,
            prizePool: "1,000",
            rules: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
        toast({
            title: "Tournament Created!",
            description: `The tournament "${values.name}" has been successfully created.`,
        })
        form.reset();
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
                                                    {games.map(game => <SelectItem key={game} value={game}>{game}</SelectItem>)}
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

                             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <FormField
                                    control={form.control}
                                    name="maxTeams"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Max Teams</FormLabel>
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
                                            <FormLabel>Entry Fee ($)</FormLabel>
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
                                            <FormLabel>Prize Pool ($)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. 10,000" {...field} />
                                            </FormControl>
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

                            <Button type="submit" size="lg">Create Tournament</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
