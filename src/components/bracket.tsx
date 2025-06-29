import type { Round, Team } from '@/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface BracketProps {
  rounds: Round[];
}

const TeamDisplay = ({ team, score, isWinner }: { team: Team | null, score: number, isWinner: boolean }) => (
  <div className={cn(
    "flex items-center justify-between p-2 rounded-md transition-colors",
    isWinner ? "bg-primary/20" : "bg-muted/50",
    !team && "opacity-50"
  )}>
    <div className="flex items-center gap-2">
      <Avatar className="h-6 w-6">
        {team && <AvatarImage src={team.avatar} alt={team.name} data-ai-hint="team logo" />}
        <AvatarFallback>{team ? team.name.charAt(0) : '?'}</AvatarFallback>
      </Avatar>
      <span className={cn("text-sm", isWinner ? "font-bold text-foreground" : "text-muted-foreground")}>
        {team?.name || 'TBD'}
      </span>
    </div>
    <span className={cn("font-mono text-sm", isWinner ? "font-bold text-foreground" : "text-muted-foreground")}>
      {score}
    </span>
  </div>
);

export default function Bracket({ rounds }: BracketProps) {
  return (
    <div className="w-full overflow-x-auto p-1">
      <div className="flex gap-8 min-w-max">
        {rounds.map((round, roundIndex) => (
          <div key={round.name} className="flex flex-col gap-6 w-64">
            <h3 className="text-lg font-semibold text-center text-primary">{round.name}</h3>
            <div className="flex flex-col gap-10">
              {round.matches.map((match) => {
                const [team1, team2] = match.teams;
                const [score1, score2] = match.scores;
                const winner1 = match.status === 'completed' && score1 > score2;
                const winner2 = match.status === 'completed' && score2 > score1;

                return (
                  <div key={match.id} className="relative">
                    <div className="bg-card border rounded-lg p-2 space-y-2">
                      <TeamDisplay team={team1} score={score1} isWinner={winner1} />
                      <div className="border-b"></div>
                      <TeamDisplay team={team2} score={score2} isWinner={winner2} />
                    </div>
                    {match.status === 'live' && (
                       <div className="absolute -top-2 -right-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full animate-pulse">LIVE</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
