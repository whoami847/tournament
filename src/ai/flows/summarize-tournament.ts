'use server';

/**
 * @fileOverview Provides a flow to generate summaries of esports tournaments,
 * focusing on key events for users who have bookmarked or joined them.
 *
 * - summarizeTournament - The main function to generate tournament summaries.
 * - SummarizeTournamentInput - Input type for the summarizeTournament function.
 * - SummarizeTournamentOutput - Output type for the summarizeTournament function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTournamentInputSchema = z.object({
  tournamentName: z.string().describe('The name of the esports tournament.'),
  events: z.array(z.string()).describe('A list of recent events in the tournament.'),
  userIsParticipating: z
    .boolean()
    .describe('Whether the user is participating in the tournament.'),
});
export type SummarizeTournamentInput = z.infer<typeof SummarizeTournamentInputSchema>;

const SummarizeTournamentOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A concise summary of the tournament events, highlighting key moments like match wins, upsets, and schedule changes.'
    ),
});
export type SummarizeTournamentOutput = z.infer<typeof SummarizeTournamentOutputSchema>;

export async function summarizeTournament(input: SummarizeTournamentInput): Promise<SummarizeTournamentOutput> {
  return summarizeTournamentFlow(input);
}

const summarizeTournamentPrompt = ai.definePrompt({
  name: 'summarizeTournamentPrompt',
  input: {schema: SummarizeTournamentInputSchema},
  output: {schema: SummarizeTournamentOutputSchema},
  prompt: `You are an AI assistant specialized in summarizing esports tournaments.

  Given the following tournament name and recent events, generate a concise summary that highlights key moments such as match wins, upsets, and schedule changes. Focus on delivering essential information to users who are either participating in or closely following the tournament.

  Tournament Name: {{{tournamentName}}}
  Recent Events:
  {{#each events}}
  - {{{this}}}
  {{/each}}

  {{#if userIsParticipating}}
  Include a special note regarding the user's participation and upcoming matches, if applicable.
  {{/if}}
  `,
});

const summarizeTournamentFlow = ai.defineFlow(
  {
    name: 'summarizeTournamentFlow',
    inputSchema: SummarizeTournamentInputSchema,
    outputSchema: SummarizeTournamentOutputSchema,
  },
  async input => {
    const {output} = await summarizeTournamentPrompt(input);
    return output!;
  }
);
