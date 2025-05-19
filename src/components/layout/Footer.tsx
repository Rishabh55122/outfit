
'use client';

import { useState, useEffect } from 'react';

export default function Footer() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-card border-t border-border py-8 text-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-muted-foreground">
          &copy; {currentYear !== null ? currentYear : new Date().getFullYear()} StyleSniff. All rights reserved.
        </p>
        <p className="text-sm text-muted-foreground/80 mt-1">Your Personal AI Fashion Stylist.</p>
      </div>
    </footer>
  );
}
