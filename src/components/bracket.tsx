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

const Matchup = ({
  match1,
  match2,
  nextMatch,
}: {
  match1: Match | null;
  match2: Match | null;
  nextMatch: Match | null;
}) => {
  return (
    <div className="flex items-center">
      <div className="flex flex-col gap-4">
        {match1 ? <MatchCard match={match1} /> : <div className="h-[100px] w-48 flex-shrink-0" />}
        {match2 ? <MatchCard match={match2} /> : <div className="h-[100px] w-48 flex-shrink-0" />}
      </div>
      {nextMatch && (
        <>
          <div className="relative mx-4 h-[124px] w-12 flex-shrink-0">
            {match1 && <div className="absolute left-0 top-[25%] h-0.5 w-6 bg-[#FFB74D]" />}
            {match2 && <div className="absolute left-0 top-[75%] h-0.5 w-6 bg-[#FFB74D]" />}
            <div className="absolute left-6 top-[25%] h-1/2 w-0.5 bg-[#FFB74D]" />
            <div className="absolute left-6 top-[50%] h-0.5 w-6 bg-[#FFB74D]" />
          </div>
          <MatchCard match={nextMatch} />
        </>
      )}
    </div>
  );
};

export default function Bracket({ tournament }: { tournament: Tournament }) {
  const { bracket } = tournament;

  const processedBracket = React.useMemo(() => {
    if (!bracket || bracket.length === 0) return [];
    
    const newBracket = JSON.parse(JSON.stringify(bracket));

    const getWinner = (match: Match | null): Team | null => {
      if (!match || match.status !== 'completed' || !match.teams[0] || !match.teams[1]) {
        return null;
      }
      return match.scores[0] > match.scores[1] ? match.teams[0] : match.teams[1];
    };

    for (let i = 0; i < newBracket.length - 1; i++) {
      const currentRound = newBracket[i];
      const nextRound = newBracket[i + 1];
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
    return newBracket;
  }, [bracket]);

  if (!processedBracket || processedBracket.length === 0) {
    return (
        <div className="text-center py-12">
            <p className="text-muted-foreground">Bracket not available for this tournament.</p>
        </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex items-start p-4">
        {processedBracket.map((round, roundIndex) => (
          <div key={round.name} className="flex-shrink-0">
            <h2 className="text-lg font-bold mb-6 text-center">{round.name}</h2>
            <div 
              className="flex flex-col justify-around h-full"
              style={{
                gap: `${Math.pow(2, roundIndex + 1) * 1.5}rem`,
                paddingTop: `${Math.pow(2, roundIndex) * 3 - 3}rem`,
              }}
            >
              {round.matches.map((match, matchIndex) => {
                if (roundIndex < processedBracket.length - 1) {
                  // For all rounds except the last, we render matchups in pairs
                  if (matchIndex % 2 !== 0) return null;
                  
                  const nextMatch = processedBracket[roundIndex + 1]?.matches[Math.floor(matchIndex / 2)];
                  
                  // If we are in a round past the first, the base matches are duplicates.
                  // Pass null to the matchup component to prevent re-rendering them.
                  const match1 = roundIndex > 0 ? null : match;
                  const match2 = roundIndex > 0 ? null : round.matches[matchIndex + 1];

                  return (
                    <Matchup
                      key={match.id}
                      match1={match1}
                      match2={match2}
                      nextMatch={nextMatch}
                    />
                  );
                } else {
                  // For the final round, the matches are already positioned by the previous round's Matchups
                  // so we don't render anything here. The Matchup component handles the final MatchCard.
                  return null;
                }
              })}
            </div>
          </div>
        )).slice(0, -1)} {/* We render one less column because Matchup handles the next one */}
      </div>
    </div>
  );
}
