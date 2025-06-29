"use client";

import type { Match, Round, Team, Tournament } from '@/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Swords, Video } from 'lucide-react';
import React from 'react';

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

const MatchCard = ({ match }: { match: Match | null }) => {
    if (!match) return <div className="bg-card/50 rounded-lg w-48 h-[100px] flex-shrink-0" />;

    const [team1, team2] = match.teams;
    const [score1, score2] = match.scores;
    const winner1 = match.status === 'completed' && score1 > score2;
    const winner2 = match.status === 'completed' && score2 > score1;

    return (
        <div className="space-y-2 w-48 flex-shrink-0">
            <div className="flex justify-between items-center px-2 h-5">
                <span className="text-xs text-muted-foreground">{match.name}</span>
                {match.status === 'live' && (
                    <Badge variant="default" className="flex items-center gap-1 bg-primary/90 text-primary-foreground text-[10px] h-5">
                        <Video className="h-2.5 w-2.5" />
                        Live
                    </Badge>
                )}
            </div>
            <div className={cn("bg-card rounded-lg relative border")}>
                <div className="p-1 space-y-1">
                    <TeamDisplay team={team1} score={score1} isWinner={winner1} />
                    <div className="border-b border-border/50 mx-2"></div>
                    <TeamDisplay team={team2} score={score2} isWinner={winner2} />
                </div>
            </div>
        </div>
    );
};


export default function Bracket({ tournament }: { tournament: Tournament }) {
    const { bracket } = tournament;

    // Pre-process bracket to populate winners
    const processedBracket = JSON.parse(JSON.stringify(bracket));

    const getWinner = (match: Match | null): Team | null => {
        if (!match || match.status !== 'completed' || !match.teams[0] || !match.teams[1]) {
        return null;
        }
        return match.scores[0] > match.scores[1] ? match.teams[0] : match.teams[1];
    };

    for (let i = 0; i < processedBracket.length - 1; i++) {
        const currentRound = processedBracket[i];
        const nextRound = processedBracket[i + 1];
        for (let j = 0; j < currentRound.matches.length; j += 2) {
            const match1 = currentRound.matches[j];
            const match2 = currentRound.matches[j + 1];
            const nextMatch = nextRound.matches[Math.floor(j / 2)];
            if (nextMatch) {
                if (nextMatch.teams[0] === null) nextMatch.teams[0] = getWinner(match1);
                if (nextMatch.teams[1] === null) nextMatch.teams[1] = getWinner(match2);
            }
        }
    }
  
    return (
        <div className="overflow-x-auto pb-4">
            <div className="flex space-x-12 p-4">
            {processedBracket.map((round: Round, roundIndex: number) => (
                <div key={round.name} className="flex flex-col items-center flex-shrink-0">
                    <h2 className="text-lg font-bold mb-6">{round.name}</h2>
                    <div className="flex flex-col justify-around" style={{ gap: `${Math.pow(2, roundIndex) * 3 - 3}rem`}}>
                        {round.matches.map((match: Match) => (
                           <div key={match.id} className="flex items-center">
                                <MatchCard match={match} />
                                {roundIndex < processedBracket.length - 1 && (
                                    <div className="w-6 h-px bg-border/50"></div>
                                )}
                           </div>
                        ))}
                    </div>
                </div>
            ))}
            </div>
        </div>
    );
}