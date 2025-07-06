import { notFound } from 'next/navigation';
import { getTournament, getTournaments } from '@/lib/tournaments-service';
import TournamentJoinClient from '@/components/tournament-join-client';
import type { Tournament } from '@/types';
import type { Metadata } from 'next';

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;
  const tournament = await getTournament(id);
 
  return {
    title: tournament ? `Join ${tournament.name} | Esports HQ` : 'Join Tournament',
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


export default async function JoinTournamentPage({ params }: { params: { id: string } }) {
    const tournament = await getTournament(params.id);

    if (!tournament) {
        notFound();
    }

    return <TournamentJoinClient tournament={tournament} />;
}
