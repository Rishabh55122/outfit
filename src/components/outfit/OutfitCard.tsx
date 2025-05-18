'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Share2, ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface OutfitCardProps {
  outfit: {
    description: string;
    items: string[];
  };
}

// Helper function to extract keywords for placeholder images
function getItemKeywords(itemName: string): string {
  const commonWords = ['a', 'an', 'the', 'of', 'with', 'for', 'on', 'in', 'and', 'or', 'uploaded', 'pair', 'of'];
  const words = itemName.toLowerCase().split(' ').filter(word => !commonWords.includes(word) && word.length > 2);
  if (words.length >= 2) {
    // Prefer specific terms like "denim jacket" over "blue jacket" if possible
    const twoLastWords = `${words[words.length - 2]} ${words[words.length - 1]}`;
    if (twoLastWords.length > 5) return twoLastWords; // Arbitrary length to prefer longer phrases
    return words[words.length -1]; // Default to last word if two words are too short
  }
  if (words.length === 1) {
    return words[0];
  }
  return "clothing"; // fallback
}


export default function OutfitCard({ outfit }: OutfitCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    const shareData = {
      title: 'OutfitAI Suggestion',
      text: `Check out this outfit: ${outfit.description}\nItems: ${outfit.items.join(', ')}`,
      url: typeof window !== 'undefined' ? window.location.href : '', 
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

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl text-primary">{outfit.description}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        <p className="text-sm text-muted-foreground">Items in this look:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {outfit.items.map((item, index) => (
            <div key={index} className="border border-border p-3 rounded-md bg-background/50 flex flex-col items-center text-center shadow-sm">
              <Image
                src={`https://placehold.co/100x100.png`}
                alt={item}
                width={80}
                height={80}
                className="rounded object-contain mb-2 aspect-square"
                data-ai-hint={getItemKeywords(item)}
              />
              <p className="text-xs font-medium text-foreground line-clamp-2">{item}</p>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2 bg-muted/50 p-3 mt-auto">
        <Button variant="ghost" size="icon" onClick={handleSave} aria-label="Save outfit">
          <Heart className={cn("h-5 w-5", isSaved ? "fill-destructive text-destructive" : "text-muted-foreground")} />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleShare} aria-label="Share outfit">
          <Share2 className="h-5 w-5 text-muted-foreground" />
        </Button>
      </CardFooter>
    </Card>
  );
}