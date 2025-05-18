
'use server';
/**
 * @fileOverview An AI flow to generate an image for a given clothing item description.
 *
 * - generateItemImage - A function that generates an image.
 * - GenerateItemImageInput - The input type for the generateItemImage function.
 * - GenerateItemImageOutput - The return type for the generateItemImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateItemImageInputSchema = z.object({
  itemDescription: z.string().describe('The description of the clothing item to generate an image for.'),
});
export type GenerateItemImageInput = z.infer<typeof GenerateItemImageInputSchema>;

const GenerateItemImageOutputSchema = z.object({
  imageDataUri: z.string().describe("The generated image as a data URI. Format: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateItemImageOutput = z.infer<typeof GenerateItemImageOutputSchema>;

export async function generateItemImage(input: GenerateItemImageInput): Promise<GenerateItemImageOutput> {
  return generateItemImageFlow(input);
}

const generateItemImageFlow = ai.defineFlow(
  {
    name: 'generateItemImageFlow',
    inputSchema: GenerateItemImageInputSchema,
    outputSchema: GenerateItemImageOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', // IMPORTANT: Model for image generation
      prompt: `Generate a photorealistic image of a single clothing item: '${input.itemDescription}'. The item should be displayed clearly on a plain white or light gray background, suitable for an e-commerce product listing. Avoid any human models or distracting elements.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE
         safetySettings: [ // Added safety settings to be less restrictive for common clothing items
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed or did not return a media URL.');
    }

    return { imageDataUri: media.url };
  }
);
