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
      <div className="flex items-center gap-3 p-2">
        <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
            <Swords className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="text-muted-foreground text-sm">TBD</span>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center justify-between p-2 rounded-md",
      isWinner ? "bg-card-foreground/10" : ""
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
    if (!match) return <div className="bg-muted/30 rounded-lg w-64 h-[104px] flex-shrink-0" />;

    const [team1, team2] = match.teams;
    const [score1, score2] = match.scores;
    const winner1 = match.status === 'completed' && score1 > score2;
    const winner2 = match.status === 'completed' && score2 > score1;

    return (
        <div className={cn(
            "bg-card rounded-lg w-64 flex-shrink-0 relative border",
            isNextRound && "bg-muted/30 border-dashed"
        )}>
            <div className="p-2 space-y-1">
                <TeamDisplay team={team1} score={isNextRound ? undefined : score1} isWinner={!isNextRound && winner1} />
                <div className="border-b border-border/50 mx-2"></div>
                <TeamDisplay team={team2} score={isNextRound ? undefined : score2} isWinner={!isNextRound && winner2} />
            </div>
            {!isNextRound && match.status === 'live' && (
                <Badge variant="default" className="absolute top-0 right-0 -mt-3 -mr-3 flex items-center gap-1.5">
                    <Video className="h-3 w-3" />
                    Live
                </Badge>
            )}
        </div>
    );
};

const Connector = () => (
    <div className="w-12 h-full flex items-center justify-center">
        <div className="w-full h-[2px] bg-border/50 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-border/50"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-border/50"></div>
        </div>
    </div>
);

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
                <div className="flex items-center">
                    <MatchCard match={match1} />
                    {match2 && <div className="w-6 h-[2px] bg-border/50 -ml-1"></div>}
                </div>
                {match2 && (
                    <div className="flex items-center">
                       <MatchCard match={match2} />
                       <div className="w-6 h-[2px] bg-border/50 -ml-1"></div>
                    </div>
                )}
            </div>
            
            {match2 && nextMatch && (
                <div className="relative h-[128px] w-6 flex items-center -ml-px">
                  <div className="h-full w-[2px] bg-border/50"></div>
                  <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-6 h-[2px] bg-border/50"></div>
                </div>
            )}

            {match2 && <MatchCard match={nextMatch} isNextRound={true} />}
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
        
        const winner1 = match1.status === 'completed' 
            ? (match1.scores[0] > match1.scores[1] ? match1.teams[0] : match1.teams[1])
            : null;

        const winner2 = match2 && match2.status === 'completed'
            ? (match2.scores[0] > match2.scores[1] ? match2.teams[0] : match2.teams[1])
            : null;
        
        if (nextMatch) {
            nextMatch.teams[0] = winner1;
            nextMatch.teams[1] = winner2;
        }

        matchups.push({ match1, match2, nextMatch });
    }

  return (
    <div className="w-full overflow-x-auto p-4 flex justify-center">
      <div className="flex flex-col gap-10">
        {matchups.map(({ match1, match2, nextMatch }, index) => (
            <Matchup key={index} match1={match1} match2={match2} nextMatch={nextMatch} />
        ))}
      </div>
    </div>
  );
}
