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
    <div className="relative group border border-border rounded-lg overflow-hidden shadow-sm aspect-square">
      <Image src={src} alt={alt} width={150} height={150} className="object-cover w-full h-full" data-ai-hint="clothing item" />
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onRemove}
        aria-label="Remove item"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}