"use client";

import type { Match, Round, Team, Tournament } from '@/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Swords, Video } from 'lucide-react';

interface BracketProps {
  tournament: Tournament;
  activeRoundName: string;
}

const TeamDisplay = ({ team, score, isWinner }: { team: Team | null, score?: number, isWinner?: boolean }) => {
  if (!team) {
    return (
      <div className="flex items-center gap-2 p-2 h-[36px] w-full">
        <div className="h-6 w-6 rounded-md bg-muted/20 flex items-center justify-center flex-shrink-0">
            <Swords className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="text-muted-foreground text-xs">TBD</span>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center justify-between p-2 h-[36px] w-full",
      isWinner && "bg-card-foreground/5 rounded-md"
    )}>
      <div className="flex items-center gap-2 overflow-hidden">
        <Avatar className="h-6 w-6 flex-shrink-0">
          <AvatarImage src={team.avatar} alt={team.name} data-ai-hint="team logo" />
          <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className={cn("text-xs font-medium truncate", isWinner ? "text-foreground" : "text-muted-foreground")}>
          {team.name}
        </span>
      </div>
      {typeof score !== 'undefined' && (
        <span className={cn("font-bold text-base", isWinner ? "text-teal-400" : "text-muted-foreground")}>
          {score}
        </span>
      )}
    </div>
  );
};

const MatchCard = ({ match, isNextRound = false }: { match: Match | null, isNextRound?: boolean }) => {
    if (!match) return <div className="bg-card/50 rounded-lg w-48 h-[100px] flex-shrink-0" />;

    const [team1, team2] = match.teams;
    const [score1, score2] = match.scores;
    const winner1 = match.status === 'completed' && score1 > score2;
    const winner2 = match.status === 'completed' && score2 > score1;

    return (
        <div className="space-y-2 w-48 flex-shrink-0">
            <div className="flex justify-between items-center px-2 h-5">
                <span className="text-xs text-muted-foreground">{match.name}</span>
                {!isNextRound && match.status === 'live' && (
                    <Badge variant="default" className="flex items-center gap-1 bg-primary/90 text-primary-foreground text-[10px] h-5">
                        <Video className="h-2.5 w-2.5" />
                        Live
                    </Badge>
                )}
            </div>
            <div className={cn(
                "bg-card rounded-lg relative border",
                isNextRound && "bg-card/50 border-dashed"
            )}>
                <div className="p-1 space-y-1">
                    <TeamDisplay team={team1} score={isNextRound ? undefined : score1} isWinner={!isNextRound && winner1} />
                    <div className="border-b border-border/50 mx-2"></div>
                    <TeamDisplay team={team2} score={isNextRound ? undefined : score2} isWinner={!isNextRound && winner2} />
                </div>
            </div>
        </div>
    );
};

const Matchup = ({ match1, match2, nextMatch }: { match1: Match, match2: Match | null, nextMatch: Match | undefined }) => (
    <div className="flex flex-row items-center justify-center">
        <div className="flex flex-col gap-6">
            <MatchCard match={match1} />
            {match2 ? <MatchCard match={match2} /> : <div className="w-48 h-[100px]" />}
        </div>
        
        {nextMatch && (
            <>
                <div className="w-16 h-52 flex-shrink-0 relative">
                    <div className="absolute w-1/2 h-full top-0 left-0">
                        <div className="absolute h-px w-full bg-border/50" style={{ top: "calc(25% - 2px)"}}></div>
                        {match2 && <div className="absolute h-px w-full bg-border/50" style={{ bottom: "calc(25% - 2px)"}}></div>}
                    </div>
                    <div className="absolute w-px bg-border/50 left-1/2 h-1/2 top-1/4"></div>
                    <div className="absolute h-px w-1/2 bg-border/50 left-1/2 top-1/2"></div>
                    <div className="absolute top-1/2 left-full -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-background border-2 border-border/70 rounded-sm rotate-45 z-10"></div>
                </div>
                <div className="flex-shrink-0">
                    <MatchCard match={nextMatch} isNextRound={true} />
                </div>
            </>
        )}
    </div>
);


export default function Bracket({ tournament, activeRoundName }: BracketProps) {
    const activeRoundIndex = tournament.bracket.findIndex(r => r.name === activeRoundName);
    const activeRound = tournament.bracket[activeRoundIndex];
    const nextRound = tournament.bracket[activeRoundIndex + 1];

    if (!activeRound) return null;

    const matchups = [];
    for (let i = 0; i < activeRound.matches.length; i += 2) {
        const match1 = activeRound.matches[i];
        const match2 = activeRound.matches[i+1] || null;
        const nextMatch = nextRound ? nextRound.matches[Math.floor(i/2)] : undefined;
        
        const getWinner = (match: Match | null) => {
            if (!match || match.status !== 'completed' || !match.teams[0] || !match.teams[1]) return null;
            return match.scores[0] > match.scores[1] ? match.teams[0] : match.teams[1];
        };

        if (nextMatch) {
            nextMatch.teams[0] = getWinner(match1);
            nextMatch.teams[1] = getWinner(match2);
        }

        matchups.push({ match1, match2, nextMatch });
    }

  return (
    <div className="space-y-6">
      {matchups.map((props, index) => (
        <Matchup key={index} {...props} />
      ))}
    </div>
  );
}
