'use server';
/**
 * @fileOverview AI-powered outfit suggestions based on uploaded clothing items.
 *
 * - suggestOutfit - A function that suggests outfit combinations.
 * - SuggestOutfitInput - The input type for the suggestOutfit function.
 * - SuggestOutfitOutput - The return type for the suggestOutfit function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOutfitInputSchema = z.object({
  clothingItemDataUris: z
    .array(z.string())
    .describe(
      'An array of clothing items as data URIs that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
    ),
  occasion: z.string().optional().describe('The occasion for which the outfit is being suggested.'),
});
export type SuggestOutfitInput = z.infer<typeof SuggestOutfitInputSchema>;

const SuggestedOutfitSchema = z.object({
  description: z.string().describe('A description of the suggested outfit.'),
  items: z.array(z.string()).describe('The items included in the outfit.'),
});

const SuggestOutfitOutputSchema = z.object({
  outfits: z.array(SuggestedOutfitSchema).describe('Suggested outfit combinations.'),
});
export type SuggestOutfitOutput = z.infer<typeof SuggestOutfitOutputSchema>;

export async function suggestOutfit(input: SuggestOutfitInput): Promise<SuggestOutfitOutput> {
  return suggestOutfitFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOutfitPrompt',
  input: {schema: SuggestOutfitInputSchema},
  output: {schema: SuggestOutfitOutputSchema},
  prompt: `You are a personal stylist that suggests outfits to users based on their wardrobe.

You are creative and follow fashion rules and color theory to suggest stylish looks.

Suggest outfits using the following clothing items:

{{#each clothingItemDataUris}}
Item {{@index}}: {{media url=this}}
{{/each}}

{{#if occasion}}
The occasion is: {{occasion}}
{{/if}}
`,
});

const suggestOutfitFlow = ai.defineFlow(
  {
    name: 'suggestOutfitFlow',
    inputSchema: SuggestOutfitInputSchema,
    outputSchema: SuggestOutfitOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
