
'use server';
/**
 * @fileOverview AI-powered outfit suggestions based on uploaded clothing items, occasion, and gender.
 *
 * - suggestOutfit - A function that suggests outfit combinations.
 * - SuggestOutfitInput - The input type for the suggestOutfit function.
 * - SuggestOutfitOutput - The return type for the suggestOutfit function.
 * - SuggestedItem - The type for an individual item within a suggested outfit.
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
  gender: z.string().optional().describe('The gender for which the outfit styles should be tailored (e.g., "female", "male", "neutral").'),
});
export type SuggestOutfitInput = z.infer<typeof SuggestOutfitInputSchema>;

const SuggestedItemSchema = z.object({
  name: z.string().describe('The name or description of the clothing item in the outfit.'),
  inputIndex: z.number().optional().describe('The 0-based index if this item is from the input clothingItemDataUris array. Omit this field if this is a new, generic item suggestion not present in the uploaded items.')
});
export type SuggestedItem = z.infer<typeof SuggestedItemSchema>;

const SuggestedOutfitSchema = z.object({
  description: z.string().describe('A description of the suggested outfit.'),
  items: z.array(SuggestedItemSchema).describe('The items included in the outfit, with their names and original input index if applicable.'),
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
  prompt: `You are a personal stylist that suggests outfits to users.
You will be given a list of clothing items the user has uploaded.

{{#if gender}}
The user has specified their gender preference as: '{{gender}}'. Please tailor your suggestions accordingly. If 'neutral' or 'any' is specified, provide gender-neutral or broadly appealing styles.
{{/if}}

Your task is to suggest 1 to 3 outfits. An outfit can be:
1. A combination of items from the user's uploaded list.
2. A combination of items from the user's uploaded list AND new, generic complementary items (e.g., "a pair of dark wash jeans", "white sneakers", "a black belt").

For each item in your suggested outfits:
- Provide a descriptive 'name' for every item (e.g., "Uploaded Red Blouse", "Classic Blue Jeans", "White Low-Top Sneakers").
- If the item is directly from the user's uploaded list, you MUST provide the 'inputIndex' which corresponds to its 0-based index in the 'clothingItemDataUris' array.
- If the item is a new, generic complementary suggestion (not from the uploaded list), you MUST OMIT the 'inputIndex' field for that item.

Be creative and follow fashion rules and color theory to suggest stylish looks appropriate for the specified gender (if any).

Input Clothing Items:
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
