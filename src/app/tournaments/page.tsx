"use client";

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Tournament, Game } from '@/types';
import { mockTournaments } from '@/lib/data';
import TournamentCard from '@/components/tournament-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

type Format = 'all' | 'BR' | 'CS' | 'LONE WOLF';
type SubMode = 'all' | 'solo' | 'duo' | 'squad';

export default function TournamentsPage() {
  const searchParams = useSearchParams();
  const gameFromQuery = searchParams.get('game') as Game | null;

  const [tournaments, setTournaments] = useState<Tournament[]>(mockTournaments);
  const [selectedGame, setSelectedGame] = useState<Game | 'all'>(gameFromQuery || 'all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'live' | 'upcoming' | 'completed'>('upcoming');
  const [selectedFormat, setSelectedFormat] = useState<Format>('all');
  const [selectedSubMode, setSelectedSubMode] = useState<SubMode>('all');
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

  useEffect(() => {
    const gameFromQuery = searchParams.get('game') as Game | null;
    setSelectedGame(gameFromQuery || 'all');
    if (gameFromQuery) {
      setSelectedStatus('upcoming');
    }
  }, [searchParams]);

  const handleBookmarkToggle = (id: string) => {
    setBookmarked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFormatChange = (format: Format) => {
    setSelectedFormat(format);
    setSelectedSubMode('all');
  };

  const filteredTournaments = useMemo(() => {
    return tournaments.filter(tournament => {
      const matchesGame = selectedGame === 'all' || tournament.game === selectedGame;
      const matchesStatus = selectedStatus === 'all' || tournament.status === selectedStatus;
      const matchesBookmark = !showBookmarkedOnly || !!bookmarked[tournament.id];
      
      const matchesFormat = (() => {
        if (selectedFormat === 'all') return true;
        
        if (!['BR', 'CS', 'LONE WOLF'].includes(selectedFormat)) {
            return tournament.format === selectedFormat;
        }

        const [primaryMode, subMode] = tournament.format.split('_');

        if (primaryMode !== selectedFormat) return false;
        
        if (selectedSubMode === 'all') return true;

        return subMode?.toLowerCase() === selectedSubMode;
      })();

      return matchesGame && matchesStatus && matchesBookmark && matchesFormat;
    });
  }, [tournaments, selectedGame, selectedStatus, selectedFormat, selectedSubMode, showBookmarkedOnly, bookmarked]);
  
  const games: Game[] = ['Free Fire', 'PUBG', 'Mobile Legends', 'COD: Mobile'];
  const formats: Exclude<Format, 'all'>[] = ['BR', 'CS', 'LONE WOLF'];
  
  const subModeOptions: { [key: string]: SubMode[] } = {
    'BR': ['all', 'solo', 'duo', 'squad'],
    'CS': ['all', 'solo', 'duo', 'squad'],
    'LONE WOLF': ['all', 'solo', 'duo'],
  };
  const currentSubModes = subModeOptions[selectedFormat];

  return (
    <div className="container mx-auto px-4 py-8 md:pb-8 pb-24">
      <div className="space-y-4">
        <div className="flex justify-end">
          <div className="w-full md:w-48">
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
        
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 p-1 bg-muted rounded-full flex-wrap">
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

          <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 p-1 bg-muted rounded-full self-start flex-wrap">
                <Button variant={selectedFormat === 'all' ? 'default' : 'ghost'} size="sm" className="rounded-full h-8 px-4" onClick={() => handleFormatChange('all')}>All Modes</Button>
                {formats.map(format => (
                  <Button 
                    key={format} 
                    variant={selectedFormat === format ? 'default' : 'ghost'} 
                    size="sm" 
                    className="rounded-full h-8 px-4" 
                    onClick={() => handleFormatChange(format)}
                  >
                    {format === 'LONE WOLF' ? 'Lone Wolf' : format}
                  </Button>
                ))}
              </div>

              {currentSubModes && (
                <div className="flex items-center gap-2 p-1 bg-muted rounded-full self-start flex-wrap">
                  {currentSubModes.map(subMode => (
                      <Button 
                          key={subMode}
                          variant={selectedSubMode === subMode ? 'default' : 'ghost'}
                          size="sm"
                          className="rounded-full h-8 px-4"
                          onClick={() => setSelectedSubMode(subMode)}
                      >
                          {subMode === 'all' ? 'All Types' : subMode.charAt(0).toUpperCase() + subMode.slice(1)}
                      </Button>
                  ))}
                </div>
              )}
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
