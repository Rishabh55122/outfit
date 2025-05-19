
'use client';

import Image from 'next/image';
import Link from 'next/link'; // Import Link
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const inspirationalImages = [
  { src: 'https://images.unsplash.com/photo-1611558709798-01547579a2d4?q=80&w=1887&auto=format&fit=crop', alt: 'Woman in white shirt and blue jeans walking in a city', dataAiHint: 'woman street style' },
  { src: 'https://placehold.co/300x500.png', alt: 'Woman in light blazer and denim shorts', dataAiHint: 'woman denim shorts' },
  { src: 'https://placehold.co/300x500.png', alt: 'Woman in oversized beige blazer and sunglasses', dataAiHint: 'woman oversized blazer' },
  { src: 'https://placehold.co/300x500.png', alt: 'Woman in beige blazer, white top, and denim shorts', dataAiHint: 'woman fashion' },
  { src: 'https://placehold.co/300x500.png', alt: 'Woman in black blazer and light wash jeans', dataAiHint: 'woman street style' },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] overflow-hidden">
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
            />
            {index === 0 && (
              <button
                aria-label="Add new outfit"
                className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20
                           bg-black/70 text-white rounded-full p-2 hover:bg-black transition-colors"
              >
                <Plus size={20} />
              </button>
            )}
             {index === inspirationalImages.length -1 && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 space-y-2 w-full px-2">
                    <div className="bg-black/70 text-white text-xs sm:text-sm text-center py-1.5 px-3 rounded-full backdrop-blur-sm">Skirts</div>
                    <div className="bg-yellow-400/80 text-black text-xs sm:text-sm text-center py-1.5 px-3 rounded-full backdrop-blur-sm">Combinations</div>
                </div>
            )}
          </div>
        ))}
      </div>

      {/* Central Upload Button */}
      <div className="relative z-20 mt-[-40px] sm:mt-[-60px]">
        <div className="p-1 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 hover:shadow-xl transition-shadow">
          <Link href="/create-outfit" passHref>
            <Button size="lg" className="rounded-full text-lg sm:text-xl px-10 sm:px-16 py-6 sm:py-8 bg-black text-white hover:bg-gray-800 font-semibold">
            Upload outfit
            </Button>
          </Link>
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
    </div>
  );
}
