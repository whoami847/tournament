"use client";

import { useState, useMemo } from 'react';
import type { Tournament, Game } from '@/types';
import { mockTournaments } from '@/lib/data';
import TournamentCard from '@/components/tournament-card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Search } from 'lucide-react';

export default function HomePage() {
  const [tournaments, setTournaments] = useState<Tournament[]>(mockTournaments);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState<Game | 'all'>('all');
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

  const handleBookmarkToggle = (id: string) => {
    setBookmarked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredTournaments = useMemo(() => {
    return tournaments.filter(tournament => {
      const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGame = selectedGame === 'all' || tournament.game === selectedGame;
      const matchesBookmark = !showBookmarkedOnly || !!bookmarked[tournament.id];
      return matchesSearch && matchesGame && matchesBookmark;
    });
  }, [tournaments, searchTerm, selectedGame, showBookmarkedOnly, bookmarked]);
  
  const games: Game[] = ['Free Fire', 'Mobile Legends', 'Valorant', 'COD: Mobile'];

  return (
    <div className="container mx-auto px-4 py-8 md:pb-8 pb-24">
      <div className="space-y-8">
        <div className="text-center py-8">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                Esports HQ
            </h1>
            <p className="text-muted-foreground mt-2 text-lg md:text-xl">Your central hub for competitive gaming.</p>
        </div>

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
          <div className="flex items-center space-x-2">
            <Switch id="bookmarks-only" checked={showBookmarkedOnly} onCheckedChange={setShowBookmarkedOnly} />
            <Label htmlFor="bookmarks-only">My Bookmarks</Label>
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
