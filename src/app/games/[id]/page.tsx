import { notFound } from 'next/navigation';
import { getGame, getGames } from '@/lib/games-service';
import GameDetailsClient from '@/components/game-details-client';
import type { Metadata } from 'next';
import type { GameCategory } from '@/types';

type Props = {
  params: { id: string }
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const id = params.id;
  const game = await getGame(id);
 
  return {
    title: game ? `${game.name} | Esports HQ` : 'Game Details',
  }
}

export async function generateStaticParams() {
  const games: GameCategory[] = await getGames();
  if (!Array.isArray(games)) {
    return [];
  }
  return games.map((game) => ({
    id: game.id,
  }));
}

export default async function GameDetailsPage({ params }: { params: { id: string } }) {
    const game = await getGame(params.id);

    if (!game) {
        notFound();
    }

    return <GameDetailsClient game={game} />;
}
