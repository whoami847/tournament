'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { GameCategory } from '@/types';

export default function GameDetailsClient({ game }: { game: GameCategory }) {
    return (
        <div className="container mx-auto px-4 py-8 md:pb-8 pb-24">
             <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Button asChild variant="outline" className="mb-8">
                    <Link href="/games">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to All Games
                    </Link>
                </Button>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="md:col-span-1"
                >
                    <Image
                        src={game.image}
                        alt={game.name}
                        width={500}
                        height={500}
                        className="w-full aspect-square object-cover rounded-lg shadow-lg"
                        data-ai-hint={game.dataAiHint}
                    />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="md:col-span-2"
                >
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">{game.name}</h1>
                    <p className="mt-2 text-lg text-muted-foreground">{game.categories}</p>
                    <div className="mt-8 prose prose-invert max-w-none text-foreground/80">
                        <p>{game.description || "No description available for this game."}</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
