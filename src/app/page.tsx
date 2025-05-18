
'use client';

import { useState, type ChangeEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { UploadCloud, AlertCircle, Sparkles, Trash2, UserCheck, Palette, CalendarDays, VenusAndMars } from 'lucide-react';

import ItemPreview from '@/components/outfit/ItemPreview';
import OutfitDisplay from '@/components/outfit/OutfitDisplay';
import LoadingSpinner from '@/components/outfit/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

import { suggestOutfit, type SuggestOutfitOutput, type SuggestOutfitInput } from '@/ai/flows/suggest-outfit';

export default function OutfitGeneratorPage() {
  const [uploadedItemFiles, setUploadedItemFiles] = useState<File[]>([]);
  const [itemPreviews, setItemPreviews] = useState<string[]>([]);
  const [occasion, setOccasion] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [suggestedOutfits, setSuggestedOutfits] = useState<SuggestOutfitOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const MAX_FILES = 5;

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
      setError('Please select a style preference.');
      toast({ title: "Style preference not selected", description: "Please select a style for tailored suggestions.", variant: "destructive"});
      return;
    }
    setError(null);
    setIsLoading(true);
    setSuggestedOutfits(null);

    try {
      const input: SuggestOutfitInput = {
        clothingItemDataUris: itemPreviews,
        occasion: occasion || undefined,
        gender: gender || undefined,
      };
      const result = await suggestOutfit(input);
      setSuggestedOutfits(result);
      if (!result.outfits || result.outfits.length === 0) {
        toast({ title: "No specific outfits found", description: "Try different items, occasions, or style selections." });
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
    <div className="space-y-10">
      <section className="text-center py-8 md:py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-3 tracking-tight">
          OutfitAI Studio
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Upload your clothing, pick your style, and let AI craft the perfect look for any occasion!
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <Card className="shadow-xl lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Palette className="text-primary h-7 w-7" /> Create Your Look
            </CardTitle>
            <CardDescription>Tell us about your style and wardrobe.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-1 rounded-lg">
              <Label htmlFor="clothing-upload" className="text-md font-semibold text-foreground mb-2 flex items-center gap-2">
                <UploadCloud className="text-primary h-5 w-5" /> Upload Your Items (Max {MAX_FILES})
              </Label>
              <Input
                id="clothing-upload"
                type="file"
                multiple
                accept="image/jpeg, image/png"
                onChange={handleFileChange}
                disabled={isLoading || uploadedItemFiles.length >= MAX_FILES}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
              {uploadedItemFiles.length > 0 && (
                 <Button variant="outline" size="sm" onClick={() => { setUploadedItemFiles([]); setItemPreviews([]); }} className="mt-3 text-muted-foreground hover:text-destructive hover:border-destructive">
                   <Trash2 className="mr-2 h-4 w-4" /> Clear All Items
                 </Button>
               )}
            </div>

            {itemPreviews.length > 0 && (
              <div className="p-1 rounded-lg">
                <h3 className="text-md font-semibold mb-3 text-foreground">Your Wardrobe Preview:</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
            
            <Separator />

            <div className="grid md:grid-cols-2 gap-6 p-1">
              <div>
                <Label className="text-md font-semibold text-foreground mb-3 flex items-center gap-2">
                  <VenusAndMars className="text-primary h-5 w-5" /> Style Preference
                </Label>
                <RadioGroup
                  value={gender}
                  onValueChange={setGender}
                  className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0"
                  disabled={isLoading}
                >
                  {(['female', 'Female Style'], ['male', 'Male Style'], ['neutral', 'Neutral / Any Style']).map(([value, label]) => (
                    <div key={value} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value={value} id={value} />
                      <Label htmlFor={value} className="font-normal cursor-pointer">{label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="occasion" className="text-md font-semibold text-foreground mb-3 flex items-center gap-2">
                   <CalendarDays className="text-primary h-5 w-5" /> Occasion (Optional)
                </Label>
                <Input
                  id="occasion"
                  type="text"
                  placeholder="e.g., Casual brunch, Office party"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  disabled={isLoading}
                  className="bg-background focus:border-primary"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSubmit} disabled={isLoading || itemPreviews.length === 0 || !gender} className="w-full text-lg py-6">
              {isLoading ? <LoadingSpinner text="Styling Your Look..." /> : 'Get Outfit Suggestions'}
              {!isLoading && <Sparkles className="ml-2 h-6 w-6" />}
            </Button>
          </CardFooter>
        </Card>

        <div className="lg:col-span-1 lg:sticky lg:top-10">
          {error && (
            <Alert variant="destructive" className="mb-6 shadow-md">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="text-lg">Oops! An Error Occurred</AlertTitle>
              <AlertDescription className="text-base">{error}</AlertDescription>
            </Alert>
          )}
           {!isLoading && !suggestedOutfits && !error && (
             <Card className="bg-gradient-to-br from-primary/10 via-card to-accent/10 border-primary/30 shadow-lg">
                <CardContent className="pt-8 pb-8 text-center space-y-3">
                  <UserCheck className="mx-auto h-16 w-16 text-primary opacity-80 mb-4" />
                  <h3 className="text-2xl font-semibold text-primary-foreground">Ready for a Style Upgrade?</h3>
                  <p className="text-muted-foreground text-md px-4">
                    Upload your items, select a style preference, and optionally tell us the occasion. Our AI stylist is eager to create amazing looks just for you!
                  </p>
                </CardContent>
              </Card>
           )}
        </div>
      </div>
      
      {!isLoading && suggestedOutfits && <Separator className="my-10" />}
      
      {isLoading && (
        <div className="py-10">
           <LoadingSpinner text="Crafting your perfect outfits... This might take a moment." size={60} />
        </div>
      )}
      
      {!isLoading && suggestedOutfits && (
        <OutfitDisplay suggestions={suggestedOutfits} uploadedItemPreviews={itemPreviews} />
      )}
    </div>
  );
}

