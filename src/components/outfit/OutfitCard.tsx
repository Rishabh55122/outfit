
'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge'; // Removed Badge import
import { Heart, Share2, Loader2, ExternalLink, ImageOff } from 'lucide-react';
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
  const commonWords = ['a', 'an', 'the', 'of', 'with', 'for', 'on', 'in', 'and', 'or', 'uploaded', 'pair', 'of', 'some', 'new', 'generic', 'classic', 'basic', 'stylish'];
  const words = itemName.toLowerCase().replace(/[^a-z0-9\s]/gi, '').split(' ').filter(word => !commonWords.includes(word) && word.length > 2);
  
  if (words.length === 0) return "clothing";
  if (words.length === 1) return words[0];
  
  // Prefer adjectives or nouns if identifiable, otherwise last two significant words
  const adjectives = ["black", "white", "red", "blue", "green", "denim", "leather", "cotton", "slim", "graphic", "vintage"]; // Simple list
  const nouns = ["shirt", "jeans", "sneakers", "dress", "jacket", "boots", "heels", "tee", "blouse", "skirt", "shorts", "sweater", "cardigan", "coat"];

  const significantWords = words.filter(w => adjectives.includes(w) || nouns.includes(w) || w.length > 3);

  if (significantWords.length >= 2) {
    return `${significantWords[significantWords.length - 2]} ${significantWords[significantWords.length - 1]}`.slice(0, 20);
  }
  if (significantWords.length === 1) {
    return significantWords[0];
  }
  // Fallback to last two words if no significant words found
  return `${words[words.length - 2] || ''} ${words[words.length - 1]}`.trim().slice(0, 20);
}


export default function OutfitCard({ outfit, uploadedItemPreviews }: OutfitCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();
  const [currentUrl, setCurrentUrl] = useState('');

  const [itemImageStates, setItemImageStates] = useState<Array<{ src: string | null; isLoading: boolean; hasError: boolean }>>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  useEffect(() => {
    const initialStates = outfit.items.map(item => ({
      src: (item.inputIndex !== undefined && item.inputIndex >= 0 && item.inputIndex < uploadedItemPreviews.length)
           ? uploadedItemPreviews[item.inputIndex]
           : null,
      isLoading: item.inputIndex === undefined,
      hasError: false,
    }));
    setItemImageStates(initialStates);

    outfit.items.forEach(async (item, index) => {
      if (item.inputIndex === undefined) {
        try {
          const result = await generateItemImage({ itemDescription: item.name });
          setItemImageStates(prevStates => {
            const newStates = [...prevStates];
            if (newStates[index]) {
              newStates[index] = { src: result.imageDataUri, isLoading: false, hasError: false };
            }
            return newStates;
          });
        } catch (error) {
          console.error(`Failed to generate image for '${item.name}':`, error);
          // No toast here to avoid spamming, error shown via placeholder
          setItemImageStates(prevStates => {
            const newStates = [...prevStates];
             if (newStates[index]) {
                newStates[index] = { src: null, isLoading: false, hasError: true };
             }
            return newStates;
          });
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outfit.items, uploadedItemPreviews]);

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
    const queryItems = outfit.items.map(item => item.name.replace("Uploaded ", "")).join(' '); // Remove "Uploaded" prefix for better search
    const searchQuery = `${queryItems} outfit street style`;
    const pinterestUrl = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(searchQuery)}`;
    window.open(pinterestUrl, '_blank');
  };

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full bg-card">
      <CardHeader className="pb-3 pt-5 px-5">
        <CardTitle className="text-xl md:text-2xl text-primary font-semibold">{outfit.description}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-5 flex-grow">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {outfit.items.map((item, index) => {
            const imageState = itemImageStates[index] || { src: null, isLoading: item.inputIndex === undefined, hasError: false };
            const altText = item.name || `Outfit item ${index + 1}`;
            const isUploadedItem = item.inputIndex !== undefined;
            const dataAiHint = isUploadedItem ? "clothing item" : getItemKeywords(item.name);
            const placeholderUrl = `https://placehold.co/150x150.png?text=${encodeURIComponent(item.name.split(' ').slice(0,2).join(' '))}`;


            return (
              <div key={`${item.name}-${index}-${index}`} className="group relative border border-border p-2 rounded-lg bg-background/60 flex flex-col items-center text-center shadow-sm aspect-[4/5] justify-between hover:shadow-md transition-shadow">
                <div className="w-full h-3/5 mb-2 flex items-center justify-center overflow-hidden rounded-md bg-muted/30">
                  {imageState.isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  ) : imageState.hasError ? (
                     <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <ImageOff className="h-8 w-8 mb-1" />
                        <span className="text-xs">No Image</span>
                      </div>
                  ) : (
                    <Image
                      src={imageState.src || placeholderUrl}
                      alt={altText}
                      width={150}
                      height={180} // Adjusted for aspect ratio
                      className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
                      data-ai-hint={dataAiHint}
                      onError={(e) => {
                        // Fallback if image source fails (e.g. invalid data URI from generation)
                        e.currentTarget.src = placeholderUrl;
                        e.currentTarget.onerror = null; // Prevent infinite loop
                         setItemImageStates(prevStates => {
                           const newStates = [...prevStates];
                           if (newStates[index]) newStates[index].hasError = true;
                           return newStates;
                         });
                      }}
                    />
                  )}
                </div>
                <div className="w-full">
                   {/* Removed "AI Generated" and "Your Item" badges */}
                  <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-2 leading-tight">{altText}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap justify-end items-center gap-2 bg-muted/30 p-4 mt-auto border-t">
        <Button variant="ghost" size="icon" onClick={handleSave} aria-label="Save outfit" className="text-muted-foreground hover:text-destructive">
          <Heart className={cn("h-5 w-5", isSaved ? "fill-destructive text-destructive" : "")} />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleShare} aria-label="Share outfit" disabled={!currentUrl} className="text-muted-foreground hover:text-primary">
          <Share2 className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="sm" onClick={handlePinterestSearch} aria-label="See on Pinterest" className="px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground">
          <ExternalLink className="h-4 w-4 mr-1.5" />
          <span>Inspiration</span>
        </Button>
      </CardFooter>
    </Card>
  );
}

