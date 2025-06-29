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
      <div className="flex items-center gap-3 p-2 h-[44px]">
        <div className="h-8 w-8 rounded-full bg-muted/20 flex items-center justify-center">
            <Swords className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="text-muted-foreground text-sm">TBD</span>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center justify-between p-2 rounded-md h-[44px]",
      isWinner && "bg-card-foreground/5"
    )}>
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={team.avatar} alt={team.name} data-ai-hint="team logo" />
          <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className={cn("text-sm font-medium", isWinner ? "text-foreground" : "text-muted-foreground")}>
          {team.name}
        </span>
      </div>
      {typeof score !== 'undefined' && (
        <span className={cn("font-bold text-lg", isWinner ? "text-teal-400" : "text-muted-foreground")}>
          {score}
        </span>
      )}
    </div>
  );
};

const MatchCard = ({ match, isNextRound = false }: { match: Match | null, isNextRound?: boolean }) => {
    if (!match) return <div className="bg-card/50 rounded-lg w-64 h-[104px] flex-shrink-0" />;

    const [team1, team2] = match.teams;
    const [score1, score2] = match.scores;
    const winner1 = match.status === 'completed' && score1 > score2;
    const winner2 = match.status === 'completed' && score2 > score1;

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center px-2">
                <span className="text-sm text-muted-foreground">{match.name}</span>
                {!isNextRound && match.status === 'live' && (
                    <Badge variant="default" className="flex items-center gap-1.5 bg-primary/90 text-primary-foreground">
                        <Video className="h-3 w-3" />
                        Live
                    </Badge>
                )}
            </div>
            <div className={cn(
                "bg-card rounded-lg w-64 flex-shrink-0 relative border",
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

const Matchup = ({
  match1,
  match2,
  nextMatch
}: {
  match1: Match;
  match2: Match | undefined;
  nextMatch: Match | undefined;
}) => {
    return (
        <div className="flex items-center">
            <div className="flex flex-col gap-6">
                <MatchCard match={match1} />
                {match2 ? <MatchCard match={match2} /> : <div className="w-64 h-[124px]" />}
            </div>
            
            {nextMatch && (
                <>
                    <div className="w-16 h-[124px] flex-shrink-0 flex items-center justify-center relative">
                        <div className="w-[2px] h-full bg-border absolute left-1/2 -translate-x-1/2 top-0"></div>
                        <div className="h-[2px] w-1/2 bg-border absolute right-0 top-1/4"></div>
                        <div className="h-[2px] w-1/2 bg-border absolute right-0 bottom-1/4"></div>
                        <div className="h-[2px] w-1/2 bg-border absolute left-1/2 top-1/2"></div>
                        <div className="h-3 w-3 bg-background border-2 border-border rounded-sm rotate-45 absolute right-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"></div>
                    </div>
                    <MatchCard match={nextMatch} isNextRound={true} />
                </>
            )}
        </div>
    );
};

export default function Bracket({ tournament, activeRoundName }: BracketProps) {
    const activeRoundIndex = tournament.bracket.findIndex(r => r.name === activeRoundName);
    const activeRound = tournament.bracket[activeRoundIndex];
    const nextRound = tournament.bracket[activeRoundIndex + 1];

    if (!activeRound) return null;

    const matchups = [];
    for (let i = 0; i < activeRound.matches.length; i += 2) {
        const match1 = activeRound.matches[i];
        const match2 = activeRound.matches[i+1];
        const nextMatch = nextRound ? nextRound.matches[Math.floor(i/2)] : undefined;
        
        const getWinner = (match: Match) => {
            if (match.status !== 'completed' || !match.teams[0] || !match.teams[1]) return null;
            return match.scores[0] > match.scores[1] ? match.teams[0] : match.teams[1];
        };

        if (nextMatch) {
            nextMatch.teams[0] = getWinner(match1);
            if (match2) {
                nextMatch.teams[1] = getWinner(match2);
            } else {
                 nextMatch.teams[1] = null;
            }
        }

        matchups.push({ match1, match2, nextMatch });
    }

  return (
    <div className="w-full overflow-x-auto pb-8 flex justify-center">
        <div className="flex items-start gap-8">
            <div className="flex flex-col gap-8">
                {matchups.map(({ match1, match2 }, index) => (
                    <div key={index} className="flex flex-col gap-6">
                        <MatchCard match={match1} />
                        {match2 && <MatchCard match={match2} />}
                    </div>
                ))}
            </div>
            {nextRound && (
                <div className="flex flex-col pt-[78px] gap-[152px]">
                   {matchups.map(({ nextMatch }, index) => (
                        nextMatch && <div key={index} className="flex items-center">
                           <div className="w-16 h-[124px] flex-shrink-0 flex items-center justify-center relative">
                                <div className="w-[2px] h-full bg-border absolute left-1/2 -translate-x-1/2 top-0"></div>
                                <div className="h-[2px] w-1/2 bg-border absolute right-0 top-1/4"></div>
                                <div className="h-[2px] w-1/2 bg-border absolute right-0 bottom-1/4"></div>
                                <div className="h-[2px] w-1/2 bg-border absolute left-1/2 top-1/2"></div>
                                <div className="h-3 w-3 bg-background border-2 border-border rounded-sm rotate-45 absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 z-10"></div>
                           </div>
                           <MatchCard match={nextMatch} isNextRound={true} />
                        </div>
                   ))}
                </div>
            )}
        </div>
    </div>
  );
}
