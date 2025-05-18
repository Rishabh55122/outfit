
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ItemPreviewProps {
  src: string;
  alt: string;
  onRemove: () => void;
}

export default function ItemPreview({ src, alt, onRemove }: ItemPreviewProps) {
  return (
    <div className="relative group border border-border rounded-lg overflow-hidden shadow-sm aspect-square bg-muted/20 hover:shadow-md transition-all">
      <Image 
        src={src} 
        alt={alt} 
        width={150} 
        height={150} 
        className="object-contain w-full h-full p-1 group-hover:scale-105 transition-transform" 
        data-ai-hint="clothing item" />
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 rounded-full"
        onClick={onRemove}
        aria-label="Remove item"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
