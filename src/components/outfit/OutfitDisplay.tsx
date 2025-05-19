
import type { SuggestOutfitOutput } from '@/ai/flows/suggest-outfit';
import OutfitCard from './OutfitCard';
import { ThumbsUp, ServerCrash } from 'lucide-react'; // Added ServerCrash for no results

interface OutfitDisplayProps {
  suggestions: SuggestOutfitOutput | null;
  uploadedItemPreviews: string[];
}

export default function OutfitDisplay({ suggestions, uploadedItemPreviews }: OutfitDisplayProps) {
  if (!suggestions || suggestions.outfits.length === 0) {
    // This case should ideally be handled by the parent component (page.tsx) now
    // But as a fallback:
    return (
      <div className="text-center py-12 bg-card rounded-lg shadow-md p-6">
        <ServerCrash className="mx-auto h-12 w-12 text-primary opacity-70 mb-4" />
        <h3 className="text-xl font-semibold text-primary-foreground">No Outfits Found</h3>
        <p className="text-lg text-muted-foreground">
          StyleSniff couldn't find any outfit suggestions this time. Try adjusting your items or criteria!
        </p>
      </div>
    );
  }

  return (
    <section aria-labelledby="suggested-outfits-title" className="space-y-8">
      <div className="text-center">
        <h2 id="suggested-outfits-title" className="text-3xl md:text-4xl font-bold text-primary mb-2 tracking-tight">
          Voilà! Your StyleSniff Looks
        </h2>
        <p className="text-md md:text-lg text-muted-foreground max-w-xl mx-auto">
          Here are some outfits curated by our AI based on your selections.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 gap-6"> 
      {/* Changed xl:grid-cols-3 to xl:grid-cols-1 as the right column is narrower now */}
        {suggestions.outfits.map((outfit, index) => (
          <OutfitCard key={index} outfit={outfit} uploadedItemPreviews={uploadedItemPreviews} />
        ))}
      </div>
       {suggestions.outfits.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <ThumbsUp className="h-5 w-5 text-green-500" />
            Happy with your suggestions? Save your favorites and find inspiration!
          </p>
        </div>
      )}
    </section>
  );
}
