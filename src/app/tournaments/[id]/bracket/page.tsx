import { notFound } from 'next/navigation';
import { getTournament, getTournaments } from '@/lib/tournaments-service';
import BracketClient from '@/components/bracket-client';
import type { Metadata } from 'next';
import type { Tournament } from '@/types';

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;
  const tournament = await getTournament(id);
 
  return {
    title: tournament ? `${tournament.name} Bracket | Esports HQ` : 'Tournament Bracket',
  }
}

export async function generateStaticParams() {
  const tournaments: Tournament[] = await getTournaments();
  if (!Array.isArray(tournaments)) {
    return [];
  }
  return tournaments.map((tournament) => ({
    id: tournament.id,
  }));
}


export default async function BracketPage({ params }: { params: { id: string } }) {
    const tournament = await getTournament(params.id);

    if (!tournament) {
        notFound();
    }

    return <BracketClient tournament={tournament} />;
}
