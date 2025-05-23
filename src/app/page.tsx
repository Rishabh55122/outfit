
'use client';

import { useState, useRef, ChangeEvent, FormEvent, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Plus, UploadCloud, AlertCircle, Sparkles, Trash2, Palette, CalendarDays, VenusAndMars, Wand2, Loader2, ImageOff } from 'lucide-react';

import ItemPreview from '@/components/outfit/ItemPreview';
import OutfitDisplay from '@/components/outfit/OutfitDisplay';
import LoadingSpinner from '@/components/outfit/LoadingSpinner';
import { suggestOutfit, type SuggestOutfitInput, type SuggestOutfitOutput } from '@/ai/flows/suggest-outfit';
import { useToast } from '@/hooks/use-toast';

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const genderOptions = [
  { id: "female", label: "Female Style" },
  { id: "male", label: "Male Style" },
  { id: "neutral", label: "Neutral / Any Style" },
];

const inspirationalImages = [
  { src: '/images/placeholder-1.jpeg', alt: 'Woman in white shirt and blue jeans walking in a city', dataAiHint: 'woman street style' },
  { src: '/images/placeholder-2.jpg', alt: 'Woman in light blazer and denim shorts', dataAiHint: 'woman denim shorts' },
  { src: '/images/placeholder-3.png', alt: 'Woman in oversized beige blazer and sunglasses', dataAiHint: 'woman oversized blazer' },
  { src: '/images/placeholder-4.png', alt: 'Woman in beige blazer, white top, and denim shorts', dataAiHint: 'woman fashion' },
  { src: '/images/placeholder-5.png', alt: 'Woman in black blazer and light wash jeans', dataAiHint: 'woman street style' },
];

type ViewMode = 'initial' | 'form' | 'loading' | 'results' | 'error_state';


export default function CombinedPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('initial');
  const [uploadedItems, setUploadedItems] = useState<File[]>([]);
  const [uploadedItemPreviews, setUploadedItemPreviews] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestOutfitOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For button loading state
  const [formError, setFormError] = useState<string | null>(null); // For form-level errors
  const [gender, setGender] = useState<string>('neutral');
  const [occasion, setOccasion] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      let newItems: File[] = [];
      let newPreviews: string[] = [];
      let validationErrorMsg = "";

      if (uploadedItems.length + files.length > MAX_FILES) {
        validationErrorMsg = `You can upload a maximum of ${MAX_FILES} items.`;
      } else {
        files.forEach(file => {
          if (file.size > MAX_FILE_SIZE_BYTES) {
            validationErrorMsg = `File "${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB size limit.`;
            return;
          }
          if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
            validationErrorMsg = `File "${file.name}" is not a supported image type.`;
            return;
          }
          newItems.push(file);
          newPreviews.push(URL.createObjectURL(file));
        });
      }

      if (validationErrorMsg) {
        toast({
          variant: "destructive",
          title: "Upload Error",
          description: validationErrorMsg,
        });
      } else if (newItems.length > 0) {
        setUploadedItems(prev => [...prev, ...newItems]);
        setUploadedItemPreviews(prev => [...prev, ...newPreviews]);
        setViewMode('form'); // Transition to form view
        setFormError(null); // Clear previous errors
        setSuggestions(null); // Clear previous suggestions
        toast({
          title: "Items Added",
          description: `${newItems.length} item(s) successfully added.`,
        });
      }
      // Reset file input value to allow re-uploading the same file
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
      URL.revokeObjectURL(prev[index]); // Clean up object URL
      return newPreviews;
    });
    toast({
      title: "Item Removed",
      description: `${itemName} has been removed.`,
    });
    if (uploadedItems.length -1 === 0) {
        setViewMode('initial'); // Go back to initial if all items removed
    }
  };

  const handleClearAll = () => {
    uploadedItemPreviews.forEach(preview => URL.revokeObjectURL(preview));
    setUploadedItems([]);
    setUploadedItemPreviews([]);
    setSuggestions(null);
    setFormError(null);
    setViewMode('initial'); // Go back to initial view
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
      setFormError('Please upload at least one clothing item.');
      toast({
        variant: "destructive",
        title: "No Items Uploaded",
        description: "You need to upload items to get suggestions.",
      });
      return;
    }

    setIsLoading(true);
    setViewMode('loading');
    setFormError(null);
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
        setViewMode('results');
        toast({
          title: "Outfits Suggested!",
          description: "StyleSniff has curated some looks for you.",
        });
      } else {
        setFormError("StyleSniff couldn't generate outfits this time. Try different items or options!");
        setViewMode('error_state');
        setSuggestions(null);
      }
    } catch (e: any) {
      console.error('Error suggesting outfit:', e);
      setFormError(e.message || 'An unexpected error occurred. Please try again.');
      setViewMode('error_state');
      toast({
        variant: "destructive",
        title: "Suggestion Failed",
        description: e.message || "Could not generate outfit suggestions.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cleanup object URLs on component unmount
  useEffect(() => {
    return () => {
      uploadedItemPreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [uploadedItemPreviews]);


  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] overflow-hidden">
      {/* Hidden File Input */}
      <Input
        id="file-upload-hidden"
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />

      {viewMode === 'initial' && (
        <>
          {/* Image Gallery Section */}
          <div className="relative w-full flex justify-center items-end gap-3 sm:gap-4 px-4 pt-12 sm:pt-20 h-[300px] sm:h-[400px] md:h-[500px]">
            {inspirationalImages.map((image, index) => (
              <div
                key={index}
                className="relative rounded-[40px] sm:rounded-[60px] overflow-hidden shadow-2xl h-full
                           w-[18%] sm:w-[19%] md:w-[18%] max-w-[200px] sm:max-w-[250px] md:max-w-[300px]
                           transition-all duration-300 ease-in-out hover:scale-105"
                style={{
                  transform: `translateY(${index === 2 ? '-20px' : '0px'}) rotate(${index * 2 - 4}deg)`,
                  zIndex: index === 2 ? 10 : 1,
                }}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-300 group-hover:scale-110"
                  data-ai-hint={image.dataAiHint}
                  sizes="(max-width: 640px) 18vw, (max-width: 768px) 19vw, 18vw"
                  priority={index < 3}
                />
              </div>
            ))}
          </div>

          {/* Central Upload Button */}
          <div className="relative z-20 mt-[-40px] sm:mt-[-60px]">
            <div className="p-1 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 hover:shadow-xl transition-shadow">
              <Button size="lg" className="rounded-full text-lg sm:text-xl px-10 sm:px-16 py-6 sm:py-8 bg-black text-white hover:bg-gray-800 font-semibold" onClick={triggerFileInput}>
                Upload outfit
              </Button>
            </div>
          </div>

          {/* Text Content Section */}
          <div className="text-center px-4 mt-12 sm:mt-16 pb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground tracking-tight">
              Discover your style
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl sm:max-w-2xl mx-auto">
              StyleSniff uses AI to help you discover new looks from your wardrobe. Upload your items, and let us inspire your next outfit! Perfect for finding trends or completing your style.
            </p>
          </div>
        </>
      )}

      {(viewMode === 'form' || viewMode === 'loading' || viewMode === 'results' || viewMode === 'error_state') && (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full">
           <header className="mb-12 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground flex items-center justify-center gap-3">
              <Wand2 className="w-10 h-10 text-primary" />
              StyleSniff Studio
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Refine your selection, set your style preferences, and let our AI craft unique outfit combinations for you.
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
                      <Label htmlFor="file-upload-visible" className="sr-only">Upload more clothing items</Label>
                       <Button type="button" variant="outline" className="w-full" onClick={triggerFileInput} disabled={isLoading || uploadedItems.length >= MAX_FILES}>
                        <UploadCloud className="mr-2 h-4 w-4" />
                        {uploadedItems.length > 0 ? 'Add More Items' : 'Upload Items'}
                      </Button>
                       {uploadedItems.length >= MAX_FILES && (
                        <p className="text-xs text-destructive mt-1.5">Maximum items reached.</p>
                      )}
                    </div>

                    {uploadedItemPreviews.length > 0 && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          {uploadedItemPreviews.map((preview, index) => (
                            <ItemPreview
                              key={`${preview}-${index}`} // Use a more unique key
                              src={preview}
                              alt={uploadedItems[index]?.name || `Uploaded item ${index + 1}`}
                              onRemove={() => handleRemoveItem(index)}
                            />
                          ))}
                        </div>
                        <Button variant="outline" size="sm" onClick={handleClearAll} className="w-full text-destructive hover:text-destructive hover:border-destructive/50">
                          <Trash2 className="mr-2 h-4 w-4" /> Clear All Items
                        </Button>
                      </div>
                    )}
                    <Separator />
                    <div className="space-y-3">
                      <Label className="text-md font-semibold flex items-center gap-2"><VenusAndMars className="text-primary"/>Style Preference</Label>
                      <RadioGroup value={gender} onValueChange={setGender} className="flex flex-col sm:flex-row flex-wrap gap-x-6 gap-y-3 items-start sm:items-center">
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
                    <Button type="submit" size="lg" className="w-full h-11" disabled={isLoading || uploadedItems.length === 0}>
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
              {viewMode === 'loading' && <LoadingSpinner text="StyleSniff is curating your looks..." size={64} />}
              
              {viewMode === 'error_state' && formError && (
                 <Card className="border-destructive/50 bg-destructive/5 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <AlertCircle size={24} /> Oops! Something Went Wrong
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-destructive-foreground">{formError}</p>
                     <Button onClick={() => { setFormError(null); setViewMode(uploadedItems.length > 0 ? 'form' : 'initial'); }} variant="outline" className="mt-4 border-destructive/70 text-destructive hover:bg-destructive/10 hover:text-destructive">
                      Try Again or Adjust
                    </Button>
                  </CardContent>
                </Card>
              )}

              {viewMode === 'results' && suggestions && suggestions.outfits.length > 0 && (
                <OutfitDisplay suggestions={suggestions} uploadedItemPreviews={uploadedItemPreviews} />
              )}
              
              {viewMode === 'form' && (!suggestions || suggestions.outfits.length === 0) && (
                 <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5 shadow-lg text-center py-12 px-6">
                  <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl font-semibold text-primary mb-3 flex items-center justify-center gap-3">
                      <Palette size={32} />
                      Ready for a Style Upgrade?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-muted-foreground text-lg">
                      Your items are uploaded!
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
      )}
    </div>
  );
}

    