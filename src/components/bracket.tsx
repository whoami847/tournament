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
        <div className="bg-card rounded-lg w-64 flex-shrink-0 border border-border/50 shadow-sm h-[108px]">
             <div className="flex justify-between items-center px-3 py-1 border-b border-border/50">
                <span className="text-xs text-muted-foreground">{match.name}</span>
                {match.status === 'live' && (
                    <Badge variant="default" className="flex items-center gap-1 bg-red-500 text-white text-[10px] h-5 px-1.5 border-none">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/75 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                        </span>
                        LIVE
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

const RoundColumn = ({ round, vSpace, paddingTop }: { round: Round; vSpace: number; paddingTop: number }) => {
  return (
    <div className="flex flex-col items-center flex-shrink-0">
      <h3 className="text-base font-bold uppercase tracking-wider text-muted-foreground h-8 flex items-center mb-4">{round.name}</h3>
      <div className="flex flex-col" style={{ gap: `${vSpace}px`, paddingTop: `${paddingTop}px` }}>
        {round.matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
};

const Connector = ({ height, topY, bottomY, targetY }: { height: number; topY: number; bottomY: number; targetY: number; }) => (
    <div className="w-12 flex-shrink-0" style={{ height: `${height}px` }}>
        <svg className="w-full h-full" viewBox={`0 0 48 ${height}`} preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d={`M1 ${topY} C 24,${topY} 24,${targetY} 48,${targetY}`} stroke="#FFB74D" strokeWidth="2"/>
            <path d={`M1 ${bottomY} C 24,${bottomY} 24,${targetY} 48,${targetY}`} stroke="#FFB74D" strokeWidth="2"/>
        </svg>
    </div>
);

const ConnectorColumn = ({ vSpace, numMatches }: { vSpace: number; numMatches: number }) => {
  const CARD_HEIGHT = 108;
  const unitHeight = CARD_HEIGHT * 2 + vSpace;
  const topY = CARD_HEIGHT / 2;
  const bottomY = CARD_HEIGHT + vSpace + (CARD_HEIGHT / 2);
  const targetY = unitHeight / 2;
  
  return (
    <div className="flex flex-col items-center flex-shrink-0">
      <h3 className="h-8 mb-4">&nbsp;</h3>
      <div className="flex flex-col">
        {Array.from({ length: numMatches / 2 }).map((_, i) => (
          <Connector key={i} height={unitHeight} topY={topY} bottomY={bottomY} targetY={targetY} />
        ))}
      </div>
    </div>
  );
};

export default function Bracket({ tournament }: { tournament: Tournament }) {
  
  const processedBracket = React.useMemo(() => {
    if (!tournament.bracket || tournament.bracket.length === 0) return [];
    // Use JSON.parse(JSON.stringify(...)) for a deep copy to avoid mutating the original data
    const newBracket: Round[] = JSON.parse(JSON.stringify(tournament.bracket));

    const getWinner = (match: Match | null): Team | null => {
      if (!match || match.status !== 'completed' || !match.teams[0] || !match.teams[1]) return null;
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

  const CARD_HEIGHT = 108;
  const INITIAL_V_SPACE = 16;

  if (!processedBracket || processedBracket.length === 0) {
    return (
        <div className="text-center py-12">
            <p className="text-muted-foreground">Bracket not available for this tournament.</p>
        </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4">
        <div className="flex items-start">
          {processedBracket.map((round, roundIndex) => {
            const vSpace = INITIAL_V_SPACE * Math.pow(2, roundIndex) + (CARD_HEIGHT * (Math.pow(2, roundIndex) - 1));
            
            let roundPaddingTop = 0;
            if (roundIndex > 0) {
              const prevRoundVSpace = INITIAL_V_SPACE * Math.pow(2, roundIndex - 1) + (CARD_HEIGHT * (Math.pow(2, roundIndex - 1) - 1));
              const prevUnitHeight = CARD_HEIGHT * 2 + prevRoundVSpace;
              roundPaddingTop = (prevUnitHeight / 2) - (CARD_HEIGHT / 2);
            }

            return (
              <React.Fragment key={round.name}>
                <RoundColumn round={round} vSpace={vSpace} paddingTop={roundPaddingTop} />
                {roundIndex < processedBracket.length - 1 && (
                  <ConnectorColumn 
                    vSpace={vSpace} 
                    numMatches={round.matches.length} 
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
    </div>
  );
}
