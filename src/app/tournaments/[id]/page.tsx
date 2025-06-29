import { mockTournaments } from '@/lib/data';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Bracket from '@/components/bracket';
import { Calendar, Users, Trophy, Ticket, Gamepad2, ShieldCheck } from 'lucide-react';

export default function TournamentPage({ params }: { params: { id: string } }) {
  const tournament = mockTournaments.find(t => t.id === params.id);

  if (!tournament) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <header className="relative h-64 md:h-80 rounded-lg overflow-hidden">
        <Image
          src={tournament.image}
          alt={tournament.name}
          fill
          className="object-cover"
          data-ai-hint={tournament.dataAiHint as string}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 md:p-8">
          <Badge variant="secondary" className="mb-2">{tournament.game}</Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white shadow-lg">{tournament.name}</h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="bracket">
                <TabsList>
                <TabsTrigger value="bracket">Bracket</TabsTrigger>
                <TabsTrigger value="participants">Participants</TabsTrigger>
                <TabsTrigger value="rules">Rules</TabsTrigger>
                </TabsList>
                <TabsContent value="bracket" className="mt-4">
                    <Card>
                        <CardHeader><CardTitle>Tournament Bracket</CardTitle></CardHeader>
                        <CardContent>
                            {tournament.bracket && tournament.bracket.length > 0 ? (
                                <Bracket rounds={tournament.bracket} />
                            ) : (
                                <div className="text-center text-muted-foreground py-12">Bracket not available yet.</div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="participants" className="mt-4">
                    <Card>
                        <CardHeader><CardTitle>Registered Teams ({tournament.participants.length})</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {tournament.participants.map(team => (
                                <div key={team.id} className="flex items-center gap-3 bg-card-foreground/5 p-3 rounded-md">
                                    <Avatar>
                                        <AvatarImage src={team.avatar} alt={team.name} data-ai-hint="team logo" />
                                        <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{team.name}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="rules" className="mt-4">
                    <Card>
                        <CardHeader><CardTitle>Rules & Regulations</CardTitle></CardHeader>
                        <CardContent className="prose prose-invert prose-p:text-muted-foreground">
                            <p>{tournament.rules}</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>

        <aside className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Tournament Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div className="flex items-center gap-3"><Calendar className="h-5 w-5 text-primary" /> <span>{format(new Date(tournament.startDate), 'MMMM dd, yyyy @ h:mm a')}</span></div>
                    <div className="flex items-center gap-3"><Gamepad2 className="h-5 w-5 text-primary" /> <span>{tournament.game}</span></div>
                    <div className="flex items-center gap-3"><Users className="h-5 w-5 text-primary" /> <span>{tournament.teamsCount} / {tournament.maxTeams} teams registered</span></div>
                    <div className="flex items-center gap-3"><Trophy className="h-5 w-5 text-primary" /> <span>${tournament.prizePool} Prize Pool</span></div>
                    <div className="flex items-center gap-3"><Ticket className="h-5 w-5 text-primary" /> <span>${tournament.entryFee} Entry Fee</span></div>
                    <div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-primary" /> <span className="capitalize">{tournament.status}</span></div>
                </CardContent>
            </Card>

            <Button size="lg" className="w-full text-lg h-12">
                Join Tournament
            </Button>
        </aside>

      </div>
    </div>
  );
}
