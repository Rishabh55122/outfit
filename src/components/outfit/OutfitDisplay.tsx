
import type { SuggestOutfitOutput } from '@/ai/flows/suggest-outfit';
import OutfitCard from './OutfitCard';
import { ThumbsUp } from 'lucide-react';

interface OutfitDisplayProps {
  suggestions: SuggestOutfitOutput | null;
  uploadedItemPreviews: string[];
}

export default function OutfitDisplay({ suggestions, uploadedItemPreviews }: OutfitDisplayProps) {
  if (!suggestions || suggestions.outfits.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">No outfit suggestions found this time. Try adjusting your items or criteria!</p>
      </div>
    );
  }

  return (
    <section aria-labelledby="suggested-outfits-title" className="py-8 md:py-12">
      <div className="text-center mb-8 md:mb-12">
        <h2 id="suggested-outfits-title" className="text-3xl md:text-4xl font-bold text-primary mb-2 tracking-tight">
          Voilà! Your AI-Styled Outfits
        </h2>
        <p className="text-md md:text-lg text-muted-foreground max-w-xl mx-auto">
          Here are some looks curated by our AI based on your selections.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
        {suggestions.outfits.map((outfit, index) => (
          <OutfitCard key={index} outfit={outfit} uploadedItemPreviews={uploadedItemPreviews} />
        ))}
      </div>
       {suggestions.outfits.length > 0 && (
        <div className="mt-12 text-center">
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <ThumbsUp className="h-5 w-5 text-green-500" />
            Happy with your suggestions? Save your favorites and find inspiration on Pinterest!
          </p>
        </div>
      )}
    </section>
  );
}
