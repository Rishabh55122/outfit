
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-3xl font-bold text-foreground hover:opacity-80 transition-opacity">
          {/* Replace text logo with Image component */}
          <Image
            src="/images/logo.png" // Assuming you save the logo as logo.png in public/images/
            alt="StyleSniff Logo"
            width={180} // Adjust width as needed
            height={40} // Adjust height as needed
            priority // Load the logo quickly
            className="h-auto" // Maintain aspect ratio, adjust height based on width
          />
        </Link>
        <div className="flex items-center space-x-3">
          <Link href="/create-outfit" passHref>
            <Button className="rounded-full px-6 bg-foreground text-background hover:bg-foreground/80">
              Upload Outfit
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
