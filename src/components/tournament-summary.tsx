"use client";

import { useState } from 'react';
import { summarizeTournament, SummarizeTournamentInput } from '@/ai/flows/summarize-tournament';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Wand2, ServerCrash } from 'lucide-react';
import type { Tournament } from '@/types';

interface TournamentSummaryProps {
    tournament: Tournament;
}

export default function TournamentSummary({ tournament }: TournamentSummaryProps) {
    const [summary, setSummary] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateSummary = async () => {
        setIsLoading(true);
        setError(null);
        setSummary(null);

        try {
            const input: SummarizeTournamentInput = {
                tournamentName: tournament.name,
                events: tournament.events,
                userIsParticipating: false, // This could be dynamic based on user data
            };
            const result = await summarizeTournament(input);
            setSummary(result.summary);
        } catch (e) {
            console.error(e);
            setError("Failed to generate summary. The AI might be taking a break.");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <Card className="bg-gradient-to-br from-primary/10 to-background">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Wand2 className="text-primary" />
                    <span>AI Tournament Briefing</span>
                </CardTitle>
                <CardDescription>Get a quick summary of the latest tournament events.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && (
                    <Alert>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <AlertTitle>Generating Summary...</AlertTitle>
                        <AlertDescription>
                            Our AI is analyzing the latest match data. Please wait a moment.
                        </AlertDescription>
                    </Alert>
                )}
                {error && (
                    <Alert variant="destructive">
                        <ServerCrash className="h-4 w-4" />
                        <AlertTitle>Oh no! Something went wrong.</AlertTitle>
                        <AlertDescription>
                            {error}
                        </AlertDescription>
                    </Alert>
                )}
                {summary && (
                     <Alert variant="default" className="border-primary/50">
                        <Wand2 className="h-4 w-4 text-primary"/>
                        <AlertTitle>Summary Ready!</AlertTitle>
                        <AlertDescription className="prose prose-sm prose-invert">
                            <p>{summary}</p>
                        </AlertDescription>
                    </Alert>
                )}
                
                {!summary && !isLoading && !error && (
                     <div className="text-center p-4 border border-dashed rounded-lg">
                        <p className="text-muted-foreground">Click the button to get an AI-powered summary.</p>
                    </div>
                )}

                <Button onClick={handleGenerateSummary} disabled={isLoading} className="mt-4">
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                         <>
                            <Wand2 className="mr-2 h-4 w-4" />
                            {summary ? "Regenerate Summary" : "Generate Summary"}
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
