'use client';

import { mockTournaments } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Award, KeyRound, Trophy, Users, Ticket, Map as MapIcon, Smartphone, CheckCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const InfoRow = ({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: React.ReactNode }) => (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-b-0">
        <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>
        <span className="text-sm font-semibold text-foreground text-right">{value}</span>
    </div>
);


const getEntryType = (format: string) => {
  const type = format.split('_')[1] || '';
  if (!type) return 'N/A';
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
};

export default function TournamentPage({ params }: { params: { id: string } }) {
  const tournament = mockTournaments.find(t => t.id === params.id);
  const { toast } = useToast();
  const [isJoined, setIsJoined] = useState(false);

  if (!tournament) {
    notFound();
  }

  const isFull = tournament.teamsCount >= tournament.maxTeams;

  const handleJoin = () => {
    setIsJoined(true);
    toast({
      title: "Successfully Joined!",
      description: `You have joined the "${tournament.name}" tournament. Good luck!`,
    });
  }

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
                                  <Progress value={(tournament.teamsCount / tournament.maxTeams) * 100} className="h-3 bg-primary/20" />
                                  <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                                      <span>Only {tournament.maxTeams - tournament.teamsCount} spots are left</span>
                                      <span>{tournament.teamsCount}/{tournament.maxTeams}</span>
                                  </div>
                              </div>
                              {tournament.status === 'upcoming' && (
                                  <Button 
                                    className="shrink-0 rounded-full font-bold"
                                    onClick={handleJoin}
                                    disabled={isJoined || isFull}
                                  >
                                    {isJoined ? (
                                        <>
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Joined
                                        </>
                                    ) : isFull ? (
                                        'Full'
                                    ) : (
                                        'Join'
                                    )}
                                  </Button>
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
