"use client";

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Tournament, Game } from '@/types';
import { mockTournaments } from '@/lib/data';
import TournamentCard from '@/components/tournament-card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TournamentsPage() {
  const searchParams = useSearchParams();
  const gameFromQuery = searchParams.get('game') as Game | null;

  const [tournaments, setTournaments] = useState<Tournament[]>(mockTournaments);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState<Game | 'all'>(gameFromQuery || 'all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'live' | 'upcoming' | 'completed'>(gameFromQuery ? 'upcoming' : 'all');
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

  useEffect(() => {
    const gameFromQuery = searchParams.get('game') as Game | null;
    setSelectedGame(gameFromQuery || 'all');
    setSelectedStatus(gameFromQuery ? 'upcoming' : 'all');
  }, [searchParams]);

  const handleBookmarkToggle = (id: string) => {
    setBookmarked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredTournaments = useMemo(() => {
    return tournaments.filter(tournament => {
      const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGame = selectedGame === 'all' || tournament.game === selectedGame;
      const matchesStatus = selectedStatus === 'all' || tournament.status === selectedStatus;
      const matchesBookmark = !showBookmarkedOnly || !!bookmarked[tournament.id];
      return matchesSearch && matchesGame && matchesStatus && matchesBookmark;
    });
  }, [tournaments, searchTerm, selectedGame, selectedStatus, showBookmarkedOnly, bookmarked]);
  
  const games: Game[] = ['Free Fire', 'PUBG', 'Mobile Legends', 'COD: Mobile'];

  return (
    <div className="container mx-auto px-4 py-8 md:pb-8 pb-24">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Live Tournaments</h1>
          <p className="text-muted-foreground mt-1">Discover and join tournaments from around the world.</p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search tournaments..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex-none w-full md:w-48">
              <Select value={selectedGame} onValueChange={(value: Game | 'all') => setSelectedGame(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by game" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Games</SelectItem>
                  {games.map(game => <SelectItem key={game} value={game}>{game}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 p-1 bg-muted rounded-full">
                <Button variant={selectedStatus === 'all' ? 'default' : 'ghost'} size="sm" className="rounded-full h-8 px-4" onClick={() => setSelectedStatus('all')}>All</Button>
                <Button variant={selectedStatus === 'live' ? 'default' : 'ghost'} size="sm" className="rounded-full h-8 px-4" onClick={() => setSelectedStatus('live')}>Ongoing</Button>
                <Button variant={selectedStatus === 'upcoming' ? 'default' : 'ghost'} size="sm" className="rounded-full h-8 px-4" onClick={() => setSelectedStatus('upcoming')}>Upcoming</Button>
                <Button variant={selectedStatus === 'completed' ? 'default' : 'ghost'} size="sm" className="rounded-full h-8 px-4" onClick={() => setSelectedStatus('completed')}>Finished</Button>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="bookmarks-only" checked={showBookmarkedOnly} onCheckedChange={setShowBookmarkedOnly} />
              <Label htmlFor="bookmarks-only">My Bookmarks</Label>
            </div>
          </div>
        </div>

        {filteredTournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map(tournament => (
              <TournamentCard 
                key={tournament.id}
                tournament={tournament}
                isBookmarked={!!bookmarked[tournament.id]}
                onBookmarkToggle={() => handleBookmarkToggle(tournament.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed rounded-lg">
            <h3 className="text-xl font-medium">No Tournaments Found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
