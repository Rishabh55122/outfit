
export default function Footer() {
  return (
    <footer className="bg-card border-t border-border py-8 text-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-muted-foreground">&copy; {new Date().getFullYear()} StyleSniff. All rights reserved.</p>
        <p className="text-sm text-muted-foreground/80 mt-1">Your Personal AI Fashion Stylist.</p>
      </div>
    </footer>
  );
}
