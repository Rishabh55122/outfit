
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-3xl font-bold text-foreground hover:opacity-80 transition-opacity">
          <Image
            src="/images/logo.png"
            alt="StyleSniff Logo"
            width={180} 
            height={40} 
            priority 
            className="h-auto" 
          />
        </Link>
        <div className="flex items-center space-x-3">
          <Link href="/" passHref>
            <Button className="rounded-full px-6 bg-foreground text-background hover:bg-foreground/80">
              Upload Outfit
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

    