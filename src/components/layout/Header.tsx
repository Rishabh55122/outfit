
import Link from 'next/link';
import { Shirt } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
          <Shirt className="h-8 w-8" />
          <span>OutfitAI</span>
        </Link>
        <nav>
          {/* <Button variant="ghost">Sign In</Button> */}
        </nav>
      </div>
    </header>
  );
}
