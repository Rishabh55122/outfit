
'use client';

import { useState, type ChangeEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { UploadCloud, AlertCircle, Sparkles, Trash2, UserCheck } from 'lucide-react';

import ItemPreview from '@/components/outfit/ItemPreview';
import OutfitDisplay from '@/components/outfit/OutfitDisplay';
import LoadingSpinner from '@/components/outfit/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

import { suggestOutfit, type SuggestOutfitOutput, type SuggestOutfitInput } from '@/ai/flows/suggest-outfit';

export default function OutfitGeneratorPage() {
  const [uploadedItemFiles, setUploadedItemFiles] = useState<File[]>([]);
  const [itemPreviews, setItemPreviews] = useState<string[]>([]);
  const [occasion, setOccasion] = useState<string>('');
  const [gender, setGender] = useState<string>(''); // New state for gender
  const [suggestedOutfits, setSuggestedOutfits] = useState<SuggestOutfitOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const MAX_FILES = 5; // Max number of files allowed

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      
      if (uploadedItemFiles.length + filesArray.length > MAX_FILES) {
        toast({
          title: 'Upload Limit Exceeded',
          description: `You can upload a maximum of ${MAX_FILES} items.`,
          variant: 'destructive',
        });
        return;
      }

      setUploadedItemFiles(prevFiles => [...prevFiles, ...filesArray]);

      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setItemPreviews(prevPreviews => [...prevPreviews, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
      // Clear the input value to allow re-uploading the same file after removal
      event.target.value = '';
    }
  };

  const handleRemoveItem = (indexToRemove: number) => {
    setUploadedItemFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    setItemPreviews(prevPreviews => prevPreviews.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async () => {
    if (itemPreviews.length === 0) {
      setError('Please upload at least one clothing item.');
      toast({ title: "No items uploaded", description: "Upload an item to get suggestions.", variant: "destructive" });
      return;
    }
    if (!gender) {
      setError('Please select a gender preference.');
      toast({ title: "Gender not selected", description: "Please select a gender for tailored suggestions.", variant: "destructive"});
      return;
    }
    setError(null);
    setIsLoading(true);
    setSuggestedOutfits(null);

    try {
      const input: SuggestOutfitInput = {
        clothingItemDataUris: itemPreviews,
        occasion: occasion || undefined,
        gender: gender || undefined, // Pass gender to the AI flow
      };
      const result = await suggestOutfit(input);
      setSuggestedOutfits(result);
      if (!result.outfits || result.outfits.length === 0) {
        toast({ title: "No specific outfits found", description: "Try different items, occasions, or gender selections." });
      } else {
        toast({ title: "Outfits Suggested!", description: "Check out your new looks below."});
      }
    } catch (e) {
      console.error('Error suggesting outfit:', e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to get outfit suggestions: ${errorMessage}`);
      toast({ title: "Suggestion Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="text-center py-6">
        <h1 className="text-4xl font-bold text-primary mb-2">
          Welcome to OutfitAI
        </h1>
        <p className="text-lg text-muted-foreground">
          Upload your clothing items and let our AI craft the perfect look for any occasion!
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UploadCloud className="text-primary" /> Upload Your Wardrobe</CardTitle>
            <CardDescription>Add images of your clothes (max {MAX_FILES} items). Supported formats: JPG, PNG.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="clothing-upload" className="sr-only">Upload clothing items</Label>
              <Input
                id="clothing-upload"
                type="file"
                multiple
                accept="image/jpeg, image/png"
                onChange={handleFileChange}
                disabled={isLoading || uploadedItemFiles.length >= MAX_FILES}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
               {uploadedItemFiles.length > 0 && (
                 <Button variant="outline" size="sm" onClick={() => { setUploadedItemFiles([]); setItemPreviews([]); }} className="mt-2">
                   <Trash2 className="mr-2 h-4 w-4" /> Clear All Items
                 </Button>
               )}
            </div>

            {itemPreviews.length > 0 && (
              <div>
                <h3 className="font-medium mb-2 text-foreground">Uploaded Items:</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {itemPreviews.map((previewSrc, index) => (
                    <ItemPreview
                      key={index}
                      src={previewSrc}
                      alt={`Uploaded item ${index + 1}`}
                      onRemove={() => handleRemoveItem(index)}
                    />
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">Suggest Outfits For:</Label>
              <RadioGroup
                value={gender}
                onValueChange={setGender}
                className="flex space-x-4"
                disabled={isLoading}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">Female</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="neutral" id="neutral" />
                  <Label htmlFor="neutral">Neutral / Any</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="occasion" className="block text-sm font-medium text-foreground mb-1">What's the Occasion? (Optional)</Label>
              <Input
                id="occasion"
                type="text"
                placeholder="e.g., Casual brunch, Office party, Date night"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                disabled={isLoading}
                className="bg-background"
              />
            </div>

            <Button onClick={handleSubmit} disabled={isLoading || itemPreviews.length === 0 || !gender} className="w-full text-base py-3">
              {isLoading ? 'Styling Your Look...' : 'Get Outfit Suggestions'}
              {!isLoading && <Sparkles className="ml-2 h-5 w-5" />}
            </Button>
          </CardContent>
        </Card>

        <div className="lg:sticky lg:top-8">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
           {!isLoading && !suggestedOutfits && !error && (
             <Card className="bg-accent/30 border-accent shadow-md">
                <CardContent className="pt-6 text-center">
                  <UserCheck className="mx-auto h-12 w-12 text-accent mb-3" />
                  <h3 className="text-xl font-semibold text-accent-foreground">Personalize Your Style</h3>
                  <p className="text-muted-foreground mt-2">
                    Select a gender preference, upload your items, mention an occasion, and let our AI stylist create amazing looks for you!
                  </p>
                </CardContent>
              </Card>
           )}
        </div>
      </div>
      
      <Separator className="my-8" />

      {isLoading && <LoadingSpinner text="Crafting your perfect outfits... Please wait." />}
      
      {!isLoading && suggestedOutfits && (
        <OutfitDisplay suggestions={suggestedOutfits} uploadedItemPreviews={itemPreviews} />
      )}
    </div>
  );
}
