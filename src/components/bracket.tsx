"use client";

import type { Match, Round, Team, Tournament } from '@/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import React from 'react';
import { Video, Swords, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const ChampionCard = ({ team }: { team: Team }) => {
    return (
        <Card className="border-amber-400 border-2 shadow-lg shadow-amber-400/20 w-full max-w-xs bg-card">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <Trophy className="h-10 w-10 text-amber-400" />
                <Avatar className="h-16 w-16 border-2 border-amber-400">
                    <AvatarImage src={team.avatar} alt={team.name} data-ai-hint="team logo" />
                    <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-bold">{team.name}</h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">Tournament Champion</p>
            </CardContent>
        </Card>
    )
}

const TeamDisplay = ({ team, score, isWinner }: { team: Team | null, score?: number, isWinner?: boolean }) => {
  if (!team) {
    return (
      <div className="flex items-center gap-3 p-2 h-[34px] w-full">
        <div className="h-6 w-6 rounded-md bg-muted/20 flex-shrink-0 flex items-center justify-center">
          <Swords className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="text-muted-foreground text-sm">Team TBD</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-2 h-[34px] w-full">
      <div className="flex items-center gap-3 overflow-hidden">
        <Avatar className="h-6 w-6 flex-shrink-0">
          <AvatarImage src={team.avatar} alt={team.name} data-ai-hint="team logo" />
          <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className={cn("text-sm truncate", isWinner ? "font-bold text-foreground" : "font-medium text-muted-foreground")}>
          {team.name}
        </span>
      </div>
      {typeof score !== 'undefined' && (
        <span className={cn("font-bold text-sm", isWinner ? "text-primary" : "text-muted-foreground/50")}>
          {score}
        </span>
      )}
    </div>
  );
};

const MatchCard = ({ match }: { match: Match | null }) => {
    if (!match) return <div className="bg-card rounded-lg w-full h-[72px] flex-shrink-0" />;

    const [team1, team2] = match.teams;
    const [score1, score2] = match.scores;
    const winner1 = match.status === 'completed' && score1 > score2;
    const winner2 = match.status === 'completed' && score2 > score1;

    // For pending/live matches, both teams are styled as "winners" to make them bold.
    const displayTeam1AsWinner = winner1 || (match.status !== 'completed');
    const displayTeam2AsWinner = winner2 || (match.status !== 'completed');

    return (
        <div className="bg-card rounded-lg w-full flex-shrink-0 border border-transparent shadow-sm h-[72px]">
            <div className="p-0">
                <TeamDisplay team={team1} score={score1} isWinner={displayTeam1AsWinner} />
                <div className="border-t border-border/50 mx-2"></div>
                <TeamDisplay team={team2} score={score2} isWinner={displayTeam2AsWinner} />
            </div>
        </div>
    );
};

const SingleMatchDisplay = ({ match }: { match: Match | null }) => {
    if (!match) return <div className="w-full md:w-48 h-[92px]" />;
    
    return (
      <div className="w-full md:w-48">
        <div className="flex justify-between items-center mb-1 h-5">
          <p className="text-xs text-muted-foreground">{match.name}</p>
          {match.status === 'live' && (
            <Badge variant="default" className="flex items-center gap-1 text-[10px] h-4 px-1.5 bg-red-500 border-none">
                <Video className="h-2 w-2" />
                Live
            </Badge>
          )}
        </div>
        <MatchCard match={match} />
      </div>
    )
}

const Connector = () => {
    const CARD_HEIGHT = 72;
    const GAP = 32; 
    const MATCH_DISPLAY_HEIGHT = CARD_HEIGHT + 20; // Card height + label height + margin
    const TOTAL_HEIGHT = MATCH_DISPLAY_HEIGHT * 2 + GAP;
    
    const startY1 = MATCH_DISPLAY_HEIGHT / 2;
    const startY2 = MATCH_DISPLAY_HEIGHT + GAP + (MATCH_DISPLAY_HEIGHT / 2);
    const endY = TOTAL_HEIGHT / 2;
    
    return (
      <div className="w-8 h-full flex-shrink-0 mx-2" style={{ height: `${TOTAL_HEIGHT}px` }}>
          <svg className="w-full h-full" viewBox={`0 0 32 ${TOTAL_HEIGHT}`} preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d={`M1 ${startY1} C 16,${startY1} 16,${endY} 24,${endY}`} stroke="hsl(var(--border))" strokeWidth="2"/>
              <path d={`M1 ${startY2} C 16,${startY2} 16,${endY} 24,${endY}`} stroke="hsl(var(--border))" strokeWidth="2"/>
              <path d={`M28 ${endY} L24 ${endY-4} L20 ${endY} L24 ${endY+4} Z`} fill="hsl(var(--border))" />
          </svg>
      </div>
    );
};

export default function Bracket({ tournament, activeRoundName }: { tournament: Tournament, activeRoundName: string }) {
  
  const getWinner = (match: Match | null): Team | null => {
      if (!match || match.status !== 'completed' || !match.teams[0] || !match.teams[1]) return null;
      return match.scores[0] > match.scores[1] ? match.teams[0] : match.teams[1];
  };

  const processedBracket = React.useMemo(() => {
    const newBracket: Round[] = JSON.parse(JSON.stringify(tournament.bracket));
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

  const activeRoundIndex = processedBracket.findIndex(r => r.name === activeRoundName);
  const activeRound = processedBracket[activeRoundIndex];
  const nextRound = processedBracket[activeRoundIndex + 1] || null;

  if (!activeRound) {
    return (
        <div className="text-center py-12">
            <p className="text-muted-foreground">Bracket not available for this tournament.</p>
        </div>
    );
  }

  const matchPairs = [];
  if (activeRound) {
      for (let i = 0; i < activeRound.matches.length; i+=2) {
          matchPairs.push([
              activeRound.matches[i],
              activeRound.matches[i+1] || null
          ])
      }
  }
  
  // Final Round (or any round with just one match)
  if (activeRound.matches.length === 1) {
    const finalMatch = activeRound.matches[0];
    if (finalMatch && finalMatch.status === 'completed') {
        const winner = getWinner(finalMatch);
        if (winner) {
            return (
                <div className="flex justify-center">
                    <ChampionCard team={winner} />
                </div>
            )
        }
    }
    return (
      <div className="flex justify-center">
        <SingleMatchDisplay match={activeRound.matches[0]} />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
        {matchPairs.map((pair, index) => {
            const [match1, match2] = pair;
            const nextMatch = nextRound ? nextRound.matches[index] : null;

            return (
                <div key={index} className="flex items-center w-full justify-center">
                    <div className="space-y-8">
                       <SingleMatchDisplay match={match1} />
                       <SingleMatchDisplay match={match2} />
                    </div>

                    {nextRound && <Connector />}

                    {nextRound && (
                        <div className="flex items-center">
                           <SingleMatchDisplay match={nextMatch} />
                        </div>
                    )}
                </div>
            )
        })}
    </div>
  );
}
