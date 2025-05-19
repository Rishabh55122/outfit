
import Link from 'next/link';
import { Sparkles } from 'lucide-react'; // Changed from Shirt to Sparkles

export default function Header() {
  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
          <Sparkles className="h-8 w-8" /> {/* Changed icon */}
          <span>StyleSniff</span> {/* Changed name */}
        </Link>
        <nav>
          {/* Future navigation items can go here */}
        </nav>
      </div>
    </header>
  );
}
