
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="text-3xl font-bold text-foreground hover:opacity-80 transition-opacity">
          StyleSniff
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-muted-foreground">
          <Link href="#" className="hover:text-primary transition-colors">Explore</Link>
          <Link href="#" className="hover:text-primary transition-colors">How It Works</Link>
          <Link href="#" className="hover:text-primary transition-colors">Pricing</Link>
        </nav>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="rounded-full px-6 hidden sm:inline-flex border-foreground/20 hover:bg-foreground/5">
            Upload Outfit
          </Button>
          <Button className="rounded-full px-6 bg-foreground text-background hover:bg-foreground/80">
            Upload Outfit
          </Button>
        </div>
      </div>
    </header>
  );
}
