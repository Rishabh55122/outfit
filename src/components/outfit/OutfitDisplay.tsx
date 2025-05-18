import type { SuggestOutfitOutput } from '@/ai/flows/suggest-outfit';
import OutfitCard from './OutfitCard';

interface OutfitDisplayProps {
  suggestions: SuggestOutfitOutput | null;
}

export default function OutfitDisplay({ suggestions }: OutfitDisplayProps) {
  if (!suggestions || suggestions.outfits.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No outfit suggestions yet. Upload some items and let AI inspire you!</p>
      </div>
    );
  }

  return (
    <section aria-labelledby="suggested-outfits-title" className="py-8">
      <h2 id="suggested-outfits-title" className="text-2xl font-semibold mb-6 text-center text-primary">
        Voilà! Your AI-Styled Outfits
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestions.outfits.map((outfit, index) => (
          <OutfitCard key={index} outfit={outfit} />
        ))}
      </div>
    </section>
  );
}