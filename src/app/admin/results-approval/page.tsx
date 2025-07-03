'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getPendingResultsStream, approveResult, rejectResult } from '@/lib/results-service';
import type { MatchResult } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, X } from 'lucide-react';

const ApprovalDialog = ({ result, onClose }: { result: MatchResult; onClose: () => void; }) => {
    const [team1Score, setTeam1Score] = useState(0);
    const [team2Score, setTeam2Score] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleApprove = async () => {
        setIsSubmitting(true);
        const response = await approveResult(
            result.id, 
            result.tournamentId, 
            result.matchId, 
            result.roundName, 
            team1Score, 
            team2Score
        );

        if (response.success) {
            toast({ title: "Result Approved", description: `The scores for match ${result.matchId} have been updated.` });
            onClose();
        } else {
            toast({ title: "Error", description: response.error, variant: 'destructive' });
        }
        setIsSubmitting(false);
    }
    
    // In a real app, you'd fetch the match details to get both team names
    // For now, we'll just show the submitting team.
    const teamName = result.teamName;

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Approve Match Result</DialogTitle>
                <DialogDescription>
                    Review the submission and enter the final scores for the match. This will mark the match as completed and advance the winner.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <p>Approving submission for team: <span className="font-bold">{teamName}</span></p>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <Label htmlFor="team1-score">Team 1 Score</Label>
                        <Input id="team1-score" type="number" value={team1Score} onChange={(e) => setTeam1Score(Number(e.target.value))} />
                    </div>
                     <div>
                        <Label htmlFor="team2-score">Team 2 Score</Label>
                        <Input id="team2-score" type="number" value={team2Score} onChange={(e) => setTeam2Score(Number(e.target.value))} />
                    </div>
                </div>
            </div>
            <CardFooter className="justify-end gap-2">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleApprove} disabled={isSubmitting}>
                    {isSubmitting ? "Approving..." : "Approve & Finalize"}
                </Button>
            </CardFooter>
        </DialogContent>
    );
}

export default function AdminResultsApprovalPage() {
    const [results, setResults] = useState<MatchResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedResult, setSelectedResult] = useState<MatchResult | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const unsubscribe = getPendingResultsStream((data) => {
            setResults(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleReject = async (resultId: string) => {
        if (!window.confirm("Are you sure you want to reject this submission?")) return;
        
        const response = await rejectResult(resultId);
        if (response.success) {
            toast({ title: "Submission Rejected", variant: "destructive" });
        } else {
            toast({ title: "Error", description: response.error, variant: 'destructive' });
        }
    }

    const openDialog = (result: MatchResult) => {
        setSelectedResult(result);
        setIsDialogOpen(true);
    }

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setSelectedResult(null);
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Card>
                <CardHeader>
                    <CardTitle>Pending Result Approvals</CardTitle>
                    <CardDescription>Review and approve match results submitted by players.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-96 w-full" />
                            ))}
                        </div>
                    ) : results.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {results.map((result) => (
                                <Card key={result.id} className="flex flex-col">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{result.teamName}</CardTitle>
                                        <CardDescription>{result.tournamentName} - {result.roundName}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow space-y-4">
                                        <div className="relative aspect-video w-full rounded-md overflow-hidden border">
                                            <Image src={result.screenshotUrl} alt="Match Screenshot" layout="fill" objectFit="cover" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-center">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Kills</p>
                                                <p className="text-2xl font-bold">{result.kills}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Position</p>
                                                <p className="text-2xl font-bold">#{result.position}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex-col items-stretch space-y-2">
                                        <p className="text-xs text-muted-foreground text-center">
                                            Submitted {formatDistanceToNow(new Date(result.submittedAt), { addSuffix: true })}
                                        </p>
                                         <div className="flex gap-2">
                                            <Button variant="destructive" size="icon" className="h-9 w-9" onClick={() => handleReject(result.id)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                            <DialogTrigger asChild>
                                                <Button className="w-full" onClick={() => openDialog(result)}>
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Approve
                                                </Button>
                                            </DialogTrigger>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 border border-dashed rounded-lg">
                            <h3 className="text-xl font-medium">No Pending Submissions</h3>
                            <p className="text-muted-foreground mt-2">All caught up! New submissions will appear here.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
            {selectedResult && <ApprovalDialog result={selectedResult} onClose={handleDialogClose} />}
        </Dialog>
    );
}
