'use client';

import { useState, useMemo } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { mockTournaments } from '@/lib/data';
import type { Tournament } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { EditInfoForm } from '@/components/admin/edit-info-form';
import { EditRulesForm } from '@/components/admin/edit-rules-form';
import { BracketEditor } from '@/components/admin/bracket-editor';
import { ArrowLeft } from 'lucide-react';

export default function EditTournamentPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { toast } = useToast();

    const originalTournament = useMemo(() => mockTournaments.find(t => t.id === params.id), [params.id]);

    const [tournament, setTournament] = useState<Tournament | null>(originalTournament ? JSON.parse(JSON.stringify(originalTournament)) : null);

    if (!tournament) {
        notFound();
    }

    const handleSave = (updatedData: Partial<Tournament>) => {
        setTournament(prev => prev ? { ...prev, ...updatedData } : null);
        toast({
            title: "Changes Saved!",
            description: "The tournament details have been updated.",
        });
        // In a real app, you would also save this to your database.
        const tournamentIndex = mockTournaments.findIndex(t => t.id === tournament.id);
        if (tournamentIndex !== -1) {
            mockTournaments[tournamentIndex] = { ...mockTournaments[tournamentIndex], ...updatedData };
        }
    };
    
    const handleBracketUpdate = (updatedBracket: Tournament['bracket']) => {
        setTournament(prev => prev ? { ...prev, bracket: updatedBracket } : null);
        toast({
            title: "Bracket Updated!",
            description: "The match results have been saved.",
        });
        const tournamentIndex = mockTournaments.findIndex(t => t.id === tournament.id);
         if (tournamentIndex !== -1) {
            mockTournaments[tournamentIndex].bracket = updatedBracket;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Edit Tournament</h1>
                    <p className="text-muted-foreground">Editing: {tournament.name}</p>
                </div>
            </div>

            <Tabs defaultValue="info">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="info">Info</TabsTrigger>
                    <TabsTrigger value="rules">Rules</TabsTrigger>
                    <TabsTrigger value="bracket">Bracket</TabsTrigger>
                </TabsList>
                <TabsContent value="info">
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Information</CardTitle>
                            <CardDescription>Update the general details of the tournament.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <EditInfoForm tournament={tournament} onSave={handleSave} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="rules">
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Rules</CardTitle>
                            <CardDescription>Update the tournament rules and regulations.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <EditRulesForm tournament={tournament} onSave={handleSave} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="bracket">
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Bracket</CardTitle>
                            <CardDescription>Update match scores and advance winners. Changes are saved automatically.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BracketEditor 
                                bracket={tournament.bracket} 
                                participants={tournament.participants}
                                onUpdate={handleBracketUpdate}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
