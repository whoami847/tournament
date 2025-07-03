'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Award, KeyRound, Trophy, Users, Ticket, Map as MapIcon, Smartphone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { getTournament } from '@/lib/tournaments-service';
import type { Tournament } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const InfoRow = ({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: React.ReactNode }) => (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-b-0">
        <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>
        <span className="text-sm font-semibold text-foreground text-right">{value}</span>
    </div>
);


const getEntryType = (format: string = '') => {
  const type = format.split('_')[1] || '';
  if (!type) return 'N/A';
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
};

const TournamentPageSkeleton = () => (
    <div className="container mx-auto px-4 py-8 md:pb-8 pb-24 space-y-8">
        <Skeleton className="h-64 md:h-80 rounded-lg w-full" />
        <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-full" />
            <Card>
                <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <div className="pt-8 space-y-2">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
);

export default function TournamentPage() {
  const params = useParams<{ id: string }>();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      const fetchTournament = async () => {
        setLoading(true);
        const data = await getTournament(params.id as string);
        if (data) {
          setTournament(data);
        } else {
          // Handle tournament not found
          notFound();
        }
        setLoading(false);
      };
      fetchTournament();
    }
  }, [params.id]);

  if (loading) {
    return <TournamentPageSkeleton />;
  }

  if (!tournament) {
    notFound();
  }

  const isFull = tournament.teamsCount >= tournament.maxTeams;

  return (
    <div className="container mx-auto px-4 py-8 md:pb-8 pb-24">
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

        <div>
            <Tabs defaultValue="info">
                <TabsList className="grid w-full grid-cols-3 bg-card rounded-full p-1 h-auto">
                  <TabsTrigger value="info" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none">Info</TabsTrigger>
                  <TabsTrigger value="bracket" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none">Bracket</TabsTrigger>
                  <TabsTrigger value="rules" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none">Rules</TabsTrigger>
                </TabsList>
                <TabsContent value="info" className="mt-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="mb-8">
                          <InfoRow icon={Trophy} label="Total Prize" value={`${tournament.prizePool} TK`} />
                          <InfoRow icon={Award} label="Per Kill Prize" value={`${tournament.perKillPrize || 0} TK`} />
                          <InfoRow icon={Ticket} label="Entry Fee" value={tournament.entryFee > 0 ? `${tournament.entryFee} TK` : 'Free'} />
                          <InfoRow icon={Users} label="Team Format" value={getEntryType(tournament.format)} />
                          <InfoRow icon={MapIcon} label="Map" value={tournament.map || 'TBD'} />
                          <InfoRow icon={Smartphone} label="Game Version" value={tournament.version || 'N/A'} />
                      </div>


                      <div className="mt-8">
                          <div className="flex items-center gap-4">
                              <div className="w-full">
                                  <Progress 
                                    value={(tournament.teamsCount / tournament.maxTeams) * 100} 
                                    className="h-3"
                                    indicatorClassName={cn(isFull && "bg-destructive")} 
                                  />
                                  <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                                      <span>{isFull ? 'Registration is closed' : `Only ${tournament.maxTeams - tournament.teamsCount} spots are left`}</span>
                                      <span>{tournament.teamsCount}/{tournament.maxTeams}</span>
                                  </div>
                              </div>
                              {tournament.status === 'upcoming' && (
                                isFull ? (
                                    <Button
                                      className="shrink-0 rounded-full font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      disabled
                                    >
                                      Full
                                    </Button>
                                ) : (
                                    <Button 
                                        asChild
                                        className="shrink-0 rounded-full font-bold"
                                    >
                                        <Link href={`/tournaments/${tournament.id}/join`}>
                                            Join Now
                                        </Link>
                                    </Button>
                                )
                              )}
                          </div>
                      </div>

                      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Accordion type="single" collapsible>
                            <AccordionItem value="room-details" className="border-b-0">
                                <AccordionTrigger className="bg-muted hover:no-underline rounded-md px-4 py-2.5 text-sm font-semibold border hover:border-primary/50">
                                    <div className="flex items-center gap-2">
                                        <KeyRound className="h-4 w-4 text-primary" />
                                        Room Details
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-4 bg-muted/50 rounded-b-md text-sm text-muted-foreground">
                                    <p>Room ID and password will be shared with registered participants 15 minutes before the match starts via the app.</p>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                        <Accordion type="single" collapsible>
                            <AccordionItem value="prize-details" className="border-b-0">
                                <AccordionTrigger className="bg-muted hover:no-underline rounded-md px-4 py-2.5 text-sm font-semibold border hover:border-primary/50">
                                    <div className="flex items-center gap-2">
                                        <Award className="h-4 w-4 text-primary" />
                                        Total Prize Details
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-4 bg-muted/50 rounded-b-md text-sm text-muted-foreground">
                                    <ul className="list-disc list-inside space-y-1 font-medium text-foreground/80">
                                        <li>1st Place: {Math.round(parseInt(tournament.prizePool.replace(/,/g, '')) * 0.5)} TK</li>
                                        <li>2nd Place: {Math.round(parseInt(tournament.prizePool.replace(/,/g, '')) * 0.3)} TK</li>
                                        <li>3rd Place: {Math.round(parseInt(tournament.prizePool.replace(/,/g, '')) * 0.2)} TK</li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="bracket" className="mt-4">
                    <Card>
                        <CardContent className="text-center py-12">
                             <p className="text-muted-foreground mb-4">The bracket is displayed in a dedicated view for a better experience.</p>
                             <Button asChild size="lg" className="rounded-full">
                                <Link href={`/tournaments/${tournament.id}/bracket`}>View Full Bracket</Link>
                             </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="rules" className="mt-4">
                    <Card>
                        <CardContent className="prose prose-invert prose-p:text-muted-foreground p-6">
                            <p>{tournament.rules}</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
      </div>
    </div>
  );
}
