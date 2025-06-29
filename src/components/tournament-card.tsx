import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bookmark, Users, Calendar, Ticket, Trophy } from 'lucide-react';
import type { Tournament } from '@/types';
import { format } from 'date-fns';

interface TournamentCardProps {
  tournament: Tournament;
  isBookmarked: boolean;
  onBookmarkToggle: () => void;
}

const statusColors = {
  upcoming: 'bg-blue-500',
  live: 'bg-red-500 animate-pulse',
  completed: 'bg-gray-500',
};

export default function TournamentCard({ tournament, isBookmarked, onBookmarkToggle }: TournamentCardProps) {
  const statusColor = statusColors[tournament.status] || 'bg-gray-500';

  return (
    <Card className="flex flex-col hover:border-primary/50 transition-colors duration-300 overflow-hidden">
      <CardHeader className="p-0 relative">
        <Link href={`/tournaments/${tournament.id}`}>
          <Image 
            src={tournament.image}
            alt={tournament.name}
            width={600}
            height={400}
            className="w-full h-48 object-cover"
            data-ai-hint={tournament.dataAiHint as string}
          />
        </Link>
        <div className="absolute top-2 right-2 flex gap-2">
            <Badge variant="secondary">{tournament.game}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="flex justify-between items-start">
            <Link href={`/tournaments/${tournament.id}`} className="block">
                <CardTitle className="text-lg font-semibold hover:text-primary transition-colors">{tournament.name}</CardTitle>
            </Link>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={onBookmarkToggle}>
                <Bookmark className={isBookmarked ? 'fill-primary text-primary' : 'text-muted-foreground'} />
            </Button>
        </div>

        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{format(new Date(tournament.startDate), 'PPP')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span>{tournament.teamsCount} / {tournament.maxTeams} teams</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            <span>${tournament.prizePool} Prize Pool</span>
          </div>
          {tournament.entryFee > 0 && (
             <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-primary" />
                <span>${tournament.entryFee} Entry Fee</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${statusColor}`}></div>
            <span className="text-sm font-medium capitalize">{tournament.status}</span>
        </div>
        <Button asChild variant="outline">
          <Link href={`/tournaments/${tournament.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
