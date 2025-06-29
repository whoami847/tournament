"use client";

import type { Match, Round, Team, Tournament } from '@/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import React from 'react';

const TeamDisplay = ({ team, score, isWinner }: { team: Team | null, score?: number, isWinner?: boolean }) => {
  if (!team) {
    return (
      <div className="flex items-center gap-3 p-2 h-[44px] w-full">
        <div className="h-7 w-7 rounded-md bg-muted/20 flex-shrink-0" />
        <span className="text-muted-foreground text-sm">TBD</span>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center justify-between p-2 h-[44px] w-full",
      isWinner && "bg-primary/10"
    )}>
      <div className="flex items-center gap-3 overflow-hidden">
        <Avatar className="h-7 w-7 flex-shrink-0">
          <AvatarImage src={team.avatar} alt={team.name} data-ai-hint="team logo" />
          <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className={cn("text-sm font-medium truncate", isWinner ? "text-foreground" : "text-muted-foreground")}>
          {team.name}
        </span>
      </div>
      {typeof score !== 'undefined' && (
        <span className={cn("font-bold text-lg", isWinner ? "text-primary" : "text-muted-foreground/50")}>
          {score}
        </span>
      )}
    </div>
  );
};

const MatchCard = ({ match }: { match: Match | null }) => {
    if (!match) return <div className="bg-card/50 rounded-lg w-64 h-[108px] flex-shrink-0" />;

    const [team1, team2] = match.teams;
    const [score1, score2] = match.scores;
    const winner1 = match.status === 'completed' && score1 > score2;
    const winner2 = match.status === 'completed' && score2 > score1;

    return (
        <div className="bg-card rounded-lg w-64 flex-shrink-0 border border-border/50 shadow-sm">
             <div className="flex justify-between items-center px-3 py-1 border-b border-border/50">
                <span className="text-xs text-muted-foreground">{match.name}</span>
                {match.status === 'live' && (
                    <Badge variant="default" className="flex items-center gap-1 bg-red-500 text-white text-[10px] h-5 px-1.5 border-none">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/75 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                        </span>
                        EN LIVE
                    </Badge>
                )}
            </div>
            <div className="p-1">
                <TeamDisplay team={team1} score={score1} isWinner={winner1} />
                <div className="border-t border-border/50 mx-2"></div>
                <TeamDisplay team={team2} score={score2} isWinner={winner2} />
            </div>
        </div>
    );
};

const Connector = () => (
    <div className="w-16 h-[240px] flex-shrink-0 flex items-center justify-center relative">
         <svg width="100%" height="100%" viewBox="0 0 64 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 54 C 24,54 24,120 40,120" stroke="#FFB74D" strokeWidth="2" />
            <path d="M1 186 C 24,186 24,120 40,120" stroke="#FFB74D" strokeWidth="2" />
            <path d="M48 120 H64" stroke="#FFB74D" strokeWidth="2"/>
            <path d="M44 116 L48 120 L44 124 L40 120 Z" fill="#FFB74D" />
        </svg>
    </div>
);


const Matchup = ({ match1, match2, nextMatch }: { match1: Match, match2: Match, nextMatch: Match | null }) => {
    return (
        <div className="flex items-center justify-center">
            <div className="flex flex-col gap-6">
                <MatchCard match={match1} />
                <MatchCard match={match2} />
            </div>
            <Connector />
            <MatchCard match={nextMatch} />
        </div>
    );
};


export default function Bracket({ tournament, activeRoundName }: { tournament: Tournament, activeRoundName: string }) {
  
  const processedBracket = React.useMemo(() => {
    if (!tournament.bracket || tournament.bracket.length === 0) return [];
    
    const newBracket = JSON.parse(JSON.stringify(tournament.bracket));

    const getWinner = (match: Match | null): Team | null => {
      if (!match || match.status !== 'completed' || !match.teams[0] || !match.teams[1]) {
        return null;
      }
      return match.scores[0] > match.scores[1] ? match.teams[0] : match.teams[1];
    };
    
    for (let i = 0; i < newBracket.length - 1; i++) {
      const currentRound = newBracket[i];
      const nextRound = newBracket[i + 1];
      for (let j = 0; j < currentRound.matches.length; j++) {
        const winner = getWinner(currentRound.matches[j]);
        if (winner) {
            const nextMatchIndex = Math.floor(j / 2);
            const teamIndexInNextMatch = j % 2;
            if (nextRound.matches[nextMatchIndex] && nextRound.matches[nextMatchIndex].teams[teamIndexInNextMatch] === null) {
               nextRound.matches[nextMatchIndex].teams[teamIndexInNextMatch] = winner;
            }
        }
      }
    }
    return newBracket;
  }, [tournament.bracket]);

  const activeRound = processedBracket.find(r => r.name === activeRoundName);
  const activeRoundIndex = processedBracket.findIndex(r => r.name === activeRoundName);
  const nextRound = processedBracket[activeRoundIndex + 1];

  if (!activeRound) {
    return (
        <div className="text-center py-12">
            <p className="text-muted-foreground">Bracket not available for this tournament.</p>
        </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4 flex justify-center">
        <div className="flex flex-col items-center gap-6">
            {Array.from({ length: activeRound.matches.length / 2 }).map((_, i) => {
                const match1 = activeRound.matches[i * 2];
                const match2 = activeRound.matches[i * 2 + 1];
                const nextMatch = nextRound ? nextRound.matches[i] : null;
                
                if (!match1 || !match2) return null;

                return <Matchup key={i} match1={match1} match2={match2} nextMatch={nextMatch} />
            })}
        </div>
    </div>
  );
}
