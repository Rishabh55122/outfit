
'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Share2, Loader2, ExternalLink } from 'lucide-react'; // Added Loader2 and ExternalLink
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { SuggestedItem } from '@/ai/flows/suggest-outfit';
import { generateItemImage } from '@/ai/flows/generate-item-image-flow';

interface OutfitCardProps {
  outfit: {
    description: string;
    items: SuggestedItem[];
  };
  uploadedItemPreviews: string[];
}

function getItemKeywords(itemName: string): string {
  const commonWords = ['a', 'an', 'the', 'of', 'with', 'for', 'on', 'in', 'and', 'or', 'uploaded', 'pair', 'of'];
  const words = itemName.toLowerCase().split(' ').filter(word => !commonWords.includes(word) && word.length > 2);
  if (words.length >= 2) {
    const twoLastWords = `${words[words.length - 2]} ${words[words.length - 1]}`;
    if (twoLastWords.length > 5) return twoLastWords;
    return words[words.length -1];
  }
  if (words.length === 1) {
    return words[0];
  }
  return "clothing";
}

export default function OutfitCard({ outfit, uploadedItemPreviews }: OutfitCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();
  const [currentUrl, setCurrentUrl] = useState('');

  // State for managing image sources and loading states for each item
  const [itemImageStates, setItemImageStates] = useState<Array<{ src: string | null; isLoading: boolean }>>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  useEffect(() => {
    // Initialize states for each item
    const initialStates = outfit.items.map(item => ({
      src: (item.inputIndex !== undefined && item.inputIndex >= 0 && item.inputIndex < uploadedItemPreviews.length)
           ? uploadedItemPreviews[item.inputIndex]
           : null, // Null for generic items, to be generated
      isLoading: item.inputIndex === undefined, // Start loading if it's a generic item
    }));
    setItemImageStates(initialStates);

    // Generate images for generic items
    outfit.items.forEach(async (item, index) => {
      if (item.inputIndex === undefined) { // Generic item
        try {
          const result = await generateItemImage({ itemDescription: item.name });
          setItemImageStates(prevStates => {
            const newStates = [...prevStates];
            if (newStates[index]) {
              newStates[index] = { src: result.imageDataUri, isLoading: false };
            }
            return newStates;
          });
        } catch (error) {
          console.error(`Failed to generate image for '${item.name}':`, error);
          toast({
            title: `Image Generation Failed`,
            description: `Could not generate an image for "${item.name}".`,
            variant: "destructive"
          });
          setItemImageStates(prevStates => {
            const newStates = [...prevStates];
             if (newStates[index]) {
                newStates[index] = { src: `https://placehold.co/100x100.png?text=Error`, isLoading: false };
             }
            return newStates;
          });
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outfit.items, uploadedItemPreviews]); // Do not add toast to dependency array to avoid re-triggering image generation

  const handleShare = async () => {
    const shareData = {
      title: 'OutfitAI Suggestion',
      text: `Check out this outfit: ${outfit.description}\nItems: ${outfit.items.map(item => item.name).join(', ')}`,
      url: currentUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        navigator.clipboard.writeText(shareData.text + "\n" + shareData.url);
        toast({ title: "Copied to clipboard!", description: "Outfit details copied to clipboard." });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({ title: "Sharing failed", description: "Could not share the outfit.", variant: "destructive" });
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Outfit Unsaved" : "Outfit Saved!",
      description: isSaved ? "Removed from your saved looks." : "Added to your saved looks (locally).",
    });
  };

  const handlePinterestSearch = () => {
    const queryItems = outfit.items.map(item => item.name).join(' ');
    const searchQuery = `${queryItems} outfit street style`;
    const pinterestUrl = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(searchQuery)}`;
    window.open(pinterestUrl, '_blank');
  };

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl text-primary">{outfit.description}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        <p className="text-sm text-muted-foreground">Items in this look:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {outfit.items.map((item, index) => {
            const imageState = itemImageStates[index] || { src: `https://placehold.co/100x100.png`, isLoading: item.inputIndex === undefined };
            const altText = item.name || `Outfit item ${index + 1}`;
            const dataAiHint = item.inputIndex !== undefined ? "clothing item" : getItemKeywords(item.name);

            return (
              <div key={`${item.name}-${index}`} className="border border-border p-3 rounded-md bg-background/50 flex flex-col items-center text-center shadow-sm">
                <div className="w-[80px] h-[80px] mb-2 flex items-center justify-center">
                  {imageState.isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  ) : (
                    <Image
                      src={imageState.src || `https://placehold.co/100x100.png`}
                      alt={altText}
                      width={80}
                      height={80}
                      className="rounded object-contain aspect-square"
                      data-ai-hint={dataAiHint}
                    />
                  )}
                </div>
                <p className="text-xs font-medium text-foreground line-clamp-2">{altText}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-1 sm:space-x-2 bg-muted/50 p-3 mt-auto">
        <Button variant="ghost" size="icon" onClick={handleSave} aria-label="Save outfit">
          <Heart className={cn("h-5 w-5", isSaved ? "fill-destructive text-destructive" : "text-muted-foreground")} />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleShare} aria-label="Share outfit" disabled={!currentUrl}>
          <Share2 className="h-5 w-5 text-muted-foreground" />
        </Button>
        <Button variant="outline" size="sm" onClick={handlePinterestSearch} aria-label="See on Pinterest" className="px-2 sm:px-3">
          <ExternalLink className="h-4 w-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Pinterest</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
