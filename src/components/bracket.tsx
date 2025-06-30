
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
      <div className="flex items-center gap-3 p-2 h-[42px] w-full">
        <div className="h-8 w-8 rounded-md bg-muted/20 flex-shrink-0 flex items-center justify-center">
          <Swords className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="text-muted-foreground text-sm">Team TBD</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-2 h-[42px] w-full">
      <div className="flex items-center gap-3 overflow-hidden">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={team.avatar} alt={team.name} data-ai-hint="team logo" />
          <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className={cn("text-sm truncate", isWinner ? "font-bold text-foreground" : "font-medium text-muted-foreground")}>
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
    if (!match) return <div className="bg-card rounded-lg w-full h-[88px] flex-shrink-0" />;

    const [team1, team2] = match.teams;
    const [score1, score2] = match.scores;
    const winner1 = match.status === 'completed' && score1 > score2;
    const winner2 = match.status === 'completed' && score2 > score1;

    // For pending/live matches, both teams are styled as "winners" to make them bold.
    const displayTeam1AsWinner = winner1 || (match.status !== 'completed');
    const displayTeam2AsWinner = winner2 || (match.status !== 'completed');

    return (
        <div className="bg-card rounded-lg w-full flex-shrink-0 border border-border/50 shadow-sm h-[88px]">
            <div className="p-0">
                <TeamDisplay team={team1} score={score1} isWinner={displayTeam1AsWinner} />
                <div className="border-t border-border/50 mx-2"></div>
                <TeamDisplay team={team2} score={score2} isWinner={displayTeam2AsWinner} />
            </div>
        </div>
    );
};

const SingleMatchDisplay = ({ match }: { match: Match | null }) => {
    if (!match) return <div className="w-full md:w-56 h-[108px]" />;
    
    return (
      <div className="w-full md:w-56">
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

const Connector = ({ isTopWinner, isBottomWinner }: { isTopWinner: boolean, isBottomWinner: boolean }) => {
    const CARD_AND_LABEL_HEIGHT = 108;
    const GAP = 32;
    const TOTAL_HEIGHT = CARD_AND_LABEL_HEIGHT * 2 + GAP;
    const TEAM_ROW_HEIGHT = 42;
    
    // Y position for the center of the top and bottom team rows within a match card
    const topTeamY = TEAM_ROW_HEIGHT / 2;
    const bottomTeamY = TEAM_ROW_HEIGHT + (TEAM_ROW_HEIGHT / 2);

    // Calculate start Y positions based on winners
    const startY1 = isTopWinner ? topTeamY : bottomTeamY;
    const startY2 = (CARD_AND_LABEL_HEIGHT + GAP) + (isBottomWinner ? topTeamY : bottomTeamY);

    const endY = TOTAL_HEIGHT / 2;
    
    return (
      <div className="w-10 h-full flex-shrink-0 mx-2" style={{ height: `${TOTAL_HEIGHT}px` }}>
          <svg className="w-full h-full" viewBox={`0 0 40 ${TOTAL_HEIGHT}`} preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d={`M1 ${startY1} C 20,${startY1} 20,${endY} 32,${endY}`} stroke="hsl(var(--border))" strokeWidth="2"/>
              <path d={`M1 ${startY2} C 20,${startY2} 20,${endY} 32,${endY}`} stroke="hsl(var(--border))" strokeWidth="2"/>
              <path d={`M36 ${endY} L32 ${endY-4} L28 ${endY} L32 ${endY+4} Z`} fill="hsl(var(--border))" />
          </svg>
      </div>
    );
};

export default function Bracket({ tournament, bracket, activeRoundName }: { tournament: Tournament, bracket: Round[], activeRoundName: string }) {
  
  const getWinner = (match: Match | null): Team | null => {
      if (!match || match.status !== 'completed' || !match.teams[0] || !match.teams[1]) return null;
      return match.scores[0] > match.scores[1] ? match.teams[0] : match.teams[1];
  };

  const isWinner = (match: Match | null, teamIndex: 0 | 1): boolean => {
    if (!match || match.status !== 'completed' || !match.teams[0] || !match.teams[1]) return true; // Default to top for non-completed matches
    const [score1, score2] = match.scores;
    return teamIndex === 0 ? score1 > score2 : score2 > score1;
  }

  const processedBracket = React.useMemo(() => {
    if (tournament.status === 'upcoming') {
        return bracket;
    }
    const newBracket: Round[] = JSON.parse(JSON.stringify(bracket));
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
  }, [bracket, tournament.status]);

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

                    {nextRound && <Connector isTopWinner={isWinner(match1, 0)} isBottomWinner={isWinner(match2, 0)} />}

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
