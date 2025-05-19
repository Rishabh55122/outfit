
'use client';

import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from '@/components/ui/textarea'; // Added for occasion
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UploadCloud, AlertCircle, Sparkles, Trash2, Palette, CalendarDays, VenusAndMars, ServerCrash, ThumbsUp, Wand2 } from 'lucide-react';

import ItemPreview from '@/components/outfit/ItemPreview';
import OutfitDisplay from '@/components/outfit/OutfitDisplay';
import LoadingSpinner from '@/components/outfit/LoadingSpinner';
import { suggestOutfit, type SuggestOutfitInput, type SuggestOutfitOutput } from '@/ai/flows/suggest-outfit';
import { useToast } from '@/hooks/use-toast';

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const genderOptions = [
  { id: "female", label: "Female Style", icon: VenusAndMars },
  { id: "male", label: "Male Style", icon: VenusAndMars },
  { id: "neutral", label: "Neutral / Any Style", icon: VenusAndMars },
];


export default function CreateOutfitPage() {
  const [uploadedItems, setUploadedItems] = useState<File[]>([]);
  const [uploadedItemPreviews, setUploadedItemPreviews] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestOutfitOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gender, setGender] = useState<string>('neutral');
  const [occasion, setOccasion] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      let newItems: File[] = [];
      let newPreviews: string[] = [];
      let Verror = "";

      if (uploadedItems.length + files.length > MAX_FILES) {
        Verror = `You can upload a maximum of ${MAX_FILES} items.`;
      } else {
        files.forEach(file => {
          if (file.size > MAX_FILE_SIZE_BYTES) {
            Verror = `File "${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB size limit.`;
            return;
          }
          if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
            Verror = `File "${file.name}" is not a supported image type.`;
            return;
          }
          newItems.push(file);
          newPreviews.push(URL.createObjectURL(file));
        });
      }

      if (Verror) {
        toast({
          variant: "destructive",
          title: "Upload Error",
          description: Verror,
        });
      } else if (newItems.length > 0) {
        setUploadedItems(prev => [...prev, ...newItems]);
        setUploadedItemPreviews(prev => [...prev, ...newPreviews]);
        toast({
          title: "Items Added",
          description: `${newItems.length} item(s) successfully added to your selection.`,
        });
      }
      // Reset file input to allow re-uploading the same file if removed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveItem = (index: number) => {
    const itemName = uploadedItems[index]?.name || 'Item';
    setUploadedItems(prev => prev.filter((_, i) => i !== index));
    setUploadedItemPreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      newPreviews.forEach(preview => URL.revokeObjectURL(preview)); // Clean up old previews
      return newPreviews;
    });
    toast({
      title: "Item Removed",
      description: `${itemName} has been removed.`,
    });
  };

  const handleClearAll = () => {
    uploadedItemPreviews.forEach(preview => URL.revokeObjectURL(preview));
    setUploadedItems([]);
    setUploadedItemPreviews([]);
    setSuggestions(null);
    setError(null);
    toast({
      title: "Selection Cleared",
      description: "All uploaded items have been removed.",
    });
  };

  const convertFileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (uploadedItems.length === 0) {
      setError('Please upload at least one clothing item.');
      toast({
        variant: "destructive",
        title: "No Items Uploaded",
        description: "You need to upload items to get suggestions.",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuggestions(null);

    try {
      const clothingItemDataUris = await Promise.all(
        uploadedItems.map(file => convertFileToDataUri(file))
      );

      const input: SuggestOutfitInput = {
        clothingItemDataUris,
        occasion: occasion || undefined,
        gender: gender || undefined,
      };

      const result = await suggestOutfit(input);
      if (result && result.outfits && result.outfits.length > 0) {
        setSuggestions(result);
        toast({
          title: "Outfits Suggested!",
          description: "StyleSniff has curated some looks for you.",
        });
      } else {
        setError("StyleSniff couldn't generate outfits this time. Try different items or options!");
        setSuggestions(null); // Ensure no old suggestions are shown
      }
    } catch (e: any) {
      console.error('Error suggesting outfit:', e);
      setError(e.message || 'An unexpected error occurred. Please try again.');
      toast({
        variant: "destructive",
        title: "Suggestion Failed",
        description: e.message || "Could not generate outfit suggestions.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground flex items-center justify-center gap-3">
          <Wand2 className="w-10 h-10 text-primary" />
          StyleSniff Studio
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Upload your clothing items, set your style preferences, and let our AI craft unique outfit combinations for you.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Inputs */}
        <div className="md:col-span-5 lg:col-span-4">
          <Card className="shadow-xl sticky top-24 border-2 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl gap-2">
                <UploadCloud className="text-primary" />
                Your Wardrobe
              </CardTitle>
              <CardDescription>
                Add up to {MAX_FILES} items. Max {MAX_FILE_SIZE_MB}MB per image.
                (JPG, PNG, WEBP, GIF)
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="file-upload" className="sr-only">Upload clothing items</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    disabled={isLoading || uploadedItems.length >= MAX_FILES}
                  />
                   {uploadedItems.length >= MAX_FILES && (
                    <p className="text-xs text-destructive mt-1.5">Maximum items reached.</p>
                  )}
                </div>

                {uploadedItemPreviews.length > 0 && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      {uploadedItemPreviews.map((preview, index) => (
                        <ItemPreview
                          key={index}
                          src={preview}
                          alt={uploadedItems[index]?.name || `Uploaded item ${index + 1}`}
                          onRemove={() => handleRemoveItem(index)}
                        />
                      ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={handleClearAll} className="w-full text-destructive hover:border-destructive/50">
                      <Trash2 className="mr-2 h-4 w-4" /> Clear All Items
                    </Button>
                  </div>
                )}
                <Separator />
                <div className="space-y-3">
                  <Label className="text-md font-semibold flex items-center gap-2"><VenusAndMars className="text-primary"/>Style Preference</Label>
                  <RadioGroup value={gender} onValueChange={setGender} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    {genderOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.id} id={`gender-${option.id}`} />
                        <Label htmlFor={`gender-${option.id}`} className="font-normal text-sm cursor-pointer">{option.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="occasion" className="text-md font-semibold flex items-center gap-2"><CalendarDays className="text-primary"/>Occasion (Optional)</Label>
                  <Textarea
                    id="occasion"
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    placeholder="e.g., Casual weekend, Office party, Date night..."
                    className="text-sm"
                    rows={2}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full text-base py-6" disabled={isLoading || uploadedItems.length === 0}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" /> Get Outfit Suggestions
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Right Column: Results / Placeholders */}
        <div className="md:col-span-7 lg:col-span-8">
          {isLoading && <LoadingSpinner text="StyleSniff is curating your looks..." size={64} />}
          
          {!isLoading && error && (
             <Card className="border-destructive/50 bg-destructive/5 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle size={24} /> Oops! Something Went Wrong
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-destructive-foreground">{error}</p>
                 <Button onClick={() => setError(null)} variant="outline" className="mt-4 border-destructive/70 text-destructive hover:bg-destructive/10">
                  Try Again or Adjust
                </Button>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && suggestions && suggestions.outfits.length > 0 && (
            <OutfitDisplay suggestions={suggestions} uploadedItemPreviews={uploadedItemPreviews} />
          )}
          
          {!isLoading && !error && (!suggestions || suggestions.outfits.length === 0) && (
            <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5 shadow-lg text-center py-12 px-6">
              <CardHeader>
                <CardTitle className="text-2xl md:text-3xl font-semibold text-primary mb-3 flex items-center justify-center gap-3">
                  <Palette size={32} />
                  Ready for a Style Upgrade?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-lg">
                  Upload your clothing items using the panel on the left.
                </p>
                <p className="text-muted-foreground">
                  Select your style preference, optionally add an occasion, and let StyleSniff&apos;s AI inspire your next look!
                </p>
                <Sparkles className="mx-auto h-10 w-10 text-primary/50 mt-6 animate-pulse" />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

